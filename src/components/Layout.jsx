import { useEffect, useRef } from 'react'
import { Outlet, ScrollRestoration, useLocation } from 'react-router'

import { FaixaExemplos } from './FaixaExemplos.jsx'
import { Header } from './Header.jsx'
import { Rodape } from './Rodape.jsx'

// Leva o foco (e a rolagem) pra uma âncora, como #como-funciona.
function irParaAncora(hash) {
  const alvo = document.getElementById(decodeURIComponent(hash.slice(1)))
  if (!alvo) return false
  if (!alvo.hasAttribute('tabindex')) alvo.setAttribute('tabindex', '-1')
  alvo.focus()
  return true
}

export function Layout() {
  const { pathname, hash, key } = useLocation()
  const rotaAnterior = useRef(pathname)

  // Ao mudar de rota, o foco vai pro título da página (não na primeira carga).
  // Com âncora no endereço, o foco vai pra seção da âncora.
  useEffect(() => {
    const mudouRota = rotaAnterior.current !== pathname
    rotaAnterior.current = pathname
    if (hash && irParaAncora(hash)) return
    if (mudouRota) document.querySelector('#conteudo h1')?.focus()
  }, [pathname, hash, key])

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
      <FaixaExemplos />
      <ScrollRestoration />
    </>
  )
}
