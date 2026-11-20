import bcrypt from 'bcryptjs';
import { env } from '../../config/env.js';
import { prisma } from '../../lib/prisma.js';
import { signAccessToken } from '../../middleware/auth.js';
import { unauthorized } from '../../shared/errors.js';
import type { LoginInput } from './auth.schemas.js';

export const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} as const;

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (
    user === null ||
    user.status !== 'ACTIVE' ||
    !(await bcrypt.compare(input.password, user.passwordHash))
  ) {
    throw unauthorized('E-mail ou senha inválidos.');
  }

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
    },
    token: signAccessToken({
      id: user.id,
      email: user.email,
      role: user.role,
    }),
    expiresIn: env.JWT_EXPIRES_IN,
  };
}

export async function getAuthenticatedUser(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: publicUserSelect,
  });
  if (user === null || user.status !== 'ACTIVE') {
    throw unauthorized('Usuário inativo ou inexistente.');
  }
  return user;
}
