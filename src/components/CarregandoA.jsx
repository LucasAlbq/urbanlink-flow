import { useEffect, useId, useRef, useState } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

import { montarEsperaA } from '../motion/esperaA.js'
import { MODOS } from '../motion/setup.js'
import { LOGO_ABERTURA as G } from './logoAnimadoCaminhos.js'
import css from './CarregandoA.module.css'

const ESPERA_MS = 300 // 02-efeitos.md: só aparece depois de 300 ms (igual a --espera-carregando)
const MASCARA = { maskUnits: 'userSpaceOnUse', x: 1000, y: 300, width: 320, height: 280 }
const FIO = { strokeWidth: 64, strokeLinecap: 'butt', strokeLinejoin: 'round' }

// O A da espera: o mesmo A do logo animado (geom.json). Parado, é o caminho inteiro; animando
// (motion/esperaA.js), ele se desenha e se apaga em loop pelas duas máscaras dos fios.
// Ids com useId: pode haver mais de um A na página (o botão e a busca).
function AEspera({ noBotao }) {
  const svg = useRef(null)
  const id = useId().replace(/:/g, '')
  const ids = { m1: `ul-ca-${id}-m1`, m2: `ul-ca-${id}-m2`, cm: `ul-ca-${id}-cm`, ca: `ul-ca-${id}-ca` }

  useGSAP(
    () => {
      gsap.matchMedia().add(MODOS, ({ conditions }) => {
        if (conditions.reduzido) return // A parado, com o texto da espera
        return montarEsperaA(svg.current)
      })
    },
    { scope: svg },
  )

  return (
    <svg
      ref={svg}
      viewBox="1039 341 226 194"
      className={`${css.a} ${noBotao ? css.noBotao : ''}`}
      aria-hidden="true"
      focusable="false"
      data-carregando-a=""
    >
      <defs>
        <mask id={ids.m1} {...MASCARA}>
          <path d={G.p1} className={css.fio} {...FIO} data-a-fio="1" />
          <path d={G.dg} className={css.esconde} />
          <path d={G.sh} className={css.esconde} />
        </mask>
        <mask id={ids.m2} {...MASCARA}>
          <path d={G.p2} className={css.fio} {...FIO} data-a-fio="2" />
        </mask>
        <clipPath id={ids.cm}>
          <rect x="1000" y="330" width="213" height="220" />
        </clipPath>
        <clipPath id={ids.ca}>
          <rect x="1212" y="330" width="80" height="220" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${ids.cm})`}>
        <g className={css.desenho} data-a="desenho">
          <path d={G.a} mask={`url(#${ids.m1})`} />
          <path d={G.a} mask={`url(#${ids.m2})`} />
        </g>
        <path d={G.a} data-a="inteiro" />
      </g>
      <g clipPath={`url(#${ids.ca})`}>
        <path d={G.a} data-a="seta" />
      </g>
    </svg>
  )
}

// Espera com o A da logo: só aparece depois de 300 ms.
// O texto fica numa região aria-live, então quem usa leitor de tela ouve a espera.
// noBotao: só o A, dentro de um <button> (o texto da espera é o do botão; ver Botao).
export function CarregandoA({ texto, tamanho, noBotao = false }) {
  const [visivel, setVisivel] = useState(false)

  useEffect(() => {
    const espera = setTimeout(() => setVisivel(true), ESPERA_MS)
    return () => clearTimeout(espera)
  }, [])

  if (noBotao) return visivel ? <AEspera noBotao /> : null

  return (
    <div className={css.carregando} aria-live="polite" style={tamanho ? { '--tamanho': `${tamanho}px` } : undefined}>
      {visivel && (
        <>
          <AEspera />
          <p className={css.texto}>{texto}</p>
        </>
      )}
    </div>
  )
}
