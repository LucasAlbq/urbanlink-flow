import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65_535).default(3333),
  DATABASE_URL: z
    .string()
    .url()
    .default('postgresql://urbanlink:urbanlink_local@localhost:5432/urbanlink?schema=public'),
  DATABASE_POOL_MAX: z.coerce.number().int().min(1).max(100).default(10),
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('8h'),
  CORS_ORIGIN: z.string().default('http://localhost:5173'),
  // Endereço do site, pra montar o link de senha nova (APP_URL/nova-senha/<token>).
  APP_URL: z.string().url().default('http://localhost:5173'),
  PASSWORD_RESET_TTL_MINUTES: z.coerce.number().int().min(5).max(1440).default(30),
  // Mostrar o link de senha nova no log, já que o projeto não envia e-mail. Sem valor: só fora de
  // produção. Na demonstração publicada, "true" faz o link aparecer nos logs da Vercel.
  PASSWORD_RESET_LOG_LINK: z.enum(['false', 'true']).optional(),
  TRUST_PROXY: z
    .enum(['false', 'true'])
    .default('false')
    .transform((value) => value === 'true'),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900_000),
  RATE_LIMIT_MAX: z.coerce.number().int().positive().default(300),
  AUTH_RATE_LIMIT_MAX: z.coerce.number().int().positive().default(10),
  LOG_LEVEL: z.enum(['silent', 'error', 'warn', 'info', 'debug']).default('info'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const messages = parsed.error.issues
    .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
    .join('; ');
  throw new Error(`Configuração de ambiente inválida: ${messages}`);
}

export const env = {
  ...parsed.data,
  PASSWORD_RESET_LOG_LINK:
    parsed.data.PASSWORD_RESET_LOG_LINK === undefined
      ? parsed.data.NODE_ENV !== 'production'
      : parsed.data.PASSWORD_RESET_LOG_LINK === 'true',
};
export const allowedOrigins = env.CORS_ORIGIN.split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);
