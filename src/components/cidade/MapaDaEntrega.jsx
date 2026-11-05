import { Component, lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'

import { MapaIlustrado } from './MapaIlustrado.jsx'
import css from './MapaDaEntrega.module.css'

// O MapLibre só carrega aqui, na tela de rastreamento (01-plano.md, "Orçamento"), e só quando a
// caixa do mapa chega perto da tela: abrir o mapa pesa no processador e não pode travar a página
// enquanto ela abre.
const MapaReal = lazy(() => import('./MapaReal.jsx'))
const PERTO_DA_TELA = '300px'

// Se o MapaReal quebrar ao carregar ou ao desenhar, fica o MapaIlustrado.
class SeQuebrar extends Component {
  state = { quebrou: false }

  static getDerivedStateFromError() {
    return { quebrou: true }
  }

  render() {
    return this.state.quebrou ? this.props.reserva : this.props.children
  }
}

// Mapa da entrega (03-telas-e-estados.md, "Rastreamento"): o MapaReal quando a API manda a
// `rota` e a `posicaoAtual` (ou a entrega já chegou); sem elas, o MapaIlustrado. Se o MapaReal
// falhar, entra o MapaIlustrado sem mensagem de erro.
export function MapaDaEntrega({ rota, posicao, progresso, rotulo }) {
  const [falhou, setFalhou] = useState(false)
  const aoFalhar = useCallback(() => setFalhou(true), [])
  const caixa = useRef(null)
  const [perto, setPerto] = useState(false)

  useEffect(() => {
    if (perto || !caixa.current) return
    const olho = new IntersectionObserver(([e]) => e.isIntersecting && setPerto(true), { rootMargin: PERTO_DA_TELA })
    olho.observe(caixa.current)
    return () => olho.disconnect()
  }, [perto])

  const ilustrado = (
    <div className={css.caixa} role="img" aria-label={rotulo}>
      <MapaIlustrado progresso={progresso} />
    </div>
  )
  const temRota = rota?.type === 'LineString' && rota.coordinates?.length > 1
  if (falhou || !temRota || !(posicao || progresso >= 1)) return ilustrado

  if (!perto) return <div ref={caixa} className={css.caixa} />
  return (
    <SeQuebrar reserva={ilustrado}>
      <Suspense fallback={<div className={css.caixa} />}>
        <MapaReal rota={rota} posicao={posicao} progresso={progresso} rotulo={rotulo} aoFalhar={aoFalhar} />
      </Suspense>
    </SeQuebrar>
  )
}
