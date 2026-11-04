import { ErroApi } from '../cliente.js'

// Dados de exemplo do rastreio: só com VITE_USAR_EXEMPLOS=true, nunca no build.
// UL123456789BR é o do Figma. Os outros códigos existem só pra ver cada estado da tela.
const EVENTOS = [
  { etapa: 'POSTADO', data: '2026-10-20T14:42:00-03:00', local: 'São Paulo, SP' },
  { etapa: 'EM_TRANSITO', data: '2026-10-21T07:21:00-03:00', local: 'São Paulo, SP' },
  { etapa: 'EM_ROTA', data: '2026-10-23T16:22:00-03:00', local: 'Rio de Janeiro, RJ' },
]

// Rota de exemplo no Rio (Cidade Nova → Botafogo), tirada de um roteador e simplificada:
// as coordenadas são inventadas, como as do formato em 04-api-e-dados.md. A posição de cada
// status fica na mesma fração do caminho que o MapaIlustrado usa (etapas.js, NO_MAPA).
const ROTA = {
  type: 'LineString',
  coordinates: [
    [-43.20553, -22.91042], [-43.20481, -22.91022], [-43.20464, -22.91054], [-43.19749, -22.9084],
    [-43.19718, -22.90858], [-43.1943, -22.91591], [-43.19423, -22.91652], [-43.1946, -22.91869],
    [-43.19432, -22.9199], [-43.18571, -22.93122], [-43.18481, -22.93306], [-43.18232, -22.94186],
    [-43.18373, -22.94385], [-43.18217, -22.94421], [-43.18255, -22.94601], [-43.1825, -22.94768],
    [-43.18303, -22.94775],
  ],
}
const POSICAO = {
  POSTADO: ROTA.coordinates[0],
  EM_TRANSITO: [-43.19329, -22.92125],
  EM_ROTA: [-43.18445, -22.93434],
  ENTREGUE: ROTA.coordinates[ROTA.coordinates.length - 1],
}

const base = { previsao: '2026-10-24', imprevisto: null, rota: ROTA }

const EXEMPLOS = {
  UL123456789BR: { ...base, status: 'EM_ROTA', eventos: EVENTOS, posicaoAtual: POSICAO.EM_ROTA },
  ULEXEMPLOPOSTADO: { ...base, status: 'POSTADO', eventos: EVENTOS.slice(0, 1), posicaoAtual: POSICAO.POSTADO },
  ULEXEMPLOTRANSITO: { ...base, status: 'EM_TRANSITO', eventos: EVENTOS.slice(0, 2), posicaoAtual: POSICAO.EM_TRANSITO },
  ULEXEMPLOIMPREVISTO: {
    ...base,
    status: 'IMPREVISTO',
    eventos: EVENTOS,
    posicaoAtual: POSICAO.EM_ROTA,
    imprevisto: { motivo: 'Rua bloqueada por obra no bairro de destino.', novaPrevisao: '2026-10-25' },
  },
  ULEXEMPLOENTREGUE: {
    ...base,
    status: 'ENTREGUE',
    posicaoAtual: POSICAO.ENTREGUE,
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
