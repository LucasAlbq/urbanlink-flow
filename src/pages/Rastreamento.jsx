import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router'

import { buscarRastreio } from '../api/rastreio.js'
import { Botao } from '../components/Botao.jsx'
import { BuscaRastreio } from '../components/BuscaRastreio.jsx'
import { CarregandoA } from '../components/CarregandoA.jsx'
import { MapaIlustrado } from '../components/cidade/MapaIlustrado.jsx'
import { Estrada } from '../components/estrada/Estrada.jsx'
import { useTituloAba } from '../components/useTituloAba.js'
import { ETAPAS, TITULOS, data, dataHora, montarRastreio } from './rastreamento/etapas.js'
import css from './rastreamento/Rastreamento.module.css'

// Rastreamento parado (fase 1), prancha Rastreamento e Rastreamento-Nao-Encontrado.
// Estados em docs/plano/03-telas-e-estados.md. Nenhum dado aparece sem vir da API.
export function Rastreamento() {
  const { codigo: codigoUrl } = useParams()
  const codigo = codigoUrl?.replace(/\s+/g, '').toUpperCase() ?? ''
  const campo = useRef(null)
  const [tentativa, setTentativa] = useState(0)
  // Resposta da última busca. Se ela não é do código e da tentativa atuais, ainda está carregando.
  const [resposta, setResposta] = useState(null)

  useTituloAba(codigo ? `Entrega ${codigo} · UrbanLink Flow` : 'Rastrear entrega · UrbanLink Flow')

  // Abriu /rastreamento/UL…: a busca começa sozinha.
  useEffect(() => {
    if (!codigo) return
    const controle = new AbortController()
    const chave = { codigo, tentativa }
    buscarRastreio(codigo, { sinal: controle.signal })
      .then((dados) => setResposta({ ...chave, estado: 'pronto', dados }))
      .catch((falha) => {
        if (controle.signal.aborted) return
        const naoAchou = falha?.erro === 'ENTREGA_NAO_ENCONTRADA'
        setResposta({ ...chave, estado: naoAchou ? 'nao-encontrado' : 'erro' })
      })
    return () => controle.abort()
  }, [codigo, tentativa])

  const atual = resposta?.codigo === codigo && resposta?.tentativa === tentativa
  const busca = !codigo ? { estado: 'vazio' } : atual ? resposta : { estado: 'carregando', codigo }

  function tentarOutro() {
    campo.current?.focus()
    campo.current?.select()
  }

  return (
    <>
      <section className={css.topo}>
        <div className={css.topoDentro}>
          <div className={css.topoTexto}>
            <h1 tabIndex={-1} className={css.h1}>
              Rastrear uma entrega.
            </h1>
            <p className={css.apoio}>Veja em que ponto do caminho a sua entrega está, do galpão até a sua porta.</p>
          </div>
          <BuscaRastreio key={codigo} codigoInicial={codigo} campoRef={campo} className={css.busca} />
        </div>
      </section>

      <section className={css.resultado} aria-label="Resultado">
        <div className={css.dentro}>
          {busca.estado === 'vazio' && <SemCodigo />}
          {busca.estado === 'carregando' && <CarregandoA texto="Buscando a entrega…" />}
          {busca.estado === 'pronto' && <Resultado codigo={busca.codigo} dados={busca.dados} />}
          {busca.estado === 'nao-encontrado' && <NaoEncontrado codigo={busca.codigo} aoTentarOutro={tentarOutro} />}
          {busca.estado === 'erro' && <ErroConexao codigo={busca.codigo} aoTentar={() => setTentativa((n) => n + 1)} />}
        </div>
      </section>
    </>
  )
}

// Quando o resultado chega, o foco vai pro título do status.
function useFocoNoTitulo() {
  const titulo = useRef(null)
  useEffect(() => {
    titulo.current?.focus()
  }, [])
  return titulo
}

function Cabeca({ codigo, titulo, children, lado }) {
  const ref = useFocoNoTitulo()
  return (
    <div className={css.cabeca}>
      <div className={`${css.cabecaTexto} ${lado ? '' : css.cheia}`}>
        <p className={css.codigo}>
          Entrega <strong>{codigo}</strong>
        </p>
        <h2 ref={ref} tabIndex={-1} className={css.h2}>
          {titulo}
        </h2>
        {children}
      </div>
      {lado}
    </div>
  )
}

function SemCodigo() {
  const etapas = ETAPAS.map((etapa, i) => ({
    id: etapa.chave,
    placa: { numero: i + 1, nome: etapa.nome, glifo: null, estado: 'proximo', tamanho: 'pequeno' },
    trecho: 'futuro',
  }))
  return (
    <>
      <p className={`${css.explica} ${css.semCodigo}`}>
        Digite o código pra ver em que ponto do caminho a entrega está.
      </p>
      <Estrada etapas={etapas} inicio={false} aria-label="Etapas da entrega" />
    </>
  )
}

function Resultado({ codigo, dados }) {
  const r = montarRastreio(dados)
  const etapas = r.placas.map((p) => ({
    id: p.chave,
    placa: p.placa,
    trecho: p.trecho,
    conteudo: <TextoDaEtapa placa={p} previsao={r.previsao} />,
  }))

  const lado = r.entregueEm ? (
    <p className={css.previsao}>
      Entregue em <strong>{dataHora(r.entregueEm)}</strong>
    </p>
  ) : r.previsao ? (
    <p className={css.previsao}>
      {dados.imprevisto ? 'Nova previsão de entrega' : 'Previsão de entrega'}: <strong>{data(r.previsao)}</strong>
    </p>
  ) : null

  return (
    <>
      <Cabeca codigo={codigo} titulo={TITULOS[dados.status] ?? dados.status} lado={lado} />
      <Estrada etapas={etapas} pacoteEm={r.pacoteEm} aria-label="Etapas da entrega" />

      <div className={css.mapa}>
        <div className={css.mapaBarra}>
          <h3 className={css.mapaTitulo}>No mapa</h3>
          <p className={css.mapaNota}>Atualizado em tempo real</p>
        </div>
        <div className={css.mapaCaixa} role="img" aria-label={`Mapa com o caminho da entrega: ${r.comoEsta}`}>
          <MapaIlustrado progresso={r.progresso} className={css.mapaSvg} />
        </div>
      </div>

      <div className={css.ajuda}>
        <div className={css.ajudaTexto}>
          <h3 className={css.ajudaTitulo}>Precisa de ajuda com essa entrega?</h3>
          <p className={css.ajudaApoio}>Se algo parecer errado, fale com a equipe.</p>
        </div>
        <Botao href="/contato" variante="link" className={css.link}>
          Falar com a gente
        </Botao>
      </div>
    </>
  )
}

function TextoDaEtapa({ placa, previsao }) {
  if (placa.evento) {
    return (
      <p className={css.etapaTexto}>
        <strong>{dataHora(placa.evento.data)}</strong>
        <br />
        {placa.evento.local}
        {placa.motivo && (
          <>
            <br />
            {placa.motivo}
          </>
        )}
      </p>
    )
  }
  if (placa.motivo) return <p className={css.etapaTexto}>{placa.motivo}</p>
  if (placa.chave === 'ENTREGUE' && previsao) {
    return (
      <p className={css.etapaTexto}>
        <strong>Previsão: {data(previsao)}</strong>
        <br />
        Ainda não chegou
      </p>
    )
  }
  return null
}

function NaoEncontrado({ codigo, aoTentarOutro }) {
  const etapas = [
    {
      id: 'nao-encontrado',
      placa: { numero: '?', nome: 'Código não encontrado', glifo: null, estado: 'proximo', tamanho: 'pequeno' },
      trecho: 'futuro',
      conteudo: <p className={css.etapaTexto}>Nenhuma etapa registrada pra esse código.</p>,
    },
  ]
  return (
    <>
      <Cabeca codigo={codigo} titulo="Não achamos essa entrega">
        <p className={css.explica}>Confira as letras e os números do código ou fale com a gente.</p>
      </Cabeca>
      <Estrada etapas={etapas} inicio={false} aria-label="Etapas da entrega" />
      <div className={css.acoes}>
        <Botao variante="noite" className={css.botaoNoite} onClick={aoTentarOutro}>
          Tentar outro código
        </Botao>
        <Botao href="/contato" variante="link" className={css.link}>
          Falar com a gente
        </Botao>
      </div>
    </>
  )
}

function ErroConexao({ codigo, aoTentar }) {
  return (
    <>
      <Cabeca codigo={codigo} titulo="Não deu pra buscar agora.">
        <p className={css.explica}>Tente de novo em alguns segundos.</p>
      </Cabeca>
      <div className={css.acoesErro}>
        <Botao variante="noite" className={css.botaoNoite} onClick={aoTentar}>
          Tentar de novo
        </Botao>
      </div>
    </>
  )
}
