import { useId } from 'react'

import css from './Campo.module.css'

// Campo com label, ajuda e erro ligados por aria-describedby.
// tipo: os do <input> (text, email, tel…) · select (opções em `children`) · textarea · checkbox.
// fundo="escuro": campo sem borda sobre Marinho. tamanho="grande": 56 px, label maior (busca).
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
  children,
  ...resto
}) {
  const id = useId()
  const idAjuda = ajuda ? `${id}-ajuda` : undefined
  const idErro = erro ? `${id}-erro` : undefined
  const descritores = [idErro, idAjuda].filter(Boolean).join(' ') || undefined

  const ligacao = {
    id,
    'aria-describedby': descritores,
    'aria-invalid': erro ? true : undefined,
    required: obrigatorio || undefined,
  }

  const grande = tamanho === 'grande'
  const classes = [css.campo, fundo === 'escuro' && css.escuro, grande && css.campoGrande, className]
    .filter(Boolean)
    .join(' ')

  const rotulo = (
    <>
      {label}
      {opcional && <span className={css.opcional}> (opcional)</span>}
    </>
  )

  const mensagens = (
    <>
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
    </>
  )

  // Caixa de marcar: a caixa vem antes do texto e o label inteiro é a área de toque.
  if (tipo === 'checkbox') {
    return (
      <div className={classes}>
        <label className={css.marcar}>
          <input type="checkbox" className={css.caixa} {...ligacao} {...resto} />
          <span>{rotulo}</span>
        </label>
        {mensagens}
      </div>
    )
  }

  const Elemento = tipo === 'select' || tipo === 'textarea' ? tipo : 'input'
  const classeEntrada = [css.entrada, grande && css.grande, tipo === 'textarea' && css.area]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={classes}>
      <label htmlFor={id} className={css.label}>
        {rotulo}
      </label>
      <div className={css.linha}>
        <Elemento type={Elemento === 'input' ? tipo : undefined} className={classeEntrada} {...ligacao} {...resto}>
          {Elemento === 'select' ? children : undefined}
        </Elemento>
        {depois}
      </div>
      {mensagens}
    </div>
  )
}
