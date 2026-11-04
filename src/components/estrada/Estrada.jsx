import { useRef } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

import { montarFaixas } from '../../motion/faixas.js'
import { MODOS } from '../../motion/setup.js'
import { Etapa } from './Etapa.jsx'
import css from './Estrada.module.css'

// A estrada com placas. Cada item de `etapas`:
// { id, placa: { numero, nome, glifo, estado }, trecho, conteudo }
// orientacao: auto (horizontal, vira vertical abaixo de 760 px) · vertical.
// inicio: ponto amarelo no começo. fim: seta no fim (Ouro, ou clara se o último trecho for futuro).
// pacoteEm: índice da etapa com o pacote, ou 'fim' (pacote na seta).
// variante="menu": a estrada do menu do celular (asfalto Marinho, pacote no meio da parada).
// paradas: ponto no asfalto das etapas sem o pacote.
// faixas: andam (deslizam devagar na tela, motion/faixas.js) · jornada (no desktop quem
// mexe nelas é a trava da jornada; no celular elas andam).
export function Estrada({
  etapas,
  orientacao = 'auto',
  variante = 'normal',
  inicio = true,
  fim = true,
  pacoteEm,
  paradas = false,
  faixas = 'andam',
  className = '',
  ...resto
}) {
  const estrada = useRef(null)
  const ultima = etapas.length - 1
  const classes = [
    css.estrada,
    orientacao === 'vertical' ? css.vertical : css.auto,
    variante === 'menu' && css.menu,
    className,
  ]
    .filter(Boolean)
    .join(' ')

  // Movimento reduzido: faixas paradas.
  useGSAP(
    () => {
      gsap.matchMedia().add(MODOS, ({ conditions }) => {
        if (conditions.reduzido) return undefined
        if (faixas === 'jornada' && conditions.desktop) return undefined
        const vertical = orientacao === 'vertical' || conditions.celular
        return montarFaixas(estrada.current, { vertical })
      })
    },
    { scope: estrada },
  )

  return (
    <ol
      ref={estrada}
      className={classes}
      style={{ '--etapas': etapas.length }}
      data-estrada=""
      {...resto}
    >
      {etapas.map((etapa, i) => (
        <Etapa
          key={etapa.id ?? i}
          placa={etapa.placa}
          trecho={etapa.trecho}
          inicio={inicio && i === 0}
          fim={fim && i === ultima}
          pacote={pacoteEm === i || (pacoteEm === 'fim' && i === ultima && 'fim')}
          parada={paradas}
        >
          {etapa.conteudo}
        </Etapa>
      ))}
    </ol>
  )
}
