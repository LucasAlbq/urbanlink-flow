-- UrbanLink Flow: cria o banco de dados (PostgreSQL 16).
--
-- Rode conectado a um banco que já existe (o "postgres", por exemplo), com um usuário que
-- possa criar bancos:
--   psql -U postgres -f 01-criar-banco.sql
--
-- Depois, rode o 02 e o 03 dentro do banco novo (veja arquivos-adicionais/INSTALACAO.md).
-- Num PostgreSQL de serviço (Neon, Supabase, Render), o banco já vem criado: pule este arquivo.

CREATE DATABASE urbanlink
  WITH ENCODING 'UTF8'
  TEMPLATE template0;
