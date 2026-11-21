// Único lugar do site que chama fetch (docs/plano/04-api-e-dados.md, "Regras gerais").
// A API responde { success: true, data } e, no erro, { success: false, error: { code, message, details } }.
// Aqui a resposta vira só o `data`, e o erro vira um ErroApi com o código do site (CODIGOS). A tela
// escolhe a mensagem pelo código, nunca pelo texto do servidor.

const BASE = import.meta.env.VITE_API_URL ?? ''
const TEMPO_LIMITE_MS = 10_000

export const USAR_EXEMPLOS = import.meta.env.VITE_USAR_EXEMPLOS === 'true'

// Código da API → código que as telas usam. O que não está aqui passa igual.
const CODIGOS = {
  VALIDATION_ERROR: 'VALIDACAO',
  RATE_LIMITED: 'MUITAS_TENTATIVAS',
  UNAUTHORIZED: 'NAO_AUTENTICADO',
  TRACKING_NOT_FOUND: 'ENTREGA_NAO_ENCONTRADA',
  INVALID_RESET_TOKEN: 'TOKEN_INVALIDO',
}

// `campos` vem no 422 e diz quais campos a API recusou, com o nome que a API usa
// ({ email: '…' }). O texto de cada um é ignorado: a tela usa a mensagem dela pro campo.
// `mensagem` é o texto da API. Só a plataforma (/app) mostra, e só nas recusas de regra de
// negócio (409 CONFLICT), em que a API explica o motivo ("A entrega precisa ter veículo…").
export class ErroApi extends Error {
  constructor(erro, status, campos, mensagem) {
    super(erro)
    this.name = 'ErroApi'
    this.erro = erro
    this.status = status
    this.campos = campos ?? null
    this.mensagem = mensagem ?? null
  }
}

// O 422 da API traz o erro do Zod em árvore: { properties: { email: { errors: ['…'] } } }.
function camposRecusados(detalhes) {
  const campos = {}
  for (const [nome, galho] of Object.entries(detalhes?.properties ?? {})) {
    if (galho?.errors?.length) campos[nome] = galho.errors[0]
  }
  return Object.keys(campos).length ? campos : null
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

  // 202 e 204 vêm sem corpo.
  const dados = await resposta.json().catch(() => null)
  if (!resposta.ok) {
    const codigo = dados?.error?.code
    throw new ErroApi(
      CODIGOS[codigo] ?? codigo ?? 'ERRO_SERVIDOR',
      resposta.status,
      camposRecusados(dados?.error?.details),
      dados?.error?.message,
    )
  }
  return dados?.data ?? null
}

// Troca os nomes dos campos recusados pelos nomes que o site usa no pedido.
export function renomearCampos(campos, nomes) {
  if (!campos) return null
  const renomeados = {}
  for (const [nome, texto] of Object.entries(campos)) renomeados[nomes[nome] ?? nome] = texto
  return renomeados
}
