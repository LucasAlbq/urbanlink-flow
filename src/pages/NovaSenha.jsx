import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router'

import { salvarSenhaNova } from '../api/auth.js'
import { AvisoFormulario } from '../components/AvisoFormulario.jsx'
import { Botao } from '../components/Botao.jsx'
import { Campo } from '../components/Campo.jsx'
import { MolduraLogin } from '../components/MolduraLogin.jsx'
import { useTituloAba } from '../components/useTituloAba.js'
import { useValidacao } from '../components/useValidacao.js'
import css from './login/Entrada.module.css'

// Senha nova, prancha Nova-Senha. Regras em docs/plano/03-telas-e-estados.md: pelo menos
// 8 caracteres e os dois campos iguais. O pedido é o POST /auth/nova-senha de 04-api-e-dados.md,
// com o token que veio no link do e-mail. Depois de salvar, o login mostra
// "Senha nova salva. Entre com ela.".
const MINIMO = 8

// "Use pelo menos 8 caracteres." e "Salvando…" não estão no plano (só a regra): seguem a ajuda
// do campo e o "Enviando…" do contato.
const MENSAGENS = {
  senha: 'Use pelo menos 8 caracteres.',
  repeticao: 'As senhas não são iguais.',
}
const FORA = 'Não deu pra salvar agora. Tente de novo em alguns segundos.'
const VENCIDO = 'Esse link não vale mais. Peça outro.'

const REGRAS = {
  senha: (v) => (v.senha.length >= MINIMO ? '' : MENSAGENS.senha),
  repeticao: (v) => (v.repeticao === v.senha ? '' : MENSAGENS.repeticao),
}

export function NovaSenha() {
  useTituloAba('Criar senha nova · UrbanLink Flow')
  const { token } = useParams()
  // Outro token é outro link: a tela começa do zero (inclusive o "link vencido").
  return <SenhaNova key={token} token={token} />
}

function SenhaNova({ token }) {
  const navegar = useNavigate()
  const formulario = useRef(null)
  const titulo = useRef(null)
  const montado = useRef(false)

  const [valores, setValores] = useState({ senha: '', repeticao: '' })
  const [salvando, setSalvando] = useState(false)
  const [erroEnvio, setErroEnvio] = useState('')
  const [vencido, setVencido] = useState(false)
  const validacao = useValidacao(REGRAS)
  const { erros } = validacao

  useEffect(() => {
    montado.current = true
    return () => {
      montado.current = false
    }
  }, [])

  // Link vencido: a tela troca e o foco vai pro título novo.
  useEffect(() => {
    if (vencido) titulo.current?.focus()
  }, [vencido])

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

  async function salvar(evento) {
    evento.preventDefault()
    if (salvando) return
    setErroEnvio('')

    const comErro = validacao.validarTudo(valores)
    if (comErro) {
      focar(comErro)
      return
    }

    setSalvando(true)
    try {
      await salvarSenhaNova({ token, senha: valores.senha })
      // replace: o link com o token (que já foi usado) não fica no histórico.
      if (montado.current) navegar('/login', { replace: true, state: { aviso: 'senha-nova' } })
    } catch (falha) {
      if (!montado.current) return
      setSalvando(false)
      if (falha?.erro === 'TOKEN_INVALIDO' || falha?.status === 400) setVencido(true)
      else if (falha?.status === 422 && falha.campos?.senha) focar(validacao.mostrar({ senha: MENSAGENS.senha }))
      else setErroEnvio(FORA)
    }
  }

  if (vencido) {
    return (
      <MolduraLogin voltarPara="/login" textoVoltar="Voltar para o login">
        <meta name="robots" content="noindex" />
        <div className={css.coluna}>
          <div className={css.cabeca}>
            <h1 ref={titulo} tabIndex={-1} className={css.h1}>
              {VENCIDO}
            </h1>
          </div>
          <Botao href="/recuperar-senha" variante="noite" className={css.botao}>
            Pedir outro link
          </Botao>
        </div>
      </MolduraLogin>
    )
  }

  return (
    <MolduraLogin voltarPara="/login" textoVoltar="Voltar para o login">
      <meta name="robots" content="noindex" />
      <div className={css.coluna}>
        <div className={css.cabeca}>
          <h1 tabIndex={-1} className={css.h1}>
            Crie sua senha nova
          </h1>
          <p className={`${css.apoio} ${css.equilibrado}`}>
            Depois de salvar, é só entrar com o e-mail de sempre e a senha nova.
          </p>
        </div>
        <form ref={formulario} className={css.campos} noValidate onSubmit={salvar}>
          {/* Com o erro na tela, a ajuda sai: as duas diriam a mesma coisa. */}
          <Campo
            label="Senha nova"
            tipo="password"
            autoComplete="new-password"
            minLength={MINIMO}
            mostrarSenha
            rotuloOlho="Mostrar senha nova"
            obrigatorio
            ajuda={erros.senha ? undefined : 'Pelo menos 8 caracteres.'}
            erro={erros.senha}
            className={css.ajudaCurta}
            {...ligar('senha')}
          />
          <Campo
            label="Repita a senha nova"
            tipo="password"
            autoComplete="new-password"
            mostrarSenha
            rotuloOlho="Mostrar senha repetida"
            obrigatorio
            erro={erros.repeticao}
            {...ligar('repeticao')}
          />
          <AvisoFormulario>{erroEnvio}</AvisoFormulario>
          <Botao type="submit" variante="noite" className={css.botao} carregando={salvando}>
            {salvando ? 'Salvando…' : 'Salvar senha nova'}
          </Botao>
        </form>
      </div>
    </MolduraLogin>
  )
}
