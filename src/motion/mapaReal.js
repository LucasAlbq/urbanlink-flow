// O mapa real desenha o trecho percorrido (docs/plano/02-efeitos.md, "Status do rastreamento"):
// 0,8 s power2.inOut, como o [data-mapa-feito] do MapaIlustrado. A linha Ouro é camada do
// MapLibre, não CSS: ela já está inteira no mapa, e a cada quadro só muda até onde tem cor
// (line-gradient). Rode dentro do gsap.matchMedia() do MapaReal, fora do modo reduzido.
// A limpeza devolve a linha inteira, que é o estado final.
import gsap from 'gsap'

import { tracoAte } from '../components/cidade/mapaRealEstilo.js'

export function desenharRotaReal(mapa, camada, cor) {
  const traco = { t: 0 }
  const desenhar = () => mapa.setPaintProperty(camada, 'line-gradient', tracoAte(cor, traco.t))
  desenhar()
  const tween = gsap.to(traco, { t: 1, duration: 0.8, ease: 'power2.inOut', onUpdate: desenhar })
  return () => {
    tween.kill()
    traco.t = 1
    if (mapa.getLayer(camada)) desenhar()
  }
}
