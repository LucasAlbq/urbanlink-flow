import { useEffect, useRef, useState } from 'react'
import { Navigate, useParams } from 'react-router'

import { Botao } from '../components/Botao.jsx'
import { MiniEstrada } from '../components/MiniEstrada.jsx'
import { useTituloAba } from '../components/useTituloAba.js'
import css from './enviado/Enviado.module.css'

// Mensagem enviada parada (fase 1), prancha Contato-Enviado. Regras em
// docs/plano/03-telas-e-estados.md. O protocolo chega pela URL, vindo do 201 de POST /contatos.

const AVISO_MS = 2000 // "Protocolo copiado" por 2 s (igual a --aviso-copiado)

// Só letras, números e hífen: um link montado não consegue mostrar qualquer texto como protocolo.
const PROTOCOLO_VALIDO = /^[A-Za-z0-9-]{1,40}$/

export function Enviado() {
  const { protocolo } = useParams()
  const numero = useRef(null)
  // Conta os cliques: cada cópia reinicia os 2 s do aviso.
  const [copias, setCopias] = useState(0)

  useTituloAba('Mensagem enviada · UrbanLink Flow')

  useEffect(() => {
    if (!copias) return
    const fim = setTimeout(() => setCopias(0), AVISO_MS)
    return () => clearTimeout(fim)
  }, [copias])

  // Sem protocolo na URL, volta pro formulário.
  if (!protocolo || !PROTOCOLO_VALIDO.test(protocolo)) return <Navigate to="/contato" replace />

  async function copiar() {
    try {
      await navigator.clipboard.writeText(protocolo)
      setCopias((n) => n + 1)
    } catch {
      // Sem acesso à área de transferência: deixa o número selecionado pra copiar com Ctrl+C.
      const selecao = window.getSelection()
      const trecho = document.createRange()
      trecho.selectNodeContents(numero.current)
      selecao.removeAllRanges()
      selecao.addRange(trecho)
    }
  }

  return (
    <section className={css.corpo}>
      <meta name="robots" content="noindex" />
      <div className={css.dentro}>
        <div className={css.cartao}>
          <MiniEstrada correr />

          <div className={css.titulo}>
            <h1 tabIndex={-1} className={css.h1}>
              Mensagem enviada.
            </h1>
            <p className={css.apoio}>
              A equipe já recebeu e responde em até 48 horas, no e-mail que você informou.
            </p>
          </div>

          <div className={css.protocolo}>
            <p className={css.rotulo}>Número do protocolo</p>
            <p ref={numero} className={css.numero}>
              {protocolo}
            </p>
            <div className={css.copiar}>
              <Botao variante="link" className={css.link} onClick={copiar}>
                Copiar protocolo
              </Botao>
              <p role="status" className={css.aviso}>
                {copias ? 'Protocolo copiado' : ''}
              </p>
            </div>
            <p className={css.nota}>Guarde esse número pra acompanhar o seu pedido.</p>
          </div>

          <div className={css.acoes}>
            <Botao href="/" variante="noite" className={css.voltar}>
              Voltar para o início
            </Botao>
            <Botao href="/rastreamento" variante="link" className={css.link}>
              Rastrear uma entrega
            </Botao>
          </div>
        </div>
      </div>
    </section>
  )
}
