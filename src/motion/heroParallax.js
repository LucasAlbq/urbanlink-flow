// Parallax da cidade do hero (docs/plano/02-efeitos.md, "Hero"): enquanto o hero sai da tela,
// as camadas da Skyline descem em velocidades diferentes. Só transform, preso à rolagem.
//
// | Camada                          | Desktop | Celular |
// | Prédios do fundo                | 240 px  | 60 px   |
// | Prédios do meio + rota + pacote | 120 px  | 30 px   |
// | Prédios da frente, texto        | 0       | 0       |
//
// Rode dentro do gsap.matchMedia() do Hero, fora do modo reduzido (lá a cidade fica parada).
import gsap from 'gsap'

const DESCIDA = {
  desktop: { fundo: 240, meio: 120 },
  celular: { fundo: 60, meio: 30 },
}

export function montarParallax(hero, { desktop }) {
  const q = gsap.utils.selector(hero)
  const descida = desktop ? DESCIDA.desktop : DESCIDA.celular
  const rolagem = () => ({ trigger: hero, start: 'top top', end: 'bottom top', scrub: true })

  gsap.to(q('[data-camada="fundo"]'), { y: descida.fundo, ease: 'none', scrollTrigger: rolagem() })
  gsap.to(q('[data-camada="meio"]'), { y: descida.meio, ease: 'none', scrollTrigger: rolagem() })
}
