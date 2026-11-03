# Git, README e revisão

O PDF marca como crítico organizar o código no Git com commits, branches e tags, e pede um README de instruções.

## Branches

- `main`: só o que está pronto pra apresentar. Recebe merge no fim de cada fase.
- `dev`: onde as fases se juntam.
- `fase-1/landing`, `fase-3/jornada` e parecidas: uma por tela ou efeito, saindo de `dev`.

## Commits

Em português, um assunto por commit:

```text
feat(estrada): placa com estados feito, atual e próximo
fix(jornada): pacote saindo da estrada ao redimensionar
style(hero): margens do celular iguais à prancha
docs(readme): como rodar com dados de exemplo
```

## Tags

| Tag | Fase |
| --- | --- |
| `v0.1.0` | Base do projeto |
| `v0.2.0` | Telas paradas |
| `v0.3.0` | Navegação e formulários |
| `v0.4.0` | Efeitos |
| `v0.5.0` | Dados reais |
| `v1.0.0` | Revisão feita, versão da apresentação |

## README.md

1. O que é o UrbanLink Flow, em duas frases, com um print da landing.
2. Como rodar: Node 22, `npm install`, copiar `.env.exemplo` pra `.env.local`, `npm run dev`.
3. Variáveis de ambiente: `VITE_API_URL`, `VITE_USAR_EXEMPLOS`, `VITE_LINK_API_DOCS`, `VITE_LINK_GITHUB`.
4. Estrutura de pastas.
5. Rotas e o que cada uma faz.
6. Tecnologias e por quê.
7. Acessibilidade e movimento reduzido.
8. Link pra API (Swagger) e pro back-end.

## Revisão de cada entrega

Nenhum pull request entra em `dev` sem passar nesta lista:

- [ ] `npm run build` sem erro e sem aviso
- [ ] Print em 1440 e 390 px ao lado do print da prancha (`docs/referencia/<Tela>-1440.png` e `-390.png`): mesma hierarquia, cores, espaços e quebras de linha
- [ ] Nenhuma cor, tamanho ou tempo escrito fora de `tokens.css`
- [ ] Tela usada do começo ao fim só com o teclado, com foco visível
- [ ] Com "reduzir movimento" ligado: nada se mexe e nada fica escondido
- [ ] Carregando, erro e vazio testados (API desligada ou sem internet)
- [ ] Nenhum dado de exemplo com `VITE_USAR_EXEMPLOS` desligado
- [ ] Commits no formato combinado e branch com nome da fase

Pra comparar com o canvas, use o Playwright pra tirar print da rota em 1440 e 390 px.
