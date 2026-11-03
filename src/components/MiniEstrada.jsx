import css from './MiniEstrada.module.css'

const SETA = 'M 0 0 H 30 L 64 30 L 30 60 H 0 L 26 30 Z'

// A mini estrada das pranchas Contato-Enviado e Recuperar-Senha-Enviado: asfalto, faixa,
// o pacote e a seta Ouro no fim. Decorativa. O efeito da fase 3 faz o pacote correr até a seta.
// pacote: onde o pacote está, em unidades do desenho (20 = começo, 190 = meio).
// tamanho: normal (360 px) · pequeno (300 px).
export function MiniEstrada({ pacote = 20, tamanho = 'normal' }) {
  return (
    <svg
      viewBox="0 0 400 60"
      className={`${css.mini} ${tamanho === 'pequeno' ? css.pequena : ''}`}
      aria-hidden="true"
      focusable="false"
      data-mini-estrada=""
    >
      <rect x="14" y="19" width="340" height="22" className={css.asfalto} />
      <path d="M 30 30 H 330" className={css.faixa} />
      <circle cx={pacote} cy="30" r="13" className={css.pacote} data-pacote="" />
      <g transform="translate(332 0)" data-fim="">
        <path d={SETA} className={css.seta} />
      </g>
    </svg>
  )
}
