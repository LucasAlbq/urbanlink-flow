# Pacote de referência do site UrbanLink Flow

Coloque esta pasta em `docs/referencia/` no repositório. O `CLAUDE.md` aponta pra cá.

- Páginas: `Landing`, `Login`, `Rastreamento`, `Rastreamento-Nao-Encontrado`, `Contato`, `Contato-Enviado`, `Pagina-404`, `Politica`, `Recuperar-Senha`, `Recuperar-Senha-Enviado`, `Nova-Senha` e `Menu-Celular` (`.html`): cada prancha do canvas como página solta. Abra no navegador; os links entre elas funcionam. É a especificação visual: HTML e CSS de referência, não o código final em React.
- `<Pagina>-1440.png` e `<Pagina>-390.png`: prints da página inteira em desktop (1440 px) e celular (390 px), pra comparar com o site.
- `abertura/`: a animação da logo em CSS (`Abertura-Codigo.dc.html`, formato do canvas), o vídeo dela e os 5 quadros da passagem pro hero (`Passagem-1.png` a `Passagem-5.png`). Os tempos estão na aba Efeitos do plano.
- `logo/`: a logo em SVG, extraída do manual de marca (versão clara e versão pra fundo escuro).
- `DESIGN.md`: cores, tipografia, contraste e regras da marca.
- `geradores/`: os scripts em Python que geraram as pranchas. Guardam os caminhos SVG da logo, do A, da rota da abertura (`geom.json`) e da cidade.

Os valores de exemplo nas telas (UL123456789BR, datas, cidades, ULS20261246) vêm do Figma do grupo. No site, tudo isso vem da API.
