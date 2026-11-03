# UrbanLink Flow: etapas

Uma etapa por vez. Cada uma cabe numa conversa e termina com algo pra revisar. Marca o `[x]` quando aprovar.

- **Canvas (design):** https://claude.ai/artifact/XvNJyv2uBNWc24U7G1Gyd3
- **Plano (doc com 5 abas):** https://claude.ai/artifact/4TsZtq2sDSD2SDhTdDv44U (cópia no repositório: `docs/plano/`)
- **Skill do projeto:** `urbanlink-flow-web` (já salva na tua conta)

## Como retomar numa conversa nova

Cola isto no começo da conversa e troca o número da etapa:

```text
Use a skill urbanlink-flow-web.
Canvas: https://claude.ai/artifact/XvNJyv2uBNWc24U7G1Gyd3
Plano: https://claude.ai/artifact/4TsZtq2sDSD2SDhTdDv44U
Estamos na etapa X do ETAPAS.md: <cola aqui o texto da etapa>
Faz só essa etapa e me mostra pra revisar antes de seguir.
```

---

## Parte 1: design no canvas (antes de programar)

### [x] Etapa 1: menu do celular

- Feito em 03/11/2026. Prancha "Menu do celular (aberto)", na fileira "Páginas do site".
- Os links viraram paradas de uma estrada vertical, com o pacote na página atual.
- **Pra revisar:** a estrada no menu fica ou sai?

### [x] Etapa 2: página 404 + "não encontrado" do rastreamento

- **404:** "Essa rua não existe.", com a estrada terminando numa placa de retorno e o botão "Voltar para o início".
- **Não encontrado:** a estrada termina numa placa "?" tracejada, com o texto "Não achamos uma entrega com o código… Confira as letras e os números ou fale com a gente." (docs/plano/03-telas-e-estados.md).
- Feito em 03/11/2026. Fileira "Estados e páginas de apoio" do canvas.

### [x] Etapa 3: Política de Privacidade + recuperar senha

- **Privacidade:** página de texto no estilo do site. O texto precisa ser combinado com o grupo (dados coletados no contato e no login, LGPD). Não publicar texto jurídico inventado.
- **Recuperar senha:** campo de e-mail e o estado "Se esse e-mail tiver conta, enviamos um link pra criar uma senha nova."
- Feito em 03/11/2026: Política + recuperar senha em três telas (pedir link, link enviado, senha nova).
- **Pro grupo preencher:** os trechos entre colchetes ([data], [prazo], [e-mail do responsável pelos dados], [tempo do link]) e revisar o texto da política.

### [x] Etapa 4: quadros da passagem abertura → hero

- De 4 a 5 quadros: o logo pronto, a cortina subindo, o pacote no meio do voo, o pacote pousado na rota do hero e o hero entrando.
- Feito em 03/11/2026: 5 quadros (2,20 a 2,80 s) na fileira da abertura. Decidido: a cortina sai rápida e o pacote fica em destaque.

### [x] Etapa 5: decisões em aberto

Fechadas em 03/11/2026:

- [x] JavaScript
- [x] MapLibre
- [x] Abertura uma vez por sessão
- [x] Plataforma no mesmo repositório (rotas `/app`)
- [x] Cortina da abertura rápida, com o pacote em destaque

---

## Parte 2: código do site (Claude Code, uma sessão nova por fase)

### [x] Preparação

Feita pelo Claude Code seguindo o `COMECE-AQUI.md`: projeto Vite criado, kit no lugar (`CLAUDE.md`, este arquivo, `docs/plano/`, `docs/referencia/`, skill do projeto), bibliotecas instaladas, `.env.exemplo`, Git com `main` e `dev`, skills do GSAP.

### [x] Fase 0: base do projeto (tag `v0.1.0`)

```text
Leia CLAUDE.md e docs/plano/01-plano.md (Stack, Rotas, Tokens).
Monte a base: React Router com as rotas da tabela, src/styles/tokens.css com os
tokens do plano, base.css, Fira Sans via @fontsource, Header e Rodape vazios, e as
páginas só com o título. Me mostre o plano antes de escrever código.
```

**Pronto quando:** `npm run dev` abre todas as rotas com topo e rodapé.

### [x] Fase 1: telas paradas (tag `v0.2.0`)

Uma tela por sessão, nesta ordem: Landing → Rastreamento → Fale com a gente → Mensagem enviada → Login → Menu do celular → 404.

- Feita em 03/11/2026: as sete telas da lista e também Política, Recuperar senha e Senha nova, pra toda rota bater com a sua prancha. Handoffs em `docs/handoff/`.
- O menu do celular já abre, fecha e prende o foco (sem isso não passava no teste de teclado); a animação fica pra fase 3.
- **Pro grupo preencher:** as lacunas da Política ([data], [prazo a definir pelo grupo], [e-mail do responsável pelos dados]) e o [tempo a definir] do link de senha.

```text
Use a skill design:design-handoff na prancha docs/referencia/<Tela>.html e depois
implemente a tela sem nenhum efeito. Use os componentes Placa, Etapa e Estrada
(docs/plano/03-telas-e-estados.md). Depois tire print em 1440 e 390 px e compare com
docs/referencia/<Tela>-1440.png e <Tela>-390.png. Liste as diferenças e corrija.
```

**Pronto quando:** cada rota bate com a prancha em 1440 e 390 px.

### [x] Fase 2: navegação e formulários (tag `v0.3.0`)

- Feita em 03/11/2026: validação e envio do Fale com a gente, estados do login, recuperar senha e senha nova pela API (com os exemplos), e a revisão de acessibilidade. Detalhes em `docs/handoff/fase-2-formularios.md`.
- O menu do celular só foi conferido (abrir, fechar, foco preso e devolvido já vinham da fase 1).
- **Pro grupo aprovar:** os textos que não estavam no plano e as decisões fora do plano (as duas listas estão no handoff).
- **Fica pra depois:** a área `/app` conferir a sessão (`GET /auth/eu`) e o botão Sair.

```text
Implemente o menu do celular, a validação do Fale com a gente e os estados do
login exatamente como em docs/plano/03-telas-e-estados.md, com os textos de lá. As chamadas à
API vão por src/api com os exemplos ligados (VITE_USAR_EXEMPLOS=true). No fim,
rode design:accessibility-review.
```

**Pronto quando:** dá pra usar o site inteiro só com o teclado.

### [ ] Fase 3: efeitos (tag `v0.4.0`)

Um efeito por sessão, nesta ordem: scroll suave → abertura → abertura → hero → parallax → jornada → (se der tempo) A da chamada final, status do rastreamento, espera com o A, logo do topo, faixas, pulso, mensagem enviada.

```text
Com as skills gsap-react e gsap-scrolltrigger, implemente o efeito <nome> de
docs/plano/02-efeitos.md, com os valores de lá, dentro de useGSAP e gsap.matchMedia com os
MODOS. Depois passe o teste de aceite dos efeitos e me diga o que não passou.
```

**Pronto quando:** roda liso num celular médio e tudo para com "reduzir movimento".

### [ ] Fase 4: dados reais (tag `v0.5.0`)

```text
Ligue rastreio, contato e login na API real (docs/plano/04-api-e-dados.md). Troque o mapa do
rastreamento pelo MapaReal com MapLibre, carregado sob demanda. Desligue os
exemplos e rode npm run build: a trava de dados de exemplo tem que passar.
```

**Pronto quando:** nenhum dado de exemplo sobra na tela.

### [ ] Fase 5: revisão (tag `v1.0.0`)

```text
Rode Lighthouse em / e em /rastreamento/<código real>, design:accessibility-review
em todas as rotas e design:design-critique comparando com docs/referencia/. Liste
tudo por gravidade antes de corrigir qualquer coisa.
```

**Pronto quando:** Lighthouse acima de 90 em desempenho e acessibilidade, testado no Chrome, no Firefox e no Edge.

---

## Parte 3: plataforma por dentro (depois do site ou em paralelo)

Primeiro o design no canvas, uma tela por etapa. Depois o código, no mesmo esquema de fases.

- [ ] Etapa P1: Monitoramento (o mapa ao vivo, a tela que o PDF marca como crítica)
- [ ] Etapa P2: Rotas
- [ ] Etapa P3: Simulação de cenários
- [ ] Etapa P4: Cadastros (entregas, veículos, motoristas)
