import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router'

import { Botao } from '../components/Botao.jsx'
import { Campo } from '../components/Campo.jsx'
import { Lacuna } from '../components/Lacuna.jsx'
import { MiniEstrada } from '../components/MiniEstrada.jsx'
import { MolduraLogin } from '../components/MolduraLogin.jsx'
import { useTituloAba } from '../components/useTituloAba.js'
import css from './login/Entrada.module.css'

// Recuperar senha parado (fase 1), pranchas Recuperar-Senha e Recuperar-Senha-Enviado.
// Uma rota, dois estados: pedir o link e "link enviado". O aviso nunca diz se a conta existe
// (docs/plano/03-telas-e-estados.md). O POST /auth/recuperar-senha entra na fase 2.
export function RecuperarSenha() {
  useTituloAba('Recuperar senha · UrbanLink Flow')
  // Fase 2: vira true quando a API responde ao pedido do link.
  const [enviado, setEnviado] = useState(false)
  const titulo = useRef(null)
  const trocou = useRef(false)

  // Ao trocar de estado, o foco vai pro título novo (na primeira carga quem cuida é o Layout).
  useEffect(() => {
    if (trocou.current) titulo.current?.focus()
    trocou.current = true
  }, [enviado])

  // Fase 1: nada é enviado (nem pra URL, nem pra API).
  function pedirLink(evento) {
    evento.preventDefault()
  }

  return (
    <MolduraLogin voltarPara="/login" textoVoltar="Voltar para o login">
      <meta name="robots" content="noindex" />
      {enviado ? (
        <LinkEnviado titulo={titulo} aoPedirOutro={() => setEnviado(false)} />
      ) : (
        <PedirLink titulo={titulo} aoEnviar={pedirLink} />
      )}
    </MolduraLogin>
  )
}

function PedirLink({ titulo, aoEnviar }) {
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
      <form className={css.campos} noValidate onSubmit={aoEnviar}>
        <Campo
          label="E-mail"
          tipo="email"
          name="email"
          autoComplete="email"
          placeholder="voce@empresa.com.br"
          obrigatorio
        />
        <Botao type="submit" variante="noite" className={css.botao}>
          Enviar link
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
