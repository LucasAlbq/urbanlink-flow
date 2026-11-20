import { ErroApi, pedir, renomearCampos } from './cliente.js'

// POST /public/contact (docs/plano/04-api-e-dados.md, "Contato, login e senha"): 201 { protocol, createdAt }.
// A tela manda e recebe com os nomes do site; a tradução pros nomes da API fica aqui.
// Com VITE_USAR_EXEMPLOS=true responde com src/api/exemplos/contatos.js. A condição precisa
// ler import.meta.env aqui mesmo: o Vite troca pelo valor e o ramo some do build.
export async function enviarContato(contato, { sinal } = {}) {
  if (import.meta.env.VITE_USAR_EXEMPLOS === 'true') {
    const { contatoDeExemplo } = await import('./exemplos/contatos.js')
    return contatoDeExemplo(contato, sinal)
  }

  const corpo = {
    name: contato.nome,
    email: contato.email,
    ...(contato.telefone && { phone: contato.telefone }),
    ...(contato.empresa && { company: contato.empresa }),
    subject: contato.assunto,
    message: contato.mensagem,
    consent: contato.aceitouPrivacidade,
  }

  try {
    const { protocol, createdAt } = await pedir('/public/contact', { metodo: 'POST', corpo, sinal })
    return { protocolo: protocol, criadoEm: createdAt }
  } catch (falha) {
    // No 422, os campos recusados voltam com o nome que a tela usa no pedido.
    if (falha instanceof ErroApi && falha.campos) falha.campos = renomearCampos(falha.campos, NOME_NO_SITE)
    throw falha
  }
}

const NOME_NO_SITE = {
  name: 'nome',
  phone: 'telefone',
  company: 'empresa',
  subject: 'assunto',
  message: 'mensagem',
  consent: 'aceitouPrivacidade',
}
