import { round } from '../../shared/http.js';
import { isSimulationRouteData } from '../simulations/simulation-engine.service.js';

interface SimulationResultProjection {
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
  routeData: unknown;
}

export interface SimulationProjectionInput {
  id: string;
  name: string;
  status: string;
  trafficLevel: string;
  availableVehicles: number;
  result: SimulationResultProjection;
}

const normalize = (latitude: number, longitude: number) => ({
  x: round((longitude + 46.6333) * 900, 3),
  z: round((latitude + 23.5505) * -900, 3),
});

export const buildCityBuildings = () =>
  Array.from({ length: 48 }, (_, index) => {
    const x = (index % 8) * 18 - 63;
    const z = Math.floor(index / 8) * 18 - 45;
    return {
      id: `building-${index + 1}`,
      x,
      z,
      height: 8 + ((index * 17) % 38),
      intensity: round(0.2 + ((index * 13) % 70) / 100, 2),
    };
  });

const buildHotspots = (
  deliveries: readonly {
    x: number;
    z: number;
    isLate: boolean;
  }[],
) => {
  const grid = new Map<
    string,
    { id: string; x: number; z: number; totalCount: number; lateCount: number }
  >();
  for (const delivery of deliveries) {
    const x = Math.round(delivery.x / 20) * 20;
    const z = Math.round(delivery.z / 20) * 20;
    const key = `${x}:${z}`;
    const current = grid.get(key) ?? {
      id: `simulation-hotspot-${key}`,
      x,
      z,
      totalCount: 0,
      lateCount: 0,
    };
    current.totalCount += 1;
    if (delivery.isLate) current.lateCount += 1;
    grid.set(key, current);
  }
  return [...grid.values()].map((hotspot) => ({
    ...hotspot,
    intensity: round(Math.min(1, hotspot.totalCount / 8), 2),
  }));
};

export function buildSimulationCityProjection(simulation: SimulationProjectionInput) {
  const routeData = simulation.result.routeData;
  if (!isSimulationRouteData(routeData)) return null;

  const centers = new Map<
    string,
    {
      id: string;
      name: string;
      x: number;
      z: number;
      status: string;
    }
  >();
  const deliveries = routeData.routes.flatMap((route) => {
    const position = normalize(route.origin.latitude, route.origin.longitude);
    centers.set(route.origin.id, {
      id: route.origin.id,
      name: route.origin.name,
      ...position,
      status: 'SIMULATED',
    });
    return route.stops.map((stop) => ({
      id: stop.deliveryId,
      trackingCode: stop.trackingCode,
      ...normalize(stop.latitude, stop.longitude),
      status: stop.onTime ? 'SIMULATED_ON_TIME' : 'SIMULATED_LATE',
      priority: stop.priority,
      isLate: !stop.onTime,
      estimatedArrival: stop.estimatedArrival,
      routeId: route.id,
      sequence: stop.optimizedSequence,
    }));
  });

  return {
    scenario: {
      type: 'SIMULATION' as const,
      id: simulation.id,
      name: simulation.name,
      status: simulation.status,
      trafficLevel: simulation.trafficLevel,
      availableVehicles: simulation.availableVehicles,
      usedVehicles: routeData.usedVehicles,
      metrics: {
        originalDistanceKm: simulation.result.originalDistanceKm,
        optimizedDistanceKm: simulation.result.optimizedDistanceKm,
        originalDurationMinutes: simulation.result.originalDurationMinutes,
        optimizedDurationMinutes: simulation.result.optimizedDurationMinutes,
        originalCost: simulation.result.originalCost,
        optimizedCost: simulation.result.optimizedCost,
        originalCo2Kg: simulation.result.originalCo2Kg,
        optimizedCo2Kg: simulation.result.optimizedCo2Kg,
        onTimeDeliveryRate: simulation.result.onTimeDeliveryRate,
        serviceLevel: simulation.result.serviceLevel,
        improvementPercentage: simulation.result.improvementPercentage,
        originalMakespanMinutes: routeData.metrics.originalMakespanMinutes,
        optimizedMakespanMinutes: routeData.metrics.optimizedMakespanMinutes,
      },
    },
    buildings: buildCityBuildings(),
    centers: [...centers.values()],
    deliveries,
    vehicles: routeData.routes.map((route) => ({
      id: `${simulation.id}:${route.id}`,
      plate: `SIM-${String(route.vehicleIndex).padStart(2, '0')}`,
      ...normalize(route.origin.latitude, route.origin.longitude),
      status: 'IN_ROUTE',
      progress: 0,
      routeId: route.id,
    })),
    routes: routeData.routes.map((route) => ({
      id: route.id,
      status: 'ACTIVE',
      selected: true,
      points: route.optimized.path.map((point) => normalize(point.latitude, point.longitude)),
      originalPoints: route.original.path.map((point) =>
        normalize(point.latitude, point.longitude),
      ),
      metrics: route.optimized,
      loadKg: route.loadKg,
      capacityKg: route.capacityKg,
    })),
    hotspots: buildHotspots(deliveries),
  };
}
