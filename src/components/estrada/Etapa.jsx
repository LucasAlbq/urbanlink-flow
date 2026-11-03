import { Placa } from './Placa.jsx'
import css from './Estrada.module.css'

const SETA = 'M 0 0 H 30 L 64 30 L 30 60 H 0 L 26 30 Z'

// Um trecho da estrada: placa no poste, asfalto e o texto embaixo.
// trecho: feito (escuro com faixas) · futuro (claro, sem faixas; poste e seta também claros).
// pacote: true (no começo do trecho) · 'fim' (chegou na seta).
export function Etapa({ placa, trecho = 'feito', inicio, fim, pacote, children }) {
  const futuro = trecho === 'futuro'

  return (
    <li className={`${css.etapa} ${futuro ? css.etapaFutura : ''}`} data-etapa="">
      <div className={css.poste} data-poste="">
        <Placa {...placa} />
        <div className={css.haste} aria-hidden="true" />
      </div>
      <div className={`${css.asfalto} ${futuro ? css.futuro : ''}`} aria-hidden="true" data-asfalto="">
        {!futuro && <span className={css.faixa} data-faixa="" />}
        {inicio && <span className={css.inicio} />}
        {pacote && <span className={`${css.pacote} ${pacote === 'fim' ? css.pacoteFim : ''}`} data-pacote="" />}
        {fim && (
          <svg viewBox="0 0 64 60" className={css.fim} focusable="false" data-fim="">
            <path d={SETA} />
          </svg>
        )}
      </div>
      {children && (
        <div className={css.texto} data-texto="">
          {children}
        </div>
      )}
    </li>
  )
}
