import type { ErrorRequestHandler, RequestHandler } from 'express';
import { ZodError, treeifyError } from 'zod';
import { env } from '../config/env.js';
import { AppError } from '../shared/errors.js';

const isPrismaKnownError = (error: unknown): error is Error & { code: string; meta?: unknown } =>
  error instanceof Error &&
  'code' in error &&
  typeof (error as { code?: unknown }).code === 'string';

export const notFoundHandler: RequestHandler = (request, response) => {
  response.status(404).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `Rota ${request.method} ${request.originalUrl} não encontrada.`,
    },
  });
};

export const errorHandler: ErrorRequestHandler = (error: unknown, _request, response, _next) => {
  void _next;
  if (error instanceof ZodError) {
    response.status(422).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Os dados enviados são inválidos.',
        details: treeifyError(error),
      },
    });
    return;
  }

  if (error instanceof AppError) {
    response.status(error.statusCode).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        ...(error.details === undefined ? {} : { details: error.details }),
      },
    });
    return;
  }

  if (isPrismaKnownError(error)) {
    if (error.code === 'P2002') {
      response.status(409).json({
        success: false,
        error: {
          code: 'UNIQUE_CONSTRAINT',
          message: 'Já existe um registro com o identificador informado.',
          details: error.meta,
        },
      });
      return;
    }
    if (error.code === 'P2003') {
      response.status(409).json({
        success: false,
        error: {
          code: 'RELATION_CONSTRAINT',
          message: 'A operação viola um relacionamento existente.',
        },
      });
      return;
    }
    if (error.code === 'P2025') {
      response.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Registro não encontrado.' },
      });
      return;
    }
    if (error.code === 'P2034') {
      response.status(409).json({
        success: false,
        error: {
          code: 'TRANSACTION_CONFLICT',
          message: 'A operação conflitou com outra alteração. Atualize os dados e tente novamente.',
        },
      });
      return;
    }
  }

  if (env.LOG_LEVEL !== 'silent') {
    console.error(error);
  }
  response.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Ocorreu um erro interno.',
      ...(env.NODE_ENV === 'development' && error instanceof Error
        ? { details: error.message }
        : {}),
    },
  });
};
