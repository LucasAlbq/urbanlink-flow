// Estilo do MapaReal: os dados do OpenFreeMap (esquema OpenMapTiles) pintados como o
// MapaIlustrado. As quadras são o chão, as ruas são Névoa, parques e água nas cores --mapa-*,
// nomes em Marinho (o Cinza fica abaixo de 4,5:1 sobre as quadras, os parques e a água).
// Só as camadas que ajudam a ler a rota; sem prédios, trilhos e divisas.
// As cores chegam lidas dos tokens (lerCores), nenhum hex aqui.

const OPENFREEMAP = 'https://tiles.openfreemap.org'
const FONTE = ['Noto Sans Regular']
const FONTE_AGUA = ['Noto Sans Italic']

const LINHA = ['match', ['geometry-type'], ['LineString', 'MultiLineString'], true, false]
const AREA = ['match', ['geometry-type'], ['MultiPolygon', 'Polygon'], true, false]
// O name:pt às vezes vem com explicação ("Rio Comprido (bairro do Rio de Janeiro)"); o name é o nome curto.
const NOME = ['get', 'name']
const classe = (...nomes) => ['match', ['get', 'class'], nomes, true, false]
const largura = (base, z1, l1, z2, l2) => ['interpolate', ['exponential', base], ['zoom'], z1, l1, z2, l2]

// A linha Ouro até `t` (0 a 1 do comprimento) e transparente depois. O efeito de desenhar só
// troca o `t`: mudar a pintura é bem mais leve que mandar a linha de novo pro mapa a cada quadro.
export const tracoAte = (cor, t) => ['step', ['line-progress'], cor, t, 'transparent']

export function lerCores() {
  const tokens = getComputedStyle(document.documentElement)
  const ler = (nome) => tokens.getPropertyValue(nome).trim()
  return {
    quadra: ler('--mapa-quadra'),
    parque: ler('--mapa-parque'),
    rio: ler('--mapa-rio'),
    nevoa: ler('--nevoa'),
    marinho: ler('--marinho'),
    noite: ler('--noite'),
    ouro: ler('--ouro'),
  }
}

export function estiloDoMapa(cor) {
  const dados = { source: 'openmaptiles' }
  const rua = (id, filtro, larguraLinha, extra = {}) => ({
    id,
    type: 'line',
    ...dados,
    'source-layer': 'transportation',
    filter: ['all', LINHA, filtro],
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: { 'line-color': cor.nevoa, 'line-width': larguraLinha, ...extra },
  })
  const nome = (id, camada, filtro, extra = {}) => ({
    id,
    type: 'symbol',
    ...dados,
    'source-layer': camada,
    filter: filtro,
    layout: { 'text-field': NOME, 'text-font': FONTE, 'text-size': 12, ...extra },
    paint: { 'text-color': cor.marinho, 'text-halo-color': cor.nevoa, 'text-halo-width': 1.5 },
  })
  const tunel = ['==', ['get', 'brunnel'], 'tunnel']
  const semTunel = ['!=', ['get', 'brunnel'], 'tunnel']

  return {
    version: 8,
    sources: { openmaptiles: { type: 'vector', url: `${OPENFREEMAP}/planet` } },
    glyphs: `${OPENFREEMAP}/fonts/{fontstack}/{range}.pbf`,
    layers: [
      { id: 'chao', type: 'background', paint: { 'background-color': cor.quadra } },
      { id: 'parque', type: 'fill', ...dados, 'source-layer': 'park', filter: AREA, paint: { 'fill-color': cor.parque } },
      {
        id: 'mata',
        type: 'fill',
        ...dados,
        'source-layer': 'landcover',
        filter: ['all', AREA, classe('wood', 'grass')],
        paint: { 'fill-color': cor.parque },
      },
      {
        id: 'agua',
        type: 'fill',
        ...dados,
        'source-layer': 'water',
        filter: ['all', AREA, semTunel],
        paint: { 'fill-color': cor.rio },
      },
      {
        id: 'rio',
        type: 'line',
        ...dados,
        'source-layer': 'waterway',
        filter: LINHA,
        paint: { 'line-color': cor.rio, 'line-width': largura(1.4, 10, 1, 18, 8) },
      },
      // Túnel: a rua some no morro, só um rastro claro.
      rua('tunel', ['all', tunel, classe('motorway', 'trunk', 'primary', 'secondary', 'tertiary', 'minor')],
        largura(1.3, 10, 1, 20, 14), { 'line-opacity': 0.45 }),
      rua('rua', ['all', semTunel, classe('minor', 'service')], largura(1.55, 13, 1.8, 20, 20), { 'line-opacity': ['interpolate', ['linear'], ['zoom'], 12, 0, 13, 1] }),
      rua('avenida', ['all', semTunel, classe('primary', 'secondary', 'tertiary', 'trunk')], largura(1.3, 10, 2, 20, 20)),
      rua('via-expressa', ['all', semTunel, classe('motorway')], largura(1.4, 6, 1.3, 20, 30)),
      nome('nome-agua', 'water_name', LINHA, { 'text-font': FONTE_AGUA, 'symbol-placement': 'line', 'text-letter-spacing': 0.1 }),
      nome('nome-rua', 'transportation_name', ['all', LINHA, classe('minor', 'service')], {
        'symbol-placement': 'line',
        'text-size': 11,
      }),
      nome('nome-avenida', 'transportation_name', ['all', LINHA, classe('primary', 'secondary', 'tertiary', 'trunk', 'motorway')], {
        'symbol-placement': 'line',
      }),
      {
        ...nome('nome-bairro', 'place', classe('suburb', 'quarter', 'neighbourhood'), { 'text-size': 13, 'text-max-width': 8 }),
        minzoom: 11,
      },
    ],
  }
}
