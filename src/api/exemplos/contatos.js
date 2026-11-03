import { ErroApi } from '../cliente.js'
import { esperar, gatilho } from './comum.js'

// Resposta de exemplo do POST /contatos. O protocolo é o do Figma.
// Pra ver os outros estados, use um destes e-mails:
//   sem-conexao@…  a API não responde
//   recusado@…     422 VALIDACAO no e-mail
//   muitas@…       429
export async function contatoDeExemplo(contato, sinal) {
  await esperar(900, sinal)
  const quem = gatilho(contato.email)
  if (quem === 'sem-conexao') throw new ErroApi('SEM_CONEXAO')
  if (quem === 'recusado') throw new ErroApi('VALIDACAO', 422, { email: 'E-mail inválido.' })
  if (quem === 'muitas') throw new ErroApi('MUITAS_TENTATIVAS', 429)
  return { protocolo: 'ULS20261246', criadoEm: new Date().toISOString() }
}
