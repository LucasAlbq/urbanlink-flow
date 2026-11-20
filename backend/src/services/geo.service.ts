import { badRequest } from '../shared/errors.js';
import { round } from '../shared/http.js';

export interface Coordinate {
  latitude: number;
  longitude: number;
}

export type TrafficLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export const TRAFFIC_FACTORS: Readonly<Record<TrafficLevel, number>> = {
  LOW: 1,
  MODERATE: 1.25,
  HIGH: 1.6,
  CRITICAL: 2,
};

const EARTH_RADIUS_KM = 6_371.0088;
const toRadians = (degrees: number): number => (degrees * Math.PI) / 180;

export function haversineDistance(from: Coordinate, to: Coordinate): number {
  const deltaLatitude = toRadians(to.latitude - from.latitude);
  const deltaLongitude = toRadians(to.longitude - from.longitude);
  const fromLatitude = toRadians(from.latitude);
  const toLatitude = toRadians(to.latitude);

  const haversine =
    Math.sin(deltaLatitude / 2) ** 2 +
    Math.cos(fromLatitude) * Math.cos(toLatitude) * Math.sin(deltaLongitude / 2) ** 2;

  return round(2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(Math.min(1, haversine))), 4);
}

export function calculateRouteDistance(
  origin: Coordinate,
  stops: readonly Coordinate[],
  returnToOrigin = false,
): number {
  if (stops.length === 0) {
    return 0;
  }
  let distance = 0;
  let current = origin;
  for (const stop of stops) {
    distance += haversineDistance(current, stop);
    current = stop;
  }
  if (returnToOrigin) {
    distance += haversineDistance(current, origin);
  }
  return round(distance);
}

export interface DurationInput {
  distanceKm: number;
  averageSpeedKmh: number;
  trafficLevel: TrafficLevel;
  numberOfStops: number;
  serviceMinutesPerStop?: number;
}

export function estimateDurationMinutes(input: DurationInput): number {
  if (input.averageSpeedKmh <= 0) {
    throw badRequest('A velocidade média deve ser maior que zero.');
  }
  if (input.distanceKm < 0 || input.numberOfStops < 0) {
    throw badRequest('Distância e quantidade de paradas não podem ser negativas.');
  }

  const travelMinutes =
    (input.distanceKm / input.averageSpeedKmh) * 60 * TRAFFIC_FACTORS[input.trafficLevel];
  const serviceMinutes = input.numberOfStops * (input.serviceMinutesPerStop ?? 8);
  return Math.ceil(travelMinutes + serviceMinutes);
}

export const estimateFuelLiters = (
  distanceKm: number,
  fuelConsumptionKmPerLiter: number,
): number => {
  if (fuelConsumptionKmPerLiter <= 0) {
    throw badRequest('O consumo do veículo deve ser maior que zero.');
  }
  return round(distanceKm / fuelConsumptionKmPerLiter, 3);
};
