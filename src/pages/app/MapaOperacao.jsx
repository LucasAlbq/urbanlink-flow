import { useEffect, useMemo, useRef, useState } from 'react'
import { AttributionControl, Layer, Map, Marker, NavigationControl, Source } from 'react-map-gl/maplibre'
import * as maplibre from 'maplibre-gl'
import enderecoDoWorker from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url'
import 'maplibre-gl/dist/maplibre-gl.css'

import { estiloDoMapa, lerCores } from '../../components/cidade/mapaRealEstilo.js'
import { limites } from '../../components/cidade/rotaGeo.js'
import { tomDaEntrega } from './uteis.js'
import css from './MapaOperacao.module.css'

maplibre.setWorkerUrl(enderecoDoWorker)

// Se o mapa não abrir nesse tempo (tiles fora do ar, sem WebGL), a tela avisa e segue com as
// listas. Mesmo tempo do mapa do rastreio.
const ESPERA_MS = 10_000

const TEXTOS = {
  'AttributionControl.ToggleAttribution': 'Mostrar ou esconder os créditos do mapa',
  'NavigationControl.ZoomIn': 'Aproximar',
  'NavigationControl.ZoomOut': 'Afastar',
  'NavigationControl.ResetBearing': 'Voltar o norte pra cima',
  'CooperativeGesturesHandler.WindowsHelpText': 'Use Ctrl + rolagem pra dar zoom no mapa',
  'CooperativeGesturesHandler.MacHelpText': 'Use ⌘ + rolagem pra dar zoom no mapa',
  'CooperativeGesturesHandler.MobileHelpText': 'Use dois dedos pra mover o mapa',
}

const ponto = (lng, lat, propriedades) => ({
  type: 'Feature',
  properties: propriedades,
  geometry: { type: 'Point', coordinates: [lng, lat] },
})

function lerStatus() {
  const tokens = getComputedStyle(document.documentElement)
  const ler = (nome) => tokens.getPropertyValue(nome).trim()
  return {
    ok: ler('--status-ok'),
    atraso: ler('--status-atraso'),
    critico: ler('--status-critico'),
    andamento: ler('--azul'),
    neutro: ler('--cinza'),
    branco: ler('--branco'),
  }
}

// Mapa da operação do Monitoramento (GET /dashboard/map): centros (quadrado Noite), veículos com
// posição (círculo Noite com aro Ouro), entregas (ponto na cor do status) e rotas (linha Ouro
// em andamento, Azul pontilhada planejada). Mesmo estilo de mapa do rastreio.
export default function MapaOperacao({ dados, rotulo, aoFalhar }) {
  const abriu = useRef(false)
  const [pronto, setPronto] = useState(false)
  const cores = useMemo(() => lerCores(), [])
  const status = useMemo(() => lerStatus(), [])
  const estilo = useMemo(() => estiloDoMapa(cores), [cores])

  const { rotas, entregas, veiculos, vista } = useMemo(() => {
    const comPosicao = (item) => item.latitude != null && item.longitude != null
    const rotasGeo = {
      type: 'FeatureCollection',
      features: dados.routes
        .filter((rota) => rota.path?.length > 1)
        .map((rota) => ({
          type: 'Feature',
          properties: { status: rota.status },
          geometry: { type: 'LineString', coordinates: rota.path.map((p) => [p.longitude, p.latitude]) },
        })),
    }
    const entregasGeo = {
      type: 'FeatureCollection',
      features: dados.deliveries.filter(comPosicao).map((e) => ponto(e.longitude, e.latitude, { tom: tomDaEntrega(e) })),
    }
    const veiculosGeo = {
      type: 'FeatureCollection',
      features: dados.vehicles.filter(comPosicao).map((v) => ponto(v.longitude, v.latitude, { status: v.status })),
    }
    const todos = [
      ...dados.centers.map((c) => [c.longitude, c.latitude]),
      ...entregasGeo.features.map((f) => f.geometry.coordinates),
      ...veiculosGeo.features.map((f) => f.geometry.coordinates),
    ]
    const folga = window.matchMedia('(max-width: 760px)').matches ? 24 : 48
    return {
      rotas: rotasGeo,
      entregas: entregasGeo,
      veiculos: veiculosGeo,
      vista: todos.length
        ? { bounds: limites(todos), fitBoundsOptions: { padding: { top: folga, bottom: folga + 20, left: folga, right: folga + 40 } } }
        : { longitude: -46.63, latitude: -23.55, zoom: 11 },
    }
  }, [dados])

  // O tempo limite só corre com a aba visível: numa aba escondida o navegador não desenha, o
  // MapLibre não termina de abrir e o mapa desistiria antes de alguém olhar pra ele.
  useEffect(() => {
    if (pronto) return
    let espera
    const armar = () => {
      clearTimeout(espera)
      if (document.visibilityState === 'visible') espera = setTimeout(aoFalhar, ESPERA_MS)
    }
    armar()
    document.addEventListener('visibilitychange', armar)
    return () => {
      clearTimeout(espera)
      document.removeEventListener('visibilitychange', armar)
    }
  }, [pronto, aoFalhar])

  function aoAbrir({ target }) {
    target.touchZoomRotate.disableRotation()
    target.keyboard.disableRotation()
    abriu.current = true
    setPronto(true)
  }

  const corDoTom = ['match', ['get', 'tom'], 'ok', status.ok, 'atraso', status.atraso, 'critico', status.critico, 'andamento', status.andamento, status.neutro]

  return (
    <div className={`${css.caixa} ${pronto ? '' : css.carregando}`} data-lenis-prevent="">
      <Map
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
        minZoom={9}
        maxZoom={17}
        attributionControl={false}
        onLoad={aoAbrir}
        onError={() => {
          if (!abriu.current) aoFalhar()
        }}
      >
        <Source id="rotas" type="geojson" data={rotas}>
          <Layer
            id="rotas-planejadas"
            type="line"
            filter={['!=', ['get', 'status'], 'ACTIVE']}
            layout={{ 'line-cap': 'round', 'line-join': 'round' }}
            paint={{ 'line-color': status.andamento, 'line-width': 3, 'line-dasharray': [1, 2] }}
          />
          <Layer
            id="rotas-ativas"
            type="line"
            filter={['==', ['get', 'status'], 'ACTIVE']}
            layout={{ 'line-cap': 'round', 'line-join': 'round' }}
            paint={{ 'line-color': cores.ouro, 'line-width': 5 }}
          />
        </Source>
        <Source id="entregas" type="geojson" data={entregas}>
          <Layer
            id="entregas"
            type="circle"
            paint={{
              'circle-radius': 6,
              'circle-color': corDoTom,
              'circle-stroke-width': 2,
              'circle-stroke-color': status.branco,
            }}
          />
        </Source>
        <Source id="veiculos" type="geojson" data={veiculos}>
          <Layer
            id="veiculos"
            type="circle"
            paint={{
              'circle-radius': 8,
              'circle-color': cores.noite,
              'circle-stroke-width': 3,
              'circle-stroke-color': cores.ouro,
            }}
          />
        </Source>
        {dados.centers.map((centro) => (
          <Marker key={centro.id} longitude={centro.longitude} latitude={centro.latitude} anchor="center">
            <span className={css.centro} title={centro.name} />
          </Marker>
        ))}
        <NavigationControl position="top-right" showCompass={false} />
        <AttributionControl position="bottom-right" compact />
      </Map>
    </div>
  )
}
