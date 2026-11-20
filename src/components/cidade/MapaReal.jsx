import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AttributionControl, Layer, Map, Marker, Source, useControl, useMap } from 'react-map-gl/maplibre'
import * as maplibre from 'maplibre-gl'
import enderecoDoWorker from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url'
import 'maplibre-gl/dist/maplibre-gl.css'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

import { MODOS } from '../../motion/setup.js'
import { desenharRotaReal } from '../../motion/mapaReal.js'
import { estiloDoMapa, lerCores, tracoAte } from './mapaRealEstilo.js'
import { direcaoFinal, dividirRota, limites, linha } from './rotaGeo.js'
import css from './MapaReal.module.css'

// O MapLibre 6 acha o worker pelo endereço do próprio arquivo, que muda quando o Vite empacota.
// Com ?url o Vite copia o worker pro build e devolve o endereço certo (em dev também).
// O mesmo módulo vai no mapLib do Map, pra o endereço valer no MapLibre que desenha.
maplibre.setWorkerUrl(enderecoDoWorker)

const SETA = 'M 0 0 H 30 L 64 30 L 30 60 H 0 L 26 30 Z'
const NADA = { type: 'FeatureCollection', features: [] }

// Se o mapa não abrir nesse tempo (tiles fora do ar), entra o MapaIlustrado.
// É o mesmo tempo limite dos pedidos à API (04-api-e-dados.md).
const ESPERA_MS = 10_000

const TEXTOS = {
  'AttributionControl.ToggleAttribution': 'Mostrar ou esconder os créditos do mapa',
  'CooperativeGesturesHandler.WindowsHelpText': 'Use Ctrl + rolagem pra dar zoom no mapa',
  'CooperativeGesturesHandler.MacHelpText': 'Use ⌘ + rolagem pra dar zoom no mapa',
  'CooperativeGesturesHandler.MobileHelpText': 'Use dois dedos pra mover o mapa',
}

// Mapa de verdade do rastreamento (03-telas-e-estados.md), carregado sob demanda pelo
// MapaDaEntrega. Mesmo desenho do MapaIlustrado: trecho feito em Ouro, o que falta pontilhado
// Noite, o pacote no ponto, o círculo no começo e a seta no fim. Arrasta com o mouse ou um dedo
// e dá zoom pelos botões; a rodinha só dá zoom com Ctrl (no celular, dois dedos), pra não
// prender a rolagem da página. Estados: carregando (escondido), pronto, falhou (aoFalhar).
export default function MapaReal({ rota, posicao, progresso, rotulo, aoFalhar }) {
  const raiz = useRef(null)
  const mapa = useRef(null)
  const abriu = useRef(false)
  const [pronto, setPronto] = useState(false)
  // Com efeito, a linha Ouro começa apagada e o efeito desenha; sem efeito, já vem inteira.
  const [comEfeito] = useState(() => !window.matchMedia(MODOS.reduzido).matches)

  const cores = useMemo(() => lerCores(), [])
  const estilo = useMemo(() => estiloDoMapa(cores), [cores])
  const coords = rota.coordinates
  const { feito, resto, ponto } = useMemo(
    () => (progresso >= 1 ? { feito: coords, resto: [], ponto: null } : dividirRota(coords, posicao)),
    [coords, posicao, progresso],
  )
  const dadosResto = useMemo(() => (resto.length > 1 ? linha(resto) : NADA), [resto])
  const dadosFeito = useMemo(() => linha(feito), [feito])
  const pinturaFeito = useMemo(
    () => ({ 'line-gradient': tracoAte(cores.ouro, comEfeito ? 0 : 1), 'line-width': 7 }),
    [cores, comEfeito],
  )
  // Abre enquadrando a rota toda, com folga pras peças, à direita pro zoom e embaixo pros créditos.
  // No celular a caixa é baixa (proporção 960/560): folga menor pra rota não ficar minúscula.
  const vista = useMemo(() => {
    const folga = window.matchMedia('(max-width: 760px)').matches ? 20 : 48
    const padding = { top: folga, bottom: folga + 20, left: folga, right: folga + 56 }
    return { bounds: limites(coords), fitBoundsOptions: { padding } }
  }, [coords])
  const inicio = coords[0]
  const fim = coords[coords.length - 1]

  useEffect(() => {
    if (pronto) return
    const espera = setTimeout(aoFalhar, ESPERA_MS)
    return () => clearTimeout(espera)
  }, [pronto, aoFalhar])

  useGSAP(
    () => {
      const mapaGl = pronto && mapa.current?.getMap()
      if (!mapaGl) return
      gsap.matchMedia().add(MODOS, ({ conditions }) => {
        if (conditions.reduzido) {
          mapaGl.setPaintProperty('rota-feita', 'line-gradient', tracoAte(cores.ouro, 1))
          return
        }
        return desenharRotaReal(mapaGl, 'rota-feita', cores.ouro)
      })
    },
    { dependencies: [pronto, cores], scope: raiz },
  )

  function aoAbrir({ target }) {
    target.touchZoomRotate.disableRotation()
    target.keyboard.disableRotation()
    abriu.current = true
    setPronto(true)
  }

  // Erro antes de abrir (estilo ou tiles fora do ar, sem WebGL): vai pro MapaIlustrado.
  // Depois de aberto, um tile que falhou não derruba o mapa.
  function aoErrar() {
    if (!abriu.current) aoFalhar()
  }

  return (
    <div ref={raiz} className={`${css.caixa} ${pronto ? '' : css.carregando}`} data-lenis-prevent="">
      <Map
        ref={mapa}
        mapLib={maplibre}
        initialViewState={vista}
        mapStyle={estilo}
        style={{ position: 'absolute', inset: 0 }}
        locale={{ ...TEXTOS, 'Map.Title': rotulo }}
        cooperativeGestures
        dragRotate={false}
        pitchWithRotate={false}
        touchPitch={false}
        maxPitch={0}
        minZoom={10}
        maxZoom={18}
        attributionControl={false}
        onLoad={aoAbrir}
        onError={aoErrar}
      >
        <Source id="resto" type="geojson" data={dadosResto}>
          <Layer
            id="rota-falta"
            type="line"
            layout={{ 'line-cap': 'round', 'line-join': 'round' }}
            paint={{ 'line-color': cores.noite, 'line-width': 4, 'line-dasharray': [0, 2.5] }}
          />
        </Source>
        {/* lineMetrics: a linha sabe onde fica cada pedaço dela (0 a 1), e o efeito só muda a cor. */}
        <Source id="feito" type="geojson" data={dadosFeito} lineMetrics>
          <Layer id="rota-feita" type="line" layout={{ 'line-cap': 'round', 'line-join': 'round' }} paint={pinturaFeito} />
        </Source>

        <Marker longitude={inicio[0]} latitude={inicio[1]} anchor="center">
          <span className={css.inicio} />
        </Marker>
        <Marker longitude={fim[0]} latitude={fim[1]} anchor="center" rotation={direcaoFinal(coords)}>
          <svg className={css.fim} viewBox="-64 0 128 60" aria-hidden="true" focusable="false">
            <path d={SETA} />
          </svg>
        </Marker>
        {/* Entregue: a rota inteira em Ouro basta, o pacote sairia por cima da seta. */}
        {ponto && (
          <Marker longitude={ponto[0]} latitude={ponto[1]} anchor="center">
            <span className={css.pacote} />
          </Marker>
        )}

        <Zoom />
        <AttributionControl compact={false} position="bottom-right" />
      </Map>
    </div>
  )
}

// Botões + e − no canto de cima do mapa. Ficam no canto de controles do MapLibre, que vem antes
// dos créditos: o Tab passa pelo mapa, pelo zoom e só depois pelos créditos.
function Zoom() {
  const [canto] = useState(() => document.createElement('div'))
  useControl(() => ({ onAdd: () => canto, onRemove: () => canto.remove() }), { position: 'top-right' })
  const { current: mapa } = useMap()

  return createPortal(
    <div className={css.zoom}>
      <button type="button" className={css.zoomBotao} aria-label="Aproximar o mapa" onClick={() => mapa?.zoomIn()}>
        +
      </button>
      <button type="button" className={css.zoomBotao} aria-label="Afastar o mapa" onClick={() => mapa?.zoomOut()}>
        −
      </button>
    </div>,
    canto,
  )
}
