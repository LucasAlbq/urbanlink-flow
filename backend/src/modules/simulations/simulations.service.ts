import type { Prisma } from '../../generated/prisma/client.js';
import { prisma } from '../../lib/prisma.js';
import { conflict, notFound } from '../../shared/errors.js';
import { paginationMeta } from '../../shared/http.js';
import { simulateFleetScenario } from './simulation-engine.service.js';
import {
  simulationParametersSchema,
  type CreateSimulationInput,
  type ListSimulationsQuery,
  type UpdateSimulationInput,
} from './simulations.schemas.js';

interface AuthContext {
  id: string;
  role: 'ADMIN' | 'MANAGER' | 'OPERATOR';
}

export async function listSimulations(query: ListSimulationsQuery, actor: AuthContext) {
  const where: Prisma.SimulationWhereInput = {
    ...(query.status === undefined ? {} : { status: query.status }),
    ...(query.userId === undefined ? {} : { userId: query.userId }),
    ...(actor.role === 'OPERATOR' ? { userId: actor.id } : {}),
    ...(query.search === undefined
      ? {}
      : { name: { contains: query.search, mode: 'insensitive' } }),
  };
  const [items, total] = await prisma.$transaction([
    prisma.simulation.findMany({
      where,
      include: { user: { select: { id: true, name: true } }, result: true },
      orderBy: { [query.sortBy]: query.sortOrder },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
    prisma.simulation.count({ where }),
  ]);
  return { items, meta: paginationMeta(query.page, query.pageSize, total) };
}

export async function getSimulation(id: string, actor?: AuthContext) {
  const simulation = await prisma.simulation.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true } },
      result: true,
    },
  });
  if (simulation === null) throw notFound('Simulação');
  if (actor?.role === 'OPERATOR' && simulation.userId !== actor.id) {
    throw notFound('Simulação');
  }
  return simulation;
}

export const createSimulation = (input: CreateSimulationInput, userId: string) =>
  prisma.simulation.create({
    data: {
      userId,
      name: input.name,
      trafficLevel: input.trafficLevel,
      availableVehicles: input.availableVehicles,
      averageSpeedKmh: input.averageSpeedKmh,
      fuelPrice: input.fuelPrice,
      co2Factor: input.co2Factor,
      parameters: input.parameters,
    },
    include: { result: true },
  });

export async function updateSimulation(id: string, input: UpdateSimulationInput) {
  const simulation = await getSimulation(id);
  if (simulation.status !== 'DRAFT' && simulation.status !== 'FAILED') {
    throw conflict('Somente simulações em rascunho ou com falha podem ser alteradas.');
  }
  return prisma.simulation.update({
    where: { id },
    data: {
      name: input.name,
      trafficLevel: input.trafficLevel,
      availableVehicles: input.availableVehicles,
      averageSpeedKmh: input.averageSpeedKmh,
      fuelPrice: input.fuelPrice,
      co2Factor: input.co2Factor,
      parameters: input.parameters,
      status: 'DRAFT',
    },
    include: { result: true },
  });
}

export async function deleteSimulation(id: string) {
  const simulation = await getSimulation(id);
  if (simulation.status === 'RUNNING') {
    throw conflict('Uma simulação em execução não pode ser excluída.');
  }
  await prisma.simulation.delete({ where: { id } });
}

export async function runSimulation(id: string) {
  const simulation = await getSimulation(id);
  if (simulation.status === 'RUNNING') {
    throw conflict('A simulação já está em execução.');
  }
  await prisma.simulation.update({
    where: { id },
    data: { status: 'RUNNING' },
  });

  try {
    const parameters = simulationParametersSchema.parse(simulation.parameters);
    const deliveries = await prisma.delivery.findMany({
      where: {
        ...(parameters.deliveryIds === undefined
          ? { status: { in: ['PENDING', 'ASSIGNED', 'IN_TRANSIT'] } }
          : { id: { in: parameters.deliveryIds } }),
      },
      include: { originCenter: true },
      orderBy: [{ priority: 'desc' }, { serviceDeadline: 'asc' }],
      take: parameters.deliveryIds === undefined ? 30 : undefined,
    });
    if (deliveries.length < 2) {
      throw conflict('A simulação precisa de ao menos duas entregas válidas.');
    }
    const resultData = simulateFleetScenario(deliveries, {
      availableVehicles: simulation.availableVehicles,
      capacityKgPerVehicle: parameters.capacityKgPerVehicle,
      averageSpeedKmh: simulation.averageSpeedKmh,
      trafficLevel: simulation.trafficLevel,
      fuelPrice: simulation.fuelPrice,
      co2Factor: simulation.co2Factor,
      fuelConsumptionKmPerLiter: parameters.fuelConsumptionKmPerLiter,
      serviceMinutesPerStop: parameters.serviceMinutesPerStop,
      returnToOrigin: parameters.returnToOrigin,
    });
    if (resultData.routeData.selectedDeliveries < 2) {
      throw conflict('A capacidade disponível não atende duas entregas.');
    }
    const persistedResult = {
      ...resultData,
      routeData: resultData.routeData as unknown as Prisma.InputJsonValue,
    };

    await prisma.$transaction([
      prisma.simulationResult.upsert({
        where: { simulationId: id },
        create: { simulationId: id, ...persistedResult },
        update: persistedResult,
      }),
      prisma.simulation.update({
        where: { id },
        data: { status: 'COMPLETED' },
      }),
    ]);
    return getSimulation(id);
  } catch (error) {
    await prisma.simulation.update({
      where: { id },
      data: { status: 'FAILED' },
    });
    throw error;
  }
}
