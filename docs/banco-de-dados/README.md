# Banco de dados

Modelagem do banco do UrbanLink Flow (PostgreSQL 16), nos três níveis que o enunciado pede. As tabelas, colunas e chaves destes arquivos foram lidas do banco real, criado pelas migrations de `backend/prisma/migrations/`.

| Arquivo | O que tem |
| --- | --- |
| [modelagem-conceitual.md](modelagem-conceitual.md) | Entidades, relacionamentos e cardinalidades, com o diagrama conceitual |
| [modelagem-logica.md](modelagem-logica.md) | Cada tabela com colunas, tipos, obrigatoriedade, chaves primárias e estrangeiras, únicas e enums |
| [der.md](der.md) | Diagrama Entidade-Relacionamento com todas as tabelas, atributos e chaves |
| [conceitual.mmd](conceitual.mmd) e [der.mmd](der.mmd) | Os dois diagramas em Mermaid, pra abrir no [Mermaid Live](https://mermaid.live) ou no VS Code |
| [../backend/MODELO_DADOS.md](../backend/MODELO_DADOS.md) | Documento completo: modelo físico, normalização, integridade, concorrência e dados de demonstração |

O modelo físico é o próprio banco: o script [`arquivos-adicionais/sql/01-criar-banco.sql`](../../arquivos-adicionais/sql/01-criar-banco.sql) cria tudo em SQL puro, e as migrations do Prisma fazem o mesmo pelo back-end.

## Resumo

- 13 tabelas, 13 relacionamentos por chave estrangeira e 12 enums.
- Chaves primárias UUID, menos o histórico das entregas, que usa número sequencial.
- Toda chave estrangeira tem regra de exclusão definida: `RESTRICT` onde apagar quebraria histórico, `SET NULL` em vínculo opcional e `CASCADE` no que só existe junto do pai.
- Recursos do PostgreSQL: um trigger grava o histórico de cada entrega, uma função tira a cidade do endereço, e uma sequência com função gera o protocolo das mensagens do site.
