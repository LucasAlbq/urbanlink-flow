import { Botao } from '../components/Botao.jsx'
import { Campo } from '../components/Campo.jsx'
import { MolduraLogin } from '../components/MolduraLogin.jsx'
import { useTituloAba } from '../components/useTituloAba.js'
import css from './login/Entrada.module.css'

// Senha nova parada (fase 1), prancha Nova-Senha. Regras em docs/plano/03-telas-e-estados.md:
// pelo menos 8 caracteres e os dois campos iguais ("As senhas não são iguais."). Link vencido,
// a gravação e o aviso no login entram na fase 2, com a API.
const MINIMO = 8

// Fase 2: "As senhas não são iguais." e as respostas da API.
const SEM_ERROS = {}

export function NovaSenha() {
  useTituloAba('Criar senha nova · UrbanLink Flow')
  const erros = SEM_ERROS

  // Fase 1: nada é enviado (nem pra URL, nem pra API).
  function salvar(evento) {
    evento.preventDefault()
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
        <form className={css.campos} noValidate onSubmit={salvar}>
          <Campo
            label="Senha nova"
            tipo="password"
            name="senha"
            autoComplete="new-password"
            minLength={MINIMO}
            mostrarSenha
            obrigatorio
            ajuda="Pelo menos 8 caracteres."
            erro={erros.senha}
            className={css.ajudaCurta}
          />
          <Campo
            label="Repita a senha nova"
            tipo="password"
            name="repeticao"
            autoComplete="new-password"
            mostrarSenha
            obrigatorio
            erro={erros.repeticao}
          />
          <Botao type="submit" variante="noite" className={css.botao}>
            Salvar senha nova
          </Botao>
        </form>
      </div>
    </MolduraLogin>
  )
}
