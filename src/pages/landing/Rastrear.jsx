import { useRef, useState } from 'react'
import { useNavigate } from 'react-router'

import { Botao } from '../../components/Botao.jsx'
import { Campo } from '../../components/Campo.jsx'
import secao from './Secao.module.css'
import css from './Rastrear.module.css'

// Busca pelo código (03-telas-e-estados.md, "Campo de rastreio"): tira espaços,
// passa pra maiúsculas e vai pra /rastreamento/CODIGO. Quem decide se existe é a API.
export function Rastrear() {
  const navegar = useNavigate()
  const campo = useRef(null)
  const [erro, setErro] = useState('')

  function enviar(evento) {
    evento.preventDefault()
    const codigo = campo.current.value.replace(/\s+/g, '').toUpperCase()
    if (!codigo) {
      setErro('Digite o código de rastreio.')
      campo.current.focus()
      return
    }
    navegar(`/rastreamento/${encodeURIComponent(codigo)}`)
  }

  return (
    <section id="rastrear" className={secao.escuro}>
      <div className={`${secao.dentro} ${css.dentro}`}>
        <div className={css.texto}>
          <h2 className={secao.h2}>Rastrear uma entrega.</h2>
          <p className={`${secao.apoio} ${css.apoio}`}>
            Veja em que ponto do caminho a sua entrega está, do galpão até a sua porta.
          </p>
        </div>
        <form role="search" noValidate onSubmit={enviar} className={css.form}>
          <Campo
            ref={campo}
            label="Código de rastreio"
            name="codigo"
            fundo="escuro"
            tamanho="grande"
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            erro={erro}
            onChange={() => erro && setErro('')}
            ajuda="O código vem no e-mail ou SMS de envio e tem letras e números."
            depois={<Botao type="submit">Rastrear</Botao>}
          />
        </form>
      </div>
    </section>
  )
}
