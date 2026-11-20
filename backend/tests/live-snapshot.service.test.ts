import { describe, expect, it } from 'vitest';
import { buildLiveSnapshot, liveProgress } from '../src/modules/dashboard/live-snapshot.service.js';

const routes = [
  {
    id: 'route-1',
    vehicle: { id: 'vehicle-1' },
    stops: [
      {
        latitude: -23.56,
        longitude: -46.64,
        delivery: {
          originCenter: { latitude: -23.55, longitude: -46.63 },
        },
      },
      {
        latitude: -23.57,
        longitude: -46.65,
        delivery: {
          originCenter: { latitude: -23.55, longitude: -46.63 },
        },
      },
    ],
  },
];

describe('live-snapshot.service', () => {
  it('alcança exatamente 100% no último evento', () => {
    expect(liveProgress(0, 60)).toBe(0);
    expect(liveProgress(30, 60)).toBe(0.5);
    expect(liveProgress(60, 60)).toBe(1);
    expect(liveProgress(61, 60)).toBe(1);

    const snapshot = buildLiveSnapshot(routes, 60, 60);
    expect(snapshot.progress).toBe(1);
    expect(snapshot.vehicles[0]).toMatchObject({
      progress: 1,
      status: 'COMPLETED',
      latitude: -23.57,
      longitude: -46.65,
    });
  });
});
