import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { useLenis } from 'lenis/react'

import { LogoAnimado } from '../../components/LogoAnimado.jsx'
import { aberturaComecou, montarAbertura, sairCortina } from '../../motion/abertura.js'
import { pararRolagem } from '../../motion/pararRolagem.js'
import { MODOS } from '../../motion/setup.js'
import css from './Abertura.module.css'

// Teclas sozinhas de modificador e atalhos do navegador (Ctrl, Alt, Cmd) não pulam.
const MODIFICADORES = new Set(['Shift', 'Control', 'Alt', 'Meta', 'AltGraph', 'CapsLock'])

function teclaPula(evento) {
  return !MODIFICADORES.has(evento.key) && !evento.ctrlKey && !evento.metaKey && !evento.altKey
}

// Cortina da abertura (02-efeitos.md): Noite em tela cheia com o logo se desenhando, por cima
// do hero já montado. Vai num portal fora do #root, que fica inert enquanto ela está na tela.
// Sem botão de pular (decisão do grupo): clique, toque ou tecla pulam.
// No fim: sai o inert e o Lenis volta a rolar.
// aoSair (opcional): ponto de encaixe do voo do pacote e da entrada do hero, na hora da saída.
export function Abertura({ aoTerminar, aoSair }) {
  const cortina = useRef(null)
  const pular = useRef(null)
  const lenis = useLenis()

  useEffect(() => aberturaComecou(), [])

  // Durante a abertura, a página de trás (o hero) não recebe foco, clique nem leitor de tela.
  useEffect(() => {
    const app = document.getElementById('root')
    app.inert = true
    return () => {
      app.inert = false
    }
  }, [])

  // E não rola. O menu do celular pede a mesma coisa: quem soltar por último destrava.
  useEffect(() => (lenis ? pararRolagem(lenis) : undefined), [lenis])

  useEffect(() => {
    const aoTeclar = (evento) => {
      if (!teclaPula(evento)) return
      // Com a página de trás inert não há o que focar: sem isso, o Tab mandava o foco pra
      // barra do navegador. Assim o próximo Tab, já sem a cortina, começa pelo topo da página.
      if (evento.key === 'Tab') evento.preventDefault()
      pular.current?.()
    }
    document.addEventListener('keydown', aoTeclar)
    return () => document.removeEventListener('keydown', aoTeclar)
  }, [])

  useGSAP(
    () => {
      // Se o modo muda no meio (girar o celular passando de 760 px, ligar "reduzir
      // movimento"), o gsap.matchMedia() desfaz tudo e roda de novo: aí a abertura pula pro fim.
      let jaTocou = false

      gsap.matchMedia().add(MODOS, (contexto, contextSafe) => {
        const { reduzido } = contexto.conditions
        const mudouDeModo = jaTocou
        jaTocou = true
        let pulou = false
        let saindo = false

        const sair = contextSafe(() => {
          if (saindo) return
          saindo = true
          aoSair?.({ pulou, reduzido })
          sairCortina(cortina.current, { reduzido, pulou, aoTerminar })
        })

        const { tl, limpar } = montarAbertura(cortina.current, { reduzido, aoSair: sair })

        // O relógio do GSAP não segura o tempo (lagSmoothing(0), do scroll suave). Se a página
        // carrega sem desenhar quadros (aba em segundo plano, janela escondida), a abertura
        // corria sem ninguém ver e, no primeiro quadro, já estava no fim. Por isso ela fica
        // parada e só anda a partir do primeiro quadro desenhado com a página visível. O
        // ouvinte roda depois do GSAP atualizar o tempo do quadro, então o pulo não entra.
        // Se a aba é escondida no meio, pausa e continua de onde parou.
        tl.pause()
        const andar = () => {
          if (document.hidden) return
          gsap.ticker.remove(andar)
          tl.resume()
        }
        const aoMudarVisibilidade = () => {
          if (document.hidden) tl.pause()
          else gsap.ticker.add(andar)
        }
        gsap.ticker.add(andar)
        document.addEventListener('visibilitychange', aoMudarVisibilidade)

        pular.current = () => {
          pulou = true
          tl.progress(1)
        }
        if (mudouDeModo) pular.current()

        return () => {
          pular.current = null
          gsap.ticker.remove(andar)
          document.removeEventListener('visibilitychange', aoMudarVisibilidade)
          limpar()
        }
      })
    },
    { scope: cortina },
  )

  return createPortal(
    <div ref={cortina} className={css.cortina} onClick={() => pular.current?.()}>
      <LogoAnimado className={css.logo} />
    </div>,
    document.body,
  )
}
