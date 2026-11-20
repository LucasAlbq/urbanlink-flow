import type { Request, RequestHandler, Response } from 'express';
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

// Sessão do site: o mesmo JWT, num cookie httpOnly que o JavaScript da página não lê.
// SameSite=Lax: o navegador não manda o cookie em POST vindo de outro site.
export const SESSION_COOKIE = 'urbanlink_session';

const sessionCookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: env.NODE_ENV === 'production',
  path: '/',
} as const;

// "Manter conectado" guarda o cookie até o token vencer; sem ele, o cookie some ao fechar o navegador.
export function setSessionCookie(response: Response, token: string, remember: boolean): void {
  const decoded = jwt.decode(token);
  const expiresAt =
    remember && decoded !== null && typeof decoded !== 'string' && typeof decoded.exp === 'number'
      ? new Date(decoded.exp * 1000)
      : undefined;
  response.cookie(SESSION_COOKIE, token, {
    ...sessionCookieOptions,
    ...(expiresAt === undefined ? {} : { expires: expiresAt }),
  });
}

export function clearSessionCookie(response: Response): void {
  response.clearCookie(SESSION_COOKIE, sessionCookieOptions);
}

function readCookie(request: Request, name: string): string | undefined {
  for (const part of request.headers.cookie?.split(';') ?? []) {
    const separator = part.indexOf('=');
    if (separator !== -1 && part.slice(0, separator).trim() === name) {
      try {
        return decodeURIComponent(part.slice(separator + 1).trim());
      } catch {
        return undefined;
      }
    }
  }
  return undefined;
}

// O token vem do cabeçalho Authorization (Swagger, Postman, testes) ou do cookie (site).
function readToken(request: Request): string | undefined {
  const authorization = request.headers.authorization;
  if (authorization?.startsWith('Bearer ')) return authorization.slice(7);
  return readCookie(request, SESSION_COOKIE);
}

export const authenticate: RequestHandler = (request, _response, next): void => {
  const token = readToken(request);
  if (token === undefined) {
    next(unauthorized());
    return;
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET, {
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
