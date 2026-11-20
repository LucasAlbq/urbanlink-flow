import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { recordAudit } from '../../services/audit.service.js';
import { asyncHandler } from '../../shared/async-handler.js';
import { sendSuccess } from '../../shared/http.js';
import { idParamsSchema } from '../../shared/schemas.js';
import {
  createCenterSchema,
  listCentersQuerySchema,
  updateCenterSchema,
} from './distribution-centers.schemas.js';
import {
  createCenter,
  deleteCenter,
  getCenter,
  listCenters,
  updateCenter,
} from './distribution-centers.service.js';

export const distributionCentersRouter = Router();
distributionCentersRouter.use(authenticate);

distributionCentersRouter.get(
  '/',
  validate({ query: listCentersQuerySchema }),
  asyncHandler(async (request, response) => {
    const result = await listCenters(listCentersQuerySchema.parse(request.query));
    sendSuccess(response, result.items, 200, result.meta);
  }),
);
distributionCentersRouter.get(
  '/:id',
  validate({ params: idParamsSchema }),
  asyncHandler(async (request, response) => {
    const { id } = idParamsSchema.parse(request.params);
    sendSuccess(response, await getCenter(id));
  }),
);
distributionCentersRouter.post(
  '/',
  authorize('ADMIN', 'MANAGER'),
  validate({ body: createCenterSchema }),
  asyncHandler(async (request, response) => {
    const input = createCenterSchema.parse(request.body);
    const center = await createCenter(input);
    await recordAudit({
      request,
      action: 'CENTER_CREATED',
      entity: 'DistributionCenter',
      entityId: center.id,
    });
    sendSuccess(response, center, 201);
  }),
);
distributionCentersRouter.patch(
  '/:id',
  authorize('ADMIN', 'MANAGER'),
  validate({ params: idParamsSchema, body: updateCenterSchema }),
  asyncHandler(async (request, response) => {
    const { id } = idParamsSchema.parse(request.params);
    const input = updateCenterSchema.parse(request.body);
    const center = await updateCenter(id, input);
    await recordAudit({
      request,
      action: 'CENTER_UPDATED',
      entity: 'DistributionCenter',
      entityId: center.id,
    });
    sendSuccess(response, center);
  }),
);
distributionCentersRouter.delete(
  '/:id',
  authorize('ADMIN'),
  validate({ params: idParamsSchema }),
  asyncHandler(async (request, response) => {
    const { id } = idParamsSchema.parse(request.params);
    await deleteCenter(id);
    await recordAudit({
      request,
      action: 'CENTER_DELETED',
      entity: 'DistributionCenter',
      entityId: id,
    });
    response.status(204).send();
  }),
);
