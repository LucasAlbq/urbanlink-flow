# Handoff: Rastreamento (`/rastreamento` e `/rastreamento/:codigo`)

Fonte: `docs/referencia/Rastreamento.html`, `Rastreamento-Nao-Encontrado.html` e os prints em 1440 e 390 px. Estados e textos em `docs/plano/03-telas-e-estados.md`; formato da resposta em `docs/plano/04-api-e-dados.md`.

## Visão geral

A pessoa digita o código e vê em que ponto do caminho a entrega está: a estrada com as quatro placas (Postado, Em trânsito, Em rota, Entregue), o mapa e um bloco de ajuda. Tudo que é dado (código, status, datas, cidades, previsão) vem da API. Sem API, só com `VITE_USAR_EXEMPLOS=true`.

| Bloco | Fundo | Conteúdo |
| --- | --- | --- |
| Topo | Marinho (continua o `Header`) | h1 "Rastrear uma entrega.", texto de apoio, formulário de busca (`role="search"`) |
| Resultado | Névoa (`aria-label="Resultado"`) | "Entrega CODIGO", h2 do status, previsão, `Estrada`, mapa, bloco de ajuda |

## Layout

- Conteúdo com `max-width: var(--largura)` e margem lateral `var(--margem)`.
- Topo: `padding` `clamp(24px, 4vw, 48px)` em cima e `clamp(56px, 7vw, 96px)` embaixo. Duas colunas em `flex-wrap` (texto 420 px de base, formulário 460 px), `align-items: flex-end`, gap 32 × 64.
- Resultado: `padding` `var(--secao)`. Cabeçalho em `flex-wrap` com `space-between` (código + h2 à esquerda, previsão à direita), `margin-bottom: var(--titulo-secao-2)`.
- Estrada: 4 colunas iguais (1 coluna no "não encontrado").
- Mapa: `margin-top: var(--titulo-secao)`, moldura branca com borda Noite 2 px e raio `--r-cartao`; barra de 56 px com linha de 1 px `--mapa-quadra`; área com altura `clamp(320px, 46vw, 640px)`.
- Ajuda: `margin-top: var(--titulo-secao-2)`, fundo Branco, raio `--r-cartao`, contorno de 2 px `--mapa-quadra`, padding `28px clamp(20px, 3vw, 36px)`.

## Tokens

| Token | Valor | Uso |
| --- | --- | --- |
| `--h1-pagina` (novo) | `clamp(2.5rem, 5vw, 4.5rem)` | h1 do topo |
| `--h2-status` (novo) | `clamp(2rem, 3.8vw, 3.25rem)` | h2 do status |
| `--t-placa-pequena` (novo) | `clamp(1.25rem, 1.6vw, 1.5rem)` | nome da placa no rastreamento |
| `--topo-pagina` / `--topo-pagina-fim` (novos) | `clamp(24px, 4vw, 48px)` / `clamp(56px, 7vw, 96px)` | respiro do topo |
| `--mapa-caixa` (novo) | `clamp(320px, 46vw, 640px)` | altura do mapa |
| `--cartao-margem` (novo) | `clamp(20px, 3vw, 36px)` | padding lateral do bloco de ajuda |
| `--corpo` | `clamp(1.0625rem, 1.3vw, 1.25rem)` | apoio do topo |
| `--marinho` | #242F62 | texto secundário no Névoa ("Entrega", cidades, apoio) |
| `--cinza` | #5A6285 | placa próxima, "Atualizado em tempo real" |
| `--estrada-futura` | #C5CBE3 | trecho, poste e seta ainda não percorridos |

## Componentes

| Componente | Uso | Mudança pedida pela tela |
| --- | --- | --- |
| `Header` | Topo, "Rastrear entrega" com `aria-current` | Nenhuma |
| `BuscaRastreio` (novo, extraído da landing) | Formulário do topo e da seção Rastrear da landing | Mesma regra: tira espaços, maiúsculas, vai pra `/rastreamento/CODIGO`; vazio mostra "Digite o código de rastreio." |
| `Campo` | Campo escuro grande com o botão "Rastrear" ao lado | Nenhuma |
| `Estrada` / `Etapa` | Etapas da entrega | `pacoteEm` aceita `'fim'` (entregue); poste e seta ficam claros no trecho `futuro` |
| `Placa` | 4 placas | Estados novos `feito` (Ouro + check) e `proximo` (contorno tracejado `--cinza`); glifo `check`; `tamanho="pequeno"`; glifo opcional |
| `MapaIlustrado` | Mapa da entrega | Prop `progresso` (0 a 1): trecho feito em Ouro, resto pontilhado Noite, pacote no ponto |
| `CarregandoA` (novo, parado) | Estado carregando | O A da logo + texto em `aria-live`; só aparece depois de 300 ms. A animação entra na fase 3 |
| `Botao` | `ouro` (Rastrear), `noite` (Tentar outro código / Tentar de novo), `link` (Falar com a gente) | Nenhuma |

## Estados

| Estado | Quando | O que aparece |
| --- | --- | --- |
| Sem código | `/rastreamento` | Topo + estrada vazia (4 placas `proximo`, trechos claros) e "Digite o código pra ver em que ponto do caminho a entrega está." |
| Carregando | pedido em andamento | `CarregandoA` "Buscando a entrega…" (depois de 300 ms) |
| Em andamento | `POSTADO`, `EM_TRANSITO`, `EM_ROTA` | Feitas com check, atual Amarela com seta e o pacote, próximas com contorno; mapa com progresso |
| Com imprevisto | `IMPREVISTO` | Placa 3 vira "Imprevisto" (Amarela, glifo desvio) com o motivo; previsão = `novaPrevisao` |
| Entregue | `ENTREGUE` | Todas com check, pacote na seta Ouro, mapa com a rota inteira |
| Não encontrado | `404 ENTREGA_NAO_ENCONTRADA` | Prancha `Rastreamento-Nao-Encontrado`: placa "?" numa estrada clara, "Tentar outro código" + "Falar com a gente" |
| Erro de conexão | sem resposta, 5xx ou tempo limite | "Não deu pra buscar agora. Tente de novo em alguns segundos." + "Tentar de novo" |

Mapa de placas por status: tabela de `04-api-e-dados.md`. Texto embaixo de cada placa: data e hora do evento (`20/10/2026, 14:42`) + local. Placa 4 ainda não chegada: "Previsão: DD/MM/AAAA" + "Ainda não chegou". Próximas do meio ficam sem texto.

## Interações

| Elemento | Estado | Comportamento |
| --- | --- | --- |
| Rastrear | enviar | mesma regra da landing; trocar o código refaz a busca |
| `/rastreamento/UL…` aberto direto | carga | busca começa sozinha com o campo preenchido |
| Resultado | chegou | foco vai pro h2 do status (`tabIndex={-1}`) |
| Tentar outro código | clique | `<button>`: limpa nada, só leva o foco pro campo |
| Tentar de novo | clique | refaz o pedido |
| Botões e links | hover/foco | os mesmos da landing; anel Noite no Névoa |

## Responsivo

| Largura | Muda |
| --- | --- |
| ≤ 1100 px | links do topo viram o botão de menu (já no `Header`) |
| ≤ 760 px | estrada vertical; mapa com `aspect-ratio: 960 / 560`; botão "Rastrear" desce pra baixo do campo (quebra do `flex-wrap`) |
| ≤ 600 px | "Entrar na plataforma" sai do topo |

## Decisões fora da prancha

- **"Receber atualizações por e-mail" sai** (03-telas-e-estados.md: sem endpoint, o botão sai). Junto sai a frase "Ou receba cada mudança de etapa no seu e-mail."
- **Placa próxima com contorno tracejado**, como o plano pede (o print mostra sólido). Decidido em 03/11/2026. O quadrinho do número continua sólido. O contorno é um `outline` pra dentro, então a placa tem o mesmo tamanho da prancha.
- **Pacote no mapa desenhado:** o mapa não é geográfico, então o ponto vem do status (Postado no início, Em trânsito na 2ª curva, Em rota onde a prancha mostra, Entregue no fim). O `MapaReal` da fase 4 usa `rota` e `posicaoAtual` da API.

## Efeitos (fase 3, não entram agora)

Status do rastreamento (trechos se preenchem 0,25 s cada, pacote desliza 0,8 s `ul`, mapa desenha o trecho 0,8 s) e a espera com o A. `data-*` mantidos: `data-estrada`, `data-etapa`, `data-asfalto`, `data-faixa`, `data-pacote`, `data-fim`, `data-mapa-feito`, `data-mapa-pacote`.

## Acessibilidade

- Foco: pular → logo → topo → campo → Rastrear → (resultado) h2 por código → Falar com a gente → rodapé.
- Estrada em `<ol aria-label="Etapas da entrega">`; número e nome da placa são texto. Estado da placa dito em texto escondido ("feita", "etapa atual", "ainda não").
- Mapa: `role="img"` com `aria-label` que descreve o ponto do caminho.
- Carregando e erro em `aria-live="polite"`.
