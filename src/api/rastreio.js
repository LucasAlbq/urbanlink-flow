import { ErroApi, pedir } from './cliente.js'

// GET /entregas/rastreio/:codigo (04-api-e-dados.md, "Rastreio").
// Com VITE_USAR_EXEMPLOS=true responde com src/api/exemplos/rastreio.js. A condição precisa
// ler import.meta.env aqui mesmo: o Vite troca pelo valor e o ramo some do build.
export async function buscarRastreio(codigo, { sinal } = {}) {
  if (import.meta.env.VITE_USAR_EXEMPLOS === 'true') {
    const { rastreioDeExemplo } = await import('./exemplos/rastreio.js')
    return rastreioDeExemplo(codigo, sinal)
  }
  return pedir(`/entregas/rastreio/${encodeURIComponent(codigo)}`, { sinal })
}

export { ErroApi }
