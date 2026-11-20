import type { DeliveryStatus, Prisma } from '../../generated/prisma/client.js';
import { prisma } from '../../lib/prisma.js';
import { conflict, notFound } from '../../shared/errors.js';
import { round } from '../../shared/http.js';
import { buildCityBuildings, buildSimulationCityProjection } from './simulation-city.service.js';

export async function dashboardSummary() {
  const now = new Date();
  const [
    deliveryGroups,
    vehicleGroups,
    lateDeliveries,
    routeTotals,
    delivered,
    simulationTotals,
    recentAlerts,
  ] = await Promise.all([
    prisma.delivery.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.vehicle.groupBy({ by: ['status'], _count: { _all: true } }),
    prisma.delivery.count({
      where: {
        serviceDeadline: { lt: now },
        status: { notIn: ['DELIVERED', 'CANCELED'] },
      },
    }),
    prisma.route.aggregate({
      where: { status: { in: ['ACTIVE', 'COMPLETED'] } },
      _sum: {
        totalDistanceKm: true,
        estimatedCost: true,
        estimatedCo2Kg: true,
      },
    }),
    prisma.delivery.findMany({
      where: { status: 'DELIVERED', deliveredAt: { not: null } },
      select: { createdAt: true, deliveredAt: true, serviceDeadline: true },
    }),
    prisma.simulationResult.aggregate({
      _sum: {
        originalCost: true,
        optimizedCost: true,
      },
    }),
    prisma.alert.findMany({
      where: { status: { not: 'RESOLVED' } },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        vehicle: { select: { id: true, plate: true } },
        route: { select: { id: true, name: true } },
        delivery: { select: { id: true, trackingCode: true } },
      },
    }),
  ]);
  const deliveryCount = Object.fromEntries(
    deliveryGroups.map((group) => [group.status, group._count._all]),
  ) as Partial<Record<DeliveryStatus, number>>;
  const totalVehicles = vehicleGroups.reduce((total, group) => total + group._count._all, 0);
  const utilizedVehicles = vehicleGroups.find((group) => group.status === 'IN_ROUTE')?._count._all;
  const onTime = delivered.filter(
    (delivery) => delivery.deliveredAt !== null && delivery.deliveredAt <= delivery.serviceDeadline,
  ).length;
  const completed = deliveryCount.DELIVERED ?? 0;
  const failed = deliveryCount.FAILED ?? 0;
  const averageDeliveryMinutes =
    delivered.length === 0
      ? 0
      : delivered.reduce((sum, delivery) => {
          const end = delivery.deliveredAt?.getTime() ?? delivery.createdAt.getTime();
          return sum + Math.max(0, end - delivery.createdAt.getTime()) / 60_000;
        }, 0) / delivered.length;

  return {
    metrics: {
      pendingDeliveries: deliveryCount.PENDING ?? 0,
      inTransitDeliveries: deliveryCount.IN_TRANSIT ?? 0,
      completedDeliveries: completed,
      lateDeliveries,
      totalDistanceKm: round(routeTotals._sum.totalDistanceKm ?? 0),
      averageDeliveryMinutes: round(averageDeliveryMinutes),
      onTimeDeliveryRate: delivered.length === 0 ? 0 : round((onTime / delivered.length) * 100),
      serviceLevel: completed + failed === 0 ? 0 : round((completed / (completed + failed)) * 100),
      fleetUtilization:
        totalVehicles === 0 ? 0 : round(((utilizedVehicles ?? 0) / totalVehicles) * 100),
      availableVehicles:
        vehicleGroups.find((group) => group.status === 'AVAILABLE')?._count._all ?? 0,
      estimatedCost: round(routeTotals._sum.estimatedCost ?? 0),
      estimatedCo2Kg: round(routeTotals._sum.estimatedCo2Kg ?? 0),
      optimizationSavings: round(
        (simulationTotals._sum.originalCost ?? 0) - (simulationTotals._sum.optimizedCost ?? 0),
      ),
    },
    deliveriesByStatus: deliveryGroups.map((group) => ({
      status: group.status,
      count: group._count._all,
    })),
    fleetByStatus: vehicleGroups.map((group) => ({
      status: group.status,
      count: group._count._all,
    })),
    recentAlerts,
  };
}

const dateKey = (date: Date): string => date.toISOString().slice(0, 10);

export async function dashboardTimeSeries(days: number) {
  const to = new Date();
  const from = new Date(to);
  from.setUTCDate(from.getUTCDate() - days + 1);
  from.setUTCHours(0, 0, 0, 0);
  const [deliveries, routes, results] = await Promise.all([
    prisma.delivery.findMany({
      where: {
        status: 'DELIVERED',
        deliveredAt: { gte: from, lte: to },
      },
      select: { deliveredAt: true, serviceDeadline: true },
    }),
    prisma.route.findMany({
      where: { createdAt: { gte: from, lte: to } },
      select: { createdAt: true, totalDistanceKm: true },
    }),
    prisma.simulationResult.findMany({
      where: { createdAt: { gte: from, lte: to } },
      select: {
        createdAt: true,
        originalDistanceKm: true,
        optimizedDistanceKm: true,
        originalCost: true,
        optimizedCost: true,
      },
    }),
  ]);

  const keys = Array.from({ length: days }, (_, index) => {
    const date = new Date(from);
    date.setUTCDate(from.getUTCDate() + index);
    return dateKey(date);
  });
  return {
    period: { from, to },
    deliveries: keys.map((date) => {
      const day = deliveries.filter(
        (item) => item.deliveredAt !== null && dateKey(item.deliveredAt) === date,
      );
      return {
        date,
        completed: day.length,
        late: day.filter(
          (item) => item.deliveredAt !== null && item.deliveredAt > item.serviceDeadline,
        ).length,
      };
    }),
    distance: keys.map((date) => ({
      date,
      totalKm: round(
        routes
          .filter((route) => dateKey(route.createdAt) === date)
          .reduce((sum, route) => sum + route.totalDistanceKm, 0),
      ),
    })),
    optimization: keys.map((date) => {
      const day = results.filter((result) => dateKey(result.createdAt) === date);
      return {
        date,
        savedKm: round(
          day.reduce(
            (sum, result) => sum + result.originalDistanceKm - result.optimizedDistanceKm,
            0,
          ),
        ),
        savedCost: round(
          day.reduce((sum, result) => sum + result.originalCost - result.optimizedCost, 0),
        ),
      };
    }),
  };
}

interface MapFilters {
  routeId?: string;
  vehicleId?: string;
  deliveryId?: string;
  deliveryStatus?: DeliveryStatus;
}

const ROUTE_COLORS: Readonly<Record<string, string>> = {
  PLANNED: '#60a5fa',
  ACTIVE: '#22c55e',
  COMPLETED: '#94a3b8',
  CANCELED: '#ef4444',
};

export async function operationalMap(filters: MapFilters) {
  const routeWhere: Prisma.RouteWhereInput = {
    ...(filters.routeId === undefined ? {} : { id: filters.routeId }),
    ...(filters.vehicleId === undefined ? {} : { vehicleId: filters.vehicleId }),
    ...(filters.deliveryId === undefined
      ? {}
      : { stops: { some: { deliveryId: filters.deliveryId } } }),
  };
  const deliveryWhere: Prisma.DeliveryWhereInput = {
    ...(filters.deliveryId === undefined ? {} : { id: filters.deliveryId }),
    ...(filters.deliveryStatus === undefined ? {} : { status: filters.deliveryStatus }),
    ...(filters.vehicleId === undefined ? {} : { assignedVehicleId: filters.vehicleId }),
    ...(filters.routeId === undefined
      ? {}
      : { routeStops: { some: { routeId: filters.routeId } } }),
  };
  const [centers, vehicles, deliveries, routes] = await Promise.all([
    prisma.distributionCenter.findMany({ orderBy: { name: 'asc' } }),
    prisma.vehicle.findMany({
      where: filters.vehicleId === undefined ? {} : { id: filters.vehicleId },
      include: {
        routes: {
          where: { status: 'ACTIVE' },
          select: { id: true },
          take: 1,
        },
      },
      orderBy: { plate: 'asc' },
    }),
    prisma.delivery.findMany({
      where: deliveryWhere,
      include: {
        routeStops: {
          include: { route: { select: { id: true, status: true } } },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { serviceDeadline: 'asc' },
      take: 250,
    }),
    prisma.route.findMany({
      where: routeWhere,
      include: {
        stops: {
          orderBy: { sequence: 'asc' },
          include: {
            delivery: {
              include: {
                originCenter: {
                  select: { id: true, latitude: true, longitude: true },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    }),
  ]);

  return {
    centers: centers.map((center) => ({
      id: center.id,
      name: center.name,
      address: center.address,
      latitude: center.latitude,
      longitude: center.longitude,
      operatingHours: center.operatingHours,
    })),
    vehicles: vehicles.map((vehicle) => ({
      id: vehicle.id,
      plate: vehicle.plate,
      model: vehicle.model,
      type: vehicle.type,
      capacityKg: vehicle.capacityKg,
      averageSpeedKmh: vehicle.averageSpeedKmh,
      fuelConsumption: vehicle.fuelConsumption,
      status: vehicle.status,
      latitude: vehicle.currentLatitude,
      longitude: vehicle.currentLongitude,
      activeRouteId: vehicle.routes[0]?.id,
    })),
    deliveries: deliveries.map((delivery) => ({
      id: delivery.id,
      trackingCode: delivery.trackingCode,
      status: delivery.status,
      priority: delivery.priority,
      weightKg: delivery.weightKg,
      serviceDeadline: delivery.serviceDeadline,
      assignedVehicleId: delivery.assignedVehicleId,
      latitude: delivery.destinationLatitude,
      longitude: delivery.destinationLongitude,
      address: delivery.destinationAddress,
      routeId: delivery.routeStops[0]?.route.id,
      sequence: delivery.routeStops[0]?.sequence,
      isLate:
        !['DELIVERED', 'CANCELED'].includes(delivery.status) &&
        delivery.serviceDeadline < new Date(),
    })),
    routes: routes.map((route) => {
      const center = route.stops[0]?.delivery.originCenter;
      return {
        id: route.id,
        name: route.name,
        status: route.status,
        vehicleId: route.vehicleId,
        color: ROUTE_COLORS[route.status] ?? '#64748b',
        totalDistanceKm: route.totalDistanceKm,
        path: [
          ...(center === undefined
            ? []
            : [
                {
                  latitude: center.latitude,
                  longitude: center.longitude,
                  kind: 'CENTER' as const,
                },
              ]),
          ...route.stops.map((stop) => ({
            latitude: stop.latitude,
            longitude: stop.longitude,
            sequence: stop.sequence,
            kind: 'STOP' as const,
          })),
        ],
      };
    }),
  };
}

const normalize = (latitude: number, longitude: number) => ({
  x: round((longitude + 46.6333) * 900, 3),
  z: round((latitude + 23.5505) * -900, 3),
});

export async function cityScene(filters: { routeId?: string; simulationId?: string }) {
  if (filters.simulationId !== undefined) {
    const simulation = await prisma.simulation.findUnique({
      where: { id: filters.simulationId },
      include: { result: true },
    });
    if (simulation === null) throw notFound('Simulação');
    if (simulation.result === null) {
      throw conflict('A simulação ainda não possui um resultado projetável.');
    }
    const projection = buildSimulationCityProjection({
      id: simulation.id,
      name: simulation.name,
      status: simulation.status,
      trafficLevel: simulation.trafficLevel,
      availableVehicles: simulation.availableVehicles,
      result: simulation.result,
    });
    if (projection === null) {
      throw conflict('O resultado da simulação usa um formato legado; execute-a novamente.');
    }
    return projection;
  }

  const map = await operationalMap(
    filters.routeId === undefined ? {} : { routeId: filters.routeId },
  );
  const deliveries = map.deliveries.map((delivery) => {
    const position = normalize(delivery.latitude, delivery.longitude);
    return {
      id: delivery.id,
      trackingCode: delivery.trackingCode,
      ...position,
      status: delivery.status,
      priority: delivery.priority,
      isLate: delivery.isLate,
    };
  });
  const grid = new Map<
    string,
    { id: string; x: number; z: number; totalCount: number; lateCount: number }
  >();
  for (const delivery of deliveries) {
    const x = Math.round(delivery.x / 20) * 20;
    const z = Math.round(delivery.z / 20) * 20;
    const key = `${x}:${z}`;
    const current = grid.get(key) ?? {
      id: `hotspot-${key}`,
      x,
      z,
      totalCount: 0,
      lateCount: 0,
    };
    current.totalCount += 1;
    if (delivery.isLate) current.lateCount += 1;
    grid.set(key, current);
  }
  const routeProgress = (vehicleId: string): number => {
    const seed = [...vehicleId].reduce((sum, char) => sum + char.charCodeAt(0), 0);
    return round((seed % 100) / 100, 3);
  };

  return {
    scenario: { type: 'OPERATIONAL' as const },
    buildings: buildCityBuildings(),
    centers: map.centers.map((center) => ({
      id: center.id,
      name: center.name,
      ...normalize(center.latitude, center.longitude),
      status: 'ACTIVE',
    })),
    deliveries,
    vehicles: map.vehicles
      .filter((vehicle) => vehicle.latitude !== null && vehicle.longitude !== null)
      .map((vehicle) => ({
        id: vehicle.id,
        plate: vehicle.plate,
        ...normalize(vehicle.latitude!, vehicle.longitude!),
        status: vehicle.status,
        progress: routeProgress(vehicle.id),
        routeId: vehicle.activeRouteId,
      })),
    routes: map.routes.map((route) => ({
      id: route.id,
      status: route.status,
      selected: route.id === filters.routeId,
      points: route.path.map((point) => normalize(point.latitude, point.longitude)),
    })),
    hotspots: [...grid.values()].map((hotspot) => ({
      ...hotspot,
      intensity: round(Math.min(1, hotspot.totalCount / 8), 2),
    })),
  };
}

export async function liveRoutes(routeId?: string) {
  return prisma.route.findMany({
    where: {
      status: 'ACTIVE',
      ...(routeId === undefined ? {} : { id: routeId }),
    },
    include: {
      vehicle: true,
      stops: {
        orderBy: { sequence: 'asc' },
        include: {
          delivery: {
            include: {
              originCenter: { select: { latitude: true, longitude: true } },
            },
          },
        },
      },
    },
  });
}
