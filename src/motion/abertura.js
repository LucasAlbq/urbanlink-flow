// Abertura da landing (docs/plano/02-efeitos.md, "Abertura"): o pacote percorre o A, o A se
// pinta atrás dele, as letras sobem, a seta encaixa e a cortina sobe. Os tempos são os da
// tabela do plano, iguais aos da prancha docs/referencia/abertura/Abertura-Codigo.dc.html
// e do docs/referencia/geradores/gen.py. Quem toca é o componente pages/landing/Abertura.jsx.
import gsap from 'gsap'

import { LOGO_ABERTURA as G } from '../components/logoAnimadoCaminhos.js'

const CHAVE = 'ul-abertura'

// Quando toca. Decidido uma vez, na carga da página (este módulo roda quando o site carrega):
// - só se a visita começa em "/" sem âncora e se sessionStorage['ul-abertura'] não existe;
// - "por link direto, nunca": quem entra por um link pra outra rota (/rastreamento/UL…) ou
//   pra uma seção (/#como-funciona) não vê a abertura nesta sessão, nem ao ir pra "/" depois;
// - a chave é gravada já na carga: recarregar no meio da abertura não repete.
// Ir pra "/" pelos links do site não é carregar "/" (01-plano.md: "Ao carregar /").
let pendente = decidir()

function decidir() {
  try {
    const jaViu = sessionStorage.getItem(CHAVE) !== null
    sessionStorage.setItem(CHAVE, '1')
    return !jaViu && window.location.pathname === '/' && !window.location.hash
  } catch {
    // Sem sessionStorage (bloqueado pelo navegador), não tem como lembrar: sem abertura.
    return false
  }
}

export function aberturaPendente() {
  return pendente
}

// A abertura começou: voltar pra "/" depois, sem recarregar, não repete.
export function aberturaComecou() {
  pendente = false
}

// Momentos (s) da tabela do plano.
const PACOTE = 0 // o pacote cresce na base do A
const TRACO = 0.35 // o pacote percorre a rota e o A se pinta atrás dele
const URB = { u: 1.0, r: 1.07, b: 1.14 } // sobem 215 → 0
const LINK = { l: 1.3, i: 1.37, n2: 1.44, k: 1.51 } // sobem 200 → 0
const SETA = 1.5
const N = 1.55 // o N de URBAN sobe junto com a seta
const SAIDA = 2.2 // a cortina sobe
const SAIDA_REDUZIDO = 0.6 // movimento reduzido: o logo pronto fica 0,6 s

// Os dois fios da máscara do A num tween só, de 0 a 1: o progresso se divide entre o P1
// (478,8) e o P2 (133,6) na proporção dos comprimentos, como o strand_offsets() do gen.py.
function pintarTraco(fio1, fio2, progresso) {
  const andado = progresso * (G.l1 + G.l2)
  fio1.style.strokeDashoffset = String(G.l1 - Math.min(andado, G.l1))
  fio2.style.strokeDashoffset = String(G.l2 - Math.max(0, andado - G.l1))
}

// Monta a timeline do logo (rode dentro do gsap.matchMedia() do componente).
// logo: elemento com o LogoAnimado dentro. aoSair: chamado no rótulo 'saida', a hora da
// cortina sair. Pular = tl.progress(1): o logo fica pronto e o aoSair é chamado na hora.
// Devolve a timeline e a limpeza do traço (o tween do traço escreve direto no estilo).
export function montarAbertura(logo, { reduzido, aoSair }) {
  const q = gsap.utils.selector(logo)
  const parte = (nome) => q(`[data-ul-ab="${nome}"]`)
  const tl = gsap.timeline({ defaults: { duration: 0.55, ease: 'expo.out' } })

  // Movimento reduzido: o logo já está pronto no HTML, sem o pacote e sem voo.
  if (reduzido) {
    tl.addLabel('saida', SAIDA_REDUZIDO).call(aoSair, null, 'saida')
    return { tl, limpar() {} }
  }

  const [fio1] = parte('fio1')
  const [fio2] = parte('fio2')
  const [pacote] = parte('pacote')
  const traco = { progresso: 0 }
  const pintar = () => pintarTraco(fio1, fio2, traco.progresso)
  pintar()

  gsap.set(pacote, { autoAlpha: 1, scale: 0, transformOrigin: '50% 50%' })
  tl.to(pacote, { scale: 1, duration: 0.3, ease: 'back.out(1.7)' }, PACOTE)
    .to(
      pacote,
      { motionPath: { path: G.rota }, duration: 1.2, ease: 'power2.inOut', immediateRender: true },
      TRACO,
    )
    .to(traco, { progresso: 1, duration: 1.2, ease: 'power2.inOut', onUpdate: pintar }, TRACO)

  for (const [letra, quando] of Object.entries(URB)) tl.from(parte(letra), { y: 215 }, quando)
  for (const [letra, quando] of Object.entries(LINK)) tl.from(parte(letra), { y: 200 }, quando)
  tl.from(parte('seta'), { x: -18, duration: 0.45, ease: 'back.out(1.7)' }, SETA)
    .from(parte('seta'), { opacity: 0, duration: 0.15, ease: 'none' }, SETA)
    .from(parte('n'), { y: 215 }, N)

  // Ponto de encaixe dos próximos efeitos da lista: o voo do pacote até a rota do hero
  // (2,20 s, 0,6 s, power2.inOut) e a entrada do hero (2,45 s) entram no aoSair.
  // Até lá, o pacote fica na ponta da rota do A e sobe junto com a cortina.
  tl.addLabel('saida', SAIDA).call(aoSair, null, 'saida')

  const limpar = () => {
    fio1.style.removeProperty('stroke-dashoffset')
    fio2.style.removeProperty('stroke-dashoffset')
  }
  return { tl, limpar }
}

// A cortina sai: sobe em 0,5 s (ou em 0,3 s quando a pessoa pula). Movimento reduzido:
// some por opacidade em 0,3 s.
export function sairCortina(cortina, { reduzido, pulou, aoTerminar }) {
  const saida = reduzido
    ? { autoAlpha: 0, duration: 0.3 }
    : { yPercent: -100, duration: pulou ? 0.3 : 0.5 }
  return gsap.to(cortina, { ...saida, ease: 'ul', onComplete: aoTerminar })
}
