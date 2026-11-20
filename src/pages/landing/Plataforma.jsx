import { Logo } from '../../components/Logo.jsx'
import { AREAS_PLATAFORMA } from '../../components/iconesPlataforma.jsx'
import { MapaIlustrado } from '../../components/cidade/MapaIlustrado.jsx'
import secao from './Secao.module.css'
import css from './Plataforma.module.css'

export function Plataforma() {
  return (
    <section id="plataforma" className={secao.branco}>
      <div className={secao.dentro}>
        <div className={css.cabeca}>
          <h2 className={secao.h2}>
            Por dentro
            <br />
            da plataforma.
          </h2>
          <p className={`${secao.apoio} ${css.apoio}`}>
            Quatro áreas, uma pra cada momento da entrega, com o mapa da cidade no centro.
          </p>
        </div>

        <div
          role="img"
          aria-label="Ilustração da plataforma: menu com Monitoramento, Rotas, Simulação e Cadastros ao lado do mapa da cidade"
          className={css.moldura}
        >
          <div className={css.barra} aria-hidden="true">
            <Logo className={css.logo} />
            <span className={css.avatar} />
          </div>
          <div className={css.corpo} aria-hidden="true">
            <div className={css.menu}>
              {AREAS_PLATAFORMA.map((area, i) => (
                <div key={area.nome} className={`${css.item} ${i === 0 ? css.ativo : ''}`}>
                  <svg viewBox="0 0 24 24" className={css.icone} focusable="false">
                    {area.icone}
                  </svg>
                  <span className={css.rotulo}>{area.nome}</span>
                </div>
              ))}
            </div>
            <div className={css.principal}>
              <div className={css.tituloArea}>Monitoramento</div>
              <div className={css.mapa}>
                <MapaIlustrado />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
