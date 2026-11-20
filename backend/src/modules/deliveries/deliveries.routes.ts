import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { recordAudit } from '../../services/audit.service.js';
import { asyncHandler } from '../../shared/async-handler.js';
import { sendSuccess } from '../../shared/http.js';
import { idParamsSchema } from '../../shared/schemas.js';
import {
  assignDeliverySchema,
  createDeliverySchema,
  listDeliveriesQuerySchema,
  updateDeliverySchema,
  updateDeliveryStatusSchema,
} from './deliveries.schemas.js';
import {
  assignDelivery,
  cancelDelivery,
  createDelivery,
  getDelivery,
  listDeliveries,
  transitionDelivery,
  updateDelivery,
} from './deliveries.service.js';

export const deliveriesRouter = Router();
deliveriesRouter.use(authenticate);

deliveriesRouter.get(
  '/',
  validate({ query: listDeliveriesQuerySchema }),
  asyncHandler(async (request, response) => {
    const result = await listDeliveries(listDeliveriesQuerySchema.parse(request.query));
    sendSuccess(response, result.items, 200, result.meta);
  }),
);
deliveriesRouter.get(
  '/:id',
  validate({ params: idParamsSchema }),
  asyncHandler(async (request, response) => {
    const { id } = idParamsSchema.parse(request.params);
    sendSuccess(response, await getDelivery(id));
  }),
);
deliveriesRouter.post(
  '/',
  authorize('ADMIN', 'MANAGER'),
  validate({ body: createDeliverySchema }),
  asyncHandler(async (request, response) => {
    const input = createDeliverySchema.parse(request.body);
    const delivery = await createDelivery(input);
    await recordAudit({
      request,
      action: 'DELIVERY_CREATED',
      entity: 'Delivery',
      entityId: delivery.id,
    });
    sendSuccess(response, delivery, 201);
  }),
);
deliveriesRouter.patch(
  '/:id',
  authorize('ADMIN', 'MANAGER'),
  validate({ params: idParamsSchema, body: updateDeliverySchema }),
  asyncHandler(async (request, response) => {
    const { id } = idParamsSchema.parse(request.params);
    const input = updateDeliverySchema.parse(request.body);
    const delivery = await updateDelivery(id, input);
    await recordAudit({
      request,
      action: 'DELIVERY_UPDATED',
      entity: 'Delivery',
      entityId: delivery.id,
    });
    sendSuccess(response, delivery);
  }),
);
deliveriesRouter.post(
  '/:id/assign',
  authorize('ADMIN', 'MANAGER'),
  validate({ params: idParamsSchema, body: assignDeliverySchema }),
  asyncHandler(async (request, response) => {
    const { id } = idParamsSchema.parse(request.params);
    const { vehicleId } = assignDeliverySchema.parse(request.body);
    const delivery = await assignDelivery(id, vehicleId);
    await recordAudit({
      request,
      action: 'DELIVERY_ASSIGNED',
      entity: 'Delivery',
      entityId: delivery.id,
      metadata: { vehicleId },
    });
    sendSuccess(response, delivery);
  }),
);
deliveriesRouter.patch(
  '/:id/status',
  authorize('ADMIN', 'MANAGER', 'OPERATOR'),
  validate({ params: idParamsSchema, body: updateDeliveryStatusSchema }),
  asyncHandler(async (request, response) => {
    const { id } = idParamsSchema.parse(request.params);
    const { status } = updateDeliveryStatusSchema.parse(request.body);
    const delivery = await transitionDelivery(id, status);
    await recordAudit({
      request,
      action: 'DELIVERY_STATUS_CHANGED',
      entity: 'Delivery',
      entityId: delivery.id,
      metadata: { status },
    });
    sendSuccess(response, delivery);
  }),
);
deliveriesRouter.delete(
  '/:id',
  authorize('ADMIN', 'MANAGER'),
  validate({ params: idParamsSchema }),
  asyncHandler(async (request, response) => {
    const { id } = idParamsSchema.parse(request.params);
    const delivery = await cancelDelivery(id);
    await recordAudit({
      request,
      action: 'DELIVERY_CANCELED',
      entity: 'Delivery',
      entityId: delivery.id,
    });
    sendSuccess(response, delivery);
  }),
);
