import { describe, expect, it } from 'vitest';
import {
  assertDeliveriesAvailableForNewRoute,
  assertDeliveriesReadyForRouteStart,
  assertDeliveryRouteTransition,
  assertDeliveryTransition,
  assertRouteTransition,
  assertVehicleCapacity,
  assertVehicleUpdateIntegrity,
  resolveVehicleStatusAfterRouteEnd,
} from '../src/services/route-rules.service.js';

describe('route-rules.service', () => {
  it('aceita carga exatamente igual à capacidade', () => {
    expect(() => assertVehicleCapacity(100, [20, 30, 50])).not.toThrow();
  });

  it('impede sobrecarga do veículo', () => {
    expect(() => assertVehicleCapacity(100, [60, 41])).toThrow('Capacidade excedida');
  });

  it('impede entrega concluída de voltar para pendente', () => {
    expect(() => assertDeliveryTransition('DELIVERED', 'PENDING')).toThrow(
      'Transição de entrega inválida',
    );
  });

  it('impede reiniciar rota concluída', () => {
    expect(() => assertRouteTransition('COMPLETED', 'ACTIVE')).toThrow(
      'Transição de rota inválida',
    );
  });

  it('aceita o fluxo planejada → ativa → concluída', () => {
    expect(() => assertRouteTransition('PLANNED', 'ACTIVE')).not.toThrow();
    expect(() => assertRouteTransition('ACTIVE', 'COMPLETED')).not.toThrow();
  });

  it('impede reutilizar entrega vinculada a rota vigente', () => {
    expect(() =>
      assertDeliveriesAvailableForNewRoute(
        [
          {
            id: 'delivery-1',
            status: 'ASSIGNED',
            assignedVehicleId: 'vehicle-1',
            activeRouteIds: ['route-planned'],
          },
        ],
        'vehicle-1',
      ),
    ).toThrow('já pertencem a outra rota');
  });

  it('permite reutilização coerente após vínculo apenas histórico', () => {
    expect(() =>
      assertDeliveriesAvailableForNewRoute(
        [
          {
            id: 'delivery-1',
            status: 'PENDING',
            assignedVehicleId: null,
            activeRouteIds: [],
          },
        ],
        'vehicle-1',
      ),
    ).not.toThrow();
  });

  it.each(['CANCELED', 'DELIVERED', 'PENDING'] as const)(
    'impede iniciar rota com entrega em estado %s',
    (status) => {
      expect(() =>
        assertDeliveriesReadyForRouteStart(
          [
            {
              id: 'delivery-1',
              status,
              assignedVehicleId: 'vehicle-1',
            },
          ],
          'vehicle-1',
        ),
      ).toThrow('continuar atribuídas');
    },
  );

  it('impede iniciar rota quando a atribuição mudou de veículo', () => {
    expect(() =>
      assertDeliveriesReadyForRouteStart(
        [
          {
            id: 'delivery-1',
            status: 'ASSIGNED',
            assignedVehicleId: 'vehicle-2',
          },
        ],
        'vehicle-1',
      ),
    ).toThrow('continuar atribuídas');
  });

  it('considera carga acumulada sem contar novamente entregas selecionadas', () => {
    const loadOutsideNewRoute = 55;
    const newRouteWeights = [25, 20];
    expect(() =>
      assertVehicleCapacity(100, [loadOutsideNewRoute, ...newRouteWeights]),
    ).not.toThrow();
    expect(() => assertVehicleCapacity(99, [loadOutsideNewRoute, ...newRouteWeights])).toThrow(
      'Capacidade excedida',
    );
  });

  it('mantém IN_ROUTE ao encerrar uma rota se existe outra ativa', () => {
    expect(resolveVehicleStatusAfterRouteEnd('IN_ROUTE', true)).toBe('IN_ROUTE');
    expect(resolveVehicleStatusAfterRouteEnd('IN_ROUTE', false)).toBe('AVAILABLE');
  });

  it('impede reduzir capacidade abaixo da carga vigente', () => {
    expect(() =>
      assertVehicleUpdateIntegrity({
        currentStatus: 'AVAILABLE',
        currentCapacityKg: 100,
        requestedCapacityKg: 79,
        operationalLoadKg: 80,
        plannedRouteCount: 1,
        activeRouteCount: 0,
      }),
    ).toThrow('Capacidade excedida');
  });

  it('impede indisponibilizar veículo com rota planejada', () => {
    expect(() =>
      assertVehicleUpdateIntegrity({
        currentStatus: 'AVAILABLE',
        requestedStatus: 'MAINTENANCE',
        currentCapacityKg: 100,
        operationalLoadKg: 40,
        plannedRouteCount: 1,
        activeRouteCount: 0,
      }),
    ).toThrow('rota ou carga operacional');
  });

  it('exige coerência entre ACTIVE e status IN_ROUTE do veículo', () => {
    expect(() =>
      assertVehicleUpdateIntegrity({
        currentStatus: 'IN_ROUTE',
        requestedStatus: 'AVAILABLE',
        currentCapacityKg: 100,
        operationalLoadKg: 40,
        plannedRouteCount: 0,
        activeRouteCount: 1,
      }),
    ).toThrow('deve permanecer');
    expect(() =>
      assertVehicleUpdateIntegrity({
        currentStatus: 'AVAILABLE',
        requestedStatus: 'IN_ROUTE',
        currentCapacityKg: 100,
        operationalLoadKg: 0,
        plannedRouteCount: 0,
        activeRouteCount: 0,
      }),
    ).toThrow('sem rota ativa');
  });

  it('bloqueia transição isolada de entrega em rota planejada', () => {
    expect(() =>
      assertDeliveryRouteTransition('ASSIGNED', 'IN_TRANSIT', {
        plannedRouteCount: 1,
        activeStopStatuses: [],
      }),
    ).toThrow('fluxo da rota');
  });

  it('permite sincronizar entrega e parada de rota ativa', () => {
    expect(() =>
      assertDeliveryRouteTransition('IN_TRANSIT', 'DELIVERED', {
        plannedRouteCount: 0,
        activeStopStatuses: ['PENDING'],
      }),
    ).not.toThrow();
    expect(() =>
      assertDeliveryRouteTransition('IN_TRANSIT', 'FAILED', {
        plannedRouteCount: 0,
        activeStopStatuses: ['ARRIVED'],
      }),
    ).not.toThrow();
  });

  it('trata repetição de estado terminal como idempotente', () => {
    expect(() =>
      assertDeliveryRouteTransition('DELIVERED', 'DELIVERED', {
        plannedRouteCount: 1,
        activeStopStatuses: ['COMPLETED'],
      }),
    ).not.toThrow();
  });
});
