import { Router } from 'express';
import { prisma } from '../../lib/prisma.js';
import { asyncHandler } from '../../shared/async-handler.js';
import { sendSuccess } from '../../shared/http.js';

export const healthRouter = Router();

healthRouter.get('/live', (_request, response) => {
  sendSuccess(response, {
    status: 'ok',
    service: 'urbanlink-api',
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

healthRouter.get(
  '/',
  asyncHandler(async (_request, response) => {
    const startedAt = performance.now();
    try {
      await prisma.$queryRaw`SELECT 1`;
      sendSuccess(response, {
        status: 'ok',
        service: 'urbanlink-api',
        database: 'connected',
        databaseLatencyMs: Math.round(performance.now() - startedAt),
        uptimeSeconds: Math.round(process.uptime()),
        timestamp: new Date().toISOString(),
      });
    } catch {
      response.status(503).json({
        success: false,
        error: {
          code: 'DATABASE_UNAVAILABLE',
          message: 'API ativa, mas o banco de dados não está disponível.',
        },
      });
    }
  }),
);
