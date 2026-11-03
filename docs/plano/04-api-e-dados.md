# API e dados

O que o front espera do back-end. É uma proposta pra combinar com quem faz a API.

## Regras gerais

O front fala com a API por um único arquivo, `src/api/cliente.js`. Nenhuma tela chama `fetch` direto.

- **Endereço:** `VITE_API_URL`, por exemplo `http://localhost:3000/api`.
- **Formato:** JSON, nomes em português e camelCase (`novaPrevisao`).
- **Datas:** ISO 8601 com fuso (`2026-10-23T16:22:00-03:00`). O front formata.
- **Tempo limite:** 10 s por pedido.
- **Erro:** sempre no mesmo formato; a tela decide a mensagem pelo `erro`:

```json
{ "erro": "VALIDACAO", "mensagem": "Alguns campos estão inválidos.", "campos": { "email": "E-mail inválido." } }
```

- **Autenticação:** de preferência cookie `httpOnly` e `SameSite=Lax` definido pela API. Se for token (JWT), guardar só na memória, nunca no `localStorage`.
- **CORS:** a API aceita `http://localhost:5173` em desenvolvimento.

## Rastreio

`GET /entregas/rastreio/:codigo`

```json
{
  "codigo": "UL123456789BR",
  "status": "EM_ROTA",
  "previsao": "2026-10-24",
  "eventos": [
    { "etapa": "POSTADO",     "data": "2026-10-20T14:42:00-03:00", "local": "São Paulo, SP" },
    { "etapa": "EM_TRANSITO", "data": "2026-10-21T07:21:00-03:00", "local": "São Paulo, SP" },
    { "etapa": "EM_ROTA",     "data": "2026-10-23T16:22:00-03:00", "local": "Rio de Janeiro, RJ" }
  ],
  "imprevisto": null,
  "rota": { "type": "LineString", "coordinates": [[-43.36, -23.0], [-43.34, -22.99]] },
  "posicaoAtual": [-43.35, -22.995]
}
```

O código, as datas e as cidades são os do Figma; as coordenadas são inventadas. Tudo é só exemplo de formato. Com imprevisto: `"imprevisto": { "motivo": "…", "novaPrevisao": "2026-10-25" }`.

| Status | Placa 1 (Postado) | Placa 2 (Em trânsito) | Placa 3 (Em rota) | Placa 4 (Entregue) | Título |
| --- | --- | --- | --- | --- | --- |
| `POSTADO` | atual | próxima | próxima | próxima | Postado |
| `EM_TRANSITO` | feita | atual | próxima | próxima | Em trânsito |
| `EM_ROTA` | feita | feita | atual | próxima | Em rota de entrega |
| `IMPREVISTO` | feita | depende de onde parou | vira Imprevisto | próxima | Teve um imprevisto no caminho |
| `ENTREGUE` | feita | feita | feita | feita, seta acesa | Entregue |

Código inexistente: `404 { "erro": "ENTREGA_NAO_ENCONTRADA" }`. Sem `rota`/`posicaoAtual`, a tela usa o mapa ilustrado.

## Contato, login e senha

| Pedido | Corpo | Sucesso | Erros |
| --- | --- | --- | --- |
| `POST /contatos` | `nome`, `email`, `telefone`?, `empresa`?, `assunto`, `mensagem`, `aceitouPrivacidade: true` | `201 { "protocolo": "ULS20261246", "criadoEm": "…" }` | `422 VALIDACAO`; `429` |
| `POST /auth/login` | `email`, `senha`, `manterConectado` | `200 { "usuario": { "id", "nome", "papel" } }` + cookie | `401 CREDENCIAIS_INVALIDAS`; `429 MUITAS_TENTATIVAS` |
| `POST /auth/sair` | — | `204` | — |
| `GET /auth/eu` | — | `200` com o usuário | `401` sem sessão |
| `POST /auth/recuperar-senha` | `email` | `202` sempre (não revela se a conta existe) | `429 MUITAS_TENTATIVAS` |
| `POST /auth/nova-senha` | `token`, `senha` | `204` | `400 TOKEN_INVALIDO`; `422 VALIDACAO` |

- `assunto`: `ORCAMENTO`, `DUVIDA_ENTREGA`, `PARCERIA` ou `OUTRO`.
- `/auth/eu`: a área `/app` chama ao abrir; `401` manda pro `/login?volta=…`.
- O contato vira registro numa tabela `contatos` (entra no CRUD do PDF). O protocolo é gerado pelo back-end.

## Dados de exemplo

Dado de exemplo só existe no computador de quem programa. Nunca chega no site publicado.

- **Onde:** `src/api/exemplos/`, no formato desta página (valores do Figma).
- **Quando:** só com `VITE_USAR_EXEMPLOS=true` no `.env.local` (fora do Git).
- **Aviso:** com exemplos ligados, aparece a faixa "Dados de exemplo" na tela.
- **Trava no build:** `scripts/sem-exemplos.js` roda depois do `vite build` e procura `UL123456789BR` e `ULS20261246` em `dist/`. Se achar, o build falha.

```
"scripts": { "build": "vite build && node scripts/sem-exemplos.js" }
```
