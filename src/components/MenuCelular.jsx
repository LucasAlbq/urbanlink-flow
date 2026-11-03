import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Link, useLocation } from 'react-router'

import { Botao } from './Botao.jsx'
import { Logo } from './Logo.jsx'
import { Estrada } from './estrada/Estrada.jsx'
import css from './MenuCelular.module.css'

const LINKS = [
  { id: 'inicio', texto: 'Início', href: '/' },
  { id: 'como-funciona', texto: 'Como funciona', href: '/#como-funciona' },
  { id: 'rastrear', texto: 'Rastrear entrega', href: '/rastreamento' },
  { id: 'contato', texto: 'Fale com a gente', href: '/contato' },
]

// Qual parada recebe o pacote. "Como funciona" é uma âncora da landing: lá quem fica marcado é Início.
function paginaAtual(pathname) {
  if (pathname === '/') return 'inicio'
  if (pathname === '/rastreamento' || pathname.startsWith('/rastreamento/')) return 'rastrear'
  if (pathname === '/contato') return 'contato'
  return null
}

// Acima disso o botão de menu some (Header.module.css).
const SO_CELULAR = '(max-width: 1100px)'

// Menu do celular (prancha Menu-Celular): painel de tela cheia com os links como paradas
// de uma estrada. Vai num portal fora do #root, que fica inert enquanto o menu está aberto.
// A descida de 260 ms entra na fase 3.
export function MenuCelular({ id, aberto, aoFechar }) {
  const { pathname } = useLocation()
  const fechar = useRef(null)

  useEffect(() => {
    if (!aberto) return
    const app = document.getElementById('root')
    const html = document.documentElement
    app.inert = true
    html.style.overflow = 'hidden'
    fechar.current?.focus()

    const aoTeclar = (evento) => {
      if (evento.key === 'Escape') aoFechar()
    }
    const largura = window.matchMedia(SO_CELULAR)
    const aoMudarLargura = () => {
      if (!largura.matches) aoFechar()
    }
    document.addEventListener('keydown', aoTeclar)
    largura.addEventListener('change', aoMudarLargura)

    return () => {
      app.inert = false
      html.style.overflow = ''
      document.removeEventListener('keydown', aoTeclar)
      largura.removeEventListener('change', aoMudarLargura)
    }
  }, [aberto, aoFechar])

  if (!aberto) return null

  const atual = paginaAtual(pathname)
  const etapas = LINKS.map((link) => ({
    id: link.id,
    conteudo: (
      <Link
        to={link.href}
        className={css.link}
        aria-current={link.id === atual ? 'page' : undefined}
        onClick={aoFechar}
      >
        {link.texto}
      </Link>
    ),
  }))
  const pacoteEm = LINKS.findIndex((link) => link.id === atual)

  return createPortal(
    <div id={id} className={css.painel} role="dialog" aria-modal="true" aria-label="Menu">
      <div className={css.dentro}>
        <div className={css.barra}>
          <Link to="/" className={css.logo} aria-label="UrbanLink, início" onClick={aoFechar}>
            <Logo className={css.logoSvg} />
          </Link>
          <button
            ref={fechar}
            type="button"
            className={css.fechar}
            aria-label="Fechar menu"
            onClick={aoFechar}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              <path d="M 5 5 L 19 19 M 19 5 L 5 19" />
            </svg>
          </button>
        </div>

        <nav aria-label="Principal" className={css.nav}>
          <Estrada
            etapas={etapas}
            orientacao="vertical"
            variante="menu"
            inicio={false}
            paradas
            pacoteEm={pacoteEm >= 0 ? pacoteEm : undefined}
          />
        </nav>

        <Botao href="/login" variante="ouro" className={css.entrar} onClick={aoFechar}>
          Entrar na plataforma
        </Botao>

        <p className={css.pe}>UrbanLink Systems, tecnologia para logística urbana desde 2017.</p>
      </div>
    </div>,
    document.body,
  )
}
