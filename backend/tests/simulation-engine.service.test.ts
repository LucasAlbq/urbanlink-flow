import { describe, expect, it } from 'vitest';
import {
  simulateFleetScenario,
  type SimulationDelivery,
} from '../src/modules/simulations/simulation-engine.service.js';

const now = new Date('2026-07-19T12:00:00.000Z');
const centers = {
  a: {
    id: 'center-a',
    name: 'Centro A',
    latitude: -23.55,
    longitude: -46.63,
  },
  b: {
    id: 'center-b',
    name: 'Centro B',
    latitude: -23.59,
    longitude: -46.58,
  },
};

const delivery = (
  id: string,
  center: SimulationDelivery['originCenter'],
  weightKg: number,
  offset: number,
  priority: SimulationDelivery['priority'] = 'NORMAL',
): SimulationDelivery => ({
  id,
  trackingCode: `UL-${id}`,
  destinationAddress: `Destino ${id}`,
  destinationLatitude: center.latitude + 0.01 + offset * 0.002,
  destinationLongitude: center.longitude - 0.01 - offset * 0.002,
  weightKg,
  priority,
  serviceDeadline: new Date(now.getTime() + 8 * 3_600_000),
  originCenter: center,
});

const input = {
  availableVehicles: 3,
  capacityKgPerVehicle: 100,
  averageSpeedKmh: 30,
  trafficLevel: 'MODERATE' as const,
  fuelPrice: 6,
  co2Factor: 2.3,
  fuelConsumptionKmPerLiter: 10,
  serviceMinutesPerStop: 8,
  returnToOrigin: true,
  startedAt: now,
};

describe('simulation-engine.service', () => {
  it('separa a frota em rotas por centro e respeita a capacidade individual', () => {
    const deliveries = [
      delivery('a1', centers.a, 60, 1, 'URGENT'),
      delivery('a2', centers.a, 50, 2),
      delivery('a3', centers.a, 40, 3),
      delivery('b1', centers.b, 40, 1, 'HIGH'),
      delivery('b2', centers.b, 30, 2),
      delivery('b3', centers.b, 30, 3),
    ];

    const result = simulateFleetScenario(deliveries, input);

    expect(result.routeData.availableVehicles).toBe(3);
    expect(result.routeData.usedVehicles).toBe(3);
    expect(result.routeData.routes).toHaveLength(3);
    expect(new Set(result.routeData.routes.map((route) => route.origin.id))).toEqual(
      new Set(['center-a', 'center-b']),
    );
    expect(
      result.routeData.routes.every(
        (route) =>
          route.loadKg <= route.capacityKg &&
          new Set(
            route.stops.map((stop) => {
              const source = deliveries.find((candidate) => candidate.id === stop.deliveryId)!;
              return source.originCenter.id;
            }),
          ).size === 1,
      ),
    ).toBe(true);
    expect(result.routeData.selectedDeliveries).toBe(deliveries.length);
    expect(result.routeData.unassignedDeliveries).toEqual([]);
  });

  it('agrega as métricas das rotas e persiste caminhos verificáveis', () => {
    const result = simulateFleetScenario(
      [
        delivery('a1', centers.a, 40, 1),
        delivery('a2', centers.a, 40, 2),
        delivery('b1', centers.b, 30, 1),
        delivery('b2', centers.b, 30, 2),
      ],
      { ...input, availableVehicles: 2 },
    );

    const totalOptimizedKm = result.routeData.routes.reduce(
      (sum, route) => sum + route.optimized.distanceKm,
      0,
    );
    const totalOptimizedMinutes = result.routeData.routes.reduce(
      (sum, route) => sum + route.optimized.durationMinutes,
      0,
    );
    expect(result.optimizedDistanceKm).toBeCloseTo(totalOptimizedKm, 2);
    expect(result.optimizedDurationMinutes).toBe(totalOptimizedMinutes);
    expect(result.routeData.metrics.optimizedDistanceKm).toBe(result.optimizedDistanceKm);
    for (const route of result.routeData.routes) {
      expect(route.optimized.path[0]).toMatchObject({ kind: 'CENTER' });
      expect(route.optimized.path.at(-1)).toMatchObject({ kind: 'CENTER' });
      expect(route.optimizedOrder).toHaveLength(route.deliveryCount);
      expect(route.stops.every((stop) => stop.estimatedArrival.length > 0)).toBe(true);
    }
  });

  it('explica entregas não atendidas sem somar capacidades entre veículos', () => {
    const result = simulateFleetScenario(
      [
        delivery('a1', centers.a, 70, 1, 'URGENT'),
        delivery('b1', centers.b, 60, 1),
        delivery('oversize', centers.a, 101, 2),
      ],
      { ...input, availableVehicles: 1 },
    );

    expect(result.routeData.usedVehicles).toBe(1);
    expect(result.routeData.routes[0]!.loadKg).toBeLessThanOrEqual(100);
    expect(result.routeData.unassignedDeliveries).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          deliveryId: 'b1',
          reason: 'NO_VEHICLE_FOR_CENTER',
        }),
        expect.objectContaining({
          deliveryId: 'oversize',
          reason: 'EXCEEDS_VEHICLE_CAPACITY',
        }),
      ]),
    );
    expect(result.serviceLevel).toBeCloseTo(33.33, 2);
  });
});
