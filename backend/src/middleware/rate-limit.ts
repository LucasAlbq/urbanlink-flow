import type { Request, Response } from 'express';
import { rateLimit } from 'express-rate-limit';
import { env } from '../config/env.js';

const handler = (_request: Request, response: Response): void => {
  response.status(429).json({
    success: false,
    error: {
      code: 'RATE_LIMITED',
      message: 'Muitas requisições. Tente novamente mais tarde.',
    },
  });
};

export const apiRateLimit = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  limit: env.RATE_LIMIT_MAX,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler,
});

// O pedido de senha nova sempre dá 202, então aqui todo pedido conta (não só os que falham).
export const passwordResetRateLimit = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  limit: env.AUTH_RATE_LIMIT_MAX,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  handler,
});

export const authRateLimit = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  limit: env.AUTH_RATE_LIMIT_MAX,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler,
});
