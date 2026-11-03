# Handoff: Recuperar senha (`/recuperar-senha`)

Fonte: `docs/referencia/Recuperar-Senha.html`, `Recuperar-Senha-Enviado.html` e os prints em 1440 × 900 e 390 × 844. Regras em `docs/plano/03-telas-e-estados.md` ("Recuperar senha (3 telas)"); pedido em `docs/plano/04-api-e-dados.md` (`POST /auth/recuperar-senha`).

## Visão geral

Uma rota com dois estados, dentro do mesmo molde do login (`MolduraLogin`, sem topo nem rodapé), com "Voltar para o login" na barra.

1. **Pedir link:** a pessoa digita o e-mail e pede o link.
2. **Link enviado:** o aviso nunca diz se a conta existe ("Se esse e-mail tiver uma conta…").

Textos fixos (das pranchas):

- Pedir: h1 "Criar uma senha nova"; apoio "Digite o e-mail da sua conta. Se ele estiver cadastrado, a gente manda um link pra criar uma senha nova."; campo "E-mail"; botão "Enviar link"; "Lembrou a senha? Voltar para o login".
- Enviado: h1 "Confira seu e-mail"; apoio "Se esse e-mail tiver uma conta, o link pra criar uma senha nova já está a caminho. Ele vale por [tempo a definir]."; "Não chegou em alguns minutos? Olhe a caixa de spam ou peça outro link."; botão "Voltar para o login"; "Pedir outro link".

## Layout

O mesmo da coluna do login (`Entrada.module.css`): 420 px, gap 22, cabeça com gap 12 e 6 px a mais embaixo, h1 em `--h1-login`. Nas telas de senha o apoio usa `text-wrap: pretty` (classe `equilibrado`), como na prancha.

- Pedir: cabeça, formulário (gap 22: campo e botão "Enviar link" com a largura toda) e a frase "Lembrou a senha?" (16 px, `line-height: 1.5`, link 600 com sublinhado a 5 px).
- Enviado: `MiniEstrada` pequena (300 px, pacote no meio do caminho), cabeça, texto de 16 px (`line-height: 1.55`), botão "Voltar para o login" com a largura toda e "Pedir outro link" (16 px 600, só do tamanho do texto).
- `[tempo a definir]` é uma `Lacuna`, igual às da política.

## Tokens

| Token | Valor | Uso |
| --- | --- | --- |
| `--mini-estrada-pequena` (novo) | `300px` | mini estrada do link enviado |
| `--form-estreito` | `420px` | largura da coluna |
| `--h1-login` | `clamp(2rem, 3vw, 2.75rem)` | h1 |
| `--lacuna` / `--r-lacuna` | #FBE8BF / 4px | `[tempo a definir]` |

## Componentes

| Componente | Uso | Mudança pedida pela tela |
| --- | --- | --- |
| `MolduraLogin` | O molde | Nenhuma (`voltarPara="/login"`, `textoVoltar="Voltar para o login"`) |
| `MiniEstrada` (novo, extraído da mensagem enviada) | Link enviado | Props `pacote` (onde o pacote está) e `tamanho` (`normal` 360 px · `pequeno` 300 px). A mensagem enviada passou a usar o componente, sem mudar nada na tela |
| `Lacuna` | `[tempo a definir]` | Nenhuma |
| `Campo` | E-mail | Nenhuma |
| `Botao` | `noite` (Enviar link, Voltar para o login) e `link` (Pedir outro link, que é uma ação) | Nenhuma |
| Estilos | `pages/login/Login.module.css` virou `Entrada.module.css`, usado pelo login e pelas telas de senha | Classes `coluna`, `campos`, `equilibrado`, `texto`, `sozinho`, `respiro` |

## Estados

| Estado | Quando | O que aparece |
| --- | --- | --- |
| Pedir link | abriu a página | Formulário com o e-mail vazio |
| Enviando | pedido em andamento (fase 2) | Botão "Enviando…" desabilitado (mesma regra do contato) |
| Link enviado | a API respondeu (fase 2) | Estado 2. Mesma mensagem com ou sem conta |
| Pedir outro link | clique no estado 2 | Volta pro estado 1 e o foco vai pro título |

Na fase 1 o formulário não envia (`noValidate` e o envio é barrado), então o estado 2 só aparece quando a fase 2 ligar a API.

## Interações

| Elemento | Estado | Comportamento |
| --- | --- | --- |
| Troca de estado | 1 → 2 ou 2 → 1 | O foco vai pro h1 do estado novo |
| Voltar para o login (barra, frase e botão) | clique | `/login` |
| Pedir outro link | clique | `<button>`: volta pro formulário sem sair da rota |

## Responsivo

Igual ao login: ≤ 900 px a arte some e a logo escura aparece na barra.

## Decisões fora da prancha

- **"Pedir outro link" é um botão**, não um link: ele troca o estado da mesma página (na prancha ia pra outra página).
- **`[tempo a definir]` fica à mostra** até o grupo definir quanto tempo o link vale.
- **`noindex`** (03-telas-e-estados.md).

## Efeitos (fase 3, não entram agora)

A aba Efeitos só fala da mini estrada da mensagem enviada. Se a do link enviado ganhar o mesmo efeito, o `data-pacote` e o `data-fim` já estão lá.

## Acessibilidade

- Foco no estado 1: pular → logo → Voltar para o login → E-mail → Enviar link → Voltar para o login.
- Foco no estado 2: pular → logo → Voltar para o login → Voltar para o login (botão) → Pedir outro link.
- Mini estrada `aria-hidden`.
