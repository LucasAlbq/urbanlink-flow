import { useState } from 'react'
import { Link } from 'react-router'

import { Botao } from '../components/Botao.jsx'
import { Campo } from '../components/Campo.jsx'
import { Estrada } from '../components/estrada/Estrada.jsx'
import { useTituloAba } from '../components/useTituloAba.js'
import css from './contato/Contato.module.css'

// Fale com a gente parado (fase 1), prancha Contato. Regras dos campos em
// docs/plano/03-telas-e-estados.md. A validação e o envio (POST /contatos) entram na fase 2.

const ASSUNTOS = ['Pedir um orçamento', 'Dúvida sobre uma entrega', 'Parceria', 'Outro assunto']

const LIMITE_EMPRESA = 120
const LIMITE_MENSAGEM = 1000
const CONTADOR_A_PARTIR_DE = 800
const numero = new Intl.NumberFormat('pt-BR')

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

// Fase 2: erros da validação e do 422, um por campo (nome, email, telefone, mensagem, privacidade).
const SEM_ERROS = {}

export function Contato() {
  useTituloAba('Fale com a gente · UrbanLink Flow')
  const erros = SEM_ERROS
  const [caracteres, setCaracteres] = useState(0)

  const contador =
    caracteres >= CONTADOR_A_PARTIR_DE
      ? `${numero.format(caracteres)} de ${numero.format(LIMITE_MENSAGEM)} caracteres`
      : undefined

  // Fase 1: nada é enviado (nem pra URL, nem pra API).
  function enviar(evento) {
    evento.preventDefault()
  }

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
            <form className={css.cartao} noValidate onSubmit={enviar} aria-labelledby="envie-sua-mensagem">
              <h2 id="envie-sua-mensagem" className={`${css.h2} ${css.h2Cartao}`}>
                Envie sua mensagem
              </h2>
              <div className={css.dois}>
                <Campo label="Nome completo" name="nome" autoComplete="name" obrigatorio erro={erros.nome} />
                <Campo label="E-mail" tipo="email" name="email" autoComplete="email" obrigatorio erro={erros.email} />
                <Campo
                  label="Telefone"
                  tipo="tel"
                  name="telefone"
                  autoComplete="tel"
                  inputMode="tel"
                  opcional
                  erro={erros.telefone}
                />
                <Campo
                  label="Empresa"
                  name="empresa"
                  autoComplete="organization"
                  maxLength={LIMITE_EMPRESA}
                  opcional
                />
              </div>
              <Campo label="Assunto" tipo="select" name="assunto" defaultValue={ASSUNTOS[0]}>
                {ASSUNTOS.map((assunto) => (
                  <option key={assunto}>{assunto}</option>
                ))}
              </Campo>
              <Campo
                label="Mensagem"
                tipo="textarea"
                name="mensagem"
                placeholder="Conte o que a sua operação precisa."
                maxLength={LIMITE_MENSAGEM}
                obrigatorio
                erro={erros.mensagem}
                ajuda={contador}
                onChange={(evento) => setCaracteres(evento.target.value.length)}
              />
              <Campo
                tipo="checkbox"
                name="privacidade"
                obrigatorio
                erro={erros.privacidade}
                label={
                  <>
                    Li e concordo com a{' '}
                    <Link to="/privacidade" className={css.linkPolitica}>
                      Política de Privacidade
                    </Link>
                  </>
                }
              />
              <div>
                <Botao type="submit" variante="noite" className={css.enviar}>
                  Enviar mensagem
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
