import { Botao } from '../../components/Botao.jsx'
import secao from './Secao.module.css'
import css from './Sobre.module.css'

export function Sobre() {
  return (
    <section id="sobre" className={secao.nevoa}>
      <div className={`${secao.dentro} ${css.split}`}>
        <h2 className={secao.h2}>
          Quem faz a
          <br />
          UrbanLink Flow.
        </h2>
        <div className={css.texto}>
          <p>
            A UrbanLink Systems é uma empresa brasileira de tecnologia para logística urbana,
            fundada em 2017. Desenvolve soluções para otimizar entregas, reduzir congestionamentos e
            conectar centros de distribuição, veículos e consumidores em tempo real.
          </p>
          <p>
            A UrbanLink Flow é a nova plataforma da empresa, feita para gestores de logística,
            operadores de transporte, prefeituras, empresas de e-commerce e profissionais de
            mobilidade urbana.
          </p>
          <Botao href="/contato" variante="link" className={css.link}>
            Falar com a equipe
          </Botao>
        </div>
      </div>
    </section>
  )
}
