// Entrada da API na Vercel. A Vercel procura um index.js na pasta do projeto e roda o app que ele
// exporta como uma função. O código é o compilado pelo npm run vercel-build, em dist/.
// Localmente, quem liga a API é o src/server.ts (npm run dev ou npm start).
export { default } from './dist/app.js';
