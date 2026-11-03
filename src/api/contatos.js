import { pedir } from './cliente.js'

// POST /contatos (04-api-e-dados.md, "Contato, login e senha"): 201 { protocolo, criadoEm }.
// Com VITE_USAR_EXEMPLOS=true responde com src/api/exemplos/contatos.js. A condição precisa
// ler import.meta.env aqui mesmo: o Vite troca pelo valor e o ramo some do build.
export async function enviarContato(contato, { sinal } = {}) {
  if (import.meta.env.VITE_USAR_EXEMPLOS === 'true') {
    const { contatoDeExemplo } = await import('./exemplos/contatos.js')
    return contatoDeExemplo(contato, sinal)
  }
  return pedir('/contatos', { metodo: 'POST', corpo: contato, sinal })
}
