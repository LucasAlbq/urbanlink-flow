// O mapa real desenha o trecho percorrido (docs/plano/02-efeitos.md, "Status do rastreamento"):
// 0,8 s power2.inOut, como o [data-mapa-feito] do MapaIlustrado. A linha Ouro é dado do mapa
// (camada do MapLibre), não CSS: a cada quadro ela ganha mais um pedaço.
// Rode dentro do gsap.matchMedia() do MapaReal, fora do modo reduzido. A limpeza devolve a
// linha inteira, que é o estado final.
import gsap from 'gsap'

import { cortarLinha, linha } from '../components/cidade/rotaGeo.js'

export function desenharRotaReal(fonte, feito) {
  const traco = { t: 0 }
  const desenhar = () => fonte.setData(linha(cortarLinha(feito, traco.t)))
  desenhar()
  const tween = gsap.to(traco, { t: 1, duration: 0.8, ease: 'power2.inOut', onUpdate: desenhar })
  return () => {
    tween.kill()
    fonte.setData(linha(feito))
  }
}
