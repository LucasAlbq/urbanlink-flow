import { useTituloAba } from '../components/useTituloAba.js'
import { Hero } from './landing/Hero.jsx'
import { Jornada } from './landing/Jornada.jsx'
import { Plataforma } from './landing/Plataforma.jsx'
import { Rastrear } from './landing/Rastrear.jsx'
import { Sobre } from './landing/Sobre.jsx'
import { Chamada } from './landing/Chamada.jsx'

export function Landing() {
  useTituloAba('UrbanLink Flow: a logística da cidade, em tempo real')

  return (
    <>
      <Hero />
      <Jornada />
      <Plataforma />
      <Rastrear />
      <Sobre />
      <Chamada />
    </>
  )
}
