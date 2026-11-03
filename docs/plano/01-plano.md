# UrbanLink Flow — Plano de passagem pro web e efeitos

Exportado do doc do projeto em 03/11/2026. As outras partes estão nesta mesma pasta: `02-efeitos.md`, `03-telas-e-estados.md`, `04-api-e-dados.md`, `05-git-e-revisao.md`.

## Resumo

O site vai pro código em React em cinco fases. Primeiro as telas paradas, depois os efeitos, por último os dados reais da API. A parte de dentro da plataforma (Monitoramento, Rotas, Simulação, Cadastros) é a etapa seguinte, no mesmo projeto.

A regra dos efeitos:

- **Um momento grande:** a jornada travada na tela, com o pacote andando pela estrada.
- **Duas molduras:** a abertura no começo e o A se desenhando na chamada final.
- **O resto é micro-interação:** botões, foco, sublinhado.
- Todo efeito representa deslocamento, rota, cidade ou entrega.
- Todo efeito tem versão de movimento reduzido, e o site funciona inteiro sem nenhum efeito.

## Decisões fechadas (03/11/2026)

- JavaScript (não TypeScript).
- Mapa com MapLibre.
- A abertura toca uma vez por sessão.
- A plataforma fica no mesmo repositório, nas rotas `/app`.
- Na passagem da abertura pro hero, a cortina sai rápida (easing da marca) e o voo do pacote acontece por cima do hero já aberto.

## Stack

| Camada | Escolha | Por quê |
| --- | --- | --- |
| Base | React 19 + Vite | O PDF aceita React. Vite é o padrão atual |
| Rotas | React Router | O PDF cita "tratamento de rotas" no consumo de API |
| Estilo | CSS puro com variáveis + CSS Modules | O canvas já é CSS |
| Fonte | Fira Sans via `@fontsource/fira-sans` | Fonte no próprio site |
| Efeitos | GSAP 3 + ScrollTrigger + MotionPathPlugin + DrawSVGPlugin + `@gsap/react` | Todos os plugins são grátis. O `useGSAP()` limpa os efeitos ao trocar de página |
| Scroll suave | Lenis, no relógio do GSAP | Sincroniza com o ScrollTrigger e desliga sozinho com movimento reduzido |
| Mapa | MapLibre GL JS + `react-map-gl/maplibre`, tiles do OpenFreeMap | Cores da marca, sem chave de API |
| Chamadas à API | `fetch` numa pasta `src/api` | Uma dependência a menos |

## Rotas

| Rota | Tela | Prancha (em `docs/referencia/`) | Dado da API |
| --- | --- | --- | --- |
| `/` | Landing | Landing | Nenhum |
| `/rastreamento` | Busca pelo código | Rastreamento (só o topo) | Nenhum |
| `/rastreamento/:codigo` | Resultado | Rastreamento, Rastreamento-Nao-Encontrado | `GET /entregas/rastreio/:codigo` |
| `/contato` | Fale com a gente | Contato | `POST /contatos` |
| `/contato/enviado/:protocolo` | Mensagem enviada | Contato-Enviado | Protocolo devolvido pelo `POST` |
| `/login` | Entrar na plataforma | Login | `POST /auth/login` |
| `/privacidade` | Política de Privacidade | Politica | Nenhum |
| `/recuperar-senha` | Pedir link e aviso de link enviado | Recuperar-Senha, Recuperar-Senha-Enviado | `POST /auth/recuperar-senha` |
| `/nova-senha/:token` | Criar a senha nova | Nova-Senha | `POST /auth/nova-senha` |
| `/app/*` | Plataforma (etapa seguinte) | Ainda não desenhada | Protegida por login |
| Qualquer outra | Página não encontrada | Pagina-404 | Nenhum |

O menu do celular é a prancha `Menu-Celular` (só 390 px).

A Estrada (a lista de etapas com placas) é a peça que mais se repete: jornada, rastreamento, contato e mensagem enviada. Vira um componente com variantes (horizontal, vertical, com status).

```
src/
  styles/      tokens.css, base.css
  components/  Header, Rodape, Botao, Campo, Logo, LogoAnimado, MenuCelular, CarregandoA
    estrada/   Estrada, Etapa, Placa
    cidade/    Skyline, MapaIlustrado, MapaReal
  pages/       Landing, Login, Rastreamento, Contato, Enviado, Politica,
               RecuperarSenha, NovaSenha, NaoEncontrada
    landing/   Hero, Jornada, Plataforma, Rastrear, Sobre, Chamada
  motion/      setup.js, ScrollSuave.jsx, abertura.js, heroParallax.js,
               jornada.js, chamadaA.js
  api/         cliente.js, entregas.js, contatos.js, auth.js, exemplos/
```

O HTML e o CSS de cada prancha (`docs/referencia/*.html`) e os geradores (`docs/referencia/geradores/`) servem de especificação. As classes `.st`, `.jr`, `.fld` e `.pac` passam pros CSS Modules quase como estão. Os caminhos SVG da logo, do A e da rota da abertura estão em `docs/referencia/geradores/geom.json` e `gen.py`.

## Tokens de design

```css
:root {
  /* cores da marca (manual) */
  --noite: #1A223C;   --marinho: #242F62;  --ouro: #E7AC29;
  --amarelo: #FFD745; --azul: #3563AD;     --nevoa: #EDF0F7;
  --branco: #FFFFFF;
  /* apoio */
  --texto-2: #C5CBE3;      /* texto secundário em fundo escuro */
  --cinza: #5A6285;        /* texto secundário e borda em fundo claro */
  --estrada-futura: #C5CBE3;
  --predio-fundo: #1F2853; --predio-frente: #121830;

  /* tipo */
  --fonte: 'Fira Sans', system-ui, sans-serif;
  --h1: clamp(2.75rem, 5.6vw, 5.5rem);
  --h2: clamp(2.25rem, 4.6vw, 4rem);
  --corpo: clamp(1.0625rem, 1.3vw, 1.25rem);

  /* layout */
  --largura: 1280px;
  --margem: clamp(20px, 5vw, 48px);
  --secao: clamp(72px, 10vw, 140px);
  --r-botao: 6px; --r-campo: 8px; --r-placa: 10px; --r-cartao: 14px;

  /* movimento */
  --ease: cubic-bezier(0.22, 1, 0.36, 1);
  --rapido: 180ms; --medio: 260ms;
}
```

Quebras de layout:

- **1100 px:** os links do menu viram o botão de menu.
- **900 px:** o login perde o painel da cidade e o contato vira uma coluna só.
- **760 px:** a estrada fica vertical.
- **600 px:** o botão "Entrar" sai do topo.

O manual traz o amarelo como `#FFD744` e o canvas usa `#FFD745`. Usar `#FFD745`.

## Plano de efeitos

São 15 efeitos. P1 entra na primeira passada, P2 na segunda e P3 só se sobrar tempo. Valores exatos em `02-efeitos.md`.

| Efeito | O que acontece | Técnica | Gatilho | Celular e movimento reduzido | Prioridade |
| --- | --- | --- | --- | --- | --- |
| Scroll suave | Rolagem com inércia leve | Lenis no relógio do GSAP | Sempre | Reduzido: o Lenis desliga a suavização | P1 |
| Abertura | O pacote percorre o A, as letras sobem, a seta encaixa (2,2 s) e a cortina sobe | Timeline GSAP com os tempos da prancha Abertura em código | Ao carregar `/`, uma vez por sessão. Clique ou tecla pula | Celular: igual, logo menor. Reduzido: logo parado 0,6 s e some | P1 |
| Abertura → hero | O pacote sai do logo e pousa na rota da cidade (0,6 s) | MotionPathPlugin com posições medidas | Fim da abertura | Reduzido: não acontece | P1 |
| Entrada do hero | Título, texto e botões sobem 12 px em 300 ms, 40 ms de diferença | CSS (`.rise`) | Ao carregar, só no hero | Reduzido: aparece direto | P1 |
| Parallax da cidade | Prédios do fundo, do meio e da frente em velocidades diferentes | ScrollTrigger com `scrub`, só `transform` | Hero na tela | Celular: menos amplitude. Reduzido: parado | P1 |
| Jornada | A seção trava, o pacote percorre a estrada e cada placa sobe quando ele chega | ScrollTrigger com `pin` e `scrub` | Rolagem de cerca de 2,5 telas | Celular: sem trava, estrada vertical se desenha. Reduzido: tudo visível | P1 |
| Micro-interações | Sombra no hover, aperto 0,97, anel de foco, sublinhado engrossa | CSS com os tokens | Hover, clique, foco | Reduzido: 1 ms | P1 |
| Pacote no hero | O ponto amarelo percorre a rota devagar, em loop | MotionPathPlugin, pausado fora da tela | Hero visível | Reduzido: parado | P2 |
| A da chamada final | O A se desenha uma vez | Máscara + DrawSVG | 40% da seção na tela, uma vez | Reduzido: já desenhado | P2 |
| Status do rastreamento | A estrada se preenche até a etapa atual e o pacote desliza; no mapa, o trecho percorrido se desenha | Timeline GSAP + DrawSVG | Resposta da API | Reduzido: estado final | P2 |
| Espera da API com o A | Um A pequeno se desenha em loop com o texto da espera | DrawSVG, componente `CarregandoA` | Pedido demorando mais de 300 ms | Reduzido: A parado e o texto | P2 |
| Faixas da estrada | As faixas amarelas deslizam devagar | `background-position` | Estrada na tela | Reduzido: paradas | P3 |
| Pulso do pacote | O anel em volta do pacote atual pulsa a cada 2 s | Keyframes CSS | Sempre | Reduzido: anel fixo | P3 |
| Mensagem enviada | O pacote corre a mini estrada até a seta | GSAP | Ao abrir a tela | Reduzido: estado final | P3 |
| Logo do topo | No hover, a seta dá o encaixe de novo | GSAP, 0,35 s, `back.out` | Hover, só com mouse | Celular: não existe | P3 |

Fica de fora de propósito: transição entre páginas e fade em cada seção ao rolar.

## Fases de execução

0. **Base do projeto:** Vite + React, rotas vazias, tokens.css, Fira Sans. Pronto quando `npm run dev` abre todas as rotas com topo e rodapé.
1. **Telas paradas:** porta as pranchas pra componentes. Pronto quando cada rota bate com a prancha em 1440 e 390 px.
2. **Navegação e formulários:** menu do celular, validação, erros, carregando. Pronto quando dá pra usar o site inteiro só com o teclado.
3. **Efeitos:** P1 primeiro, depois P2 e P3. Pronto quando roda liso num celular médio e tudo para com movimento reduzido.
4. **Dados reais:** rastreio, contato e login na API; mapa real no rastreamento. Pronto quando nenhum dado de exemplo sobra na tela.
5. **Revisão:** Lighthouse, acessibilidade, Chrome, Firefox e Edge. Pronto quando o Lighthouse passa de 90 em desempenho e acessibilidade.

Cada fase só começa quando a anterior cumpre o critério de pronto.

## Desempenho, acessibilidade e testes

**Desempenho**

- Animar só `transform` e `opacity`.
- `will-change` só durante o efeito.
- No celular, a cidade do hero tem menos movimento.
- Fonte com `font-display: swap`, pré-carregando os pesos 400 e 800.
- Tudo é SVG, sem fotos.

**Orçamento** (Lighthouse em modo celular)

- O maior elemento da primeira tela aparece em até 2,5 s e o CLS fica abaixo de 0,1.
- JavaScript da landing até 200 KB comprimido. O MapLibre só carrega na rota de rastreamento (`React.lazy`).
- O hero já está montado embaixo da cortina, então a abertura não atrasa o carregamento real.

**Limpeza no React**

- Todo efeito nasce dentro de `useGSAP()`, que desfaz os ScrollTriggers ao trocar de rota.
- O mapa leva `data-lenis-prevent`.

**Acessibilidade**

- Link "Pular para o conteúdo" no topo de cada página.
- Na abertura, o botão "Pular abertura" fica visível e o logo animado tem `aria-hidden`.
- Campos com `label` e erro ligado por `aria-describedby`.
- Foco sempre visível.
- Movimento reduzido testado ligando a opção no sistema.

**Testes antes de entregar**

- [ ] Chrome, Firefox e Edge (os navegadores que o PDF cita)
- [ ] Um celular Android médio de verdade, com a jornada sem engasgar
- [ ] Lighthouse acima de 90 em desempenho e acessibilidade
- [ ] O site inteiro usado só com o teclado
- [ ] "Reduzir movimento" ligado: nenhum efeito roda e nada some

## Riscos

| Risco | O que fazer |
| --- | --- |
| A jornada travada engasgar no Safari do iPhone | Testar cedo na fase 3. Se não ficar bom, o celular usa a versão sem trava |
| Os efeitos comerem o tempo do back-end | P1 primeiro. P2 e P3 só depois da API de pé |
| Dado de exemplo esquecido na tela | A trava do build procura os valores do Figma |
| Os tiles gratuitos do mapa saírem do ar na apresentação | O mapa ilustrado fica de reserva |
