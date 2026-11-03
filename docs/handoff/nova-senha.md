# Handoff: Senha nova (`/nova-senha/:token`)

Fonte: `docs/referencia/Nova-Senha.html` e os prints em 1440 × 900 e 390 × 844. Regras em `docs/plano/03-telas-e-estados.md` ("Recuperar senha (3 telas)").

## Visão geral

A pessoa chega aqui pelo link do e-mail (o `token` vem na URL) e cria a senha nova. Mesmo molde do login (`MolduraLogin`, sem topo nem rodapé) com "Voltar para o login" na barra.

Textos fixos (da prancha): h1 "Crie sua senha nova"; apoio "Depois de salvar, é só entrar com o e-mail de sempre e a senha nova."; campos "Senha nova" (ajuda "Pelo menos 8 caracteres.") e "Repita a senha nova"; botão "Salvar senha nova".

## Layout

A coluna comum das telas de entrada (`Entrada.module.css`): 420 px, gap 22, h1 em `--h1-login`, apoio com `text-wrap: pretty`. Formulário com gap 22: os dois campos com o botão de olho dentro da caixa e o botão com a largura toda.

A ajuda "Pelo menos 8 caracteres." é 15 px `--cinza` com altura de linha `normal`, como na prancha (na busca da landing a ajuda tem 1,5). A classe `ajudaCurta` cuida disso só nesta tela.

## Componentes

| Componente | Uso | Mudança pedida pela tela |
| --- | --- | --- |
| `MolduraLogin` | O molde | Nenhuma |
| `Campo` | Os dois campos, `tipo="password"` com `mostrarSenha` e `autocomplete="new-password"` | Nenhuma. Cada olho mostra só o seu campo |
| `Botao` | `noite` "Salvar senha nova" (`type="submit"`) | Nenhuma |

## Campos

| Campo | Atributos | Erro (fase 2) |
| --- | --- | --- |
| Senha nova | `name="senha"`, `minlength="8"`, ajuda ligada por `aria-describedby` | Menos de 8 caracteres (texto a combinar na fase 2) |
| Repita a senha nova | `name="repeticao"` | "As senhas não são iguais." |

## Estados

| Estado | Quando | O que aparece |
| --- | --- | --- |
| Normal | abriu o link | Os dois campos vazios |
| Senhas diferentes | tentou salvar (fase 2) | "As senhas não são iguais." embaixo da repetição |
| Link vencido ou usado | a API recusou o token (fase 2) | "Esse link não vale mais. Peça outro." + "Pedir outro link" (vai pra `/recuperar-senha`) |
| Salvou | a API aceitou (fase 2) | Vai pro login com o aviso "Senha nova salva. Entre com ela." |

Na fase 1 o formulário não envia (`noValidate` e o envio é barrado). Não há prancha do link vencido, nem do aviso no login.

## Responsivo

Igual ao login: ≤ 900 px a arte some e a logo escura aparece na barra.

## Decisões fora da prancha

- **O plano não traz o texto do erro de "menos de 8 caracteres"** (só a regra). A ajuda já diz a regra; o texto do erro fica pra fase 2.
- **`noindex`** (03-telas-e-estados.md).

## Acessibilidade

- Foco: pular → logo → Voltar para o login → Senha nova → olho → Repita a senha nova → olho → Salvar senha nova.
- Os dois olhos se chamam "Mostrar senha"; cada um aponta pro seu campo com `aria-controls`. Na revisão de acessibilidade da fase 2 vale ver se o leitor de tela distingue os dois.
