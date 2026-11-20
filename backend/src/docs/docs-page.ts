// Página da documentação interativa (/api/docs). O Swagger UI vem da CDN jsDelivr, numa versão fixa
// e com hash de integridade (SRI): o navegador recusa o arquivo se ele vier diferente.
//
// Por que não o swagger-ui-express: ele entrega esses arquivos pelo express.static, que a Vercel
// ignora. Publicada, a página abria sem CSS e sem JavaScript.
const SWAGGER_UI = 'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.35.0';
const CSS_INTEGRITY = 'sha384-WlYgdmXYOOBWL5apwjDEZwN+U3HmXSSu5R6V5aGxEcf7z+KuRNwBhoxKVN1i3D5I';
const BUNDLE_INTEGRITY = 'sha384-gjRm0bEPMeTmMh5jT2cHccIwCUZSTd8YC+j0d0sXw0MdGEfScduGpSyF3ZSSLkX9';

export const SWAGGER_UI_ORIGIN = 'https://cdn.jsdelivr.net';

export const docsPage = `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>UrbanLink Flow API</title>
    <link rel="stylesheet" href="${SWAGGER_UI}/swagger-ui.css" integrity="${CSS_INTEGRITY}" crossorigin="anonymous">
  </head>
  <body>
    <div id="swagger-ui"></div>
    <script src="${SWAGGER_UI}/swagger-ui-bundle.js" integrity="${BUNDLE_INTEGRITY}" crossorigin="anonymous"></script>
    <script>
      window.ui = SwaggerUIBundle({
        url: '/api/openapi.json',
        dom_id: '#swagger-ui',
        deepLinking: true,
        persistAuthorization: true,
      });
    </script>
  </body>
</html>
`;
