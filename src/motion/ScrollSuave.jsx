import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useLocation, useNavigationType } from 'react-router'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useGSAP } from '@gsap/react'
import { ReactLenis, useLenis } from 'lenis/react'
import 'lenis/dist/lenis.css'

import { MODOS } from './setup.js'

// Avisa o ScrollTrigger a cada quadro de rolagem do Lenis.
function SincronizaScrollTrigger() {
  useLenis(ScrollTrigger.update)
  return null
}

// Elemento da âncora do endereço (#como-funciona). Hash quebrado conta como sem âncora.
function elementoDaAncora(hash) {
  if (!hash) return null
  try {
    return document.getElementById(decodeURIComponent(hash.slice(1)))
  } catch {
    return null
  }
}

// Depois de cada navegação, o ScrollRestoration já rolou a página (pro topo, pra posição
// salva ou pra âncora). Ele fica dentro do ScrollSuave, então o efeito dele roda antes deste.
// Aqui o Lenis assume a posição nova; sem isso, a inércia da roda puxava a página de volta.
function useRolagemDaRota(lenis) {
  const { pathname, hash, key } = useLocation()
  const tipo = useNavigationType()
  const anterior = useRef({ key, pathname })

  useLayoutEffect(() => {
    const antes = anterior.current
    anterior.current = { key, pathname }
    if (!lenis || antes.key === key) return

    // Âncora na mesma página (/#como-funciona estando na landing): volta pro ponto de onde
    // saiu, antes de pintar, e desliza até a seção. Voltar e avançar (POP) não deslizam.
    // Com o Lenis parado (menu aberto), fica o pulo do ScrollRestoration.
    const mesmaPagina = tipo !== 'POP' && antes.pathname === pathname
    const alvo = mesmaPagina && !lenis.isStopped ? elementoDaAncora(hash) : null
    if (alvo) {
      window.scrollTo({ top: lenis.animatedScroll, behavior: 'instant' })
      lenis.scrollTo(alvo)
      return
    }

    // Página nova, voltar ou avançar: mede a página nova (sozinho, o Lenis só mede 250 ms
    // depois) e zera a inércia onde o ScrollRestoration deixou. stop/start em vez de
    // scrollTo(immediate), que ignora o próximo evento de rolagem: ao voltar pra uma
    // âncora, o próprio navegador ainda rola até ela depois disso.
    lenis.resize()
    if (!lenis.isStopped) {
      lenis.stop()
      lenis.start()
    }
  }, [lenis, key, pathname, hash, tipo])

  // Gatilhos e travas medem a página nova depois que as fontes carregam (02-efeitos.md).
  useEffect(() => {
    let valendo = true
    document.fonts.ready.then(() => {
      if (valendo) ScrollTrigger.refresh()
    })
    return () => {
      valendo = false
    }
  }, [pathname])
}

// Tecla no meio de um deslize (Tab, setas, Page Down): o navegador assume a rolagem.
// Sem isso, o Lenis terminava o deslize por cima e o foco podia ficar fora da tela.
function usePararDesliseNaTecla(lenis) {
  useEffect(() => {
    if (!lenis) return
    const aoTeclar = () => {
      if (!lenis.isSmooth) return
      lenis.stop() // stop() e start() zeram a inércia onde a página está
      lenis.start()
    }
    window.addEventListener('keydown', aoTeclar, { capture: true })
    return () => window.removeEventListener('keydown', aoTeclar, { capture: true })
  }, [lenis])
}

// Scroll suave (02-efeitos.md): Lenis no relógio do GSAP (autoRaf: false), junto com o
// ScrollTrigger. Vai em volta do conteúdo do Layout, com o ScrollRestoration dentro.
export function ScrollSuave({ children }) {
  const lenisRef = useRef(null)
  const lenis = useLenis()
  const [reduzido, setReduzido] = useState(() => window.matchMedia(MODOS.reduzido).matches)

  useGSAP(() => {
    const tick = (tempo) => lenisRef.current?.lenis?.raf(tempo * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)

    // Movimento reduzido: a roda do mouse volta a ser a do navegador, sem suavização.
    // Os scrollTo do Lenis viram pulo sozinhos (respectReducedMotion, ligado por padrão).
    gsap.matchMedia().add(MODOS, ({ conditions }) => setReduzido(conditions.reduzido))

    return () => gsap.ticker.remove(tick)
  })

  useRolagemDaRota(lenis)
  usePararDesliseNaTecla(lenis)

  return (
    <ReactLenis root options={{ autoRaf: false, lerp: 0.1, smoothWheel: !reduzido }} ref={lenisRef}>
      <SincronizaScrollTrigger />
      {children}
    </ReactLenis>
  )
}
