import { Link, NavLink } from 'react-router'

import css from './Header.module.css'

// Base da fase 0: só a estrutura. O visual vem da prancha na fase 1.
const LINKS = [
  { para: '/', texto: 'Início', fim: true },
  { para: '/rastreamento', texto: 'Rastrear entrega' },
  { para: '/contato', texto: 'Fale com a gente' },
]

export function Header() {
  return (
    <header className={css.header}>
      <div className={css.dentro}>
        <Link to="/" className={css.logo}>
          UrbanLink Flow
        </Link>
        <nav aria-label="Principal">
          <ul className={css.links}>
            {LINKS.map((link) => (
              <li key={link.para}>
                <NavLink to={link.para} end={link.fim} className={css.link}>
                  {link.texto}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <NavLink to="/login" className={css.link}>
          Entrar na plataforma
        </NavLink>
      </div>
    </header>
  )
}
