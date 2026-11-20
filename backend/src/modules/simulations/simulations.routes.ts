import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { recordAudit } from '../../services/audit.service.js';
import { asyncHandler } from '../../shared/async-handler.js';
import { sendSuccess } from '../../shared/http.js';
import { idParamsSchema } from '../../shared/schemas.js';
import {
  createSimulationSchema,
  listSimulationsQuerySchema,
  updateSimulationSchema,
} from './simulations.schemas.js';
import {
  createSimulation,
  deleteSimulation,
  getSimulation,
  listSimulations,
  runSimulation,
  updateSimulation,
} from './simulations.service.js';

export const simulationsRouter = Router();
simulationsRouter.use(authenticate);

simulationsRouter.get(
  '/',
  validate({ query: listSimulationsQuerySchema }),
  asyncHandler(async (request, response) => {
    const result = await listSimulations(
      listSimulationsQuerySchema.parse(request.query),
      request.auth!,
    );
    sendSuccess(response, result.items, 200, result.meta);
  }),
);
simulationsRouter.get(
  '/:id',
  validate({ params: idParamsSchema }),
  asyncHandler(async (request, response) => {
    const { id } = idParamsSchema.parse(request.params);
    sendSuccess(response, await getSimulation(id, request.auth));
  }),
);
simulationsRouter.get(
  '/:id/results',
  validate({ params: idParamsSchema }),
  asyncHandler(async (request, response) => {
    const { id } = idParamsSchema.parse(request.params);
    const simulation = await getSimulation(id, request.auth);
    sendSuccess(response, simulation.result);
  }),
);
simulationsRouter.post(
  '/',
  authorize('ADMIN', 'MANAGER'),
  validate({ body: createSimulationSchema }),
  asyncHandler(async (request, response) => {
    const input = createSimulationSchema.parse(request.body);
    const simulation = await createSimulation(input, request.auth!.id);
    await recordAudit({
      request,
      action: 'SIMULATION_CREATED',
      entity: 'Simulation',
      entityId: simulation.id,
    });
    sendSuccess(response, simulation, 201);
  }),
);
simulationsRouter.patch(
  '/:id',
  authorize('ADMIN', 'MANAGER'),
  validate({ params: idParamsSchema, body: updateSimulationSchema }),
  asyncHandler(async (request, response) => {
    const { id } = idParamsSchema.parse(request.params);
    const input = updateSimulationSchema.parse(request.body);
    const simulation = await updateSimulation(id, input);
    await recordAudit({
      request,
      action: 'SIMULATION_UPDATED',
      entity: 'Simulation',
      entityId: simulation.id,
    });
    sendSuccess(response, simulation);
  }),
);
simulationsRouter.post(
  '/:id/run',
  authorize('ADMIN', 'MANAGER'),
  validate({ params: idParamsSchema }),
  asyncHandler(async (request, response) => {
    const { id } = idParamsSchema.parse(request.params);
    const simulation = await runSimulation(id);
    await recordAudit({
      request,
      action: 'SIMULATION_EXECUTED',
      entity: 'Simulation',
      entityId: simulation.id,
    });
    sendSuccess(response, simulation);
  }),
);
simulationsRouter.delete(
  '/:id',
  authorize('ADMIN', 'MANAGER'),
  validate({ params: idParamsSchema }),
  asyncHandler(async (request, response) => {
    const { id } = idParamsSchema.parse(request.params);
    await deleteSimulation(id);
    await recordAudit({
      request,
      action: 'SIMULATION_DELETED',
      entity: 'Simulation',
      entityId: id,
    });
    response.status(204).send();
  }),
);
