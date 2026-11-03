import { useEffect, useState } from 'react'

import { LOGO } from './logoCaminhos.js'
import css from './CarregandoA.module.css'

const A = LOGO[LOGO.length - 1].d
const ESPERA_MS = 300 // 02-efeitos.md: só aparece depois de 300 ms (igual a --espera-carregando)

// Espera com o A da logo. Parado nesta fase; o traço animado entra na fase 3.
// O texto fica numa região aria-live, então quem usa leitor de tela ouve a espera.
export function CarregandoA({ texto, tamanho }) {
  const [visivel, setVisivel] = useState(false)

  useEffect(() => {
    const espera = setTimeout(() => setVisivel(true), ESPERA_MS)
    return () => clearTimeout(espera)
  }, [])

  return (
    <div className={css.carregando} aria-live="polite" style={tamanho ? { '--tamanho': `${tamanho}px` } : undefined}>
      {visivel && (
        <>
          <svg viewBox="1238 574 122 105" className={css.a} aria-hidden="true" focusable="false" data-carregando-a="">
            <path d={A} />
          </svg>
          <p className={css.texto}>{texto}</p>
        </>
      )}
    </div>
  )
}
