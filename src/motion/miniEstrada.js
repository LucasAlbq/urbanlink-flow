// Mensagem enviada (docs/plano/02-efeitos.md, "Os outros efeitos"): ao abrir a tela, o pacote
// corre a mini estrada do começo até a seta (0,6 s power2.inOut) e a seta encaixa
// (0,3 s back.out(1.7)). O HTML já é o estado final (o pacote parado na seta); o efeito faz o
// pacote sair do começo. O plano não diz de onde a seta encaixa: −18, como no logo da abertura.
// Rode dentro do gsap.matchMedia() da MiniEstrada, fora do modo reduzido (lá fica o estado final).
import gsap from 'gsap'

export function montarCorrida(svg, { de, ate }) {
  const q = gsap.utils.selector(svg)
  gsap
    .timeline()
    .fromTo(q('[data-pacote]'), { x: de - ate }, { x: 0, duration: 0.6, ease: 'power2.inOut' }, 0)
    .fromTo(
      q('[data-seta]'),
      { x: -18 },
      { x: 0, duration: 0.3, ease: 'back.out(1.7)', immediateRender: true },
      0.6,
    )
}
