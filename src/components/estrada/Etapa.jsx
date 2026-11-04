import { Placa } from './Placa.jsx'
import css from './Estrada.module.css'

const SETA = 'M 0 0 H 30 L 64 30 L 30 60 H 0 L 26 30 Z'

// Um trecho da estrada: placa no poste, asfalto e o texto embaixo.
// trecho: feito (escuro com faixas) · futuro (claro, sem faixas; poste e seta também claros).
// pacote: true (no começo do trecho) · 'fim' (chegou na seta).
// Sem `placa`, a etapa fica sem poste (menu do celular). parada: ponto no asfalto (sem pacote).
// data-* pros efeitos (a jornada): data-haste no poste, data-inicio no ponto do começo (o pacote
// que anda) e data-fim-aceso numa segunda seta Amarela por cima da Ouro, invisível até acender.
// No trecho feito, data-cobre é uma capa da cor do trecho futuro, invisível: o rastreamento
// mostra e encolhe a capa pra o trecho "se preencher" (sem achatar o pacote e a seta).
export function Etapa({ placa, trecho = 'feito', inicio, fim, pacote, parada, children }) {
  const futuro = trecho === 'futuro'

  return (
    <li className={`${css.etapa} ${futuro ? css.etapaFutura : ''}`} data-etapa="">
      {placa && (
        <div className={css.poste} data-poste="">
          <Placa {...placa} />
          <div className={css.haste} aria-hidden="true" data-haste="" />
        </div>
      )}
      <div
        className={`${css.asfalto} ${futuro ? css.futuro : ''} ${fim ? css.asfaltoComSeta : ''}`}
        aria-hidden="true"
        data-asfalto=""
      >
        {!futuro && <span className={`${css.faixa} ${fim ? css.faixaAteSeta : ''}`} data-faixa="" />}
        {!futuro && <span className={css.cobre} data-cobre="" />}
        {inicio && <span className={css.inicio} data-inicio="" />}
        {parada && !pacote && <span className={css.parada} data-parada="" />}
        {pacote && <span className={`${css.pacote} ${pacote === 'fim' ? css.pacoteFim : ''}`} data-pacote="" />}
        {fim && (
          <svg viewBox="0 0 64 60" className={css.fim} focusable="false" data-fim="">
            <path d={SETA} />
            <path d={SETA} className={css.fimAceso} data-fim-aceso="" />
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
