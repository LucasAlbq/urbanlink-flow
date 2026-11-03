import { Link } from 'react-router'

import { CarregandoA } from './CarregandoA.jsx'
import css from './Botao.module.css'

// variante: ouro · noite · contorno · link. tamanho: grande (56 px) · normal (44 px).
// Com href vira link (navegação); sem href vira <button> (ação).
//
// carregando (só no <button>): a tela troca o texto ("Enviando…") e o botão fica desabilitado
// com aria-disabled, que não tira o foco dele como o `disabled` tiraria. O A da espera entra
// depois de 300 ms (02-efeitos.md). Quando a tela passa `carregando`, mesmo false, o botão ganha
// ao lado uma região de status pro leitor de tela ouvir o texto da espera.
export function Botao({
  variante = 'ouro',
  tamanho = 'grande',
  href,
  carregando,
  className = '',
  children,
  onClick,
  ...resto
}) {
  const classes = `${css.botao} ${css[variante]} ${css[tamanho]} ${className}`

  if (href) {
    const externo = /^https?:/.test(href)
    if (externo) {
      return (
        <a href={href} className={classes} onClick={onClick} {...resto}>
          {children}
        </a>
      )
    }
    return (
      <Link to={href} className={classes} onClick={onClick} {...resto}>
        {children}
      </Link>
    )
  }

  const ocupado = Boolean(carregando)

  // Desabilitado por aria-disabled: o clique (e o Enter que envia o formulário) não faz nada.
  function aoClicar(evento) {
    if (ocupado) {
      evento.preventDefault()
      return
    }
    onClick?.(evento)
  }

  const botao = (
    <button type="button" className={classes} aria-disabled={ocupado || undefined} {...resto} onClick={aoClicar}>
      {ocupado && <CarregandoA noBotao />}
      {children}
    </button>
  )

  if (carregando === undefined) return botao

  return (
    <>
      {botao}
      <span className="so-leitor" role="status">
        {ocupado ? children : null}
      </span>
    </>
  )
}
