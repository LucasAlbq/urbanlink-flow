import { useId } from 'react'

import css from './Campo.module.css'

// Campo com label, ajuda e erro ligados por aria-describedby.
// fundo="escuro": campo sem borda sobre Marinho. tamanho="grande": 56 px.
// `depois` entra ao lado do campo (ex.: o botão "Rastrear").
export function Campo({
  label,
  tipo = 'text',
  ajuda,
  erro,
  opcional = false,
  obrigatorio = false,
  fundo = 'claro',
  tamanho = 'normal',
  depois,
  className = '',
  ...resto
}) {
  const id = useId()
  const idAjuda = ajuda ? `${id}-ajuda` : undefined
  const idErro = erro ? `${id}-erro` : undefined
  const descritores = [idErro, idAjuda].filter(Boolean).join(' ') || undefined

  return (
    <div className={`${css.campo} ${fundo === 'escuro' ? css.escuro : ''} ${className}`}>
      <label htmlFor={id} className={css.label}>
        {label}
        {opcional && <span className={css.opcional}> (opcional)</span>}
      </label>
      <div className={css.linha}>
        <input
          id={id}
          type={tipo}
          className={`${css.entrada} ${tamanho === 'grande' ? css.grande : ''}`}
          aria-describedby={descritores}
          aria-invalid={erro ? true : undefined}
          required={obrigatorio || undefined}
          {...resto}
        />
        {depois}
      </div>
      {erro && (
        <p id={idErro} className={css.erro}>
          {erro}
        </p>
      )}
      {ajuda && (
        <p id={idAjuda} className={css.ajuda}>
          {ajuda}
        </p>
      )}
    </div>
  )
}
