import { useTituloAba } from './useTituloAba.js'
import css from './Pagina.module.css'

// Casca provisória das páginas que ainda não foram portadas da prancha.
// O <h1> aceita foco por código (o Layout manda o foco pra ele ao trocar de rota).
export function Pagina({ tituloAba, titulo, children }) {
  useTituloAba(tituloAba)

  return (
    <section className={css.pagina}>
      <h1 tabIndex={-1}>{titulo}</h1>
      {children}
    </section>
  )
}
