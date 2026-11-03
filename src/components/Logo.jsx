import { LOGO } from './logoCaminhos.js'
import css from './Logo.module.css'

// Logo horizontal. fundo="escuro": letras em Branco; "claro": letras em Marinho.
// LINK e o A ficam em Ouro. umaCor: tudo numa cor só (Branco no escuro, Noite no claro),
// as versões negativa e positiva do manual. É decorativa: quem usa dá o nome no link.
export function Logo({ fundo = 'escuro', umaCor = false, className = '' }) {
  return (
    <svg
      viewBox="981 566 739 118"
      aria-hidden="true"
      focusable="false"
      className={`${css.logo} ${fundo === 'claro' ? css.claro : ''} ${umaCor ? css.umaCor : ''} ${className}`}
    >
      {LOGO.map((parte, i) => (
        <path key={i} d={parte.d} className={parte.ouro ? css.ouro : css.letra} />
      ))}
    </svg>
  )
}
