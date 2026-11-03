import { useRef, useState } from 'react'
import { useNavigate } from 'react-router'

import { Botao } from './Botao.jsx'
import { Campo } from './Campo.jsx'

// Busca pelo código (03-telas-e-estados.md, "Campo de rastreio"): tira espaços,
// passa pra maiúsculas e vai pra /rastreamento/CODIGO. Quem decide se existe é a API.
// Usada na seção Rastrear da landing e no topo da página de rastreamento.
export function BuscaRastreio({ codigoInicial = '', campoRef, className = '' }) {
  const navegar = useNavigate()
  const proprio = useRef(null)
  const campo = campoRef ?? proprio
  const [erro, setErro] = useState('')

  function enviar(evento) {
    evento.preventDefault()
    const codigo = campo.current.value.replace(/\s+/g, '').toUpperCase()
    if (!codigo) {
      setErro('Digite o código de rastreio.')
      campo.current.focus()
      return
    }
    campo.current.value = codigo
    navegar(`/rastreamento/${encodeURIComponent(codigo)}`)
  }

  return (
    <form role="search" noValidate onSubmit={enviar} className={className}>
      <Campo
        ref={campo}
        label="Código de rastreio"
        name="codigo"
        fundo="escuro"
        tamanho="grande"
        autoComplete="off"
        autoCapitalize="characters"
        spellCheck={false}
        defaultValue={codigoInicial}
        erro={erro}
        onChange={() => erro && setErro('')}
        ajuda="O código vem no e-mail ou SMS de envio e tem letras e números."
        depois={<Botao type="submit">Rastrear</Botao>}
      />
    </form>
  )
}
