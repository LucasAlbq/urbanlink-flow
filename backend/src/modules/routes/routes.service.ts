import type { Prisma } from '../../generated/prisma/client.js';
import { prisma } from '../../lib/prisma.js';
import {
  calculateRouteDistance,
  estimateDurationMinutes,
  estimateFuelLiters,
  haversineDistance,
  type Coordinate,
} from '../../services/geo.service.js';
import {
  optimizeRoute as calculateOptimizedRoute,
  type OptimizationStop,
} from '../../services/optimization.service.js';
import {
  assertDeliveriesAvailableForNewRoute,
  assertDeliveriesReadyForRouteStart,
  assertRouteTransition,
  assertVehicleCapacity,
  resolveVehicleStatusAfterRouteEnd,
} from '../../services/route-rules.service.js';
import { conflict, notFound } from '../../shared/errors.js';
import { paginationMeta, round } from '../../shared/http.js';
import type {
  CreateRouteInput,
  ListRoutesQuery,
  ReorderStopsInput,
  RouteCalculationInput,
  RouteCalculationOverrides,
} from './routes.schemas.js';

export const routeInclude = {
  vehicle: true,
  stops: {
    orderBy: { sequence: 'asc' as const },
    include: {
      delivery: {
        include: {
          originCenter: { select: { id: true, name: true, latitude: true, longitude: true } },
        },
      },
    },
  },
} as const;

export function buildRouteListArgs(query: ListRoutesQuery): Prisma.RouteFindManyArgs {
  const where: Prisma.RouteWhereInput = {
    ...(query.status === undefined ? {} : { status: query.status }),
    ...(query.vehicleId === undefined ? {} : { vehicleId: query.vehicleId }),
    ...(query.search === undefined
      ? {}
      : { name: { contains: query.search, mode: 'insensitive' } }),
  };
  return {
    where,
    include: routeInclude,
    orderBy: { [query.sortBy]: query.sortOrder },
    skip: (query.page - 1) * query.pageSize,
    take: query.pageSize,
  };
}

interface Metrics {
  totalDistanceKm: number;
  estimatedDurationMinutes: number;
  estimatedCost: number;
  estimatedCo2Kg: number;
}

export function mergeRouteCalculation(
  persisted: RouteCalculationInput,
  overrides: RouteCalculationOverrides,
): RouteCalculationInput {
  return {
    trafficLevel: overrides.trafficLevel ?? persisted.trafficLevel,
    fuelPrice: overrides.fuelPrice ?? persisted.fuelPrice,
    co2Factor: overrides.co2Factor ?? persisted.co2Factor,
    serviceMinutesPerStop: overrides.serviceMinutesPerStop ?? persisted.serviceMinutesPerStop,
  };
}

function routeMetrics(
  origin: Coordinate,
  stops: readonly Coordinate[],
  vehicle: { averageSpeedKmh: number; fuelConsumption: number },
  calculation: RouteCalculationInput,
): Metrics {
  const totalDistanceKm = calculateRouteDistance(origin, stops);
  const fuelLiters = estimateFuelLiters(totalDistanceKm, vehicle.fuelConsumption);
  return {
    totalDistanceKm,
    estimatedDurationMinutes: estimateDurationMinutes({
      distanceKm: totalDistanceKm,
      averageSpeedKmh: vehicle.averageSpeedKmh,
      trafficLevel: calculation.trafficLevel,
      numberOfStops: stops.length,
      serviceMinutesPerStop: calculation.serviceMinutesPerStop,
    }),
    estimatedCost: round(fuelLiters * calculation.fuelPrice),
    estimatedCo2Kg: round(fuelLiters * calculation.co2Factor),
  };
}

function plannedArrivals(
  origin: Coordinate,
  stops: readonly Coordinate[],
  speedKmh: number,
  calculation: RouteCalculationInput,
): Date[] {
  const startedAt = new Date();
  let elapsedMinutes = 0;
  let current = origin;
  return stops.map((stop) => {
    elapsedMinutes += estimateDurationMinutes({
      distanceKm: haversineDistance(current, stop),
      averageSpeedKmh: speedKmh,
      trafficLevel: calculation.trafficLevel,
      numberOfStops: 1,
      serviceMinutesPerStop: calculation.serviceMinutesPerStop,
    });
    current = stop;
    return new Date(startedAt.getTime() + elapsedMinutes * 60_000);
  });
}

export async function listRoutes(query: ListRoutesQuery) {
  const args = buildRouteListArgs(query);
  const [items, total] = await prisma.$transaction([
    prisma.route.findMany(args),
    prisma.route.count({ where: args.where }),
  ]);
  return { items, meta: paginationMeta(query.page, query.pageSize, total) };
}

export async function getRoute(id: string) {
  const route = await prisma.route.findUnique({
    where: { id },
    include: routeInclude,
  });
  if (route === null) throw notFound('Rota');
  return route;
}

export async function createRoute(input: CreateRouteInput) {
  const routeId = await prisma.$transaction(
    async (transaction) => {
      const [vehicle, deliveries, existingOperationalLoad] = await Promise.all([
        transaction.vehicle.findUnique({ where: { id: input.vehicleId } }),
        transaction.delivery.findMany({
          where: { id: { in: input.deliveryIds } },
          include: {
            originCenter: true,
            routeStops: {
              where: { route: { status: { in: ['PLANNED', 'ACTIVE'] } } },
              select: { routeId: true },
            },
          },
        }),
        transaction.delivery.aggregate({
          where: {
            assignedVehicleId: input.vehicleId,
            status: { in: ['ASSIGNED', 'IN_TRANSIT'] },
            id: { notIn: input.deliveryIds },
          },
          _sum: { weightKg: true },
        }),
      ]);
      if (vehicle === null) throw notFound('Veículo');
      if (deliveries.length !== input.deliveryIds.length) {
        throw notFound('Uma ou mais entregas');
      }
      if (vehicle.status !== 'AVAILABLE') {
        throw conflict('O veículo precisa estar disponível para criar uma rota.');
      }
      assertDeliveriesAvailableForNewRoute(
        deliveries.map((delivery) => ({
          id: delivery.id,
          status: delivery.status,
          assignedVehicleId: delivery.assignedVehicleId,
          activeRouteIds: delivery.routeStops.map((stop) => stop.routeId),
        })),
        vehicle.id,
      );
      const originCenter = deliveries[0]?.originCenter;
      if (
        originCenter === undefined ||
        deliveries.some((delivery) => delivery.originCenterId !== originCenter.id)
      ) {
        throw conflict('Uma rota deve partir de um único centro de distribuição.');
      }
      assertVehicleCapacity(vehicle.capacityKg, [
        existingOperationalLoad._sum.weightKg ?? 0,
        ...deliveries.map((delivery) => delivery.weightKg),
      ]);

      const deliveryById = new Map(deliveries.map((delivery) => [delivery.id, delivery]));
      const sourceStops = input.deliveryIds.map((id) => {
        const delivery = deliveryById.get(id)!;
        return {
          id: delivery.id,
          latitude: delivery.destinationLatitude,
          longitude: delivery.destinationLongitude,
          priority: delivery.priority,
          serviceDeadline: delivery.serviceDeadline,
        } satisfies OptimizationStop;
      });
      const origin = {
        latitude: originCenter.latitude,
        longitude: originCenter.longitude,
      };
      const orderedStops = input.optimize
        ? calculateOptimizedRoute(origin, sourceStops).optimized
        : sourceStops;
      const calculation = {
        trafficLevel: input.trafficLevel,
        fuelPrice: input.fuelPrice,
        co2Factor: input.co2Factor,
        serviceMinutesPerStop: input.serviceMinutesPerStop,
      };
      const metrics = routeMetrics(origin, orderedStops, vehicle, calculation);
      const arrivals = plannedArrivals(origin, orderedStops, vehicle.averageSpeedKmh, calculation);

      const created = await transaction.route.create({
        data: {
          vehicleId: vehicle.id,
          name: input.name,
          ...calculation,
          ...metrics,
          stops: {
            create: orderedStops.map((stop, index) => ({
              deliveryId: stop.id,
              sequence: index + 1,
              latitude: stop.latitude,
              longitude: stop.longitude,
              plannedArrival: arrivals[index],
            })),
          },
        },
      });
      await transaction.delivery.updateMany({
        where: { id: { in: input.deliveryIds } },
        data: { assignedVehicleId: vehicle.id, status: 'ASSIGNED' },
      });
      return created.id;
    },
    { isolationLevel: 'Serializable' },
  );
  return getRoute(routeId);
}

export async function renameRoute(id: string, name: string) {
  const route = await getRoute(id);
  if (route.status !== 'PLANNED') {
    throw conflict('Somente rotas planejadas podem ser renomeadas.');
  }
  return prisma.route.update({
    where: { id },
    data: { name },
    include: routeInclude,
  });
}

async function persistStopOrder(
  routeId: string,
  orderedStopIds: readonly string[],
  metrics: Metrics,
  arrivals: readonly Date[],
  calculation: RouteCalculationInput,
) {
  await prisma.$transaction(async (transaction) => {
    for (const [index, stopId] of orderedStopIds.entries()) {
      await transaction.routeStop.update({
        where: { id: stopId },
        data: { sequence: -(index + 1) },
      });
    }
    for (const [index, stopId] of orderedStopIds.entries()) {
      await transaction.routeStop.update({
        where: { id: stopId },
        data: { sequence: index + 1, plannedArrival: arrivals[index] },
      });
    }
    await transaction.route.update({
      where: { id: routeId },
      data: { ...metrics, ...calculation },
    });
  });
  return getRoute(routeId);
}

export async function optimizeExistingRoute(id: string, overrides: RouteCalculationOverrides) {
  const route = await getRoute(id);
  if (route.status !== 'PLANNED') {
    throw conflict('Somente rotas planejadas podem ser otimizadas.');
  }
  const center = route.stops[0]?.delivery.originCenter;
  if (center === undefined) throw conflict('A rota não possui paradas.');
  const origin = { latitude: center.latitude, longitude: center.longitude };
  const calculation = mergeRouteCalculation(
    {
      trafficLevel: route.trafficLevel,
      fuelPrice: route.fuelPrice,
      co2Factor: route.co2Factor,
      serviceMinutesPerStop: route.serviceMinutesPerStop,
    },
    overrides,
  );
  const stops = route.stops.map((stop) => ({
    id: stop.id,
    latitude: stop.latitude,
    longitude: stop.longitude,
    priority: stop.delivery.priority,
    serviceDeadline: stop.delivery.serviceDeadline,
  }));
  const ordered = calculateOptimizedRoute(origin, stops).optimized;
  const metrics = routeMetrics(origin, ordered, route.vehicle, calculation);
  const arrivals = plannedArrivals(origin, ordered, route.vehicle.averageSpeedKmh, calculation);
  return persistStopOrder(
    id,
    ordered.map((stop) => stop.id),
    metrics,
    arrivals,
    calculation,
  );
}

export async function reorderStops(id: string, input: ReorderStopsInput) {
  const route = await getRoute(id);
  if (route.status !== 'PLANNED') {
    throw conflict('Somente rotas planejadas podem ser reordenadas.');
  }
  const currentIds = new Set(route.stops.map((stop) => stop.id));
  if (
    input.orderedStopIds.length !== route.stops.length ||
    input.orderedStopIds.some((stopId) => !currentIds.has(stopId))
  ) {
    throw conflict('A ordenação deve conter exatamente todas as paradas da rota.');
  }
  const center = route.stops[0]?.delivery.originCenter;
  if (center === undefined) throw conflict('A rota não possui paradas.');
  const byId = new Map(route.stops.map((stop) => [stop.id, stop]));
  const ordered = input.orderedStopIds.map((stopId) => byId.get(stopId)!);
  const calculation = mergeRouteCalculation(
    {
      trafficLevel: route.trafficLevel,
      fuelPrice: route.fuelPrice,
      co2Factor: route.co2Factor,
      serviceMinutesPerStop: route.serviceMinutesPerStop,
    },
    input,
  );
  const origin = { latitude: center.latitude, longitude: center.longitude };
  const metrics = routeMetrics(origin, ordered, route.vehicle, calculation);
  const arrivals = plannedArrivals(origin, ordered, route.vehicle.averageSpeedKmh, calculation);
  return persistStopOrder(id, input.orderedStopIds, metrics, arrivals, calculation);
}

export async function startRoute(id: string) {
  await prisma.$transaction(
    async (transaction) => {
      const route = await transaction.route.findUnique({
        where: { id },
        include: routeInclude,
      });
      if (route === null) throw notFound('Rota');
      assertRouteTransition(route.status, 'ACTIVE');
      if (route.vehicle.status !== 'AVAILABLE') {
        throw conflict('O veículo da rota não está disponível.');
      }
      if (route.stops.length === 0) {
        throw conflict('Uma rota sem paradas não pode ser iniciada.');
      }
      assertDeliveriesReadyForRouteStart(
        route.stops.map((stop) => ({
          id: stop.delivery.id,
          status: stop.delivery.status,
          assignedVehicleId: stop.delivery.assignedVehicleId,
        })),
        route.vehicleId,
      );

      const [activeRoute, operationalLoad] = await Promise.all([
        transaction.route.findFirst({
          where: {
            vehicleId: route.vehicleId,
            status: 'ACTIVE',
            id: { not: id },
          },
        }),
        transaction.delivery.aggregate({
          where: {
            assignedVehicleId: route.vehicleId,
            status: { in: ['ASSIGNED', 'IN_TRANSIT'] },
          },
          _sum: { weightKg: true },
        }),
      ]);
      if (activeRoute !== null) {
        throw conflict('O veículo já possui outra rota ativa.');
      }
      assertVehicleCapacity(route.vehicle.capacityKg, [operationalLoad._sum.weightKg ?? 0]);

      const deliveryIds = route.stops.map((stop) => stop.deliveryId);
      const deliveriesUpdated = await transaction.delivery.updateMany({
        where: {
          id: { in: deliveryIds },
          status: 'ASSIGNED',
          assignedVehicleId: route.vehicleId,
        },
        data: { status: 'IN_TRANSIT' },
      });
      if (deliveriesUpdated.count !== deliveryIds.length) {
        throw conflict(
          'As entregas foram alteradas durante o início da rota. Atualize os dados e tente novamente.',
        );
      }
      await transaction.route.update({
        where: { id },
        data: { status: 'ACTIVE', startedAt: new Date() },
      });
      await transaction.vehicle.update({
        where: { id: route.vehicleId },
        data: { status: 'IN_ROUTE' },
      });
    },
    { isolationLevel: 'Serializable' },
  );
  return getRoute(id);
}

const STOP_TRANSITIONS = {
  PENDING: ['ARRIVED', 'COMPLETED', 'SKIPPED', 'FAILED'],
  ARRIVED: ['COMPLETED', 'FAILED', 'SKIPPED'],
  COMPLETED: [],
  SKIPPED: [],
  FAILED: [],
} as const;

export async function updateStopStatus(
  routeId: string,
  stopId: string,
  status: 'PENDING' | 'ARRIVED' | 'COMPLETED' | 'SKIPPED' | 'FAILED',
) {
  const stop = await prisma.routeStop.findFirst({
    where: { id: stopId, routeId },
    include: { route: true },
  });
  if (stop === null) throw notFound('Parada');
  if (stop.route.status !== 'ACTIVE') {
    throw conflict('Somente paradas de uma rota ativa podem ser atualizadas.');
  }
  if (stop.status === status) {
    return getRoute(routeId);
  }
  if (
    stop.status !== status &&
    !(STOP_TRANSITIONS[stop.status] as readonly string[]).includes(status)
  ) {
    throw conflict(`Transição de parada inválida: ${stop.status} → ${status}.`);
  }

  await prisma.$transaction(async (transaction) => {
    const arrived = status === 'ARRIVED' || status === 'COMPLETED';
    await transaction.routeStop.update({
      where: { id: stopId },
      data: { status, ...(arrived ? { actualArrival: new Date() } : {}) },
    });
    if (status === 'COMPLETED') {
      await transaction.delivery.update({
        where: { id: stop.deliveryId },
        data: { status: 'DELIVERED', deliveredAt: new Date() },
      });
    } else if (status === 'FAILED' || status === 'SKIPPED') {
      await transaction.delivery.update({
        where: { id: stop.deliveryId },
        data: { status: 'FAILED' },
      });
    }
  });
  return getRoute(routeId);
}

export async function completeRoute(id: string) {
  await prisma.$transaction(
    async (transaction) => {
      const route = await transaction.route.findUnique({
        where: { id },
        include: routeInclude,
      });
      if (route === null) throw notFound('Rota');
      if (route.status === 'COMPLETED') {
        return;
      }
      assertRouteTransition(route.status, 'COMPLETED');
      if (route.stops.some((stop) => !['COMPLETED', 'SKIPPED', 'FAILED'].includes(stop.status))) {
        throw conflict('Conclua ou justifique todas as paradas antes de concluir a rota.');
      }
      const completedAt = new Date();
      const actualDurationMinutes =
        route.startedAt === null
          ? null
          : Math.max(1, Math.round((completedAt.getTime() - route.startedAt.getTime()) / 60_000));
      const anotherActiveRoute = await transaction.route.findFirst({
        where: {
          vehicleId: route.vehicleId,
          status: 'ACTIVE',
          id: { not: id },
        },
        select: { id: true },
      });
      await transaction.route.update({
        where: { id },
        data: { status: 'COMPLETED', completedAt, actualDurationMinutes },
      });
      await transaction.vehicle.update({
        where: { id: route.vehicleId },
        data: {
          status: resolveVehicleStatusAfterRouteEnd(
            route.vehicle.status,
            anotherActiveRoute !== null,
          ),
        },
      });
    },
    { isolationLevel: 'Serializable' },
  );
  return getRoute(id);
}

export async function cancelRoute(id: string) {
  await prisma.$transaction(
    async (transaction) => {
      const route = await transaction.route.findUnique({
        where: { id },
        include: routeInclude,
      });
      if (route === null) throw notFound('Rota');
      if (route.status === 'CANCELED') {
        return;
      }
      assertRouteTransition(route.status, 'CANCELED');
      const deliveryIds = route.stops
        .filter((stop) => !['COMPLETED', 'FAILED', 'SKIPPED'].includes(stop.status))
        .map((stop) => stop.deliveryId);
      const anotherActiveRoute = await transaction.route.findFirst({
        where: {
          vehicleId: route.vehicleId,
          status: 'ACTIVE',
          id: { not: id },
        },
        select: { id: true },
      });
      await transaction.route.update({
        where: { id },
        data: { status: 'CANCELED' },
      });
      await transaction.vehicle.update({
        where: { id: route.vehicleId },
        data: {
          status: resolveVehicleStatusAfterRouteEnd(
            route.vehicle.status,
            anotherActiveRoute !== null,
          ),
        },
      });
      const withoutAnotherCurrentRoute: Prisma.DeliveryWhereInput = {
        routeStops: {
          none: {
            route: {
              id: { not: id },
              status: { in: ['PLANNED', 'ACTIVE'] },
            },
          },
        },
      };
      await transaction.delivery.updateMany({
        where: {
          id: { in: deliveryIds },
          status: 'ASSIGNED',
          assignedVehicleId: route.vehicleId,
          ...withoutAnotherCurrentRoute,
        },
        data: { status: 'PENDING', assignedVehicleId: null },
      });
      await transaction.delivery.updateMany({
        where: {
          id: { in: deliveryIds },
          status: 'IN_TRANSIT',
          assignedVehicleId: route.vehicleId,
          ...withoutAnotherCurrentRoute,
        },
        data: { status: 'FAILED' },
      });
    },
    { isolationLevel: 'Serializable' },
  );
  return getRoute(id);
}
