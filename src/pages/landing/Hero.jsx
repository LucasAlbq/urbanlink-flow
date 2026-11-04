import { Botao } from '../../components/Botao.jsx'
import { Skyline } from '../../components/cidade/Skyline.jsx'
import secao from './Secao.module.css'
import css from './Hero.module.css'

// data-entrada: título, texto e botões, que sobem quando a abertura passa pro hero
// (motion/abertura.js). Sem abertura, o hero já aparece pronto.
export function Hero({ ref }) {
  return (
    <section ref={ref} id="inicio" className={`${secao.escuro} ${css.hero}`}>
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
