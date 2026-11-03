import { pedir } from './cliente.js'

// Login e senha (04-api-e-dados.md, "Contato, login e senha"). A sessão é um cookie httpOnly
// da API: o front não guarda nada.
// Com VITE_USAR_EXEMPLOS=true responde com src/api/exemplos/auth.js. A condição precisa ler
// import.meta.env em cada função: o Vite troca pelo valor e o ramo some do build.

// POST /auth/login: 200 { usuario }. 401 CREDENCIAIS_INVALIDAS, 429 MUITAS_TENTATIVAS.
export async function entrar({ email, senha, manterConectado }, { sinal } = {}) {
  if (import.meta.env.VITE_USAR_EXEMPLOS === 'true') {
    const exemplos = await import('./exemplos/auth.js')
    return exemplos.entrar({ email, senha }, sinal)
  }
  return pedir('/auth/login', { metodo: 'POST', corpo: { email, senha, manterConectado }, sinal })
}

// GET /auth/eu: 200 com o usuário, 401 sem sessão.
export async function buscarEu({ sinal } = {}) {
  if (import.meta.env.VITE_USAR_EXEMPLOS === 'true') {
    const exemplos = await import('./exemplos/auth.js')
    return exemplos.eu(sinal)
  }
  return pedir('/auth/eu', { sinal })
}

// POST /auth/recuperar-senha: 202 sempre (não revela se a conta existe). 429 MUITAS_TENTATIVAS.
export async function pedirLinkSenha(email, { sinal } = {}) {
  if (import.meta.env.VITE_USAR_EXEMPLOS === 'true') {
    const exemplos = await import('./exemplos/auth.js')
    return exemplos.recuperarSenha(email, sinal)
  }
  return pedir('/auth/recuperar-senha', { metodo: 'POST', corpo: { email }, sinal })
}

// POST /auth/nova-senha: 204. 400 TOKEN_INVALIDO (link vencido ou usado), 422 VALIDACAO.
export async function salvarSenhaNova({ token, senha }, { sinal } = {}) {
  if (import.meta.env.VITE_USAR_EXEMPLOS === 'true') {
    const exemplos = await import('./exemplos/auth.js')
    return exemplos.novaSenha({ token, senha }, sinal)
  }
  return pedir('/auth/nova-senha', { metodo: 'POST', corpo: { token, senha }, sinal })
}
