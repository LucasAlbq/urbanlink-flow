import { useId, useState } from 'react'
import { NavLink, useParams } from 'react-router'

import {
  apagarCentro,
  atribuirVeiculo,
  criarCentro,
  criarEntrega,
  criarUsuario,
  criarVeiculo,
  desativarVeiculo,
  editarCentro,
  editarEntrega,
  editarUsuario,
  editarVeiculo,
  listarCentros,
  listarEntregas,
  listarMensagens,
  listarUsuarios,
  listarVeiculos,
  mudarStatusEntrega,
} from '../../api/plataforma.js'
import { Botao } from '../../components/Botao.jsx'
import NaoEncontradaApp from './NaoEncontradaApp.jsx'
import { Aviso, Cabecalho, Carregando, Formulario, Selo, Tabela, Vazio } from './pecas.jsx'
import { ROTULOS, dataHora, numero, tomDaEntrega, useAcao, useDados, useSessao } from './uteis.js'
import app from './app.module.css'

const opcoesDe = (grupo) => Object.entries(ROTULOS[grupo])

// Abas de Cadastros. Cada uma tem endereço próprio (/app/cadastros/veiculos…).
// Mensagens e Usuários só aparecem pra quem pode ver (a API recusa os outros papéis).
const ABAS = [
  { caminho: '', nome: 'Entregas', Tela: Entregas },
  { caminho: 'veiculos', nome: 'Veículos', Tela: Veiculos },
  { caminho: 'centros', nome: 'Centros de distribuição', Tela: Centros },
  { caminho: 'mensagens', nome: 'Mensagens', Tela: Mensagens, acao: 'mensagens' },
  { caminho: 'usuarios', nome: 'Usuários', Tela: Usuarios, acao: 'usuarios' },
]

export function Cadastros() {
  const { aba = '' } = useParams()
  const { pode } = useSessao()
  const visiveis = ABAS.filter((item) => !item.acao || pode(item.acao))
  const atual = visiveis.find((item) => item.caminho === aba)
  if (!atual) return <NaoEncontradaApp />
  const { Tela } = atual

  return (
    <>
      <Cabecalho titulo="Cadastros" apoio="Entregas, veículos e centros de distribuição da operação, as mensagens do site e os usuários." />
      <nav aria-label="Cadastros">
        <ul className={app.abas}>
          {visiveis.map((item) => (
            <li key={item.caminho}>
              <NavLink to={`/app/cadastros${item.caminho ? `/${item.caminho}` : ''}`} end className={app.aba}>
                {item.nome}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <Tela key={atual.caminho} />
    </>
  )
}

// Painel que alterna entre a lista e o formulário (novo ou editar) da mesma aba.
function useEdicao() {
  const [edicao, setEdicao] = useState(null) // null · { modo: 'novo' } · { modo: 'editar', item }
  return { edicao, novo: () => setEdicao({ modo: 'novo' }), editar: (item) => setEdicao({ modo: 'editar', item }), fechar: () => setEdicao(null) }
}

function TopoDaLista({ titulo, total, children }) {
  return (
    <div className={app.painelTopo}>
      <h2 className={app.h2}>
        {titulo} <span className={app.itemData}>({numero(total)})</span>
      </h2>
      {children}
    </div>
  )
}

/* ------------------------------------------------------------------ entregas */

const carregarEntregas = async ({ sinal }) => {
  const [entregas, centros, veiculos] = await Promise.all([
    listarEntregas({ sinal }),
    listarCentros({ sinal }),
    listarVeiculos({ sinal }),
  ])
  return { entregas, centros, veiculos }
}

// Mudanças de status que a API aceita (route-rules.service.ts). ASSIGNED sai pelo "Atribuir veículo".
const PROXIMOS = {
  PENDING: ['CANCELED'],
  ASSIGNED: ['IN_TRANSIT', 'PENDING', 'CANCELED'],
  IN_TRANSIT: ['DELIVERED', 'FAILED'],
  FAILED: ['PENDING', 'CANCELED'],
  DELIVERED: [],
  CANCELED: [],
}
const TEXTO_ACAO = {
  IN_TRANSIT: 'Saiu pra entrega',
  DELIVERED: 'Marcar como entregue',
  FAILED: 'Marcar como falhou',
  PENDING: 'Voltar pra pendente',
  CANCELED: 'Cancelar entrega',
}

function Entregas() {
  const { dados, erro, carregando, recarregar } = useDados(carregarEntregas)
  const { pode } = useSessao()
  const { edicao, novo, editar, fechar } = useEdicao()
  const [atribuindo, setAtribuindo] = useState(null)
  const acao = useAcao()
  const podeEditar = pode('entregas')
  const podeStatus = pode('statusEntrega')

  if (!dados) return carregando ? <Carregando /> : <Aviso erro={erro} />
  const { entregas, centros, veiculos } = dados
  const centroOpcoes = centros.map((c) => [c.id, c.name])

  const campos = [
    { nome: 'trackingCode', label: 'Código de rastreio', obrigatorio: true, ajuda: 'Ex.: ULF-2026-0025' },
    { nome: 'originCenterId', label: 'Centro de origem', tipo: 'select', opcoes: centroOpcoes, obrigatorio: true },
    { nome: 'destinationAddress', label: 'Endereço de destino', obrigatorio: true, largo: true },
    { nome: 'destinationLatitude', label: 'Latitude do destino', tipo: 'number', passo: 'any', obrigatorio: true, ajuda: 'Ex.: -23.5614' },
    { nome: 'destinationLongitude', label: 'Longitude do destino', tipo: 'number', passo: 'any', obrigatorio: true, ajuda: 'Ex.: -46.6559' },
    { nome: 'weightKg', label: 'Peso (kg)', tipo: 'number', passo: 'any', min: 0, obrigatorio: true },
    { nome: 'priority', label: 'Prioridade', tipo: 'select', opcoes: opcoesDe('prioridade'), obrigatorio: true, padrao: 'NORMAL' },
    { nome: 'serviceDeadline', label: 'Prazo de entrega', tipo: 'datetime', obrigatorio: true },
  ]

  async function fazer(entrega, status) {
    if (status === 'CANCELED' && !window.confirm(`Cancelar a entrega ${entrega.trackingCode}? Uma entrega cancelada não volta.`)) return
    const ok = await acao.fazer(`${entrega.id}:${status}`, () => mudarStatusEntrega(entrega.id, status))
    if (ok !== undefined) recarregar()
  }

  return (
    <section className={app.secoes} aria-label="Entregas">
      {edicao && (
        <Formulario
          key={edicao.item?.id ?? 'nova'}
          titulo={edicao.modo === 'novo' ? 'Nova entrega' : `Editar a entrega ${edicao.item.trackingCode}`}
          campos={campos}
          inicial={edicao.item ?? {}}
          enviar={(corpo) => (edicao.modo === 'novo' ? criarEntrega(corpo) : editarEntrega(edicao.item.id, corpo))}
          aoTerminar={(resposta) => {
            fechar()
            if (resposta) recarregar()
          }}
        />
      )}
      {atribuindo && (
        <Formulario
          key={`atribuir-${atribuindo.id}`}
          titulo={`Atribuir veículo à entrega ${atribuindo.trackingCode}`}
          campos={[
            {
              nome: 'vehicleId',
              label: 'Veículo disponível',
              tipo: 'select',
              obrigatorio: true,
              opcoes: veiculos
                .filter((v) => v.status === 'AVAILABLE' || v.id === atribuindo.assignedVehicleId)
                .map((v) => [v.id, `${v.plate} · ${v.model} · até ${numero(v.capacityKg)} kg`]),
              ajuda: `A entrega pesa ${numero(atribuindo.weightKg, 1)} kg. A API confere a capacidade do veículo.`,
            },
          ]}
          inicial={{ vehicleId: atribuindo.assignedVehicleId ?? '' }}
          textoBotao="Atribuir"
          enviar={(corpo) => atribuirVeiculo(atribuindo.id, corpo.vehicleId)}
          aoTerminar={(resposta) => {
            setAtribuindo(null)
            if (resposta) recarregar()
          }}
        />
      )}
      <Aviso erro={acao.erro} />
      <div>
        <TopoDaLista titulo="Entregas" total={entregas.length}>
          {podeEditar && !edicao && (
            <Botao tamanho="normal" onClick={novo}>
              Nova entrega
            </Botao>
          )}
        </TopoDaLista>
        {entregas.length === 0 ? (
          <Vazio>Nenhuma entrega cadastrada.</Vazio>
        ) : (
          <Tabela
            legenda="Entregas"
            linhas={entregas}
            colunas={[
              {
                titulo: 'Código',
                valor: (e) => (
                  <>
                    <span className={app.forte}>{e.trackingCode}</span>
                    <span className={app.secundario}>{e.originCenter?.name}</span>
                  </>
                ),
              },
              { titulo: 'Destino', valor: (e) => e.destinationAddress },
              { titulo: 'Peso', valor: (e) => `${numero(e.weightKg, 1)} kg`, numero: true },
              { titulo: 'Prioridade', valor: (e) => <Selo grupo="prioridade" valor={e.priority} /> },
              { titulo: 'Status', valor: (e) => <Selo grupo="entrega" valor={e.status} tom={tomDaEntrega(e)} /> },
              { titulo: 'Veículo', valor: (e) => e.assignedVehicle?.plate ?? '–' },
              { titulo: 'Prazo', valor: (e) => dataHora(e.serviceDeadline), numero: true },
              {
                titulo: 'Ações',
                valor: (e) => (
                  <AcoesEntrega
                    entrega={e}
                    podeEditar={podeEditar}
                    podeStatus={podeStatus}
                    ocupado={acao.ocupado}
                    aoEditar={() => {
                      setAtribuindo(null)
                      editar(e)
                    }}
                    aoAtribuir={() => {
                      fechar()
                      setAtribuindo(e)
                    }}
                    aoMudar={(status) => fazer(e, status)}
                  />
                ),
              },
            ]}
          />
        )}
      </div>
    </section>
  )
}

// Uma lista de ações e o botão "Fazer": trocar o status só ao escolher na lista surpreenderia
// quem navega pelo teclado (WCAG 3.2.2).
function AcoesEntrega({ entrega, podeEditar, podeStatus, ocupado, aoEditar, aoAtribuir, aoMudar }) {
  const id = useId()
  const opcoes = [
    ...(podeEditar ? [['editar', 'Editar dados']] : []),
    ...(podeEditar && ['PENDING', 'ASSIGNED'].includes(entrega.status) ? [['atribuir', 'Atribuir veículo']] : []),
    ...(podeStatus ? PROXIMOS[entrega.status].map((status) => [status, TEXTO_ACAO[status]]) : []),
  ]
  const [escolha, setEscolha] = useState(opcoes[0]?.[0] ?? '')
  if (opcoes.length === 0) return <span className={app.itemData}>Sem ações</span>
  const ocupadoAqui = ocupado?.startsWith(`${entrega.id}:`)

  function aoFazer() {
    if (escolha === 'editar') aoEditar()
    else if (escolha === 'atribuir') aoAtribuir()
    else aoMudar(escolha)
  }

  return (
    <div className={app.acoesLinha}>
      <label htmlFor={id} className="so-leitor">
        Ação para a entrega {entrega.trackingCode}
      </label>
      <select id={id} className={app.selectLinha} value={escolha} onChange={(evento) => setEscolha(evento.target.value)}>
        {opcoes.map(([valor, texto]) => (
          <option key={valor} value={valor}>
            {texto}
          </option>
        ))}
      </select>
      <button type="button" className={app.acao} onClick={aoFazer} aria-disabled={ocupadoAqui || undefined}>
        {ocupadoAqui ? 'Fazendo…' : 'Fazer'}
        <span className="so-leitor"> na entrega {entrega.trackingCode}</span>
      </button>
    </div>
  )
}

/* ------------------------------------------------------------------ cadastro simples */

// Lista + formulário + remover, pra veículos, centros e usuários.
// remover: { chamar, texto, fazendo, confirmar(item), pode(item) }. O texto diz o que a API faz:
// veículo é desativado (fica no histórico das rotas), centro é apagado de verdade.
function CadastroSimples({ titulo, novoTexto, listar, campos, colunas, criar, editar, remover, nomeDe, podeEscrever }) {
  const { dados, erro, carregando, recarregar } = useDados(listar)
  const { edicao, novo, editar: abrirEdicao, fechar } = useEdicao()
  const acao = useAcao()

  if (!dados) return carregando ? <Carregando /> : <Aviso erro={erro} />

  async function aoRemover(item) {
    if (!window.confirm(remover.confirmar(item))) return
    const ok = await acao.fazer(item.id, () => remover.chamar(item.id))
    if (ok !== undefined) recarregar()
  }

  const colunasComAcoes = podeEscrever
    ? [
        ...colunas,
        {
          titulo: 'Ações',
          valor: (item) => (
            <div className={app.acoesLinha}>
              <button type="button" className={app.acao} onClick={() => abrirEdicao(item)}>
                Editar<span className="so-leitor"> {nomeDe(item)}</span>
              </button>
              {remover && (remover.pode?.(item) ?? true) && (
                <button
                  type="button"
                  className={`${app.acao} ${app.acaoPerigo}`}
                  onClick={() => aoRemover(item)}
                  aria-disabled={acao.ocupado === item.id || undefined}
                >
                  {acao.ocupado === item.id ? remover.fazendo : remover.texto}
                  <span className="so-leitor"> {nomeDe(item)}</span>
                </button>
              )}
            </div>
          ),
        },
      ]
    : colunas

  return (
    <section className={app.secoes} aria-label={titulo}>
      {edicao && (
        <Formulario
          key={edicao.item?.id ?? 'novo'}
          titulo={edicao.modo === 'novo' ? novoTexto : `Editar ${nomeDe(edicao.item)}`}
          campos={edicao.modo === 'novo' ? campos : campos.filter((campo) => !campo.soNoNovo)}
          inicial={edicao.item ?? {}}
          enviar={(corpo) => (edicao.modo === 'novo' ? criar(corpo) : editar(edicao.item.id, corpo))}
          aoTerminar={(resposta) => {
            fechar()
            if (resposta) recarregar()
          }}
        />
      )}
      <Aviso erro={acao.erro} />
      <div>
        <TopoDaLista titulo={titulo} total={dados.length}>
          {podeEscrever && !edicao && (
            <Botao tamanho="normal" onClick={novo}>
              {novoTexto}
            </Botao>
          )}
        </TopoDaLista>
        {dados.length === 0 ? <Vazio>Nenhum cadastro ainda.</Vazio> : <Tabela legenda={titulo} linhas={dados} colunas={colunasComAcoes} />}
      </div>
    </section>
  )
}

function Veiculos() {
  const { pode } = useSessao()
  return (
    <CadastroSimples
      titulo="Veículos"
      novoTexto="Novo veículo"
      listar={listarVeiculos}
      criar={criarVeiculo}
      editar={editarVeiculo}
      remover={{
        chamar: desativarVeiculo,
        texto: 'Desativar',
        fazendo: 'Desativando…',
        pode: (v) => v.status !== 'INACTIVE',
        confirmar: (v) =>
          `Desativar o veículo ${v.plate}? Ele deixa de receber entregas e rotas, mas continua no histórico. Pra voltar, edite a situação.`,
      }}
      nomeDe={(v) => v.plate}
      podeEscrever={pode('veiculos')}
      campos={[
        { nome: 'plate', label: 'Placa', obrigatorio: true, ajuda: 'Ex.: ULK1A09' },
        { nome: 'model', label: 'Modelo', obrigatorio: true },
        { nome: 'type', label: 'Tipo', tipo: 'select', opcoes: opcoesDe('tipoVeiculo'), obrigatorio: true, padrao: 'VAN' },
        { nome: 'capacityKg', label: 'Capacidade (kg)', tipo: 'number', passo: 'any', min: 0, obrigatorio: true },
        { nome: 'averageSpeedKmh', label: 'Velocidade média (km/h)', tipo: 'number', passo: 'any', min: 0, obrigatorio: true },
        { nome: 'fuelConsumption', label: 'Consumo (km por litro)', tipo: 'number', passo: 'any', min: 0, obrigatorio: true },
        { nome: 'status', label: 'Situação', tipo: 'select', opcoes: opcoesDe('veiculo'), obrigatorio: true, padrao: 'AVAILABLE' },
      ]}
      colunas={[
        {
          titulo: 'Placa',
          valor: (v) => (
            <>
              <span className={app.forte}>{v.plate}</span>
              <span className={app.secundario}>{v.model}</span>
            </>
          ),
        },
        { titulo: 'Tipo', valor: (v) => ROTULOS.tipoVeiculo[v.type] ?? v.type },
        { titulo: 'Capacidade', valor: (v) => `${numero(v.capacityKg)} kg`, numero: true },
        { titulo: 'Velocidade média', valor: (v) => `${numero(v.averageSpeedKmh)} km/h`, numero: true },
        { titulo: 'Consumo', valor: (v) => `${numero(v.fuelConsumption, 1)} km/l`, numero: true },
        { titulo: 'Situação', valor: (v) => <Selo grupo="veiculo" valor={v.status} /> },
      ]}
    />
  )
}

function Centros() {
  const { pode } = useSessao()
  return (
    <CadastroSimples
      titulo="Centros de distribuição"
      novoTexto="Novo centro"
      listar={listarCentros}
      criar={criarCentro}
      editar={editarCentro}
      remover={{
        chamar: apagarCentro,
        texto: 'Apagar',
        fazendo: 'Apagando…',
        confirmar: (c) => `Apagar o centro ${c.name}? Não dá pra desfazer. Centro com entregas ligadas não pode ser apagado.`,
      }}
      nomeDe={(c) => c.name}
      podeEscrever={pode('centros')}
      campos={[
        { nome: 'name', label: 'Nome', obrigatorio: true },
        { nome: 'address', label: 'Endereço', obrigatorio: true, largo: true },
        { nome: 'latitude', label: 'Latitude', tipo: 'number', passo: 'any', obrigatorio: true, ajuda: 'Ex.: -23.5207' },
        { nome: 'longitude', label: 'Longitude', tipo: 'number', passo: 'any', obrigatorio: true, ajuda: 'Ex.: -46.6814' },
        { nome: 'operatingHours', label: 'Horário de funcionamento', obrigatorio: true, ajuda: 'Ex.: Seg-Sáb 06:00-22:00' },
      ]}
      colunas={[
        { titulo: 'Nome', valor: (c) => <span className={app.forte}>{c.name}</span> },
        { titulo: 'Endereço', valor: (c) => c.address },
        { titulo: 'Horário', valor: (c) => c.operatingHours },
        { titulo: 'Coordenadas', valor: (c) => `${numero(c.latitude, 4)}, ${numero(c.longitude, 4)}`, numero: true },
      ]}
    />
  )
}

const carregarUsuarios = ({ sinal }) => listarUsuarios({ sinal })

function Usuarios() {
  return (
    <CadastroSimples
      titulo="Usuários"
      novoTexto="Novo usuário"
      listar={carregarUsuarios}
      criar={criarUsuario}
      editar={editarUsuario}
      nomeDe={(u) => u.name}
      podeEscrever
      campos={[
        { nome: 'name', label: 'Nome', obrigatorio: true },
        { nome: 'email', label: 'E-mail', tipo: 'email', obrigatorio: true },
        { nome: 'password', label: 'Senha inicial', tipo: 'password', obrigatorio: true, soNoNovo: true, ajuda: 'Pelo menos 8 caracteres. A pessoa troca pelo "Esqueci minha senha".' },
        {
          nome: 'role',
          label: 'Papel',
          tipo: 'select',
          obrigatorio: true,
          padrao: 'OPERATOR',
          opcoes: [
            ['ADMIN', 'Administrador'],
            ['MANAGER', 'Gestor'],
            ['OPERATOR', 'Operador'],
          ],
        },
        {
          nome: 'status',
          label: 'Situação',
          tipo: 'select',
          obrigatorio: true,
          padrao: 'ACTIVE',
          opcoes: [
            ['ACTIVE', 'Ativo'],
            ['INACTIVE', 'Inativo'],
            ['SUSPENDED', 'Suspenso'],
          ],
        },
      ]}
      colunas={[
        {
          titulo: 'Nome',
          valor: (u) => (
            <>
              <span className={app.forte}>{u.name}</span>
              <span className={app.secundario}>{u.email}</span>
            </>
          ),
        },
        { titulo: 'Papel', valor: (u) => ROTULOS.papel[u.role] ?? u.role },
        {
          titulo: 'Situação',
          valor: (u) => (
            <Selo tom={u.status === 'ACTIVE' ? 'ok' : 'neutro'}>{{ ACTIVE: 'Ativo', INACTIVE: 'Inativo', SUSPENDED: 'Suspenso' }[u.status] ?? u.status}</Selo>
          ),
        },
        { titulo: 'Criado em', valor: (u) => dataHora(u.createdAt), numero: true },
      ]}
    />
  )
}

/* ------------------------------------------------------------------ mensagens */

const ASSUNTOS = { ORCAMENTO: 'Orçamento', DUVIDA_ENTREGA: 'Dúvida sobre uma entrega', PARCERIA: 'Parceria', OUTRO: 'Outro assunto' }

function Mensagens() {
  const { dados, erro, carregando } = useDados(listarMensagens)
  if (!dados) return carregando ? <Carregando /> : <Aviso erro={erro} />

  return (
    <section className={`${app.painel}`} aria-label="Mensagens do Fale com a gente">
      <TopoDaLista titulo="Mensagens do Fale com a gente" total={dados.length} />
      {dados.length === 0 ? (
        <Vazio>Nenhuma mensagem recebida.</Vazio>
      ) : (
        <ul className={app.lista}>
          {dados.map((mensagem) => (
            <li key={mensagem.id}>
              <div className={app.itemTopo}>
                <Selo tom="neutro">{ASSUNTOS[mensagem.subject] ?? mensagem.subject}</Selo>
                <p className={app.itemTitulo}>
                  {mensagem.name}
                  {mensagem.company ? ` · ${mensagem.company}` : ''}
                </p>
                <span className={app.itemData}>
                  Protocolo {mensagem.protocol} · {dataHora(mensagem.createdAt)}
                </span>
              </div>
              <p className={app.itemTexto}>{mensagem.message}</p>
              <span className={app.itemData}>
                {mensagem.email}
                {mensagem.phone ? ` · ${mensagem.phone}` : ''}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
