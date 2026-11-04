import { useId } from 'react'

import { LOGO } from './logoCaminhos.js'
import css from './Logo.module.css'

// O A é a última parte do logo. Ele vai em duas cópias recortadas, como no logo animado:
// o corpo e a seta (data-logo-seta), que o topo faz encaixar no hover (motion/logoTopo.js).
// A divisa é a do logo vertical (x = 1212/1213 do geom.json) na escala do horizontal (0,508),
// com 1 unidade de sobra entre os dois recortes pra não abrir fresta.
const PARTES = LOGO.slice(0, -1)
const A = LOGO[LOGO.length - 1]
const CORPO = { x: 1221, y: 571, width: 108.7, height: 113 }
const SETA = { x: 1329.2, y: 571, width: 41, height: 113 }

// Logo horizontal. fundo="escuro": letras em Branco; "claro": letras em Marinho.
// LINK e o A ficam em Ouro. umaCor: tudo numa cor só (Branco no escuro, Noite no claro),
// as versões negativa e positiva do manual. É decorativa: quem usa dá o nome no link.
// Ids com useId: o logo aparece mais de uma vez na página (topo e rodapé).
export function Logo({ fundo = 'escuro', umaCor = false, className = '' }) {
  const id = useId().replace(/:/g, '')
  const corpo = `ul-logo-${id}-corpo`
  const seta = `ul-logo-${id}-seta`

  return (
    <svg
      viewBox="981 566 739 118"
      aria-hidden="true"
      focusable="false"
      className={`${css.logo} ${fundo === 'claro' ? css.claro : ''} ${umaCor ? css.umaCor : ''} ${className}`}
    >
      <defs>
        <clipPath id={corpo}>
          <rect {...CORPO} />
        </clipPath>
        <clipPath id={seta}>
          <rect {...SETA} />
        </clipPath>
      </defs>
      {PARTES.map((parte, i) => (
        <path key={i} d={parte.d} className={parte.ouro ? css.ouro : css.letra} />
      ))}
      <g clipPath={`url(#${corpo})`}>
        <path d={A.d} className={css.ouro} />
      </g>
      <g clipPath={`url(#${seta})`}>
        <path d={A.d} className={css.ouro} data-logo-seta="" />
      </g>
    </svg>
  )
}
