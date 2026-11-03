import { useId, useState } from 'react'

import css from './Campo.module.css'

// Campo com label, ajuda e erro ligados por aria-describedby.
// tipo: os do <input> (text, email, tel…) · select (opções em `children`) · textarea · checkbox.
// fundo="escuro": campo sem borda sobre Marinho. tamanho="grande": 56 px, label maior (busca).
// `depois` entra ao lado do campo (ex.: o botão "Rastrear").
// mostrarSenha (com tipo="password"): botão de olho dentro da caixa que mostra e esconde a senha.
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
  mostrarSenha = false,
  className = '',
  children,
  ...resto
}) {
  const id = useId()
  const [senhaVisivel, setSenhaVisivel] = useState(false)
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
  const comOlho = mostrarSenha && tipo === 'password'
  const classeEntrada = [css.entrada, grande && css.grande, tipo === 'textarea' && css.area, comOlho && css.comOlho]
    .filter(Boolean)
    .join(' ')

  let entrada = (
    <Elemento
      type={Elemento === 'input' ? (comOlho && senhaVisivel ? 'text' : tipo) : undefined}
      className={classeEntrada}
      {...ligacao}
      {...resto}
    >
      {Elemento === 'select' ? children : undefined}
    </Elemento>
  )

  // O olho fica dentro da caixa, à direita. O plano pede aria-pressed e o aria-label trocando juntos.
  if (comOlho) {
    entrada = (
      <div className={css.caixaOlho}>
        {entrada}
        <button
          type="button"
          className={css.olho}
          aria-label={senhaVisivel ? 'Esconder senha' : 'Mostrar senha'}
          aria-pressed={senhaVisivel}
          aria-controls={id}
          onClick={() => setSenhaVisivel((v) => !v)}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M 2 12 C 4.5 7 8 5 12 5 C 16 5 19.5 7 22 12 C 19.5 17 16 19 12 19 C 8 19 4.5 17 2 12 Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </button>
      </div>
    )
  }

  return (
    <div className={classes}>
      <label htmlFor={id} className={css.label}>
        {rotulo}
      </label>
      <div className={css.linha}>
        {entrada}
        {depois}
      </div>
      {mensagens}
    </div>
  )
}
