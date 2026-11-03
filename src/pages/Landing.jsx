import { useState } from 'react'

import { useTituloAba } from '../components/useTituloAba.js'
import { aberturaPendente } from '../motion/abertura.js'
import { Abertura } from './landing/Abertura.jsx'
import { Hero } from './landing/Hero.jsx'
import { Jornada } from './landing/Jornada.jsx'
import { Plataforma } from './landing/Plataforma.jsx'
import { Rastrear } from './landing/Rastrear.jsx'
import { Sobre } from './landing/Sobre.jsx'
import { Chamada } from './landing/Chamada.jsx'

export function Landing() {
  useTituloAba('UrbanLink Flow: a logística da cidade, em tempo real')
  // A abertura toca por cima do hero já montado, uma vez por sessão (motion/abertura.js).
  const [abertura, setAbertura] = useState(aberturaPendente)

  return (
    <>
      {abertura && <Abertura aoTerminar={() => setAbertura(false)} />}
      <Hero />
      <Jornada />
      <Plataforma />
      <Rastrear />
      <Sobre />
      <Chamada />
    </>
  )
}
