import { ErroApi, pedir, renomearCampos } from './cliente.js'

// Login e senha (04-api-e-dados.md, "Contato, login e senha"). A sessão é um cookie httpOnly
// da API (urbanlink_session): o site não guarda nem vê o token.
// Com VITE_USAR_EXEMPLOS=true responde com src/api/exemplos/auth.js. A condição precisa ler
// import.meta.env em cada função: o Vite troca pelo valor e o ramo some do build.

const PAPEL = { ADMIN: 'ADMIN', MANAGER: 'GESTOR', OPERATOR: 'OPERADOR' }
const paraUsuario = (user) => ({ id: user.id, nome: user.name, papel: PAPEL[user.role] ?? user.role })

// POST /auth/login: 200 { user } e o cookie da sessão. 401 errou, 429 MUITAS_TENTATIVAS.
export async function entrar({ email, senha, manterConectado }, { sinal } = {}) {
  if (import.meta.env.VITE_USAR_EXEMPLOS === 'true') {
    const exemplos = await import('./exemplos/auth.js')
    return exemplos.entrar({ email, senha }, sinal)
  }
  const { user } = await pedir('/auth/login', {
    metodo: 'POST',
    corpo: { email, password: senha, remember: manterConectado },
    sinal,
  })
  return { usuario: paraUsuario(user) }
}

// GET /auth/me: 200 com o usuário, 401 sem sessão.
export async function buscarEu({ sinal } = {}) {
  if (import.meta.env.VITE_USAR_EXEMPLOS === 'true') {
    const exemplos = await import('./exemplos/auth.js')
    return exemplos.eu(sinal)
  }
  return { usuario: paraUsuario(await pedir('/auth/me', { sinal })) }
}

// POST /auth/logout: 204, apaga o cookie da sessão.
export async function sair({ sinal } = {}) {
  if (import.meta.env.VITE_USAR_EXEMPLOS === 'true') {
    const exemplos = await import('./exemplos/auth.js')
    return exemplos.sair(sinal)
  }
  await pedir('/auth/logout', { metodo: 'POST', sinal })
  return null
}

// POST /auth/password-reset/request: 202 sempre (não revela se a conta existe). 429 MUITAS_TENTATIVAS.
export async function pedirLinkSenha(email, { sinal } = {}) {
  if (import.meta.env.VITE_USAR_EXEMPLOS === 'true') {
    const exemplos = await import('./exemplos/auth.js')
    return exemplos.recuperarSenha(email, sinal)
  }
  await pedir('/auth/password-reset/request', { metodo: 'POST', corpo: { email }, sinal })
  return null
}

// POST /auth/password-reset/confirm: 204. 400 TOKEN_INVALIDO (link vencido ou usado), 422 VALIDACAO.
export async function salvarSenhaNova({ token, senha }, { sinal } = {}) {
  if (import.meta.env.VITE_USAR_EXEMPLOS === 'true') {
    const exemplos = await import('./exemplos/auth.js')
    return exemplos.novaSenha({ token, senha }, sinal)
  }
  try {
    await pedir('/auth/password-reset/confirm', { metodo: 'POST', corpo: { token, password: senha }, sinal })
    return null
  } catch (falha) {
    if (falha instanceof ErroApi && falha.campos) falha.campos = renomearCampos(falha.campos, { password: 'senha' })
    throw falha
  }
}
