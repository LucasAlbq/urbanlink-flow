// O A da chamada final se desenha uma vez (docs/plano/02-efeitos.md, "Os outros efeitos"):
// quando o topo da seção chega a 60% da tela, os fios P1 e P2 da máscara vão de 0 a 100%
// com DrawSVG, em 1,2 s power2.inOut (P1 0,94 s + P2 0,26 s, a proporção dos comprimentos,
// como na abertura). O pé do A e a ponta da seta ficam parados: a rota se pinta entre eles.
// Rode dentro do gsap.matchMedia() da Chamada, fora do modo reduzido (lá o A já está pronto).
import gsap from 'gsap'

import { LOGO_ABERTURA as G } from '../components/logoAnimadoCaminhos.js'

const DURACAO = 1.2
const P1 = (DURACAO * G.l1) / (G.l1 + G.l2) // 0,94 s
const P2 = DURACAO - P1 // 0,26 s

export function montarChamadaA(secao) {
  const q = gsap.utils.selector(secao)

  // Os dois fios andam em linha reta, um depois do outro; o ease vai na timeline inteira,
  // então o pincel acelera no P1 e freia no fim do P2, como um traço só.
  const traco = gsap
    .timeline({ paused: true, defaults: { ease: 'none' } })
    .fromTo(q('[data-ul-ch="fio1"]'), { drawSVG: '0%' }, { drawSVG: '100%', duration: P1 })
    .fromTo(q('[data-ul-ch="fio2"]'), { drawSVG: '0%' }, { drawSVG: '100%', duration: P2 })

  gsap.to(traco, {
    progress: 1,
    duration: DURACAO,
    ease: 'power2.inOut',
    scrollTrigger: { trigger: secao, start: 'top 60%', once: true },
  })
}
