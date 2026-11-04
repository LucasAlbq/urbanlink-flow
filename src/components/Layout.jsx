import { useEffect, useRef } from 'react'
import { Outlet, ScrollRestoration, useLocation, useMatches } from 'react-router'

import { ScrollSuave } from '../motion/ScrollSuave.jsx'
import { FaixaExemplos } from './FaixaExemplos.jsx'
import { Header } from './Header.jsx'
import { Rodape } from './Rodape.jsx'

// Leva o foco pra uma âncora, como #como-funciona. Quem rola é o ScrollRestoration
// ou o ScrollSuave (preventScroll), senão o foco desfazia a posição deles.
function irParaAncora(hash) {
  const alvo = document.getElementById(decodeURIComponent(hash.slice(1)))
  if (!alvo) return false
  if (!alvo.hasAttribute('tabindex')) alvo.setAttribute('tabindex', '-1')
  alvo.focus({ preventScroll: true })
  return true
}

export function Layout() {
  const { pathname, hash, key } = useLocation()
  const rotaAnterior = useRef(pathname)
  // Rotas com handle { soConteudo: true } (login e telas de senha) não têm Header nem Rodape.
  const soConteudo = useMatches().some((rota) => rota.handle?.soConteudo)

  // Ao mudar de rota, o foco vai pro título da página (não na primeira carga).
  // Com âncora no endereço, o foco vai pra seção da âncora.
  // preventScroll: ao voltar (botão do navegador), a página fica onde o ScrollRestoration
  // deixou, em vez de subir até o título.
  useEffect(() => {
    const mudouRota = rotaAnterior.current !== pathname
    rotaAnterior.current = pathname
    if (hash && irParaAncora(hash)) return
    if (mudouRota) document.querySelector('#conteudo h1')?.focus({ preventScroll: true })
  }, [pathname, hash, key])

  // O ScrollRestoration fica dentro do ScrollSuave: o Lenis precisa saber pra onde ele rolou.
  return (
    <ScrollSuave>
      <a className="pular" href="#conteudo">
        Pular para o conteúdo
      </a>
      {!soConteudo && <Header />}
      <main id="conteudo" tabIndex={-1}>
        <Outlet />
      </main>
      {!soConteudo && <Rodape />}
      <FaixaExemplos />
      <ScrollRestoration />
    </ScrollSuave>
  )
}
