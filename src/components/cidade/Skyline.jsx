import { CIDADE } from './cidadeCaminhos.js'
import css from './Skyline.module.css'

const VIEWBOX = '0 0 1440 520'

// A cidade do hero em três camadas (fundo, meio com a rota e o pacote, frente).
// Cada camada é um SVG próprio pro parallax da fase 3 mover uma de cada vez.
export function Skyline({ className = '' }) {
  const [px, py] = CIDADE.pacote

  return (
    <div className={`${css.skyline} ${className}`} aria-hidden="true">
      <svg viewBox={VIEWBOX} preserveAspectRatio="xMidYMax slice" className={css.camada} data-camada="fundo" focusable="false">
        <path d={CIDADE.fundo} className={css.fundo} />
      </svg>
      <svg viewBox={VIEWBOX} preserveAspectRatio="xMidYMax slice" className={css.camada} data-camada="meio" focusable="false">
        <path d={CIDADE.meio} className={css.meio} />
        <path d={CIDADE.rota} className={css.rota} id="rota-hero" />
        <path d={CIDADE.seta} className={css.seta} />
        <circle cx={px} cy={py} r="17" className={css.halo} />
        <circle cx={px} cy={py} r="10" className={css.pacote} data-pacote="" />
      </svg>
      <svg viewBox={VIEWBOX} preserveAspectRatio="xMidYMax slice" className={css.camada} data-camada="frente" focusable="false">
        <path d={CIDADE.frente} className={css.frente} />
      </svg>
    </div>
  )
}
