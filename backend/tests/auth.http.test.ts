import bcrypt from 'bcryptjs';
import request from 'supertest';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { app } from '../src/app.js';
import { prisma } from '../src/lib/prisma.js';

afterEach(() => vi.restoreAllMocks());

const user = {
  id: '00000000-0000-4000-8000-000000000001',
  name: 'Ana',
  email: 'admin@urbanlink.local',
  role: 'ADMIN',
  status: 'ACTIVE',
  createdAt: new Date('2026-10-20T12:00:00Z'),
  updatedAt: new Date('2026-10-20T12:00:00Z'),
};

const sessionCookie = (response: request.Response): string | undefined =>
  ([] as string[])
    .concat(response.headers['set-cookie'] ?? [])
    .find((cookie) => cookie.startsWith('urbanlink_session='));

describe('Sessão por cookie', () => {
  beforeEach(async () => {
    const passwordHash = await bcrypt.hash('UrbanLink@2026', 4);
    vi.spyOn(prisma.user, 'findUnique').mockResolvedValue({ ...user, passwordHash } as never);
  });

  it('o login grava o token num cookie httpOnly e SameSite=Lax, que some ao fechar o navegador', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: user.email, password: 'UrbanLink@2026' });
    expect(response.status).toBe(200);
    const cookie = sessionCookie(response);
    expect(cookie).toMatch(/HttpOnly/i);
    expect(cookie).toMatch(/SameSite=Lax/i);
    expect(cookie).not.toMatch(/Expires=/i);
  });

  it('com "manter conectado", o cookie dura até o token vencer', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: user.email, password: 'UrbanLink@2026', remember: true });
    expect(sessionCookie(response)).toMatch(/Expires=/i);
  });

  it('o cookie basta pra /auth/me, sem o cabeçalho Authorization', async () => {
    const agent = request.agent(app);
    await agent.post('/api/auth/login').send({ email: user.email, password: 'UrbanLink@2026' });
    const response = await agent.get('/api/auth/me');
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ data: { email: user.email, role: 'ADMIN' } });
  });

  it('sair apaga o cookie, e depois disso /auth/me dá 401', async () => {
    const agent = request.agent(app);
    await agent.post('/api/auth/login').send({ email: user.email, password: 'UrbanLink@2026' });
    const logout = await agent.post('/api/auth/logout');
    expect(logout.status).toBe(204);
    expect(sessionCookie(logout)).toMatch(/Expires=Thu, 01 Jan 1970/i);
    expect((await agent.get('/api/auth/me')).status).toBe(401);
  });

  it('pedir senha nova dá 202 igual pra e-mail sem conta', async () => {
    vi.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);
    const response = await request(app)
      .post('/api/auth/password-reset/request')
      .send({ email: 'ninguem@urbanlink.local' });
    expect(response.status).toBe(202);
    expect(response.body).toEqual({ success: true, data: null });
  });

  it('senha nova com menos de 8 caracteres é 422 antes de olhar o link', async () => {
    const response = await request(app)
      .post('/api/auth/password-reset/confirm')
      .send({ token: 'qualquer', password: 'curta' });
    expect(response.status).toBe(422);
    expect(response.body).toMatchObject({
      error: { code: 'VALIDATION_ERROR', details: { properties: { password: {} } } },
    });
  });

  it('senha curta e errada é 401, não 422', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: user.email, password: 'curta' });
    expect(response.status).toBe(401);
    expect(sessionCookie(response)).toBeUndefined();
  });
});
