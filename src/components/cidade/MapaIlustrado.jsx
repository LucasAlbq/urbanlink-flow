import { MAPA } from './mapaCaminhos.js'
import css from './MapaIlustrado.module.css'

const SETA = 'M 0 0 H 30 L 64 30 L 30 60 H 0 L 26 30 Z'

// Mapa desenhado da cidade: quadras, parques, rio, avenida e a rota Ouro.
// Também é a reserva do mapa real no rastreamento (o `progresso` entra com essa tela).
export function MapaIlustrado({ className = '' }) {
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
      <path d={MAPA.rota} className={css.rota} />
      <circle cx="120" cy="470" r="15" className={css.inicio} />
      <g transform="translate(782 170) scale(0.66)">
        <path d={SETA} className={css.fim} />
      </g>
    </svg>
  )
}
