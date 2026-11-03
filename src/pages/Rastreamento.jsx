import { useParams } from 'react-router'

import { Pagina } from '../components/Pagina.jsx'

export function Rastreamento() {
  const { codigo } = useParams()
  const tituloAba = codigo
    ? `Entrega ${codigo} · UrbanLink Flow`
    : 'Rastrear entrega · UrbanLink Flow'

  return <Pagina tituloAba={tituloAba} titulo="Rastrear uma entrega." />
}
