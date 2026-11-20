# UrbanLink Flow: site

Site da UrbanLink Flow, uma plataforma de gestão e simulação de logística urbana em tempo real. Ele apresenta a plataforma, deixa rastrear uma entrega e falar com a equipe. É o front-end em React do TCC de Desenvolvimento de Sistemas (SENAI). A API e o banco de dados do mesmo TCC ficam na pasta `backend/`.

![Primeira tela da landing em 1440 px](docs/readme/landing.jpg)

> Projeto acadêmico. A UrbanLink Systems é uma empresa fictícia.

## Como rodar

Precisa do Node 22 (versão exata no `.nvmrc`).

```bash
npm install
cp .env.exemplo .env.local
npm run dev
```

O site abre em http://localhost:5173.

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Servidor local com recarga automática (com os dados de exemplo, se o `.env.development.local` ligar) |
| `npm run dev:api` | O mesmo, falando com a API de verdade (precisa da API ligada; ver "Back-end e banco de dados") |
| `npm run build` | Gera o site em `dist/` e roda a trava de dados de exemplo |
| `npm run preview` | Serve o `dist/` pra conferir o build |
| `npm run lint` | Confere o código com o oxlint |

### Sem a API: dados de exemplo

Pra ver as telas sem a API rodando, crie um `.env.development.local` com:

```bash
VITE_USAR_EXEMPLOS=true
```

Só o `npm run dev` lê esse arquivo. Com ele, as respostas vêm de `src/api/exemplos/` e a faixa "Dados de exemplo" aparece na tela. O build nunca leva esses dados: o `scripts/sem-exemplos.js` procura os valores de exemplo em `dist/` e faz o build falhar se achar algum.

| Pra ver | Use |
| --- | --- |
| Entrega em rota | código `UL123456789BR` |
| Cada status | `ULEXEMPLOPOSTADO`, `ULEXEMPLOTRANSITO`, `ULEXEMPLOIMPREVISTO`, `ULEXEMPLOENTREGUE` |
| Código que não existe | qualquer outro código |
| Erro de conexão | `ULEXEMPLOERRO`, ou um e-mail começando com `sem-conexao@` |
| Muitas tentativas | e-mail começando com `muitas@` |
| E-mail recusado no contato | e-mail começando com `recusado@` |
| Login | qualquer e-mail com a senha `exemplo123` |
| Link de senha vencido | `/nova-senha/vencido` (o erro aparece ao salvar) |

## Variáveis de ambiente

| Variável | Pra quê | Exemplo |
| --- | --- | --- |
| `VITE_API_URL` | Endereço da API | `http://localhost:3333/api` |
| `VITE_USAR_EXEMPLOS` | `true` usa os dados de exemplo no lugar da API (só em dev) | `false` |
| `VITE_LINK_API_DOCS` | Link da documentação da API no rodapé. Vazio, o link não aparece | |
| `VITE_LINK_GITHUB` | Link do código no rodapé. Vazio, o link não aparece | |

## Estrutura de pastas

```
src/
  api/          único lugar que chama fetch (cliente.js) e os pedidos de cada tela
    exemplos/   respostas de exemplo (só com VITE_USAR_EXEMPLOS=true)
  components/   Header, Rodape, Botao, Campo, Logo, LogoAnimado, MenuCelular, CarregandoA…
    estrada/    Estrada, Etapa, Placa: a estrada com placas que se repete no site
    cidade/     Skyline, MapaIlustrado, MapaReal, MapaDaEntrega
  pages/        uma tela por rota, com as peças de cada uma em subpastas
  motion/       os efeitos (GSAP), um arquivo por efeito, e o scroll suave
  styles/       tokens.css (cores, tamanhos, espaços e tempos) e base.css
public/         robots.txt
scripts/        sem-exemplos.js, a trava do build
backend/        a API e o banco (Express, Prisma e PostgreSQL), com package.json próprio
docs/
  plano/        o plano do site: telas, efeitos, API e dados, Git e revisão
  referencia/   as pranchas do design (HTML e prints em 1440 e 390 px) e a marca
  backend/      requisitos, modelo de dados, arquitetura e exemplos de chamadas da API
```

## Rotas

| Rota | Tela | Pedido à API |
| --- | --- | --- |
| `/` | Landing: hero, como funciona, a plataforma, rastrear, quem faz | Nenhum |
| `/rastreamento` | Busca pelo código | Nenhum |
| `/rastreamento/:codigo` | Resultado do rastreio, com a estrada das etapas e o mapa | `GET /public/tracking/:code` |
| `/contato` | Fale com a gente | `POST /public/contact` |
| `/contato/enviado/:protocolo` | Mensagem enviada, com o protocolo | Nenhum |
| `/login` | Entrar na plataforma | `GET /auth/me` (já tem sessão?) e `POST /auth/login` |
| `/recuperar-senha` | Pedir o link pra criar uma senha nova | `POST /auth/password-reset/request` |
| `/nova-senha/:token` | Criar a senha nova | `POST /auth/password-reset/confirm` |
| `/privacidade` | Política de Privacidade | Nenhum |
| `/app/*` | Área da plataforma (ainda vazia) | Nenhum por enquanto |
| qualquer outra | Página não encontrada | Nenhum |

O formato de cada pedido e de cada erro está em `docs/plano/04-api-e-dados.md`.

## Tecnologias

| Camada | Escolha | Por quê |
| --- | --- | --- |
| Base | React 19 + Vite | O PDF do TCC aceita React. Vite é o padrão atual |
| Rotas | React Router | O PDF cita "tratamento de rotas" no consumo de API |
| Estilo | CSS puro com variáveis + CSS Modules | As cores e medidas da marca ficam todas em `tokens.css` |
| Fonte | Fira Sans (`@fontsource/fira-sans`) | Fonte da marca, servida pelo próprio site |
| Efeitos | GSAP 3 (ScrollTrigger, MotionPath, DrawSVG) + `@gsap/react` | Plugins grátis. O `useGSAP()` desfaz os efeitos ao trocar de página |
| Scroll suave | Lenis, no relógio do GSAP | Fica em sincronia com o ScrollTrigger |
| Mapa | MapLibre GL + `react-map-gl`, dados do OpenFreeMap | Mapa de verdade com as cores da marca e sem chave de API. Só carrega no rastreamento |
| Chamadas à API | `fetch` em `src/api` | Uma dependência a menos |
| Qualidade | oxlint | Confere o código rápido |

## Acessibilidade e movimento reduzido

- Foco sempre visível, link "Pular para o conteúdo" e, ao trocar de página, o título da aba muda e o foco vai pro título da tela.
- Botão pra ação e link pra navegação. Todo campo tem rótulo, e o erro só aparece depois que a pessoa sai do campo ou tenta enviar, ligado ao campo por `aria-describedby`.
- Alvos de toque de 44 px ou mais e texto com contraste de 4,5:1 ou mais.
- O menu do celular prende o foco, fecha com Esc e devolve o foco pro botão.
- A abertura pula com clique, toque ou qualquer tecla.
- Com "reduzir movimento" ligado no sistema, nenhum efeito anima: cada um já aparece no estado final, e nenhum conteúdo depende de efeito pra aparecer.

Medido em 04/11/2026 com o Lighthouse no build de produção (o rastreamento com os dados de exemplo): acessibilidade 100 em todas as rotas, desempenho no celular 91 na landing e 99 no rastreamento. Testado no Chrome, no Edge e no Firefox, em 1440 e 390 px.

## Git

- `main`: o que está pronto pra apresentar. `dev`: onde as fases se juntam. Uma branch por tela ou efeito (`fase-3/jornada`), saindo de `dev`.
- Commits em português, um assunto por commit: `tipo(escopo): resumo` (`feat`, `fix`, `perf`, `style`, `refactor`, `docs`, `test`).
- Uma tag por fase, de `v0.1.0` (base) a `v1.0.0` (versão da apresentação). As etapas estão em `ETAPAS.md`.

## Back-end e banco de dados

A API e o banco ficam em `backend/`: Express 5, Prisma 7 e PostgreSQL 16, em TypeScript. As dependências e os comandos são separados dos do site.

```bash
cd backend
npm install
cp .env.example .env
```

O banco precisa estar no ar antes dos próximos comandos. Com Docker:

```bash
docker compose up -d
```

Depois, as tabelas, os dados de demonstração e a API:

```bash
npm run db:deploy
npm run db:seed
npm run dev
```

- API: http://localhost:3333/api
- Documentação (Swagger): http://localhost:3333/api/docs

| Comando, dentro de `backend/` | O que faz |
| --- | --- |
| `npm run dev` | API com recarga automática |
| `npm test` | Testes (Vitest e Supertest) |
| `npm run lint` | Confere o código com o ESLint |
| `npm run build` | Compila pra `dist/` |
| `npm run db:deploy` | Aplica as migrations |
| `npm run db:seed` | Carrega os dados de demonstração |
| `npm run test:smoke` | Com a API ligada, testa login, permissões, CRUD e simulação |

Sem Docker, `npm run db:dev` sobe um PostgreSQL local do Prisma. Dois cuidados, vistos em 16/11/2026:

- Use no `.env` a `DATABASE_URL` que o comando mostra e `DATABASE_POOL_MAX=1`. Com mais de uma conexão, esse banco local mistura as respostas e a API devolve erro 500.
- Num computador onde o banco `urbanlink` ainda não existe, o comando tenta usar a porta da API (`PORT`) pra tudo e não termina de subir. Passe as portas na mão (`npx prisma dev --name urbanlink --port 51213 --db-port 51214 --shadow-db-port 51215`) e troque o `PORT` da API no `.env`.

Os documentos estão em `docs/backend/`: requisitos, modelo de dados (conceitual, lógico e físico), arquitetura e exemplos de chamadas.

Pra recuperar senha sem serviço de e-mail, o link de senha nova aparece no terminal da API (só fora de produção). Ele vale 30 minutos (`PASSWORD_RESET_TTL_MINUTES`) e aponta pro endereço do site em `APP_URL`.

### Site e API juntos

O rastreio, o contato, o login e a recuperação de senha do site usam esta API. Com a API ligada (`npm run dev` dentro de `backend/`), rode o site com:

```bash
npm run dev:api
```

Um banco que já existia antes de 20/11/2026 precisa das migrations novas (histórico das entregas, protocolo do contato e senha nova). Dentro de `backend/`:

```bash
npm run db:deploy
```

O que o site usa de cada rota, e como traduz pros nomes das telas, está em `docs/plano/04-api-e-dados.md`.
