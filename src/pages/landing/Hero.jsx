import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

import { Botao } from '../../components/Botao.jsx'
import { Skyline } from '../../components/cidade/Skyline.jsx'
import { montarParallax } from '../../motion/heroParallax.js'
import { MODOS } from '../../motion/setup.js'
import secao from './Secao.module.css'
import css from './Hero.module.css'

// data-entrada: título, texto e botões, que sobem quando a abertura passa pro hero
// (motion/abertura.js). Sem abertura, o hero já aparece pronto.
// ref (opcional): a seção, pra abertura achar o texto e o pacote.
export function Hero({ ref }) {
  const propria = useRef(null)
  const hero = ref ?? propria

  // Parallax da cidade (motion/heroParallax.js). Movimento reduzido: a cidade fica parada.
  useGSAP(
    () => {
      gsap.matchMedia().add(MODOS, ({ conditions }) => {
        if (conditions.reduzido) return
        montarParallax(hero.current, { desktop: conditions.desktop })
      })
    },
    { scope: hero },
  )

  return (
    <section ref={hero} id="inicio" className={`${secao.escuro} ${css.hero}`}>
      <div className={css.texto}>
        <h1 tabIndex={-1} className={css.titulo} data-entrada="">
          A logística da cidade,
          <br />
          em tempo real.
        </h1>
        <p className={css.lead} data-entrada="">
          Monitore entregas, simule rotas e cenários e treine sua equipe em um só lugar. Para
          transportadoras, e-commerce e prefeituras.
        </p>
        <div className={secao.acoes} data-entrada="">
          <Botao href="/login">Entrar na plataforma</Botao>
          <Botao href="/#como-funciona" variante="link">
            Ver como funciona
          </Botao>
        </div>
      </div>
      <Skyline />
    </section>
  )
}
