import { ErroApi, pedir } from './cliente.js'

// GET /public/tracking/:code (docs/plano/04-api-e-dados.md, "Rastreio").
// Com VITE_USAR_EXEMPLOS=true responde com src/api/exemplos/rastreio.js. A condição precisa
// ler import.meta.env aqui mesmo: o Vite troca pelo valor e o ramo some do build.
export async function buscarRastreio(codigo, { sinal } = {}) {
  if (import.meta.env.VITE_USAR_EXEMPLOS === 'true') {
    const { rastreioDeExemplo } = await import('./exemplos/rastreio.js')
    return rastreioDeExemplo(codigo, sinal)
  }
  const entrega = await pedir(`/public/tracking/${encodeURIComponent(codigo)}`, { sinal })
  return paraOSite(entrega)
}

// Status da entrega na API → status da tela (as quatro placas de etapas.js).
// Falhou e cancelada não têm placa própria: viram o Imprevisto.
const STATUS = {
  PENDING: 'POSTADO',
  ASSIGNED: 'EM_TRANSITO',
  IN_TRANSIT: 'EM_ROTA',
  DELIVERED: 'ENTREGUE',
  FAILED: 'IMPREVISTO',
  CANCELED: 'IMPREVISTO',
}

// Cada evento do histórico cai numa placa. O do imprevisto fica na placa 3 (Em rota), que é a
// que vira "Imprevisto" na tela.
const ETAPA_DO_EVENTO = {
  PENDING: 'POSTADO',
  ASSIGNED: 'EM_TRANSITO',
  IN_TRANSIT: 'EM_ROTA',
  FAILED: 'EM_ROTA',
  CANCELED: 'EM_ROTA',
  DELIVERED: 'ENTREGUE',
}

// "2026-10-24" no horário de Brasília (a tela mostra só o dia da previsão).
const diaEmBrasilia = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' })
const dia = (iso) => (iso ? diaEmBrasilia.format(new Date(iso)) : null)

function paraOSite(entrega) {
  const status = STATUS[entrega.status] ?? 'POSTADO'

  // Uma entrega pode voltar de etapa (falhou e saiu de novo): fica o último evento de cada placa.
  const porEtapa = new Map()
  for (const evento of entrega.events ?? []) {
    const etapa = ETAPA_DO_EVENTO[evento.status]
    if (etapa) porEtapa.set(etapa, { etapa, data: evento.occurredAt, local: evento.location ?? '' })
  }

  return {
    codigo: entrega.trackingCode,
    status,
    // Sem previsão calculada, vale o prazo combinado. Com imprevisto, a API não dá previsão nova.
    previsao: status === 'IMPREVISTO' ? dia(entrega.estimatedArrival) : dia(entrega.estimatedArrival ?? entrega.serviceDeadline),
    eventos: [...porEtapa.values()],
    imprevisto: status === 'IMPREVISTO' ? { motivo: null, novaPrevisao: null } : null,
    // A API não manda rota nem posição (o endereço do destino não sai dela): a tela usa o mapa
    // ilustrado.
  }
}

export { ErroApi }
