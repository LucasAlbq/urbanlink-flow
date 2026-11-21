import { useCallback, useEffect, useState } from 'react'
import { useLocation, useNavigate, useOutletContext } from 'react-router'

// Base das telas da plataforma (/app) sem componentes: nomes em português dos valores da API,
// tom dos selos, formatos, permissões por papel, mensagens de erro e os hooks de carregar e agir.
// Os componentes ficam em pecas.jsx.

export const ROTULOS = {
  entrega: {
    PENDING: 'Pendente',
    ASSIGNED: 'Atribuída',
    IN_TRANSIT: 'Em trânsito',
    DELIVERED: 'Entregue',
    FAILED: 'Falhou',
    CANCELED: 'Cancelada',
  },
  prioridade: { LOW: 'Baixa', NORMAL: 'Normal', HIGH: 'Alta', URGENT: 'Urgente' },
  tipoVeiculo: { MOTORCYCLE: 'Moto', VAN: 'Van', TRUCK: 'Caminhão', BICYCLE: 'Bicicleta' },
  veiculo: { AVAILABLE: 'Disponível', IN_ROUTE: 'Em rota', MAINTENANCE: 'Em manutenção', INACTIVE: 'Inativo' },
  rota: { PLANNED: 'Planejada', ACTIVE: 'Em andamento', COMPLETED: 'Concluída', CANCELED: 'Cancelada' },
  parada: { PENDING: 'Pendente', ARRIVED: 'No local', COMPLETED: 'Feita', SKIPPED: 'Pulada', FAILED: 'Falhou' },
  transito: { LOW: 'Leve', MODERATE: 'Moderado', HIGH: 'Intenso', CRITICAL: 'Crítico' },
  simulacao: { DRAFT: 'Rascunho', RUNNING: 'Rodando', COMPLETED: 'Concluída', FAILED: 'Falhou' },
  alerta: { INFO: 'Aviso', WARNING: 'Atenção', CRITICAL: 'Crítico' },
  papel: { ADMIN: 'Administrador', GESTOR: 'Gestor', OPERADOR: 'Operador', MANAGER: 'Gestor', OPERATOR: 'Operador' },
  usuario: { ACTIVE: 'Ativo', INACTIVE: 'Inativo' },
}

// Tom do selo: ok (verde), atraso (âmbar escuro), critico (vermelho), andamento (azul), neutro (cinza).
const TONS = {
  DELIVERED: 'ok', AVAILABLE: 'ok', COMPLETED: 'ok', ACTIVE: 'andamento', INFO: 'neutro',
  IN_TRANSIT: 'andamento', IN_ROUTE: 'andamento', RUNNING: 'andamento', ARRIVED: 'andamento',
  ASSIGNED: 'andamento',
  MAINTENANCE: 'atraso', WARNING: 'atraso', HIGH: 'atraso', SKIPPED: 'atraso',
  FAILED: 'critico', CRITICAL: 'critico', URGENT: 'critico',
}

export const tomDe = (valor) => TONS[valor] ?? 'neutro'

// Entrega atrasada e ainda aberta é crítica; o resto segue o status. `isLate` vem do
// /dashboard/map; nas listas, vale o prazo de serviço vencido.
export const ABERTAS = ['PENDING', 'ASSIGNED', 'IN_TRANSIT']
export const atrasada = (entrega) =>
  entrega.isLate ?? (ABERTAS.includes(entrega.status) && new Date(entrega.serviceDeadline) < new Date())
export const tomDaEntrega = (entrega) =>
  atrasada(entrega) && !['DELIVERED', 'CANCELED'].includes(entrega.status) ? 'critico' : tomDe(entrega.status)

// Formatos (horário de Brasília, como o rastreio).
const FUSO = 'America/Sao_Paulo'
const VAZIO = '–'
export const numero = (n, casas = 0) =>
  n == null ? VAZIO : Number(n).toLocaleString('pt-BR', { minimumFractionDigits: casas, maximumFractionDigits: casas })
export const reais = (n) => (n == null ? VAZIO : Number(n).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }))
export const dataHora = (iso) =>
  iso ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short', timeZone: FUSO }).format(new Date(iso)) : VAZIO
export const hora = (data) => new Intl.DateTimeFormat('pt-BR', { timeStyle: 'short', timeZone: FUSO }).format(data)
export function duracao(minutos) {
  if (minutos == null) return VAZIO
  const m = Math.round(minutos)
  return m < 60 ? `${m} min` : `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, '0')} min`
}

// O que cada papel pode mudar (as mesmas regras da API; a tela só esconde o botão).
const QUEM_PODE = {
  entregas: ['ADMIN', 'GESTOR'],
  statusEntrega: ['ADMIN', 'GESTOR', 'OPERADOR'],
  veiculos: ['ADMIN', 'GESTOR'],
  centros: ['ADMIN'],
  usuarios: ['ADMIN'],
  mensagens: ['ADMIN', 'GESTOR'],
  rotas: ['ADMIN', 'GESTOR'],
  simulacoes: ['ADMIN', 'GESTOR'],
}

export function useSessao() {
  const { usuario } = useOutletContext()
  const pode = useCallback((acao) => QUEM_PODE[acao]?.includes(usuario.papel) ?? false, [usuario])
  return { usuario, pode }
}

export function textoDoErro(falha) {
  switch (falha?.erro) {
    case 'SEM_CONEXAO':
      return 'Sem conexão com a API. Confira a internet e tente de novo.'
    case 'FORBIDDEN':
      return 'Teu perfil não pode fazer essa ação.'
    case 'VALIDACAO':
      return 'Confira os campos marcados.'
    case 'CONFLICT':
      return falha.mensagem ?? 'A API recusou a ação por uma regra do sistema.'
    case 'UNIQUE_CONSTRAINT':
      return 'Já existe um cadastro com esse valor (placa, código ou e-mail).'
    case 'RELATION_CONSTRAINT':
      return 'Esse cadastro está ligado a outros registros e não pode ser apagado.'
    case 'NOT_FOUND':
      return 'Esse registro não existe mais. Atualize a página.'
    case 'MUITAS_TENTATIVAS':
      return 'Muitos pedidos seguidos. Espere um minuto e tente de novo.'
    default:
      return 'A API não respondeu como esperado. Tente de novo em instantes.'
  }
}

// Sessão vencida (401) em qualquer pedido: volta pro login e depois pra mesma tela.
export function useVoltarProLogin() {
  const navegar = useNavigate()
  const { pathname } = useLocation()
  return useCallback(
    (falha) => {
      if (falha?.erro !== 'NAO_AUTENTICADO') return false
      navegar(`/login?volta=${encodeURIComponent(pathname)}`, { replace: true })
      return true
    },
    [navegar, pathname],
  )
}

// Carrega dados da API. `recarregar` pede de novo (depois de salvar, por exemplo).
export function useDados(carregar) {
  const [estado, setEstado] = useState({ dados: null, erro: null, carregando: true })
  const [vez, setVez] = useState(0)
  const voltarProLogin = useVoltarProLogin()

  useEffect(() => {
    const controle = new AbortController()
    setEstado((antes) => ({ ...antes, carregando: true }))
    carregar({ sinal: controle.signal })
      .then((dados) => setEstado({ dados, erro: null, carregando: false }))
      .catch((falha) => {
        if (controle.signal.aborted || voltarProLogin(falha)) return
        setEstado((antes) => ({ ...antes, erro: falha, carregando: false }))
      })
    return () => controle.abort()
    // carregar é uma função de módulo (estável); só `vez` pede de novo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vez])

  const recarregar = useCallback(() => setVez((v) => v + 1), [])
  return { ...estado, recarregar }
}

// Faz uma ação (salvar, apagar…) e devolve o erro em texto, se houver.
export function useAcao() {
  const [ocupado, setOcupado] = useState(null)
  const [erro, setErro] = useState(null)
  const voltarProLogin = useVoltarProLogin()

  const fazer = useCallback(
    async (nome, acao) => {
      setOcupado(nome)
      setErro(null)
      try {
        return await acao()
      } catch (falha) {
        if (!voltarProLogin(falha)) setErro(falha)
        return undefined
      } finally {
        setOcupado(null)
      }
    },
    [voltarProLogin],
  )
  return { ocupado, erro, setErro, fazer }
}
