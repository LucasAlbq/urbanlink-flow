import { LOGO } from './logoCaminhos.js'
import css from './Logo.module.css'

// Logo horizontal. fundo="escuro": letras em Branco; "claro": letras em Marinho.
// LINK e o A ficam sempre em Ouro. É decorativa: quem usa dá o nome no link.
export function Logo({ fundo = 'escuro', className = '' }) {
  return (
    <svg
      viewBox="981 566 739 118"
      aria-hidden="true"
      focusable="false"
      className={`${css.logo} ${fundo === 'claro' ? css.claro : ''} ${className}`}
    >
      {LOGO.map((parte, i) => (
        <path key={i} d={parte.d} className={parte.ouro ? css.ouro : css.letra} />
      ))}
    </svg>
  )
}
