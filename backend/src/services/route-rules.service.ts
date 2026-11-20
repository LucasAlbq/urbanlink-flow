import { badRequest, conflict } from '../shared/errors.js';

export type DeliveryState =
  'PENDING' | 'ASSIGNED' | 'IN_TRANSIT' | 'DELIVERED' | 'FAILED' | 'CANCELED';
export type RouteState = 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'CANCELED';
export type VehicleState = 'AVAILABLE' | 'IN_ROUTE' | 'MAINTENANCE' | 'INACTIVE';
export type RouteStopState = 'PENDING' | 'ARRIVED' | 'COMPLETED' | 'SKIPPED' | 'FAILED';

interface RouteLinkedDelivery {
  id: string;
  status: DeliveryState;
  assignedVehicleId: string | null;
  activeRouteIds: readonly string[];
}

interface VehicleUpdateContext {
  currentStatus: VehicleState;
  requestedStatus?: VehicleState;
  currentCapacityKg: number;
  requestedCapacityKg?: number;
  operationalLoadKg: number;
  plannedRouteCount: number;
  activeRouteCount: number;
}

const DELIVERY_TRANSITIONS: Readonly<Record<DeliveryState, readonly DeliveryState[]>> = {
  PENDING: ['ASSIGNED', 'CANCELED'],
  ASSIGNED: ['PENDING', 'IN_TRANSIT', 'CANCELED'],
  IN_TRANSIT: ['DELIVERED', 'FAILED'],
  DELIVERED: [],
  FAILED: ['PENDING', 'CANCELED'],
  CANCELED: [],
};

const ROUTE_TRANSITIONS: Readonly<Record<RouteState, readonly RouteState[]>> = {
  PLANNED: ['ACTIVE', 'CANCELED'],
  ACTIVE: ['COMPLETED', 'CANCELED'],
  COMPLETED: [],
  CANCELED: [],
};

export function assertDeliveryTransition(current: DeliveryState, next: DeliveryState): void {
  if (current === next) {
    return;
  }
  if (!DELIVERY_TRANSITIONS[current].includes(next)) {
    throw conflict(`Transição de entrega inválida: ${current} → ${next}.`);
  }
}

export function assertDeliveryRouteTransition(
  current: DeliveryState,
  next: DeliveryState,
  context: {
    plannedRouteCount: number;
    activeStopStatuses: readonly RouteStopState[];
  },
): void {
  assertDeliveryTransition(current, next);
  if (current === next) {
    return;
  }
  if (context.plannedRouteCount > 0) {
    throw conflict('Entrega vinculada a rota planejada deve ser movimentada pelo fluxo da rota.');
  }
  if (context.activeStopStatuses.length === 0) {
    return;
  }

  const targetStopStatus = next === 'DELIVERED' ? 'COMPLETED' : next === 'FAILED' ? 'FAILED' : null;
  if (current !== 'IN_TRANSIT' || targetStopStatus === null) {
    throw conflict('Entrega vinculada a rota ativa só pode ser concluída ou marcada como falha.');
  }
  if (
    context.activeStopStatuses.some(
      (status) => !['PENDING', 'ARRIVED', targetStopStatus].includes(status),
    )
  ) {
    throw conflict('A parada ativa já possui estado terminal incompatível com a entrega.');
  }
}

export function assertRouteTransition(current: RouteState, next: RouteState): void {
  if (current === next) {
    return;
  }
  if (!ROUTE_TRANSITIONS[current].includes(next)) {
    throw conflict(`Transição de rota inválida: ${current} → ${next}.`);
  }
}

export function assertVehicleCapacity(
  capacityKg: number,
  deliveryWeightsKg: readonly number[],
): void {
  const totalWeight = deliveryWeightsKg.reduce((sum, weight) => sum + weight, 0);
  if (totalWeight > capacityKg + Number.EPSILON) {
    throw conflict(
      `Capacidade excedida: ${totalWeight.toFixed(2)} kg para ${capacityKg.toFixed(2)} kg disponíveis.`,
    );
  }
}

export function assertDeliveriesAvailableForNewRoute(
  deliveries: readonly RouteLinkedDelivery[],
  vehicleId: string,
): void {
  if (deliveries.some((delivery) => delivery.activeRouteIds.length > 0)) {
    throw conflict('Uma ou mais entregas já pertencem a outra rota planejada ou ativa.');
  }
  if (
    deliveries.some(
      (delivery) =>
        !['PENDING', 'ASSIGNED'].includes(delivery.status) ||
        (delivery.assignedVehicleId !== null && delivery.assignedVehicleId !== vehicleId),
    )
  ) {
    throw conflict('Todas as entregas devem estar disponíveis para o veículo escolhido.');
  }
}

export function assertDeliveriesReadyForRouteStart(
  deliveries: readonly Pick<RouteLinkedDelivery, 'id' | 'status' | 'assignedVehicleId'>[],
  vehicleId: string,
): void {
  const invalid = deliveries.find(
    (delivery) => delivery.status !== 'ASSIGNED' || delivery.assignedVehicleId !== vehicleId,
  );
  if (invalid !== undefined) {
    throw conflict(
      'A rota não pode ser iniciada: todas as entregas devem continuar atribuídas ao veículo da rota.',
    );
  }
}

export function assertVehicleUpdateIntegrity(context: VehicleUpdateContext): void {
  const nextStatus = context.requestedStatus ?? context.currentStatus;
  const nextCapacity = context.requestedCapacityKg ?? context.currentCapacityKg;
  const currentRouteCount = context.plannedRouteCount + context.activeRouteCount;

  assertVehicleCapacity(nextCapacity, [context.operationalLoadKg]);

  if (context.activeRouteCount > 0 && nextStatus !== 'IN_ROUTE') {
    throw conflict('Veículo com rota ativa deve permanecer com status IN_ROUTE.');
  }
  if (context.activeRouteCount === 0 && nextStatus === 'IN_ROUTE') {
    throw conflict('Veículo sem rota ativa não pode receber status IN_ROUTE.');
  }
  if (
    (nextStatus === 'MAINTENANCE' || nextStatus === 'INACTIVE') &&
    (currentRouteCount > 0 || context.operationalLoadKg > 0)
  ) {
    throw conflict('Veículo com rota ou carga operacional vigente não pode ser indisponibilizado.');
  }
}

export function resolveVehicleStatusAfterRouteEnd(
  currentStatus: VehicleState,
  hasAnotherActiveRoute: boolean,
): VehicleState {
  if (hasAnotherActiveRoute) {
    return 'IN_ROUTE';
  }
  if (currentStatus === 'MAINTENANCE' || currentStatus === 'INACTIVE') {
    return currentStatus;
  }
  return 'AVAILABLE';
}

export function assertPositiveCoordinates(latitude: number, longitude: number): void {
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
    throw badRequest('Coordenadas geográficas inválidas.');
  }
}
