import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { authRateLimit } from '../../middleware/rate-limit.js';
import { validate } from '../../middleware/validate.js';
import { asyncHandler } from '../../shared/async-handler.js';
import { sendSuccess } from '../../shared/http.js';
import { getAuthenticatedUser, login } from './auth.service.js';
import { loginSchema } from './auth.schemas.js';

export const authRouter = Router();

authRouter.post(
  '/login',
  authRateLimit,
  validate({ body: loginSchema }),
  asyncHandler(async (request, response) => {
    sendSuccess(response, await login(loginSchema.parse(request.body)));
  }),
);

authRouter.get(
  '/me',
  authenticate,
  asyncHandler(async (request, response) => {
    sendSuccess(response, await getAuthenticatedUser(request.auth!.id));
  }),
);
