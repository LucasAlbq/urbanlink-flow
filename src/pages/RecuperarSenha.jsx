import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'

import { pedirLinkSenha } from '../api/auth.js'
import { AvisoFormulario } from '../components/AvisoFormulario.jsx'
import { Botao } from '../components/Botao.jsx'
import { Campo } from '../components/Campo.jsx'
import { Lacuna } from '../components/Lacuna.jsx'
import { MiniEstrada } from '../components/MiniEstrada.jsx'
import { MolduraLogin } from '../components/MolduraLogin.jsx'
import { useTituloAba } from '../components/useTituloAba.js'
import { useValidacao } from '../components/useValidacao.js'
import css from './login/Entrada.module.css'

// Recuperar senha, pranchas Recuperar-Senha e Recuperar-Senha-Enviado. Uma rota, dois estados:
// pedir o link e "link enviado". O aviso nunca diz se a conta existe
// (docs/plano/03-telas-e-estados.md); o pedido é o POST /auth/recuperar-senha de 04-api-e-dados.md.

// Os dois erros do campo são os mesmos textos do login e do contato.
const MENSAGENS = {
  vazio: 'Escreva seu e-mail.',
  invalido: 'Escreva um e-mail válido, como voce@empresa.com.br.',
}

// O 429 usa o texto do login. A API fora não tem texto no plano: segue o do login.
const RESPOSTAS = {
  MUITAS_TENTATIVAS: 'Muitas tentativas seguidas. Espere 1 minuto e tente de novo.',
  FORA: 'Não deu pra enviar o link agora. Tente de novo em alguns segundos.',
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const REGRAS = {
  email: (v) => {
    const email = v.email.trim()
    if (!email) return MENSAGENS.vazio
    return EMAIL.test(email) ? '' : MENSAGENS.invalido
  },
}

export function RecuperarSenha() {
  useTituloAba('Recuperar senha · UrbanLink Flow')
  const [enviado, setEnviado] = useState(false)
  // Fica aqui em cima pra continuar preenchido se a pessoa pedir outro link.
  const [email, setEmail] = useState('')
  const titulo = useRef(null)
  const trocou = useRef(false)

  // Ao trocar de estado, o foco vai pro título novo (na primeira carga quem cuida é o Layout).
  useEffect(() => {
    if (trocou.current) titulo.current?.focus()
    trocou.current = true
  }, [enviado])

  return (
    <MolduraLogin voltarPara="/login" textoVoltar="Voltar para o login">
      <meta name="robots" content="noindex" />
      {enviado ? (
        <LinkEnviado titulo={titulo} aoPedirOutro={() => setEnviado(false)} />
      ) : (
        <PedirLink titulo={titulo} email={email} aoMudarEmail={setEmail} aoEnviar={() => setEnviado(true)} />
      )}
    </MolduraLogin>
  )
}

function PedirLink({ titulo, email, aoMudarEmail, aoEnviar }) {
  const campo = useRef(null)
  const montado = useRef(false)
  const [enviando, setEnviando] = useState(false)
  const [resposta, setResposta] = useState(null)
  const validacao = useValidacao(REGRAS)

  useEffect(() => {
    montado.current = true
    return () => {
      montado.current = false
    }
  }, [])

  async function enviar(evento) {
    evento.preventDefault()
    if (enviando) return
    setResposta(null)

    if (validacao.validarTudo({ email })) {
      campo.current?.focus()
      return
    }

    setEnviando(true)
    try {
      await pedirLinkSenha(email.trim())
      if (montado.current) aoEnviar()
    } catch (falha) {
      if (!montado.current) return
      setEnviando(false)
      const muitas = falha?.erro === 'MUITAS_TENTATIVAS' || falha?.status === 429
      setResposta(muitas ? 'MUITAS_TENTATIVAS' : 'FORA')
    }
  }

  return (
    <div className={css.coluna}>
      <div className={css.cabeca}>
        <h1 ref={titulo} tabIndex={-1} className={css.h1}>
          Criar uma senha nova
        </h1>
        <p className={`${css.apoio} ${css.equilibrado}`}>
          Digite o e-mail da sua conta. Se ele estiver cadastrado, a gente manda um link pra criar uma senha
          nova.
        </p>
      </div>
      <form className={css.campos} noValidate onSubmit={enviar}>
        <Campo
          ref={campo}
          label="E-mail"
          tipo="email"
          name="email"
          autoComplete="email"
          placeholder="voce@empresa.com.br"
          obrigatorio
          erro={validacao.erros.email}
          value={email}
          onChange={(evento) => {
            aoMudarEmail(evento.target.value)
            validacao.aoMudar('email', { email: evento.target.value })
          }}
          onBlur={() => validacao.aoSair('email', { email })}
        />
        <AvisoFormulario>{resposta && RESPOSTAS[resposta]}</AvisoFormulario>
        <Botao type="submit" variante="noite" className={css.botao} carregando={enviando}>
          {enviando ? 'Enviando…' : 'Enviar link'}
        </Botao>
      </form>
      <p className={css.acesso}>
        Lembrou a senha?{' '}
        <Link to="/login" className={css.link}>
          Voltar para o login
        </Link>
      </p>
    </div>
  )
}

function LinkEnviado({ titulo, aoPedirOutro }) {
  return (
    <div className={css.coluna}>
      <MiniEstrada pacote={190} tamanho="pequeno" />
      <div className={css.cabeca}>
        <h1 ref={titulo} tabIndex={-1} className={css.h1}>
          Confira seu e-mail
        </h1>
        <p className={`${css.apoio} ${css.equilibrado}`}>
          Se esse e-mail tiver uma conta, o link pra criar uma senha nova já está a caminho. Ele vale por{' '}
          <Lacuna>[tempo a definir]</Lacuna>.
        </p>
      </div>
      <p className={css.texto}>Não chegou em alguns minutos? Olhe a caixa de spam ou peça outro link.</p>
      <Botao href="/login" variante="noite" className={css.botao}>
        Voltar para o login
      </Botao>
      <Botao variante="link" className={`${css.link} ${css.sozinho}`} onClick={aoPedirOutro}>
        Pedir outro link
      </Botao>
    </div>
  )
}
