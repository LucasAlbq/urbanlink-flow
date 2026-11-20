import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  deliveryGroupBy: vi.fn(),
  vehicleGroupBy: vi.fn(),
  deliveryCount: vi.fn(),
  routeAggregate: vi.fn(),
  deliveryFindMany: vi.fn(),
  resultAggregate: vi.fn(),
  alertFindMany: vi.fn(),
}));

vi.mock('../src/lib/prisma.js', () => ({
  prisma: {
    delivery: {
      groupBy: mocks.deliveryGroupBy,
      count: mocks.deliveryCount,
      findMany: mocks.deliveryFindMany,
    },
    vehicle: { groupBy: mocks.vehicleGroupBy },
    route: { aggregate: mocks.routeAggregate },
    simulationResult: { aggregate: mocks.resultAggregate },
    alert: { findMany: mocks.alertFindMany },
  },
}));

import { dashboardSummary } from '../src/modules/dashboard/dashboard.service.js';

describe('dashboard.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.deliveryGroupBy.mockResolvedValue([{ status: 'DELIVERED', _count: { _all: 1 } }]);
    mocks.vehicleGroupBy.mockResolvedValue([
      { status: 'IN_ROUTE', _count: { _all: 1 } },
      { status: 'AVAILABLE', _count: { _all: 1 } },
    ]);
    mocks.deliveryCount.mockResolvedValue(0);
    mocks.routeAggregate.mockResolvedValue({
      _sum: {
        totalDistanceKm: 10,
        estimatedCost: 20,
        estimatedCo2Kg: 5,
      },
    });
    mocks.deliveryFindMany.mockResolvedValue([
      {
        createdAt: new Date('2026-07-19T08:00:00.000Z'),
        deliveredAt: new Date('2026-07-19T09:30:00.000Z'),
        serviceDeadline: new Date('2026-07-19T10:00:00.000Z'),
      },
    ]);
    mocks.resultAggregate.mockResolvedValue({
      _sum: { originalCost: 30, optimizedCost: 20 },
    });
    mocks.alertFindMany.mockResolvedValue([]);
  });

  it('não devolve alertas resolvidos e usa o evento da entrega no tempo médio', async () => {
    const summary = await dashboardSummary();

    expect(mocks.alertFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { status: { not: 'RESOLVED' } },
      }),
    );
    expect(summary.metrics.averageDeliveryMinutes).toBe(90);
    expect(summary.recentAlerts).toEqual([]);
  });
});
