# Instalação e uso

Como configurar, instalar, executar e usar o UrbanLink Flow no seu computador. O projeto tem três partes:

| Parte | Pasta | Porta |
| --- | --- | --- |
| Site (React + Vite) | raiz do repositório | http://localhost:5173 |
| API (Express + Prisma) | `backend/` | http://localhost:3333/api |
| Banco de dados (PostgreSQL 16) | — | 5432 (Docker ou instalado) |

## 1. O que precisa ter instalado

- **Node.js 22** (a versão exata está no `.nvmrc`) e o npm que vem com ele.
- **Git**, pra baixar o código.
- **Um PostgreSQL 16**, de um destes jeitos (escolha um no passo 3):
  - Docker Desktop, que sobe o PostgreSQL com um comando;
  - PostgreSQL instalado no computador (com o `psql`);
  - nenhum dos dois: o Prisma sobe um PostgreSQL local de desenvolvimento.
- Chrome, Edge ou Firefox atualizado.

Confira:

```bash
node --version
npm --version
git --version
```

## 2. Baixar o código

```bash
git clone <link do repositório no GitHub>
cd urbanlink-flow
```

## 3. Banco de dados

### Opção A: Docker (a mais simples)

```bash
cd backend
docker compose up -d
```

Sobe o PostgreSQL 16 na porta 5432, com banco `urbanlink`, usuário `urbanlink` e senha `urbanlink_local` (só pra uso local). É o endereço que já vem no `backend/.env.example`. As tabelas e os dados entram no passo 4, com `db:deploy` e `db:seed`.

### Opção B: PostgreSQL instalado, com os scripts SQL

Os scripts da pasta [`sql/`](sql/) criam o banco, as tabelas e os dados de demonstração sem precisar do Node:

```bash
cd arquivos-adicionais/sql
psql -U postgres -f 01-criar-banco.sql
psql -U postgres -d urbanlink -f 02-criar-tabelas.sql
psql -U postgres -d urbanlink -f 03-inserir-dados.sql
```

| Script | O que faz |
| --- | --- |
| `01-criar-banco.sql` | Cria o banco `urbanlink` |
| `02-criar-tabelas.sql` | Cria as 13 tabelas, os 12 enums, as chaves, os índices, as funções e o trigger |
| `03-inserir-dados.sql` | Insere os dados de demonstração, com as datas relativas a hoje |

No `backend/.env` (passo 4), aponte a `DATABASE_URL` pro seu PostgreSQL, por exemplo `postgresql://postgres:SUA_SENHA@localhost:5432/urbanlink?schema=public`. Com os scripts, **pule o `db:deploy` e o `db:seed`** do passo 4: as tabelas e os dados já existem.

### Opção C: sem Docker e sem PostgreSQL (PostgreSQL local do Prisma)

Faça primeiro o `npm install` e o `cp .env.example .env` do passo 4 (a configuração do Prisma lê o `.env`). Depois, dentro de `backend/`, num terminal que fica aberto (PowerShell):

```powershell
$env:PORT = "51216"
npx prisma dev --name urbanlink --port 51213 --db-port 51214 --shadow-db-port 51215
```

O `$env:PORT` evita que esse banco ocupe a porta 3333, que é a da API. No `backend/.env`, use:

```env
DATABASE_URL=postgres://postgres:postgres@localhost:51214/template1?sslmode=disable
DATABASE_POOL_MAX=1
```

O `DATABASE_POOL_MAX=1` é obrigatório nesse banco: com mais de uma conexão, ele mistura as respostas e a API devolve erro 500. Nas vezes seguintes, o banco já existe e sobe com `npx prisma dev --name urbanlink --port 51213 --db-port 51214 --shadow-db-port 51215 --detach`; pra desligar, `npx prisma dev stop urbanlink`.

## 4. API (back-end)

```bash
cd backend
npm install
cp .env.example .env
```

No PowerShell, troque o `cp` por `Copy-Item .env.example .env`. Confira o `.env`:

| Variável | Pra quê | Valor local |
| --- | --- | --- |
| `DATABASE_URL` | Endereço do banco (passo 3) | o do Docker já vem pronto |
| `DATABASE_POOL_MAX` | Conexões com o banco | `10` (ou `1` na opção C) |
| `PORT` | Porta da API | `3333` |
| `JWT_SECRET` | Assina o login; 32 caracteres ou mais | troque fora do computador de desenvolvimento |
| `JWT_EXPIRES_IN` | Validade do login | `8h` |
| `CORS_ORIGIN` | Endereço do site que pode chamar a API | `http://localhost:5173` |
| `APP_URL` | Endereço do site, pro link de senha nova | `http://localhost:5173` |
| `PASSWORD_RESET_TTL_MINUTES` | Validade do link de senha nova | `30` |

Crie as tabelas e carregue os dados de demonstração (pule se usou os scripts SQL da opção B):

```bash
npm run db:deploy
npm run db:seed
```

Ligue a API:

```bash
npm run dev
```

Pronto quando aparecer `UrbanLink API disponível em http://localhost:3333/api`. Confira:

- http://localhost:3333/api/health: deve mostrar `"database":"connected"`;
- http://localhost:3333/api/docs: a documentação da API (Swagger).

## 5. Site (front-end)

Em outro terminal, na raiz do repositório:

```bash
npm install
cp .env.exemplo .env.local
npm run dev:api
```

O site abre em http://localhost:5173 e fala com a API do passo 4.

O `npm run dev` (sem o `:api`) roda o site com **dados de exemplo**, sem precisar da API, quando existe um `.env.development.local` com `VITE_USAR_EXEMPLOS=true`. Nesse modo aparece a faixa "Dados de exemplo" na tela.

## 6. Usar o sistema

Com o banco, a API e o site ligados e os dados de demonstração carregados.

### Rastrear uma entrega

Em **Rastrear** (ou http://localhost:5173/rastreamento), digite um código:

| Código | O que aparece |
| --- | --- |
| `ULF-2026-0001` a `0007` e `0024` | Entregue, com as quatro etapas e as datas |
| `ULF-2026-0008` a `0011` | Em rota de entrega |
| `ULF-2026-0012` a `0016` | Em trânsito |
| `ULF-2026-0017` a `0021` | Postado |
| `ULF-2026-0022` | Teve um imprevisto (a entrega falhou) |
| `ULF-2026-0023` | Teve um imprevisto (a entrega foi cancelada) |
| qualquer outro | Não achamos essa entrega |

Cada etapa mostra a data e a cidade, vindas do histórico que o banco grava a cada troca de estado.

### Falar com a equipe

Em **Fale com a gente**, preencha e envie. A mensagem fica no banco (tabela `inquiries`) e a tela mostra o número de protocolo, gerado pelo banco (`ULS2026…`).

### Entrar na plataforma

Em **Entrar**, use um dos usuários de demonstração, todos com a senha `UrbanLink@2026` (só pra uso local):

| E-mail | Perfil |
| --- | --- |
| `admin@urbanlink.local` | Administrador |
| `manager@urbanlink.local` | Gestor |
| `operator@urbanlink.local` | Operador |

"Manter conectado" guarda a sessão até o login vencer (8 h); sem ele, a sessão termina ao fechar o navegador.

### Recuperar a senha

Em **Esqueci minha senha**, digite o e-mail de um usuário. Como o projeto não envia e-mail, o link de senha nova aparece no terminal da API:

```text
[recuperar senha] Link de senha nova pra admin@urbanlink.local (vale 30 min): http://localhost:5173/nova-senha/…
```

Abra o link, crie a senha nova (8 caracteres ou mais) e entre com ela. O mesmo link não vale uma segunda vez. Pra voltar a senha de demonstração, rode `npm run db:seed` de novo (ele apaga e recria todos os dados).

### Usar a API direto

A documentação interativa (http://localhost:3333/api/docs) lista todas as rotas: usuários, veículos, centros de distribuição, entregas, rotas com otimização, simulações, painel e relatórios. Pra chamar as rotas protegidas:

1. Faça `POST /auth/login` com um usuário de demonstração.
2. Copie o `token` da resposta.
3. Clique em **Authorize** e cole o token.

Exemplos com `curl` estão em [`docs/backend/API_EXEMPLOS.md`](../docs/backend/API_EXEMPLOS.md).

## 7. Conferir se está tudo certo

Na raiz (site):

```bash
npm run lint
npm run build
```

Dentro de `backend/` (API):

```bash
npm run lint
npm test
npm run build
npm run test:smoke
```

O `test:smoke` precisa da API ligada e dos dados de demonstração: ele entra, consulta, cria, altera e desativa um veículo de teste e roda uma simulação.

## 8. Problemas comuns

| Sintoma | Causa e solução |
| --- | --- |
| A API não sobe: `EADDRINUSE :3333` | Outro programa está na porta 3333 (às vezes o próprio `prisma dev` da opção C sem o `$env:PORT`). Feche-o ou troque o `PORT` no `.env` e o `VITE_API_URL` no `.env.local` |
| O site mostra "Não deu pra buscar agora." | A API está desligada ou noutra porta. Confira o `VITE_API_URL` do `.env.local` |
| A API recusa o site (erro de CORS no console do navegador) | O site está noutro endereço. Coloque o endereço do site no `CORS_ORIGIN` do `backend/.env` |
| Aparece a faixa "Dados de exemplo" | O site foi aberto com `npm run dev`. Use `npm run dev:api` |
| Erro 500 com o banco da opção C | Falta `DATABASE_POOL_MAX=1` no `backend/.env` |
| `db:deploy` diz que a tabela já existe | O banco foi criado pelos scripts SQL. Com eles, não rode o `db:deploy` |
| Rastreio de um banco antigo sem as datas do meio | O banco existia antes do histórico. Rode `npm run db:deploy` e, se puder perder os dados, `npm run db:seed` |
