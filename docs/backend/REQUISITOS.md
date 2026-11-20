# Requisitos - UrbanLink Flow

> Este documento veio do projeto anterior em 16/11/2026. Os requisitos do back-end e do banco valem pra pasta `backend/` deste repositório. Os que falam do front (mapa com Leaflet, cidade 3D, telas da plataforma) descrevem o front antigo; no site novo essas telas ainda não existem.

## 1. Objetivo e fontes

O UrbanLink Flow é uma plataforma web para gestão, monitoramento e simulação de
logística urbana. O produto atende gestores de logística, operadores de transporte,
empresas de e-commerce, prefeituras e profissionais de mobilidade urbana.

Este documento consolida duas fontes:

1. **PDF oficial:** `EP 190 - URBANLINK - Desenvolvimento de Sistemas.docx.pdf`,
   composto por 7 páginas, sendo a página 7 em branco.
2. **Briefing complementar:** especifica stack, entidades, regras, telas, segurança,
   dados de demonstração, cidade 3D, mapa, telemetria demonstrativa e critérios de
   conclusão.

Em caso de conflito, o PDF é a fonte oficial. O briefing detalha como os resultados
abertos do PDF serão demonstrados e não foi identificado conflito entre as fontes.

## 2. Perfis e autorização

| Perfil     | Responsabilidades               | Permissões                                                                         |
| ---------- | ------------------------------- | ---------------------------------------------------------------------------------- |
| `ADMIN`    | Administração da plataforma     | Gerencia usuários e acessa todas as operações e relatórios                         |
| `MANAGER`  | Planejamento e gestão logística | Gerencia centros, frota, entregas, rotas e simulações; consulta indicadores        |
| `OPERATOR` | Execução e acompanhamento       | Consulta operações atribuídas e atualiza apenas os estados operacionais permitidos |

Regras gerais de acesso:

- toda rota privada exige JWT válido e usuário ativo;
- a API decide a autorização; esconder um controle no front-end não substitui RBAC;
- somente `ADMIN` pode criar, alterar perfil/status ou excluir usuários;
- `MANAGER` e `ADMIN` podem planejar e otimizar rotas e executar simulações;
- `OPERATOR` não altera cadastros administrativos nem parâmetros de simulação;
- tentativas sem autenticação retornam `401`; tentativas autenticadas sem permissão
  retornam `403`.

## 3. Requisitos funcionais

### RF-001 - Autenticação

- Autenticar por e-mail e senha.
- Armazenar somente o hash bcrypt da senha.
- Emitir JWT com expiração.
- Consultar o usuário da sessão em `/api/auth/me`.
- Encerrar a sessão no cliente removendo o token local.
- Rejeitar usuário inexistente, senha inválida ou usuário inativo sem revelar qual
  dado falhou.

### RF-002 - Usuários

- Permitir a `ADMIN` listar, buscar, paginar, criar, consultar, editar e remover ou
  inativar usuários.
- Garantir e-mail único.
- Nunca retornar `passwordHash`.
- Aplicar os perfis `ADMIN`, `MANAGER` e `OPERATOR`.

### RF-003 - Veículos

- Manter placa única, modelo, tipo, capacidade, velocidade média, consumo,
  localização atual e estado.
- Listar com busca, paginação, filtro e ordenação.
- Suportar `AVAILABLE`, `IN_ROUTE`, `MAINTENANCE` e `INACTIVE`.
- Impedir atribuição ou início de rota com veículo indisponível.

### RF-004 - Centros de distribuição

- Manter nome, endereço, coordenadas e horário de operação.
- Listar com busca e paginação.
- Usar o centro como origem de entregas e cálculos de rota.
- Preservar um centro que possua entregas vinculadas.

### RF-005 - Entregas

- Manter código de rastreio único, origem, destino, coordenadas, peso, prioridade,
  prazo, veículo opcional, previsão de chegada e datas operacionais.
- Listar com busca, paginação, filtros e ordenação.
- Atribuir entrega a veículo sem exceder a capacidade disponível.
- Controlar `PENDING`, `ASSIGNED`, `IN_TRANSIT`, `DELIVERED`, `FAILED` e
  `CANCELED`.
- Identificar entregas atrasadas pelo prazo e estado, não por valor estático.

### RF-006 - Rotas e paradas

- Criar rota com veículo e entregas elegíveis.
- Criar e reordenar paradas com sequência única dentro da rota.
- Calcular distância, duração, custo e emissão estimados.
- Otimizar uma rota com heurística determinística.
- Iniciar e concluir rotas respeitando estados de veículo, entrega e paradas.
- Controlar `PLANNED`, `ACTIVE`, `COMPLETED` e `CANCELED`.
- Expor os pontos necessários ao mapa operacional.

### RF-007 - Simulações

- Criar cenário com tráfego, quantidade de veículos, velocidade média, seleção de
  entregas, capacidade, preço do combustível e fator de CO2.
- Executar e persistir o resultado da simulação.
- Comparar ordem original e otimizada.
- Comparar distância, duração, custo, emissão, pontualidade, nível de serviço e
  percentual de melhoria.
- Consultar simulações e resultados anteriores.

### RF-008 - Dashboard e relatórios

- Calcular a partir do banco: entregas por estado, atrasos, distância total, tempo
  médio, taxa no prazo, nível de serviço, utilização da frota, disponibilidade,
  custo, emissão e economia da otimização.
- Expor resumo, série temporal, dados do mapa e dados da cidade 3D.
- Expor relatórios operacionais e de desempenho.
- Mostrar estados de carregamento, erro, vazio e última atualização.

### RF-009 - Mapa operacional

- Exibir centros, veículos, destinos, rotas, paradas e estados das entregas com
  Leaflet e OpenStreetMap.
- Permitir selecionar uma rota, enquadrar seus pontos e ver a sequência.
- Diferenciar trajetos planejados e concluídos.
- Filtrar por veículo, rota, entrega e estado.
- Mostrar detalhes acessíveis ao selecionar um marcador.

### RF-010 - Cidade 3D

- Representar de forma abstrata edifícios, centros, destinos, rotas, veículos e
  concentração operacional.
- Derivar a cena dos dados da API ou da simulação selecionada.
- Destacar rota selecionada e entregas atrasadas.
- Permitir pausar animações e respeitar `prefers-reduced-motion`.
- Limitar objetos, carregar de forma assíncrona e oferecer fallback 2D/estático.

### RF-011 - Monitoramento demonstrativo

- Expor eventos unidirecionais por Server-Sent Events em
  `/api/dashboard/live`.
- Atualizar posição simulada, progresso, estados, alertas ou indicadores.
- Identificar visualmente a fonte como **Modo de demonstração**.
- Gerar sequência determinística e controlável; não apresentá-la como GPS real.
- Refazer consultas REST ao reconectar ou quando o stream estiver indisponível.

### RF-012 - Documentação e demonstração

- Disponibilizar Swagger/OpenAPI em `/api/docs`.
- Disponibilizar health check em `/api/health`.
- Fornecer migration, seed e credenciais exclusivamente locais.
- Fornecer instruções reproduzíveis com Docker e com PostgreSQL local via
  `prisma dev`.
- Manter exemplos completos de API neste repositório.

## 4. Requisitos não funcionais

| ID      | Requisito          | Evidência verificável                                                                                      |
| ------- | ------------------ | ---------------------------------------------------------------------------------------------------------- |
| RNF-001 | Responsividade     | Fluxos principais utilizáveis em desktop, notebook, tablet e celular                                       |
| RNF-002 | Acessibilidade     | HTML semântico, labels, teclado, foco visível, contraste, ARIA quando necessário e movimento reduzido      |
| RNF-003 | Segurança          | bcrypt, JWT expirável, Helmet, CORS restrito, rate limit, validação Zod e ausência de segredos versionados |
| RNF-004 | Integridade        | PK/FK, unicidade, índices, transações e políticas de exclusão no PostgreSQL                                |
| RNF-005 | Manutenibilidade   | TypeScript estrito e separação entre HTTP, casos de uso, persistência e regras puras                       |
| RNF-006 | Interoperabilidade | API REST JSON versionável sob `/api`, documentada em OpenAPI                                               |
| RNF-007 | Desempenho         | Paginação no servidor, consultas indexadas, 3D lazy, limite de objetos e SSE unidirecional                 |
| RNF-008 | Confiabilidade     | Erros centralizados, respostas consistentes, health check e operações críticas transacionais               |
| RNF-009 | Testabilidade      | Regras puras unitárias, API com Supertest e fluxos críticos do front-end testáveis                         |
| RNF-010 | Observabilidade    | Health check, trilha `AuditLog`, alertas operacionais e erros de servidor registrados                      |
| RNF-011 | Portabilidade      | Node.js 22+, PostgreSQL 16 e execução com ou sem Docker                                                    |
| RNF-012 | Privacidade        | Senhas e segredos fora de logs/respostas; stack trace oculto em produção                                   |

## 5. Regras de negócio

### RN-001 - Distância geográfica

A distância entre dois pontos usa Haversine e raio terrestre de 6.371,0088 km:

```text
a = sin²(Δlat/2) + cos(lat1) * cos(lat2) * sin²(Δlon/2)
c = 2 * atan2(√a, √(1-a))
distânciaKm = 6371.0088 * c
```

A distância total é a soma centro -> primeira parada -> demais paradas. O produto
não afirma calcular distância viária.

### RN-002 - Estimativa de duração

```text
deslocamentoMin =
  (distânciaKm / velocidadeMédiaKmh) * 60 * fatorTráfego

duraçãoMin =
  deslocamentoMin + quantidadeParadas * atendimentoMédioMin
```

Fatores: `LOW=1.0`, `MODERATE=1.25`, `HIGH=1.6`, `CRITICAL=2.0`. Velocidade e
tempo de atendimento devem ser positivos.

### RN-003 - Otimização

1. validar veículo, capacidade, entregas, coordenadas e estados;
2. calcular um escore de proximidade ponderado por prioridade e urgência do prazo;
3. construir uma solução pelo vizinho mais próximo de menor escore;
4. aplicar 2-opt e manter a candidata somente quando não piorar a distância total;
5. recalcular duração, custo, CO2, pontualidade e nível de serviço;
6. persistir ordem e métricas.

A otimização é heurística didática e determinística, não IA nem garantia de ótimo
global.

### RN-004 - Capacidade

A soma de `weightKg` das entregas ativas atribuídas não pode ultrapassar
`capacityKg`. O servidor valida novamente dentro da operação de escrita para
evitar corrida entre requisições.

### RN-005 - Transições de entrega

Transições aceitas:

```text
PENDING -> ASSIGNED | CANCELED
ASSIGNED -> IN_TRANSIT | PENDING | CANCELED
IN_TRANSIT -> DELIVERED | FAILED
FAILED -> PENDING | CANCELED
DELIVERED -> (terminal)
CANCELED -> (terminal)
```

Uma entrega entregue não retorna a pendente e `deliveredAt` só é preenchido em
`DELIVERED`.

### RN-006 - Transições de rota e veículo

```text
PLANNED -> ACTIVE | CANCELED
ACTIVE -> COMPLETED | CANCELED
COMPLETED -> (terminal)
CANCELED -> (terminal)
```

- iniciar rota marca o veículo como `IN_ROUTE` e as entregas como `IN_TRANSIT`;
- veículo em `MAINTENANCE` ou `INACTIVE` não recebe nem inicia rota;
- concluir exige todas as paradas `COMPLETED`, `SKIPPED` ou `FAILED`;
- concluir/cancelar libera o veículo quando aplicável;
- rota concluída não pode reiniciar.

### RN-007 - Simulação e indicadores

- a execução cria no máximo um resultado vigente por simulação;
- original e otimizado usam os mesmos parâmetros e conjunto de entregas;
- `improvementPercentage = ((originalDistance - optimizedDistance) /
originalDistance) * 100`, com proteção para distância zero;
- taxa no prazo e nível de serviço são calculados, não digitados;
- indicadores usam dados persistidos e um instante de referência explícito.

### RN-008 - Exclusão e auditoria

- entidades com histórico referenciado usam `RESTRICT` ou inativação;
- vínculos opcionais usam `SET NULL`;
- paradas e resultado pertencentes exclusivamente ao agregado usam `CASCADE`;
- login, mudanças de estado e mutações administrativas relevantes geram
  `AuditLog` sem dados sensíveis.

## 6. Critérios de aceitação

| ID     | Cenário                                    | Resultado esperado                                                                          |
| ------ | ------------------------------------------ | ------------------------------------------------------------------------------------------- |
| CA-001 | Login válido                               | `200`, token expirável e usuário sem hash                                                   |
| CA-002 | Login inválido repetido                    | Erro genérico e rate limit após o limite configurado                                        |
| CA-003 | Operador acessa gestão de usuários         | `403` e nenhuma alteração                                                                   |
| CA-004 | Placa/e-mail/rastreio duplicado            | `409` com código de erro estável                                                            |
| CA-005 | Atribuição excede a capacidade             | `409`, sem escrita parcial                                                                  |
| CA-006 | Veículo em manutenção recebe rota          | `409`, sem mudança de estados                                                               |
| CA-007 | Rota válida é otimizada                    | Ordem determinística, métricas recalculadas e distância não maior quando 2-opt for aplicado |
| CA-008 | Rota ativa com parada pendente é concluída | `409` e rota continua ativa                                                                 |
| CA-009 | Simulação é executada                      | Resultado comparativo persistido e recuperável                                              |
| CA-010 | Dashboard é consultado                     | KPIs reconciliáveis com entregas, rotas e veículos do banco                                 |
| CA-011 | Stream de demonstração conecta             | Eventos nomeados, determinísticos e identificados como demo                                 |
| CA-012 | API recebe payload inválido                | `422` no envelope padronizado, sem stack trace                                              |
| CA-013 | Lista possui muitos registros              | Paginação e filtros executados no servidor com metadados                                    |
| CA-014 | Front-end perde a API                      | Estado de erro acionável e opção de tentar novamente                                        |
| CA-015 | Dispositivo reduz movimento/WebGL falha    | Animação pausada ou fallback 2D sem bloquear a aplicação                                    |
| CA-016 | Projeto é preparado do zero                | Migration + seed + login funcionam pelos comandos documentados                              |

## 7. Rastreabilidade com o PDF

| Requisito              | Evidência no PDF                                                       | Complemento adotado | Evidência prevista                       |
| ---------------------- | ---------------------------------------------------------------------- | ------------------- | ---------------------------------------- |
| RF-001                 | p. 2-3: autenticação e interação; API com lógica                       | Briefing §§8-9      | testes de login, proteção e RBAC         |
| RF-002 a RF-007        | p. 2-3: CRUD, usuários, veículos, rotas, entregas, simulações e regras | Briefing §§5-7      | migration, Swagger e testes de API       |
| RF-006/RN-001 a RN-003 | p. 2-3 e p. 5: otimização, tempo, distância e algoritmos               | Briefing §6         | testes unitários de cálculo e otimização |
| RF-007/RN-007          | p. 1-3 e p. 5: simulação, desempenho e indicadores                     | Briefing §§6.6-6.7  | resultado persistido e dashboard         |
| RF-008                 | p. 1-3: monitoramento, visualização e relatórios                       | Briefing §§6.7 e 9  | endpoints de dashboard/relatórios        |
| RF-009                 | p. 5-6: visualização de dados/mapas e bibliotecas de mapa              | Briefing §12        | página `/mapa` com dados da API          |
| RF-010                 | p. 2-3: interface e visualização eficiente/dinâmica                    | Briefing §11        | dashboard 3D com fallback                |
| RF-011                 | p. 1 e p. 3: dados/monitoramento em tempo real                         | Briefing §13        | SSE explicitamente demonstrativo         |
| RF-012                 | p. 2-6: migrations, Git/README, Swagger e Postman/Insomnia             | Briefing §15        | docs, seed, OpenAPI e exemplos           |
| RNF-001/002            | p. 2, p. 5-6: responsividade, UX e navegadores                         | Briefing §§9, 17    | revisão em quatro viewports e teclado    |
| RNF-003/008/012        | p. 3 e p. 5: boas práticas, segurança e qualidade                      | Briefing §§8, 18    | testes negativos e revisão de segredos   |
| RNF-004                | p. 2-4: normalização, PK/FK, migrations e integração                   | Briefing §5         | schema Prisma, migration e DER           |
| RNF-005/006/009        | p. 3-5: API organizada/documentada e integração HTTP                   | Briefing §§4, 7, 16 | lint, typecheck, testes e build          |
| RNF-011                | p. 6: ferramentas/frameworks/SGBDs aceitos                             | Briefing §3         | Node/PostgreSQL e Compose                |

Observações sobre páginas:

- p. 1 contextualiza Smart Cities, público e monitoramento/simulação;
- p. 2 define a entrega full-stack, responsividade, CRUD, regras e integração;
- p. 3 detalha API, Swagger, banco, entidades exemplo e três níveis de modelagem;
- p. 4 reforça integração, normalização, PK/FK, migrations e critérios críticos;
- p. 5 define regras, UI/mapas, HTTP, documentação, Git, segurança e qualidade;
- p. 6 lista recursos e tecnologias admissíveis;
- p. 7 está em branco e não adiciona requisitos.

## 8. Definição verificável de pronto

O escopo está concluído quando:

- front-end, API e PostgreSQL executam integrados;
- três perfis autenticam e o RBAC é demonstrável;
- CRUDs principais persistem dados e rejeitam estados inválidos;
- cálculos, otimização e simulação têm testes relevantes;
- simulação persiste comparação original/otimizada;
- mapa, dashboard, relatórios e cidade 3D consomem a API;
- SSE está identificado como demonstração e possui fallback;
- OpenAPI, migrations, seed e exemplos estão disponíveis;
- lint, typecheck, testes e builds passam;
- não há segredo real nem erro crítico conhecido oculto;
- limitações restantes estão declaradas no `README.md`.
