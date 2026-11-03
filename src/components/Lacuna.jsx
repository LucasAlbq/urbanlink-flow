import css from './Lacuna.module.css'

// Trecho que o grupo ainda vai preencher, como "[data]". Fica marcado de propósito
// (pranchas Politica e Recuperar-Senha-Enviado) pra ninguém publicar sem trocar o texto.
export function Lacuna({ children }) {
  return <span className={css.lacuna}>{children}</span>
}
