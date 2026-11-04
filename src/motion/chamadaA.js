// O A da chamada final se desenha uma vez (docs/plano/02-efeitos.md, "Os outros efeitos"):
// os fios P1 e P2 da máscara vão de 0 a 100% com DrawSVG, em 1,2 s power2.inOut (P1 0,94 s +
// P2 0,26 s, a proporção dos comprimentos, como na abertura). Depois a ponta da seta encaixa
// como no logo da abertura: x −18 → 0 em 0,45 s back.out(1.7), aparecendo em 0,15 s.
// O pé do A fica parado: a rota sai dele.
// Gatilho: o topo do próprio A a 70% da tela (o A fica no pé da seção; com o topo da seção,
// ele se desenhava antes de aparecer). Uma vez só.
// Rode dentro do gsap.matchMedia() da Chamada, fora do modo reduzido (lá o A já está pronto).
import gsap from 'gsap'

import { LOGO_ABERTURA as G } from '../components/logoAnimadoCaminhos.js'

const DURACAO = 1.2
const P1 = (DURACAO * G.l1) / (G.l1 + G.l2) // 0,94 s
const P2 = DURACAO - P1 // 0,26 s

export function montarChamadaA(secao) {
  const q = gsap.utils.selector(secao)
  const [a] = q('[data-chamada-a]')
  const seta = q('[data-ul-ch="seta"]')

  // Os dois fios andam em linha reta, um depois do outro; o ease vai na timeline inteira,
  // então o pincel acelera no P1 e freia no fim do P2, como um traço só.
  const traco = gsap
    .timeline({ paused: true, defaults: { ease: 'none' } })
    .fromTo(q('[data-ul-ch="fio1"]'), { drawSVG: '0%' }, { drawSVG: '100%', duration: P1 })
    .fromTo(q('[data-ul-ch="fio2"]'), { drawSVG: '0%' }, { drawSVG: '100%', duration: P2 })

  const tl = gsap.timeline({
    paused: true,
    scrollTrigger: { trigger: a, start: 'top 70%', once: true },
  })
  // Durante o desenho vale o A com máscaras; no fim ele troca pelo caminho inteiro, sem a
  // lasca que as máscaras deixam na ponta do furo (0,01 s: um tween de duração zero no
  // começo de uma timeline parada não se aplica na hora).
  const troca = { duration: 0.01, ease: 'none', immediateRender: true }
  tl.fromTo(q('[data-ul-ch="desenho"]'), { opacity: 1 }, { opacity: 0, ...troca }, DURACAO)
    .fromTo(q('[data-ul-ch="inteiro"]'), { opacity: 0 }, { opacity: 1, ...troca }, DURACAO)
    .to(traco, { progress: 1, duration: DURACAO, ease: 'power2.inOut' }, 0)
    .fromTo(seta, { x: -18 }, { x: 0, duration: 0.45, ease: 'back.out(1.7)', immediateRender: true }, DURACAO)
    .fromTo(seta, { opacity: 0 }, { opacity: 1, duration: 0.15, ease: 'none', immediateRender: true }, DURACAO)
}
