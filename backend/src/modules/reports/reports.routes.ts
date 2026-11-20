import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { asyncHandler } from '../../shared/async-handler.js';
import { sendSuccess } from '../../shared/http.js';
import { dateRangeQuerySchema } from '../../shared/schemas.js';
import { operationsReport, performanceReport } from './reports.service.js';

export const reportsRouter = Router();
reportsRouter.use(authenticate, authorize('ADMIN', 'MANAGER'));

reportsRouter.get(
  '/operations',
  validate({ query: dateRangeQuerySchema }),
  asyncHandler(async (request, response) => {
    sendSuccess(response, await operationsReport(dateRangeQuerySchema.parse(request.query)));
  }),
);

reportsRouter.get(
  '/performance',
  validate({ query: dateRangeQuerySchema }),
  asyncHandler(async (request, response) => {
    sendSuccess(response, await performanceReport(dateRangeQuerySchema.parse(request.query)));
  }),
);
