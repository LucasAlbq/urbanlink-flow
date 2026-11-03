// Configuração única dos efeitos (docs/plano/02-efeitos.md, "Configuração global").
// Todo efeito importa os MODOS daqui, e esse import já registra os plugins.
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'
import { CustomEase } from 'gsap/CustomEase'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin, DrawSVGPlugin, CustomEase, useGSAP)

// O mesmo --ease do CSS (tokens.css): cubic-bezier(0.22, 1, 0.36, 1).
CustomEase.create('ul', '0.22,1,0.36,1')

// No celular, a barra de endereço aparecendo não recalcula as travas.
ScrollTrigger.config({ ignoreMobileResize: true })

// Os três modos de todo efeito, pra usar com gsap.matchMedia().
// 760 px é a quebra em que a estrada fica vertical (01-plano.md).
export const MODOS = {
  desktop: '(min-width: 761px) and (prefers-reduced-motion: no-preference)',
  celular: '(max-width: 760px) and (prefers-reduced-motion: no-preference)',
  reduzido: '(prefers-reduced-motion: reduce)',
}
