import { lazy, Suspense, useCallback, useState } from 'react'

import { buscarMapa, buscarResumo } from '../../api/plataforma.js'
import { Botao } from '../../components/Botao.jsx'
import { Aviso, Cabecalho, Carregando, Selo, Tabela, Vazio } from './pecas.jsx'
import { ABERTAS, ROTULOS, atrasada, dataHora, hora, numero, reais, useDados } from './uteis.js'
import app from './app.module.css'
import css from './Monitoramento.module.css'

// O MapLibre só baixa quando o Monitoramento abre (o resto do site não paga por ele).
const MapaOperacao = lazy(() => import('./MapaOperacao.jsx'))

const carregar = async ({ sinal }) => {
  const [resumo, mapa] = await Promise.all([buscarResumo({ sinal }), buscarMapa({ sinal })])
  return { resumo, mapa, em: new Date() }
}

// Monitoramento (/app): os indicadores do GET /dashboard/summary, o mapa da operação do
// GET /dashboard/map, os alertas abertos e as entregas atrasadas. "Atualizar" pede tudo de novo.
export function Monitoramento() {
  const { dados, erro, carregando, recarregar } = useDados(carregar)

  return (
    <>
      <Cabecalho
        titulo="Monitoramento"
        apoio={dados ? `Situação das entregas, da frota e das rotas. Atualizado às ${hora(dados.em)}.` : 'Situação das entregas, da frota e das rotas.'}
      >
        <Botao variante="noite" tamanho="normal" onClick={recarregar} carregando={carregando && Boolean(dados)}>
          {carregando && dados ? 'Atualizando…' : 'Atualizar'}
        </Botao>
      </Cabecalho>

      {!dados && carregando && <Carregando texto="Carregando o monitoramento" />}
      {erro && <Aviso erro={erro} />}
      {dados && <Painel dados={dados} />}
    </>
  )
}

function Painel({ dados }) {
  const { metrics: m, deliveriesByStatus, fleetByStatus, recentAlerts } = dados.resumo
  const { mapa } = dados
  const atrasadas = mapa.deliveries.filter((entrega) => atrasada(entrega) && ABERTAS.includes(entrega.status))

  const fichas = [
    ['Entregas pendentes', numero(m.pendingDeliveries)],
    ['Em trânsito', numero(m.inTransitDeliveries)],
    ['Entregues', numero(m.completedDeliveries)],
    ['Atrasadas', numero(m.lateDeliveries), m.lateDeliveries > 0],
    ['Entregues no prazo', `${numero(m.onTimeDeliveryRate, 1)}%`],
    ['Nível de serviço', `${numero(m.serviceLevel, 1)}%`],
    ['Frota em uso', `${numero(m.fleetUtilization, 1)}%`],
    ['Veículos disponíveis', numero(m.availableVehicles)],
    ['Distância das rotas', `${numero(m.totalDistanceKm, 1)} km`],
    ['Custo estimado das rotas', reais(m.estimatedCost)],
    ['CO2 estimado das rotas', `${numero(m.estimatedCo2Kg, 1)} kg`],
    ['Economia nas simulações', reais(m.optimizationSavings)],
  ]

  return (
    <div className={app.secoes}>
      <section aria-labelledby="indicadores">
        <h2 id="indicadores" className="so-leitor">
          Indicadores
        </h2>
        <dl className={app.fichas}>
          {fichas.map(([rotulo, valor, alerta]) => (
            <div key={rotulo} className={`${app.ficha} ${alerta ? app.fichaAlerta : ''}`}>
              <dt>{rotulo}</dt>
              <dd>{valor}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className={css.mapaEAlertas}>
        <section className={app.painel} aria-labelledby="mapa-titulo">
          <div className={app.painelTopo}>
            <h2 id="mapa-titulo" className={app.h2}>
              Mapa da operação
            </h2>
          </div>
          <MapaComLegenda mapa={mapa} />
        </section>

        <section className={app.painel} aria-labelledby="alertas-titulo">
          <div className={app.painelTopo}>
            <h2 id="alertas-titulo" className={app.h2}>
              Alertas abertos
            </h2>
          </div>
          {recentAlerts.length === 0 ? (
            <Vazio>Nenhum alerta aberto.</Vazio>
          ) : (
            <ul className={app.lista}>
              {recentAlerts.map((alerta) => (
                <li key={alerta.id}>
                  <div className={app.itemTopo}>
                    <Selo grupo="alerta" valor={alerta.severity} />
                    <p className={app.itemTitulo}>{alerta.title}</p>
                  </div>
                  <p className={app.itemTexto}>{alerta.message}</p>
                  <span className={app.itemData}>{dataHora(alerta.createdAt)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <div className={css.duas}>
        <Contagens titulo="Entregas por status" grupo="entrega" itens={deliveriesByStatus} />
        <Contagens titulo="Frota por status" grupo="veiculo" itens={fleetByStatus} />
      </div>

      <section className={app.painel} aria-labelledby="atrasadas-titulo">
        <div className={app.painelTopo}>
          <h2 id="atrasadas-titulo" className={app.h2}>
            Entregas abertas fora do prazo
          </h2>
          <span className={app.itemData}>{numero(atrasadas.length)} no total</span>
        </div>
        {atrasadas.length === 0 ? (
          <Vazio>Nenhuma entrega aberta passou do prazo.</Vazio>
        ) : (
          <Tabela
            legenda="Entregas abertas fora do prazo"
            linhas={atrasadas}
            colunas={[
              { titulo: 'Código', valor: (e) => <span className={app.forte}>{e.trackingCode}</span> },
              { titulo: 'Destino', valor: (e) => e.address },
              { titulo: 'Prioridade', valor: (e) => <Selo grupo="prioridade" valor={e.priority} /> },
              { titulo: 'Status', valor: (e) => <Selo grupo="entrega" valor={e.status} /> },
              { titulo: 'Prazo', valor: (e) => dataHora(e.serviceDeadline), numero: true },
            ]}
          />
        )}
      </section>
    </div>
  )
}

function MapaComLegenda({ mapa }) {
  const [falhou, setFalhou] = useState(false)
  const aoFalhar = useCallback(() => setFalhou(true), [])
  const comPosicao = mapa.vehicles.filter((v) => v.latitude != null).length
  const rotulo = `Mapa da operação: ${mapa.centers.length} centros de distribuição, ${comPosicao} veículos com posição, ${mapa.deliveries.length} entregas e ${mapa.routes.length} rotas. Os mesmos dados estão nas listas desta página.`

  return (
    <>
      {/* O nome da região vem do próprio mapa (Map.Title); a caixa não repete. */}
      <div className={css.mapa}>
        {falhou ? (
          <div className={css.mapaFalhou}>
            <p>O mapa não carregou. Os dados da operação continuam nas listas desta página.</p>
            <button type="button" className={app.acao} onClick={() => setFalhou(false)}>
              Tentar de novo
            </button>
          </div>
        ) : (
          <Suspense fallback={<Carregando texto="Abrindo o mapa" />}>
            <MapaOperacao dados={mapa} rotulo={rotulo} aoFalhar={aoFalhar} />
          </Suspense>
        )}
      </div>
      <ul className={css.legenda} aria-label="Legenda do mapa">
        <li>
          <span className={css.simboloCentro} aria-hidden="true" /> Centro de distribuição
        </li>
        <li>
          <span className={css.simboloVeiculo} aria-hidden="true" /> Veículo
        </li>
        <li>
          <span className={`${css.simboloEntrega} ${css.ok}`} aria-hidden="true" /> Entregue
        </li>
        <li>
          <span className={`${css.simboloEntrega} ${css.andamento}`} aria-hidden="true" /> Atribuída ou em trânsito
        </li>
        <li>
          <span className={`${css.simboloEntrega} ${css.neutro}`} aria-hidden="true" /> Pendente ou cancelada
        </li>
        <li>
          <span className={`${css.simboloEntrega} ${css.critico}`} aria-hidden="true" /> Atrasada ou falhou
        </li>
        <li>
          <span className={css.simboloRotaAtiva} aria-hidden="true" /> Rota em andamento
        </li>
        <li>
          <span className={css.simboloRotaPlanejada} aria-hidden="true" /> Rota planejada ou concluída
        </li>
      </ul>
    </>
  )
}

function Contagens({ titulo, grupo, itens }) {
  const maior = Math.max(1, ...itens.map((item) => item.count))
  const id = `contagem-${grupo}`
  return (
    <section className={app.painel} aria-labelledby={id}>
      <div className={app.painelTopo}>
        <h2 id={id} className={app.h2}>
          {titulo}
        </h2>
      </div>
      {itens.length === 0 ? (
        <Vazio>Sem registros.</Vazio>
      ) : (
        <dl className={app.barras}>
          {itens.map((item) => (
            <div key={item.status} className={app.barra}>
              <dt>{ROTULOS[grupo][item.status] ?? item.status}</dt>
              <dd>
                <span className={app.trilho} aria-hidden="true">
                  <span className={app.preenchido} style={{ width: `${(item.count / maior) * 100}%` }} />
                </span>
                <span className={app.contagem}>{numero(item.count)}</span>
              </dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  )
}
