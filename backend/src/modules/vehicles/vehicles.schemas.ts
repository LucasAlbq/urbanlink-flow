import { z } from 'zod';
import { paginationQuerySchema } from '../../shared/schemas.js';

const vehicleFields = {
  plate: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/, 'Placa inválida.'),
  model: z.string().trim().min(2).max(120),
  type: z.enum(['MOTORCYCLE', 'VAN', 'TRUCK', 'BICYCLE']),
  capacityKg: z.coerce.number().positive().max(50_000),
  averageSpeedKmh: z.coerce.number().positive().max(180),
  fuelConsumption: z.coerce.number().positive().max(100),
  status: z.enum(['AVAILABLE', 'IN_ROUTE', 'MAINTENANCE', 'INACTIVE']).default('AVAILABLE'),
  currentLatitude: z.coerce.number().min(-90).max(90).nullable().optional(),
  currentLongitude: z.coerce.number().min(-180).max(180).nullable().optional(),
};

export const createVehicleSchema = z.object(vehicleFields);
export const updateVehicleSchema = z
  .object(vehicleFields)
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'Informe ao menos um campo.',
  });
export const listVehiclesQuerySchema = paginationQuerySchema.extend({
  status: z.enum(['AVAILABLE', 'IN_ROUTE', 'MAINTENANCE', 'INACTIVE']).optional(),
  type: z.enum(['MOTORCYCLE', 'VAN', 'TRUCK', 'BICYCLE']).optional(),
  sortBy: z.enum(['plate', 'model', 'capacityKg', 'createdAt']).default('createdAt'),
});

export type CreateVehicleInput = z.infer<typeof createVehicleSchema>;
export type UpdateVehicleInput = z.infer<typeof updateVehicleSchema>;
export type ListVehiclesQuery = z.infer<typeof listVehiclesQuerySchema>;
