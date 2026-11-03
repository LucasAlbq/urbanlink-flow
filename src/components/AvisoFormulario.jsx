import css from './AvisoFormulario.module.css'

// Mensagem do formulário inteiro, fora de um campo: o erro de envio ("Não deu pra enviar agora…")
// ou um aviso ("Senha nova salva…"). Fica sempre na página numa região de status, então o leitor
// de tela fala quando o texto aparece. Vazia, não ocupa lugar nem soma espaço na coluna.
// vivo={false}: sem região de status (quando quem lê o aviso é o aria-describedby de outro elemento).
export function AvisoFormulario({ id, vivo = true, className = '', children }) {
  return (
    <p id={id} role={vivo ? 'status' : undefined} className={`${css.aviso} ${className}`}>
      {children || null}
    </p>
  )
}
