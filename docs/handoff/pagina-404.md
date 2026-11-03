# Handoff: Página não encontrada (404, rota `*`)

Fonte: `docs/referencia/Pagina-404.html` e os prints `Pagina-404-1440.png` / `Pagina-404-390.png`. Texto em `docs/plano/03-telas-e-estados.md` ("Página não encontrada").

## Visão geral

Qualquer endereço que não é uma rota do site cai aqui. O título "Essa rua não existe." vem com uma estrada desenhada: o pacote vai até uma placa de Retorno, e o trecho depois dela é só um contorno tracejado. Embaixo vêm três saídas. Nenhum dado da API.

| Bloco | Fundo | Conteúdo |
| --- | --- | --- |
| Topo | Marinho (continua o `Header`) | h1 "Essa rua não existe." e o texto de apoio |
| Corpo | Névoa | Estrada decorativa com a placa Retorno, depois "Voltar para o início", "Rastrear uma entrega" e "Falar com a gente" |

Textos fixos (da prancha):

- h1 "Essa rua não existe."
- Apoio: "O endereço que você abriu não leva a nenhuma página do site. Pode ser um link digitado errado ou uma página que mudou de lugar."
- Placa "Retorno"; ações "Voltar para o início", "Rastrear uma entrega", "Falar com a gente".

## Layout

- Topo igual ao do contato: `padding` `var(--topo-pagina) var(--margem) var(--topo-pagina-fim)`, h1 e apoio em coluna com gap 16. O h1 usa o `--h1` (o maior do site), 800, `line-height: 1`, `letter-spacing: var(--aperto)`. Apoio em `--corpo`, `line-height: 1.55`, `--texto-2`, `max-width: 46ch`.
- Corpo: `padding` `var(--secao) var(--margem)`.
- Estrada (`aria-hidden`): grade `3fr 2fr`, `align-items: end`.
  - Coluna 1, alinhada à direita: a `Placa` Retorno (Amarelo, sem número, glifo `retorno`) em cima de uma haste de 8 × 44 Noite, com `margin-right: -2px`. Embaixo, o asfalto de 22 px Noite, que ocupa a coluna toda, com a faixa amarela (26/50) e o pacote 200 px antes do fim (`left: max(0px, calc(100% - 200px))`), com aro e halo.
  - Coluna 2: 22 px de altura, contorno de 3 px tracejado `--estrada-futura` sem o lado esquerdo.
- Ações: `flex-wrap`, gap 12 × 28, `margin-top: clamp(48px, 6vw, 72px)`. "Voltar para o início" é `Botao noite` 56 px com texto 18 px; os dois links são 18 px 600 com sublinhado a 6 px.

## Tokens

| Token | Valor | Uso |
| --- | --- | --- |
| `--h1` | `clamp(2.75rem, 5.6vw, 5.5rem)` | h1 |
| `--topo-pagina` / `--topo-pagina-fim` | `clamp(24px, 4vw, 48px)` / `clamp(56px, 7vw, 96px)` | respiro do topo |
| `--tracejado` (novo) | `3px` | contorno do trecho que não existe |
| `--pacote-recuo-404` (novo) | `200px` | distância do pacote até o fim do asfalto |
| `--acoes-404` (novo) | `clamp(48px, 6vw, 72px)` | espaço entre a estrada e as ações |
| `--estrada`, `--faixa`, `--faixa-traco`, `--faixa-ciclo`, `--pacote`, `--pacote-aro`, `--pacote-halo`, `--poste-largura`, `--poste-altura` | os da `Estrada` | asfalto, faixa, pacote e haste |
| `--estrada-futura` | #C5CBE3 | contorno tracejado |

## Componentes

| Componente | Uso | Mudança pedida pela tela |
| --- | --- | --- |
| `Header` | Topo; nenhum link marcado | Nenhuma |
| `Placa` | Retorno | `numero` opcional (sem número, o respiro fica igual dos dois lados: 16 × 22) e o glifo `retorno` |
| Estrada da 404 | Ilustração da própria página | Desenho da prancha, como a mini estrada da mensagem enviada: a placa fica no fim do trecho, o pacote no meio dele e o resto é um contorno. A placa é a `Placa` de verdade |
| `Botao` | `noite` "Voltar para o início"; `link` nos outros dois | Nenhuma |

## Estados

Uma só. A rota `*` pega todo endereço que não casa com as outras rotas (`/app/…` tem a própria rota e não cai aqui).

## Responsivo

| Largura | Muda |
| --- | --- |
| ≤ 1100 px | links do topo viram o botão de menu |
| ≤ 600 px | "Entrar na plataforma" sai do topo |

A estrada fica igual em todas as larguras (a grade 3fr/2fr não muda). Em 390 px o pacote encosta no começo do asfalto, porque a coluna tem menos de 200 px de sobra (`max(0px, …)`).

## Decisões fora da prancha

- **Desenho próprio da página, com a `Placa` de verdade.** A `Estrada` põe a placa no começo de cada trecho e o texto embaixo. Aqui a placa fica no fim, não há texto e o resto da rua é um contorno. Segui a mesma escolha da mini estrada (03/11/2026): desenho da prancha, escondido do leitor de tela.

## Efeitos (fase 3, não entram agora)

A aba Efeitos não tem efeito próprio da 404. `data-pacote` e `data-placa` ficam marcados, se um dia entrar.

## Acessibilidade

- Ao chegar por navegação, o foco vai pro h1 (o `Layout` faz isso).
- Foco: pular → logo → topo → Voltar para o início → Rastrear uma entrega → Falar com a gente → rodapé.
- A estrada inteira é `aria-hidden`, então a placa "Retorno" não é lida (é decoração, como na prancha).
