// Entrada da API na Vercel. A Vercel procura um index.js na pasta do projeto e roda o app que ele
// exporta como uma função. O código é o compilado pelo npm run vercel-build, em dist/.
// Localmente, quem liga a API é o src/server.ts (npm run dev ou npm start).
//
// A Vercel só aceita como entrada um arquivo que importe o express. Sem este import ela pula este
// arquivo, escolhe o src/app.ts e tenta compilar o TypeScript por conta própria.
import express from 'express';
import app from './dist/app.js';

void express;

export default app;
