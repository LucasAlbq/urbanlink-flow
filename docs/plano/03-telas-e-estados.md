# Telas, componentes e estados

Todo estado de toda tela, com o texto que aparece. As pranchas estão em `docs/referencia/` (HTML + prints em 1440 e 390 px).

## Componentes

| Componente | Props | Variantes e estados | Observações |
| --- | --- | --- | --- |
| `Estrada` | `etapas`, `orientacao` (`auto` · `vertical`), `inicio`, `fim`, `pacoteEm` | Horizontal no desktop, vertical abaixo de 760 px quando `auto` | `<ol>`; cada etapa é um `<li>` |
| `Placa` | `numero`, `nome`, `glifo` (`seta` · `desvio` · `check` · `retorno`), `estado`, `tamanho` | `normal` (Ouro), `feito` (Ouro + check), `atual` (Amarelo), `proximo` (contorno tracejado) | Número e nome são texto real |
| `Etapa` | `placa`, `children`, `trecho` (`feito` · `futuro`) | Trecho escuro com faixas ou claro sem faixas | Recebe o pacote quando `pacoteEm` aponta pra ela |
| `Botao` | `variante` (`ouro` · `noite` · `contorno` · `link`), `carregando`, `href` | Normal, hover, apertado, foco, carregando, desabilitado | Com `href` vira `<a>`, sem vira `<button>` |
| `Campo` | `label`, `tipo`, `opcional`, `erro`, `ajuda`, `obrigatorio` | Normal, hover, foco, com erro, desabilitado | `input`, `select` ou `textarea`. Erro por `aria-describedby` |
| `Header` | `paginaAtiva`, `sobreEscuro` | Links no desktop, botão de menu abaixo de 1100 px | Link atual com `aria-current="page"` |
| `MenuCelular` | `aberto`, `aoFechar` | Fechado, abrindo, aberto | Ver abaixo |
| `Rodape` | Nenhuma | Uma só | Links da API e do GitHub vêm de variáveis de ambiente |
| `Skyline` | `camadas`, `rota`, `pacote` | Hero e login | Três SVGs, um por camada |
| `MapaIlustrado` | `progresso` (0 a 1) | Sem e com progresso | Reserva do mapa real |
| `MapaReal` | `rota` (GeoJSON), `posicao`, `progresso` | Carregando, pronto, falhou | `React.lazy`. Se falhar, mostra o `MapaIlustrado` |
| `CarregandoA` | `tamanho`, `texto` | Animado e reduzido | Só aparece depois de 300 ms |

## Landing e menu do celular

A landing não mostra nenhum dado da API.

**Ordem do foco:** pular para o conteúdo → logo → links do menu → Entrar na plataforma → botões do hero → campo de rastreio → Rastrear → Falar com a equipe → botões da chamada final → rodapé.

**Campo de rastreio:** ao enviar, tira espaços, passa pra maiúsculas e vai pra `/rastreamento/CODIGO`. Vazio: mostra "Digite o código de rastreio." e não sai da página. Quem decide se o código existe é a API.

**Menu do celular** (prancha `Menu-Celular`): painel Noite de tela cheia. Os links (Início, Como funciona, Rastrear entrega, Fale com a gente) são paradas de uma estrada vertical, com o pacote na página atual; a estrada termina numa seta apontando pro botão "Entrar na plataforma" (Ouro).

- Abre descendo em 260 ms (`--ease`); links entram com 40 ms de diferença. Reduzido: aparece direto.
- O botão troca `aria-label` ("Abrir menu" / "Fechar menu") e `aria-expanded`. Foco preso no painel; o resto recebe `inert`.
- Fecha com Esc, com o X ou tocando num link. O foco volta pro botão de menu. `lenis.stop()` enquanto aberto.
- No canvas o botão de menu é um link (só pra navegação do protótipo). No site é `<button>`.

## Rastreamento

| Estado | Quando | O que aparece | Texto |
| --- | --- | --- | --- |
| Sem código | `/rastreamento` | Topo com o campo e uma estrada vazia (placas tracejadas) | "Digite o código pra ver em que ponto do caminho a entrega está." |
| Carregando | Pedido à API, depois de 300 ms | `CarregandoA` | "Buscando a entrega…" |
| Em andamento | `POSTADO`, `EM_TRANSITO`, `EM_ROTA` | Estrada com feitas (check), atual (amarela, com pacote) e próximas (tracejadas) + mapa | Título = status, ex. "Em rota de entrega" |
| Com imprevisto | `IMPREVISTO` | A placa atual vira Imprevisto (amarela, desvio), com motivo e nova previsão | "Teve um imprevisto no caminho" + motivo da API |
| Entregue | `ENTREGUE` | Todas com check, pacote na seta acesa, mapa com a rota inteira | "Entregue" + data e hora |
| Não encontrado | 404 | Prancha `Rastreamento-Nao-Encontrado`: placa "?" tracejada numa estrada vazia | "Não achamos essa entrega" / "Confira as letras e os números do código ou fale com a gente." + botão "Tentar outro código" |
| Erro de conexão | API não respondeu | Mensagem + "Tentar de novo" | "Não deu pra buscar agora. Tente de novo em alguns segundos." |

- `/rastreamento/UL…` pode ser compartilhado: ao abrir, a busca começa sozinha com o campo preenchido.
- Datas no formato "23/10/2026, 16:22" (`Intl.DateTimeFormat('pt-BR')`).
- Quando o resultado chega, o foco vai pro título do status (`tabIndex={-1}`).
- Se o `MapaReal` falhar, entra o `MapaIlustrado` sem mensagem de erro.
- "Receber atualizações por e-mail" precisa de endpoint novo. Sem ele, o botão sai.

## Fale com a gente e mensagem enviada

Erros só aparecem depois que a pessoa sai do campo ou tenta enviar.

| Campo | Regra | Mensagem de erro |
| --- | --- | --- |
| Nome completo | Obrigatório, 3 letras ou mais | "Escreva seu nome." |
| E-mail | Obrigatório, formato de e-mail | "Escreva um e-mail válido, como voce@empresa.com.br." |
| Telefone (opcional) | Se preenchido, 10 ou 11 números; máscara (21) 99999-9999 | "Confira o telefone com o DDD." |
| Empresa (opcional) | Até 120 caracteres | Nenhuma |
| Assunto | Começa em "Pedir um orçamento" (opções: Pedir um orçamento, Dúvida sobre uma entrega, Parceria, Outro assunto) | Nenhuma |
| Mensagem | Obrigatória, 10 a 1.000 caracteres; contador a partir de 800 | "Conte um pouco mais, pelo menos uma frase." |
| Política de Privacidade | Marcada | "Pra enviar, é preciso concordar com a Política de Privacidade." |

Ao enviar:

1. Com erro, nada é enviado e o foco vai pro primeiro campo com erro.
2. Sem erro, o botão vira "Enviando…" (desabilitado); `CarregandoA` depois de 300 ms.
3. 422 da API: a mensagem aparece embaixo do campo certo.
4. Sem resposta: acima do botão, "Não deu pra enviar agora. Sua mensagem continua aqui: é só tentar de novo." Nada se perde.
5. Sucesso: vai pra `/contato/enviado/<protocolo>`.

Mensagem enviada: botão "Copiar protocolo" (aviso "Protocolo copiado" por 2 s, `role="status"`). Sem protocolo na URL, volta pra `/contato`. O voltar do navegador nunca reenvia.

## Login

O login nunca diz se o erro foi no e-mail ou na senha.

| Situação | O que aparece |
| --- | --- |
| Campo vazio | "Escreva seu e-mail." ou "Escreva sua senha." |
| Enviando | "Entrando…", desabilitado, `CarregandoA` depois de 300 ms |
| 401 | "E-mail ou senha incorretos." A senha é apagada e o foco volta pra ela |
| 429 | "Muitas tentativas seguidas. Espere 1 minuto e tente de novo." |
| API fora | "Não deu pra entrar agora. Tente de novo em alguns segundos." |
| Sucesso | Vai pra `/app` ou pro `?volta=` |

- Mostrar senha: troca o tipo do campo, `aria-pressed`, `aria-label` "Mostrar senha" / "Esconder senha".
- Manter conectado: desmarcado por padrão.
- Já logado em `/login`: vai direto pra `/app`.
- "Esqueci minha senha" leva pra `/recuperar-senha`.

## Recuperar senha (3 telas)

- **Pedir link** (`Recuperar-Senha`): campo de e-mail + "Enviar link".
- **Link enviado** (`Recuperar-Senha-Enviado`): "Se esse e-mail tiver uma conta, o link pra criar uma senha nova já está a caminho." Nunca revela se a conta existe.
- **Senha nova** (`Nova-Senha`): pelo menos 8 caracteres; os dois campos iguais ("As senhas não são iguais."). Link vencido ou usado: "Esse link não vale mais. Peça outro." + "Pedir outro link". Depois de salvar: login com o aviso "Senha nova salva. Entre com ela."

## Política de Privacidade

Prancha `Politica`. O texto é rascunho e tem lacunas entre colchetes ([data], [prazo a definir pelo grupo], [e-mail do responsável pelos dados]) que o grupo precisa preencher. Ela promete duas coisas que o código precisa cumprir: senha guardada com hash no back-end e nenhum cookie de estatística ou propaganda.

## Página não encontrada

Prancha `Pagina-404`: "Essa rua não existe.", estrada com o pacote indo até uma placa de Retorno, e o trecho depois dela tracejado. Botão "Voltar para o início" + links pra rastrear e falar com a gente.

## Título, descrição e ícone

| Rota | Título da aba | Descrição |
| --- | --- | --- |
| `/` | UrbanLink Flow: a logística da cidade, em tempo real | Monitore entregas, simule rotas e cenários e treine sua equipe em um só lugar. |
| `/rastreamento/:codigo` | Entrega UL… · UrbanLink Flow | Veja em que ponto do caminho a sua entrega está. |
| `/contato` | Fale com a gente · UrbanLink Flow | Peça um orçamento, tire uma dúvida ou proponha uma parceria. |
| `/contato/enviado/:protocolo` | Mensagem enviada · UrbanLink Flow | (não indexada) |
| `/login` | Entrar · UrbanLink Flow | (não indexada) |
| `/privacidade` | Política de Privacidade · UrbanLink Flow | Quais dados o site coleta e o que você pode pedir. |
| 404 | Página não encontrada · UrbanLink Flow | (nenhuma) |

- `<html lang="pt-BR">`.
- Favicon: o A da logo em Ouro (`favicon.svg`) + PNG de 180 px.
- `<meta name="theme-color" content="#242F62">`.
- Imagem de compartilhamento 1200 × 630, fundo Marinho, logo e a frase do hero.
- `noindex` no login, na mensagem enviada, no recuperar senha e em `/app`.
