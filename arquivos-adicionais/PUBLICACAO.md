# Publicação na internet

O UrbanLink Flow está publicado em dois projetos na **Vercel** (o site e a API) e num banco **Neon** (PostgreSQL), criado pela própria Vercel. Tudo no plano grátis.

```
navegador ──> site na Vercel ──(/api/*, repassado pela Vercel)──> API na Vercel ──> banco Neon
```

O site repassa tudo que começa com `/api` pro projeto da API (`vercel.json` da raiz). Pro navegador, o site e a API estão no mesmo endereço; é isso que faz o cookie do login funcionar.

## Endereços

| O quê | Endereço |
| --- | --- |
| Site | https://urbanlink-flow-vert.vercel.app |
| Documentação da API | https://urbanlink-flow-vert.vercel.app/api/docs |
| API (direto, sem passar pelo site) | https://urbanlink-flow-api.vercel.app/api |

Na Vercel, os projetos são `urbanlink-flow` (site) e `urbanlink-flow-api` (API). O banco Neon é o `urbanlink-flow-db`. O banco e a função da API ficam em São Paulo (`gru1`).

O nome `urbanlink-flow.vercel.app` já era de outra conta, por isso a Vercel deu `urbanlink-flow-vert` ao site.

## O que já está pronto no código

| Arquivo | Pra quê |
| --- | --- |
| `vercel.json` (raiz) | Diz que o site é Vite, repassa `/api/*` pra API e manda as outras rotas pro `index.html` |
| `.env.production` (raiz) | O site publicado chama a API em `/api`, sem os dados de exemplo, e mostra os links da documentação e do GitHub no rodapé |
| `backend/vercel.json` | Diz que a API é Express, roda `npm run vercel-build` e põe a função em São Paulo, perto do banco |
| `backend/index.js` | Entrada da API na Vercel: importa o `express` e exporta o app compilado em `dist/`. Sem o import, a Vercel ignora este arquivo, escolhe o `src/app.ts` e tenta compilar o TypeScript sozinha (e falha) |
| `backend/package.json`, script `vercel-build` | Gera o cliente do Prisma, aplica as migrations, carrega os dados de demonstração **só se o banco estiver vazio** e compila |
| `backend/src/docs/docs-page.ts` | A página `/api/docs` carrega o Swagger UI da CDN jsDelivr, com versão fixa e hash de integridade. A Vercel ignora o `express.static`, então esses arquivos não podem vir da própria API |

## Como foi publicado

Em 20/11/2026, pela Vercel CLI (`npx vercel`), logada na conta da equipe:

1. Criação dos projetos `urbanlink-flow-api` e `urbanlink-flow`.
2. Na API, as variáveis `JWT_SECRET` (gerada na hora, marcada como sigilosa), `TRUST_PROXY=true`, `CORS_ORIGIN` e `APP_URL` (as duas com o endereço do site).
3. Banco Neon criado pela integração da Vercel (`vercel integration add neon`), ligado à API sem prefixo: a Vercel criou `DATABASE_URL` (com pooler, pra API) e `DATABASE_URL_UNPOOLED` (direta, pras migrations).
4. Publicação da API: aplicou as 6 migrations e, com o banco vazio, carregou os dados de demonstração.
5. Publicação do site.

Os dois projetos **não estão ligados ao GitHub**: um push não publica sozinho. Pra publicar uma versão nova, siga a próxima seção.

## Publicar de novo

Depois de juntar as mudanças na `main`, no PowerShell, na raiz do repositório:

```powershell
git worktree add ..\urbanlink-publicar main
```

API:

```powershell
cd ..\urbanlink-publicar\backend
npx vercel link --yes --project urbanlink-flow-api
npx vercel deploy --prod
```

Site:

```powershell
cd ..
npx vercel link --yes --project urbanlink-flow
npx vercel deploy --prod
```

Pra apagar a cópia:

```powershell
cd ..\urbanlink-flow
git worktree remove --force ..\urbanlink-publicar
```

Três cuidados, que já deram problema:

- **Publique de uma cópia da `main`, nunca da pasta de trabalho.** A CLI não lê o `.gitignore` e mandaria junto o `backend/.env` e os `.env` locais do site.
- **Rode o `deploy` de dentro da pasta que vai ser publicada.** A CLI lê o `vercel.json` da pasta em que o comando roda. Com `--cwd` apontando pra outra pasta, ela misturou a configuração do site com os arquivos da API, e a API passou a repassar `/api` pra ela mesma ("Infinite loop detected").
- **Não grave variáveis com pipe do Windows PowerShell 5.1** (`"valor" | npx vercel env add ...`): ele põe um caractere invisível (BOM) no começo do texto. O `TRUST_PROXY` virou "BOM + true" e a API não ligava. Digite o valor quando a CLI pedir, ou use o painel da Vercel.

### Publicar a cada push

Pra publicar sozinho a cada push na `main`, ligue cada projeto ao repositório no painel da Vercel, em **Settings → Git → Connect Git Repository** (`LucasAlbq/urbanlink-flow`). No projeto da API, ponha também **Root Directory** = `backend`, em **Settings → Build and Deployment**. Isso pede o login da Vercel pelo GitHub.

## Criar tudo do zero pelo painel

Se precisar refazer a publicação em outra conta. Precisa do código no GitHub e de uma conta na Vercel entrando pelo GitHub.

### 1. Projeto da API

1. Na Vercel: **Add New… → Project** e importe o repositório `urbanlink-flow`.
2. **Project Name:** `urbanlink-flow-api`.
3. **Root Directory:** clique em **Edit** e escolha `backend`. O tipo (Express) vem do `backend/vercel.json`.
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
2. Aceite os termos, escolha São Paulo e o plano grátis.
3. Ligue o banco ao projeto em todos os ambientes, **sem prefixo** nas variáveis.
4. Aba **Deployments**, no último deploy: **⋯ → Redeploy**.

Agora a publicação aplica as 6 migrations e, como o banco está vazio, carrega os dados de demonstração. No log do build aparece `[preparar-banco] Banco vazio: carregando os dados de demonstração.`

Confira em `https://<domínio da API>/api/health`: deve mostrar `"database":"connected"`.

### 3. Projeto do site

1. **Add New… → Project** e importe o mesmo repositório de novo.
2. **Project Name:** `urbanlink-flow` (ou outro nome livre). **Root Directory:** a raiz (`./`). O tipo (Vite) vem do `vercel.json` da raiz.
3. Não precisa de variáveis: o `.env.production` já diz pro site usar `/api`.
4. **Deploy.**

### 4. Ligar o site e a API

1. Anote o domínio do site.
2. No projeto da API, **Settings → Environment Variables**, adicione:

   | Nome | Valor |
   | --- | --- |
   | `CORS_ORIGIN` | o domínio do site, sem barra no fim |
   | `APP_URL` | o domínio do site, sem barra no fim |

3. Redeploy da API.
4. Se o domínio da API **não** for `urbanlink-flow-api.vercel.app`, troque no `vercel.json` da raiz e publique o site de novo.

### 5. Conferir

No endereço do site:

- `/rastreamento/ULF-2026-0009`: entrega em rota, com as datas;
- **Fale com a gente**: envia e mostra o protocolo;
- **Entrar** com `admin@urbanlink.local` e a senha `UrbanLink@2026`: leva pra `/app`;
- `/api/docs`: a documentação da API.

## Recuperar senha na versão publicada

Não há envio de e-mail. Pra demonstrar a recuperação de senha, adicione `PASSWORD_RESET_LOG_LINK=true` no projeto da API e publique a API de novo: o link de senha nova passa a aparecer em **Logs**, no projeto da API. Só quem tem acesso ao projeto na Vercel vê os logs.

## Voltar os dados de demonstração

Os usuários de demonstração estão no README, então qualquer pessoa pode entrar e mudar os dados. Pra voltar ao começo:

1. No Neon (aba **Storage** do projeto da API → **Open in Neon** → **SQL Editor**), rode:

   ```sql
   TRUNCATE "users" CASCADE;
   ```

2. Publique a API de novo. Sem usuários, a publicação recarrega todos os dados de demonstração.

## Limites do plano grátis

- A API é uma função da Vercel: o primeiro acesso depois de um tempo parado pode levar alguns segundos.
- O Neon grátis desliga o banco quando ninguém usa e liga de novo no primeiro acesso (cerca de 1 segundo).
- O monitoramento em tempo real da API (`/api/dashboard/live`) é cortado no tempo máximo de uma função da Vercel. O site ainda não usa essa rota.
