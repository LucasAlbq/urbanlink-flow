# Handoff: Mensagem enviada (`/contato/enviado/:protocolo`)

Fonte: `docs/referencia/Contato-Enviado.html` e os prints `Contato-Enviado-1440.png` / `Contato-Enviado-390.png`. Regras em `docs/plano/03-telas-e-estados.md` ("Fale com a gente e mensagem enviada"); o protocolo vem do `201` de `POST /contatos` (`docs/plano/04-api-e-dados.md`).

## Visão geral

Confirma que a mensagem do "Fale com a gente" chegou e mostra o número do protocolo. O único dado da tela é o protocolo, que chega pela URL (o contato da fase 2 navega pra cá com o `protocolo` da resposta). Nada mais vem da API.

| Bloco | Fundo | Conteúdo |
| --- | --- | --- |
| Topo | Marinho | Só o `Header` (sem topo de página) |
| Corpo | Névoa | Cartão branco centrado: mini estrada, h1, apoio, caixa do protocolo, ações |

Textos fixos (da prancha e do plano):

- h1 "Mensagem enviada."
- Apoio: "A equipe já recebeu e responde em até 48 horas, no e-mail que você informou."
- Caixa: "Número do protocolo", o protocolo, "Guarde esse número pra acompanhar o seu pedido."
- Botão "Copiar protocolo" e aviso "Protocolo copiado" (do plano; a prancha não desenha).
- Ações: "Voltar para o início" (vai pra `/`) e "Rastrear uma entrega" (vai pra `/rastreamento`).

## Layout

- Corpo: `padding` `var(--secao) var(--margem)`, conteúdo com `max-width: var(--largura)`.
- Cartão: coluna com gap 28 (`--e-28`), `padding` `var(--cartao-respiro-grande)`, fundo Branco, borda Noite 2 px, raio `--r-cartao`, centrado com `margin: 0 auto`.
  - A prancha não tem `box-sizing` global: os 720 px são só do conteúdo. O cartão usa `box-sizing: content-box` com `max-width: var(--cartao-estreito)`, então em 1440 ele tem 720 + 2 × 56 + 2 × 2 = 836 px.
- Mini estrada: SVG `viewBox="0 0 400 60"`, `width: 100%`, `max-width: var(--mini-estrada)` (360 px, então 54 px de altura).
- Título: coluna com gap 14 (`--e-14`). h1 em `--h1-cartao`, 800, `line-height: 1.02`, `letter-spacing: var(--aperto)`. Apoio 18 px, `line-height: 1.55`, `--marinho`, `max-width: 46ch`.
- Caixa do protocolo: fundo Névoa, raio 10 px (`--r-placa`), `padding: 20px 24px`, gap 6 entre as linhas. Rótulo 16 px 600 Noite; protocolo em `--t-protocolo`, 800, `letter-spacing: 0.04em`; nota 16 px, `line-height: 1.5`, `--marinho`. Rótulo e protocolo sem `line-height` na prancha (`normal`).
  - "Copiar protocolo" fica à direita do protocolo, e o aviso "Protocolo copiado" logo embaixo dele, na linha da nota. Assim a caixa não cresce quando o aviso aparece.
- Ações: `flex-wrap`, `align-items: center`, gap 12 × 28.

## Tokens

| Token | Valor | Uso |
| --- | --- | --- |
| `--h1-cartao` (novo) | `clamp(2.25rem, 4.4vw, 3.5rem)` | h1 dentro do cartão |
| `--t-protocolo` (novo) | `clamp(1.75rem, 3vw, 2.25rem)` | número do protocolo |
| `--cartao-estreito` (novo) | `720px` | largura do conteúdo do cartão |
| `--cartao-respiro-grande` (novo) | `clamp(28px, 4vw, 56px)` | padding do cartão |
| `--mini-estrada` (novo) | `360px` | largura máxima da mini estrada |
| `--aviso-copiado` (novo) | `2000ms` | tempo do aviso "Protocolo copiado" |
| `--secao` | `clamp(72px, 10vw, 140px)` | respiro do corpo |
| `--r-cartao` / `--r-placa` | 14 px / 10 px | cartão / caixa do protocolo |
| `--marinho` | #242F62 | apoio e nota |

## Componentes

| Componente | Uso | Mudança pedida pela tela |
| --- | --- | --- |
| `Header` | Topo; nenhum link com `aria-current` | O link "Fale com a gente" ganhou `end`: antes ficava marcado em `/contato/enviado/…` também. "Rastrear entrega" continua marcado em `/rastreamento/CODIGO` |
| `Botao` | `noite` "Voltar para o início" (`href="/"`, 56 px, texto 18 px); `link` "Rastrear uma entrega" (`href`) e "Copiar protocolo" (sem `href`, vira `<button>`), os dois em 600 | Nenhuma |
| Mini estrada | Ilustração decorativa da própria tela (`aria-hidden`) | Desenho da prancha, não é a `Estrada`: lá a seta tem outra proporção e não há placas. Decidido em 03/11/2026. `data-mini-estrada`, `data-pacote` (o ponto) e `data-fim` (a seta) ficam pro efeito |

## Estados

| Estado | Quando | O que aparece |
| --- | --- | --- |
| Com protocolo | `/contato/enviado/ULS…` | A tela da prancha com o protocolo da URL |
| Sem protocolo | `/contato/enviado` ou protocolo com caractere estranho | Volta pra `/contato` com `replace` (não fica no histórico) |
| Copiado | depois do clique em "Copiar protocolo" | "Protocolo copiado" por 2 s, num `role="status"` que já existe vazio na página. Clicar de novo reinicia os 2 s |
| Sem área de transferência | `navigator.clipboard` indisponível ou negado | O número fica selecionado pra pessoa copiar com Ctrl+C. Nenhum aviso |

## Interações

| Elemento | Estado | Comportamento |
| --- | --- | --- |
| Copiar protocolo | clique / Enter / Espaço | `<button>`: copia o protocolo e mostra o aviso |
| Voltar para o início | clique | vai pra `/` |
| Rastrear uma entrega | clique | vai pra `/rastreamento` |
| Voltar do navegador | — | Esta tela não envia nada. O contato da fase 2 vai pra cá depois do `201`, e o voltar cai no formulário sem reenviar |

## Responsivo

| Largura | Muda |
| --- | --- |
| ≤ 1100 px | links do topo viram o botão de menu (já no `Header`) |
| ≤ 600 px | "Entrar na plataforma" sai do topo; na caixa, "Copiar protocolo" desce pra baixo do número e o aviso vem do lado (ou embaixo, se não couber) |

## Decisões fora da prancha

- **"Copiar protocolo" entra**, como o plano pede, dentro da caixa à direita do número, com cara de link (decidido em 03/11/2026). No desktop a caixa fica com a mesma altura da prancha (139 px em 1440). No celular ela fica 50 px mais alta (a linha do botão) e cresce mais 24 px enquanto o aviso aparece, porque ele não cabe do lado do botão.
- **Protocolo esquisito conta como "sem protocolo"**: só letras, números e hífen, até 40 caracteres. Evita que um link montado mostre qualquer texto como se fosse protocolo.
- **`noindex`**: a página põe `<meta name="robots" content="noindex">` (03-telas-e-estados.md).

## Efeitos (fase 3, não entram agora)

"Mensagem enviada" (02-efeitos.md): ao abrir, o pacote corre a mini estrada (0,6 s `power2.inOut`) e a seta encaixa (0,3 s `back.out(1.7)`). Reduzido: estado final, que é o desenho parado de agora.

## Acessibilidade

- Ao chegar, o foco vai pro h1 "Mensagem enviada." (o `Layout` faz isso ao trocar de rota).
- Foco: pular → logo → topo → Copiar protocolo → Voltar para o início → Rastrear uma entrega → rodapé.
- O aviso fica num `role="status"` (já presente e vazio), então o leitor de tela fala "Protocolo copiado".
- Mini estrada com `aria-hidden="true"`.
