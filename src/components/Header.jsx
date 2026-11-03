import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { Link, NavLink } from 'react-router'

import { Botao } from './Botao.jsx'
import { Logo } from './Logo.jsx'
import { MenuCelular } from './MenuCelular.jsx'
import css from './Header.module.css'

// Topo sobre fundo escuro (prancha Landing). Abaixo de 1100 px os links viram o
// botão de menu, que abre o MenuCelular.
export function Header() {
  const [menuAberto, setMenuAberto] = useState(false)
  const idMenu = useId()
  const botaoMenu = useRef(null)
  const jaAbriu = useRef(false)

  const fecharMenu = useCallback(() => setMenuAberto(false), [])

  // Quando o menu fecha, o foco volta pro botão. Se a rota mudou, o Layout leva o foco pro h1 depois.
  useEffect(() => {
    if (menuAberto) {
      jaAbriu.current = true
      return
    }
    if (jaAbriu.current) botaoMenu.current?.focus()
  }, [menuAberto])

  return (
    <header className={css.header}>
      <div className={css.dentro}>
        <Link to="/" className={css.logo} aria-label="UrbanLink, início">
          <Logo className={css.logoSvg} />
        </Link>
        <div className={css.direita}>
          <nav className={css.links} aria-label="Principal">
            <Link to="/#como-funciona" className={css.link}>
              Como funciona
            </Link>
            <NavLink to="/rastreamento" className={css.link}>
              Rastrear entrega
            </NavLink>
            {/* end: em /contato/enviado nenhum link fica marcado (prancha Contato-Enviado) */}
            <NavLink to="/contato" end className={css.link}>
              Fale com a gente
            </NavLink>
          </nav>
          <Botao href="/login" variante="contorno" tamanho="normal" className={css.entrar}>
            Entrar na plataforma
          </Botao>
          <button
            ref={botaoMenu}
            type="button"
            className={css.menu}
            aria-label={menuAberto ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={menuAberto}
            aria-controls={menuAberto ? idMenu : undefined}
            onClick={() => setMenuAberto((aberto) => !aberto)}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M 3 6 H 21 M 3 12 H 21 M 3 18 H 21" />
            </svg>
          </button>
        </div>
      </div>
      <MenuCelular id={idMenu} aberto={menuAberto} aoFechar={fecharMenu} />
    </header>
  )
}
