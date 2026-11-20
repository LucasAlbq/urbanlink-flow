import { round } from '../../shared/http.js';

export interface LiveRouteSource {
  id: string;
  vehicle: { id: string };
  stops: Array<{
    latitude: number;
    longitude: number;
    delivery: {
      originCenter: { latitude: number; longitude: number };
    };
  }>;
}

export const liveProgress = (tick: number, finalTick = 60): number =>
  finalTick <= 0 ? 1 : round(Math.min(1, Math.max(0, tick / finalTick)), 2);

export function buildLiveSnapshot(
  routes: readonly LiveRouteSource[],
  tick: number,
  finalTick = 60,
) {
  const progress = liveProgress(tick, finalTick);
  const vehicles = routes.flatMap((route) => {
    const center = route.stops[0]?.delivery.originCenter;
    if (center === undefined) return [];
    const path = [
      { latitude: center.latitude, longitude: center.longitude },
      ...route.stops.map((stop) => ({
        latitude: stop.latitude,
        longitude: stop.longitude,
      })),
    ];
    const scaled = progress * Math.max(1, path.length - 1);
    const index = Math.min(Math.floor(scaled), path.length - 2);
    const local = scaled - index;
    const from = path[index]!;
    const to = path[index + 1] ?? from;
    return [
      {
        id: route.vehicle.id,
        routeId: route.id,
        latitude: from.latitude + (to.latitude - from.latitude) * local,
        longitude: from.longitude + (to.longitude - from.longitude) * local,
        progress,
        status: progress === 1 ? 'COMPLETED' : 'IN_ROUTE',
      },
    ];
  });
  return {
    mode: 'DEMO' as const,
    tick,
    progress,
    generatedAt: new Date().toISOString(),
    vehicles,
  };
}
