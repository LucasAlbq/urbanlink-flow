import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { app } from '../src/app.js';

describe('API HTTP', () => {
  it('não confia em proxy por padrão', () => {
    expect(app.get('trust proxy')).toBe(false);
  });

  it('expõe liveness sem depender do banco', async () => {
    const response = await request(app).get('/api/health/live');
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      success: true,
      data: { status: 'ok', service: 'urbanlink-api' },
    });
    expect(response.headers).toHaveProperty('x-request-id');
  });

  it('protege recursos privados', async () => {
    const response = await request(app).get('/api/vehicles');
    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Autenticação necessária.',
      },
    });
  });

  it('valida payload do login antes de acessar o banco', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({ email: 'não-é-email', password: 'curta' });
    expect(response.status).toBe(422);
    expect(response.body).toMatchObject({
      error: { code: 'VALIDATION_ERROR' },
    });
  });

  it('publica o contrato OpenAPI', async () => {
    const response = await request(app).get('/api/openapi.json');
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      openapi: '3.1.0',
      paths: {
        '/simulations/{id}/run': {
          post: { tags: ['Simulations'] },
        },
      },
    });
  });

  it('padroniza rota inexistente', async () => {
    const response = await request(app).get('/api/nao-existe');
    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({
      error: { code: 'ROUTE_NOT_FOUND' },
    });
  });
});
