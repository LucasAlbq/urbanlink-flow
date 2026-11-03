import { Link } from 'react-router'

import css from './Rodape.module.css'

// Base da fase 0: só a estrutura. O visual vem da prancha na fase 1.
// Os links da API e do GitHub só aparecem se as variáveis estiverem preenchidas.
const linkApi = import.meta.env.VITE_LINK_API_DOCS
const linkGithub = import.meta.env.VITE_LINK_GITHUB

export function Rodape() {
  return (
    <footer className={css.rodape}>
      <div className={css.dentro}>
        <ul className={css.links}>
          <li>
            <Link to="/privacidade" className={css.link}>
              Política de Privacidade
            </Link>
          </li>
          {linkApi && (
            <li>
              <a href={linkApi} className={css.link}>
                Documentação da API
              </a>
            </li>
          )}
          {linkGithub && (
            <li>
              <a href={linkGithub} className={css.link}>
                GitHub
              </a>
            </li>
          )}
        </ul>
      </div>
    </footer>
  )
}
