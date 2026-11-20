import type { RequestHandler } from 'express';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../config/env.js';
import { prisma } from '../lib/prisma.js';
import { forbidden, unauthorized } from '../shared/errors.js';

export type AuthRole = 'ADMIN' | 'MANAGER' | 'OPERATOR';

interface TokenPayload extends jwt.JwtPayload {
  sub: string;
  email: string;
  role: AuthRole;
}

const isTokenPayload = (value: string | jwt.JwtPayload): value is TokenPayload =>
  typeof value !== 'string' &&
  typeof value.sub === 'string' &&
  typeof value.email === 'string' &&
  (value.role === 'ADMIN' || value.role === 'MANAGER' || value.role === 'OPERATOR');

export const signAccessToken = (payload: { id: string; email: string; role: AuthRole }): string =>
  jwt.sign({ email: payload.email, role: payload.role }, env.JWT_SECRET, {
    subject: payload.id,
    expiresIn: env.JWT_EXPIRES_IN as NonNullable<SignOptions['expiresIn']>,
    issuer: 'urbanlink-api',
    audience: 'urbanlink-web',
  });

export const authenticate: RequestHandler = (request, _response, next): void => {
  const authorization = request.headers.authorization;
  if (authorization === undefined || !authorization.startsWith('Bearer ')) {
    next(unauthorized());
    return;
  }

  try {
    const decoded = jwt.verify(authorization.slice(7), env.JWT_SECRET, {
      issuer: 'urbanlink-api',
      audience: 'urbanlink-web',
    });
    if (!isTokenPayload(decoded)) {
      next(unauthorized('Token inválido.'));
      return;
    }
    void prisma.user
      .findUnique({
        where: { id: decoded.sub },
        select: { id: true, email: true, role: true, status: true },
      })
      .then((user) => {
        if (user === null || user.status !== 'ACTIVE') {
          next(unauthorized('Usuário inativo ou inexistente.'));
          return;
        }
        request.auth = {
          id: user.id,
          email: user.email,
          role: user.role,
        };
        next();
      })
      .catch(next);
  } catch {
    next(unauthorized('Token inválido ou expirado.'));
  }
};

export const authorize = (...roles: readonly AuthRole[]): RequestHandler => {
  return (request, _response, next): void => {
    if (request.auth === undefined) {
      next(unauthorized());
      return;
    }
    if (!roles.includes(request.auth.role)) {
      next(forbidden());
      return;
    }
    next();
  };
};
