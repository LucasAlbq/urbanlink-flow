# Arquivos adicionais

| Arquivo | O que tem |
| --- | --- |
| [INSTALACAO.md](INSTALACAO.md) | Como configurar, instalar, executar e usar o sistema |
| [sql/01-criar-banco.sql](sql/01-criar-banco.sql) | Cria o banco `urbanlink` |
| [sql/02-criar-tabelas.sql](sql/02-criar-tabelas.sql) | Cria as tabelas, enums, chaves, índices, funções e o trigger |
| [sql/03-inserir-dados.sql](sql/03-inserir-dados.sql) | Insere os dados de demonstração |

Os scripts SQL dão o mesmo banco que as migrations do back-end (`backend/prisma/migrations/`) e o seed (`npm run db:seed`). Foram testados num PostgreSQL vazio: o 02 e o 03 criaram as 13 tabelas e as 131 linhas de demonstração, e a API e o smoke test passaram nesse banco.

A modelagem (conceitual, lógica e DER) está em [`docs/banco-de-dados/`](../docs/banco-de-dados/).
