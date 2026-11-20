import { z } from 'zod';

export const uuidSchema = z.uuid();

export const idParamsSchema = z.object({
  id: uuidSchema,
});

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(120).optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const dateRangeQuerySchema = z
  .object({
    from: z.iso.datetime().optional(),
    to: z.iso.datetime().optional(),
  })
  .refine(
    ({ from, to }) => from === undefined || to === undefined || new Date(from) <= new Date(to),
    { message: 'A data inicial deve ser anterior à data final.' },
  );

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
