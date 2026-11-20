import {
  calculateRouteDistance,
  estimateDurationMinutes,
  estimateFuelLiters,
  haversineDistance,
  type Coordinate,
  type TrafficLevel,
} from '../../services/geo.service.js';
import { optimizeRoute, type OptimizationStop } from '../../services/optimization.service.js';
import { round } from '../../shared/http.js';

export type SimulationPriority = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';

export interface SimulationDelivery {
  id: string;
  trackingCode: string;
  destinationAddress: string;
  destinationLatitude: number;
  destinationLongitude: number;
  weightKg: number;
  priority: SimulationPriority;
  serviceDeadline: Date;
  originCenter: {
    id: string;
    name: string;
    address?: string;
    latitude: number;
    longitude: number;
  };
}

export interface SimulationEngineInput {
  availableVehicles: number;
  capacityKgPerVehicle: number;
  averageSpeedKmh: number;
  trafficLevel: TrafficLevel;
  fuelPrice: number;
  co2Factor: number;
  fuelConsumptionKmPerLiter: number;
  serviceMinutesPerStop: number;
  returnToOrigin: boolean;
  startedAt?: Date;
}

export interface SimulationPathPoint {
  kind: 'CENTER' | 'STOP';
  latitude: number;
  longitude: number;
  deliveryId?: string;
  trackingCode?: string;
}

export interface SimulationRouteMetrics {
  distanceKm: number;
  durationMinutes: number;
  cost: number;
  co2Kg: number;
  onTimeDeliveryRate: number;
}

export interface SimulationRouteStopSnapshot {
  deliveryId: string;
  trackingCode: string;
  address: string;
  latitude: number;
  longitude: number;
  weightKg: number;
  priority: SimulationPriority;
  serviceDeadline: string;
  originalSequence: number;
  optimizedSequence: number;
  estimatedArrival: string;
  onTime: boolean;
}

export interface SimulationRouteSnapshot {
  id: string;
  vehicleIndex: number;
  origin: {
    id: string;
    name: string;
    address?: string;
    latitude: number;
    longitude: number;
  };
  capacityKg: number;
  loadKg: number;
  remainingCapacityKg: number;
  deliveryCount: number;
  originalOrder: string[];
  optimizedOrder: string[];
  original: SimulationRouteMetrics & { path: SimulationPathPoint[] };
  optimized: SimulationRouteMetrics & { path: SimulationPathPoint[] };
  stops: SimulationRouteStopSnapshot[];
}

export interface SimulationRouteData {
  version: 2;
  mode: 'SIMULATION';
  startedAt: string;
  availableVehicles: number;
  usedVehicles: number;
  capacityKgPerVehicle: number;
  requestedDeliveries: number;
  selectedDeliveries: number;
  unassignedDeliveries: Array<{
    deliveryId: string;
    trackingCode: string;
    reason: 'EXCEEDS_VEHICLE_CAPACITY' | 'NO_VEHICLE_FOR_CENTER' | 'FLEET_CAPACITY_EXHAUSTED';
  }>;
  metrics: {
    originalDistanceKm: number;
    optimizedDistanceKm: number;
    originalDurationMinutes: number;
    optimizedDurationMinutes: number;
    originalCost: number;
    optimizedCost: number;
    originalCo2Kg: number;
    optimizedCo2Kg: number;
    onTimeDeliveryRate: number;
    serviceLevel: number;
    improvementPercentage: number;
    originalMakespanMinutes: number;
    optimizedMakespanMinutes: number;
  };
  routes: SimulationRouteSnapshot[];
}

export interface SimulationEngineResult {
  originalDistanceKm: number;
  optimizedDistanceKm: number;
  originalDurationMinutes: number;
  optimizedDurationMinutes: number;
  originalCost: number;
  optimizedCost: number;
  originalCo2Kg: number;
  optimizedCo2Kg: number;
  onTimeDeliveryRate: number;
  serviceLevel: number;
  improvementPercentage: number;
  routeData: SimulationRouteData;
}

interface CenterGroup {
  center: SimulationDelivery['originCenter'];
  deliveries: SimulationDelivery[];
}

interface RouteBucket {
  group: CenterGroup;
  deliveries: SimulationDelivery[];
  loadKg: number;
}

const PRIORITY_RANK: Readonly<Record<SimulationPriority, number>> = {
  URGENT: 4,
  HIGH: 3,
  NORMAL: 2,
  LOW: 1,
};

const compareDeliveries = (left: SimulationDelivery, right: SimulationDelivery): number =>
  PRIORITY_RANK[right.priority] - PRIORITY_RANK[left.priority] ||
  left.serviceDeadline.getTime() - right.serviceDeadline.getTime() ||
  right.weightKg - left.weightKg ||
  left.trackingCode.localeCompare(right.trackingCode);

function groupByCenter(
  deliveries: readonly SimulationDelivery[],
  capacityKg: number,
): CenterGroup[] {
  const groups = new Map<string, CenterGroup>();
  for (const delivery of deliveries) {
    if (delivery.weightKg > capacityKg) continue;
    const group = groups.get(delivery.originCenter.id) ?? {
      center: delivery.originCenter,
      deliveries: [],
    };
    group.deliveries.push(delivery);
    groups.set(delivery.originCenter.id, group);
  }
  return [...groups.values()]
    .map((group) => ({
      ...group,
      deliveries: group.deliveries.sort(compareDeliveries),
    }))
    .sort(
      (left, right) =>
        compareDeliveries(left.deliveries[0]!, right.deliveries[0]!) ||
        right.deliveries.length - left.deliveries.length ||
        left.center.id.localeCompare(right.center.id),
    );
}

function allocateRouteQuotas(
  groups: readonly CenterGroup[],
  availableVehicles: number,
): Map<string, number> {
  const selectedGroups = groups.slice(0, availableVehicles);
  const quotas = new Map<string, number>(selectedGroups.map((group) => [group.center.id, 1]));
  const targetRoutes = Math.min(
    availableVehicles,
    selectedGroups.reduce((sum, group) => sum + group.deliveries.length, 0),
  );

  while ([...quotas.values()].reduce((sum, quota) => sum + quota, 0) < targetRoutes) {
    const candidate = selectedGroups
      .filter((group) => (quotas.get(group.center.id) ?? 0) < group.deliveries.length)
      .sort((left, right) => {
        const leftQuota = quotas.get(left.center.id) ?? 1;
        const rightQuota = quotas.get(right.center.id) ?? 1;
        const leftWeight = left.deliveries.reduce((sum, delivery) => sum + delivery.weightKg, 0);
        const rightWeight = right.deliveries.reduce((sum, delivery) => sum + delivery.weightKg, 0);
        return (
          rightWeight / rightQuota - leftWeight / leftQuota ||
          right.deliveries.length / rightQuota - left.deliveries.length / leftQuota ||
          left.center.id.localeCompare(right.center.id)
        );
      })[0];
    if (candidate === undefined) break;
    quotas.set(candidate.center.id, (quotas.get(candidate.center.id) ?? 0) + 1);
  }
  return quotas;
}

function allocateDeliveries(
  deliveries: readonly SimulationDelivery[],
  input: SimulationEngineInput,
): {
  buckets: RouteBucket[];
  unassigned: SimulationRouteData['unassignedDeliveries'];
} {
  const groups = groupByCenter(deliveries, input.capacityKgPerVehicle);
  const quotas = allocateRouteQuotas(groups, input.availableVehicles);
  const buckets: RouteBucket[] = [];
  const selectedGroups = new Set(quotas.keys());

  for (const group of groups) {
    const quota = quotas.get(group.center.id) ?? 0;
    const groupBuckets = Array.from({ length: quota }, () => ({
      group,
      deliveries: [] as SimulationDelivery[],
      loadKg: 0,
    }));
    buckets.push(...groupBuckets);

    for (const delivery of group.deliveries) {
      const bucket = groupBuckets
        .filter((candidate) => candidate.loadKg + delivery.weightKg <= input.capacityKgPerVehicle)
        .sort(
          (left, right) =>
            left.deliveries.length - right.deliveries.length || left.loadKg - right.loadKg,
        )[0];
      if (bucket === undefined) continue;
      bucket.deliveries.push(delivery);
      bucket.loadKg += delivery.weightKg;
    }
  }

  const assignedIds = new Set(
    buckets.flatMap((bucket) => bucket.deliveries.map((delivery) => delivery.id)),
  );
  const unassigned = deliveries
    .filter((delivery) => !assignedIds.has(delivery.id))
    .map((delivery) => ({
      deliveryId: delivery.id,
      trackingCode: delivery.trackingCode,
      reason:
        delivery.weightKg > input.capacityKgPerVehicle
          ? ('EXCEEDS_VEHICLE_CAPACITY' as const)
          : !selectedGroups.has(delivery.originCenter.id)
            ? ('NO_VEHICLE_FOR_CENTER' as const)
            : ('FLEET_CAPACITY_EXHAUSTED' as const),
    }));

  return {
    buckets: buckets.filter((bucket) => bucket.deliveries.length > 0),
    unassigned,
  };
}

function routePath(
  origin: SimulationDelivery['originCenter'],
  stops: readonly SimulationDelivery[],
  returnToOrigin: boolean,
): SimulationPathPoint[] {
  const center: SimulationPathPoint = {
    kind: 'CENTER',
    latitude: origin.latitude,
    longitude: origin.longitude,
  };
  return [
    center,
    ...stops.map((stop) => ({
      kind: 'STOP' as const,
      deliveryId: stop.id,
      trackingCode: stop.trackingCode,
      latitude: stop.destinationLatitude,
      longitude: stop.destinationLongitude,
    })),
    ...(returnToOrigin ? [center] : []),
  ];
}

function deliveryTiming(
  origin: Coordinate,
  stops: readonly SimulationDelivery[],
  input: SimulationEngineInput,
  startedAt: Date,
): Array<{ deliveryId: string; estimatedArrival: Date; onTime: boolean }> {
  let current = origin;
  let elapsedMinutes = 0;
  return stops.map((stop) => {
    elapsedMinutes += estimateDurationMinutes({
      distanceKm: haversineDistance(current, {
        latitude: stop.destinationLatitude,
        longitude: stop.destinationLongitude,
      }),
      averageSpeedKmh: input.averageSpeedKmh,
      trafficLevel: input.trafficLevel,
      numberOfStops: 0,
    });
    const estimatedArrival = new Date(startedAt.getTime() + elapsedMinutes * 60_000);
    elapsedMinutes += input.serviceMinutesPerStop;
    current = {
      latitude: stop.destinationLatitude,
      longitude: stop.destinationLongitude,
    };
    return {
      deliveryId: stop.id,
      estimatedArrival,
      onTime: estimatedArrival <= stop.serviceDeadline,
    };
  });
}

function routeMetrics(
  origin: Coordinate,
  stops: readonly SimulationDelivery[],
  input: SimulationEngineInput,
  timing: readonly { onTime: boolean }[],
): SimulationRouteMetrics {
  const distanceKm = calculateRouteDistance(
    origin,
    stops.map((stop) => ({
      latitude: stop.destinationLatitude,
      longitude: stop.destinationLongitude,
    })),
    input.returnToOrigin,
  );
  const fuel = estimateFuelLiters(distanceKm, input.fuelConsumptionKmPerLiter);
  return {
    distanceKm,
    durationMinutes: estimateDurationMinutes({
      distanceKm,
      averageSpeedKmh: input.averageSpeedKmh,
      trafficLevel: input.trafficLevel,
      numberOfStops: stops.length,
      serviceMinutesPerStop: input.serviceMinutesPerStop,
    }),
    cost: round(fuel * input.fuelPrice),
    co2Kg: round(fuel * input.co2Factor),
    onTimeDeliveryRate:
      stops.length === 0
        ? 0
        : round((timing.filter((delivery) => delivery.onTime).length / stops.length) * 100),
  };
}

function buildRouteSnapshot(
  bucket: RouteBucket,
  routeIndex: number,
  input: SimulationEngineInput,
  startedAt: Date,
): SimulationRouteSnapshot {
  const origin = {
    latitude: bucket.group.center.latitude,
    longitude: bucket.group.center.longitude,
  };
  const byId = new Map(bucket.deliveries.map((delivery) => [delivery.id, delivery]));
  const optimizationStops: OptimizationStop[] = bucket.deliveries.map((delivery) => ({
    id: delivery.id,
    latitude: delivery.destinationLatitude,
    longitude: delivery.destinationLongitude,
    priority: delivery.priority,
    serviceDeadline: delivery.serviceDeadline,
  }));
  const candidate = optimizeRoute(origin, optimizationStops, startedAt).optimized;
  const candidateDeliveries = candidate.map((stop) => byId.get(stop.id)!);
  const originalDistance = calculateRouteDistance(
    origin,
    bucket.deliveries.map((delivery) => ({
      latitude: delivery.destinationLatitude,
      longitude: delivery.destinationLongitude,
    })),
    input.returnToOrigin,
  );
  const candidateDistance = calculateRouteDistance(origin, candidate, input.returnToOrigin);
  const optimizedDeliveries =
    candidateDistance <= originalDistance ? candidateDeliveries : [...bucket.deliveries];
  const originalTiming = deliveryTiming(origin, bucket.deliveries, input, startedAt);
  const optimizedTiming = deliveryTiming(origin, optimizedDeliveries, input, startedAt);
  const original = routeMetrics(origin, bucket.deliveries, input, originalTiming);
  const optimized = routeMetrics(origin, optimizedDeliveries, input, optimizedTiming);
  const originalSequence = new Map(
    bucket.deliveries.map((delivery, index) => [delivery.id, index + 1]),
  );
  const optimizedSequence = new Map(
    optimizedDeliveries.map((delivery, index) => [delivery.id, index + 1]),
  );
  const optimizedArrival = new Map(optimizedTiming.map((timing) => [timing.deliveryId, timing]));

  return {
    id: `simulation-route-${routeIndex + 1}`,
    vehicleIndex: routeIndex + 1,
    origin: { ...bucket.group.center },
    capacityKg: input.capacityKgPerVehicle,
    loadKg: round(bucket.loadKg),
    remainingCapacityKg: round(input.capacityKgPerVehicle - bucket.loadKg),
    deliveryCount: bucket.deliveries.length,
    originalOrder: bucket.deliveries.map((delivery) => delivery.id),
    optimizedOrder: optimizedDeliveries.map((delivery) => delivery.id),
    original: {
      ...original,
      path: routePath(bucket.group.center, bucket.deliveries, input.returnToOrigin),
    },
    optimized: {
      ...optimized,
      path: routePath(bucket.group.center, optimizedDeliveries, input.returnToOrigin),
    },
    stops: bucket.deliveries.map((delivery) => {
      const arrival = optimizedArrival.get(delivery.id)!;
      return {
        deliveryId: delivery.id,
        trackingCode: delivery.trackingCode,
        address: delivery.destinationAddress,
        latitude: delivery.destinationLatitude,
        longitude: delivery.destinationLongitude,
        weightKg: delivery.weightKg,
        priority: delivery.priority,
        serviceDeadline: delivery.serviceDeadline.toISOString(),
        originalSequence: originalSequence.get(delivery.id)!,
        optimizedSequence: optimizedSequence.get(delivery.id)!,
        estimatedArrival: arrival.estimatedArrival.toISOString(),
        onTime: arrival.onTime,
      };
    }),
  };
}

const sumRouteMetric = (
  routes: readonly SimulationRouteSnapshot[],
  variant: 'original' | 'optimized',
  metric: 'distanceKm' | 'durationMinutes' | 'cost' | 'co2Kg',
): number => routes.reduce((sum, route) => sum + route[variant][metric], 0);

export function simulateFleetScenario(
  deliveries: readonly SimulationDelivery[],
  input: SimulationEngineInput,
): SimulationEngineResult {
  const startedAt = input.startedAt ?? new Date();
  const allocation = allocateDeliveries(deliveries, input);
  const routes = allocation.buckets.map((bucket, index) =>
    buildRouteSnapshot(bucket, index, input, startedAt),
  );
  const originalDistanceKm = round(sumRouteMetric(routes, 'original', 'distanceKm'));
  const optimizedDistanceKm = round(sumRouteMetric(routes, 'optimized', 'distanceKm'));
  const originalDurationMinutes = Math.round(sumRouteMetric(routes, 'original', 'durationMinutes'));
  const optimizedDurationMinutes = Math.round(
    sumRouteMetric(routes, 'optimized', 'durationMinutes'),
  );
  const originalCost = round(sumRouteMetric(routes, 'original', 'cost'));
  const optimizedCost = round(sumRouteMetric(routes, 'optimized', 'cost'));
  const originalCo2Kg = round(sumRouteMetric(routes, 'original', 'co2Kg'));
  const optimizedCo2Kg = round(sumRouteMetric(routes, 'optimized', 'co2Kg'));
  const selectedDeliveries = routes.reduce((sum, route) => sum + route.deliveryCount, 0);
  const onTimeDeliveries = routes.reduce(
    (sum, route) => sum + route.stops.filter((stop) => stop.onTime).length,
    0,
  );
  const onTimeDeliveryRate =
    selectedDeliveries === 0 ? 0 : round((onTimeDeliveries / selectedDeliveries) * 100);
  const serviceLevel =
    deliveries.length === 0 ? 0 : round((selectedDeliveries / deliveries.length) * 100);
  const improvementPercentage =
    originalDistanceKm === 0
      ? 0
      : round(((originalDistanceKm - optimizedDistanceKm) / originalDistanceKm) * 100);
  const originalMakespanMinutes = routes.reduce(
    (maximum, route) => Math.max(maximum, route.original.durationMinutes),
    0,
  );
  const optimizedMakespanMinutes = routes.reduce(
    (maximum, route) => Math.max(maximum, route.optimized.durationMinutes),
    0,
  );

  const metrics = {
    originalDistanceKm,
    optimizedDistanceKm,
    originalDurationMinutes,
    optimizedDurationMinutes,
    originalCost,
    optimizedCost,
    originalCo2Kg,
    optimizedCo2Kg,
    onTimeDeliveryRate,
    serviceLevel,
    improvementPercentage,
    originalMakespanMinutes,
    optimizedMakespanMinutes,
  };

  return {
    originalDistanceKm,
    optimizedDistanceKm,
    originalDurationMinutes,
    optimizedDurationMinutes,
    originalCost,
    optimizedCost,
    originalCo2Kg,
    optimizedCo2Kg,
    onTimeDeliveryRate,
    serviceLevel,
    improvementPercentage,
    routeData: {
      version: 2,
      mode: 'SIMULATION',
      startedAt: startedAt.toISOString(),
      availableVehicles: input.availableVehicles,
      usedVehicles: routes.length,
      capacityKgPerVehicle: input.capacityKgPerVehicle,
      requestedDeliveries: deliveries.length,
      selectedDeliveries,
      unassignedDeliveries: allocation.unassigned,
      metrics,
      routes,
    },
  };
}

export function isSimulationRouteData(value: unknown): value is SimulationRouteData {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Partial<SimulationRouteData>;
  return (
    candidate.version === 2 && candidate.mode === 'SIMULATION' && Array.isArray(candidate.routes)
  );
}
