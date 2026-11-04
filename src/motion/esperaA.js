// Espera da API com o A (docs/plano/02-efeitos.md, "Os outros efeitos"): o A pequeno se
// desenha e se apaga em loop, 1,2 s por volta. Os dois fios da máscara (P1 e P2) são um traço
// só, dividido na proporção dos comprimentos, como na abertura e no A da chamada: a cabeça
// vai de 0 a 1 em 0,6 s (o A se desenha) e o rabo vai atrás em 0,6 s (o A se apaga).
// A ponta da seta aparece enquanto a cabeça está no fim.
// Rode dentro do gsap.matchMedia() do CarregandoA, fora do modo reduzido (lá o A fica parado).
import gsap from 'gsap'

import { LOGO_ABERTURA as G } from '../components/logoAnimadoCaminhos.js'

const VOLTA = 1.2
const TOTAL = G.l1 + G.l2

// Mostra só o pedaço [rabo, cabeça] (0 a 1 do traço inteiro) de um fio que vai de `inicio`
// a `inicio + comprimento` no traço.
function mostrarPedaco(fio, inicio, comprimento, rabo, cabeca) {
  const de = Math.min(Math.max(rabo * TOTAL - inicio, 0), comprimento)
  const ate = Math.min(Math.max(cabeca * TOTAL - inicio, 0), comprimento)
  fio.style.strokeDasharray = `0 ${de} ${ate - de} ${comprimento}`
  fio.style.strokeDashoffset = '0'
}

export function montarEsperaA(svg) {
  const q = gsap.utils.selector(svg)
  const [fio1] = q('[data-a-fio="1"]')
  const [fio2] = q('[data-a-fio="2"]')
  const traco = { rabo: 0, cabeca: 0 }
  const pintar = () => {
    mostrarPedaco(fio1, 0, G.l1, traco.rabo, traco.cabeca)
    mostrarPedaco(fio2, G.l1, G.l2, traco.rabo, traco.cabeca)
  }
  pintar()

  // O A com máscara (desenhando) no lugar do A inteiro, só enquanto a espera anima.
  // Um set ou um tween só por peça: desfeitos, eles devolvem o A parado.
  gsap.set(q('[data-a="inteiro"]'), { opacity: 0 })
  gsap.set(q('[data-a="desenho"]'), { opacity: 1 })

  const metade = VOLTA / 2
  gsap
    .timeline({ repeat: -1, onUpdate: pintar })
    .fromTo(traco, { cabeca: 0 }, { cabeca: 1, duration: metade, ease: 'power2.inOut' }, 0)
    .fromTo(traco, { rabo: 0 }, { rabo: 1, duration: metade, ease: 'power2.inOut' }, metade)
    .to(
      q('[data-a="seta"]'),
      {
        keyframes: { '0%': { opacity: 0 }, '44%': { opacity: 0 }, '50%': { opacity: 1 }, '88%': { opacity: 1 }, '96%': { opacity: 0 } },
        duration: VOLTA,
        ease: 'none',
      },
      0,
    )

  return () => {
    for (const fio of [fio1, fio2]) {
      fio.style.removeProperty('stroke-dasharray')
      fio.style.removeProperty('stroke-dashoffset')
    }
  }
}
