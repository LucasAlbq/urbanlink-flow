import { describe, expect, it } from 'vitest';
import {
  improveWithTwoOpt,
  nearestNeighbor,
  optimizeRoute,
  type OptimizationStop,
} from '../src/services/optimization.service.js';
import { calculateRouteDistance } from '../src/services/geo.service.js';

const origin = { latitude: -23.55, longitude: -46.63 };
const stops: OptimizationStop[] = [
  { id: 'a', latitude: -23.48, longitude: -46.7, priority: 'NORMAL' },
  { id: 'b', latitude: -23.61, longitude: -46.58, priority: 'NORMAL' },
  { id: 'c', latitude: -23.5, longitude: -46.57, priority: 'URGENT' },
  { id: 'd', latitude: -23.62, longitude: -46.72, priority: 'HIGH' },
  { id: 'e', latitude: -23.54, longitude: -46.66, priority: 'LOW' },
];

describe('optimization.service', () => {
  it('mantém todas as paradas no vizinho mais próximo', () => {
    const result = nearestNeighbor(origin, stops, new Date('2026-07-19T12:00:00Z'));
    expect(result).toHaveLength(stops.length);
    expect(new Set(result.map((stop) => stop.id))).toEqual(new Set(stops.map((stop) => stop.id)));
  });

  it('2-opt nunca aumenta a distância recebida', () => {
    const improved = improveWithTwoOpt(origin, stops);
    expect(calculateRouteDistance(origin, improved)).toBeLessThanOrEqual(
      calculateRouteDistance(origin, stops),
    );
  });

  it('retorna comparação original e otimizada verificável', () => {
    const result = optimizeRoute(origin, stops);
    expect(result.optimizedDistanceKm).toBeLessThanOrEqual(result.originalDistanceKm);
    expect(result.improvementPercentage).toBeGreaterThanOrEqual(0);
    expect(result.optimized).toHaveLength(stops.length);
  });
});
