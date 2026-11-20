import { Router } from 'express';
import { authenticate, authorize } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { recordAudit } from '../../services/audit.service.js';
import { asyncHandler } from '../../shared/async-handler.js';
import { sendSuccess } from '../../shared/http.js';
import { idParamsSchema } from '../../shared/schemas.js';
import { createUserSchema, listUsersQuerySchema, updateUserSchema } from './users.schemas.js';
import { createUser, deactivateUser, getUser, listUsers, updateUser } from './users.service.js';

export const usersRouter = Router();
usersRouter.use(authenticate, authorize('ADMIN'));

usersRouter.get(
  '/',
  validate({ query: listUsersQuerySchema }),
  asyncHandler(async (request, response) => {
    const result = await listUsers(listUsersQuerySchema.parse(request.query));
    sendSuccess(response, result.items, 200, result.meta);
  }),
);

usersRouter.get(
  '/:id',
  validate({ params: idParamsSchema }),
  asyncHandler(async (request, response) => {
    const { id } = idParamsSchema.parse(request.params);
    sendSuccess(response, await getUser(id));
  }),
);

usersRouter.post(
  '/',
  validate({ body: createUserSchema }),
  asyncHandler(async (request, response) => {
    const input = createUserSchema.parse(request.body);
    const user = await createUser(input);
    await recordAudit({
      request,
      action: 'USER_CREATED',
      entity: 'User',
      entityId: user.id,
    });
    sendSuccess(response, user, 201);
  }),
);

usersRouter.patch(
  '/:id',
  validate({ params: idParamsSchema, body: updateUserSchema }),
  asyncHandler(async (request, response) => {
    const { id } = idParamsSchema.parse(request.params);
    const input = updateUserSchema.parse(request.body);
    const user = await updateUser(id, input, request.auth!.id);
    await recordAudit({
      request,
      action: 'USER_UPDATED',
      entity: 'User',
      entityId: user.id,
    });
    sendSuccess(response, user);
  }),
);

usersRouter.delete(
  '/:id',
  validate({ params: idParamsSchema }),
  asyncHandler(async (request, response) => {
    const { id } = idParamsSchema.parse(request.params);
    const user = await deactivateUser(id, request.auth!.id);
    await recordAudit({
      request,
      action: 'USER_DEACTIVATED',
      entity: 'User',
      entityId: user.id,
    });
    sendSuccess(response, user);
  }),
);
