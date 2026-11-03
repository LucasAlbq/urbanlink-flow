# Handoff: Política de Privacidade (`/privacidade`)

Fonte: `docs/referencia/Politica.html` e os prints `Politica-1440.png` / `Politica-390.png`. Regras em `docs/plano/03-telas-e-estados.md` ("Política de Privacidade") e no `ETAPAS.md` (etapa 3).

## Visão geral

Página de texto: quais dados o site coleta, pra quê e o que a pessoa pode pedir. O texto é **rascunho** e tem lacunas entre colchetes que o grupo precisa preencher antes de publicar: `[data]`, `[prazo a definir pelo grupo]` e `[e-mail do responsável pelos dados]`. Elas aparecem marcadas (`Lacuna`), como na prancha, pra ninguém esquecer.

A política promete duas coisas que o código precisa cumprir: senha guardada com hash no back-end e nenhum cookie de estatística ou propaganda.

| Bloco | Fundo | Conteúdo |
| --- | --- | --- |
| Topo | Marinho (continua o `Header`) | h1, apoio, "Última atualização: [data]" |
| Corpo | Branco | Índice "Nesta página" (240 px, fixo ao rolar) e as sete seções |

Seções (id → título): `quem` Quem somos · `dados` Que dados o site coleta · `uso` Pra que usamos · `cookies` Cookies · `tempo` Por quanto tempo guardamos · `direitos` Seus direitos · `pedir` Como fazer um pedido. O texto de cada uma é o da prancha, sem mudar nada.

## Layout

- Topo igual ao do contato (`--topo-pagina`, `--topo-pagina-fim`, gap 16), h1 em `--h1-pagina`, apoio em `--corpo` com `max-width: 46ch`. A data: 15 px, `--texto-2`, `line-height: normal`.
- Corpo: `padding: var(--secao) var(--margem)`, fundo Branco. Grade `240px 1fr` com gap `clamp(32px, 6vw, 96px)`, `align-items: start`.
- Índice: `position: sticky; top: 24px`. "Nesta página" 15 px 600 `--cinza`, 12 px até a lista. Lista com borda esquerda de 2 px `--estrada-futura`; cada item com `padding-left: 22px` e um ponto de 12 px sobre a borda (`left: -7px`): Noite no item atual, `--estrada-futura` nos outros. Link 16 px, `min-height: 44px`, sem sublinhado; o atual em 700, os outros em 500.
- Seção: coluna com gap 14, `padding: 28px 0`, linha de 1 px `--mapa-quadra` em cima. h2 em `--h2-texto`, 800, `line-height: 1.15`. Parágrafos de 18 px, `line-height: 1.65`, `--marinho`, `max-width: 68ch`. O link "Fale com a gente" é 600 Noite, com sublinhado a 4 px.
- Lacuna: fundo `--lacuna`, texto Noite 600, raio 4 px, `padding: 0 6px`.

## Tokens

| Token | Valor | Uso |
| --- | --- | --- |
| `--h2-texto` (novo) | `clamp(1.5rem, 2.2vw, 1.875rem)` | títulos das seções |
| `--indice-largura` (novo) | `240px` | coluna do índice |
| `--gap-indice` (novo) | `clamp(32px, 6vw, 96px)` | entre o índice e o texto |
| `--lacuna` (novo) | #FBE8BF | fundo das lacunas a preencher |
| `--r-lacuna` (novo) | `4px` | raio da lacuna |
| `--mapa-quadra` | #D6DCEA | linha entre as seções |
| `--estrada-futura` | #C5CBE3 | linha e pontos do índice |
| `--cinza` | #5A6285 | "Nesta página" |

## Componentes

| Componente | Uso | Mudança pedida pela tela |
| --- | --- | --- |
| `Header` / `Rodape` | Topo e rodapé | Nenhuma |
| `Lacuna` (novo) | `[data]`, `[prazo…]`, `[e-mail…]` | Um `<span>` marcado; também vai no "link enviado" do recuperar senha |

## Estados

| Estado | Quando | O que aparece |
| --- | --- | --- |
| Sem âncora | `/privacidade` | Índice com "Quem somos" marcado |
| Com âncora | `/privacidade#cookies` ou clique no índice | O item da âncora fica marcado (`aria-current="location"`) e o foco vai pra seção (o `Layout` já faz isso) |

## Responsivo

| Largura | Muda |
| --- | --- |
| ≤ 1100 px | links do topo viram o botão de menu |
| ≤ 900 px | Uma coluna: o índice vem antes do texto e deixa de ficar fixo |
| ≤ 600 px | "Entrar na plataforma" sai do topo |

## Decisões fora da prancha

- **O item marcado do índice segue a âncora da URL.** A prancha mostra "Quem somos" marcado. Sem âncora continua assim; clicando em outro item, ele passa a ser o marcado. Não segue a rolagem: isso seria um efeito, e a aba Efeitos não tem.
- **As lacunas ficam à mostra**, como na prancha e no `ETAPAS.md`. Antes de publicar, o grupo troca o texto delas.

## Efeitos (fase 3, não entram agora)

Nenhum próprio da página.

## Acessibilidade

- `<nav aria-label="Nesta página">` com os links das seções; o ponto de cada item é `aria-hidden`.
- Foco: pular → topo → itens do índice → link "Fale com a gente" no texto → rodapé.
- Cada `<section>` tem `id` e um h2; ao seguir um link do índice, o foco vai pra seção.
