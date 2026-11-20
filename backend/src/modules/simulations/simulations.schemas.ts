import { z } from 'zod';
import { paginationQuerySchema, uuidSchema } from '../../shared/schemas.js';

export const simulationParametersSchema = z.object({
  deliveryIds: z.array(uuidSchema).min(2).max(100).optional(),
  capacityKgPerVehicle: z.coerce.number().positive().max(50_000).default(1_000),
  serviceMinutesPerStop: z.coerce.number().int().min(1).max(120).default(8),
  fuelConsumptionKmPerLiter: z.coerce.number().positive().max(100).default(10),
  returnToOrigin: z.boolean().default(false),
});

export const createSimulationSchema = z.object({
  name: z.string().trim().min(2).max(160),
  trafficLevel: z.enum(['LOW', 'MODERATE', 'HIGH', 'CRITICAL']),
  availableVehicles: z.coerce.number().int().min(1).max(100),
  averageSpeedKmh: z.coerce.number().positive().max(180),
  fuelPrice: z.coerce.number().positive().max(100),
  co2Factor: z.coerce.number().positive().max(20),
  parameters: simulationParametersSchema.default({
    capacityKgPerVehicle: 1_000,
    serviceMinutesPerStop: 8,
    fuelConsumptionKmPerLiter: 10,
    returnToOrigin: false,
  }),
});

export const updateSimulationSchema = createSimulationSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'Informe ao menos um campo.',
  });

export const listSimulationsQuerySchema = paginationQuerySchema.extend({
  status: z.enum(['DRAFT', 'RUNNING', 'COMPLETED', 'FAILED']).optional(),
  userId: uuidSchema.optional(),
  sortBy: z.enum(['name', 'status', 'createdAt']).default('createdAt'),
});

export type CreateSimulationInput = z.infer<typeof createSimulationSchema>;
export type UpdateSimulationInput = z.infer<typeof updateSimulationSchema>;
export type ListSimulationsQuery = z.infer<typeof listSimulationsQuerySchema>;
export type SimulationParameters = z.infer<typeof simulationParametersSchema>;
