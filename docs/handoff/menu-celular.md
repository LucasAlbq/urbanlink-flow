# Handoff: Menu do celular (`MenuCelular`)

Fonte: `docs/referencia/Menu-Celular.html` e o print `Menu-Celular-390.png` (390 × 844). Comportamento em `docs/plano/03-telas-e-estados.md` ("Landing e menu do celular").

## Visão geral

Abaixo de 1100 px os links do topo viram o botão de menu. O botão abre um painel Noite de tela cheia. Os quatro links (Início, Como funciona, Rastrear entrega, Fale com a gente) são paradas de uma estrada vertical, com o pacote na página atual. A estrada termina numa seta que aponta pro botão "Entrar na plataforma". Embaixo de tudo vem a frase da empresa.

| Bloco | Conteúdo |
| --- | --- |
| Barra | Logo (link pro início) e o botão "Fechar menu" (X), no mesmo lugar do logo e do botão de menu do topo |
| Estrada | `<nav aria-label="Principal">` com a `Estrada` na variante `menu` |
| Entrar | `Botao ouro` "Entrar na plataforma", largura toda |
| Pé | "UrbanLink Systems, tecnologia para logística urbana desde 2017." |

## Layout

- Painel `position: fixed`, tela cheia, fundo Noite, texto Branco, rolagem própria (`overflow-y: auto`). Dentro, uma coluna com `min-height: 100%` e `padding: 24px var(--margem) 32px`, com o mesmo respiro do topo, então o logo e o X caem em cima do logo e do botão de menu.
- Barra: `flex`, `space-between`, gap 16. Logo 188 × 30 num link de 44 px. X: 48 × 48 (`--botao-menu`), borda 2 px `--borda-escura`, raio `--r-botao`, desenho de 26 px com traço Branco de 2,2.
- Estrada: `margin-top: 48px`. Cada parada é uma linha de grade `22px 1fr` com gap 22.
  - Asfalto Marinho (não Noite) com a faixa amarela de 4 px em traços de 22 a cada 42 px, opacidade 0,85.
  - Página atual: o pacote (26 px Amarelo com aro Noite de 4 px, sem halo) no meio da parada. Outras: um ponto de 12 px em `--texto-2`.
  - Seta Ouro de 44 × 42 girada 90°, 24 px pra baixo do fim do asfalto.
  - Link: `min-height: 72px`, 28 px 800, `letter-spacing: -0.015em`, Branco, sem sublinhado. O da página atual tem sublinhado Amarelo de 3 px a 8 px do texto.
- "Entrar na plataforma": `margin-top: 64px`, 56 px, texto 19 px.
- Pé: `margin-top: auto` (vai pro fim da tela), `padding-top: 32px`, 15 px, `line-height: 1.5`, `--texto-2`.

## Tokens

| Token | Valor | Uso |
| --- | --- | --- |
| `--menu-link` (novo) | `72px` | altura de cada parada |
| `--t-menu` (novo) | `1.75rem` | links do menu |
| `--aperto-menu` (novo) | `-0.015em` | `letter-spacing` dos links |
| `--faixa-traco-menu` / `--faixa-ciclo-menu` (novos) | `22px` / `42px` | faixa da estrada do menu |
| `--parada` (novo) | `12px` | ponto das paradas sem o pacote |
| `--fim-menu-largura` / `--fim-menu-altura` / `--fim-menu-recuo` (novos) | `44px` / `42px` / `24px` | seta do fim |
| `--z-menu` (novo) | `80` | painel por cima da página (a faixa de exemplos fica em 90) |
| `--botao-menu` | `48px` | botão X |
| `--marinho` | #242F62 | asfalto do menu |
| `--texto-2` | #C5CBE3 | paradas e pé |

## Componentes

| Componente | Uso | Mudança pedida pela tela |
| --- | --- | --- |
| `MenuCelular` (novo) | O painel. Props `aberto` e `aoFechar` (03-telas-e-estados.md) | Renderiza num portal em `document.body`, fora do `#root` |
| `Header` | O botão de menu abre o painel | `aria-expanded`, `aria-label` "Abrir menu" / "Fechar menu" e `aria-controls`; o foco volta pra ele quando o menu fecha pelo X ou pelo Esc |
| `Estrada` / `Etapa` | As paradas | Variante `menu` (asfalto Marinho, faixas 22/42, pacote no meio, seta 44 × 42, sem respiro no texto) e prop `paradas` (ponto nas etapas sem pacote). A `Etapa` aceita ficar sem placa |
| `Logo` | Barra | Nenhuma |
| `Botao` | `ouro` "Entrar na plataforma" | Nenhuma |

## Estados

| Estado | Quando | O que aparece |
| --- | --- | --- |
| Fechado | padrão | Só o botão de menu no topo (≤ 1100 px) |
| Aberto | apertou o botão de menu | Painel por cima de tudo; o resto da página fica `inert` e não rola |
| Página atual | `/` → Início, `/rastreamento…` → Rastrear entrega, `/contato` → Fale com a gente | Pacote na parada e o link com `aria-current="page"` |
| Sem página atual | outras rotas (política, 404…) | Todas as paradas com o ponto, sem pacote |

## Interações

| Elemento | Estado | Comportamento |
| --- | --- | --- |
| Botão de menu | clique | Abre; o foco vai pro X |
| X | clique | Fecha; o foco volta pro botão de menu |
| Esc | aberto | Fecha; o foco volta pro botão de menu |
| Links, logo, Entrar | clique | Navegam e fecham o menu; o foco vai pro h1 da página nova (o `Layout` já faz isso) |
| Janela passa de 1100 px | aberto | Fecha (o botão de menu some nessa largura) |

## Responsivo

| Largura | Muda |
| --- | --- |
| > 1100 px | Sem botão de menu e sem painel |
| ≤ 1100 px | Botão de menu no topo; o painel ocupa a tela toda, com a margem lateral do topo |

## Decisões fora da prancha

- **Comportamento agora, animação depois.** O `ETAPAS.md` põe o menu na fase 2, mas sem abrir, fechar e prender o foco a tela não passa no teste de teclado da fase 1. Entraram abrir, fechar (X, Esc, link), foco no X, foco de volta, `inert` no resto da página e página parada atrás. Ficam pra depois: a descida de 260 ms com os links entrando a cada 40 ms (fase 3) e o `lenis.stop()` (o Lenis entra com o scroll suave da fase 3). Por enquanto, o resto da página para de rolar porque o `<html>` fica com `overflow: hidden`.
- **Foco no X ao abrir:** fica no mesmo lugar do botão que abriu o menu.
- **"Como funciona" nunca fica marcado**, porque é uma âncora da landing. Na landing, quem fica marcado é "Início".
- **O botão de menu** é `<button>`, como o plano pede (no canvas era link). O X também.

## Efeitos (fase 3, não entram agora)

Abre descendo em 260 ms (`--ease`); links entram com 40 ms de diferença. Reduzido: aparece direto (02-efeitos.md e 03-telas-e-estados.md). `data-estrada` e `data-etapa` ficam pro efeito.

## Acessibilidade

- Painel com `role="dialog"`, `aria-modal="true"` e `aria-label="Menu"`. O resto do app (`#root`) ganha `inert` enquanto o menu está aberto, então o Tab só anda dentro do painel.
- Foco: a ordem segue a tela (logo → X → Início → Como funciona → Rastrear entrega → Fale com a gente → Entrar na plataforma). Ao abrir, o foco começa no X.
- A estrada é decorativa (`aria-hidden` no asfalto); os links são texto.
- Anel de foco Amarelo (fundo escuro).
