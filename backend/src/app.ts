import { randomUUID } from 'node:crypto';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { allowedOrigins, env } from './config/env.js';
import { openApiDocument } from './docs/openapi.js';
import { apiRateLimit } from './middleware/rate-limit.js';
import { errorHandler, notFoundHandler } from './middleware/error-handler.js';
import { authRouter } from './modules/auth/auth.routes.js';
import { dashboardRouter } from './modules/dashboard/dashboard.routes.js';
import { deliveriesRouter } from './modules/deliveries/deliveries.routes.js';
import { distributionCentersRouter } from './modules/distribution-centers/distribution-centers.routes.js';
import { healthRouter } from './modules/health/health.routes.js';
import { reportsRouter } from './modules/reports/reports.routes.js';
import { routesRouter } from './modules/routes/routes.routes.js';
import { simulationsRouter } from './modules/simulations/simulations.routes.js';
import { usersRouter } from './modules/users/users.routes.js';
import { vehiclesRouter } from './modules/vehicles/vehicles.routes.js';
import { publicRouter } from './modules/public/public.routes.js';
import { AppError } from './shared/errors.js';
import { sendSuccess } from './shared/http.js';

export const app = express();

app.disable('x-powered-by');
app.set('trust proxy', env.TRUST_PROXY);
app.use((request, response, next) => {
  const requestId = request.get('x-request-id') ?? randomUUID();
  response.setHeader('x-request-id', requestId);
  next();
});
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:'],
      },
    },
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
);
app.use(
  cors({
    origin(origin, callback) {
      if (origin === undefined || allowedOrigins.includes('*') || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new AppError(403, 'CORS_DENIED', 'Origem não autorizada.'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Authorization', 'Content-Type', 'X-Request-Id'],
    exposedHeaders: ['X-Request-Id'],
    maxAge: 86_400,
  }),
);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false, limit: '1mb' }));
app.use('/api', apiRateLimit);

app.get('/api', (_request, response) => {
  sendSuccess(response, {
    name: 'UrbanLink Flow API',
    version: '1.0.0',
    environment: env.NODE_ENV,
    documentation: '/api/docs',
    health: '/api/health',
  });
});
app.use(
  '/api/docs',
  swaggerUi.serve,
  swaggerUi.setup(openApiDocument, {
    customSiteTitle: 'UrbanLink Flow API',
    swaggerOptions: { persistAuthorization: true },
  }),
);
app.get('/api/openapi.json', (_request, response) => {
  response.json(openApiDocument);
});
app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/public', publicRouter);
app.use('/api/users', usersRouter);
app.use('/api/vehicles', vehiclesRouter);
app.use('/api/distribution-centers', distributionCentersRouter);
app.use('/api/deliveries', deliveriesRouter);
app.use('/api/routes', routesRouter);
app.use('/api/simulations', simulationsRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/reports', reportsRouter);

app.use(notFoundHandler);
app.use(errorHandler);

// A Vercel roda o app exportado por padrão como uma função (ver index.js).
export default app;
