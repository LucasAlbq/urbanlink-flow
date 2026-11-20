# Publicação na internet

Como o UrbanLink Flow é publicado: dois projetos na **Vercel** (o site e a API) e um banco **Neon** (PostgreSQL), criado pela própria Vercel. Tudo no plano grátis.

```
navegador ──> site na Vercel ──(/api/*, repassado pela Vercel)──> API na Vercel ──> banco Neon
```

O site repassa tudo que começa com `/api` pro projeto da API (`vercel.json` da raiz). Pro navegador, o site e a API estão no mesmo endereço; é isso que faz o cookie do login funcionar.

## O que já está pronto no código

| Arquivo | Pra quê |
| --- | --- |
| `vercel.json` (raiz) | Repassa `/api/*` pra API e manda as outras rotas pro `index.html` do site |
| `.env.production` (raiz) | O site publicado chama a API em `/api`, sem os dados de exemplo |
| `backend/vercel.json` | Na publicação da API, roda `npm run vercel-build` |
| `backend/index.js` | Entrada da API na Vercel: exporta o app compilado em `dist/` |
| `backend/package.json`, script `vercel-build` | Gera o cliente do Prisma, aplica as migrations, carrega os dados de demonstração **só se o banco estiver vazio** e compila |

## Passo a passo

Precisa do código no GitHub e de uma conta na Vercel entrando pelo GitHub.

### 1. Projeto da API

1. Na Vercel: **Add New… → Project** e importe o repositório `urbanlink-flow`.
2. **Project Name:** `urbanlink-flow-api`.
3. **Root Directory:** clique em **Edit** e escolha `backend`. O Framework Preset deve aparecer como Express.
4. Em **Environment Variables**, adicione:

   | Nome | Valor |
   | --- | --- |
   | `JWT_SECRET` | um texto aleatório de 32 caracteres ou mais (gere com o comando abaixo) |
   | `TRUST_PROXY` | `true` |

   ```bash
   node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
   ```

5. Clique em **Deploy**. A primeira publicação **vai falhar**, porque ainda não tem banco. É esperado.

### 2. Banco Neon

1. No projeto `urbanlink-flow-api`, aba **Storage → Create Database → Neon** (Serverless Postgres).
2. Aceite os termos, escolha a região mais perto (São Paulo, se tiver) e o plano grátis.
3. Ligue o banco ao projeto em todos os ambientes, **sem prefixo** nas variáveis. A Vercel cria `DATABASE_URL` (com pooler, pra API) e `DATABASE_URL_UNPOOLED` (direta, pras migrations).
4. Aba **Deployments**, no último deploy: **⋯ → Redeploy**.

Agora a publicação aplica as 6 migrations e, como o banco está vazio, carrega os dados de demonstração. No log do build aparece `[preparar-banco] Banco vazio: carregando os dados de demonstração.`

Confira em `https://urbanlink-flow-api.vercel.app/api/health` (ou o domínio que a Vercel deu, em **Settings → Domains**): deve mostrar `"database":"connected"`.

### 3. Projeto do site

1. **Add New… → Project** e importe o mesmo repositório de novo.
2. **Project Name:** `urbanlink-flow` (ou outro nome livre). **Root Directory:** a raiz (`./`). O Framework Preset deve aparecer como Vite.
3. Não precisa de variáveis: o `.env.production` já diz pro site usar `/api`.
4. **Deploy.**

### 4. Ligar o site e a API

1. Anote o domínio do site (ex.: `https://urbanlink-flow.vercel.app`).
2. No projeto da API, **Settings → Environment Variables**, adicione:

   | Nome | Valor |
   | --- | --- |
   | `CORS_ORIGIN` | o domínio do site, sem barra no fim |
   | `APP_URL` | o domínio do site, sem barra no fim |

3. Redeploy da API.
4. Se o domínio da API **não** for `urbanlink-flow-api.vercel.app`, troque no `vercel.json` da raiz e publique de novo.

### 5. Conferir

No endereço do site:

- `/rastreamento/ULF-2026-0009`: entrega em rota, com as datas;
- **Fale com a gente**: envia e mostra o protocolo;
- **Entrar** com `admin@urbanlink.local` e a senha `UrbanLink@2026`: leva pra `/app`;
- `/api/docs`: a documentação da API.

Depois, ponha o endereço do site no README (seção "Site publicado").

## Recuperar senha na versão publicada

Não há envio de e-mail. Pra demonstrar a recuperação de senha, adicione `PASSWORD_RESET_LOG_LINK=true` no projeto da API e faça o redeploy: o link de senha nova passa a aparecer em **Logs**, no projeto da API. Só quem tem acesso ao projeto na Vercel vê os logs.

## Voltar os dados de demonstração

Os usuários de demonstração estão no README, então qualquer pessoa pode entrar e mudar os dados. Pra voltar ao começo:

1. No Neon (aba **Storage** do projeto da API → **Open in Neon** → **SQL Editor**), rode:

   ```sql
   TRUNCATE "users" CASCADE;
   ```

2. Faça o redeploy da API. Sem usuários, a publicação recarrega todos os dados de demonstração.

## Limites do plano grátis

- A API é uma função da Vercel: o primeiro acesso depois de um tempo parado pode levar alguns segundos.
- O Neon grátis desliga o banco quando ninguém usa e liga de novo no primeiro acesso (cerca de 1 segundo).
- O monitoramento em tempo real da API (`/api/dashboard/live`) é cortado no tempo máximo de uma função da Vercel. O site ainda não usa essa rota.
