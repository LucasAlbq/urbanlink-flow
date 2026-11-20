import 'dotenv/config';
import { spawnSync } from 'node:child_process';
import pg from 'pg';

// Roda na publicação (npm run vercel-build), depois das migrations: carrega os dados de
// demonstração só se o banco estiver vazio. Num banco com usuários não faz nada, porque o seed
// apaga tudo antes de recriar.

const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;
if (url === undefined) throw new Error('DATABASE_URL não definida.');

const client = new pg.Client({ connectionString: url });
await client.connect();
const result = await client.query<{ n: number }>('SELECT count(*)::int AS n FROM "users"');
await client.end();
const users = result.rows[0]?.n ?? 0;

if (users > 0) {
  console.info(`[preparar-banco] O banco já tem ${users} usuário(s): os dados de demonstração não são recarregados.`);
} else {
  console.info('[preparar-banco] Banco vazio: carregando os dados de demonstração.');
  // O seed tem uma trava contra produção, porque apaga tudo antes de recriar. Aqui o banco está
  // vazio, então não há o que perder: a trava é liberada só pra este processo.
  const seed = spawnSync('npx', ['prisma', 'db', 'seed'], {
    stdio: 'inherit',
    shell: process.platform === 'win32',
    env: { ...process.env, DATABASE_URL: url, ALLOW_PRODUCTION_SEED: 'true' },
  });
  if (seed.status !== 0) process.exit(seed.status ?? 1);
}
