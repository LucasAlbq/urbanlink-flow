# Handoff: Entrar na plataforma (`/login`)

Fonte: `docs/referencia/Login.html` e os prints `Login-1440.png` (1440 × 900) / `Login-390.png` (390 × 844). Estados e textos em `docs/plano/03-telas-e-estados.md` ("Login"); pedido em `docs/plano/04-api-e-dados.md` (`POST /auth/login`).

## Visão geral

A pessoa da empresa entra na plataforma com e-mail e senha. A tela não tem o topo nem o rodapé do site: são duas metades, a cidade à esquerda (Marinho) e o formulário à direita (Branco). Nenhum dado da API aparece na fase 1.

O mesmo molde (painel da cidade + barra com "Voltar para…") se repete em `Recuperar-Senha`, `Recuperar-Senha-Enviado` e `Nova-Senha`. Por isso ele vira o componente `MolduraLogin`, e cada tela só passa o formulário e o link de voltar.

| Bloco | Fundo | Conteúdo |
| --- | --- | --- |
| Arte (só > 900 px) | Marinho | Logo (link pro site), frase "A cidade toda numa tela só.", cidade com a rota e o pacote |
| Lado | Branco | Logo escura (só ≤ 900 px), "Voltar para o site", formulário centrado |

Textos fixos (da prancha):

- h1 "Entrar na plataforma" + "Use o e-mail e a senha que a sua empresa cadastrou pra você."
- Campos "E-mail" (placeholder "voce@empresa.com.br") e "Senha"; "Manter conectado"; "Esqueci minha senha"; botão "Entrar".
- "Ainda não tem acesso? Fale com a gente".

## Layout

- Grade de duas colunas iguais com altura mínima de 900 px (`--login-altura`), que cresce até a altura da janela (`max(900px, 100vh)`). A prancha só tem 900 px; numa tela mais alta, sem isso, sobraria uma faixa branca embaixo.
- Arte: `position: relative`, `overflow: hidden`, coluna, `padding: 32px var(--login-arte-margem)`.
  - Logo 188 × 30 (`--logo-topo`) num link de 44 px.
  - Frase: `margin-top: var(--login-frase-topo)` (usa `vh`), `max-width: 16ch`, `--t-frase-login`, 800, `line-height: 1.02`, `letter-spacing: var(--aperto)`, Branco. É um `<p>`, não um título.
  - Cidade: `Skyline` com o recorte `160 0 900 520`, o pacote em (610, 360) e 460 px de altura (`--cidade-login`), presa no pé.
- Lado: coluna, `padding: 32px var(--login-lado-margem)`.
  - Barra: `flex`, `space-between`, gap 16. "Voltar para o site" com `margin-left: auto`, 16 px 600, sem sublinhado, seta de 18 px e gap 6.
  - Centro: `flex: 1`, conteúdo centrado nos dois eixos, `padding: var(--login-centro) 0` (usa `vh`).
- Formulário: `max-width: var(--form-estreito)` (420 px), coluna com gap 22.
  - Cabeça: coluna com gap 12 e `margin-bottom: 6px`. h1 em `--h1-login`, 800, `line-height: 1.05`, `letter-spacing: var(--aperto-2)`. Apoio 17 px, `line-height: 1.55`, `--marinho`.
  - Senha: o botão de olho fica dentro da caixa (44 × 44, a 4 px da borda de cima e da direita), e a caixa ganha `padding-right: 60px` (`--campo-com-botao`).
  - Linha "Manter conectado" + "Esqueci minha senha": `flex-wrap`, `space-between`, gap 8 × 16. O link tem 16 px 600 e sublinhado a 5 px (`--sublinhado-recuo-curto`).
  - "Entrar": `Botao noite` com a largura toda, 56 px, texto 18 px.
  - Rodapé do formulário: `margin-top: 6px`, 16 px, `line-height: 1.5`, `--marinho`; o link "Fale com a gente" em 600 Noite.

## Tokens

| Token | Valor | Uso |
| --- | --- | --- |
| `--login-altura` (novo) | `900px` | altura mínima da tela |
| `--login-arte-margem` (novo) | `clamp(24px, 4vw, 56px)` | padding lateral da arte |
| `--login-frase-topo` (novo) | `clamp(48px, 9vh, 120px)` | espaço entre a logo e a frase |
| `--t-frase-login` (novo) | `clamp(2.25rem, 3.6vw, 3.5rem)` | frase da arte |
| `--cidade-login` (novo) | `460px` | altura da cidade |
| `--login-lado-margem` (novo) | `clamp(20px, 5vw, 72px)` | padding lateral do lado do formulário |
| `--login-centro` (novo) | `clamp(32px, 6vh, 64px)` | respiro em cima e embaixo do formulário |
| `--form-estreito` (novo) | `420px` | largura do formulário |
| `--h1-login` (novo) | `clamp(2rem, 3vw, 2.75rem)` | h1 do formulário |
| `--logo-celular` (novo) | `150px` | logo escura do celular (150 × 24) |
| `--campo-com-botao` (novo) | `60px` | respiro da caixa com o botão de olho |
| `--sublinhado-recuo-curto` (novo) | `5px` | sublinhado dos links do formulário |
| `--logo-topo` | `188px` | logo da arte |
| `--marinho` | #242F62 | fundo da arte, textos de apoio |

## Componentes

| Componente | Uso | Mudança pedida pela tela |
| --- | --- | --- |
| `Layout` | Envolve todas as rotas | A rota pode pedir `handle: { soConteudo: true }`: aí o `Layout` não põe `Header` nem `Rodape` (login e telas de senha). O foco no h1 ao trocar de rota continua |
| `MolduraLogin` (novo) | O molde das quatro telas | Props `voltarPara` e `textoVoltar` ("Voltar para o site" no login, "Voltar para o login" nas de senha) |
| `Skyline` | Cidade da arte | Props `recorte` (o `viewBox`) e `pacote` (ponto do pacote); altura pela variável `--skyline-altura`. No hero nada muda |
| `Logo` | Arte (cores normais) e celular (escura) | Prop `umaCor`: tudo em Noite no fundo claro (a versão positiva do manual) |
| `Campo` | E-mail, Senha, Manter conectado | `mostrarSenha` num campo `password`: botão de olho dentro da caixa que troca o tipo, com `aria-pressed` e `aria-label` "Mostrar senha" / "Esconder senha" |
| `Botao` | `noite` "Entrar" (`type="submit"`) | Nenhuma |

## Campos

| Campo | Elemento | Atributos | Erro (fase 2) |
| --- | --- | --- | --- |
| E-mail | `input` `email` | `name="email"`, `autocomplete="username"`, placeholder "voce@empresa.com.br" | "Escreva seu e-mail." |
| Senha | `input` `password` (ou `text` com a senha à mostra) | `name="senha"`, `autocomplete="current-password"`, botão de olho | "Escreva sua senha." |
| Manter conectado | `checkbox` | `name="manterConectado"`, desmarcado | Nenhum |

## Estados

| Estado | Quando | O que aparece |
| --- | --- | --- |
| Normal | abriu a página | Campos vazios, "Manter conectado" desmarcado |
| Senha à mostra | apertou o olho | Campo vira `text`, botão com `aria-pressed="true"` e "Esconder senha" |
| Campo vazio | tentou entrar (fase 2) | "Escreva seu e-mail." ou "Escreva sua senha." |
| Enviando | pedido em andamento (fase 2) | "Entrando…", desabilitado, `CarregandoA` depois de 300 ms |
| 401 | (fase 2) | "E-mail ou senha incorretos." A senha é apagada e o foco volta pra ela. Nunca diz qual dos dois errou |
| 429 | (fase 2) | "Muitas tentativas seguidas. Espere 1 minuto e tente de novo." |
| API fora | (fase 2) | "Não deu pra entrar agora. Tente de novo em alguns segundos." |
| Sucesso | (fase 2) | Vai pra `/app` ou pro `?volta=` |
| Já logado | abriu `/login` com sessão (fase 2) | Vai direto pra `/app` |

Na fase 1 o formulário não envia: `noValidate` e o envio é barrado (nada vai pra URL nem pra API).

## Interações

| Elemento | Estado | Comportamento |
| --- | --- | --- |
| Logo | clique | volta pro site (`/`) |
| Voltar para o site | hover | Marinho (é um link sem sublinhado) |
| Olho | clique / Enter / Espaço | mostra e esconde a senha; o foco fica no botão |
| Esqueci minha senha | clique | `/recuperar-senha` |
| Fale com a gente | clique | `/contato` |

## Responsivo

| Largura | Muda |
| --- | --- |
| ≤ 900 px | Uma coluna só: a arte some, a logo escura (150 × 24) aparece na barra, e a altura mínima sai (a tela fica do tamanho do conteúdo) |

## Decisões fora da prancha

- **Altura:** `max(900px, 100vh)` em vez de só 900 px, pra tela ocupar a janela toda nas telas altas.
- **Mesmo ícone de olho nos dois estados**, como na prancha. Quem vê percebe pela senha à mostra; o leitor de tela ouve `aria-pressed`.
- **`noindex`** na página (03-telas-e-estados.md).
- **Nome do campo `manterConectado`**, como no corpo do `POST /auth/login` (na prancha é `manter`).

## Efeitos (fase 3, não entram agora)

O `Skyline` do login não tem efeito próprio na aba Efeitos. Só as micro-interações (180 ms, `--ease`).

## Acessibilidade

- Foco: pular → logo → Voltar para o site → E-mail → Senha → olho → Manter conectado → Esqueci minha senha → Entrar → Fale com a gente.
- Os dois links da logo (arte e celular) têm o mesmo nome e nunca aparecem juntos.
- Cidade e seta do "Voltar" com `aria-hidden`.
- Plano manda `aria-pressed` e trocar o `aria-label` juntos; o leitor de tela fala "Esconder senha, pressionado". Vale olhar na revisão de acessibilidade da fase 2.
