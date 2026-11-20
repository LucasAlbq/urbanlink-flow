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
const SAIDA = 2.2 // a cortina sobe e o pacote voa até a rota do hero
const SAIDA_REDUZIDO = 0.6 // movimento reduzido: o logo pronto fica 0,6 s

// Passagem abertura → hero, contada a partir da saída (2,20 s).
const CORTINA = 0.5 // a cortina sobe (0,3 s quando a pessoa pula)
const VOO = 0.6 // o pacote voa em arco (power2.inOut)
const ENTRADA = 0.25 // título, texto e botões do hero sobem 12 px (2,45 s)
const ARCO = 160 // controle da curva do voo: ela passa 80 px acima do meio da reta

// Peças do hero que a passagem usa, marcadas com data-* em Hero.jsx e Skyline.jsx:
// o texto que entra, o pacote da rota (com o halo) e o ponto amarelo dele.
function partesDoHero(hero) {
  const q = gsap.utils.selector(hero)
  return { texto: q('[data-entrada]'), pacote: q('[data-pacote]'), ponto: q('[data-ponto]')[0] }
}

function centro(elemento) {
  const caixa = elemento.getBoundingClientRect()
  return { x: caixa.left + caixa.width / 2, y: caixa.top + caixa.height / 2, d: caixa.width }
}

// Os dois fios da máscara do A num tween só, de 0 a 1: o progresso se divide entre o P1
// (478,8) e o P2 (133,6) na proporção dos comprimentos, como o strand_offsets() do gen.py.
function pintarTraco(fio1, fio2, progresso) {
  const andado = progresso * (G.l1 + G.l2)
  fio1.style.strokeDashoffset = String(G.l1 - Math.min(andado, G.l1))
  fio2.style.strokeDashoffset = String(G.l2 - Math.max(0, andado - G.l1))
}

// Monta a timeline do logo (rode dentro do gsap.matchMedia() do componente).
// logo: elemento com o LogoAnimado dentro. hero: a seção do hero, embaixo da cortina.
// aoSair: chamado no rótulo 'saida', a hora da cortina sair. Pular = tl.progress(1): o logo
// fica pronto e o aoSair é chamado na hora.
// Devolve a timeline, a chegada no hero (pra montarSaida) e a limpeza do traço (o tween do
// traço escreve direto no estilo).
export function montarAbertura(logo, { hero, reduzido, aoSair }) {
  const q = gsap.utils.selector(logo)
  const parte = (nome) => q(`[data-ul-ab="${nome}"]`)
  const tl = gsap.timeline({ defaults: { duration: 0.55, ease: 'expo.out' } })

  // Movimento reduzido: o logo já está pronto no HTML, sem o pacote e sem voo, e o hero
  // espera pronto embaixo da cortina.
  if (reduzido) {
    tl.addLabel('saida', SAIDA_REDUZIDO).call(aoSair, null, 'saida')
    return { tl, chegada: null, limpar() {} }
  }

  // O hero espera embaixo da cortina com o texto já visível (só sobe 12 px na passagem) e sem o
  // pacote da rota, que chega no voo. O texto não some: se ele ficasse invisível até o fim da
  // abertura, o maior elemento da tela só contaria como pintado aos 2,5 s (LCP do Lighthouse,
  // decidido em 04/11/2026). Uma animação só por peça, criada aqui parada: o from já esconde a peça, a
  // saída solta na hora certa e, desfeito, ele devolve o hero ao normal. (Com um set aqui e
  // um to na saída, o GSAP desfazia os dois na ordem errada e o texto ficava escondido.)
  const doHero = partesDoHero(hero)
  const chegada = {
    texto: gsap.from(doHero.texto, {
      y: 12,
      duration: 0.3,
      ease: 'ul',
      stagger: 0.04,
      paused: true,
    }),
    // 0,01 s: um from de duração zero conta como terminado e não esconderia o pacote já.
    pacote: gsap.from(doHero.pacote, { autoAlpha: 0, duration: 0.01, paused: true }),
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

  // O pacote fica na ponta da rota do A até a saída, quando sai voando (montarSaida).
  tl.addLabel('saida', SAIDA).call(aoSair, null, 'saida')

  const limpar = () => {
    fio1.style.removeProperty('stroke-dashoffset')
    fio2.style.removeProperty('stroke-dashoffset')
  }
  return { tl, chegada, limpar }
}

// A saída, com a passagem pro hero (02-efeitos.md, "O voo do pacote"; quadros Passagem-1 a 5):
// - a cortina sobe em 0,5 s com o ease ul (0,3 s quando a pessoa pula);
// - um ponto fixo (voo) sai do fim da rota do logo e voa em arco até o pacote da rota do
//   hero, por cima do hero já aberto. As duas pontas são medidas na hora. Ao chegar, ele
//   some e o pacote do hero aparece;
// - aos 0,25 s, título, texto e botões do hero sobem 12 px em 0,3 s, 40 ms um do outro.
// Movimento reduzido: a cortina some por opacidade em 0,3 s, sem voo, e o hero já está pronto.
// chegada: as animações paradas do hero que o montarAbertura devolveu.
export function montarSaida({ cortina, voo, hero, chegada, reduzido, pulou }) {
  const tl = gsap.timeline()
  if (reduzido || !chegada) return tl.to(cortina, { autoAlpha: 0, duration: 0.3, ease: 'ul' })

  tl.to(cortina, { yPercent: -100, duration: pulou ? 0.3 : CORTINA, ease: 'ul' }, 0)

  const [pontoDoLogo] = gsap.utils.selector(cortina)('[data-ul-ab="pacote"]')
  const { ponto } = partesDoHero(hero)
  const de = centro(pontoDoLogo)
  const para = centro(ponto)
  const meio = { x: (de.x + para.x) / 2, y: (de.y + para.y) / 2 - ARCO }

  // O ponto tem o tamanho do pacote do hero e sai do tamanho do pacote do logo.
  gsap.set(voo, {
    width: para.d,
    height: para.d,
    xPercent: -50,
    yPercent: -50,
    x: de.x,
    y: de.y,
    scale: de.d / para.d,
  })
  tl.set(pontoDoLogo, { autoAlpha: 0 }, 0)
    .set(voo, { autoAlpha: 1 }, 0)
    .to(
      voo,
      {
        motionPath: { path: `M ${de.x} ${de.y} Q ${meio.x} ${meio.y} ${para.x} ${para.y}` },
        scale: 1,
        duration: VOO,
        ease: 'power2.inOut',
      },
      0,
    )
    .set(voo, { autoAlpha: 0 }, VOO)
    .add(chegada.pacote, VOO)
    .add(chegada.texto, ENTRADA)
  // Soltas depois de entrar na timeline, elas ficam nas posições dela.
  chegada.pacote.paused(false)
  chegada.texto.paused(false)
  return tl
}
