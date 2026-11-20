import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { recordAudit } from '../../services/audit.service.js';
import { asyncHandler } from '../../shared/async-handler.js';
import { sendSuccess } from '../../shared/http.js';
import { idParamsSchema } from '../../shared/schemas.js';
import {
  createRouteSchema,
  listRoutesQuerySchema,
  optimizeRouteSchema,
  reorderStopsSchema,
  routeStopParamsSchema,
  updateRouteSchema,
  updateStopStatusSchema,
} from './routes.schemas.js';
import {
  cancelRoute,
  completeRoute,
  createRoute,
  getRoute,
  listRoutes,
  optimizeExistingRoute,
  renameRoute,
  reorderStops,
  startRoute,
  updateStopStatus,
} from './routes.service.js';

export const routesRouter = Router();
routesRouter.use(authenticate);

routesRouter.get(
  '/',
  validate({ query: listRoutesQuerySchema }),
  asyncHandler(async (request, response) => {
    const result = await listRoutes(listRoutesQuerySchema.parse(request.query));
    sendSuccess(response, result.items, 200, result.meta);
  }),
);
routesRouter.get(
  '/:id',
  validate({ params: idParamsSchema }),
  asyncHandler(async (request, response) => {
    const { id } = idParamsSchema.parse(request.params);
    sendSuccess(response, await getRoute(id));
  }),
);
routesRouter.post(
  '/',
  authorize('ADMIN', 'MANAGER'),
  validate({ body: createRouteSchema }),
  asyncHandler(async (request, response) => {
    const input = createRouteSchema.parse(request.body);
    const route = await createRoute(input);
    await recordAudit({
      request,
      action: 'ROUTE_CREATED',
      entity: 'Route',
      entityId: route.id,
    });
    sendSuccess(response, route, 201);
  }),
);
routesRouter.patch(
  '/:id',
  authorize('ADMIN', 'MANAGER'),
  validate({ params: idParamsSchema, body: updateRouteSchema }),
  asyncHandler(async (request, response) => {
    const { id } = idParamsSchema.parse(request.params);
    const { name } = updateRouteSchema.parse(request.body);
    const route = await renameRoute(id, name);
    await recordAudit({
      request,
      action: 'ROUTE_UPDATED',
      entity: 'Route',
      entityId: route.id,
    });
    sendSuccess(response, route);
  }),
);
routesRouter.post(
  '/:id/optimize',
  authorize('ADMIN', 'MANAGER'),
  validate({ params: idParamsSchema, body: optimizeRouteSchema }),
  asyncHandler(async (request, response) => {
    const { id } = idParamsSchema.parse(request.params);
    const calculation = optimizeRouteSchema.parse(request.body);
    const route = await optimizeExistingRoute(id, calculation);
    await recordAudit({
      request,
      action: 'ROUTE_OPTIMIZED',
      entity: 'Route',
      entityId: route.id,
    });
    sendSuccess(response, route);
  }),
);
routesRouter.put(
  '/:id/stops/order',
  authorize('ADMIN', 'MANAGER'),
  validate({ params: idParamsSchema, body: reorderStopsSchema }),
  asyncHandler(async (request, response) => {
    const { id } = idParamsSchema.parse(request.params);
    const input = reorderStopsSchema.parse(request.body);
    const route = await reorderStops(id, input);
    await recordAudit({
      request,
      action: 'ROUTE_STOPS_REORDERED',
      entity: 'Route',
      entityId: route.id,
    });
    sendSuccess(response, route);
  }),
);
routesRouter.post(
  '/:id/start',
  authorize('ADMIN', 'MANAGER', 'OPERATOR'),
  validate({ params: idParamsSchema }),
  asyncHandler(async (request, response) => {
    const { id } = idParamsSchema.parse(request.params);
    const route = await startRoute(id);
    await recordAudit({
      request,
      action: 'ROUTE_STARTED',
      entity: 'Route',
      entityId: route.id,
    });
    sendSuccess(response, route);
  }),
);
routesRouter.patch(
  '/:id/stops/:stopId/status',
  authorize('ADMIN', 'MANAGER', 'OPERATOR'),
  validate({ params: routeStopParamsSchema, body: updateStopStatusSchema }),
  asyncHandler(async (request, response) => {
    const { id, stopId } = routeStopParamsSchema.parse(request.params);
    const { status } = updateStopStatusSchema.parse(request.body);
    const route = await updateStopStatus(id, stopId, status);
    await recordAudit({
      request,
      action: 'ROUTE_STOP_STATUS_CHANGED',
      entity: 'RouteStop',
      entityId: stopId,
      metadata: { status },
    });
    sendSuccess(response, route);
  }),
);
routesRouter.post(
  '/:id/complete',
  authorize('ADMIN', 'MANAGER', 'OPERATOR'),
  validate({ params: idParamsSchema }),
  asyncHandler(async (request, response) => {
    const { id } = idParamsSchema.parse(request.params);
    const route = await completeRoute(id);
    await recordAudit({
      request,
      action: 'ROUTE_COMPLETED',
      entity: 'Route',
      entityId: route.id,
    });
    sendSuccess(response, route);
  }),
);
routesRouter.delete(
  '/:id',
  authorize('ADMIN', 'MANAGER'),
  validate({ params: idParamsSchema }),
  asyncHandler(async (request, response) => {
    const { id } = idParamsSchema.parse(request.params);
    const route = await cancelRoute(id);
    await recordAudit({
      request,
      action: 'ROUTE_CANCELED',
      entity: 'Route',
      entityId: route.id,
    });
    sendSuccess(response, route);
  }),
);
