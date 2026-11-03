import { Link } from 'react-router'

import { Botao } from '../components/Botao.jsx'
import { Campo } from '../components/Campo.jsx'
import { MolduraLogin } from '../components/MolduraLogin.jsx'
import { useTituloAba } from '../components/useTituloAba.js'
import css from './login/Login.module.css'

// Entrar na plataforma parado (fase 1), prancha Login. Estados em docs/plano/03-telas-e-estados.md.
// Os erros, o "Entrando…" e o POST /auth/login entram na fase 2.

// Fase 2: "Escreva seu e-mail." / "Escreva sua senha." e as respostas da API.
const SEM_ERROS = {}

export function Login() {
  useTituloAba('Entrar · UrbanLink Flow')
  const erros = SEM_ERROS

  // Fase 1: nada é enviado (nem pra URL, nem pra API).
  function entrar(evento) {
    evento.preventDefault()
  }

  return (
    <MolduraLogin>
      <meta name="robots" content="noindex" />
      <form className={css.form} noValidate onSubmit={entrar}>
        <div className={css.cabeca}>
          <h1 tabIndex={-1} className={css.h1}>
            Entrar na plataforma
          </h1>
          <p className={css.apoio}>Use o e-mail e a senha que a sua empresa cadastrou pra você.</p>
        </div>

        <Campo
          label="E-mail"
          tipo="email"
          name="email"
          autoComplete="username"
          placeholder="voce@empresa.com.br"
          obrigatorio
          erro={erros.email}
        />
        <Campo
          label="Senha"
          tipo="password"
          name="senha"
          autoComplete="current-password"
          mostrarSenha
          obrigatorio
          erro={erros.senha}
        />

        <div className={css.linha}>
          <Campo tipo="checkbox" name="manterConectado" label="Manter conectado" />
          <Link to="/recuperar-senha" className={css.link}>
            Esqueci minha senha
          </Link>
        </div>

        <Botao type="submit" variante="noite" className={css.entrar}>
          Entrar
        </Botao>

        <p className={css.acesso}>
          Ainda não tem acesso?{' '}
          <Link to="/contato" className={css.link}>
            Fale com a gente
          </Link>
        </p>
      </form>
    </MolduraLogin>
  )
}
