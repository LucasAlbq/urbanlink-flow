import { prisma } from '../../lib/prisma.js';
import { round } from '../../shared/http.js';

export interface ReportPeriodInput {
  from?: string;
  to?: string;
}

const resolvePeriod = (input: ReportPeriodInput) => {
  const to = input.to === undefined ? new Date() : new Date(input.to);
  const from =
    input.from === undefined
      ? new Date(to.getTime() - 30 * 24 * 60 * 60 * 1_000)
      : new Date(input.from);
  return { from, to };
};

interface CompletedDeliveryEvent {
  createdAt: Date;
  deliveredAt: Date | null;
  serviceDeadline: Date;
}

export function deliveryEventMetrics(deliveries: readonly CompletedDeliveryEvent[]) {
  const completed = deliveries.filter(
    (delivery): delivery is CompletedDeliveryEvent & { deliveredAt: Date } =>
      delivery.deliveredAt !== null,
  );
  const onTime = completed.filter(
    (delivery) => delivery.deliveredAt <= delivery.serviceDeadline,
  ).length;
  const averageDeliveryMinutes =
    completed.length === 0
      ? 0
      : completed.reduce(
          (sum, delivery) =>
            sum +
            Math.max(0, delivery.deliveredAt.getTime() - delivery.createdAt.getTime()) / 60_000,
          0,
        ) / completed.length;
  const onTimeDeliveryRate = completed.length === 0 ? 0 : round((onTime / completed.length) * 100);
  return {
    completed: completed.length,
    onTime,
    onTimeDeliveryRate,
    averageDeliveryMinutes: round(averageDeliveryMinutes),
  };
}

export function fleetUtilizationRate(
  routes: readonly { vehicleId: string; status: string }[],
  totalVehicles: number,
): number {
  if (totalVehicles === 0) return 0;
  const utilized = new Set(
    routes.filter((route) => route.status !== 'CANCELED').map((route) => route.vehicleId),
  ).size;
  return round((utilized / totalVehicles) * 100);
}

export async function operationsReport(input: ReportPeriodInput) {
  const period = resolvePeriod(input);
  const [deliveries, routes, vehicles] = await Promise.all([
    prisma.delivery.findMany({
      where: {
        OR: [
          {
            status: 'DELIVERED',
            deliveredAt: { gte: period.from, lte: period.to },
          },
          {
            status: { not: 'DELIVERED' },
            createdAt: { gte: period.from, lte: period.to },
          },
        ],
      },
      include: {
        assignedVehicle: { select: { id: true, plate: true } },
      },
      orderBy: { serviceDeadline: 'asc' },
    }),
    prisma.route.findMany({
      where: {
        OR: [
          {
            status: 'COMPLETED',
            completedAt: { gte: period.from, lte: period.to },
          },
          {
            status: { not: 'COMPLETED' },
            createdAt: { gte: period.from, lte: period.to },
          },
        ],
      },
      include: { vehicle: { select: { id: true, plate: true, model: true } } },
    }),
    prisma.vehicle.findMany({
      select: { id: true, plate: true, model: true, status: true },
      orderBy: { plate: 'asc' },
    }),
  ]);
  const countBy = <T extends string>(values: readonly T[]): { status: T; count: number }[] =>
    [...new Set(values)].map((status) => ({
      status,
      count: values.filter((value) => value === status).length,
    }));
  const late = deliveries.filter(
    (delivery) =>
      delivery.status !== 'CANCELED' &&
      (delivery.deliveredAt === null
        ? delivery.serviceDeadline < period.to
        : delivery.deliveredAt > delivery.serviceDeadline),
  );
  const deliveryMetrics = deliveryEventMetrics(
    deliveries.filter((delivery) => delivery.status === 'DELIVERED'),
  );
  const fleetUtilization = fleetUtilizationRate(routes, vehicles.length);

  return {
    period,
    summary: {
      deliveries: deliveries.length,
      delivered: deliveries.filter((delivery) => delivery.status === 'DELIVERED').length,
      late: late.length,
      routes: routes.length,
      onTimeDeliveryRate: deliveryMetrics.onTimeDeliveryRate,
      onTimeRate: deliveryMetrics.onTimeDeliveryRate,
      averageDeliveryMinutes: deliveryMetrics.averageDeliveryMinutes,
      fleetUtilization,
      totalDistanceKm: round(routes.reduce((sum, route) => sum + route.totalDistanceKm, 0)),
      estimatedCost: round(routes.reduce((sum, route) => sum + route.estimatedCost, 0)),
    },
    deliveriesByStatus: countBy(deliveries.map((delivery) => delivery.status)),
    routesByStatus: countBy(routes.map((route) => route.status)),
    vehicleUtilization: vehicles.map((vehicle) => {
      const vehicleRoutes = routes.filter((route) => route.vehicleId === vehicle.id);
      return {
        id: vehicle.id,
        plate: vehicle.plate,
        model: vehicle.model,
        status: vehicle.status,
        routes: vehicleRoutes.length,
        distanceKm: round(vehicleRoutes.reduce((sum, route) => sum + route.totalDistanceKm, 0)),
        activeMinutes: vehicleRoutes.reduce(
          (sum, route) => sum + (route.actualDurationMinutes ?? route.estimatedDurationMinutes),
          0,
        ),
      };
    }),
    lateDeliveries: late.map((delivery) => ({
      id: delivery.id,
      trackingCode: delivery.trackingCode,
      status: delivery.status,
      serviceDeadline: delivery.serviceDeadline,
      deliveredAt: delivery.deliveredAt,
      vehicle: delivery.assignedVehicle,
      delayMinutes: Math.max(
        0,
        Math.round(
          ((delivery.deliveredAt ?? period.to).getTime() - delivery.serviceDeadline.getTime()) /
            60_000,
        ),
      ),
    })),
  };
}

export async function performanceReport(input: ReportPeriodInput) {
  const period = resolvePeriod(input);
  const [deliveries, routes, results, totalVehicles] = await Promise.all([
    prisma.delivery.findMany({
      where: {
        OR: [
          {
            status: 'DELIVERED',
            deliveredAt: { gte: period.from, lte: period.to },
          },
          {
            status: { not: 'DELIVERED' },
            createdAt: { gte: period.from, lte: period.to },
          },
        ],
      },
      select: {
        status: true,
        createdAt: true,
        deliveredAt: true,
        serviceDeadline: true,
      },
    }),
    prisma.route.findMany({
      where: {
        OR: [
          {
            status: 'COMPLETED',
            completedAt: { gte: period.from, lte: period.to },
          },
          {
            status: { not: 'COMPLETED' },
            createdAt: { gte: period.from, lte: period.to },
          },
        ],
      },
    }),
    prisma.simulationResult.findMany({
      where: { createdAt: { gte: period.from, lte: period.to } },
      include: {
        simulation: { select: { id: true, name: true, trafficLevel: true } },
      },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.vehicle.count(),
  ]);
  const completed = deliveries.filter(
    (delivery) => delivery.status === 'DELIVERED' && delivery.deliveredAt !== null,
  );
  const deliveryMetrics = deliveryEventMetrics(completed);
  const failed = deliveries.filter((delivery) => delivery.status === 'FAILED').length;
  const fleetUtilization = fleetUtilizationRate(routes, totalVehicles);

  return {
    period,
    kpis: {
      onTimeDeliveryRate: deliveryMetrics.onTimeDeliveryRate,
      onTimeRate: deliveryMetrics.onTimeDeliveryRate,
      serviceLevel:
        completed.length + failed === 0
          ? 0
          : round((completed.length / (completed.length + failed)) * 100),
      averageDeliveryMinutes: deliveryMetrics.averageDeliveryMinutes,
      fleetUtilization,
      fleetUtilizationRate: fleetUtilization,
      totalDistanceKm: round(routes.reduce((sum, route) => sum + route.totalDistanceKm, 0)),
      estimatedCost: round(routes.reduce((sum, route) => sum + route.estimatedCost, 0)),
      estimatedCo2Kg: round(routes.reduce((sum, route) => sum + route.estimatedCo2Kg, 0)),
      optimizedDistanceSavedKm: round(
        results.reduce(
          (sum, result) => sum + result.originalDistanceKm - result.optimizedDistanceKm,
          0,
        ),
      ),
      optimizedCostSaved: round(
        results.reduce((sum, result) => sum + result.originalCost - result.optimizedCost, 0),
      ),
    },
    trend: results.map((result) => ({
      id: result.simulation.id,
      createdAt: result.createdAt,
      onTimeRate: result.onTimeDeliveryRate,
      onTimeDeliveryRate: result.onTimeDeliveryRate,
      serviceLevel: result.serviceLevel,
    })),
    simulations: results.map((result) => ({
      id: result.simulation.id,
      name: result.simulation.name,
      trafficLevel: result.simulation.trafficLevel,
      createdAt: result.createdAt,
      originalDistanceKm: result.originalDistanceKm,
      optimizedDistanceKm: result.optimizedDistanceKm,
      originalDurationMinutes: result.originalDurationMinutes,
      optimizedDurationMinutes: result.optimizedDurationMinutes,
      improvementPercentage: result.improvementPercentage,
      serviceLevel: result.serviceLevel,
      onTimeDeliveryRate: result.onTimeDeliveryRate,
      onTimeRate: result.onTimeDeliveryRate,
    })),
  };
}
