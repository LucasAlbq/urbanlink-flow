import { z } from 'zod';
import { paginationQuerySchema } from '../../shared/schemas.js';

const centerFields = {
  name: z.string().trim().min(2).max(160),
  address: z.string().trim().min(5).max(255),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  operatingHours: z.string().trim().min(3).max(120),
};

export const createCenterSchema = z.object(centerFields);
export const updateCenterSchema = z
  .object(centerFields)
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: 'Informe ao menos um campo.',
  });
export const listCentersQuerySchema = paginationQuerySchema.extend({
  sortBy: z.enum(['name', 'createdAt']).default('name'),
});

export type CreateCenterInput = z.infer<typeof createCenterSchema>;
export type UpdateCenterInput = z.infer<typeof updateCenterSchema>;
export type ListCentersQuery = z.infer<typeof listCentersQuerySchema>;
