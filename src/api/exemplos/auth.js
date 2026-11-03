import { ErroApi } from '../cliente.js'
import { esperar, gatilho } from './comum.js'

// Respostas de exemplo do login e da senha. A sessão fica só na memória da página
// (recarregar sai da conta).
//
// Login: qualquer e-mail com a senha "exemplo123" entra; outra senha dá 401.
//   muitas@…       429 MUITAS_TENTATIVAS
//   sem-conexao@…  a API não responde
// Recuperar senha: sempre 202, menos muitas@… (429) e sem-conexao@….
// Senha nova: o token "vencido" dá 400 TOKEN_INVALIDO e "sem-conexao" não responde.
const SENHA = 'exemplo123'
const USUARIO = { id: 1, nome: 'Conta de exemplo', papel: 'GESTOR' }

let sessao = null

function falhaPorGatilho(email) {
  const quem = gatilho(email)
  if (quem === 'sem-conexao') throw new ErroApi('SEM_CONEXAO')
  if (quem === 'muitas') throw new ErroApi('MUITAS_TENTATIVAS', 429)
}

export async function entrar({ email, senha }, sinal) {
  await esperar(900, sinal)
  falhaPorGatilho(email)
  if (senha !== SENHA) throw new ErroApi('CREDENCIAIS_INVALIDAS', 401)
  sessao = USUARIO
  return { usuario: sessao }
}

export async function eu(sinal) {
  await esperar(200, sinal)
  if (!sessao) throw new ErroApi('SEM_SESSAO', 401)
  return { usuario: sessao }
}

export async function recuperarSenha(email, sinal) {
  await esperar(900, sinal)
  falhaPorGatilho(email)
  return null
}

export async function novaSenha({ token, senha }, sinal) {
  await esperar(900, sinal)
  if (token === 'sem-conexao') throw new ErroApi('SEM_CONEXAO')
  if (token === 'vencido') throw new ErroApi('TOKEN_INVALIDO', 400)
  if (senha.length < 8) throw new ErroApi('VALIDACAO', 422, { senha: 'Senha curta.' })
  return null
}
