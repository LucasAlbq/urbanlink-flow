// Logo do topo (docs/plano/02-efeitos.md, "Os outros efeitos"): no hover, só com mouse, a
// seta do A dá o encaixe de novo, x −6 → 0 em 0,35 s back.out(2).
// Rode dentro do gsap.matchMedia() do Header, só com (hover: hover) e fora do modo reduzido.
// encaixe: a função que cria o tween, passada pelo contextSafe do matchMedia (o tween nasce
// no evento, depois do useGSAP, e precisa ser desfeito junto com o resto).
import gsap from 'gsap'

const LARGURA_DO_LOGO = 739 // unidades do viewBox do logo horizontal

export function montarLogoTopo(link, contextSafe) {
  const [seta] = link.querySelectorAll('[data-logo-seta]')
  if (!seta) return undefined
  const svg = seta.ownerSVGElement

  const encaixar = contextSafe(() => {
    // −6 px na tela, convertidos pras unidades do SVG
    const pxPorUnidade = svg.getBoundingClientRect().width / LARGURA_DO_LOGO
    gsap.fromTo(
      seta,
      { x: -6 / pxPorUnidade },
      { x: 0, duration: 0.35, ease: 'back.out(2)', overwrite: true },
    )
  })

  link.addEventListener('mouseenter', encaixar)
  return () => link.removeEventListener('mouseenter', encaixar)
}
