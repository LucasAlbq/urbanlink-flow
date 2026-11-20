import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    // As migrations e o seed precisam de conexão direta. No Neon (publicação na Vercel), a
    // DATABASE_URL passa pelo pooler e a direta vem em DATABASE_URL_UNPOOLED; localmente, só existe
    // a DATABASE_URL.
    url: process.env.DATABASE_URL_UNPOOLED ?? env('DATABASE_URL'),
  },
});
