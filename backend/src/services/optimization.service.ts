import { calculateRouteDistance, haversineDistance, type Coordinate } from './geo.service.js';

export interface OptimizationStop extends Coordinate {
  id: string;
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  serviceDeadline?: Date;
}

const PRIORITY_WEIGHT: Readonly<Record<OptimizationStop['priority'], number>> = {
  URGENT: 0.55,
  HIGH: 0.72,
  NORMAL: 1,
  LOW: 1.15,
};

const deadlineFactor = (deadline: Date | undefined, now: Date): number => {
  if (deadline === undefined) {
    return 1;
  }
  const hours = (deadline.getTime() - now.getTime()) / 3_600_000;
  if (hours <= 0) return 0.35;
  if (hours <= 2) return 0.5;
  if (hours <= 6) return 0.75;
  return 1;
};

export function nearestNeighbor(
  origin: Coordinate,
  stops: readonly OptimizationStop[],
  now = new Date(),
): OptimizationStop[] {
  const pending = [...stops];
  const ordered: OptimizationStop[] = [];
  let current = origin;

  while (pending.length > 0) {
    let bestIndex = 0;
    let bestScore = Number.POSITIVE_INFINITY;
    for (const [index, stop] of pending.entries()) {
      const score =
        haversineDistance(current, stop) *
        PRIORITY_WEIGHT[stop.priority] *
        deadlineFactor(stop.serviceDeadline, now);
      if (score < bestScore) {
        bestScore = score;
        bestIndex = index;
      }
    }
    const [selected] = pending.splice(bestIndex, 1);
    if (selected === undefined) break;
    ordered.push(selected);
    current = selected;
  }
  return ordered;
}

export function improveWithTwoOpt(
  origin: Coordinate,
  initial: readonly OptimizationStop[],
  maxPasses = 50,
): OptimizationStop[] {
  if (initial.length < 4) {
    return [...initial];
  }
  let route = [...initial];
  let bestDistance = calculateRouteDistance(origin, route);
  let improved = true;
  let pass = 0;

  while (improved && pass < maxPasses) {
    improved = false;
    pass += 1;
    for (let start = 0; start < route.length - 2; start += 1) {
      for (let end = start + 1; end < route.length; end += 1) {
        const candidate = [
          ...route.slice(0, start),
          ...route.slice(start, end + 1).reverse(),
          ...route.slice(end + 1),
        ];
        const candidateDistance = calculateRouteDistance(origin, candidate);
        if (candidateDistance + 0.0001 < bestDistance) {
          route = candidate;
          bestDistance = candidateDistance;
          improved = true;
        }
      }
    }
  }
  return route;
}

export interface OptimizationResult {
  original: OptimizationStop[];
  optimized: OptimizationStop[];
  originalDistanceKm: number;
  optimizedDistanceKm: number;
  improvementPercentage: number;
}

export function optimizeRoute(
  origin: Coordinate,
  stops: readonly OptimizationStop[],
  now = new Date(),
): OptimizationResult {
  const original = [...stops];
  const nearest = nearestNeighbor(origin, stops, now);
  const improved = improveWithTwoOpt(origin, nearest);
  const originalDistanceKm = calculateRouteDistance(origin, original);
  const candidateDistanceKm = calculateRouteDistance(origin, improved);
  const useCandidate = candidateDistanceKm <= originalDistanceKm || original.length === 0;
  const optimized = useCandidate ? improved : original;
  const optimizedDistanceKm = useCandidate ? candidateDistanceKm : originalDistanceKm;
  const improvementPercentage =
    originalDistanceKm === 0
      ? 0
      : ((originalDistanceKm - optimizedDistanceKm) / originalDistanceKm) * 100;

  return {
    original,
    optimized,
    originalDistanceKm,
    optimizedDistanceKm,
    improvementPercentage,
  };
}
