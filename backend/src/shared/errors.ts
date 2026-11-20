export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly details?: unknown;

  public constructor(statusCode: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export const badRequest = (message: string, details?: unknown): AppError =>
  new AppError(400, 'BAD_REQUEST', message, details);

export const unauthorized = (message = 'Autenticação necessária.'): AppError =>
  new AppError(401, 'UNAUTHORIZED', message);

export const forbidden = (message = 'Você não tem permissão para esta ação.'): AppError =>
  new AppError(403, 'FORBIDDEN', message);

export const notFound = (resource: string): AppError =>
  new AppError(404, 'NOT_FOUND', `${resource} não encontrado.`);

export const conflict = (message: string): AppError => new AppError(409, 'CONFLICT', message);
