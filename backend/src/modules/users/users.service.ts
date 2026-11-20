import bcrypt from 'bcryptjs';
import type { Prisma } from '../../generated/prisma/client.js';
import { prisma } from '../../lib/prisma.js';
import { conflict, notFound } from '../../shared/errors.js';
import { paginationMeta } from '../../shared/http.js';
import { publicUserSelect } from '../auth/auth.service.js';
import type { CreateUserInput, ListUsersQuery, UpdateUserInput } from './users.schemas.js';

export async function listUsers(query: ListUsersQuery) {
  const where: Prisma.UserWhereInput = {
    ...(query.role === undefined ? {} : { role: query.role }),
    ...(query.status === undefined ? {} : { status: query.status }),
    ...(query.search === undefined
      ? {}
      : {
          OR: [
            { name: { contains: query.search, mode: 'insensitive' } },
            { email: { contains: query.search, mode: 'insensitive' } },
          ],
        }),
  };
  const [items, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      select: publicUserSelect,
      orderBy: { [query.sortBy]: query.sortOrder },
      skip: (query.page - 1) * query.pageSize,
      take: query.pageSize,
    }),
    prisma.user.count({ where }),
  ]);
  return { items, meta: paginationMeta(query.page, query.pageSize, total) };
}

export async function getUser(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    select: publicUserSelect,
  });
  if (user === null) throw notFound('Usuário');
  return user;
}

export async function createUser(input: CreateUserInput) {
  return prisma.user.create({
    data: {
      name: input.name,
      email: input.email,
      passwordHash: await bcrypt.hash(input.password, 12),
      role: input.role,
      status: input.status,
    },
    select: publicUserSelect,
  });
}

export function assertAdminSelfUpdateAllowed(
  targetId: string,
  actorId: string,
  input: UpdateUserInput,
): void {
  if (
    targetId === actorId &&
    ((input.role !== undefined && input.role !== 'ADMIN') ||
      (input.status !== undefined && input.status !== 'ACTIVE'))
  ) {
    throw conflict('O administrador não pode rebaixar nem desativar a própria conta.');
  }
}

export async function updateUser(id: string, input: UpdateUserInput, actorId: string) {
  assertAdminSelfUpdateAllowed(id, actorId, input);
  await getUser(id);
  const passwordHash =
    input.password === undefined ? undefined : await bcrypt.hash(input.password, 12);

  return prisma.user.update({
    where: { id },
    data: {
      name: input.name,
      email: input.email,
      role: input.role,
      status: input.status,
      passwordHash,
    },
    select: publicUserSelect,
  });
}

export async function deactivateUser(id: string, actorId: string) {
  if (id === actorId) {
    throw conflict('O administrador não pode desativar a própria conta.');
  }
  await getUser(id);
  return prisma.user.update({
    where: { id },
    data: { status: 'INACTIVE' },
    select: publicUserSelect,
  });
}
