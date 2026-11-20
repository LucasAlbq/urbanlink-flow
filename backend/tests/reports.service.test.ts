import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  deliveryFindMany: vi.fn(),
  routeFindMany: vi.fn(),
  resultFindMany: vi.fn(),
  vehicleCount: vi.fn(),
}));

vi.mock('../src/lib/prisma.js', () => ({
  prisma: {
    delivery: { findMany: mocks.deliveryFindMany },
    route: { findMany: mocks.routeFindMany },
    simulationResult: { findMany: mocks.resultFindMany },
    vehicle: { count: mocks.vehicleCount },
  },
}));

import { performanceReport } from '../src/modules/reports/reports.service.js';

describe('reports.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.deliveryFindMany.mockResolvedValue([
      {
        status: 'DELIVERED',
        createdAt: new Date('2026-07-19T08:00:00.000Z'),
        deliveredAt: new Date('2026-07-19T09:00:00.000Z'),
        serviceDeadline: new Date('2026-07-19T09:30:00.000Z'),
      },
      {
        status: 'DELIVERED',
        createdAt: new Date('2026-07-19T08:00:00.000Z'),
        deliveredAt: new Date('2026-07-19T10:00:00.000Z'),
        serviceDeadline: new Date('2026-07-19T09:30:00.000Z'),
      },
    ]);
    mocks.routeFindMany.mockResolvedValue([
      {
        vehicleId: 'vehicle-1',
        status: 'COMPLETED',
        totalDistanceKm: 10,
        estimatedCost: 20,
        estimatedCo2Kg: 5,
      },
      {
        vehicleId: 'vehicle-2',
        status: 'ACTIVE',
        totalDistanceKm: 15,
        estimatedCost: 30,
        estimatedCo2Kg: 7,
      },
    ]);
    mocks.resultFindMany.mockResolvedValue([]);
    mocks.vehicleCount.mockResolvedValue(4);
  });

  it('filtra conclusões por deliveredAt e expõe contratos compatíveis', async () => {
    const from = '2026-07-01T00:00:00.000Z';
    const to = '2026-08-01T00:00:00.000Z';
    const report = await performanceReport({ from, to });

    expect(mocks.deliveryFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          OR: [
            {
              status: 'DELIVERED',
              deliveredAt: {
                gte: new Date(from),
                lte: new Date(to),
              },
            },
            {
              status: { not: 'DELIVERED' },
              createdAt: {
                gte: new Date(from),
                lte: new Date(to),
              },
            },
          ],
        },
      }),
    );
    expect(report.kpis).toMatchObject({
      onTimeDeliveryRate: 50,
      onTimeRate: 50,
      averageDeliveryMinutes: 90,
      fleetUtilization: 50,
      fleetUtilizationRate: 50,
    });
  });
});
