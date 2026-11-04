// Status do rastreamento (docs/plano/02-efeitos.md, "Os outros efeitos"), quando a resposta
// da API chega: os trechos feitos se preenchem (0,25 s cada, um depois do outro), o pacote
// desliza do começo da estrada até a etapa atual (0,8 s, ul) e o mapa desenha o trecho
// percorrido (0,8 s, power2.inOut). As três coisas começam juntas.
// O trecho se preenche encolhendo a capa clara que o Etapa põe no asfalto feito
// ([data-cobre]): da esquerda pra direita, ou de cima pra baixo na estrada vertical.
// Uma animação só por peça (fromTo): desfeita, ela devolve a tela ao estado final.
// Rode dentro do gsap.matchMedia() do Rastreamento, fora do modo reduzido (lá fica o estado final).
import gsap from 'gsap'

export function montarStatus(raiz, { vertical }) {
  const q = gsap.utils.selector(raiz)
  const [estrada] = q('[data-estrada]')
  const tl = gsap.timeline({ defaults: { immediateRender: true } })

  q('[data-estrada] [data-cobre]').forEach((cobre, i) => {
    const [de, para] = vertical
      ? [{ scaleX: 1, scaleY: 1, transformOrigin: '50% 100%' }, { scaleX: 1, scaleY: 0 }]
      : [{ scaleX: 1, transformOrigin: '100% 50%' }, { scaleX: 0 }]
    tl.fromTo(cobre, de, { ...para, duration: 0.25, ease: 'none' }, i * 0.25)
  })

  const [pacote] = q('[data-estrada] [data-pacote]')
  if (pacote) {
    const inicio = estrada.getBoundingClientRect()
    const agora = pacote.getBoundingClientRect()
    const [de, para] = vertical
      ? [{ y: inicio.top - agora.top }, { y: 0 }]
      : [{ x: inicio.left - agora.left }, { x: 0 }]
    tl.fromTo(pacote, de, { ...para, duration: 0.8, ease: 'ul' }, 0)
  }

  const feito = q('[data-mapa-feito]')
  if (feito.length) {
    tl.fromTo(feito, { drawSVG: '0%' }, { drawSVG: '100%', duration: 0.8, ease: 'power2.inOut' }, 0)
  }
  return tl
}
