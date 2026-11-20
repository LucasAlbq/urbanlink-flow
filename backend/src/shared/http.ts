import type { Response } from 'express';

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export function sendSuccess<T>(
  response: Response,
  data: T,
  statusCode = 200,
  meta?: PaginationMeta,
): Response {
  return response.status(statusCode).json({
    success: true,
    data,
    ...(meta === undefined ? {} : { meta }),
  });
}

export const paginationMeta = (page: number, pageSize: number, total: number): PaginationMeta => ({
  page,
  pageSize,
  total,
  totalPages: Math.ceil(total / pageSize),
});

export const round = (value: number, digits = 2): number => {
  const factor = 10 ** digits;
  return Math.round((value + Number.EPSILON) * factor) / factor;
};
