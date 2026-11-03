// Monta as placas da estrada a partir da resposta do rastreio
// (tabela "Status" de docs/plano/04-api-e-dados.md).

export const ETAPAS = [
  { chave: 'POSTADO', nome: 'Postado' },
  { chave: 'EM_TRANSITO', nome: 'Em trânsito' },
  { chave: 'EM_ROTA', nome: 'Em rota' },
  { chave: 'ENTREGUE', nome: 'Entregue' },
]

export const TITULOS = {
  POSTADO: 'Postado',
  EM_TRANSITO: 'Em trânsito',
  EM_ROTA: 'Em rota de entrega',
  IMPREVISTO: 'Teve um imprevisto no caminho',
  ENTREGUE: 'Entregue',
}

// Índice da placa atual por status. IMPREVISTO para na placa 3, que vira "Imprevisto".
const ATUAL = { POSTADO: 0, EM_TRANSITO: 1, EM_ROTA: 2, IMPREVISTO: 2 }

// Onde o pacote fica no mapa desenhado (0 a 1 da rota). O mapa não é geográfico:
// cada etapa tem um ponto fixo. Em rota é o ponto da prancha (659 de 935 px de rota).
const NO_MAPA = { POSTADO: 0, EM_TRANSITO: 385 / 935, EM_ROTA: 659 / 935, IMPREVISTO: 659 / 935, ENTREGUE: 1 }

const COMO_ESTA = {
  POSTADO: 'ainda está no começo do caminho',
  EM_TRANSITO: 'já percorreu parte do caminho',
  EM_ROTA: 'já percorreu a maior parte e está perto do destino',
  IMPREVISTO: 'parou perto do destino por causa de um imprevisto',
  ENTREGUE: 'chegou ao destino',
}

const ROTULO = { feito: 'feita', atual: 'etapa atual', proximo: 'ainda não' }
const GLIFO = { feito: 'check', atual: 'seta', proximo: null }

// "20/10/2026, 14:42", sempre no horário de Brasília.
const formatoDataHora = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'America/Sao_Paulo',
})

export const dataHora = (iso) => formatoDataHora.format(new Date(iso))

// "2026-10-24" → "24/10/2026" sem passar por Date (evita virar o dia anterior pelo fuso).
export function data(dia) {
  const [a, m, d] = dia.slice(0, 10).split('-')
  return `${d}/${m}/${a}`
}

// Devolve as placas, onde está o pacote e o ponto no mapa.
export function montarRastreio(dados) {
  const { status, eventos = [], imprevisto } = dados
  const entregue = status === 'ENTREGUE'
  const atual = entregue ? ETAPAS.length : (ATUAL[status] ?? 0)
  const eventoDe = (chave) => eventos.find((e) => e.etapa === chave)

  const placas = ETAPAS.map((etapa, i) => {
    let estado = i < atual ? 'feito' : i === atual ? 'atual' : 'proximo'
    let nome = etapa.nome
    let glifo = GLIFO[estado]

    // Com imprevisto, a placa 2 depende de onde parou e a placa 3 vira Imprevisto.
    if (status === 'IMPREVISTO') {
      if (i === 1 && !eventoDe('EM_TRANSITO')) {
        estado = 'proximo'
        glifo = null
      }
      if (i === 2) {
        nome = 'Imprevisto'
        glifo = 'desvio'
      }
    }

    const evento = eventoDe(etapa.chave)
    return {
      chave: etapa.chave,
      placa: { numero: i + 1, nome, glifo, estado, tamanho: 'pequeno', rotuloEstado: ROTULO[estado] },
      trecho: i <= atual ? 'feito' : 'futuro',
      evento: estado === 'proximo' ? null : evento,
      motivo: status === 'IMPREVISTO' && i === 2 ? imprevisto?.motivo : null,
    }
  })

  return {
    placas,
    pacoteEm: entregue ? 'fim' : atual,
    progresso: NO_MAPA[status] ?? 0,
    comoEsta: COMO_ESTA[status] ?? '',
    previsao: imprevisto?.novaPrevisao ?? dados.previsao,
    entregueEm: entregue ? eventoDe('ENTREGUE')?.data : null,
  }
}
