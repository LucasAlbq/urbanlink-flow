# Efeitos: especificação

Valores exatos de cada efeito. Tudo usa os tokens de `01-plano.md` e roda dentro de `useGSAP()`.

## Configuração global

```js
// src/motion/setup.js
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin'
import { CustomEase } from 'gsap/CustomEase'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin, DrawSVGPlugin, CustomEase, useGSAP)

// o mesmo --ease do CSS: cubic-bezier(0.22, 1, 0.36, 1)
CustomEase.create('ul', '0.22,1,0.36,1')

// no celular, a barra de endereço aparecendo não recalcula as travas
ScrollTrigger.config({ ignoreMobileResize: true })

export const MODOS = {
  desktop: '(min-width: 761px) and (prefers-reduced-motion: no-preference)',
  celular: '(max-width: 760px) and (prefers-reduced-motion: no-preference)',
  reduzido: '(prefers-reduced-motion: reduce)',
}
```

```jsx
// src/motion/ScrollSuave.jsx
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ReactLenis, useLenis } from 'lenis/react'
import 'lenis/dist/lenis.css'

function SincronizaScrollTrigger() {
  useLenis(ScrollTrigger.update)
  return null
}

export function ScrollSuave({ children }) {
  const lenisRef = useRef(null)
  useEffect(() => {
    const tick = (t) => lenisRef.current?.lenis?.raf(t * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
    return () => gsap.ticker.remove(tick)
  }, [])
  return (
    <ReactLenis root options={{ autoRaf: false, lerp: 0.1 }} ref={lenisRef}>
      <SincronizaScrollTrigger />
      {children}
    </ReactLenis>
  )
}
```

Regras:

- **Escopo:** cada seção usa `useGSAP(fn, { scope: refDaSecao })`.
- **Os três modos:** dentro do `useGSAP`, um `gsap.matchMedia()` com `MODOS`. No modo `reduzido`, o efeito só coloca os elementos no estado final.
- **Ao trocar de rota:** `ScrollTrigger.refresh()` depois que a página monta e `document.fonts.ready` resolve. O scroll volta ao topo com `lenis.scrollTo(0, { immediate: true })`.
- **Âncoras:** `lenis.scrollTo('#como-funciona', { offset: -16 })`.

## Abertura

Tempos iguais aos da prancha `docs/referencia/abertura/Abertura-Codigo.dc.html` e do `gen.py`. No site viram uma timeline do GSAP (pular = `tl.progress(1)`).

| Momento (s) | Elemento | O que muda | Duração | Easing |
| --- | --- | --- | --- | --- |
| 0 | Pacote (ponto amarelo) | Escala 0 → 1 na base do A | 0,3 s | `back.out(1.7)` |
| 0,35 | Traço do A (máscara) + pacote | O pacote percorre a rota e o A se pinta atrás dele | 1,2 s | `power2.inOut` |
| 1,00 / 1,07 / 1,14 | U, R, B | Sobem 215 → 0 dentro do recorte | 0,55 s cada | `expo.out` |
| 1,30 / 1,37 / 1,44 / 1,51 | L, I, N, K | Sobem 200 → 0 dentro do recorte | 0,55 s cada | `expo.out` |
| 1,50 | Seta | Encaixa de x −18 → 0 e aparece em 0,15 s | 0,45 s | `back.out(1.7)` |
| 1,55 | N de URBAN | Sobe junto com a seta | 0,55 s | `expo.out` |
| 2,20 | Cortina | Sobe (yPercent 0 → −100) | 0,5 s | `ul` |
| 2,20 | Pacote | Voa em arco até o ponto da rota do hero | 0,6 s | `power2.inOut` |
| 2,45 | Hero | Entrada do título, texto e botões | 0,3 s | `ul` |

- **Os dois fios do traço:** a máscara usa P1 (comprimento 478,8) e P2 (133,6), em `geom.json`. Um único tween de 0 a 1 com `onUpdate` divide o progresso entre os dois na proporção dos comprimentos (`strand_offsets()` do gerador).
- **O voo do pacote:** medir o ponto no logo e o ponto da rota no hero (`getBoundingClientRect`). Um ponto fixo voa entre os dois com `motionPath` de três pontos, o do meio 80 px acima da reta. Ao chegar, ele some e o pacote do hero aparece. Quadros de referência: `docs/referencia/abertura/Passagem-1.png` a `Passagem-5.png`.
- **Quando toca:** só na rota `/` e só se `sessionStorage['ul-abertura']` não existir. Por link direto, nunca.
- **Pular:** "Pular abertura" é o primeiro item focável. Clique ou tecla fazem `tl.progress(1)` e a cortina sai em 0,3 s.
- **Durante a abertura:** `lenis.stop()` e o hero com `inert`. No fim, `lenis.start()` e sai o `inert`.
- **Movimento reduzido:** logo pronto por 0,6 s, cortina some por opacidade em 0,3 s, sem voo.
- **Ids do SVG:** prefixo próprio (`ul-ab-`). Ids de máscara repetidos na página quebram o desenho.

## Hero

Três camadas de prédios em SVGs separados. Enquanto o hero sai da tela, cada camada desce:

| Camada | Desktop | Celular |
| --- | --- | --- |
| Prédios do fundo | desce 240 px | desce 60 px |
| Prédios do meio + rota + pacote | desce 120 px | desce 30 px |
| Prédios da frente | 0 | 0 |
| Texto e botões | 0 | 0 |

```js
const mm = gsap.matchMedia()
mm.add(MODOS, ({ conditions: c }) => {
  if (c.reduzido) return
  const fundo = c.desktop ? 240 : 60
  const meio  = c.desktop ? 120 : 30
  const st = { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true }
  gsap.to('.camada-fundo', { y: fundo, ease: 'none', scrollTrigger: st })
  gsap.to('.camada-meio',  { y: meio,  ease: 'none', scrollTrigger: st })
})
```

Pacote andando na rota (P2): `motionPath: { path: '#rota-hero', align: '#rota-hero', alignOrigin: [0.5, 0.5] }`, 14 s, `ease: 'none'`, repetindo (some 0,2 s antes do fim e reaparece no começo). Pausa fora da tela (`toggleActions: 'play pause resume pause'`). Reduzido: parado.

## Jornada

Desktop: timeline de duração 1 presa à rolagem. O pacote anda de 0,1 a 1,0 e cada placa sobe quando ele passa pelo poste dela (posição medida, não fixa).

```js
mm.add(MODOS, ({ conditions: c }) => {
  if (c.reduzido) return
  if (c.desktop) {
    const estrada = q('.jr')[0]
    const largura = () => estrada.offsetWidth - 26
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: '.jornada', pin: true, start: 'top top',
        end: '+=250%', scrub: 0.6, invalidateOnRefresh: true,
      },
    })
    tl.set('.st-pole', { scaleY: 0, transformOrigin: '50% 100%' })
      .set('.st-text', { autoAlpha: 0, y: 12 })
      .to('.pacote-jornada', { x: largura, duration: 0.9 }, 0.1)
    q('.st').forEach((etapa) => {
      const poste = etapa.querySelector('.st-post')
      const centro = poste.getBoundingClientRect().left - estrada.getBoundingClientRect().left
      const quando = 0.1 + 0.9 * (centro / largura()) - 0.02
      tl.to(etapa.querySelector('.st-pole'), { scaleY: 1, duration: 0.06, ease: 'back.out(1.7)' }, quando)
        .to(etapa.querySelector('.st-text'), { autoAlpha: 1, y: 0, duration: 0.05 }, quando + 0.03)
    })
    tl.to('.st-dash', { backgroundPositionX: '-200px', duration: 1 }, 0)
  }
  if (c.celular) {
    q('.st').forEach((etapa) => {
      gsap.from(etapa.querySelector('.st-road'), {
        scaleY: 0, transformOrigin: '50% 0%', ease: 'none',
        scrollTrigger: { trigger: etapa, start: 'top 70%', end: 'bottom 70%', scrub: true },
      })
      gsap.from(etapa.querySelectorAll('.st-pole, .st-text'), {
        autoAlpha: 0, y: 16, duration: 0.4, ease: 'ul', stagger: 0.08,
        scrollTrigger: { trigger: etapa, start: 'top 72%', once: true },
      })
    })
  }
})
```

- `q` = `gsap.utils.selector(refDaSecao)`.
- A placa sobe junto com o poste a partir do pé (`transformOrigin: '50% 100%'`).
- A placa do Imprevisto balança uma vez depois de subir: `rotation −4 → 3 → 0`.
- A seta do fim passa de Ouro pra Amarelo quando o pacote chega (últimos 0,02).
- O pacote da jornada é um `span` amarelo de 26 px na primeira etapa.
- A trava dura 250% da altura da tela. Ajustar entre 200% e 300% testando com mouse e touchpad.

## Os outros efeitos

| Efeito | Gatilho | O que acontece | Duração e easing | Reduzido |
| --- | --- | --- | --- | --- |
| A da chamada final | Topo da seção em 60% da tela, `once: true` | Fios P1 e P2 da máscara de `drawSVG: 0` a `100%` | 1,2 s `power2.inOut` (P1 0,94 s + P2 0,26 s) | A pronto |
| Status do rastreamento | Resposta da API | Trechos feitos se preenchem, o pacote desliza até a etapa atual, o mapa desenha o trecho percorrido | Trechos 0,25 s cada; pacote 0,8 s `ul`; mapa 0,8 s `power2.inOut` | Estado final |
| Pulso do pacote atual | Pacote parado numa etapa | Anel cresce de 1 a 1,6 e some | 2 s, repetindo, CSS | Anel fixo |
| Espera da API com o A | Pedido demorando mais de 300 ms | A de 32 px se desenha e se apaga em loop, com o texto da espera | 1,2 s por volta | A parado + texto |
| Logo do topo | Hover (`@media (hover: hover)`) | A seta: x −6 → 0 | 0,35 s `back.out(2)` | Nada |
| Mensagem enviada | Ao abrir | O pacote corre a mini estrada e a seta encaixa | 0,6 s `power2.inOut` + 0,3 s `back.out(1.7)` | Estado final |
| Micro-interações | Hover, clique, foco | Sombra, aperto 0,97, anel de foco 6 → 3 px, sublinhado 2 → 3 px | 180 ms `--ease` | 1 ms |

`<CarregandoA tamanho={32} texto="…" />` substitui qualquer rodinha. Só aparece depois de 300 ms. O texto ("Buscando a entrega…", "Enviando…", "Entrando…") fica em `aria-live="polite"`. Em botão, o botão fica `disabled` e troca o texto.

## Teste de aceite dos efeitos

- [ ] 60 quadros por segundo na jornada (painel Performance do Chrome sem quadros vermelhos)
- [ ] Com "reduzir movimento" ligado, nada se mexe e nenhum conteúdo fica escondido
- [ ] Rolar rápido não deixa placa pela metade nem pacote fora da estrada
- [ ] Redimensionar a janela no meio da jornada não quebra a trava
- [ ] Sair da landing e voltar não deixa trava fantasma nem efeito duplicado
- [ ] A abertura não toca de novo na mesma sessão nem por link direto
- [ ] "Pular abertura" funciona com mouse, Enter e toque
- [ ] Só `transform` e `opacity` animados (fora o traço da máscara e as faixas da estrada)
- [ ] O texto continua selecionável e o Ctrl+F acha palavras dentro da jornada travada
