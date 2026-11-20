import request from 'supertest';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { app } from '../src/app.js';
import { prisma } from '../src/lib/prisma.js';

afterEach(() => vi.restoreAllMocks());

describe('Site público', () => {
  it('consulta rastreamento sem incluir endereço ou dados da frota na projeção', async () => {
    const find = vi.spyOn(prisma.delivery, 'findFirst').mockResolvedValue({
      trackingCode: 'ULF-2026-0001',
      status: 'IN_TRANSIT',
      createdAt: new Date(),
      updatedAt: new Date(),
      estimatedArrival: null,
      serviceDeadline: new Date('2026-10-24T18:00:00Z'),
      deliveredAt: null,
      events: [
        {
          status: 'PENDING',
          location: 'São Paulo, SP',
          occurredAt: new Date('2026-10-20T17:42:00Z'),
        },
      ],
    } as never);
    const response = await request(app).get('/api/public/tracking/ULF-2026-0001');
    expect(response.status).toBe(200);
    expect(response.headers['cache-control']).toBe('no-store');
    const projection = find.mock.calls[0]?.[0]?.select;
    expect(projection).toEqual({
      trackingCode: true,
      status: true,
      estimatedArrival: true,
      serviceDeadline: true,
      deliveredAt: true,
      createdAt: true,
      updatedAt: true,
      events: {
        select: { status: true, location: true, occurredAt: true },
        orderBy: [{ occurredAt: 'asc' }, { id: 'asc' }],
      },
    });
    const body = response.body as { data: Record<string, unknown> };
    expect(body.data).not.toHaveProperty('destinationAddress');
    expect(body.data).not.toHaveProperty('assignedVehicleId');
    expect(body.data.events).toEqual([
      { status: 'PENDING', location: 'São Paulo, SP', occurredAt: '2026-10-20T17:42:00.000Z' },
    ]);
  });

  it('retorna 404 para código inexistente e rejeita código inválido antes de acessar o banco', async () => {
    const find = vi.spyOn(prisma.delivery, 'findFirst').mockResolvedValue(null);
    expect((await request(app).get('/api/public/tracking/INEXISTENTE')).status).toBe(404);
    expect((await request(app).get('/api/public/tracking/!!')).status).toBe(422);
    expect(find).toHaveBeenCalledTimes(1);
  });

  it('exige consentimento e rejeita preenchimento do campo antispam sem persistir dados', async () => {
    const create = vi.spyOn(prisma.inquiry, 'create');
    const input = {
      name: 'Contato de teste',
      email: 'teste@example.com',
      subject: 'Parceria',
      message: 'Gostaria de conhecer as soluções da plataforma.',
    };
    expect(
      (
        await request(app)
          .post('/api/public/contact')
          .send({ ...input, consent: false })
      ).status,
    ).toBe(422);
    expect(
      (
        await request(app)
          .post('/api/public/contact')
          .send({ ...input, consent: true, website: 'spam' })
      ).status,
    ).toBe(422);
    expect(create).not.toHaveBeenCalled();
  });

  it('registra contato e retorna apenas o protocolo e a data', async () => {
    const create = vi
      .spyOn(prisma.inquiry, 'create')
      .mockResolvedValue({ id: 'inquiry-1', createdAt: new Date('2026-10-20T12:00:00Z') } as never);
    const response = await request(app).post('/api/public/contact').send({
      name: 'Contato de teste',
      email: 'teste@example.com',
      company: '',
      phone: '',
      subject: 'Suporte',
      message: 'Gostaria de esclarecer uma dúvida sobre a plataforma.',
      consent: true,
      website: '',
    });
    expect(response.status).toBe(201);
    const body = response.body as { data: Record<string, unknown> };
    expect(body.data).toEqual({ id: 'inquiry-1', createdAt: '2026-10-20T12:00:00.000Z' });
    expect(create.mock.calls[0]?.[0]?.data).not.toHaveProperty('consent');
    expect(create.mock.calls[0]?.[0]?.data).not.toHaveProperty('website');
  });

  it('mantém mensagens recebidas restritas à área autenticada', async () => {
    expect((await request(app).get('/api/public/inquiries')).status).toBe(401);
  });
});
