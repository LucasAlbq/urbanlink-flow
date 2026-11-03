# UrbanLink: DESIGN.md

Arquivo de marca e de design do UrbanLink (UrbanLink Flow). Serve de fonte única para o design system no Claude e para o código.

Legenda de origem de cada decisão:
- **[manual]**: vem do Manual de Marca.
- **[proposto]**: decisão nossa, ainda não está no manual.
- **TODO**: não definido. Não inventar, perguntar.

---

## 1. Marca

**Nome:** UrbanLink (a logo escreve URBAN LINK). Produto: UrbanLink Flow, plataforma de gestão e simulação de logística urbana em tempo real.

**Conceito [manual]:** a identidade representa a conexão entre estratégia, mobilidade e inteligência logística. O símbolo integrado à tipografia faz referência à localização, ao direcionamento e à conexão entre pontos, e representa o movimento contínuo e a precisão de uma logística inteligente. O azul transmite confiança, solidez e profissionalismo. O amarelo representa energia, dinamismo, agilidade e inovação.

**Personalidade [manual]:** robusta, contemporânea, segura, objetiva.

**Conceito da landing [proposto]:** "do galpão à porta". A rota em laço do A vira uma linha âmbar que atravessa a página, e o scroll é a viagem de uma entrega.

---

## 2. Logo

Arquivos:
- `urbanlink-logo.svg`: colorida, para fundo claro. Letras URBAN e N em marinho, LINK e o A com seta em âmbar.
- `urbanlink-logo-dark.svg`: para fundo escuro. Letras em branco, LINK e o A em âmbar. **[proposto]** O manual só mostra a versão negativa toda branca e a positiva toda preta. TODO: validar com quem criou a marca.

Regras **[manual]**:
- Versões vertical e horizontal.
- Versão positiva e negativa em uma cor só.
- Área de proteção: meio x ao redor, em que x é a largura da letra I de LINK.
- Redução máxima: 15 mm de largura.

Estrutura do SVG (para animar) **[proposto]**: o A com a seta é um único caminho (`loop-a`) preenchido, não uma linha. As letras são caminhos separados: `u`, `r`, `b`, `n`, `l`, `i`, `n2`, `k`. A seta não é um caminho separado. Para animar o laço, usar máscara seguindo o trajeto.

TODO: tamanho mínimo em pixels para uso digital.
TODO: lista de usos incorretos (o sumário do manual cita, mas não consta nas páginas lidas).

---

## 3. Cores

### Da marca [manual]

| Nome | HEX | RGB | Papel |
| --- | --- | --- | --- |
| Amarelo | #FFD744 | 255, 215, 70 | Detalhes pequenos sobre fundo escuro. Nunca como fundo grande. |
| Ouro | #E7AC29 | 230, 170, 40 | Acento principal: a rota, botões, estados ativos. |
| Azul | #3363AC | 50, 100, 170 | Informação secundária, links, elementos de apoio. |
| Marinho | #242F62 | 35, 50, 100 | Cor principal da marca e fundo escuro. |
| Noite | #1A223C | 26, 34, 60 | Fundo mais escuro. O manual mostra essa cor na página de paleta sem escrever o HEX; o valor foi lido do arquivo vetorial do manual. |

### Derivadas [proposto]

| Nome | HEX | Papel |
| --- | --- | --- |
| Névoa | #EDF0F7 | Fundo claro azulado. Evita o creme que se vê em todo template. |
| Branco | #FFFFFF | Texto sobre fundo escuro. |

### Regras de uso [proposto]
- Um acento só: o **ouro**. O amarelo aparece em pontos minúsculos (a seta, o foco).
- Fundos: Noite (#1A223C) e Marinho para as áreas escuras, Névoa e Branco para as claras.
- Sem gradientes decorativos, sem brilho neon, sem vidro fosco.
- As cores de status (no prazo, atraso, crítico) precisam diferir também em claridade, não só no tom. TODO: definir as três cores de status.

### Contraste (WCAG, calculado)

| Texto sobre fundo | Razão | Uso |
| --- | --- | --- |
| Ouro sobre Noite | 7,72 | Texto e ícones: ok |
| Ouro sobre Marinho | 6,23 | Texto e ícones: ok |
| Amarelo sobre Noite | 11,25 | ok |
| Amarelo sobre Marinho | 9,08 | ok |
| Branco sobre Noite | 15,70 | ok |
| Branco sobre Marinho | 12,67 | ok |
| Marinho sobre Névoa | 11,10 | ok |
| Noite sobre Névoa | 13,76 | ok |
| Marinho sobre Ouro | 6,23 | Texto em botão âmbar: ok |
| Noite sobre Ouro | 7,72 | ok |
| Azul sobre Névoa | 5,23 | ok para texto |
| Branco sobre Azul | 5,96 | ok |
| Ouro sobre Azul | 2,93 | **Não usar** |
| Ouro sobre Névoa | 1,78 | **Não usar** (ouro não serve como texto em fundo claro) |

---

## 4. Tipografia

**Família [manual]:** Fira Sans, pesos Thin, ExtraLight, Light, Regular, Medium, SemiBold, Bold, ExtraBold e Black. Gratuita, licença aberta. Precisa dos arquivos de fonte carregados (o Claude não usa uma fonte que só está citada).

**Uso [proposto]:**
- Títulos: ExtraBold ou Black, espaçamento levemente apertado, para ecoar o peso da logo.
- Interface e texto corrido: Regular e Medium.
- Uma família só. Não adicionar fonte mono para rótulos.
- Linhas de texto com no máximo 70 caracteres.
- Texto alinhado à esquerda.
- Escala fluida, com o título do hero chegando a cerca de 7 rem. TODO: fechar a escala completa.
- Evitar: rótulos em caixa-alta acima de títulos, um destaque isolado de uma palavra no título, setas anexadas a textos de link.

---

## 5. Layout e componentes [proposto]

- Landing: coluna de texto com 5/12 e visual fixo com 7/12. No celular a rota vai para a borda esquerda.
- Sistema: densidade média, tabelas e fichas com grade fina.
- Ícones: um conjunto só, traço fino. TODO: escolher. O manual traz uma seta própria (nas amostras de cor), usar como motivo.
- Cantos: um raio único e pequeno. TODO: definir.
- Sem sombras difusas empilhadas, sem cards idênticos em grade.

---

## 6. Movimento [proposto]

**Teste do tema:** todo efeito precisa representar deslocamento, rota, cidade ou entrega. Se não representa, corta.

Regras:
- No máximo cerca de 3 elementos se movendo ao mesmo tempo (rota, seta e uma camada de skyline).
- Transições de 150 a 300 ms com ease-out para interações.
- Nunca mover texto enquanto a pessoa lê.
- Um momento orquestrado na abertura (o A da logo se revela como rota). O resto responde ao scroll.
- Respeitar `prefers-reduced-motion`: rota já desenhada, etapas empilhadas, sem parallax.
- Checar o scroll em 0, 25, 50, 75 e 100%, e a tela em 390 px e 1440 px.
- Evitar entradas de fade e slide em cada seção e hover animado em todo card.

Stack prevista: Lenis (scroll suave), GSAP com ScrollTrigger (animação ligada ao scroll), SVG. Sem 3D pesado no hero.

### Micro-interações premium [proposto, base: "A page that feels expensive", Claude Design Blueprint]

Tokens: curva única `cubic-bezier(0.22, 1, 0.36, 1)` (ease-out), rápido 180 ms, médio 260 ms.

| Detalhe | Valor | Onde | Status |
| --- | --- | --- | --- |
| Botão afunda no clique | escala 0,97 em 180 ms | Todos os botões | Aplicado |
| Botão clareia ao passar o mouse | brilho de 14% em 180 ms | Todos os botões | Aplicado |
| Anel de foco entra suave | 2 px, afastamento de 6 para 3 px em 180 ms | Links e botões (amarelo; marinho no hero C) | Aplicado |
| Entrada em cascata | sobe 12 px em 300 ms, 40 ms entre itens: título, texto, botões | Só no hero, uma vez. No site, começa quando a abertura da logo termina | Aplicado |
| Card sobe ao passar o mouse | 4 px com sombra suave | Só cards clicáveis da seção do produto | Quando a seção existir |
| Números contam uma vez | 900 ms, começa com 40% do elemento visível | Só com números reais vindos da API, nunca inventados | Quando houver dados |

Regras: no máximo 3 coisas se movendo ao mesmo tempo; nada de entrada animada em cada seção (só um momento orquestrado); nunca mover texto enquanto a pessoa lê; com "reduzir movimento" ligado, durações caem para 1 ms e tudo aparece pronto; testar em 390 px.

---

## 7. Conteúdo

- Sem dado mocado: nada de números inventados, nomes genéricos ou lorem ipsum. Onde houver dado, vem da API. Onde ainda não existe, mostrar o processo ou um estado vazio claro.
- Textos em português do Brasil, frases em sentido normal, verbos simples, sem tom de venda.
- Botão principal: "Entrar na plataforma". Uma ação mantém o mesmo nome em toda a interface.
- Erros dizem o que houve e como corrigir, sem pedir desculpa.

---

## 8. Pendências (TODO)

1. ~~HEX do fundo escuro do manual~~: resolvido, #1A223C.
2. Versão da logo para fundo escuro em duas cores: validar.
3. Tamanho mínimo da logo em pixels.
4. Usos incorretos da logo.
5. Três cores de status (no prazo, atraso, crítico).
6. Escala tipográfica completa.
7. Conjunto de ícones.
8. Raio de canto e escala de espaçamento.

---

## 9. Canvas no Claude Design

Canvas "UrbanLink Landing": abertura animada da logo (o A vira rota), storyboard em cinco quadros (0,3 / 0,9 / 1,3 / 1,7 / 2,2 s) e três opções de hero (A Rota gigante, B Cidade em camadas, C Placa).
