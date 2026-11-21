import { useState } from 'react'

import { apagarSimulacao, criarSimulacao, listarSimulacoes, rodarSimulacao } from '../../api/plataforma.js'
import { Botao } from '../../components/Botao.jsx'
import { Aviso, Cabecalho, Carregando, Formulario, Selo, Tabela, Vazio } from './pecas.jsx'
import { ROTULOS, dataHora, duracao, numero, reais, useAcao, useDados, useSessao } from './uteis.js'
import app from './app.module.css'
import css from './Simulacao.module.css'

const carregar = ({ sinal }) => listarSimulacoes({ sinal })

const CAMPOS = [
  { nome: 'name', label: 'Nome do cenário', obrigatorio: true, largo: true, ajuda: 'Ex.: Trânsito intenso com 4 vans' },
  { nome: 'trafficLevel', label: 'Trânsito', tipo: 'select', obrigatorio: true, padrao: 'MODERATE', opcoes: Object.entries(ROTULOS.transito) },
  { nome: 'availableVehicles', label: 'Veículos disponíveis', tipo: 'number', passo: '1', min: 1, obrigatorio: true, padrao: 4 },
  { nome: 'averageSpeedKmh', label: 'Velocidade média (km/h)', tipo: 'number', passo: 'any', min: 1, obrigatorio: true, padrao: 30 },
  { nome: 'fuelPrice', label: 'Preço do combustível (R$/litro)', tipo: 'number', passo: 'any', min: 0, obrigatorio: true, padrao: 6.19 },
  { nome: 'co2Factor', label: 'Fator de CO2 (kg por litro)', tipo: 'number', passo: 'any', min: 0, obrigatorio: true, padrao: 2.31, ajuda: 'Gasolina: 2,31. Diesel: 2,68.' },
]

// Simulação de cenários: monta um cenário (trânsito, frota, combustível), roda na API e compara
// a ordem original das entregas com a otimizada (vizinho mais próximo e 2-opt): distância,
// tempo, custo e CO2. POST /simulations, POST /simulations/:id/run.
export function Simulacao() {
  const { dados, erro, carregando, recarregar } = useDados(carregar)
  const { pode } = useSessao()
  const [criando, setCriando] = useState(false)
  const [aberta, setAberta] = useState(null)
  const acao = useAcao()
  const podeMexer = pode('simulacoes')

  async function rodar(simulacao) {
    const resultado = await acao.fazer(simulacao.id, () => rodarSimulacao(simulacao.id))
    if (resultado !== undefined) {
      setAberta(simulacao.id)
      recarregar()
    }
  }

  async function apagar(simulacao) {
    if (!window.confirm(`Apagar a simulação "${simulacao.name}"? Não dá pra desfazer.`)) return
    const ok = await acao.fazer(`apagar:${simulacao.id}`, () => apagarSimulacao(simulacao.id))
    if (ok !== undefined) {
      if (aberta === simulacao.id) setAberta(null)
      recarregar()
    }
  }

  const escolhida = dados?.find((s) => s.id === aberta && s.result)

  return (
    <>
      <Cabecalho
        titulo="Simulação de cenários"
        apoio="Teste trânsito, tamanho da frota e preço do combustível antes de mudar a operação. A API ordena as entregas pendentes e compara a ordem original com a otimizada."
      >
        {podeMexer && !criando && (
          <Botao tamanho="normal" onClick={() => setCriando(true)}>
            Novo cenário
          </Botao>
        )}
      </Cabecalho>

      {!dados && carregando && <Carregando texto="Carregando as simulações" />}
      {!dados && erro && <Aviso erro={erro} />}

      {dados && (
        <div className={app.secoes}>
          {criando && (
            <Formulario
              titulo="Novo cenário"
              campos={CAMPOS}
              textoBotao="Criar cenário"
              enviar={criarSimulacao}
              aoTerminar={(nova) => {
                setCriando(false)
                if (nova) recarregar()
              }}
            />
          )}
          <Aviso erro={acao.erro} />

          {escolhida && <Resultado simulacao={escolhida} aoFechar={() => setAberta(null)} />}

          <div>
            <div className={app.painelTopo}>
              <h2 className={app.h2}>
                Cenários <span className={app.itemData}>({numero(dados.length)})</span>
              </h2>
            </div>
            {dados.length === 0 ? (
              <Vazio>Nenhum cenário ainda. Crie o primeiro em "Novo cenário".</Vazio>
            ) : (
              <Tabela
                legenda="Cenários de simulação"
                linhas={dados}
                colunas={[
                  {
                    titulo: 'Cenário',
                    valor: (s) => (
                      <>
                        <span className={app.forte}>{s.name}</span>
                        <span className={app.secundario}>
                          {s.user?.name ? `${s.user.name} · ` : ''}
                          {dataHora(s.createdAt)}
                        </span>
                      </>
                    ),
                  },
                  { titulo: 'Trânsito', valor: (s) => ROTULOS.transito[s.trafficLevel] ?? s.trafficLevel },
                  { titulo: 'Veículos', valor: (s) => numero(s.availableVehicles), numero: true },
                  { titulo: 'Combustível', valor: (s) => `${reais(s.fuelPrice)}/l`, numero: true },
                  { titulo: 'Situação', valor: (s) => <Selo grupo="simulacao" valor={s.status} /> },
                  {
                    titulo: 'Melhora',
                    valor: (s) => (s.result ? `${numero(s.result.improvementPercentage, 1)}%` : '–'),
                    numero: true,
                  },
                  {
                    titulo: 'Ações',
                    valor: (s) => (
                      <div className={app.acoesLinha}>
                        {s.result && (
                          <button type="button" className={app.acao} onClick={() => setAberta(s.id)} aria-pressed={aberta === s.id}>
                            Ver resultado<span className="so-leitor"> de {s.name}</span>
                          </button>
                        )}
                        {podeMexer && (
                          <button type="button" className={app.acao} onClick={() => rodar(s)} aria-disabled={acao.ocupado === s.id || undefined}>
                            {acao.ocupado === s.id ? 'Rodando…' : s.result ? 'Rodar de novo' : 'Rodar'}
                            <span className="so-leitor"> {s.name}</span>
                          </button>
                        )}
                        {podeMexer && (
                          <button
                            type="button"
                            className={`${app.acao} ${app.acaoPerigo}`}
                            onClick={() => apagar(s)}
                            aria-disabled={acao.ocupado === `apagar:${s.id}` || undefined}
                          >
                            Apagar<span className="so-leitor"> {s.name}</span>
                          </button>
                        )}
                      </div>
                    ),
                  },
                ]}
              />
            )}
          </div>
        </div>
      )}
    </>
  )
}

// Comparação original × otimizada. Cada linha tem as duas barras na mesma escala, pra ver a
// diferença sem ler os números; os números ficam ao lado (a barra é só apoio, aria-hidden).
function Resultado({ simulacao, aoFechar }) {
  const r = simulacao.result
  const dadosRota = r.routeData ?? {}
  const linhas = [
    ['Distância', r.originalDistanceKm, r.optimizedDistanceKm, (v) => `${numero(v, 1)} km`],
    ['Tempo', r.originalDurationMinutes, r.optimizedDurationMinutes, duracao],
    ['Custo', r.originalCost, r.optimizedCost, reais],
    ['CO2', r.originalCo2Kg, r.optimizedCo2Kg, (v) => `${numero(v, 2)} kg`],
  ]

  return (
    <section className={`${app.painel} ${css.resultado}`} aria-labelledby="resultado-titulo">
      <div className={app.painelTopo}>
        <h2 id="resultado-titulo" className={app.h2}>
          Resultado: {simulacao.name}
        </h2>
        <button type="button" className={app.acao} onClick={aoFechar}>
          Fechar resultado
        </button>
      </div>

      <dl className={`${app.fichas} ${app.fichasSeis}`}>
        <div className={app.ficha}>
          <dt>Melhora geral</dt>
          <dd>{numero(r.improvementPercentage, 1)}%</dd>
        </div>
        <div className={app.ficha}>
          <dt>Entregas no prazo</dt>
          <dd>{numero(r.onTimeDeliveryRate, 1)}%</dd>
        </div>
        <div className={app.ficha}>
          <dt>Nível de serviço</dt>
          <dd>{numero(r.serviceLevel, 1)}%</dd>
        </div>
        <div className={app.ficha}>
          <dt>Veículos usados</dt>
          <dd>
            {numero(dadosRota.usedVehicles ?? dadosRota.routes?.length)} de {numero(dadosRota.availableVehicles ?? simulacao.availableVehicles)}
          </dd>
        </div>
        <div className={app.ficha}>
          <dt>Entregas simuladas</dt>
          <dd>{numero(dadosRota.selectedDeliveries ?? dadosRota.routes?.reduce((soma, rota) => soma + (rota.deliveryCount ?? 0), 0))}</dd>
        </div>
        <div className={app.ficha}>
          <dt>Economia</dt>
          <dd>{reais(r.originalCost - r.optimizedCost)}</dd>
        </div>
      </dl>

      <table className={css.comparacao}>
        <caption className="so-leitor">Ordem original comparada com a otimizada</caption>
        <thead>
          <tr>
            <th scope="col">Medida</th>
            <th scope="col">Original</th>
            <th scope="col">Otimizada</th>
            <th scope="col">Diferença</th>
          </tr>
        </thead>
        <tbody>
          {linhas.map(([nome, original, otimizada, formato]) => {
            const maior = Math.max(original, otimizada) || 1
            const diferenca = original ? ((otimizada - original) / original) * 100 : 0
            return (
              <tr key={nome}>
                <th scope="row">{nome}</th>
                <td>
                  <span className={css.valor}>{formato(original)}</span>
                  <span className={css.trilho} aria-hidden="true">
                    <span className={`${css.barra} ${css.original}`} style={{ width: `${(original / maior) * 100}%` }} />
                  </span>
                </td>
                <td>
                  <span className={css.valor}>{formato(otimizada)}</span>
                  <span className={css.trilho} aria-hidden="true">
                    <span className={`${css.barra} ${css.otimizada}`} style={{ width: `${(otimizada / maior) * 100}%` }} />
                  </span>
                </td>
                <td className={css.diferenca}>
                  {diferenca === 0 ? 'igual' : `${diferenca < 0 ? '−' : '+'}${numero(Math.abs(diferenca), 1)}%`}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
      {dadosRota.unassignedDeliveries?.length > 0 && (
        <p className={app.ajuda}>
          {numero(dadosRota.unassignedDeliveries.length)} entregas ficaram de fora do cenário por falta de capacidade nos veículos.
        </p>
      )}
    </section>
  )
}
