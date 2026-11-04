// Faixas da estrada (docs/plano/01-plano.md, "Plano de efeitos"): as faixas amarelas deslizam
// devagar, na direção da seta, enquanto a estrada está na tela (background-position, uma das
// exceções a "só transform e opacity"). O plano não diz a velocidade: um ciclo da faixa
// (traço + vão, --faixa-ciclo) a cada 3 s. Fora da tela, a animação para.
// Rode dentro do gsap.matchMedia() do Estrada, fora do modo reduzido (lá as faixas ficam paradas).
import gsap from 'gsap'

const VOLTA = 3 // segundos por ciclo da faixa

export function montarFaixas(estrada, { vertical }) {
  const faixas = [...estrada.querySelectorAll('[data-faixa]')]
  if (!faixas.length) return undefined

  const ciclo = parseFloat(getComputedStyle(faixas[0]).getPropertyValue('--faixa-ciclo')) || 50
  const eixo = vertical ? 'backgroundPositionY' : 'backgroundPositionX'
  const andar = gsap.fromTo(
    faixas,
    { [eixo]: '0px' },
    { [eixo]: `${ciclo}px`, duration: VOLTA, ease: 'none', repeat: -1, paused: true },
  )

  // Funciona também no menu do celular, que é fixo na tela (um ScrollTrigger não serviria).
  const olho = new IntersectionObserver(([visto]) => (visto.isIntersecting ? andar.play() : andar.pause()))
  olho.observe(estrada)
  return () => olho.disconnect()
}
