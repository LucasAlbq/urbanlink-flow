import { LOGO_ABERTURA as G } from './logoAnimadoCaminhos.js'
import css from './LogoAnimado.module.css'

const URBAN = ['u', 'r', 'b', 'n']
const LINK = ['l', 'i', 'n2', 'k']

// Logo vertical da abertura (prancha docs/referencia/abertura/Abertura-Codigo.dc.html).
// O HTML já é o logo pronto: quem anima (src/motion/abertura.js) põe cada parte no começo.
// Sem efeito (movimento reduzido), fica assim. O pacote só aparece pelo efeito.
// - O A se pinta por duas máscaras, uma por fio do traço (P1 e P2, com os recortes do P1).
// - As letras sobem dentro de dois recortes (URBAN e LINK); a seta entra no recorte dela.
// - Ids com prefixo ul-ab-: máscara com id repetido na página quebra o desenho.
// É decorativo (aria-hidden): o nome do site está no título da página.
export function LogoAnimado({ className = '' }) {
  return (
    <svg
      viewBox="533.86 327 852.28 419.28"
      className={`${css.logo} ${className}`}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <mask id="ul-ab-m1" maskUnits="userSpaceOnUse" x="1000" y="300" width="320" height="280">
          <path
            d={G.p1}
            className={css.fio}
            strokeWidth="64"
            strokeLinecap="butt"
            strokeLinejoin="round"
            strokeDasharray={`${G.l1} ${G.l1}`}
            data-ul-ab="fio1"
          />
          <path d={G.dg} className={css.esconde} />
          <path d={G.sh} className={css.esconde} />
        </mask>
        <mask id="ul-ab-m2" maskUnits="userSpaceOnUse" x="1000" y="300" width="320" height="280">
          <path
            d={G.p2}
            className={css.fio}
            strokeWidth="64"
            strokeLinecap="butt"
            strokeLinejoin="round"
            strokeDasharray={`${G.l2} ${G.l2}`}
            data-ul-ab="fio2"
          />
        </mask>
        <clipPath id="ul-ab-c1">
          <rect x="530" y="335" width="860" height="206" />
        </clipPath>
        <clipPath id="ul-ab-c2">
          <rect x="530" y="548" width="600" height="196" />
        </clipPath>
        <clipPath id="ul-ab-cm">
          <rect x="1000" y="330" width="213" height="220" />
        </clipPath>
        <clipPath id="ul-ab-ca">
          <rect x="1212" y="330" width="80" height="220" />
        </clipPath>
      </defs>

      <g clipPath="url(#ul-ab-c1)" className={css.branco}>
        {URBAN.map((letra) => (
          <path key={letra} d={G[letra]} data-ul-ab={letra} />
        ))}
      </g>
      <g clipPath="url(#ul-ab-c2)" className={css.ouro}>
        {LINK.map((letra) => (
          <path key={letra} d={G[letra]} data-ul-ab={letra} />
        ))}
      </g>
      <g clipPath="url(#ul-ab-cm)" className={css.ouro}>
        <path d={G.a} mask="url(#ul-ab-m1)" />
        <path d={G.a} mask="url(#ul-ab-m2)" />
      </g>
      <g clipPath="url(#ul-ab-ca)" className={css.ouro}>
        <path d={G.a} data-ul-ab="seta" />
      </g>
      <circle r="14" className={css.pacote} data-ul-ab="pacote" />
    </svg>
  )
}
