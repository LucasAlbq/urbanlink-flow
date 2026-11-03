import { useRef, useState } from 'react'
import { flushSync } from 'react-dom'

// Erros de formulário com a regra do plano (03-telas-e-estados.md): o erro de um campo só aparece
// depois que a pessoa mexe nele e sai, ou quando tenta enviar. Passar pelo campo vazio com o Tab
// não mostra erro. Depois de aparecer, o erro some assim que o valor fica certo.
//
// regras: { campo: (valores) => mensagem ou '' }, na ordem em que os campos aparecem na tela.
// Uma regra pode olhar outros campos (ex.: "As senhas não são iguais.").
export function useValidacao(regras) {
  const [erros, setErros] = useState({})
  const mexidos = useRef(new Set())

  // Passa de novo pelos erros que já estão na tela e tira o que ficou certo.
  // Erro sem regra (veio da API) fica até o próximo envio.
  function revisar(atuais, valores) {
    let mudou = false
    const novos = {}
    for (const [campo, mensagem] of Object.entries(atuais)) {
      const agora = regras[campo] ? regras[campo](valores) : mensagem
      if (agora) novos[campo] = agora
      if (agora !== mensagem) mudou = true
    }
    return mudou ? novos : atuais
  }

  // O primeiro campo com erro, na ordem das regras (e depois os que não têm regra).
  function primeiro(lista) {
    const ordem = Object.keys(regras)
    return [...lista].sort((a, b) => {
      const ia = ordem.indexOf(a)
      const ib = ordem.indexOf(b)
      return (ia < 0 ? ordem.length : ia) - (ib < 0 ? ordem.length : ib)
    })[0]
  }

  return {
    erros,

    aoMudar(campo, valores) {
      mexidos.current.add(campo)
      setErros((atuais) => revisar(atuais, valores))
    },

    aoSair(campo, valores) {
      if (!mexidos.current.has(campo) || !regras[campo]) return
      const mensagem = regras[campo](valores)
      setErros((atuais) => {
        if ((atuais[campo] ?? '') === mensagem) return atuais
        const novos = { ...atuais }
        if (mensagem) novos[campo] = mensagem
        else delete novos[campo]
        return novos
      })
    },

    // Tentou enviar: mostra todos os erros e devolve o primeiro campo com erro (ou undefined).
    // O flushSync põe o erro na tela antes de a tela mover o foco, pra ele ser lido junto.
    validarTudo(valores) {
      const novos = {}
      for (const [campo, regra] of Object.entries(regras)) {
        const mensagem = regra(valores)
        if (mensagem) novos[campo] = mensagem
      }
      flushSync(() => setErros(novos))
      return primeiro(Object.keys(novos))
    },

    // Erros que vieram da API (422), já com o texto da tela. Devolve o primeiro campo.
    mostrar(novos) {
      flushSync(() => setErros((atuais) => ({ ...atuais, ...novos })))
      return primeiro(Object.keys(novos))
    },
  }
}
