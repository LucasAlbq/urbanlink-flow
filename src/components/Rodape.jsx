import { Link } from 'react-router'

import { Logo } from './Logo.jsx'
import css from './Rodape.module.css'

// Os links da API e do GitHub só aparecem se as variáveis estiverem preenchidas.
const linkApi = import.meta.env.VITE_LINK_API_DOCS
const linkGithub = import.meta.env.VITE_LINK_GITHUB

export function Rodape() {
  return (
    <footer className={css.rodape}>
      <div className={css.dentro}>
        <div className={css.topo}>
          <Link to="/" className={css.logo} aria-label="UrbanLink, voltar ao início">
            <Logo className={css.logoSvg} />
          </Link>
          <nav aria-label="Rodapé">
            <ul className={css.links}>
              <li>
                <Link to="/rastreamento" className={css.link}>Rastrear entrega</Link>
              </li>
              <li>
                <Link to="/contato" className={css.link}>Fale com a gente</Link>
              </li>
              <li>
                <Link to="/login" className={css.link}>Entrar na plataforma</Link>
              </li>
              <li>
                <Link to="/privacidade" className={css.link}>Política de Privacidade</Link>
              </li>
              {linkApi && (
                <li>
                  <a href={linkApi} className={css.link}>Documentação da API</a>
                </li>
              )}
              {linkGithub && (
                <li>
                  <a href={linkGithub} className={css.link}>Código no GitHub</a>
                </li>
              )}
            </ul>
          </nav>
        </div>
        <div className={css.notas}>
          <p>UrbanLink Systems, tecnologia para logística urbana desde 2017.</p>
          <p>Projeto acadêmico do curso de Desenvolvimento de Sistemas. A UrbanLink Systems é uma empresa fictícia.</p>
        </div>
      </div>
    </footer>
  )
}
