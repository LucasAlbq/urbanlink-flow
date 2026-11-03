import { CIDADE } from './cidadeCaminhos.js'
import css from './Skyline.module.css'

// A cidade do hero em três camadas (fundo, meio com a rota e o pacote, frente).
// Cada camada é um SVG próprio pro parallax da fase 3 mover uma de cada vez.
// recorte: o viewBox (o login mostra só um pedaço da cidade). pacote: [x, y] do pacote na rota.
// A altura vem de --skyline-altura (padrão: a do hero).
export function Skyline({ recorte = '0 0 1440 520', pacote = CIDADE.pacote, className = '' }) {
  const [px, py] = pacote

  return (
    <div className={`${css.skyline} ${className}`} aria-hidden="true">
      <svg viewBox={recorte} preserveAspectRatio="xMidYMax slice" className={css.camada} data-camada="fundo" focusable="false">
        <path d={CIDADE.fundo} className={css.fundo} />
      </svg>
      <svg viewBox={recorte} preserveAspectRatio="xMidYMax slice" className={css.camada} data-camada="meio" focusable="false">
        <path d={CIDADE.meio} className={css.meio} />
        <path d={CIDADE.rota} className={css.rota} id="rota-hero" />
        <path d={CIDADE.seta} className={css.seta} />
        <circle cx={px} cy={py} r="17" className={css.halo} />
        <circle cx={px} cy={py} r="10" className={css.pacote} data-pacote="" />
      </svg>
      <svg viewBox={recorte} preserveAspectRatio="xMidYMax slice" className={css.camada} data-camada="frente" focusable="false">
        <path d={CIDADE.frente} className={css.frente} />
      </svg>
    </div>
  )
}
