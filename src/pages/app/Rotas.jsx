import { Fragment, useState } from 'react'

import {
  cancelarRota,
  concluirRota,
  criarRota,
  iniciarRota,
  listarEntregas,
  listarRotas,
  listarVeiculos,
  otimizarRota,
} from '../../api/plataforma.js'
import { Botao } from '../../components/Botao.jsx'
import { Aviso, Cabecalho, Carregando, Formulario, Selo, Vazio } from './pecas.jsx'
import { ROTULOS, dataHora, duracao, numero, reais, useAcao, useDados, useSessao } from './uteis.js'
import app from './app.module.css'
import css from './Rotas.module.css'

const carregar = async ({ sinal }) => {
  const [rotas, veiculos, entregas] = await Promise.all([
    listarRotas({ sinal }),
    listarVeiculos({ sinal }),
    listarEntregas({ sinal }),
  ])
  return { rotas, veiculos, entregas }
}

// Ações de cada situação da rota (ROUTE_TRANSITIONS da API): planejada otimiza, inicia ou apaga;
// em andamento conclui.
const ACOES = {
  PLANNED: [
    ['otimizar', 'Otimizar a ordem', otimizarRota],
    ['iniciar', 'Iniciar', iniciarRota],
  ],
  ACTIVE: [['concluir', 'Concluir', concluirRota]],
  COMPLETED: [],
  CANCELED: [],
}

// Rotas: planejar (veículo + entregas), otimizar a ordem das paradas (vizinho mais próximo e
// 2-opt, na API), iniciar e concluir. Cada rota mostra distância, tempo, custo e CO2 calculados.
export function Rotas() {
  const { dados, erro, carregando, recarregar } = useDados(carregar)
  const { pode } = useSessao()
  const [criando, setCriando] = useState(false)
  const [aberta, setAberta] = useState(null)
  const acao = useAcao()
  const podeMexer = pode('rotas')

  async function fazer(rota, nome, chamar) {
    const ok = await acao.fazer(`${rota.id}:${nome}`, () => chamar(rota.id))
    if (ok !== undefined) {
      setAberta(rota.id)
      recarregar()
    }
  }

  async function apagar(rota) {
    if (!window.confirm(`Cancelar a rota "${rota.name}"? Ela fica na lista como cancelada e as entregas voltam a ficar livres.`)) return
    const ok = await acao.fazer(`${rota.id}:apagar`, () => cancelarRota(rota.id))
    if (ok !== undefined) recarregar()
  }

  return (
    <>
      <Cabecalho
        titulo="Rotas"
        apoio="Planeje a rota de um veículo com as entregas, deixe a API ordenar as paradas e acompanhe do início ao fim."
      >
        {podeMexer && !criando && dados && (
          <Botao tamanho="normal" onClick={() => setCriando(true)}>
            Nova rota
          </Botao>
        )}
      </Cabecalho>

      {!dados && carregando && <Carregando texto="Carregando as rotas" />}
      {!dados && erro && <Aviso erro={erro} />}

      {dados && (
        <div className={app.secoes}>
          {criando && (
            <NovaRota
              dados={dados}
              aoTerminar={(nova) => {
                setCriando(false)
                if (nova) {
                  setAberta(nova.id)
                  recarregar()
                }
              }}
            />
          )}
          <Aviso erro={acao.erro} />

          <div>
            <div className={app.painelTopo}>
              <h2 className={app.h2}>
                Rotas <span className={app.itemData}>({numero(dados.rotas.length)})</span>
              </h2>
            </div>
            {dados.rotas.length === 0 ? (
              <Vazio>Nenhuma rota ainda.</Vazio>
            ) : (
              <div className={app.tabelaCaixa} data-lenis-prevent="">
                <table className={app.tabela}>
                  <caption className="so-leitor">Rotas</caption>
                  <thead>
                    <tr>
                      <th scope="col">Rota</th>
                      <th scope="col">Situação</th>
                      <th scope="col" className={app.num}>Paradas</th>
                      <th scope="col" className={app.num}>Distância</th>
                      <th scope="col" className={app.num}>Tempo</th>
                      <th scope="col" className={app.num}>Custo</th>
                      <th scope="col" className={app.num}>CO2</th>
                      <th scope="col">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dados.rotas.map((rota) => (
                      <Fragment key={rota.id}>
                        <tr>
                          <td>
                            <span className={app.forte}>{rota.name}</span>
                            <span className={app.secundario}>
                              {rota.vehicle ? `${rota.vehicle.plate} · ${rota.vehicle.model}` : 'Sem veículo'} · trânsito{' '}
                              {(ROTULOS.transito[rota.trafficLevel] ?? rota.trafficLevel).toLowerCase()}
                            </span>
                          </td>
                          <td>
                            <Selo grupo="rota" valor={rota.status} />
                          </td>
                          <td className={app.num}>{numero(rota.stops?.length ?? 0)}</td>
                          <td className={app.num}>{numero(rota.totalDistanceKm, 1)} km</td>
                          <td className={app.num}>{duracao(rota.actualDurationMinutes ?? rota.estimatedDurationMinutes)}</td>
                          <td className={app.num}>{reais(rota.estimatedCost)}</td>
                          <td className={app.num}>{numero(rota.estimatedCo2Kg, 1)} kg</td>
                          <td>
                            <div className={app.acoesLinha}>
                              <button
                                type="button"
                                className={app.acao}
                                aria-expanded={aberta === rota.id}
                                aria-controls={`paradas-${rota.id}`}
                                onClick={() => setAberta(aberta === rota.id ? null : rota.id)}
                              >
                                {aberta === rota.id ? 'Esconder paradas' : 'Ver paradas'}
                                <span className="so-leitor"> de {rota.name}</span>
                              </button>
                              {podeMexer &&
                                ACOES[rota.status]?.map(([nome, texto, chamar]) => (
                                  <button
                                    key={nome}
                                    type="button"
                                    className={app.acao}
                                    onClick={() => fazer(rota, nome, chamar)}
                                    aria-disabled={acao.ocupado === `${rota.id}:${nome}` || undefined}
                                  >
                                    {acao.ocupado === `${rota.id}:${nome}` ? 'Fazendo…' : texto}
                                    <span className="so-leitor"> {rota.name}</span>
                                  </button>
                                ))}
                              {podeMexer && rota.status === 'PLANNED' && (
                                <button
                                  type="button"
                                  className={`${app.acao} ${app.acaoPerigo}`}
                                  onClick={() => apagar(rota)}
                                  aria-disabled={acao.ocupado === `${rota.id}:apagar` || undefined}
                                >
                                  Cancelar rota<span className="so-leitor"> {rota.name}</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                        {aberta === rota.id && (
                          <tr id={`paradas-${rota.id}`} className={css.detalhe}>
                            <td colSpan={8}>
                              <Paradas rota={rota} />
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

// As paradas na ordem da rota, como a estrada do rastreio: número, entrega, endereço e previsão.
function Paradas({ rota }) {
  const paradas = [...(rota.stops ?? [])].sort((a, b) => a.sequence - b.sequence)
  if (paradas.length === 0) return <p className={app.ajuda}>Essa rota não tem paradas.</p>
  return (
    <ol className={css.paradas} aria-label={`Paradas de ${rota.name}, na ordem`}>
      {paradas.map((parada) => (
        <li key={parada.id} className={css.parada}>
          <span className={css.numero} aria-hidden="true">
            {parada.sequence}
          </span>
          <div className={css.paradaTexto}>
            <p className={app.itemTitulo}>
              <span className="so-leitor">Parada {parada.sequence}: </span>
              {parada.delivery?.trackingCode ?? 'Entrega'}
            </p>
            <p className={app.itemTexto}>{parada.delivery?.destinationAddress}</p>
            <span className={app.itemData}>
              Previsão {dataHora(parada.plannedArrival)}
              {parada.actualArrival ? ` · chegou ${dataHora(parada.actualArrival)}` : ''}
            </span>
          </div>
          <Selo grupo="parada" valor={parada.status} />
        </li>
      ))}
    </ol>
  )
}

function NovaRota({ dados, aoTerminar }) {
  // Entram as entregas abertas que ainda não estão numa rota planejada ou em andamento.
  const ocupadas = new Set(
    dados.rotas
      .filter((rota) => ['PLANNED', 'ACTIVE'].includes(rota.status))
      .flatMap((rota) => (rota.stops ?? []).map((parada) => parada.deliveryId)),
  )
  const livres = dados.entregas.filter((e) => ['PENDING', 'ASSIGNED'].includes(e.status) && !ocupadas.has(e.id))
  const veiculos = dados.veiculos.filter((v) => v.status === 'AVAILABLE')

  return (
    <Formulario
      titulo="Nova rota"
      textoBotao="Criar rota"
      campos={[
        { nome: 'name', label: 'Nome da rota', obrigatorio: true, ajuda: 'Ex.: Rota Centro manhã' },
        {
          nome: 'vehicleId',
          label: 'Veículo',
          tipo: 'select',
          obrigatorio: true,
          opcoes: veiculos.map((v) => [v.id, `${v.plate} · ${v.model} · até ${numero(v.capacityKg)} kg`]),
          ajuda: veiculos.length ? 'Só aparecem os veículos disponíveis.' : 'Nenhum veículo disponível agora.',
        },
        { nome: 'trafficLevel', label: 'Trânsito previsto', tipo: 'select', obrigatorio: true, padrao: 'MODERATE', opcoes: Object.entries(ROTULOS.transito) },
        { nome: 'optimize', label: 'Otimizar a ordem das paradas ao criar', tipo: 'checkbox', padrao: true },
        {
          nome: 'deliveryIds',
          label: 'Entregas da rota',
          tipo: 'marcar',
          opcoes: livres.map((e) => [e.id, `${e.trackingCode} · ${numero(e.weightKg, 1)} kg · ${e.destinationAddress}`]),
          vazio: 'Nenhuma entrega aberta fora de rota. Cadastre uma em Cadastros.',
        },
      ]}
      enviar={criarRota}
      aoTerminar={aoTerminar}
    />
  )
}
