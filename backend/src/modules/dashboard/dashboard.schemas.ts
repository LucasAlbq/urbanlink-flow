import { z } from 'zod';
import { uuidSchema } from '../../shared/schemas.js';

export const mapQuerySchema = z.object({
  routeId: uuidSchema.optional(),
  vehicleId: uuidSchema.optional(),
  deliveryId: uuidSchema.optional(),
  deliveryStatus: z
    .enum(['PENDING', 'ASSIGNED', 'IN_TRANSIT', 'DELIVERED', 'FAILED', 'CANCELED'])
    .optional(),
});

export const cityQuerySchema = z.object({
  routeId: uuidSchema.optional(),
  simulationId: uuidSchema.optional(),
});

export const timeSeriesQuerySchema = z.object({
  days: z.coerce.number().int().min(1).max(90).default(7),
});

export const liveQuerySchema = z.object({
  routeId: uuidSchema.optional(),
});
