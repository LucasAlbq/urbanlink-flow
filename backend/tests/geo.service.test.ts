import { describe, expect, it } from 'vitest';
import {
  calculateRouteDistance,
  estimateDurationMinutes,
  haversineDistance,
} from '../src/services/geo.service.js';

describe('geo.service', () => {
  it('calcula distância Haversine com precisão conhecida', () => {
    const distance = haversineDistance(
      { latitude: 0, longitude: 0 },
      { latitude: 0, longitude: 1 },
    );
    expect(distance).toBeCloseTo(111.195, 2);
  });

  it('soma os trechos da rota', () => {
    const distance = calculateRouteDistance({ latitude: 0, longitude: 0 }, [
      { latitude: 0, longitude: 1 },
      { latitude: 0, longitude: 2 },
    ]);
    expect(distance).toBeCloseTo(222.39, 1);
  });

  it('considera trânsito e atendimento por parada no tempo', () => {
    const duration = estimateDurationMinutes({
      distanceKm: 10,
      averageSpeedKmh: 20,
      trafficLevel: 'HIGH',
      numberOfStops: 2,
      serviceMinutesPerStop: 8,
    });
    expect(duration).toBe(64);
  });

  it('rejeita velocidade não positiva', () => {
    expect(() =>
      estimateDurationMinutes({
        distanceKm: 10,
        averageSpeedKmh: 0,
        trafficLevel: 'LOW',
        numberOfStops: 1,
      }),
    ).toThrow('velocidade média');
  });
});
