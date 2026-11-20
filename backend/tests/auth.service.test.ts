import bcrypt from 'bcryptjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../src/lib/prisma.js', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
  },
}));

import { prisma } from '../src/lib/prisma.js';
import { login } from '../src/modules/auth/auth.service.js';

const mockedUserRepository = vi.mocked(prisma.user);

describe('auth.service', () => {
  beforeEach(() => {
    mockedUserRepository.findUnique.mockReset();
  });

  it('autentica credenciais válidas sem expor o hash', async () => {
    const passwordHash = await bcrypt.hash('UrbanLink@2026', 4);
    mockedUserRepository.findUnique.mockResolvedValue({
      id: '00000000-0000-4000-8000-000000000001',
      name: 'Ana',
      email: 'admin@urbanlink.local',
      passwordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await login({
      email: 'admin@urbanlink.local',
      password: 'UrbanLink@2026',
    });
    expect(result.user).toEqual(
      expect.objectContaining({ email: 'admin@urbanlink.local', role: 'ADMIN' }),
    );
    expect(result).toHaveProperty('token');
    expect(result.user).not.toHaveProperty('passwordHash');
  });

  it('rejeita senha inválida com mensagem neutra', async () => {
    mockedUserRepository.findUnique.mockResolvedValue(null);
    await expect(
      login({ email: 'unknown@urbanlink.local', password: 'wrong-pass' }),
    ).rejects.toMatchObject({ statusCode: 401, code: 'UNAUTHORIZED' });
  });

  it('rejeita usuário inativo mesmo com senha correta', async () => {
    const passwordHash = await bcrypt.hash('UrbanLink@2026', 4);
    mockedUserRepository.findUnique.mockResolvedValue({
      id: '00000000-0000-4000-8000-000000000002',
      name: 'Inativo',
      email: 'inactive@urbanlink.local',
      passwordHash,
      role: 'OPERATOR',
      status: 'INACTIVE',
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await expect(
      login({
        email: 'inactive@urbanlink.local',
        password: 'UrbanLink@2026',
      }),
    ).rejects.toMatchObject({ statusCode: 401 });
  });
});
