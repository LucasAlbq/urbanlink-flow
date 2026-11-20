import { z } from 'zod';
import { paginationQuerySchema, uuidSchema } from '../../shared/schemas.js';

const editableFields = {
  trackingCode: z.string().trim().toUpperCase().min(6).max(40),
  originCenterId: uuidSchema,
  destinationAddress: z.string().trim().min(5).max(255),
  destinationLatitude: z.coerce.number().min(-90).max(90),
  destinationLongitude: z.coerce.number().min(-180).max(180),
  weightKg: z.coerce.number().positive().max(50_000),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']),
  serviceDeadline: z.coerce.date(),
  estimatedArrival: z.coerce.date().nullable().optional(),
};

export const createDeliverySchema = z.object({
  ...editableFields,
  priority: editableFields.priority.default('NORMAL'),
  assignedVehicleId: uuidSchema.optional(),
});

export const updateDeliverySchema = z
  .object(editableFields)
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'Informe ao menos um campo.',
  });

export const assignDeliverySchema = z.object({
  vehicleId: uuidSchema,
});

export const updateDeliveryStatusSchema = z.object({
  status: z.enum(['PENDING', 'ASSIGNED', 'IN_TRANSIT', 'DELIVERED', 'FAILED', 'CANCELED']),
});

export const listDeliveriesQuerySchema = paginationQuerySchema.extend({
  status: z
    .enum(['PENDING', 'ASSIGNED', 'IN_TRANSIT', 'DELIVERED', 'FAILED', 'CANCELED'])
    .optional(),
  priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).optional(),
  vehicleId: uuidSchema.optional(),
  originCenterId: uuidSchema.optional(),
  overdue: z
    .enum(['true', 'false'])
    .transform((value) => value === 'true')
    .optional(),
  sortBy: z.enum(['trackingCode', 'serviceDeadline', 'priority', 'createdAt']).default('createdAt'),
});

export type CreateDeliveryInput = z.infer<typeof createDeliverySchema>;
export type UpdateDeliveryInput = z.infer<typeof updateDeliverySchema>;
export type ListDeliveriesQuery = z.infer<typeof listDeliveriesQuerySchema>;
