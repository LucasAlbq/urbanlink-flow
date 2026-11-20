import type { Prisma } from '../../generated/prisma/client.js';
import { prisma } from '../../lib/prisma.js';
import { assertVehicleUpdateIntegrity } from '../../services/route-rules.service.js';
import { notFound } from '../../shared/errors.js';
import { paginationMeta } from '../../shared/http.js';
import type {
  CreateVehicleInput,
  ListVehiclesQuery,
  UpdateVehicleInput,
} from './vehicles.schemas.js';

export async function listVehicles(query: ListVehiclesQuery) {
  const where: Prisma.VehicleWhereInput = {
    ...(query.status === undefined ? {} : { status: query.status }),
    ...(query.type === undefined ? {} : { type: query.type }),
    ...(query.search === undefined
      ? {}
      : {
          OR: [
            { plate: { contains: query.search, mode: 'insensitive' } },
            { model: { contains: query.search, mode: 'insensitive' } },
          ],
        }),
  };
  const [items, total] = await prisma.$transaction([
    prisma.vehicle.findMany({
      where,
      orderBy: { [query.sortBy]: query.sortOrder },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
    prisma.vehicle.count({ where }),
  ]);
  return { items, meta: paginationMeta(query.page, query.pageSize, total) };
}

export async function getVehicle(id: string) {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id },
    include: {
      routes: { where: { status: { in: ['PLANNED', 'ACTIVE'] } }, take: 5 },
    },
  });
  if (vehicle === null) throw notFound('Veículo');
  return vehicle;
}

export const createVehicle = (input: CreateVehicleInput) => prisma.vehicle.create({ data: input });

export async function updateVehicle(id: string, input: UpdateVehicleInput) {
  return prisma.$transaction(
    async (transaction) => {
      const [vehicle, operationalLoad] = await Promise.all([
        transaction.vehicle.findUnique({
          where: { id },
          include: {
            routes: {
              where: { status: { in: ['PLANNED', 'ACTIVE'] } },
              select: { status: true },
            },
          },
        }),
        transaction.delivery.aggregate({
          where: {
            assignedVehicleId: id,
            status: { in: ['ASSIGNED', 'IN_TRANSIT'] },
          },
          _sum: { weightKg: true },
        }),
      ]);
      if (vehicle === null) throw notFound('Veículo');

      assertVehicleUpdateIntegrity({
        currentStatus: vehicle.status,
        requestedStatus: input.status,
        currentCapacityKg: vehicle.capacityKg,
        requestedCapacityKg: input.capacityKg,
        operationalLoadKg: operationalLoad._sum.weightKg ?? 0,
        plannedRouteCount: vehicle.routes.filter((route) => route.status === 'PLANNED').length,
        activeRouteCount: vehicle.routes.filter((route) => route.status === 'ACTIVE').length,
      });
      return transaction.vehicle.update({ where: { id }, data: input });
    },
    { isolationLevel: 'Serializable' },
  );
}

export const deactivateVehicle = (id: string) => updateVehicle(id, { status: 'INACTIVE' });
