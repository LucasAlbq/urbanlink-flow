// Trava do build: falha se algum dado de exemplo chegou no dist/.
// Roda depois do `vite build` (docs/plano/04-api-e-dados.md).
import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const PROIBIDOS = ['UL123456789BR', 'ULS20261246']
const PASTA = 'dist'

if (!existsSync(PASTA)) {
  console.error(`sem-exemplos: a pasta ${PASTA}/ não existe. Rode o vite build antes.`)
  process.exit(1)
}

function arquivos(pasta) {
  return readdirSync(pasta, { withFileTypes: true }).flatMap((item) => {
    const caminho = join(pasta, item.name)
    return item.isDirectory() ? arquivos(caminho) : [caminho]
  })
}

const achados = []
for (const arquivo of arquivos(PASTA)) {
  const texto = readFileSync(arquivo, 'latin1')
  for (const valor of PROIBIDOS) {
    if (texto.includes(valor)) achados.push(`${arquivo}: ${valor}`)
  }
}

if (achados.length > 0) {
  console.error('sem-exemplos: dado de exemplo encontrado no build:')
  for (const achado of achados) console.error(`  ${achado}`)
  process.exit(1)
}

console.log('sem-exemplos: nenhum dado de exemplo no build.')
