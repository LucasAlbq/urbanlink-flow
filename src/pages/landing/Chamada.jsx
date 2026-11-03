import { Botao } from '../../components/Botao.jsx'
import { A_CHAMADA } from './chamadaCaminhos.js'
import secao from './Secao.module.css'
import css from './Chamada.module.css'

export function Chamada() {
  return (
    <section id="entrar" className={`${secao.escuro} ${css.chamada}`}>
      <div className={css.dentro}>
        <div className={css.texto}>
          <h2 className={css.titulo}>Coloque a sua operação no mapa.</h2>
          <p className={`${secao.apoio} ${css.apoio}`}>
            Entre na plataforma pra acompanhar entregas, traçar rotas e simular cenários.
          </p>
          <div className={secao.acoes}>
            <Botao href="/login">Entrar na plataforma</Botao>
            <Botao href="/contato" variante="link">
              Falar com a equipe
            </Botao>
          </div>
        </div>
        <div className={css.arte}>
          <svg viewBox="1030 335 245 305" className={css.a} aria-hidden="true" focusable="false" data-chamada-a="">
            <path d={A_CHAMADA.a} />
            <path d={A_CHAMADA.base} />
          </svg>
        </div>
      </div>
    </section>
  )
}
