# Handoff: Fale com a gente (`/contato`)

Fonte: `docs/referencia/Contato.html` e os prints `Contato-1440.png` / `Contato-390.png`. Regras e textos dos campos em `docs/plano/03-telas-e-estados.md` ("Fale com a gente e mensagem enviada"); corpo do pedido em `docs/plano/04-api-e-dados.md` (`POST /contatos`). A tela "Mensagem enviada" (`Contato-Enviado`) tem o próprio handoff.

## Visão geral

A pessoa pede um orçamento, tira uma dúvida ou propõe uma parceria. À esquerda o formulário num cartão branco; à direita a estrada vertical "Como funciona a contratação", com as quatro etapas da contratação. A tela não mostra nenhum dado da API (o protocolo só aparece na próxima tela).

| Bloco | Fundo | Conteúdo |
| --- | --- | --- |
| Topo | Marinho (continua o `Header`) | h1 "Fale com a gente.", texto de apoio |
| Corpo | Névoa | Cartão do formulário (7fr) + coluna da contratação (5fr) |

Textos fixos (da prancha):

- Apoio do topo: "Pra pedir um orçamento, tirar uma dúvida sobre uma entrega ou propor uma parceria. A equipe responde em até 48 horas."
- Cartão: h2 "Envie sua mensagem"; botão "Enviar mensagem".
- Coluna: h2 "Como funciona a contratação" + "Do primeiro contato até a operação rodando."
- Etapas: 1 Solicitação "Você conta o que a sua operação precisa." · 2 Proposta "A equipe envia uma solução sob medida, com condições e prazos." · 3 Acordo "As duas empresas alinham as expectativas." · 4 Contratação "Tudo formalizado, a operação começa."

## Layout

- Conteúdo com `max-width: var(--largura)` e margem lateral `var(--margem)`.
- Topo: `padding` `var(--topo-pagina)` em cima e `var(--topo-pagina-fim)` embaixo; h1 e apoio em coluna com gap 16 (`--e-16`). Apoio com `max-width: 46ch`.
- Corpo: `padding` `var(--secao)`. Grade `minmax(0, 7fr) minmax(0, 5fr)`, gap `var(--gap-split)`, `align-items: start` (a mesma `.split` da seção Sobre da landing).
- Cartão do formulário: coluna com gap 22 (`--e-22`), `padding` `var(--cartao-respiro)`, fundo Branco, borda Noite 2 px (`--borda-botao`), raio `--r-cartao`.
  - h2 com `margin-bottom: 4px` (`--e-4`), então o respiro até a primeira linha de campos é 26 px.
  - Nome/E-mail e Telefone/Empresa em grade de 2 colunas, gap 20 (`--e-20`).
  - Assunto, Mensagem, Política e o botão ocupam a largura toda (o botão fica do tamanho do texto, num `div` próprio).
- Campo (`.fld` da prancha): coluna com gap 8 (`--e-8`); label 15 px 600 Noite com `line-height: normal`; caixa com 52 px de altura mínima, borda 1,5 px `--cinza`, raio `--r-campo`, `padding: 0 14px`, texto 17 px. Área de texto com `padding: 14px`, 140 px de altura mínima, `resize: vertical`, `line-height: 1.5`.
- Política: `label` em `inline-flex`, `align-items: center`, gap 10, altura mínima 44 px (`--alvo`), texto 16 px; caixa de marcar 20 × 20 com `accent-color` Noite. O link "Política de Privacidade" é 600 com sublinhado a 4 px.
- Coluna da contratação: coluna com gap 28 (`--e-28`) e `padding-top: 8px`. Cabeça em coluna com gap 10; apoio 17 px, `line-height: 1.55`, `--marinho`.
- Estrada sempre vertical (`.jr.v`): texto de cada etapa com `padding: 16px 0 44px` e parágrafo de 17 px, `line-height: 1.55`, `max-width: 30ch`, `--marinho`.

## Tokens

| Token | Valor | Uso |
| --- | --- | --- |
| `--h1-pagina` | `clamp(2.5rem, 5vw, 4.5rem)` | h1 do topo |
| `--corpo` | `clamp(1.0625rem, 1.3vw, 1.25rem)` | apoio do topo |
| `--topo-pagina` / `--topo-pagina-fim` | `clamp(24px, 4vw, 48px)` / `clamp(56px, 7vw, 96px)` | respiro do topo |
| `--h2-cartao` (novo) | `clamp(1.5rem, 2.2vw, 2rem)` | h2 do cartão e da coluna |
| `--cartao-respiro` (novo) | `clamp(24px, 3.4vw, 44px)` | padding do cartão do formulário |
| `--area-texto` (novo) | `140px` | altura mínima da Mensagem |
| `--marcar` (novo) | `20px` | caixa de marcar da Política |
| `--gap-split` | `clamp(32px, 5vw, 72px)` | entre o cartão e a coluna |
| `--campo-altura` / `--campo-borda` | `52px` / `1.5px` | caixa dos campos |
| `--t-placa-pequena` | `clamp(1.25rem, 1.6vw, 1.5rem)` | nome da placa |
| `--texto-2` | #C5CBE3 | apoio do topo |
| `--marinho` | #242F62 | apoio da coluna e textos das etapas |
| `--cinza` | #5A6285 | borda dos campos, "(opcional)", placeholder |

## Componentes

| Componente | Uso | Mudança pedida pela tela |
| --- | --- | --- |
| `Header` | Topo, "Fale com a gente" com `aria-current` | Nenhuma |
| `Campo` | Os sete campos | `tipo="select"` (com as opções como `children`), `tipo="textarea"` e `tipo="checkbox"` (caixa antes do texto, erro embaixo). O padrão volta pro `.fld` da prancha (label 15 px, gap 8); o campo `tamanho="grande"` da busca mantém label 16 px e gap 10 |
| `Botao` | `noite` "Enviar mensagem" (`type="submit"`), 56 px, texto 18 px | Nenhuma |
| `Estrada` / `Etapa` / `Placa` | Contratação | `orientacao="vertical"`, placas `normal` com glifo `seta`, `tamanho="pequeno"`; ponto no início e seta Ouro no fim, sem pacote. Correção: a seta do fim ganhou `max-width: none`, porque o `max-width: 100%` global do `svg` a espremia pra 22 px na vertical (afetava também a landing e o rastreamento no celular) |

## Campos

| Campo | Elemento | Atributos | Erro (fase 2) |
| --- | --- | --- | --- |
| Nome completo | `input` `text` | `name="nome"`, `autocomplete="name"`, obrigatório | "Escreva seu nome." |
| E-mail | `input` `email` | `name="email"`, `autocomplete="email"`, obrigatório | "Escreva um e-mail válido, como voce@empresa.com.br." |
| Telefone (opcional) | `input` `tel` | `name="telefone"`, `autocomplete="tel"`, `inputmode="tel"` | "Confira o telefone com o DDD." |
| Empresa (opcional) | `input` `text` | `name="empresa"`, `autocomplete="organization"`, `maxlength="120"` | Nenhuma |
| Assunto | `select` | `name="assunto"`; começa em "Pedir um orçamento"; opções: Pedir um orçamento, Dúvida sobre uma entrega, Parceria, Outro assunto | Nenhuma |
| Mensagem | `textarea` | `name="mensagem"`, placeholder "Conte o que a sua operação precisa.", `maxlength="1000"`, obrigatório | "Conte um pouco mais, pelo menos uma frase." |
| Política | `checkbox` | `name="privacidade"`, obrigatório; link pra `/privacidade` | "Pra enviar, é preciso concordar com a Política de Privacidade." |

"(opcional)" fica dentro do `label`, em 400 `--cinza`.

## Estados

| Estado | Quando | O que aparece |
| --- | --- | --- |
| Normal | abriu a página | Campos vazios, Assunto em "Pedir um orçamento" |
| Com erro | saiu do campo ou tentou enviar (fase 2) | Mensagem embaixo do campo em 15 px 600 Noite, `aria-invalid`, ligada por `aria-describedby`; foco no primeiro campo com erro |
| Contador | Mensagem com 800 caracteres ou mais | "N de 1.000 caracteres" embaixo da caixa, como ajuda do campo |
| Enviando | pedido em andamento (fase 2) | Botão "Enviando…" desabilitado; `CarregandoA` depois de 300 ms |
| 422 | API recusou um campo (fase 2) | A mensagem aparece embaixo do campo certo |
| Sem resposta | API não respondeu (fase 2) | Acima do botão: "Não deu pra enviar agora. Sua mensagem continua aqui: é só tentar de novo." Nada se perde |
| Sucesso | `201` (fase 2) | Vai pra `/contato/enviado/<protocolo>` |

Na fase 1 o formulário não envia: `noValidate` e o envio é barrado (nada vai pra URL nem pra API).

## Interações

| Elemento | Estado | Comportamento |
| --- | --- | --- |
| Caixas | hover | borda passa de `--cinza` pra Noite |
| Caixas | foco | borda Noite + anel Noite |
| Política | clique no texto | marca e desmarca (o `label` envolve a caixa); o link abre a política sem marcar |
| Enviar mensagem | hover/apertado/foco | os mesmos do `Botao` |

## Responsivo

| Largura | Muda |
| --- | --- |
| ≤ 1100 px | links do topo viram o botão de menu (já no `Header`) |
| ≤ 900 px | cartão e coluna em uma coluna só (coluna embaixo do cartão) |
| ≤ 760 px | Nome/E-mail e Telefone/Empresa em uma coluna |
| ≤ 600 px | "Entrar na plataforma" sai do topo |

A estrada da contratação é vertical em todas as larguras.

## Decisões fora da prancha

- **Sem texto de ajuda inventado.** O plano não traz texto de ajuda pros campos e a prancha não mostra nenhum. A única ajuda é o contador da Mensagem, que o plano pede a partir de 800 caracteres. O texto "N de 1.000 caracteres" não está no plano: é a forma mais curta de dizer o limite.
- **Política como `Campo tipo="checkbox"`**, pra ter o mesmo erro ligado por `aria-describedby` dos outros campos.
- **Limites como atributo:** Empresa (120) e Mensagem (1.000) usam `maxlength`, porque o plano não tem mensagem de erro pra passar do limite.

## Efeitos (fase 3, não entram agora)

A aba Efeitos não tem efeito próprio desta tela (o da "mensagem enviada" é da próxima). Só as micro-interações dos campos e do botão (180 ms, `--ease`).

## Acessibilidade

- Foco: pular → logo → topo → Nome → E-mail → Telefone → Empresa → Assunto → Mensagem → Política (caixa) → link da Política → Enviar mensagem → rodapé.
- Todo campo com `<label>`; ajuda e erro ligados por `aria-describedby` (erro primeiro); `aria-invalid` só com erro; obrigatórios com `required` (o formulário usa `noValidate`, então o navegador não mostra balão próprio).
- Estrada em `<ol aria-label="Etapas da contratação">`; número e nome da placa são texto.
- Erro de envio em `aria-live="polite"` (fase 2).
