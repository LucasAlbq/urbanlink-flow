import { ErroApi } from '../cliente.js'

// Dados de exemplo do rastreio: só com VITE_USAR_EXEMPLOS=true, nunca no build.
// UL123456789BR é o do Figma. Os outros códigos existem só pra ver cada estado da tela.
const EVENTOS = [
  { etapa: 'POSTADO', data: '2026-10-20T14:42:00-03:00', local: 'São Paulo, SP' },
  { etapa: 'EM_TRANSITO', data: '2026-10-21T07:21:00-03:00', local: 'São Paulo, SP' },
  { etapa: 'EM_ROTA', data: '2026-10-23T16:22:00-03:00', local: 'Rio de Janeiro, RJ' },
]

const base = { previsao: '2026-10-24', imprevisto: null, rota: null, posicaoAtual: null }

const EXEMPLOS = {
  UL123456789BR: { ...base, status: 'EM_ROTA', eventos: EVENTOS },
  ULEXEMPLOPOSTADO: { ...base, status: 'POSTADO', eventos: EVENTOS.slice(0, 1) },
  ULEXEMPLOTRANSITO: { ...base, status: 'EM_TRANSITO', eventos: EVENTOS.slice(0, 2) },
  ULEXEMPLOIMPREVISTO: {
    ...base,
    status: 'IMPREVISTO',
    eventos: EVENTOS,
    imprevisto: { motivo: 'Rua bloqueada por obra no bairro de destino.', novaPrevisao: '2026-10-25' },
  },
  ULEXEMPLOENTREGUE: {
    ...base,
    status: 'ENTREGUE',
    eventos: [...EVENTOS, { etapa: 'ENTREGUE', data: '2026-10-24T10:05:00-03:00', local: 'Rio de Janeiro, RJ' }],
  },
}

const esperar = (ms, sinal) =>
  new Promise((ok, falha) => {
    const t = setTimeout(ok, ms)
    sinal?.addEventListener('abort', () => {
      clearTimeout(t)
      falha(sinal.reason)
    })
  })

export async function rastreioDeExemplo(codigo, sinal) {
  await esperar(600, sinal) // dá tempo de ver o "Buscando a entrega…"
  if (codigo === 'ULEXEMPLOERRO') throw new ErroApi('SEM_CONEXAO')
  const exemplo = EXEMPLOS[codigo]
  if (!exemplo) throw new ErroApi('ENTREGA_NAO_ENCONTRADA', 404)
  return { codigo, ...exemplo }
}
