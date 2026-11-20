import { createServer } from 'node:http';
import { app } from './app.js';
import { env } from './config/env.js';
import { prisma } from './lib/prisma.js';

const server = createServer(app);

server.listen(env.PORT, () => {
  if (env.LOG_LEVEL !== 'silent') {
    console.info(`UrbanLink API disponível em http://localhost:${env.PORT}/api`);
  }
});

const shutdown = (signal: string): void => {
  if (env.LOG_LEVEL !== 'silent') {
    console.info(`${signal} recebido; encerrando a API.`);
  }
  server.close(() => {
    void prisma.$disconnect().finally(() => {
      process.exit(0);
    });
  });
  setTimeout(() => process.exit(1), 10_000).unref();
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
