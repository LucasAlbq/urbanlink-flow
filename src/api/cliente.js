// Único lugar do site que chama fetch (docs/plano/04-api-e-dados.md, "Regras gerais").
// Toda falha vira um ErroApi com o código `erro`; a tela escolhe a mensagem pelo código,
// nunca pelo texto do servidor.

const BASE = import.meta.env.VITE_API_URL ?? ''
const TEMPO_LIMITE_MS = 10_000

export const USAR_EXEMPLOS = import.meta.env.VITE_USAR_EXEMPLOS === 'true'

export class ErroApi extends Error {
  constructor(erro, status) {
    super(erro)
    this.erro = erro
    this.status = status
  }
}

export async function pedir(caminho, { metodo = 'GET', corpo, sinal } = {}) {
  const limite = AbortSignal.timeout(TEMPO_LIMITE_MS)
  const signal = sinal ? AbortSignal.any([sinal, limite]) : limite

  let resposta
  try {
    resposta = await fetch(`${BASE}${caminho}`, {
      method: metodo,
      credentials: 'include',
      headers: corpo ? { 'Content-Type': 'application/json' } : undefined,
      body: corpo ? JSON.stringify(corpo) : undefined,
      signal,
    })
  } catch (falha) {
    if (sinal?.aborted) throw falha
    throw new ErroApi('SEM_CONEXAO')
  }

  const dados = await resposta.json().catch(() => null)
  if (!resposta.ok) throw new ErroApi(dados?.erro ?? 'ERRO_SERVIDOR', resposta.status)
  return dados
}
