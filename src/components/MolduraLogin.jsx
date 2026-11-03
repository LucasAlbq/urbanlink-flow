import { Link } from 'react-router'

import { Logo } from './Logo.jsx'
import { Skyline } from './cidade/Skyline.jsx'
import css from './MolduraLogin.module.css'

// Recorte da cidade do hero que aparece no login, e o pacote parado nele (prancha Login).
const RECORTE = '160 0 900 520'
const PACOTE = [610, 360]

// O molde do login e das telas de senha: a cidade à esquerda e o formulário à direita.
// A rota usa handle { soConteudo: true }, então não tem Header nem Rodape.
// voltarPara / textoVoltar: o link da barra ("Voltar para o site" ou "Voltar para o login").
export function MolduraLogin({ voltarPara = '/', textoVoltar = 'Voltar para o site', children }) {
  return (
    <div className={css.moldura}>
      <div className={css.arte}>
        <Link to="/" className={css.logo} aria-label="UrbanLink, voltar ao site">
          <Logo className={css.logoArte} />
        </Link>
        <p className={css.frase}>A cidade toda numa tela só.</p>
        <Skyline recorte={RECORTE} pacote={PACOTE} className={css.cidade} />
      </div>

      <div className={css.lado}>
        <div className={css.barra}>
          <Link to="/" className={`${css.logo} ${css.logoCelular}`} aria-label="UrbanLink, voltar ao site">
            <Logo fundo="claro" umaCor className={css.logoCelularSvg} />
          </Link>
          <Link to={voltarPara} className={css.voltar}>
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M 15 5 L 8 12 L 15 19" />
            </svg>
            {textoVoltar}
          </Link>
        </div>
        <div className={css.centro}>{children}</div>
      </div>
    </div>
  )
}
