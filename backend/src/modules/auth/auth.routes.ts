import { Router } from 'express';
import { authenticate, clearSessionCookie, setSessionCookie } from '../../middleware/auth.js';
import { authRateLimit, passwordResetRateLimit } from '../../middleware/rate-limit.js';
import { validate } from '../../middleware/validate.js';
import { recordAudit } from '../../services/audit.service.js';
import { asyncHandler } from '../../shared/async-handler.js';
import { sendSuccess } from '../../shared/http.js';
import { getAuthenticatedUser, login } from './auth.service.js';
import {
  loginSchema,
  passwordResetConfirmSchema,
  passwordResetRequestSchema,
} from './auth.schemas.js';
import { requestPasswordReset, resetPassword } from './password-reset.service.js';

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

// 202 sempre, exista ou não a conta.
authRouter.post(
  '/password-reset/request',
  passwordResetRateLimit,
  validate({ body: passwordResetRequestSchema }),
  asyncHandler(async (request, response) => {
    await requestPasswordReset(passwordResetRequestSchema.parse(request.body).email);
    sendSuccess(response, null, 202);
  }),
);

// 204 com a senha trocada; 400 INVALID_RESET_TOKEN com link inválido, usado ou vencido.
authRouter.post(
  '/password-reset/confirm',
  authRateLimit,
  validate({ body: passwordResetConfirmSchema }),
  asyncHandler(async (request, response) => {
    const { token, password } = passwordResetConfirmSchema.parse(request.body);
    const userId = await resetPassword(token, password);
    await recordAudit({ request, action: 'PASSWORD_RESET', entity: 'User', entityId: userId });
    response.status(204).end();
  }),
);
