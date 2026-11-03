// Máscara do telefone do contato (03-telas-e-estados.md): (21) 9999-9999 com 10 números e
// (21) 99999-9999 com 11. O separador só entra quando vem número depois dele, então o
// Backspace nunca fica preso num parêntese ou num hífen.

export const digitos = (texto) => texto.replace(/\D/g, '')

export function formatarTelefone(texto) {
  let numeros = digitos(texto)
  if (numeros.length > 11 && numeros.startsWith('55')) numeros = numeros.slice(2) // colou com +55
  numeros = numeros.slice(0, 11)

  if (!numeros) return ''
  if (numeros.length <= 2) return `(${numeros}`

  const ddd = numeros.slice(0, 2)
  const resto = numeros.slice(2)
  const corte = numeros.length === 11 ? 5 : 4
  if (resto.length <= corte) return `(${ddd}) ${resto}`
  return `(${ddd}) ${resto.slice(0, corte)}-${resto.slice(corte)}`
}

// Onde o cursor fica depois de formatar: depois do mesmo número de dígitos que havia antes
// dele (e dos separadores que vêm em seguida). Assim dá pra corrigir um número no meio sem o
// cursor pular pro fim.
export function posicaoDoCursor(formatado, digitosAntes) {
  let posicao = 0
  let vistos = 0
  while (posicao < formatado.length && vistos < digitosAntes) {
    if (/\d/.test(formatado[posicao])) vistos++
    posicao++
  }
  while (posicao < formatado.length && /\D/.test(formatado[posicao])) posicao++
  return posicao
}
