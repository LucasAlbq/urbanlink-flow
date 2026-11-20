import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { asyncHandler } from '../../shared/async-handler.js';
import { sendSuccess } from '../../shared/http.js';
import {
  cityQuerySchema,
  liveQuerySchema,
  mapQuerySchema,
  timeSeriesQuerySchema,
} from './dashboard.schemas.js';
import {
  cityScene,
  dashboardSummary,
  dashboardTimeSeries,
  liveRoutes,
  operationalMap,
} from './dashboard.service.js';
import { buildLiveSnapshot } from './live-snapshot.service.js';

export const dashboardRouter = Router();
dashboardRouter.use(authenticate);

dashboardRouter.get(
  '/summary',
  asyncHandler(async (_request, response) => {
    sendSuccess(response, await dashboardSummary());
  }),
);
dashboardRouter.get(
  '/timeseries',
  validate({ query: timeSeriesQuerySchema }),
  asyncHandler(async (request, response) => {
    const { days } = timeSeriesQuerySchema.parse(request.query);
    sendSuccess(response, await dashboardTimeSeries(days));
  }),
);
dashboardRouter.get(
  '/map',
  validate({ query: mapQuerySchema }),
  asyncHandler(async (request, response) => {
    sendSuccess(response, await operationalMap(mapQuerySchema.parse(request.query)));
  }),
);
dashboardRouter.get(
  '/city',
  validate({ query: cityQuerySchema }),
  asyncHandler(async (request, response) => {
    sendSuccess(response, await cityScene(cityQuerySchema.parse(request.query)));
  }),
);
dashboardRouter.get(
  '/live',
  validate({ query: liveQuerySchema }),
  asyncHandler(async (request, response) => {
    const { routeId } = liveQuerySchema.parse(request.query);
    const routes = await liveRoutes(routeId);
    response.status(200);
    response.set({
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    });
    response.flushHeaders();

    const finalTick = 60;
    let tick = 0;
    const snapshot = (): void => {
      const data = buildLiveSnapshot(routes, tick, finalTick);
      response.write('event: snapshot\n');
      response.write(`data: ${JSON.stringify(data)}\n\n`);
      if (tick >= finalTick) {
        clearInterval(interval);
        response.end();
        return;
      }
      tick += 1;
    };
    const interval = setInterval(snapshot, 2_000);
    snapshot();
    request.on('close', () => {
      clearInterval(interval);
    });
  }),
);
