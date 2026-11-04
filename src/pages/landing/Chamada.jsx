import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

import { Botao } from '../../components/Botao.jsx'
import { LOGO_ABERTURA as G } from '../../components/logoAnimadoCaminhos.js'
import { montarChamadaA } from '../../motion/chamadaA.js'
import { MODOS } from '../../motion/setup.js'
import { A_CHAMADA } from './chamadaCaminhos.js'
import secao from './Secao.module.css'
import css from './Chamada.module.css'

const MASCARA = { maskUnits: 'userSpaceOnUse', x: 1000, y: 300, width: 320, height: 280 }
// Ponta redonda: no A grande, a frente do traço é uma cabeça de rota, não um corte reto.
const FIO = { strokeWidth: 64, strokeLinecap: 'round', strokeLinejoin: 'round' }

export function Chamada() {
  const chamada = useRef(null)

  // O A se desenha uma vez (motion/chamadaA.js). Movimento reduzido: o A já está pronto.
  useGSAP(
    () => {
      gsap.matchMedia().add(MODOS, ({ conditions }) => {
        if (conditions.reduzido) return
        montarChamadaA(chamada.current)
      })
    },
    { scope: chamada },
  )

  return (
    <section ref={chamada} id="entrar" className={`${secao.escuro} ${css.chamada}`}>
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
          {/* O mesmo A do logo animado (geom.json), com o pé que desce até a borda da seção.
              A rota do A se pinta por duas máscaras, uma por fio (P1 com os recortes, P2); o
              pé fica fora delas e a ponta da seta entra no fim. Ids ul-ch-: únicos na página. */}
          <svg viewBox="1030 335 245 305" className={css.a} aria-hidden="true" focusable="false" data-chamada-a="">
            <defs>
              <mask id="ul-ch-m1" {...MASCARA}>
                <path d={G.p1} className={css.fio} {...FIO} data-ul-ch="fio1" />
                <path d={G.dg} className={css.esconde} />
                <path d={G.sh} className={css.esconde} />
              </mask>
              <mask id="ul-ch-m2" {...MASCARA}>
                <path d={G.p2} className={css.fio} {...FIO} data-ul-ch="fio2" />
              </mask>
              <clipPath id="ul-ch-cm">
                <rect x="1000" y="330" width="213" height="220" />
              </clipPath>
              <clipPath id="ul-ch-ca">
                <rect x="1212" y="330" width="80" height="220" />
              </clipPath>
            </defs>
            <g clipPath="url(#ul-ch-cm)">
              <path d={A_CHAMADA.a} mask="url(#ul-ch-m1)" />
              <path d={A_CHAMADA.a} mask="url(#ul-ch-m2)" />
            </g>
            <g clipPath="url(#ul-ch-ca)">
              <path d={A_CHAMADA.a} data-ul-ch="seta" />
            </g>
            <path d={A_CHAMADA.base} />
          </svg>
        </div>
      </div>
    </section>
  )
}
