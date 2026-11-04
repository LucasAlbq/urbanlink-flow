import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

import { montarCorrida } from '../motion/miniEstrada.js'
import { MODOS } from '../motion/setup.js'
import css from './MiniEstrada.module.css'

const SETA = 'M 0 0 H 30 L 64 30 L 30 60 H 0 L 26 30 Z'
const COMECO = 20 // centro do pacote no começo do asfalto
const NA_SETA = 312 // centro do pacote parado logo antes da seta (que começa em 332)

// A mini estrada das pranchas Contato-Enviado e Recuperar-Senha-Enviado: asfalto, faixa,
// o pacote e a seta Ouro no fim. Decorativa.
// pacote: onde o pacote está, em unidades do desenho (20 = começo, 190 = meio).
// correr: a mensagem enviada. O pacote fica na seta e, com movimento, corre até lá ao abrir
// (motion/miniEstrada.js).
// tamanho: normal (360 px) · pequeno (300 px).
export function MiniEstrada({ pacote = COMECO, correr = false, tamanho = 'normal' }) {
  const svg = useRef(null)
  const ondeFica = correr ? NA_SETA : pacote

  useGSAP(
    () => {
      if (!correr) return
      gsap.matchMedia().add(MODOS, ({ conditions }) => {
        if (conditions.reduzido) return
        montarCorrida(svg.current, { de: COMECO, ate: NA_SETA })
      })
    },
    { scope: svg },
  )

  return (
    <svg
      ref={svg}
      viewBox="0 0 400 60"
      className={`${css.mini} ${tamanho === 'pequeno' ? css.pequena : ''}`}
      aria-hidden="true"
      focusable="false"
      data-mini-estrada=""
    >
      <rect x="14" y="19" width="340" height="22" className={css.asfalto} />
      <path d="M 30 30 H 330" className={css.faixa} />
      <circle cx={ondeFica} cy="30" r="13" className={css.pacote} data-pacote="" />
      <g transform="translate(332 0)" data-fim="">
        <path d={SETA} className={css.seta} data-seta="" />
      </g>
    </svg>
  )
}
