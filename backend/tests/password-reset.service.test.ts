import bcrypt from 'bcryptjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/lib/prisma.js', () => {
  const tokens = {
    deleteMany: vi.fn(),
    create: vi.fn(),
    findUnique: vi.fn(),
    updateMany: vi.fn(),
  };
  const user = { findUnique: vi.fn(), update: vi.fn() };
  const prisma = {
    user,
    passwordResetToken: tokens,
    // Lista: roda os pedidos. Função: roda com o próprio prisma fazendo papel da transação.
    $transaction: vi.fn((arg: unknown) =>
      Array.isArray(arg)
        ? Promise.all(arg)
        : Promise.resolve((arg as (tx: unknown) => unknown)(prisma)),
    ),
  };
  return { prisma };
});

import { prisma } from '../src/lib/prisma.js';
import {
  hashResetToken,
  requestPasswordReset,
  resetPassword,
} from '../src/modules/auth/password-reset.service.js';

const db = vi.mocked(prisma, { deep: true });
const userId = '00000000-0000-4000-8000-000000000001';

beforeEach(() => {
  vi.spyOn(console, 'info').mockImplementation(() => undefined);
  db.passwordResetToken.deleteMany.mockResolvedValue({ count: 0 });
  db.passwordResetToken.create.mockResolvedValue({} as never);
  db.passwordResetToken.updateMany.mockResolvedValue({ count: 1 });
  db.user.update.mockResolvedValue({} as never);
});

afterEach(() => vi.clearAllMocks());

describe('pedir senha nova', () => {
  it('e-mail sem conta não cria pedido nem mostra link', async () => {
    db.user.findUnique.mockResolvedValue(null);
    await requestPasswordReset('ninguem@urbanlink.local');
    expect(db.passwordResetToken.create.mock.calls).toHaveLength(0);
    expect(vi.mocked(console.info).mock.calls).toHaveLength(0);
  });

  it('conta ativa: guarda só o hash do token, e o link leva o token', async () => {
    db.user.findUnique.mockResolvedValue({ id: userId, status: 'ACTIVE' } as never);
    await requestPasswordReset('admin@urbanlink.local');

    const linha = vi.mocked(console.info).mock.calls[0]?.[0] as string;
    const token = /\/nova-senha\/([\w-]+)$/.exec(linha)?.[1];
    expect(token).toBeDefined();
    const salvo = db.passwordResetToken.create.mock.calls[0]?.[0]?.data;
    expect(salvo?.tokenHash).toBe(hashResetToken(token!));
    expect(salvo?.tokenHash).not.toBe(token);
    expect(db.passwordResetToken.deleteMany.mock.calls[0]?.[0]).toEqual({
      where: { userId, usedAt: null },
    });
  });
});

describe('criar a senha nova', () => {
  const pedido = (extra: object = {}) => ({
    id: 'reset-1',
    userId,
    usedAt: null,
    expiresAt: new Date(Date.now() + 60_000),
    user: { status: 'ACTIVE' },
    ...extra,
  });

  it('link válido troca a senha e queima o link', async () => {
    db.passwordResetToken.findUnique.mockResolvedValue(pedido() as never);
    await expect(resetPassword('token-bom', 'SenhaNova@2026')).resolves.toBe(userId);
    const hash = db.user.update.mock.calls[0]?.[0]?.data?.passwordHash as string;
    expect(await bcrypt.compare('SenhaNova@2026', hash)).toBe(true);
    expect(db.passwordResetToken.updateMany.mock.calls[0]?.[0]).toMatchObject({
      where: { id: 'reset-1', usedAt: null },
    });
  });

  it.each([
    ['inexistente', null],
    ['já usado', pedido({ usedAt: new Date() })],
    ['vencido', pedido({ expiresAt: new Date(Date.now() - 1) })],
    ['de usuário inativo', pedido({ user: { status: 'INACTIVE' } })],
  ])('link %s dá 400 INVALID_RESET_TOKEN sem trocar a senha', async (_caso, encontrado) => {
    db.passwordResetToken.findUnique.mockResolvedValue(encontrado as never);
    await expect(resetPassword('token', 'SenhaNova@2026')).rejects.toMatchObject({
      statusCode: 400,
      code: 'INVALID_RESET_TOKEN',
    });
    expect(db.user.update.mock.calls).toHaveLength(0);
  });

  it('dois envios ao mesmo tempo: o segundo não troca a senha', async () => {
    db.passwordResetToken.findUnique.mockResolvedValue(pedido() as never);
    db.passwordResetToken.updateMany.mockResolvedValue({ count: 0 });
    await expect(resetPassword('token-bom', 'SenhaNova@2026')).rejects.toMatchObject({
      code: 'INVALID_RESET_TOKEN',
    });
    expect(db.user.update.mock.calls).toHaveLength(0);
  });
});
