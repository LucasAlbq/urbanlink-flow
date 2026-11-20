import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { recordAudit } from '../../services/audit.service.js';
import { asyncHandler } from '../../shared/async-handler.js';
import { sendSuccess } from '../../shared/http.js';
import { idParamsSchema } from '../../shared/schemas.js';
import {
  createVehicleSchema,
  listVehiclesQuerySchema,
  updateVehicleSchema,
} from './vehicles.schemas.js';
import {
  createVehicle,
  deactivateVehicle,
  getVehicle,
  listVehicles,
  updateVehicle,
} from './vehicles.service.js';

export const vehiclesRouter = Router();
vehiclesRouter.use(authenticate);

vehiclesRouter.get(
  '/',
  validate({ query: listVehiclesQuerySchema }),
  asyncHandler(async (request, response) => {
    const result = await listVehicles(listVehiclesQuerySchema.parse(request.query));
    sendSuccess(response, result.items, 200, result.meta);
  }),
);
vehiclesRouter.get(
  '/:id',
  validate({ params: idParamsSchema }),
  asyncHandler(async (request, response) => {
    const { id } = idParamsSchema.parse(request.params);
    sendSuccess(response, await getVehicle(id));
  }),
);
vehiclesRouter.post(
  '/',
  authorize('ADMIN', 'MANAGER'),
  validate({ body: createVehicleSchema }),
  asyncHandler(async (request, response) => {
    const input = createVehicleSchema.parse(request.body);
    const vehicle = await createVehicle(input);
    await recordAudit({
      request,
      action: 'VEHICLE_CREATED',
      entity: 'Vehicle',
      entityId: vehicle.id,
    });
    sendSuccess(response, vehicle, 201);
  }),
);
vehiclesRouter.patch(
  '/:id',
  authorize('ADMIN', 'MANAGER'),
  validate({ params: idParamsSchema, body: updateVehicleSchema }),
  asyncHandler(async (request, response) => {
    const { id } = idParamsSchema.parse(request.params);
    const input = updateVehicleSchema.parse(request.body);
    const vehicle = await updateVehicle(id, input);
    await recordAudit({
      request,
      action: 'VEHICLE_UPDATED',
      entity: 'Vehicle',
      entityId: vehicle.id,
    });
    sendSuccess(response, vehicle);
  }),
);
vehiclesRouter.delete(
  '/:id',
  authorize('ADMIN', 'MANAGER'),
  validate({ params: idParamsSchema }),
  asyncHandler(async (request, response) => {
    const { id } = idParamsSchema.parse(request.params);
    const vehicle = await deactivateVehicle(id);
    await recordAudit({
      request,
      action: 'VEHICLE_DEACTIVATED',
      entity: 'Vehicle',
      entityId: vehicle.id,
    });
    sendSuccess(response, vehicle);
  }),
);
