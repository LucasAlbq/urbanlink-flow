import { Link } from 'react-router'

import css from './Botao.module.css'

// variante: ouro · noite · contorno · link. tamanho: grande (56 px) · normal (44 px).
// Com href vira link (navegação); sem href vira <button> (ação).
export function Botao({
  variante = 'ouro',
  tamanho = 'grande',
  href,
  carregando = false,
  className = '',
  children,
  ...resto
}) {
  const classes = `${css.botao} ${css[variante]} ${css[tamanho]} ${className}`

  if (href) {
    const externo = /^https?:/.test(href)
    if (externo) {
      return (
        <a href={href} className={classes} {...resto}>
          {children}
        </a>
      )
    }
    return (
      <Link to={href} className={classes} {...resto}>
        {children}
      </Link>
    )
  }

  return (
    <button
      type="button"
      className={classes}
      disabled={carregando || resto.disabled}
      aria-busy={carregando || undefined}
      {...resto}
    >
      {children}
    </button>
  )
}
