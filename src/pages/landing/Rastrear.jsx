import { BuscaRastreio } from '../../components/BuscaRastreio.jsx'
import secao from './Secao.module.css'
import css from './Rastrear.module.css'

export function Rastrear() {
  return (
    <section id="rastrear" className={secao.escuro}>
      <div className={`${secao.dentro} ${css.dentro}`}>
        <div className={css.texto}>
          <h2 className={secao.h2}>Rastrear uma entrega.</h2>
          <p className={`${secao.apoio} ${css.apoio}`}>
            Veja em que ponto do caminho a sua entrega está, do galpão até a sua porta.
          </p>
        </div>
        <BuscaRastreio className={css.form} />
      </div>
    </section>
  )
}
