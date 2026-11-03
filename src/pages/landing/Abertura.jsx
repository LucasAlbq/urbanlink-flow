import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'
import { useLenis } from 'lenis/react'

import { Botao } from '../../components/Botao.jsx'
import { LogoAnimado } from '../../components/LogoAnimado.jsx'
import { aberturaComecou, montarAbertura, sairCortina } from '../../motion/abertura.js'
import { pararRolagem } from '../../motion/pararRolagem.js'
import { MODOS } from '../../motion/setup.js'
import css from './Abertura.module.css'

// Teclas que só levam o foco até o "Pular abertura" (ou são atalhos do navegador): não pulam.
const SO_FOCO = new Set(['Tab', 'Shift', 'Control', 'Alt', 'Meta', 'AltGraph', 'CapsLock'])

function teclaPula(evento) {
  return !SO_FOCO.has(evento.key) && !evento.ctrlKey && !evento.metaKey && !evento.altKey
}

// Cortina da abertura (02-efeitos.md): Noite em tela cheia com o logo se desenhando, por cima
// do hero já montado. Vai num portal fora do #root, que fica inert enquanto ela está na tela,
// então o "Pular abertura" é o primeiro (e único) item focável. Clique, toque ou tecla pulam.
// No fim: sai o inert, o Lenis volta a rolar e, se o foco estava no botão, vai pro título.
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
      if (teclaPula(evento)) pular.current?.()
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

        const terminar = () => {
          const comFoco = cortina.current?.contains(document.activeElement)
          document.getElementById('root').inert = false
          if (comFoco) document.querySelector('#conteudo h1')?.focus({ preventScroll: true })
          aoTerminar()
        }
        const sair = contextSafe(() => {
          if (saindo) return
          saindo = true
          aoSair?.({ pulou, reduzido })
          sairCortina(cortina.current, { reduzido, pulou, aoTerminar: terminar })
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
      <Botao variante="contorno" tamanho="normal" className={css.pular}>
        Pular abertura
      </Botao>
    </div>,
    document.body,
  )
}
