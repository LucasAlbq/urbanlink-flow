import { describe, expect, it } from 'vitest';
import { optimizeRouteSchema } from '../src/modules/routes/routes.schemas.js';
import { buildRouteListArgs, mergeRouteCalculation } from '../src/modules/routes/routes.service.js';

describe('contrato da listagem de rotas', () => {
  it('mantém paradas completas e entregas no retorno', () => {
    const args = buildRouteListArgs({
      page: 1,
      pageSize: 20,
      sortOrder: 'desc',
      sortBy: 'createdAt',
    });

    expect(args.include).toMatchObject({
      vehicle: true,
      stops: {
        orderBy: { sequence: 'asc' },
        include: {
          delivery: {
            include: {
              originCenter: {
                select: {
                  id: true,
                  name: true,
                  latitude: true,
                  longitude: true,
                },
              },
            },
          },
        },
      },
    });
  });

  it('mantém os parâmetros persistidos ao otimizar com corpo vazio', () => {
    const persisted = {
      trafficLevel: 'CRITICAL' as const,
      fuelPrice: 7.45,
      co2Factor: 2.73,
      serviceMinutesPerStop: 17,
    };
    const overrides = optimizeRouteSchema.parse({});

    expect(overrides).toEqual({});
    expect(mergeRouteCalculation(persisted, overrides)).toEqual(persisted);
  });

  it('mescla somente os parâmetros informados na reotimização', () => {
    const persisted = {
      trafficLevel: 'HIGH' as const,
      fuelPrice: 6.75,
      co2Factor: 2.45,
      serviceMinutesPerStop: 11,
    };
    const overrides = optimizeRouteSchema.parse({ fuelPrice: '7.10' });

    expect(mergeRouteCalculation(persisted, overrides)).toEqual({
      ...persisted,
      fuelPrice: 7.1,
    });
  });
});
