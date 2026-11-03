# Handoff: Landing (`/`)

Fonte: `docs/referencia/Landing.html` e os prints `Landing-1440.png` / `Landing-390.png`. Textos e estados em `docs/plano/03-telas-e-estados.md`.

## Visão geral

Página de entrada do site. Não mostra nenhum dado da API. Seis blocos em sequência, alternando fundo escuro e claro:

| Seção | id | Fundo | Conteúdo |
| --- | --- | --- | --- |
| Hero | `inicio` | Marinho | h1, texto de apoio, botão "Entrar na plataforma" + link "Ver como funciona", cidade em 3 camadas com a rota e o pacote |
| Jornada | `como-funciona` | Névoa | h2 "Do galpão à porta.", texto, `Estrada` com 4 placas (Saída, Rota, Imprevisto, Entrega) |
| Plataforma | `plataforma` | Branco | h2 "Por dentro da plataforma.", ilustração da plataforma (`role="img"`) com o `MapaIlustrado` |
| Rastrear | `rastrear` | Marinho | h2, texto, formulário de busca (`role="search"`) |
| Sobre | `sobre` | Névoa | h2 "Quem faz a UrbanLink Flow." + dois parágrafos + link "Falar com a equipe" |
| Chamada | `entrar` | Noite | h2, texto, botão + link, o A grande da logo saindo pela direita |

Topo (`Header`) sobre o Marinho do hero e `Rodape` em Noite.

## Layout

- Conteúdo com `max-width: var(--largura)` e margem lateral `var(--margem)`; seções com `var(--secao)` em cima e embaixo.
- Hero: `min-height` 900 px na prancha (com o topo). A cidade fica `position: absolute` no pé, 520 px de altura, `preserveAspectRatio="xMidYMax slice"`.
- Jornada: grade de 4 colunas iguais.
- Plataforma: título e texto lado a lado (`flex-wrap`), moldura com borda Noite 2 px e raio `--r-cartao`; dentro, barra Noite de 56 px e corpo em 232 px + resto.
- Rastrear e Chamada: duas colunas em `flex-wrap` (texto 420/520 px de base, formulário/A 460/360 px).
- Sobre: grade 7fr / 5fr (`.split`).

## Componentes

| Componente | Uso na landing | Observações |
| --- | --- | --- |
| `Logo` | Topo (188 × 30), barra da plataforma (125 × 20), rodapé (163 × 26) | Letras em Branco no escuro; LINK e o A em Ouro |
| `Botao` | `ouro` (hero, rastrear, chamada), `contorno` (Entrar no topo) | Com `href` vira link. Alturas 56 px (grande) e 44 px |
| `Estrada` / `Etapa` / `Placa` | Jornada | Placas `normal` (Ouro) e `atual` (Amarelo, glifo `desvio`) |
| `Skyline` | Hero | Três SVGs: fundo, meio (com rota, seta e pacote), frente |
| `MapaIlustrado` | Plataforma | Quadras, parques, rio, avenida, rota Ouro, início e seta |
| `Campo` | Rastrear | Campo escuro (sem borda), com o botão "Rastrear" ao lado |

## Estados e interações

| Elemento | Estado | Comportamento |
| --- | --- | --- |
| Botão Ouro | hover | brilho branco 14 % por dentro (`--brilho`) |
| Botão | apertado | escala 0,97 (transição entra na fase 3) |
| Links de texto | hover | sublinhado engrossa de 2 para 3 px |
| Links e botões | foco | anel Amarelo no escuro, Noite no claro |
| Campo de rastreio | vazio ao enviar | "Digite o código de rastreio." ligado por `aria-describedby`, não sai da página |
| Campo de rastreio | enviado | tira espaços, passa pra maiúsculas e vai pra `/rastreamento/CODIGO` |
| Botão de menu | < 1100 px | `<button>` "Abrir menu" com `aria-expanded`; o painel entra na fase 2 |

## Responsivo

| Largura | Muda |
| --- | --- |
| ≤ 1100 px | links do topo somem, aparece o botão de menu |
| ≤ 760 px | estrada vertical (asfalto à esquerda, placa e texto à direita, sem poste), cidade do hero passa a ocupar 300 px no fluxo, A da chamada com no máximo 250 px, menu lateral da plataforma só com ícones (60 px) |
| ≤ 600 px | "Entrar na plataforma" sai do topo |

## Efeitos (fase 3, não entram agora)

Entrada do hero (`.rise`), parallax da cidade, jornada travada, pacote andando na rota, A se desenhando. Os elementos levam `data-*` estáveis pra GSAP achar sem depender dos nomes dos CSS Modules:
`data-camada="fundo|meio|frente"`, `data-estrada`, `data-etapa`, `data-poste`, `data-placa`, `data-texto`, `data-asfalto`, `data-faixa`, `data-pacote`, `data-fim`.

## Acessibilidade

- Ordem do foco: pular para o conteúdo → logo → links do topo → Entrar na plataforma → botões do hero → campo de rastreio → Rastrear → Falar com a equipe → botões da chamada → rodapé.
- Desenhos com `aria-hidden`; a ilustração da plataforma é uma imagem só (`role="img"` + `aria-label`).
- A jornada é uma `<ol>`; o número e o nome da placa são texto real.
- Âncoras (`#como-funciona`) funcionam de qualquer página (`/#como-funciona`).
