import css from './Placa.module.css'

// Glifos desenhados na prancha. seta = a seta da marca; desvio = trecho que muda de rumo.
// check e retorno chegam com as telas de rastreamento e 404.
const GLIFOS = {
  seta: (
    <svg viewBox="0 0 64 60" className={css.seta} aria-hidden="true" focusable="false">
      <path d="M 0 0 H 30 L 64 30 L 30 60 H 0 L 26 30 Z" />
    </svg>
  ),
  desvio: (
    <svg viewBox="0 0 26 22" className={css.desvio} aria-hidden="true" focusable="false">
      <path d="M 2 18 H 9 L 15 6 H 22" />
      <path d="M 18 1.5 L 23.5 6 L 18 10.5" />
    </svg>
  ),
}

// estado: normal (Ouro) · atual (Amarelo). feito e proximo entram com o rastreamento.
export function Placa({ numero, nome, glifo = 'seta', estado = 'normal' }) {
  return (
    <div className={`${css.placa} ${css[estado] ?? ''}`} data-placa="">
      <span className={css.numero}>{numero}</span>
      <span className={css.nome}>{nome}</span>
      {GLIFOS[glifo]}
    </div>
  )
}
