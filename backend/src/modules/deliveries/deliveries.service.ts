import type { Prisma } from '../../generated/prisma/client.js';
import { prisma } from '../../lib/prisma.js';
import {
  assertDeliveryRouteTransition,
  assertDeliveryTransition,
  assertVehicleCapacity,
  type DeliveryState,
} from '../../services/route-rules.service.js';
import { conflict, notFound } from '../../shared/errors.js';
import { paginationMeta } from '../../shared/http.js';
import type {
  CreateDeliveryInput,
  ListDeliveriesQuery,
  UpdateDeliveryInput,
} from './deliveries.schemas.js';

const deliveryInclude = {
  originCenter: true,
  assignedVehicle: true,
  routeStops: {
    include: { route: { select: { id: true, name: true, status: true } } },
    orderBy: { createdAt: 'desc' as const },
  },
} as const;

export async function listDeliveries(query: ListDeliveriesQuery) {
  const now = new Date();
  const where: Prisma.DeliveryWhereInput = {
    ...(query.status === undefined ? {} : { status: query.status }),
    ...(query.priority === undefined ? {} : { priority: query.priority }),
    ...(query.vehicleId === undefined ? {} : { assignedVehicleId: query.vehicleId }),
    ...(query.originCenterId === undefined ? {} : { originCenterId: query.originCenterId }),
    ...(query.overdue !== true
      ? {}
      : {
          serviceDeadline: { lt: now },
          status: { notIn: ['DELIVERED', 'CANCELED'] },
        }),
    ...(query.search === undefined
      ? {}
      : {
          OR: [
            { trackingCode: { contains: query.search, mode: 'insensitive' } },
            { destinationAddress: { contains: query.search, mode: 'insensitive' } },
          ],
        }),
  };
  const [items, total] = await prisma.$transaction([
    prisma.delivery.findMany({
      where,
      include: {
        originCenter: { select: { id: true, name: true } },
        assignedVehicle: { select: { id: true, plate: true, model: true } },
      },
      orderBy: { [query.sortBy]: query.sortOrder },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
    prisma.delivery.count({ where }),
  ]);
  return { items, meta: paginationMeta(query.page, query.pageSize, total) };
}

export async function getDelivery(id: string) {
  const delivery = await prisma.delivery.findUnique({
    where: { id },
    include: deliveryInclude,
  });
  if (delivery === null) throw notFound('Entrega');
  return delivery;
}

export async function createDelivery(input: CreateDeliveryInput) {
  const deliveryId = await prisma.$transaction(
    async (transaction) => {
      const [center, vehicle, operationalLoad] = await Promise.all([
        transaction.distributionCenter.findUnique({
          where: { id: input.originCenterId },
          select: { id: true },
        }),
        input.assignedVehicleId === undefined
          ? Promise.resolve(null)
          : transaction.vehicle.findUnique({
              where: { id: input.assignedVehicleId },
            }),
        input.assignedVehicleId === undefined
          ? Promise.resolve(null)
          : transaction.delivery.aggregate({
              where: {
                assignedVehicleId: input.assignedVehicleId,
                status: { in: ['ASSIGNED', 'IN_TRANSIT'] },
              },
              _sum: { weightKg: true },
            }),
      ]);
      if (center === null) throw notFound('Centro de distribuição');
      if (input.assignedVehicleId !== undefined) {
        if (vehicle === null) throw notFound('Veículo');
        if (vehicle.status !== 'AVAILABLE') {
          throw conflict('O veículo precisa estar disponível para receber a entrega.');
        }
        assertVehicleCapacity(vehicle.capacityKg, [
          operationalLoad?._sum.weightKg ?? 0,
          input.weightKg,
        ]);
      }

      const { assignedVehicleId, ...deliveryData } = input;
      const delivery = await transaction.delivery.create({
        data: {
          ...deliveryData,
          assignedVehicleId,
          status: assignedVehicleId === undefined ? 'PENDING' : 'ASSIGNED',
        },
      });
      return delivery.id;
    },
    { isolationLevel: 'Serializable' },
  );
  return getDelivery(deliveryId);
}

export async function updateDelivery(id: string, input: UpdateDeliveryInput) {
  const delivery = await getDelivery(id);
  if (delivery.status !== 'PENDING') {
    throw conflict('Somente entregas pendentes podem ter dados logísticos alterados.');
  }
  return prisma.delivery.update({
    where: { id },
    data: input,
    include: deliveryInclude,
  });
}

export async function assignDelivery(id: string, vehicleId: string) {
  await prisma.$transaction(
    async (transaction) => {
      const [delivery, vehicle] = await Promise.all([
        transaction.delivery.findUnique({
          where: { id },
          include: {
            routeStops: {
              where: { route: { status: { in: ['PLANNED', 'ACTIVE'] } } },
              select: { routeId: true },
            },
          },
        }),
        transaction.vehicle.findUnique({ where: { id: vehicleId } }),
      ]);
      if (delivery === null) throw notFound('Entrega');
      if (vehicle === null) throw notFound('Veículo');
      if (vehicle.status !== 'AVAILABLE' && vehicle.id !== delivery.assignedVehicleId) {
        throw conflict('O veículo precisa estar disponível para receber a entrega.');
      }
      if (delivery.status !== 'PENDING' && delivery.status !== 'ASSIGNED') {
        throw conflict('Somente entregas pendentes ou atribuídas podem ser reatribuídas.');
      }
      if (delivery.routeStops.length > 0) {
        throw conflict(
          'Entrega vinculada a rota planejada ou ativa não pode ser reatribuída isoladamente.',
        );
      }

      const aggregate = await transaction.delivery.aggregate({
        where: {
          assignedVehicleId: vehicleId,
          status: { in: ['ASSIGNED', 'IN_TRANSIT'] },
          id: { not: id },
        },
        _sum: { weightKg: true },
      });
      assertVehicleCapacity(vehicle.capacityKg, [aggregate._sum.weightKg ?? 0, delivery.weightKg]);
      await transaction.delivery.update({
        where: { id },
        data: { assignedVehicleId: vehicleId, status: 'ASSIGNED' },
      });
    },
    { isolationLevel: 'Serializable' },
  );
  return getDelivery(id);
}

export async function transitionDelivery(id: string, status: DeliveryState) {
  await prisma.$transaction(
    async (transaction) => {
      const delivery = await transaction.delivery.findUnique({
        where: { id },
        include: {
          routeStops: {
            where: { route: { status: { in: ['PLANNED', 'ACTIVE'] } } },
            include: { route: { select: { status: true } } },
          },
        },
      });
      if (delivery === null) throw notFound('Entrega');
      if (delivery.status === status) {
        return false;
      }

      const plannedStops = delivery.routeStops.filter((stop) => stop.route.status === 'PLANNED');
      const activeStops = delivery.routeStops.filter((stop) => stop.route.status === 'ACTIVE');
      assertDeliveryRouteTransition(delivery.status, status, {
        plannedRouteCount: plannedStops.length,
        activeStopStatuses: activeStops.map((stop) => stop.status),
      });
      if (status === 'ASSIGNED' && delivery.assignedVehicleId === null) {
        throw conflict('A entrega precisa ter veículo antes de ser atribuída.');
      }

      const changedAt = new Date();
      if (activeStops.length > 0 && (status === 'DELIVERED' || status === 'FAILED')) {
        await transaction.routeStop.updateMany({
          where: { id: { in: activeStops.map((stop) => stop.id) } },
          data: {
            status: status === 'DELIVERED' ? 'COMPLETED' : 'FAILED',
            actualArrival: changedAt,
          },
        });
      }
      await transaction.delivery.update({
        where: { id },
        data: {
          status,
          ...(status === 'DELIVERED' ? { deliveredAt: changedAt } : {}),
          ...(status === 'PENDING' ? { assignedVehicleId: null, deliveredAt: null } : {}),
        },
      });
      return true;
    },
    { isolationLevel: 'Serializable' },
  );
  return getDelivery(id);
}

export async function cancelDelivery(id: string) {
  const delivery = await getDelivery(id);
  if (delivery.status === 'CANCELED') {
    return delivery;
  }
  if (delivery.routeStops.some((stop) => ['PLANNED', 'ACTIVE'].includes(stop.route.status))) {
    throw conflict(
      'Entrega vinculada a rota planejada ou ativa deve ser cancelada pelo fluxo da rota.',
    );
  }
  assertDeliveryTransition(delivery.status, 'CANCELED');
  return prisma.delivery.update({
    where: { id },
    data: { status: 'CANCELED' },
    include: deliveryInclude,
  });
}
