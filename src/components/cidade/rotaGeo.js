// Contas da rota do MapaReal: GeoJSON em [longitude, latitude].
// As distâncias usam um plano local em metros (bom pra uma rota dentro de uma cidade).

const METROS_POR_GRAU = 111_320

function noPlano(coords) {
  const lat0 = (coords[0][1] * Math.PI) / 180
  const k = Math.cos(lat0)
  return coords.map(([lng, lat]) => [lng * k * METROS_POR_GRAU, lat * METROS_POR_GRAU])
}

const misturar = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]

// Divide a rota no ponto dela mais perto de `posicao`: trecho feito, trecho que falta e o ponto.
export function dividirRota(coords, posicao) {
  const plano = noPlano([...coords, posicao])
  const p = plano.pop()
  let melhor = { distancia: Infinity, i: 0, t: 0 }
  for (let i = 0; i < plano.length - 1; i++) {
    const [ax, ay] = plano[i]
    const [bx, by] = plano[i + 1]
    const dx = bx - ax
    const dy = by - ay
    const tamanho2 = dx * dx + dy * dy
    const t = tamanho2 ? Math.min(Math.max(((p[0] - ax) * dx + (p[1] - ay) * dy) / tamanho2, 0), 1) : 0
    const distancia = Math.hypot(ax + dx * t - p[0], ay + dy * t - p[1])
    if (distancia < melhor.distancia) melhor = { distancia, i, t }
  }
  const ponto = misturar(coords[melhor.i], coords[melhor.i + 1], melhor.t)
  return {
    feito: [...coords.slice(0, melhor.i + 1), ponto],
    resto: [ponto, ...coords.slice(melhor.i + 1)],
    ponto,
  }
}

// Pra onde o último trecho aponta, em graus no sentido do relógio a partir do leste
// (o mesmo sentido do rotate do CSS). Vale com o mapa sem girar, com o norte pra cima.
export function direcaoFinal(coords) {
  const [a, b] = noPlano(coords.slice(-2))
  return (Math.atan2(-(b[1] - a[1]), b[0] - a[0]) * 180) / Math.PI
}

export function limites(coords) {
  const lngs = coords.map((c) => c[0])
  const lats = coords.map((c) => c[1])
  return [
    [Math.min(...lngs), Math.min(...lats)],
    [Math.max(...lngs), Math.max(...lats)],
  ]
}

export const linha = (coords) => ({
  type: 'Feature',
  properties: {},
  geometry: { type: 'LineString', coordinates: coords },
})
