// Jornada da landing (docs/plano/02-efeitos.md, "Jornada"): o momento grande do site.
// As classes da prancha viram os data-* do Estrada/Etapa/Placa:
// .jr = [data-estrada] · .st = [data-etapa] · .st-pole = [data-poste] · .st-post = [data-haste]
// .st-text = [data-texto] · .st-dash = [data-faixa] · .pacote-jornada = [data-inicio]
// Rode dentro do gsap.matchMedia() da Jornada, fora do modo reduzido (lá tudo fica visível).
import gsap from 'gsap'

const TRAVA = '+=250%' // a trava dura 250% da altura da tela (o plano deixa ajustar de 200 a 300%)

export function montarJornada(secao, { desktop }) {
  const q = gsap.utils.selector(secao)
  if (desktop) travarNoDesktop(secao, q)
  else desenharNoCelular(q)
}

// Desktop: a seção trava e uma timeline de duração 1 anda com a rolagem. O pacote anda de 0,1
// a 1,0 e cada placa sobe do pé quando ele passa pelo poste dela (posição medida). O texto de
// cada etapa some só por opacidade, então o Ctrl+F continua achando as palavras.
function travarNoDesktop(secao, q) {
  const [estrada] = q('[data-estrada]')
  const [pacote] = q('[data-inicio]')
  const largura = () => estrada.offsetWidth - pacote.offsetWidth

  // Trava com o topo da seção no topo da tela. Em tela baixa (notebook de 768 px tem uns
  // 650 de janela), a seção não cabe: aí trava com ela centrada na tela, e o que fica de fora
  // é metade do respiro de cima e metade do de baixo (os dois são iguais, --secao).
  const comeco = () => (secao.offsetHeight > window.innerHeight ? 'center center' : 'top top')

  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: secao,
      pin: true,
      start: comeco,
      end: TRAVA,
      scrub: 0.6,
      invalidateOnRefresh: true,
    },
  })
  tl.to(pacote, { x: largura, duration: 0.9 }, 0.1)

  const inicio = estrada.getBoundingClientRect().left
  for (const etapa of q('[data-etapa]')) {
    const haste = etapa.querySelector('[data-haste]')
    const centro = haste.getBoundingClientRect().left + haste.offsetWidth / 2 - inicio
    const quando = 0.1 + 0.9 * (centro / largura()) - 0.02
    // Uma animação só por peça (fromTo): o from já esconde a peça e, desfeita (ao estreitar a
    // janela pro modo celular), devolve o estado normal. Com um set no começo e um to aqui, o
    // GSAP desfazia os dois na ordem errada e o poste e o texto ficavam escondidos.
    tl.fromTo(
      etapa.querySelector('[data-poste]'),
      { scaleY: 0, transformOrigin: '50% 100%' },
      { scaleY: 1, duration: 0.06, ease: 'back.out(1.7)' },
      quando,
    ).fromTo(etapa.querySelector('[data-texto]'), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.05 }, quando + 0.03)

    // A placa do Imprevisto balança uma vez depois de subir: −4° → 3° → 0.
    const imprevisto = etapa.querySelector('[data-placa][data-estado="atual"]')
    if (imprevisto) {
      tl.to(
        imprevisto,
        { keyframes: { rotation: [0, -4, 3, 0] }, duration: 0.06, transformOrigin: '50% 100%' },
        quando + 0.06,
      )
    }
  }

  // As faixas amarelas deslizam a timeline inteira; a seta do fim acende nos últimos 0,02.
  tl.to(q('[data-faixa]'), { backgroundPositionX: '-200px', duration: 1 }, 0)
    .to(q('[data-fim-aceso]'), { opacity: 1, duration: 0.02 }, 0.98)
}

// Celular: sem trava. A estrada de cada etapa se desenha de cima pra baixo com a rolagem, e
// a placa e o texto sobem quando a etapa chega a 72% da tela. Subindo a página, eles somem de
// novo junto com a estrada (com `once`, a estrada voltava e o texto ficava sozinho).
function desenharNoCelular(q) {
  for (const etapa of q('[data-etapa]')) {
    gsap.from(etapa.querySelector('[data-asfalto]'), {
      scaleY: 0,
      transformOrigin: '50% 0%',
      ease: 'none',
      scrollTrigger: { trigger: etapa, start: 'top 70%', end: 'bottom 70%', scrub: true },
    })
    gsap.from(etapa.querySelectorAll('[data-poste], [data-texto]'), {
      opacity: 0,
      y: 16,
      duration: 0.4,
      ease: 'ul',
      stagger: 0.08,
      scrollTrigger: { trigger: etapa, start: 'top 72%', toggleActions: 'play none none reverse' },
    })
  }
}
