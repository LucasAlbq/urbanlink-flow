import { Router } from 'express';
import { authenticate, clearSessionCookie, setSessionCookie } from '../../middleware/auth.js';
import { authRateLimit } from '../../middleware/rate-limit.js';
import { validate } from '../../middleware/validate.js';
import { asyncHandler } from '../../shared/async-handler.js';
import { sendSuccess } from '../../shared/http.js';
import { getAuthenticatedUser, login } from './auth.service.js';
import { loginSchema } from './auth.schemas.js';

export const authRouter = Router();

// Devolve o token no corpo (pra Swagger, Postman e testes) e grava o mesmo token no cookie da
// sessão (pro site, que não guarda o token).
authRouter.post(
  '/login',
  authRateLimit,
  validate({ body: loginSchema }),
  asyncHandler(async (request, response) => {
    const input = loginSchema.parse(request.body);
    const result = await login(input);
    setSessionCookie(response, result.token, input.remember);
    sendSuccess(response, result);
  }),
);

authRouter.get(
  '/me',
  authenticate,
  asyncHandler(async (request, response) => {
    sendSuccess(response, await getAuthenticatedUser(request.auth!.id));
  }),
);

// Sair apaga o cookie da sessão. Não exige estar logado: sair duas vezes também dá 204.
authRouter.post('/logout', (_request, response) => {
  clearSessionCookie(response);
  response.status(204).end();
});
