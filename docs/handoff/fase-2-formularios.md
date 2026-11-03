# Handoff: fase 2, navegação e formulários

Regras e textos de `docs/plano/03-telas-e-estados.md`; pedidos de `docs/plano/04-api-e-dados.md`.

Branches empilhadas, saindo de `dev` em `f3a95cb`: `fase-2/contato` → `fase-2/login` → `fase-2/senha`. O merge vai nessa ordem, sem conflito.

## O que entrou

| Peça | Onde | O que faz |
| --- | --- | --- |
| `ErroApi.campos` | `api/cliente.js` | Os campos recusados no 422. O texto da API é ignorado: a tela usa a mensagem dela |
| `enviarContato` | `api/contatos.js` | `POST /contatos` |
| `entrar`, `buscarEu`, `pedirLinkSenha`, `salvarSenhaNova` | `api/auth.js` | Login, sessão e senha |
| Exemplos | `api/exemplos/contatos.js`, `auth.js`, `comum.js` | Só com `VITE_USAR_EXEMPLOS=true`, lido direto em cada função (o ramo some do build) |
| `Botao carregando` | `components/Botao.jsx` | `aria-disabled` (o foco fica no botão), o A da espera depois de 300 ms e uma região de status com o texto da espera |
| `CarregandoA noBotao` | `components/CarregandoA.jsx` | Só o A, de 24 px, dentro do botão |
| `AvisoFormulario` | `components/AvisoFormulario.jsx` | Mensagem do formulário inteiro (erro de envio, aviso), numa região de status. Vazia, não ocupa lugar |
| `useValidacao` | `components/useValidacao.js` | Erro só depois de mexer e sair do campo ou tentar enviar; some assim que fica certo; devolve o primeiro campo com erro |
| `Campo` | `components/Campo.jsx` | Aceita `aria-describedby` de fora e `rotuloOlho` |

## Ver cada estado com os exemplos

Com `VITE_USAR_EXEMPLOS=true` (o `.env.development.local` já liga no `npm run dev`):

| Tela | Como | Resposta |
| --- | --- | --- |
| Contato | e-mail `sem-conexao@…` | API não responde |
| Contato | e-mail `recusado@…` | 422 no e-mail |
| Contato | e-mail `muitas@…` | 429 |
| Contato | qualquer outro | 201, protocolo `ULS20261246` |
| Login | senha `exemplo123` | Entra (a sessão some ao recarregar) |
| Login | outra senha | 401 |
| Login | e-mail `muitas@…` / `sem-conexao@…` | 429 / API fora |
| Recuperar senha | e-mail `muitas@…` / `sem-conexao@…` | 429 / API fora; o resto dá 202 |
| Senha nova | `/nova-senha/vencido` | 400 TOKEN_INVALIDO |
| Senha nova | `/nova-senha/sem-conexao` | API fora; outro token salva |

## Textos que não estão no plano (pro grupo aprovar)

| Onde | Texto | De onde veio |
| --- | --- | --- |
| Senha nova, menos de 8 caracteres | "Use pelo menos 8 caracteres." | A ajuda do campo. Com o erro na tela, a ajuda sai |
| Senha nova, botão enviando | "Salvando…" | O "Enviando…" do contato |
| Senha nova, API fora | "Não deu pra salvar agora. Tente de novo em alguns segundos." | O "API fora" do login |
| Recuperar senha, API fora | "Não deu pra enviar o link agora. Tente de novo em alguns segundos." | O "API fora" do login |
| Recuperar senha, campo | "Escreva seu e-mail." / "Escreva um e-mail válido, como voce@empresa.com.br." | Login e contato |
| Recuperar senha, 429 | "Muitas tentativas seguidas. Espere 1 minuto e tente de novo." | Login |
| Contato, 429 | "Não deu pra enviar agora. Sua mensagem continua aqui: é só tentar de novo." | O "sem resposta" do contato |

## Decisões fora do plano

1. **Botão carregando com `aria-disabled`**, não `disabled`: o `disabled` tira o foco do botão e quem usa teclado perde o lugar. O clique e o Enter não fazem nada enquanto carrega. O texto fica com contraste cheio (sem a opacidade de 0,6 do desabilitado), porque "Enviando…" precisa ser lido.
2. **A de 24 px dentro do botão** (token `--carregando-a-botao`). O de 32 px do plano fica grande num botão de 56 px. Fora do botão continua 32.
3. **Olho da senha:** o nome fica sempre "Mostrar senha" e o `aria-pressed` diz se ela está à mostra. Trocar o nome junto (como o plano pedia) fazia o leitor de tela dizer "Esconder senha, pressionado". Na senha nova os dois olhos se chamam "Mostrar senha nova" e "Mostrar senha repetida".
4. **Sair do campo sem ter mexido não acusa erro.** Passar com o Tab pelos campos vazios não enche a tela de erros; o erro aparece ao tentar enviar.
5. **Telefone:** vai pra API só com os números. Colar "+55 21 …" tira o 55. O cursor não pula pro fim ao corrigir um número no meio.
6. **`?volta=`** só aceita endereços que começam com `/app` (um link montado não leva pra fora do site). Quem já está logado também vai pro `?volta=`, se houver.
7. **Mensagens do formulário** (erro de envio e "Senha nova salva") numa caixa Névoa com texto 600 Noite: o erro acima do botão, o aviso da senha nova acima do e-mail. A prancha não desenha esses estados.
8. **Link vencido:** a tela troca pro título "Esse link não vale mais. Peça outro." e o botão "Pedir outro link" (vai pra `/recuperar-senha`). O foco vai pro título.
9. **422 num campo sem mensagem no plano** (empresa, assunto): aparece o aviso de "sem resposta" acima do botão.

## Revisão de acessibilidade (WCAG 2.1 AA, 03/11/2026)

Feita com teclado de verdade no navegador do app, medições de contraste e reflow em 320 px. Não teve teste com leitor de tela real (NVDA/VoiceOver): o que está em "Leitor de tela" é o que a árvore de acessibilidade expõe.

**Achados:** 3 corrigidos, 3 menores em aberto. Nenhum crítico.

| # | Achado | Critério | Gravidade | Situação |
| --- | --- | --- | --- | --- |
| 1 | O olho trocava o nome e o `aria-pressed` juntos ("Esconder senha, pressionado") | 4.1.2 | Média | Corrigido: nome fixo + `aria-pressed` |
| 2 | Dois botões "Mostrar senha" na senha nova; o `aria-controls` quase não é lido | 2.4.6, 4.1.2 | Média | Corrigido: `rotuloOlho` |
| 3 | `disabled` no botão carregando tirava o foco | 2.4.3 | Média | Corrigido antes de entrar (`aria-disabled`) |
| 4 | O contador da mensagem (a partir de 800) não é anunciado enquanto digita; no limite de 1.000 o texto para sem aviso | 4.1.3 | Menor | Aberto. Sugestão: anunciar só ao passar de 800 e ao chegar em 1.000 |
| 5 | Links no meio da frase com 19 px de altura ("Política de Privacidade", "Fale com a gente") | 2.5.5 (AAA; regra do projeto) | Menor | Aberto. A exceção de link em linha de texto vale; a área de toque do "Li e concordo" tem 44 px |
| 6 | Campo com erro só muda pelo texto embaixo (a borda continua igual) | 1.4.1 (passa) | Menor | Aberto. O texto basta; uma borda de 2 px Noite no `aria-invalid` ajudaria a achar o campo |

| Contraste | Frente | Fundo | Razão | Mínimo | Passa |
| --- | --- | --- | --- | --- | --- |
| Erro e label | Noite | Branco | 15,7 | 4,5 | Sim |
| Aviso do formulário | Noite | Névoa | 13,8 | 4,5 | Sim |
| Ajuda, placeholder, borda do campo | Cinza | Branco | 6,0 | 4,5 / 3 | Sim |
| "Enviando…" no botão | Branco | Noite | 15,7 | 4,5 | Sim |
| A da espera | Ouro | Noite | 7,7 | 3 | Sim |

| Teclado | Ordem | Enter/Espaço | Esc |
| --- | --- | --- | --- |
| Contato | pular → logo → topo → Nome … Política → link → Enviar → rodapé | Enter num campo de uma linha envia; Espaço marca a Política | — |
| Login | pular → logo → voltar → E-mail → Senha → olho → Manter → Esqueci → Entrar → Fale com a gente | Enter envia; Espaço no olho mostra | — |
| Senha nova | pular → logo → voltar → Senha nova → olho → Repita → olho → Salvar | Enter envia | — |
| Menu do celular | botão → X → Início → Como funciona → Rastrear → Fale com a gente → Entrar → logo (preso no painel) | Link fecha e leva o foco pro h1 da página | Fecha e devolve o foco ao botão |

| Leitor de tela | Como sai | Observação |
| --- | --- | --- |
| Campo com erro | "E-mail, inválido, obrigatório, Escreva um e-mail válido…" | Erro antes da ajuda |
| Envio | "Enviando…" (região de status) | O botão continua focado e "indisponível" |
| Erro de envio | Texto do aviso (região de status) | Nada do formulário se perde |
| 401 | Foco na senha vazia, lida com "E-mail ou senha incorretos." | Pode ser falado duas vezes (região + descrição) |
| Senha nova salva | "Entrar na plataforma, Senha nova salva. Entre com ela." | Descrição do título, que recebe o foco |

Também passam: todo campo com `<label>` e `autocomplete` (1.3.5), erros que dizem como corrigir (3.3.1, 3.3.3), nada muda sozinho ao digitar (3.2.2), sem rolagem lateral em 320 px (1.4.10), anel de foco em todo elemento (2.4.7).

## Fica pra depois

- `/app` ainda não chama `GET /auth/eu` (a guarda é da plataforma, Parte 3). Por enquanto o `?volta=` só aparece num link montado à mão.
- Não tem botão "Sair" (`POST /auth/sair`) em lugar nenhum.
- Teste com NVDA e VoiceOver.
- As animações do menu e do A da espera são da fase 3.
