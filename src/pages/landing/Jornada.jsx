import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

import { Estrada } from '../../components/estrada/Estrada.jsx'
import { montarJornada } from '../../motion/jornada.js'
import { MODOS } from '../../motion/setup.js'
import secao from './Secao.module.css'
import css from './Jornada.module.css'

// Os quatro momentos da entrega. Textos da prancha Landing.
const MOMENTOS = [
  {
    id: 'saida',
    placa: { numero: 1, nome: 'Saída', glifo: 'seta' },
    titulo: 'O pedido sai do galpão',
    texto: 'Entregas, veículos e motoristas ficam cadastrados num lugar só, prontos pra rodar.',
    area: 'Cadastros',
  },
  {
    id: 'rota',
    placa: { numero: 2, nome: 'Rota', glifo: 'seta' },
    titulo: 'O caminho é traçado no mapa',
    texto: 'A plataforma calcula a rota com tempo e distância antes do veículo sair.',
    area: 'Rotas',
  },
  {
    id: 'imprevisto',
    placa: { numero: 3, nome: 'Imprevisto', glifo: 'desvio', estado: 'atual' },
    titulo: 'A cidade muda no meio do caminho',
    texto:
      'Simule trânsito, bloqueio ou atraso e veja como a operação reage. Serve também pra treinar a equipe.',
    area: 'Simulação',
  },
  {
    id: 'entrega',
    placa: { numero: 4, nome: 'Entrega', glifo: 'seta' },
    titulo: 'O pedido chega na porta',
    texto: 'Cada entrega aparece no mapa em tempo real, junto com os indicadores da operação.',
    area: 'Monitoramento',
  },
]

const ETAPAS = MOMENTOS.map((m) => ({
  id: m.id,
  placa: m.placa,
  conteudo: (
    <>
      <h3 className={css.titulo}>{m.titulo}</h3>
      <p className={css.texto}>{m.texto}</p>
      <p className={css.area}>
        Na plataforma: <strong>{m.area}</strong>
      </p>
    </>
  ),
}))

export function Jornada() {
  const jornada = useRef(null)

  // Desktop: a seção trava e o pacote anda a estrada. Celular: a estrada se desenha.
  // Movimento reduzido: tudo visível, nada se mexe (motion/jornada.js).
  useGSAP(
    () => {
      gsap.matchMedia().add(MODOS, ({ conditions }) => {
        if (conditions.reduzido) return
        montarJornada(jornada.current, { desktop: conditions.desktop })
      })
    },
    { scope: jornada },
  )

  return (
    <section ref={jornada} id="como-funciona" className={secao.nevoa}>
      <div className={secao.dentro}>
        <div className={css.cabeca}>
          <h2 className={secao.h2}>Do galpão à porta.</h2>
          <p className={`${secao.apoio} ${css.apoio}`}>
            Uma entrega passa por quatro momentos. A UrbanLink Flow tem uma área da plataforma pra
            cada um.
          </p>
        </div>
        <Estrada etapas={ETAPAS} />
      </div>
    </section>
  )
}
