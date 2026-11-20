# API e dados

O que o site usa da API em `backend/`. Começou como proposta; desde 20/11/2026 descreve o que a API responde de verdade. O contrato completo, com todas as rotas, está no Swagger (`http://localhost:3333/api/docs`).

## Regras gerais

O site fala com a API por um único arquivo, `src/api/cliente.js`. Nenhuma tela chama `fetch` direto.

- **Endereço:** `VITE_API_URL`, por exemplo `http://localhost:3333/api`.
- **Formato:** JSON, nomes em inglês e camelCase (`estimatedArrival`). Cada arquivo de `src/api` traduz pros nomes do site, então as telas continuam com `codigo`, `previsao`, `protocolo`.
- **Datas:** ISO 8601 em UTC (`2026-10-23T19:22:00.000Z`). O site mostra no horário de Brasília.
- **Tempo limite:** 10 s por pedido.
- **Sucesso:** `{ "success": true, "data": … }`. O `pedir()` devolve só o `data`.
- **Erro:** sempre no mesmo formato. A tela decide a mensagem pelo código, nunca pelo texto:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Os dados enviados são inválidos.",
    "details": { "properties": { "email": { "errors": ["Invalid email address"] } } }
  }
}
```

O `cliente.js` troca o código da API pelo do site:

| API | Site |
| --- | --- |
| `VALIDATION_ERROR` (422) | `VALIDACAO`, com os campos recusados em `campos` |
| `RATE_LIMITED` (429) | `MUITAS_TENTATIVAS` |
| `UNAUTHORIZED` (401) | `NAO_AUTENTICADO` |
| `TRACKING_NOT_FOUND` (404) | `ENTREGA_NAO_ENCONTRADA` |
| `INVALID_RESET_TOKEN` (400) | `TOKEN_INVALIDO` |
| a API não respondeu | `SEM_CONEXAO` |

- **Autenticação:** cookie `httpOnly` `urbanlink_session` (SameSite=Lax), gravado pela API no login. O site não guarda nem vê o token. O login também devolve o token no corpo, pra Swagger, Postman e testes usarem no cabeçalho `Authorization`.
- **CORS:** a API aceita a origem de `CORS_ORIGIN` (`http://localhost:5173` em desenvolvimento), com cookies.

## Rastreio

`GET /public/tracking/:code` (60 consultas por IP a cada 15 minutos)

```json
{
  "trackingCode": "ULF-2026-0009",
  "status": "IN_TRANSIT",
  "estimatedArrival": "2026-11-20T21:00:00.000Z",
  "serviceDeadline": "2026-11-20T22:00:00.000Z",
  "deliveredAt": null,
  "createdAt": "2026-11-20T13:00:00.000Z",
  "updatedAt": "2026-11-20T15:00:00.000Z",
  "events": [
    { "status": "PENDING", "location": "São Paulo, SP", "occurredAt": "2026-11-20T13:00:00.000Z" },
    { "status": "ASSIGNED", "location": "São Paulo, SP", "occurredAt": "2026-11-20T14:00:00.000Z" },
    { "status": "IN_TRANSIT", "location": "São Paulo, SP", "occurredAt": "2026-11-20T15:00:00.000Z" }
  ]
}
```

Os valores são do seed. O histórico (`events`) é gravado pelo trigger `deliveries_record_event` do banco a cada troca de status; `location` traz só cidade e UF. A API não manda endereço, destinatário, veículo, rota nem posição, então o mapa do rastreio é sempre o ilustrado.

`src/api/rastreio.js` traduz assim:

| Status da API | Status da tela | Placa 1 (Postado) | Placa 2 (Em trânsito) | Placa 3 (Em rota) | Placa 4 (Entregue) |
| --- | --- | --- | --- | --- | --- |
| `PENDING` | `POSTADO` | atual | próxima | próxima | próxima |
| `ASSIGNED` | `EM_TRANSITO` | feita | atual | próxima | próxima |
| `IN_TRANSIT` | `EM_ROTA` | feita | feita | atual | próxima |
| `FAILED` ou `CANCELED` | `IMPREVISTO` | feita | depende de onde parou | vira Imprevisto | próxima |
| `DELIVERED` | `ENTREGUE` | feita | feita | feita | feita, seta acesa |

- Cada evento cai na placa do seu status; o de `FAILED` ou `CANCELED` cai na placa 3. Se a entrega passou duas vezes pela mesma etapa, vale o último evento.
- Previsão: `estimatedArrival`; sem ela, o prazo (`serviceDeadline`). Com imprevisto, só `estimatedArrival`.
- A API ainda não tem motivo nem nova previsão pro imprevisto: a placa mostra só a data e a cidade.

Código inexistente: `404 TRACKING_NOT_FOUND`. Código fora do formato (só letras, números e hífen, de 3 a 40): `422`.

## Contato, login e senha

| Pedido | Corpo | Sucesso | Erros |
| --- | --- | --- | --- |
| `POST /public/contact` | `name`, `email`, `phone`?, `company`?, `subject`, `message`, `consent: true` | `201 { id, protocol, createdAt }` | `422`; `429` (8 por hora) |
| `POST /auth/login` | `email`, `password`, `remember`? | `200 { user, token, expiresIn }` + cookie | `401`; `429` |
| `GET /auth/me` | — | `200` com o usuário | `401` sem sessão |
| `POST /auth/logout` | — | `204`, apaga o cookie | — |
| `POST /auth/password-reset/request` | `email` | `202` sempre (não revela se a conta existe) | `429` |
| `POST /auth/password-reset/confirm` | `token`, `password` | `204` | `400 INVALID_RESET_TOKEN`; `422` |

- `subject`: `ORCAMENTO`, `DUVIDA_ENTREGA`, `PARCERIA` ou `OUTRO`. `message`: de 10 a 1.000 caracteres. São as regras do formulário.
- `protocol`: gerado pelo banco (`ULS` + ano + número, ex.: `ULS20260001`).
- `remember` ("Manter conectado"): o cookie dura até o token vencer (`JWT_EXPIRES_IN`, 8 h). Sem ele, o cookie some ao fechar o navegador.
- Senha nova: mínimo de 8 caracteres. O link (`/nova-senha/<token>`) vale `PASSWORD_RESET_TTL_MINUTES` (30 por padrão) e uma vez só. Ainda não há envio de e-mail: fora de produção, o link aparece no terminal da API.
- `/auth/me`: a área `/app` vai chamar ao abrir; `401` manda pro `/login?volta=…`.

## Dados de exemplo

Dado de exemplo só existe no computador de quem programa. Nunca chega no site publicado.

- **Onde:** `src/api/exemplos/`. Eles devolvem já no formato do site (o que cada função de `src/api` devolve), não no formato da API.
- **Quando:** só com `VITE_USAR_EXEMPLOS=true`, que o `.env.development.local` liga no `npm run dev`. O `npm run dev:api` usa o modo `api`, que não lê esse arquivo: os exemplos ficam desligados e o site fala com a API.
- **Aviso:** com exemplos ligados, aparece a faixa "Dados de exemplo" na tela.
- **Trava no build:** `scripts/sem-exemplos.js` roda depois do `vite build` e procura `UL123456789BR` e `ULS20261246` em `dist/`. Se achar, o build falha.

```
"scripts": { "build": "vite build && node scripts/sem-exemplos.js" }
```
