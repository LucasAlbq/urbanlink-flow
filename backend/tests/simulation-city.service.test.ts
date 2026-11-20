import { describe, expect, it } from 'vitest';
import { buildSimulationCityProjection } from '../src/modules/dashboard/simulation-city.service.js';
import {
  simulateFleetScenario,
  type SimulationDelivery,
} from '../src/modules/simulations/simulation-engine.service.js';

const center = {
  id: 'center-1',
  name: 'Centro de teste',
  latitude: -23.55,
  longitude: -46.63,
};
const startedAt = new Date('2026-07-19T12:00:00.000Z');
const deliveries: SimulationDelivery[] = [1, 2, 3].map((index) => ({
  id: `delivery-${index}`,
  trackingCode: `UL-${index}`,
  destinationAddress: `Destino ${index}`,
  destinationLatitude: center.latitude + index * 0.01,
  destinationLongitude: center.longitude - index * 0.01,
  weightKg: 20,
  priority: 'NORMAL',
  serviceDeadline: new Date(startedAt.getTime() + 4 * 3_600_000),
  originCenter: center,
}));

describe('simulation-city.service', () => {
  it('projeta somente rotas, pontos e métricas do resultado selecionado', () => {
    const result = simulateFleetScenario(deliveries, {
      availableVehicles: 2,
      capacityKgPerVehicle: 100,
      averageSpeedKmh: 30,
      trafficLevel: 'LOW',
      fuelPrice: 6,
      co2Factor: 2.3,
      fuelConsumptionKmPerLiter: 10,
      serviceMinutesPerStop: 5,
      returnToOrigin: false,
      startedAt,
    });
    const projection = buildSimulationCityProjection({
      id: 'simulation-1',
      name: 'Cenário selecionado',
      status: 'COMPLETED',
      trafficLevel: 'LOW',
      availableVehicles: 2,
      result,
    });

    expect(projection).not.toBeNull();
    expect(projection!.scenario).toMatchObject({
      type: 'SIMULATION',
      id: 'simulation-1',
      usedVehicles: 2,
      metrics: {
        optimizedDistanceKm: result.optimizedDistanceKm,
        serviceLevel: 100,
      },
    });
    expect(projection!.routes).toHaveLength(result.routeData.routes.length);
    expect(projection!.buildings).toHaveLength(48);
    expect(projection!.centers).toHaveLength(1);
    expect(projection!.deliveries).toHaveLength(deliveries.length);
    expect(projection!.vehicles).toHaveLength(result.routeData.routes.length);
    expect(projection!.hotspots.length).toBeGreaterThan(0);
    expect(projection!.deliveries.map((item) => item.id).sort()).toEqual(
      deliveries.map((item) => item.id).sort(),
    );
    expect(
      projection!.routes.every((route) => route.status === 'ACTIVE' && route.points.length >= 2),
    ).toBe(true);
  });

  it('recusa snapshot legado que não contém rotas projetáveis', () => {
    expect(
      buildSimulationCityProjection({
        id: 'simulation-legacy',
        name: 'Legado',
        status: 'COMPLETED',
        trafficLevel: 'LOW',
        availableVehicles: 1,
        result: {
          originalDistanceKm: 1,
          optimizedDistanceKm: 1,
          originalDurationMinutes: 1,
          optimizedDurationMinutes: 1,
          originalCost: 1,
          optimizedCost: 1,
          originalCo2Kg: 1,
          optimizedCo2Kg: 1,
          onTimeDeliveryRate: 100,
          serviceLevel: 100,
          improvementPercentage: 0,
          routeData: { mode: 'SIMULATION' },
        },
      }),
    ).toBeNull();
  });
});
