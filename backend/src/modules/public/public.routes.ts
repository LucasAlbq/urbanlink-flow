import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { z } from 'zod';
import { prisma } from '../../lib/prisma.js';
import { authenticate, authorize } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { asyncHandler } from '../../shared/async-handler.js';
import { AppError } from '../../shared/errors.js';
import { sendSuccess } from '../../shared/http.js';

export const publicRouter = Router();
const publicLimit = rateLimit({
  windowMs: 15 * 60_000,
  limit: 60,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMITED',
      message: 'Muitas consultas. Tente novamente em alguns minutos.',
    },
  },
});
const contactLimit = rateLimit({
  windowMs: 60 * 60_000,
  limit: 8,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'RATE_LIMITED',
      message: 'Limite de solicitações atingido. Tente novamente mais tarde.',
    },
  },
});
const trackingSchema = z.object({
  code: z
    .string()
    .trim()
    .min(3)
    .max(40)
    .regex(/^[a-zA-Z0-9-]+$/),
});
const contactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.email().max(255),
  company: z.string().trim().max(160).default(''),
  phone: z.string().trim().max(30).default(''),
  // Os assuntos e os limites da mensagem são os do formulário do site.
  subject: z.enum(['ORCAMENTO', 'DUVIDA_ENTREGA', 'PARCERIA', 'OUTRO']),
  message: z.string().trim().min(10).max(1000),
  consent: z.literal(true),
  website: z.string().max(0).optional(),
});

publicRouter.get(
  '/tracking/:code',
  publicLimit,
  validate({ params: trackingSchema }),
  asyncHandler(async (request, response) => {
    const { code } = trackingSchema.parse(request.params);
    // A projeção é intencional: nunca expor endereço, destinatário ou veículo. O histórico só
    // traz a cidade de cada etapa, gravada pelo trigger deliveries_record_event.
    const delivery = await prisma.delivery.findFirst({
      where: { trackingCode: { equals: code, mode: 'insensitive' } },
      select: {
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
      },
    });
    if (!delivery)
      throw new AppError(
        404,
        'TRACKING_NOT_FOUND',
        'Não encontramos uma encomenda com esse código. Confira os caracteres e tente novamente.',
      );
    response.setHeader('Cache-Control', 'no-store');
    sendSuccess(response, delivery);
  }),
);

publicRouter.post(
  '/contact',
  contactLimit,
  validate({ body: contactSchema }),
  asyncHandler(async (request, response) => {
    const { consent, website, ...data } = contactSchema.parse(request.body);
    void consent;
    void website;
    // O protocolo vem do valor padrão da coluna (função next_inquiry_protocol do banco).
    const inquiry = await prisma.inquiry.create({
      data,
      select: { id: true, protocol: true, createdAt: true },
    });
    sendSuccess(response, inquiry, 201);
  }),
);

publicRouter.get(
  '/inquiries',
  authenticate,
  authorize('ADMIN', 'MANAGER'),
  asyncHandler(async (_request, response) => {
    sendSuccess(
      response,
      await prisma.inquiry.findMany({ orderBy: { createdAt: 'desc' }, take: 100 }),
    );
  }),
);
