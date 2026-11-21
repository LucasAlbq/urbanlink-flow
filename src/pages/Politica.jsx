import { Link, useLocation } from 'react-router'

import { useTituloAba } from '../components/useTituloAba.js'
import css from './politica/Politica.module.css'

// Política de Privacidade (prancha Politica). O texto é o rascunho da prancha: as lacunas
// entre colchetes o grupo preenche antes de publicar (docs/plano/03-telas-e-estados.md).
const SECOES = [
  {
    id: 'quem',
    titulo: 'Quem somos',
    texto: [
      'A UrbanLink Systems é uma empresa fictícia, criada pra um projeto acadêmico do curso de Desenvolvimento de Sistemas. Esta política explica como o site da UrbanLink Flow trata os dados de quem usa.',
    ],
  },
  {
    id: 'dados',
    titulo: 'Que dados o site coleta',
    texto: [
      <>
        <strong>No Fale com a gente:</strong> nome, e-mail, assunto e mensagem. Telefone e empresa só se você
        preencher.
      </>,
      <>
        <strong>No login:</strong> e-mail e senha. A senha nunca é guardada em texto aberto.
      </>,
      <>
        <strong>No rastreamento:</strong> o código que você digita, só pra fazer a busca.
      </>,
      'O site não pede localização, documentos nem acesso à câmera.',
    ],
  },
  {
    id: 'uso',
    titulo: 'Pra que usamos',
    texto: [
      'Pra responder a sua mensagem ou pedido de orçamento, pra você entrar na plataforma e continuar conectado, e pra mostrar onde está a sua entrega.',
      'Não vendemos nem emprestamos seus dados pra ninguém.',
    ],
  },
  {
    id: 'cookies',
    titulo: 'Cookies',
    texto: [
      'O site usa um único cookie, o da sessão de login, que é necessário pra plataforma funcionar. Não há cookies de propaganda nem de estatística.',
    ],
  },
  {
    id: 'tempo',
    titulo: 'Por quanto tempo guardamos',
    texto: [
      <>
        As mensagens do Fale com a gente ficam guardadas por 12 meses. Os
        dados de login ficam guardados enquanto a conta existir.
      </>,
    ],
  },
  {
    id: 'direitos',
    titulo: 'Seus direitos',
    texto: [
      'Pela Lei Geral de Proteção de Dados (Lei 13.709/2018), você pode pedir, entre outras coisas, pra confirmar se temos dados seus, ver esses dados, corrigir o que estiver errado, apagar o que não for mais necessário e saber com quem eles foram compartilhados.',
    ],
  },
  {
    id: 'pedir',
    titulo: 'Como fazer um pedido',
    texto: [
      <>
        Use o{' '}
        <Link to="/contato" className={css.link}>
          Fale com a gente
        </Link>{' '}
        e escolha o assunto "Outro assunto", ou escreva pra{' '}
        <a href="mailto:contato@urbanlink.com" className={css.link}>
          contato@urbanlink.com
        </a>
        .
      </>,
    ],
  },
]

export function Politica() {
  useTituloAba('Política de Privacidade · UrbanLink Flow')
  // O item marcado do índice segue a âncora da URL; sem âncora, o primeiro.
  const { hash } = useLocation()
  const atual = SECOES.find((secao) => `#${secao.id}` === hash)?.id ?? SECOES[0].id

  return (
    <>
      <section className={css.topo}>
        <div className={css.topoDentro}>
          <h1 tabIndex={-1} className={css.h1}>
            Política de Privacidade
          </h1>
          <p className={css.apoio}>Quais dados o site coleta, pra quê, e o que você pode pedir.</p>
          <p className={css.data}>
            Última atualização: <time dateTime="2026-11-20">20 de novembro de 2026</time>
          </p>
        </div>
      </section>

      <section className={css.corpo} aria-label="Texto da política">
        <div className={css.dentro}>
          <div className={css.grade}>
            <nav aria-labelledby="nesta-pagina" className={css.indice}>
              <p id="nesta-pagina" className={css.indiceTitulo}>
                Nesta página
              </p>
              <ol className={css.lista}>
                {SECOES.map((secao) => (
                  <li key={secao.id} className={css.item}>
                    <span className={`${css.ponto} ${secao.id === atual ? css.pontoAtual : ''}`} aria-hidden="true" />
                    <Link
                      to={`#${secao.id}`}
                      className={`${css.itemLink} ${secao.id === atual ? css.itemAtual : ''}`}
                      aria-current={secao.id === atual ? 'location' : undefined}
                    >
                      {secao.titulo}
                    </Link>
                  </li>
                ))}
              </ol>
            </nav>

            <div>
              {SECOES.map((secao) => (
                <section key={secao.id} id={secao.id} className={css.secao} aria-labelledby={`${secao.id}-titulo`}>
                  <h2 id={`${secao.id}-titulo`} className={css.h2}>
                    {secao.titulo}
                  </h2>
                  {secao.texto.map((paragrafo, i) => (
                    <p key={i} className={css.paragrafo}>
                      {paragrafo}
                    </p>
                  ))}
                </section>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
