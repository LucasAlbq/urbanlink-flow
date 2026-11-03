import { Logo } from '../../components/Logo.jsx'
import { MapaIlustrado } from '../../components/cidade/MapaIlustrado.jsx'
import secao from './Secao.module.css'
import css from './Plataforma.module.css'

// Ícones desenhados na prancha (traço fino, um conjunto só).
const AREAS = [
  {
    nome: 'Monitoramento',
    icone: (
      <>
        <circle cx="12" cy="10" r="3" />
        <path d="M 12 21 C 12 21 5 14.5 5 10 A 7 7 0 0 1 19 10 C 19 14.5 12 21 12 21 Z" />
      </>
    ),
  },
  {
    nome: 'Rotas',
    icone: (
      <>
        <circle cx="6" cy="18" r="2.5" />
        <path d="M 8.5 18 H 15 A 3.5 3.5 0 0 0 15 11 H 9 A 3.5 3.5 0 0 1 9 4 H 15" />
        <path d="M 15 1.5 L 18 4 L 15 6.5" />
      </>
    ),
  },
  {
    nome: 'Simulação',
    icone: (
      <>
        <path d="M 4 19 H 20" />
        <path d="M 4 15 L 9 9 L 13 13 L 20 5" />
        <path d="M 16 5 H 20 V 9" />
      </>
    ),
  },
  {
    nome: 'Cadastros',
    icone: (
      <>
        <rect x="4" y="3" width="16" height="18" rx="2" />
        <path d="M 8 8 H 16 M 8 12 H 16 M 8 16 H 13" />
      </>
    ),
  },
]

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
              {AREAS.map((area, i) => (
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
