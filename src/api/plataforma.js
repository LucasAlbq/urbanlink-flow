import { pedir } from './cliente.js'

// Área logada (/app). Toda rota daqui pede a sessão (o cookie do login); sem ela a API responde
// 401 e a tela manda pro /login. Não há dados de exemplo: a plataforma só funciona com a API.
// As listas pedem 100 por página, o máximo da API, o que cobre os dados de demonstração.

const lista = (caminho, opcoes, filtros = {}) =>
  pedir(`${caminho}?${new URLSearchParams({ pageSize: '100', ...filtros })}`, opcoes)
const criar = (caminho) => (corpo) => pedir(caminho, { metodo: 'POST', corpo })
const editar = (caminho) => (id, corpo) => pedir(`${caminho}/${id}`, { metodo: 'PATCH', corpo })
const apagar = (caminho) => (id) => pedir(`${caminho}/${id}`, { metodo: 'DELETE' })

// Monitoramento
export const buscarResumo = (opcoes) => pedir('/dashboard/summary', opcoes)
export const buscarMapa = (opcoes) => pedir('/dashboard/map', opcoes)

// Entregas. Apagar cancela a entrega (a API guarda o histórico).
export const listarEntregas = (opcoes) => lista('/deliveries', opcoes)
export const criarEntrega = criar('/deliveries')
export const editarEntrega = editar('/deliveries')
export const cancelarEntrega = apagar('/deliveries')
export const atribuirVeiculo = (id, vehicleId) =>
  pedir(`/deliveries/${id}/assign`, { metodo: 'POST', corpo: { vehicleId } })
export const mudarStatusEntrega = (id, status) =>
  pedir(`/deliveries/${id}/status`, { metodo: 'PATCH', corpo: { status } })

// Veículos e centros de distribuição. O DELETE de veículo não apaga: marca como inativo, e ele
// continua no histórico das rotas. O de centro apaga de verdade (se não tiver entregas).
export const listarVeiculos = (opcoes) => lista('/vehicles', opcoes)
export const criarVeiculo = criar('/vehicles')
export const editarVeiculo = editar('/vehicles')
export const desativarVeiculo = apagar('/vehicles')

export const listarCentros = (opcoes) => lista('/distribution-centers', opcoes)
export const criarCentro = criar('/distribution-centers')
export const editarCentro = editar('/distribution-centers')
export const apagarCentro = apagar('/distribution-centers')

// Usuários (só ADMIN) e mensagens do Fale com a gente (ADMIN e GESTOR)
export const listarUsuarios = (opcoes) => lista('/users', opcoes)
export const criarUsuario = criar('/users')
export const editarUsuario = editar('/users')
export const listarMensagens = (opcoes) => pedir('/public/inquiries', opcoes)

// Rotas. O DELETE cancela a rota planejada (ela fica na lista como Cancelada).
export const listarRotas = (opcoes) => lista('/routes', opcoes)
export const criarRota = criar('/routes')
export const cancelarRota = apagar('/routes')
export const otimizarRota = (id) => pedir(`/routes/${id}/optimize`, { metodo: 'POST', corpo: {} })
export const iniciarRota = (id) => pedir(`/routes/${id}/start`, { metodo: 'POST' })
export const concluirRota = (id) => pedir(`/routes/${id}/complete`, { metodo: 'POST' })

// Simulações
export const listarSimulacoes = (opcoes) => lista('/simulations', opcoes)
export const criarSimulacao = criar('/simulations')
export const rodarSimulacao = (id) => pedir(`/simulations/${id}/run`, { metodo: 'POST' })
export const apagarSimulacao = apagar('/simulations')
