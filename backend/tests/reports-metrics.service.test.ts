import { describe, expect, it } from 'vitest';
import {
  deliveryEventMetrics,
  fleetUtilizationRate,
} from '../src/modules/reports/reports.service.js';

describe('report metrics', () => {
  it('calcula duração e pontualidade a partir do evento deliveredAt', () => {
    const metrics = deliveryEventMetrics([
      {
        createdAt: new Date('2026-07-19T08:00:00.000Z'),
        deliveredAt: new Date('2026-07-19T09:00:00.000Z'),
        serviceDeadline: new Date('2026-07-19T09:30:00.000Z'),
      },
      {
        createdAt: new Date('2026-07-19T08:00:00.000Z'),
        deliveredAt: new Date('2026-07-19T10:00:00.000Z'),
        serviceDeadline: new Date('2026-07-19T09:30:00.000Z'),
      },
      {
        createdAt: new Date('2026-07-19T08:00:00.000Z'),
        deliveredAt: null,
        serviceDeadline: new Date('2026-07-19T09:30:00.000Z'),
      },
    ]);

    expect(metrics).toEqual({
      completed: 2,
      onTime: 1,
      onTimeDeliveryRate: 50,
      averageDeliveryMinutes: 90,
    });
  });

  it('mede utilização por veículos distintos com rota no período', () => {
    expect(
      fleetUtilizationRate(
        [
          { vehicleId: 'v1', status: 'COMPLETED' },
          { vehicleId: 'v1', status: 'ACTIVE' },
          { vehicleId: 'v2', status: 'PLANNED' },
          { vehicleId: 'v3', status: 'CANCELED' },
        ],
        4,
      ),
    ).toBe(50);
  });
});
