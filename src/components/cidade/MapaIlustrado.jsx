import { MAPA } from './mapaCaminhos.js'
import css from './MapaIlustrado.module.css'

const SETA = 'M 0 0 H 30 L 64 30 L 30 60 H 0 L 26 30 Z'

// A rota do mapa é feita só de M, H e V: vira uma lista de pontos.
function pontosDaRota(d) {
  const partes = d.trim().split(/\s+/)
  const pontos = []
  let x = 0
  let y = 0
  for (let i = 0; i < partes.length; i++) {
    const cmd = partes[i]
    if (cmd === 'M') {
      x = Number(partes[++i])
      y = Number(partes[++i])
    } else if (cmd === 'H') x = Number(partes[++i])
    else if (cmd === 'V') y = Number(partes[++i])
    pontos.push([x, y])
  }
  return pontos
}

// Divide a rota no ponto `progresso` (0 a 1 do comprimento): trecho feito, trecho que falta e o ponto.
function dividirRota(pontos, progresso) {
  const trechos = pontos.slice(1).map((p, i) => Math.hypot(p[0] - pontos[i][0], p[1] - pontos[i][1]))
  let falta = trechos.reduce((a, b) => a + b, 0) * Math.min(Math.max(progresso, 0), 1)
  const feito = [pontos[0]]
  for (let i = 0; i < trechos.length; i++) {
    const [ax, ay] = pontos[i]
    const [bx, by] = pontos[i + 1]
    if (falta <= trechos[i]) {
      const t = trechos[i] ? falta / trechos[i] : 0
      const ponto = [ax + (bx - ax) * t, ay + (by - ay) * t]
      feito.push(ponto)
      return { feito, resto: [ponto, ...pontos.slice(i + 1)], ponto }
    }
    falta -= trechos[i]
    feito.push(pontos[i + 1])
  }
  const ultimo = pontos[pontos.length - 1]
  return { feito, resto: [], ponto: ultimo }
}

const caminho = (pontos) => pontos.map(([x, y], i) => `${i ? 'L' : 'M'} ${x} ${y}`).join(' ')

const ROTA = pontosDaRota(MAPA.rota)

// Mapa desenhado da cidade: quadras, parques, rio, avenida e a rota Ouro.
// Sem `progresso` (landing): rota inteira em Ouro. Com `progresso` (rastreamento, 0 a 1):
// trecho feito em Ouro, o que falta pontilhado e o pacote no ponto. É a reserva do mapa real.
export function MapaIlustrado({ progresso, className = '' }) {
  const comProgresso = typeof progresso === 'number'
  const rota = comProgresso ? dividirRota(ROTA, progresso) : null

  return (
    <svg
      viewBox="0 0 960 560"
      preserveAspectRatio="xMidYMid slice"
      className={`${css.mapa} ${className}`}
      aria-hidden="true"
      focusable="false"
    >
      <rect x="0" y="0" width="960" height="560" className={css.chao} />
      {MAPA.quadras.map(([x, y, w, h, parque]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={w} height={h} rx="6" className={parque ? css.parque : css.quadra} />
      ))}
      <path d={MAPA.rio} className={css.rio} />
      <path d={MAPA.avenida} className={css.avenida} />
      {comProgresso ? (
        <>
          {rota.resto.length > 1 && <path d={caminho(rota.resto)} className={css.falta} data-mapa-falta="" />}
          <path d={caminho(rota.feito)} className={css.rota} data-mapa-feito="" />
        </>
      ) : (
        <path d={MAPA.rota} className={css.rota} />
      )}
      <circle cx="120" cy="470" r="15" className={css.inicio} />
      <g transform="translate(782 170) scale(0.66)">
        <path d={SETA} className={css.fim} />
      </g>
      {/* No fim (entregue) o pacote sairia por cima da seta: a rota inteira em Ouro basta. */}
      {comProgresso && progresso < 1 && (
        <g data-mapa-pacote="">
          <circle cx={rota.ponto[0]} cy={rota.ponto[1]} r="22" className={css.halo} />
          <circle cx={rota.ponto[0]} cy={rota.ponto[1]} r="14" className={css.pacote} />
        </g>
      )}
    </svg>
  )
}
