import { useEffect } from 'react'

import css from './Pagina.module.css'

// Casca das páginas na fase 0: troca o título da aba e mostra o <h1>.
// O <h1> aceita foco por código (o Layout manda o foco pra ele ao trocar de rota).
export function Pagina({ tituloAba, titulo, children }) {
  useEffect(() => {
    document.title = tituloAba
  }, [tituloAba])

  return (
    <section className={css.pagina}>
      <h1 tabIndex={-1}>{titulo}</h1>
      {children}
    </section>
  )
}
