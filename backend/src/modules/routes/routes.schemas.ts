import { z } from 'zod';
import { paginationQuerySchema, uuidSchema } from '../../shared/schemas.js';

const routeCalculationFields = {
  trafficLevel: z.enum(['LOW', 'MODERATE', 'HIGH', 'CRITICAL']),
  fuelPrice: z.coerce.number().positive().max(100),
  co2Factor: z.coerce.number().positive().max(20),
  serviceMinutesPerStop: z.coerce.number().int().min(1).max(120),
} as const;

export const routeCalculationSchema = z.object({
  trafficLevel: routeCalculationFields.trafficLevel.default('MODERATE'),
  fuelPrice: routeCalculationFields.fuelPrice.default(6.19),
  co2Factor: routeCalculationFields.co2Factor.default(2.31),
  serviceMinutesPerStop: routeCalculationFields.serviceMinutesPerStop.default(8),
});

export const createRouteSchema = routeCalculationSchema.extend({
  vehicleId: uuidSchema,
  name: z.string().trim().min(2).max(160),
  deliveryIds: z
    .array(uuidSchema)
    .min(1)
    .max(100)
    .refine((ids) => new Set(ids).size === ids.length, {
      message: 'Não repita entregas na mesma rota.',
    }),
  optimize: z.boolean().default(true),
});

export const updateRouteSchema = z.object({
  name: z.string().trim().min(2).max(160),
});

export const optimizeRouteSchema = z.object(routeCalculationFields).partial();

export const reorderStopsSchema = optimizeRouteSchema.extend({
  orderedStopIds: z
    .array(uuidSchema)
    .min(1)
    .refine((ids) => new Set(ids).size === ids.length, {
      message: 'Não repita paradas.',
    }),
});

export const updateStopStatusSchema = z.object({
  status: z.enum(['PENDING', 'ARRIVED', 'COMPLETED', 'SKIPPED', 'FAILED']),
});

export const routeStopParamsSchema = z.object({
  id: uuidSchema,
  stopId: uuidSchema,
});

export const listRoutesQuerySchema = paginationQuerySchema.extend({
  status: z.enum(['PLANNED', 'ACTIVE', 'COMPLETED', 'CANCELED']).optional(),
  vehicleId: uuidSchema.optional(),
  sortBy: z.enum(['name', 'status', 'createdAt', 'totalDistanceKm']).default('createdAt'),
});

export type CreateRouteInput = z.infer<typeof createRouteSchema>;
export type RouteCalculationInput = z.infer<typeof routeCalculationSchema>;
export type RouteCalculationOverrides = z.infer<typeof optimizeRouteSchema>;
export type ReorderStopsInput = z.infer<typeof reorderStopsSchema>;
export type ListRoutesQuery = z.infer<typeof listRoutesQuerySchema>;
