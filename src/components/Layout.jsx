import { useEffect, useRef } from 'react'
import { Outlet, ScrollRestoration, useLocation } from 'react-router'

import { Header } from './Header.jsx'
import { Rodape } from './Rodape.jsx'

export function Layout() {
  const { pathname } = useLocation()
  const rotaAnterior = useRef(pathname)

  // Ao mudar de rota, o foco vai pro título da página (não na primeira carga).
  useEffect(() => {
    if (rotaAnterior.current === pathname) return
    rotaAnterior.current = pathname
    document.querySelector('#conteudo h1')?.focus()
  }, [pathname])

  return (
    <>
      <a className="pular" href="#conteudo">
        Pular para o conteúdo
      </a>
      <Header />
      <main id="conteudo" tabIndex={-1}>
        <Outlet />
      </main>
      <Rodape />
      <ScrollRestoration />
    </>
  )
}
