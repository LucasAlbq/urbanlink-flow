import { useRef, useState } from 'react'

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
  // A abertura toca por cima do hero já montado, uma vez por sessão (motion/abertura.js),
  // e termina passando o pacote e o texto pro hero. Ela vem depois do Hero no JSX (a cortina
  // vai num portal) pra ref do hero já estar ligada quando a timeline monta.
  const [abertura, setAbertura] = useState(aberturaPendente)
  const hero = useRef(null)

  return (
    <>
      <Hero ref={hero} />
      {abertura && <Abertura hero={hero} aoTerminar={() => setAbertura(false)} />}
      <Jornada />
      <Plataforma />
      <Rastrear />
      <Sobre />
      <Chamada />
    </>
  )
}
