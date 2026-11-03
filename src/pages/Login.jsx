import { useEffect, useId, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router'

import { buscarEu, entrar } from '../api/auth.js'
import { AvisoFormulario } from '../components/AvisoFormulario.jsx'
import { Botao } from '../components/Botao.jsx'
import { Campo } from '../components/Campo.jsx'
import { MolduraLogin } from '../components/MolduraLogin.jsx'
import { useTituloAba } from '../components/useTituloAba.js'
import { useValidacao } from '../components/useValidacao.js'
import css from './login/Entrada.module.css'

// Entrar na plataforma, prancha Login. Estados e textos em docs/plano/03-telas-e-estados.md
// ("Login"); o pedido é o POST /auth/login de 04-api-e-dados.md.
// O login nunca diz se o erro foi no e-mail ou na senha.

const MENSAGENS = {
  email: 'Escreva seu e-mail.',
  senha: 'Escreva sua senha.',
}

const RESPOSTAS = {
  CREDENCIAIS_INVALIDAS: 'E-mail ou senha incorretos.',
  MUITAS_TENTATIVAS: 'Muitas tentativas seguidas. Espere 1 minuto e tente de novo.',
  FORA: 'Não deu pra entrar agora. Tente de novo em alguns segundos.',
}

// Aviso de quem acabou de criar a senha nova (NovaSenha navega pra cá com state.aviso).
const SENHA_NOVA_SALVA = 'Senha nova salva. Entre com ela.'

const REGRAS = {
  email: (v) => (v.email.trim() ? '' : MENSAGENS.email),
  senha: (v) => (v.senha ? '' : MENSAGENS.senha),
}

// ?volta= só aceita um endereço da plataforma (/app…): um link montado não leva pra fora do site.
function destinoDe(volta) {
  return volta && /^\/app(?:[/?#]|$)/.test(volta) ? volta : '/app'
}

function respostaDe(falha) {
  if (falha?.erro === 'CREDENCIAIS_INVALIDAS' || falha?.status === 401) return 'CREDENCIAIS_INVALIDAS'
  if (falha?.erro === 'MUITAS_TENTATIVAS' || falha?.status === 429) return 'MUITAS_TENTATIVAS'
  return 'FORA'
}

export function Login() {
  useTituloAba('Entrar · UrbanLink Flow')
  const navegar = useNavigate()
  const { state } = useLocation()
  const [busca] = useSearchParams()
  const destino = destinoDe(busca.get('volta'))
  const formulario = useRef(null)
  const montado = useRef(false)
  const idResposta = useId()
  const idSenhaNova = useId()

  const [valores, setValores] = useState({ email: '', senha: '', manterConectado: false })
  const [entrando, setEntrando] = useState(false)
  const [resposta, setResposta] = useState(null)
  const validacao = useValidacao(REGRAS)
  const { erros } = validacao
  const senhaNova = state?.aviso === 'senha-nova'

  // Já tem sessão: vai direto pra plataforma. Sem sessão (401) ou com a API fora, fica aqui.
  useEffect(() => {
    montado.current = true
    const controle = new AbortController()
    buscarEu({ sinal: controle.signal })
      .then(() => navegar(destino, { replace: true }))
      .catch(() => {})
    return () => {
      montado.current = false
      controle.abort()
    }
  }, [navegar, destino])

  function mudar(campo, valor) {
    const novos = { ...valores, [campo]: valor }
    setValores(novos)
    validacao.aoMudar(campo, novos)
  }

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

  async function aoEntrar(evento) {
    evento.preventDefault()
    if (entrando) return
    setResposta(null)

    const comErro = validacao.validarTudo(valores)
    if (comErro) {
      focar(comErro)
      return
    }

    setEntrando(true)
    try {
      await entrar({ email: valores.email.trim(), senha: valores.senha, manterConectado: valores.manterConectado })
      if (montado.current) navegar(destino, { replace: true })
    } catch (falha) {
      if (!montado.current) return
      const qual = respostaDe(falha)
      // 401: a senha é apagada e o foco volta pra ela. Nos outros, o foco fica no botão.
      flushSync(() => {
        setEntrando(false)
        setResposta(qual)
        if (qual === 'CREDENCIAIS_INVALIDAS') setValores((atuais) => ({ ...atuais, senha: '' }))
      })
      if (qual === 'CREDENCIAIS_INVALIDAS') focar('senha')
    }
  }

  return (
    <MolduraLogin>
      <meta name="robots" content="noindex" />
      <form ref={formulario} className={css.coluna} noValidate onSubmit={aoEntrar}>
        <div className={css.cabeca}>
          {/* O Layout leva o foco pro título ao chegar: quem usa leitor de tela ouve o aviso junto. */}
          <h1 tabIndex={-1} className={css.h1} aria-describedby={senhaNova ? idSenhaNova : undefined}>
            Entrar na plataforma
          </h1>
          <p className={css.apoio}>Use o e-mail e a senha que a sua empresa cadastrou pra você.</p>
        </div>

        {senhaNova && (
          <AvisoFormulario id={idSenhaNova} vivo={false}>
            {SENHA_NOVA_SALVA}
          </AvisoFormulario>
        )}

        <Campo
          label="E-mail"
          tipo="email"
          autoComplete="username"
          placeholder="voce@empresa.com.br"
          obrigatorio
          erro={erros.email}
          {...ligar('email')}
        />
        <Campo
          label="Senha"
          tipo="password"
          autoComplete="current-password"
          mostrarSenha
          obrigatorio
          erro={erros.senha}
          aria-describedby={resposta === 'CREDENCIAIS_INVALIDAS' ? idResposta : undefined}
          {...ligar('senha')}
        />

        <div className={css.linha}>
          <Campo
            tipo="checkbox"
            name="manterConectado"
            label="Manter conectado"
            checked={valores.manterConectado}
            onChange={(evento) => mudar('manterConectado', evento.target.checked)}
          />
          <Link to="/recuperar-senha" className={css.link}>
            Esqueci minha senha
          </Link>
        </div>

        <AvisoFormulario id={idResposta}>{resposta && RESPOSTAS[resposta]}</AvisoFormulario>

        <Botao type="submit" variante="noite" className={css.botao} carregando={entrando}>
          {entrando ? 'Entrando…' : 'Entrar'}
        </Botao>

        <p className={`${css.acesso} ${css.respiro}`}>
          Ainda não tem acesso?{' '}
          <Link to="/contato" className={css.link}>
            Fale com a gente
          </Link>
        </p>
      </form>
    </MolduraLogin>
  )
}
