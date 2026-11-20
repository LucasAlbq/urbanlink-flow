import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
import { PrismaClient, type Prisma } from '../src/generated/prisma/client.js';
import { simulateFleetScenario } from '../src/modules/simulations/simulation-engine.service.js';

const databaseUrl =
  process.env.DATABASE_URL ??
  'postgresql://urbanlink:urbanlink_local@localhost:5432/urbanlink?schema=public';

if (process.env.NODE_ENV === 'production' && process.env.ALLOW_PRODUCTION_SEED !== 'true') {
  throw new Error('Seed bloqueado em produção. Defina ALLOW_PRODUCTION_SEED=true conscientemente.');
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: databaseUrl }),
});

const hoursFrom = (base: Date, hours: number): Date => new Date(base.getTime() + hours * 3_600_000);

const deliveryPoints = [
  ['Av. Paulista, 1000 - Bela Vista', -23.5614, -46.6559, 18],
  ['R. Oscar Freire, 900 - Jardins', -23.5648, -46.6722, 12],
  ['R. Augusta, 1500 - Consolação', -23.5556, -46.6595, 25],
  ['R. Haddock Lobo, 800 - Cerqueira César', -23.5585, -46.6652, 8],
  ['Av. Brigadeiro Faria Lima, 2200 - Itaim Bibi', -23.5787, -46.6861, 42],
  ['R. Clodomiro Amazonas, 700 - Itaim Bibi', -23.585, -46.6779, 14],
  ['Av. Ibirapuera, 2100 - Moema', -23.6024, -46.6617, 31],
  ['Al. dos Arapanés, 500 - Moema', -23.6056, -46.6679, 9],
  ['R. Domingos de Morais, 1800 - Vila Mariana', -23.5948, -46.6353, 55],
  ['R. Vergueiro, 2500 - Vila Mariana', -23.5904, -46.632, 16],
  ['Av. Jabaquara, 1200 - Saúde', -23.6159, -46.6389, 21],
  ['R. dos Pinheiros, 1000 - Pinheiros', -23.5669, -46.6925, 35],
  ['Av. Rebouças, 2900 - Pinheiros', -23.5682, -46.6911, 11],
  ['R. Heitor Penteado, 1400 - Vila Madalena', -23.5507, -46.6956, 28],
  ['R. Harmonia, 300 - Vila Madalena', -23.5552, -46.6902, 7],
  ['Av. Pompéia, 900 - Pompeia', -23.5304, -46.6907, 47],
  ['R. Turiassu, 1200 - Perdizes', -23.5317, -46.6769, 19],
  ['Av. Sumaré, 700 - Perdizes', -23.5426, -46.6818, 24],
  ['Av. Cruzeiro do Sul, 1800 - Santana', -23.5108, -46.6247, 33],
  ['R. Voluntários da Pátria, 2200 - Santana', -23.5011, -46.6254, 15],
  ['Av. Celso Garcia, 3000 - Tatuapé', -23.5354, -46.5708, 61],
  ['R. Itapura, 900 - Tatuapé', -23.5434, -46.5733, 13],
  ['R. da Mooca, 2600 - Mooca', -23.5583, -46.5967, 38],
  ['Av. Paes de Barros, 1700 - Mooca', -23.5653, -46.5921, 22],
] as const;

async function resetDatabase(): Promise<void> {
  await prisma.auditLog.deleteMany();
  await prisma.alert.deleteMany();
  await prisma.simulationResult.deleteMany();
  await prisma.simulation.deleteMany();
  await prisma.routeStop.deleteMany();
  await prisma.route.deleteMany();
  await prisma.delivery.deleteMany();
  await prisma.distributionCenter.deleteMany();
  await prisma.vehicle.deleteMany();
  await prisma.user.deleteMany();
}

async function main(): Promise<void> {
  await resetDatabase();
  const now = new Date();
  const passwordHash = await bcrypt.hash('UrbanLink@2026', 12);

  const [admin, manager, operator] = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Ana Martins',
        email: 'admin@urbanlink.local',
        passwordHash,
        role: 'ADMIN',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Marcos Oliveira',
        email: 'manager@urbanlink.local',
        passwordHash,
        role: 'MANAGER',
      },
    }),
    prisma.user.create({
      data: {
        name: 'Carla Santos',
        email: 'operator@urbanlink.local',
        passwordHash,
        role: 'OPERATOR',
      },
    }),
  ]);

  await prisma.distributionCenter.createMany({
    data: [
      {
        name: 'CD UrbanLink Barra Funda',
        address: 'Av. Marquês de São Vicente, 1619 - Barra Funda, São Paulo - SP',
        latitude: -23.5207,
        longitude: -46.6814,
        operatingHours: 'Seg-Sáb 06:00-22:00',
      },
      {
        name: 'CD UrbanLink Vila Prudente',
        address: 'Av. Prof. Luiz Ignácio Anhaia Mello, 1359 - Vila Prudente, São Paulo - SP',
        latitude: -23.5847,
        longitude: -46.5812,
        operatingHours: 'Todos os dias 05:00-23:00',
      },
    ],
  });
  const centers = await prisma.distributionCenter.findMany({
    orderBy: { name: 'asc' },
  });
  const barraFunda = centers.find((center) => center.name.includes('Barra Funda'))!;
  const vilaPrudente = centers.find((center) => center.name.includes('Vila Prudente'))!;

  await prisma.vehicle.createMany({
    data: [
      {
        plate: 'ULK1A01',
        model: 'Renault Master',
        type: 'VAN',
        capacityKg: 1_500,
        averageSpeedKmh: 32,
        fuelConsumption: 9.2,
        status: 'AVAILABLE',
        currentLatitude: barraFunda.latitude,
        currentLongitude: barraFunda.longitude,
      },
      {
        plate: 'ULK1A02',
        model: 'Fiat Ducato',
        type: 'VAN',
        capacityKg: 1_300,
        averageSpeedKmh: 31,
        fuelConsumption: 9.6,
        status: 'IN_ROUTE',
        currentLatitude: -23.573,
        currentLongitude: -46.674,
      },
      {
        plate: 'ULK1A03',
        model: 'Mercedes-Benz Sprinter',
        type: 'VAN',
        capacityKg: 1_800,
        averageSpeedKmh: 30,
        fuelConsumption: 8.7,
        status: 'AVAILABLE',
        currentLatitude: barraFunda.latitude,
        currentLongitude: barraFunda.longitude,
      },
      {
        plate: 'ULK1A04',
        model: 'Volkswagen Delivery 6.160',
        type: 'TRUCK',
        capacityKg: 3_500,
        averageSpeedKmh: 27,
        fuelConsumption: 6.8,
        status: 'MAINTENANCE',
      },
      {
        plate: 'ULK1A05',
        model: 'Honda CG 160 Cargo',
        type: 'MOTORCYCLE',
        capacityKg: 35,
        averageSpeedKmh: 38,
        fuelConsumption: 37,
        status: 'AVAILABLE',
        currentLatitude: vilaPrudente.latitude,
        currentLongitude: vilaPrudente.longitude,
      },
      {
        plate: 'ULK1A06',
        model: 'Renault Kangoo E-Tech',
        type: 'VAN',
        capacityKg: 650,
        averageSpeedKmh: 34,
        fuelConsumption: 14,
        status: 'AVAILABLE',
        currentLatitude: vilaPrudente.latitude,
        currentLongitude: vilaPrudente.longitude,
      },
      {
        plate: 'ULK1A07',
        model: 'Iveco Daily',
        type: 'TRUCK',
        capacityKg: 2_800,
        averageSpeedKmh: 29,
        fuelConsumption: 7.4,
        status: 'AVAILABLE',
        currentLatitude: barraFunda.latitude,
        currentLongitude: barraFunda.longitude,
      },
      {
        plate: 'ULK1A08',
        model: 'Caloi E-Vibe Cargo',
        type: 'BICYCLE',
        capacityKg: 25,
        averageSpeedKmh: 19,
        fuelConsumption: 100,
        status: 'AVAILABLE',
        currentLatitude: -23.5505,
        currentLongitude: -46.6333,
      },
    ],
  });
  const vehicles = await prisma.vehicle.findMany({ orderBy: { plate: 'asc' } });

  await prisma.delivery.createMany({
    data: deliveryPoints.map(([address, latitude, longitude, weightKg], index) => {
      const completed = index <= 6 || index === 23;
      const inTransit = index >= 7 && index <= 10;
      const assigned = index >= 11 && index <= 15;
      const failed = index === 21;
      const canceled = index === 22;
      const status = completed
        ? ('DELIVERED' as const)
        : inTransit
          ? ('IN_TRANSIT' as const)
          : assigned
            ? ('ASSIGNED' as const)
            : failed
              ? ('FAILED' as const)
              : canceled
                ? ('CANCELED' as const)
                : ('PENDING' as const);
      const assignedVehicleId =
        index <= 4
          ? vehicles[0]!.id
          : index <= 10
            ? vehicles[1]!.id
            : index <= 15
              ? vehicles[2]!.id
              : null;
      const deadlineHours = index % 6 === 0 ? -2 : 3 + (index % 8) * 2;
      const deliveredAt = completed
        ? index === 23
          ? hoursFrom(now, -1)
          : hoursFrom(now, -8 + index)
        : null;
      return {
        trackingCode: `ULF-2026-${String(index + 1).padStart(4, '0')}`,
        originCenterId: index < 18 ? barraFunda.id : vilaPrudente.id,
        destinationAddress: `${address}, São Paulo - SP`,
        destinationLatitude: latitude,
        destinationLongitude: longitude,
        weightKg,
        priority:
          index % 7 === 0
            ? ('URGENT' as const)
            : index % 4 === 0
              ? ('HIGH' as const)
              : index % 5 === 0
                ? ('LOW' as const)
                : ('NORMAL' as const),
        status,
        serviceDeadline: hoursFrom(now, deadlineHours),
        assignedVehicleId,
        estimatedArrival: canceled || failed ? null : hoursFrom(now, deadlineHours - 1),
        deliveredAt,
        createdAt:
          deliveredAt === null
            ? hoursFrom(now, -6 - (index % 4))
            : new Date(deliveredAt.getTime() - (45 + (index % 4) * 15) * 60_000),
      };
    }),
  });
  const deliveries = await prisma.delivery.findMany({
    orderBy: { trackingCode: 'asc' },
    include: { originCenter: true },
  });

  const completedRoute = await prisma.route.create({
    data: {
      vehicleId: vehicles[0]!.id,
      name: 'Rota Centro-Oeste Concluída',
      status: 'COMPLETED',
      totalDistanceKm: 24.8,
      estimatedDurationMinutes: 102,
      actualDurationMinutes: 96,
      estimatedCost: 16.69,
      estimatedCo2Kg: 6.23,
      startedAt: hoursFrom(now, -10),
      completedAt: hoursFrom(now, -8.4),
      stops: {
        create: deliveries.slice(0, 5).map((delivery, index) => ({
          deliveryId: delivery.id,
          sequence: index + 1,
          latitude: delivery.destinationLatitude,
          longitude: delivery.destinationLongitude,
          plannedArrival: hoursFrom(now, -9.7 + index * 0.3),
          actualArrival: hoursFrom(now, -9.6 + index * 0.31),
          status: 'COMPLETED',
        })),
      },
    },
  });
  const activeRoute = await prisma.route.create({
    data: {
      vehicleId: vehicles[1]!.id,
      name: 'Rota Sul em Operação',
      status: 'ACTIVE',
      totalDistanceKm: 31.4,
      estimatedDurationMinutes: 138,
      estimatedCost: 20.25,
      estimatedCo2Kg: 7.56,
      startedAt: hoursFrom(now, -1.2),
      stops: {
        create: deliveries.slice(5, 11).map((delivery, index) => ({
          deliveryId: delivery.id,
          sequence: index + 1,
          latitude: delivery.destinationLatitude,
          longitude: delivery.destinationLongitude,
          plannedArrival: hoursFrom(now, -0.9 + index * 0.35),
          actualArrival: index < 2 ? hoursFrom(now, -0.8 + index * 0.36) : null,
          status: index < 2 ? 'COMPLETED' : index === 2 ? 'ARRIVED' : 'PENDING',
        })),
      },
    },
  });
  const plannedRoute = await prisma.route.create({
    data: {
      vehicleId: vehicles[2]!.id,
      name: 'Rota Oeste Planejada',
      status: 'PLANNED',
      totalDistanceKm: 27.1,
      estimatedDurationMinutes: 119,
      estimatedCost: 19.28,
      estimatedCo2Kg: 7.19,
      stops: {
        create: deliveries.slice(11, 16).map((delivery, index) => ({
          deliveryId: delivery.id,
          sequence: index + 1,
          latitude: delivery.destinationLatitude,
          longitude: delivery.destinationLongitude,
          plannedArrival: hoursFrom(now, 0.7 + index * 0.4),
          status: 'PENDING',
        })),
      },
    },
  });

  const criticalTrafficResult = simulateFleetScenario(deliveries.slice(16, 24), {
    availableVehicles: 4,
    capacityKgPerVehicle: 1_200,
    averageSpeedKmh: 22,
    trafficLevel: 'CRITICAL',
    fuelPrice: 6.19,
    co2Factor: 2.31,
    fuelConsumptionKmPerLiter: 9.5,
    serviceMinutesPerStop: 8,
    returnToOrigin: false,
    startedAt: now,
  });
  const electricFleetResult = simulateFleetScenario(
    deliveries.filter((delivery) =>
      ['PENDING', 'ASSIGNED', 'IN_TRANSIT'].includes(delivery.status),
    ),
    {
      availableVehicles: 6,
      capacityKgPerVehicle: 900,
      averageSpeedKmh: 31,
      trafficLevel: 'MODERATE',
      fuelPrice: 6.19,
      co2Factor: 1.4,
      fuelConsumptionKmPerLiter: 14,
      serviceMinutesPerStop: 7,
      returnToOrigin: false,
      startedAt: now,
    },
  );
  const jsonResult = (result: typeof criticalTrafficResult) => ({
    ...result,
    routeData: result.routeData as unknown as Prisma.InputJsonValue,
  });

  await Promise.all([
    prisma.simulation.create({
      data: {
        userId: manager.id,
        name: 'Trânsito crítico no pico da tarde',
        trafficLevel: 'CRITICAL',
        availableVehicles: 4,
        averageSpeedKmh: 22,
        fuelPrice: 6.19,
        co2Factor: 2.31,
        parameters: {
          capacityKgPerVehicle: 1200,
          serviceMinutesPerStop: 8,
          fuelConsumptionKmPerLiter: 9.5,
          returnToOrigin: false,
          deliveryIds: deliveries.slice(16, 24).map((delivery) => delivery.id),
        },
        status: 'COMPLETED',
        result: {
          create: jsonResult(criticalTrafficResult),
        },
      },
    }),
    prisma.simulation.create({
      data: {
        userId: admin.id,
        name: 'Frota elétrica e trânsito moderado',
        trafficLevel: 'MODERATE',
        availableVehicles: 6,
        averageSpeedKmh: 31,
        fuelPrice: 6.19,
        co2Factor: 1.4,
        parameters: {
          capacityKgPerVehicle: 900,
          serviceMinutesPerStop: 7,
          fuelConsumptionKmPerLiter: 14,
          returnToOrigin: false,
        },
        status: 'COMPLETED',
        result: {
          create: jsonResult(electricFleetResult),
        },
      },
    }),
  ]);

  await prisma.alert.createMany({
    data: [
      {
        severity: 'WARNING',
        status: 'OPEN',
        title: 'Entrega próxima do prazo',
        message: 'A entrega ULF-2026-0008 está próxima do prazo de serviço.',
        routeId: activeRoute.id,
        deliveryId: deliveries[7]!.id,
        vehicleId: vehicles[1]!.id,
      },
      {
        severity: 'CRITICAL',
        status: 'OPEN',
        title: 'Veículo em manutenção',
        message: 'O veículo ULK1A04 está indisponível para novas rotas.',
        vehicleId: vehicles[3]!.id,
      },
      {
        severity: 'INFO',
        status: 'RESOLVED',
        title: 'Rota concluída',
        message: 'A rota Centro-Oeste foi concluída com todas as paradas atendidas.',
        routeId: completedRoute.id,
        vehicleId: vehicles[0]!.id,
        resolvedAt: hoursFrom(now, -8),
      },
    ],
  });

  await prisma.auditLog.createMany({
    data: [
      {
        userId: admin.id,
        action: 'SEED_EXECUTED',
        entity: 'System',
        metadata: { city: 'São Paulo', version: 1 },
      },
      {
        userId: manager.id,
        action: 'ROUTE_CREATED',
        entity: 'Route',
        entityId: plannedRoute.id,
      },
      {
        userId: operator.id,
        action: 'ROUTE_STARTED',
        entity: 'Route',
        entityId: activeRoute.id,
      },
    ],
  });

  console.info('Seed UrbanLink concluído.');
  console.info(
    'Usuários: admin@urbanlink.local, manager@urbanlink.local, operator@urbanlink.local',
  );
  console.info('Senha local comum: UrbanLink@2026');
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
