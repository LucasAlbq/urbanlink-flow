import { useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router'

import { enviarContato } from '../api/contatos.js'
import { AvisoFormulario } from '../components/AvisoFormulario.jsx'
import { Botao } from '../components/Botao.jsx'
import { Campo } from '../components/Campo.jsx'
import { Estrada } from '../components/estrada/Estrada.jsx'
import { useTituloAba } from '../components/useTituloAba.js'
import { useValidacao } from '../components/useValidacao.js'
import css from './contato/Contato.module.css'
import { digitos, formatarTelefone, posicaoDoCursor } from './contato/telefone.js'

// Fale com a gente, prancha Contato. Regras, textos e estados em docs/plano/03-telas-e-estados.md
// ("Fale com a gente e mensagem enviada"); o pedido é o POST /contatos de 04-api-e-dados.md.

// O valor de cada opção é o `assunto` que a API espera.
const ASSUNTOS = [
  { valor: 'ORCAMENTO', texto: 'Pedir um orçamento' },
  { valor: 'DUVIDA_ENTREGA', texto: 'Dúvida sobre uma entrega' },
  { valor: 'PARCERIA', texto: 'Parceria' },
  { valor: 'OUTRO', texto: 'Outro assunto' },
]

const LIMITE_EMPRESA = 120
const MINIMO_MENSAGEM = 10
const LIMITE_MENSAGEM = 1000
const CONTADOR_A_PARTIR_DE = 800
const numero = new Intl.NumberFormat('pt-BR')

const MENSAGENS = {
  nome: 'Escreva seu nome.',
  email: 'Escreva um e-mail válido, como voce@empresa.com.br.',
  telefone: 'Confira o telefone com o DDD.',
  mensagem: 'Conte um pouco mais, pelo menos uma frase.',
  privacidade: 'Pra enviar, é preciso concordar com a Política de Privacidade.',
}
const SEM_RESPOSTA = 'Não deu pra enviar agora. Sua mensagem continua aqui: é só tentar de novo.'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const letras = (texto) => (texto.match(/\p{L}/gu) ?? []).length

// Na ordem dos campos na tela: o foco vai pro primeiro com erro.
const REGRAS = {
  nome: (v) => (letras(v.nome) >= 3 ? '' : MENSAGENS.nome),
  email: (v) => (EMAIL.test(v.email.trim()) ? '' : MENSAGENS.email),
  telefone: (v) => ([0, 10, 11].includes(digitos(v.telefone).length) ? '' : MENSAGENS.telefone),
  mensagem: (v) => {
    const tamanho = v.mensagem.trim().length
    return tamanho >= MINIMO_MENSAGEM && tamanho <= LIMITE_MENSAGEM ? '' : MENSAGENS.mensagem
  },
  privacidade: (v) => (v.privacidade ? '' : MENSAGENS.privacidade),
}

// Nome do campo no corpo do pedido → nome do campo na tela (pro 422).
const CAMPO_DA_API = {
  nome: 'nome',
  email: 'email',
  telefone: 'telefone',
  mensagem: 'mensagem',
  aceitouPrivacidade: 'privacidade',
}

const VAZIO = {
  nome: '',
  email: '',
  telefone: '',
  empresa: '',
  assunto: ASSUNTOS[0].valor,
  mensagem: '',
  privacidade: false,
}

// As quatro etapas da contratação. Textos da prancha Contato.
const CONTRATACAO = [
  { id: 'solicitacao', nome: 'Solicitação', texto: 'Você conta o que a sua operação precisa.' },
  { id: 'proposta', nome: 'Proposta', texto: 'A equipe envia uma solução sob medida, com condições e prazos.' },
  { id: 'acordo', nome: 'Acordo', texto: 'As duas empresas alinham as expectativas.' },
  { id: 'contratacao', nome: 'Contratação', texto: 'Tudo formalizado, a operação começa.' },
]

const ETAPAS = CONTRATACAO.map((etapa, i) => ({
  id: etapa.id,
  placa: { numero: i + 1, nome: etapa.nome, glifo: 'seta', tamanho: 'pequeno' },
  conteudo: <p className={css.etapaTexto}>{etapa.texto}</p>,
}))

// O corpo do POST /contatos. Opcionais vazios não vão; o telefone vai só com os números.
function corpoDoPedido(v) {
  const telefone = digitos(v.telefone)
  const empresa = v.empresa.trim()
  return {
    nome: v.nome.trim(),
    email: v.email.trim(),
    ...(telefone && { telefone }),
    ...(empresa && { empresa }),
    assunto: v.assunto,
    mensagem: v.mensagem.trim(),
    aceitouPrivacidade: true,
  }
}

export function Contato() {
  useTituloAba('Fale com a gente · UrbanLink Flow')
  const navegar = useNavigate()
  const formulario = useRef(null)
  const telefone = useRef(null)
  const cursorDoTelefone = useRef(null)
  const montado = useRef(false)
  const idAviso = useId()

  const [valores, setValores] = useState(VAZIO)
  const [enviando, setEnviando] = useState(false)
  const [erroEnvio, setErroEnvio] = useState('')
  const validacao = useValidacao(REGRAS)
  const { erros } = validacao

  // A resposta pode chegar depois que a pessoa saiu da página: aí ela não leva pra lugar nenhum.
  useEffect(() => {
    montado.current = true
    return () => {
      montado.current = false
    }
  }, [])

  // Depois de a máscara reescrever o telefone, o cursor volta pro lugar certo.
  useLayoutEffect(() => {
    if (cursorDoTelefone.current === null) return
    telefone.current?.setSelectionRange(cursorDoTelefone.current, cursorDoTelefone.current)
    cursorDoTelefone.current = null
  })

  function mudar(campo, valor) {
    const novos = { ...valores, [campo]: valor }
    setValores(novos)
    validacao.aoMudar(campo, novos)
  }

  function mudarTelefone(evento) {
    const { value, selectionStart } = evento.target
    const formatado = formatarTelefone(value)
    cursorDoTelefone.current = posicaoDoCursor(formatado, digitos(value.slice(0, selectionStart)).length)
    mudar('telefone', formatado)
  }

  // Liga um campo ao estado: valor, mudança e saída.
  function ligar(campo) {
    return {
      name: campo,
      value: valores[campo],
      onChange: (evento) => mudar(campo, evento.target.value),
      onBlur: () => validacao.aoSair(campo, valores),
    }
  }

  function focar(campo) {
    formulario.current?.elements.namedItem(campo)?.focus()
  }

  async function enviar(evento) {
    evento.preventDefault()
    if (enviando) return
    setErroEnvio('')

    const comErro = validacao.validarTudo(valores)
    if (comErro) {
      focar(comErro)
      return
    }

    setEnviando(true)
    try {
      const { protocolo } = await enviarContato(corpoDoPedido(valores))
      if (montado.current) navegar(`/contato/enviado/${encodeURIComponent(protocolo)}`)
    } catch (falha) {
      if (!montado.current) return
      setEnviando(false)
      const recusados = falha?.status === 422 ? errosDaApi(falha.campos) : {}
      const campo = Object.keys(recusados).length ? validacao.mostrar(recusados) : undefined
      if (campo) focar(campo)
      else setErroEnvio(SEM_RESPOSTA)
    }
  }

  const caracteres = valores.mensagem.length
  const contador =
    caracteres >= CONTADOR_A_PARTIR_DE
      ? `${numero.format(caracteres)} de ${numero.format(LIMITE_MENSAGEM)} caracteres`
      : undefined

  return (
    <>
      <section className={css.topo}>
        <div className={css.topoDentro}>
          <h1 tabIndex={-1} className={css.h1}>
            Fale com a gente.
          </h1>
          <p className={css.apoio}>
            Pra pedir um orçamento, tirar uma dúvida sobre uma entrega ou propor uma parceria. A equipe
            responde em até 48 horas.
          </p>
        </div>
      </section>

      <section className={css.corpo}>
        <div className={css.dentro}>
          <div className={css.split}>
            <form
              ref={formulario}
              className={css.cartao}
              noValidate
              onSubmit={enviar}
              aria-labelledby="envie-sua-mensagem"
            >
              <h2 id="envie-sua-mensagem" className={`${css.h2} ${css.h2Cartao}`}>
                Envie sua mensagem
              </h2>
              <div className={css.dois}>
                <Campo label="Nome completo" autoComplete="name" obrigatorio erro={erros.nome} {...ligar('nome')} />
                <Campo
                  label="E-mail"
                  tipo="email"
                  autoComplete="email"
                  obrigatorio
                  erro={erros.email}
                  {...ligar('email')}
                />
                <Campo
                  ref={telefone}
                  label="Telefone"
                  tipo="tel"
                  autoComplete="tel"
                  inputMode="tel"
                  opcional
                  erro={erros.telefone}
                  {...ligar('telefone')}
                  onChange={mudarTelefone}
                />
                <Campo
                  label="Empresa"
                  autoComplete="organization"
                  maxLength={LIMITE_EMPRESA}
                  opcional
                  {...ligar('empresa')}
                />
              </div>
              <Campo label="Assunto" tipo="select" {...ligar('assunto')}>
                {ASSUNTOS.map((assunto) => (
                  <option key={assunto.valor} value={assunto.valor}>
                    {assunto.texto}
                  </option>
                ))}
              </Campo>
              <Campo
                label="Mensagem"
                tipo="textarea"
                placeholder="Conte o que a sua operação precisa."
                maxLength={LIMITE_MENSAGEM}
                obrigatorio
                erro={erros.mensagem}
                ajuda={contador}
                {...ligar('mensagem')}
              />
              <Campo
                tipo="checkbox"
                obrigatorio
                erro={erros.privacidade}
                name="privacidade"
                checked={valores.privacidade}
                onChange={(evento) => mudar('privacidade', evento.target.checked)}
                onBlur={() => validacao.aoSair('privacidade', valores)}
                label={
                  <>
                    Li e concordo com a{' '}
                    <Link to="/privacidade" className={css.linkPolitica}>
                      Política de Privacidade
                    </Link>
                  </>
                }
              />
              <AvisoFormulario id={idAviso}>{erroEnvio}</AvisoFormulario>
              <div>
                <Botao type="submit" variante="noite" className={css.enviar} carregando={enviando}>
                  {enviando ? 'Enviando…' : 'Enviar mensagem'}
                </Botao>
              </div>
            </form>

            <div className={css.lado}>
              <div className={css.ladoCabeca}>
                <h2 className={css.h2}>Como funciona a contratação</h2>
                <p className={css.ladoApoio}>Do primeiro contato até a operação rodando.</p>
              </div>
              <Estrada etapas={ETAPAS} orientacao="vertical" aria-label="Etapas da contratação" />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

// 422: põe a mensagem da tela embaixo de cada campo que a API recusou (o texto da API é ignorado).
function errosDaApi(campos) {
  const recusados = {}
  for (const nome of Object.keys(campos ?? {})) {
    const campo = CAMPO_DA_API[nome]
    if (campo) recusados[campo] = MENSAGENS[campo]
  }
  return recusados
}
