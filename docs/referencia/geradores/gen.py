import json, math, sys, os, random

G = json.load(open('/home/user/geom.json'))
D = G['ds']
L = G['bbox']['L']
CENTER = G['center']
H = G['horiz']
OUT = '/home/user/ulcanvas/project'

NOITE = '#1A223C'
MARINHO = '#242F62'
OURO = '#E7AC29'
AMARELO = '#FFD745'
AZUL = '#3563AD'
TEXTO2 = '#C5CBE3'
FONT = "'Fira Sans', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
FONT_LINK = '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fira+Sans:wght@400;500;600;800;900&amp;display=swap">'

T_END = 2.2

# ---------- easing / timeline (must match the JS in Main) ----------
def cl(x): return max(0.0, min(1.0, x))
def ioc(x): return 4*x*x*x if x < 0.5 else 1 - pow(-2*x + 2, 3)/2
def oexp(x): return 1.0 if x >= 1 else 1 - pow(2, -10*x)
def oback(x):
    c1 = 1.70158; c3 = c1 + 1
    return 1 + c3*pow(x - 1, 3) + c1*pow(x - 1, 2)

ROW1 = ['u', 'r', 'b', 'n']
ROW2 = ['l', 'i', 'n2', 'k']
ROW1_START = [1.0, 1.07, 1.14, 1.55]

def state(t):
    r = ioc(cl((t - 0.35)/1.2))
    st = {'prog': r, 'masked': t < T_END}
    st['dot_r'] = 14*max(0.0, oback(cl(t/0.3))) if t > 0 else 0
    st['dot_op'] = 0 if t <= 0 else (1 - cl((t - 1.55)/0.2))
    a = cl((t - 1.5)/0.45)
    st['arrow_dx'] = -18*(1 - oback(a)) if a > 0 else -18
    st['arrow_op'] = cl((t - 1.5)/0.15)
    for k, s0 in zip(ROW1, ROW1_START):
        st[k] = (1 - oexp(cl((t - s0)/0.55)))*215
    for i, k in enumerate(ROW2):
        s0 = 1.3 + 0.07*i
        st[k] = (1 - oexp(cl((t - s0)/0.55)))*200
    return st

def head(title, theme='dark'):
    ring = AMARELO if theme == 'dark' else NOITE
    return f'''<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<title>{title}</title>
<script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
{FONT_LINK}
<style>
body{{margin:0}}
a{{color:{AMARELO}}}a:hover{{color:#FFFFFF}}
:root{{--ease:cubic-bezier(0.22,1,0.36,1);--fast:180ms;--med:260ms}}
a,button{{outline:2px solid transparent;outline-offset:6px;transition:outline-color var(--fast) var(--ease),outline-offset var(--fast) var(--ease)}}
a:focus-visible,button:focus-visible{{outline-color:{ring};outline-offset:3px}}
.btn{{transition:box-shadow var(--fast) var(--ease),transform var(--fast) var(--ease),outline-color var(--fast) var(--ease),outline-offset var(--fast) var(--ease)}}
.btn:hover{{box-shadow:inset 0 0 0 999px rgba(255,255,255,.14)}}
.btn:active{{transform:scale(0.97)}}
.lnk{{transition:text-decoration-thickness var(--fast) var(--ease),outline-color var(--fast) var(--ease),outline-offset var(--fast) var(--ease)}}
.lnk:hover{{text-decoration-thickness:3px}}
.rise{{animation:rise 300ms var(--ease) both}}
.rise-2{{animation-delay:40ms}}
.rise-3{{animation-delay:80ms}}
@keyframes rise{{from{{opacity:0;transform:translateY(12px)}}to{{opacity:1;transform:none}}}}
@media (max-width: 600px){{.nav-hide{{display:none !important}}}}
@media (max-width: 760px){{.city-abs{{position:relative !important;height:380px !important}}.city-pad{{padding-bottom:0 !important}}}}
@media (prefers-reduced-motion: reduce){{*,*::before,*::after{{animation-duration:1ms !important;animation-delay:0ms !important;transition-duration:1ms !important}}}}
</style>
</helmet>
'''

def tail(props, js_body='renderVals() {\n    return {};\n  }'):
    return f'''</x-dc>
<script type="text/x-dc" data-dc-script data-props='{json.dumps(props)}'>
class Component extends DCLogic {{
  {js_body}
}}
</script>
</body>
</html>
'''

def f(x): return f'{x:.2f}'.rstrip('0').rstrip('.')

# ---------- vertical logo with animation hooks ----------
def logo_anim_svg(pfx, st=None, width='620px', points=None, interactive=False):
    """st=None -> final state markup. points: (x,y) of dot head."""
    if st is None:
        st = state(T_END)
    mk, c1, c2, ca = f'{pfx}-mk', f'{pfx}-c1', f'{pfx}-c2', f'{pfx}-ca'
    dash = L*(1 - st['prog'])
    px, py = points if points else (1061.5, 536)
    letters1 = ''.join(
        f'<path data-k="{k}" d="{D[k]}" transform="translate(0 {f(st[k])})" style="fill: #FFFFFF;"></path>'
        for k in ROW1)
    letters2 = ''.join(
        f'<path data-k="{k}" d="{D[k]}" transform="translate(0 {f(st[k])})" style="fill: {OURO};"></path>'
        for k in ROW2)
    loop_mask = f' mask="url(#{mk})"' if st['masked'] else ''
    sid = f' id="{pfx}-svg"' if interactive else ''
    ref = ' ref="{{ svgRef }}"' if interactive else ''
    return f'''<svg{sid}{ref} viewBox="533.86 327 852.28 419.28" role="img" aria-label="UrbanLink" style="width: {width}; height: auto; display: block; overflow: visible;">
<defs>
<mask id="{mk}" maskUnits="userSpaceOnUse" x="1000" y="300" width="320" height="280">
<path data-k="center" d="{CENTER}" style="fill: none; stroke: #FFFFFF; stroke-width: 64; stroke-linecap: butt; stroke-linejoin: round; stroke-dasharray: {f(L)} {f(L)}; stroke-dashoffset: {f(dash)};"></path>
</mask>
<clipPath id="{c1}"><rect x="530" y="335" width="860" height="206"></rect></clipPath>
<clipPath id="{c2}"><rect x="530" y="548" width="600" height="196"></rect></clipPath>
<clipPath id="{ca}"><rect x="1212" y="330" width="80" height="220"></rect></clipPath>
<clipPath id="{pfx}-cm"><rect x="1000" y="330" width="213" height="220"></rect></clipPath>
</defs>
<g clip-path="url(#{c1})">{letters1}</g>
<g clip-path="url(#{c2})">{letters2}</g>
<g clip-path="url(#{pfx}-cm)"><path data-k="loop" d="{D['loop']}"{loop_mask} style="fill: {OURO};"></path></g>
<g clip-path="url(#{ca})"><path data-k="arrow" d="{D['loop']}" transform="translate({f(st['arrow_dx'])} 0)" style="fill: {OURO}; opacity: {f(st['arrow_op'])};"></path></g>
<circle data-k="dot" cx="{f(px)}" cy="{f(py)}" r="{f(st['dot_r'])}" style="fill: {AMARELO}; opacity: {f(st['dot_op'])};"></circle>
</svg>'''

MAIN_JS = r'''renderVals() {
    if (!this._ref) {
      this._ref = (el) => { this.svg = el; };
      this._replay = () => this.play();
    }
    return { svgRef: this._ref, replay: this._replay };
  }
  componentDidMount() { this.play(); }
  componentWillUnmount() { if (this.raf) cancelAnimationFrame(this.raf); }
  play() {
    const svg = this.svg || document.getElementById('mn-svg');
    if (!svg) return;
    const q = (k) => svg.querySelector('[data-k="' + k + '"]');
    const center = q('center'), loop = q('loop'), arrow = q('arrow'), dot = q('dot');
    const row1 = ['u', 'r', 'b', 'n'].map(q), row2 = ['l', 'i', 'n2', 'k'].map(q);
    const Lc = center.getTotalLength();
    const T = 2.2;
    const cl = (x) => Math.max(0, Math.min(1, x));
    const ioc = (x) => x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    const oexp = (x) => x >= 1 ? 1 : 1 - Math.pow(2, -10 * x);
    const oback = (x) => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2); };
    const apply = (t) => {
      const r = ioc(cl((t - 0.35) / 1.2));
      if (t < T) loop.setAttribute('mask', 'url(#mn-mk)'); else loop.removeAttribute('mask');
      center.style.strokeDashoffset = String(Lc * (1 - r));
      const p = center.getPointAtLength(Lc * r);
      dot.setAttribute('cx', p.x); dot.setAttribute('cy', p.y);
      dot.setAttribute('r', t > 0 ? 14 * Math.max(0, oback(cl(t / 0.3))) : 0);
      dot.style.opacity = String(t <= 0 ? 0 : 1 - cl((t - 1.55) / 0.2));
      const a = cl((t - 1.5) / 0.45);
      arrow.setAttribute('transform', 'translate(' + (a > 0 ? -18 * (1 - oback(a)) : -18) + ' 0)');
      arrow.style.opacity = String(cl((t - 1.5) / 0.15));
      row1.forEach((el, i) => { const s = [1.0, 1.07, 1.14, 1.55][i]; el.setAttribute('transform', 'translate(0 ' + (1 - oexp(cl((t - s) / 0.55))) * 215 + ')'); });
      row2.forEach((el, i) => { const s = 1.3 + 0.07 * i; el.setAttribute('transform', 'translate(0 ' + (1 - oexp(cl((t - s) / 0.55))) * 200 + ')'); });
    };
    if (this.raf) cancelAnimationFrame(this.raf);
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) { apply(T); return; }
    apply(0);
    let t0 = null;
    const tick = (now) => {
      if (t0 === null) t0 = now;
      const t = (now - t0) / 1000 - 0.25;
      apply(Math.max(0, Math.min(t, T)));
      if (t < T) this.raf = requestAnimationFrame(tick);
    };
    this.raf = requestAnimationFrame(tick);
  }'''

def build_main():
    svg = logo_anim_svg('mn', None, '620px', interactive=True)
    body = f'''<div style="width: 1280px; height: 720px; box-sizing: border-box; background: {NOITE}; position: relative; display: flex; align-items: center; justify-content: center; font-family: {FONT};">
{svg}
<button onClick="{{{{ replay }}}}" style="position: absolute; right: 40px; bottom: 36px; min-height: 44px; padding: 0 22px; background: transparent; color: #FFFFFF; border: 1px solid rgba(255, 255, 255, 0.4); border-radius: 6px; font-family: {FONT}; font-size: 16px; font-weight: 500; cursor: pointer;">Repetir animação</button>
</div>
'''
    return head('Abertura animada da logo') + body + tail({'$preview': {'width': 1280, 'height': 720}}, MAIN_JS)

def build_frame(name, t, point):
    st = state(t)
    svg = logo_anim_svg(name, st, '310px', points=point)
    body = f'''<div style="width: 640px; height: 360px; box-sizing: border-box; background: {NOITE}; display: flex; align-items: center; justify-content: center;">
{svg}
</div>
'''
    return head(f'Abertura em {str(t).replace(".", ",")} s') + body + tail({'$preview': {'width': 640, 'height': 360}})

# ---------- horizontal logo ----------
PADX = 'clamp(20px, 5vw, 48px)'

def logo_h(mode='dark', height=30):
    if mode == 'dark':
        cu, cl_, ca = '#FFFFFF', OURO, OURO
    else:  # mono noite
        cu = cl_ = ca = NOITE
    p = ''.join(f'<path d="{d}" style="fill: {cu};"></path>' for d in H['urbn'])
    p += ''.join(f'<path d="{d}" style="fill: {cl_};"></path>' for d in H['link'])
    p += f'<path d="{H["loop"]}" style="fill: {ca};"></path>'
    w = height*739/118
    return f'<svg viewBox="981 566 739 118" aria-hidden="true" style="width: {w:.0f}px; height: {height}px; display: block;">{p}</svg>'

def header(mode='dark'):
    if mode == 'dark':
        link_c, line = '#FFFFFF', 'rgba(255, 255, 255, 0.55)'
    else:
        link_c, line = NOITE, NOITE
    return f'''<header style="max-width: 1280px; width: 100%; margin: 0 auto; box-sizing: border-box; padding: 24px {PADX}; display: flex; align-items: center; justify-content: space-between; gap: 16px 32px;">
<a href="#inicio" aria-label="UrbanLink, início" style="display: flex; align-items: center; min-height: 44px;">{logo_h(mode)}</a>
<nav class="nav-hide" aria-label="Principal" style="display: flex; align-items: center; gap: 12px 28px;">
<a class="lnk" href="#como-funciona" style="color: {link_c}; text-decoration: none; font-size: 17px; font-weight: 500; min-height: 44px; display: inline-flex; align-items: center; white-space: nowrap;">Como funciona</a>
<a class="btn" href="#entrar" style="display: inline-flex; align-items: center; min-height: 44px; padding: 0 20px; background: transparent; color: {link_c}; border: 2px solid {line}; border-radius: 6px; font-size: 17px; font-weight: 600; text-decoration: none; white-space: nowrap; box-sizing: border-box;">Entrar na plataforma</a>
</nav>
</header>'''

def ctas(mode='dark'):
    if mode == 'dark':
        bg, fg, sec = OURO, NOITE, '#FFFFFF'
    else:
        bg, fg, sec = NOITE, '#FFFFFF', NOITE
    return f'''<div class="rise rise-3" style="display: flex; flex-wrap: wrap; align-items: center; gap: 12px 28px;">
<a class="btn" href="#entrar" style="display: inline-flex; align-items: center; justify-content: center; min-height: 56px; padding: 0 30px; background: {bg}; color: {fg}; border-radius: 6px; font-size: 19px; font-weight: 600; text-decoration: none; white-space: nowrap;">Entrar na plataforma</a>
<a class="lnk" href="#como-funciona" style="color: {sec}; font-size: 18px; font-weight: 500; text-decoration: underline; text-underline-offset: 6px; text-decoration-thickness: 2px; min-height: 44px; display: inline-flex; align-items: center; white-space: nowrap;">Ver como funciona</a>
</div>'''

# ---------- Hero A ----------
def build_hero_a():
    ext = 'M 1041.37 530.2 L 1084.95 530.2 L 1085.45 600 L 1042.6 600 Z'
    bleed = 'clamp(0px, (100vw - 600px) * 0.12, 110px)'
    big = f'''<svg viewBox="1030 335 245 265" aria-hidden="true" style="width: calc(100% + {bleed}); max-width: 720px; margin-right: calc(-1 * {bleed}); height: auto; display: block;">
<path d="{D['loop']}" style="fill: {OURO};"></path>
<path d="{ext}" style="fill: {OURO};"></path>
</svg>'''
    body = f'''<div id="inicio" style="background: {NOITE}; color: #FFFFFF; min-height: 900px; display: flex; flex-direction: column; overflow: hidden; font-family: {FONT};">
{header('dark')}
<main style="flex: 1; max-width: 1280px; width: 100%; margin: 0 auto; box-sizing: border-box; padding: 0 {PADX}; display: flex; flex-wrap: wrap; align-items: stretch; gap: 8px 40px;">
<div style="flex: 1 1 600px; min-width: 0; display: flex; flex-direction: column; justify-content: center; gap: 28px; padding: clamp(24px, 4vw, 40px) 0 clamp(16px, 8vw, 112px);">
<h1 class="rise" style="margin: 0; font-size: clamp(2.75rem, 5.2vw, 5rem); font-weight: 800; line-height: 1; letter-spacing: -0.025em;">Entregas urbanas,<br>do galpão à porta.</h1>
<p class="rise rise-2" style="margin: 0; max-width: 38ch; font-size: clamp(1.125rem, 1.4vw, 1.25rem); line-height: 1.55; color: {TEXTO2}; text-wrap: pretty;">O UrbanLink Flow acompanha a frota em tempo real, calcula a melhor rota e simula chuva, trânsito e horário de pico antes do caminhão sair.</p>
{ctas('dark')}
</div>
<div style="flex: 1 1 380px; min-width: 0; display: flex; align-items: flex-end; justify-content: flex-end;">
{big}
</div>
</main>
</div>
'''
    return head('Hero A, Rota gigante') + body + tail({'$preview': {'width': 1440, 'height': 900}})

# ---------- Hero B ----------
def skyline(seed, wmin, wmax, top_lo, top_hi, base, setback=0.3, rise=None):
    """rise: (x_from, extra) -> buildings right of x_from get up to `extra` taller, growing with x."""
    rnd = random.Random(seed)
    x = -20; d = ''
    while x < 1460:
        w = rnd.randint(wmin, wmax)
        top = rnd.randint(top_lo, top_hi)
        if rise and x > rise[0]:
            k = min(1.0, (x - rise[0])/(1440 - rise[0])*1.6)
            top -= int(rise[1]*k*rnd.uniform(0.55, 1.0))
        d += f'M {x} {base} V {top} H {x+w} V {base} Z '
        if rnd.random() < setback:
            iw = int(w*rnd.uniform(0.35, 0.6)); ix = x + rnd.randint(4, max(5, w - iw - 4))
            ih = rnd.randint(14, 44)
            d += f'M {ix} {top+1} V {top-ih} H {ix+iw} V {top+1} Z '
        x += w + rnd.choice([0, 0, 2, 6, 10])
    return d

def build_hero_b():
    B = 520
    far = skyline(7, 40, 96, 300, 400, B, rise=(860, 300))
    mid = skyline(21, 54, 120, 350, 420, B, rise=(980, 200))
    near = skyline(42, 70, 160, 452, 492, B, setback=0.15)
    route = 'M -20 420 H 250 L 320 360 H 610 L 690 430 H 930 L 1000 370 H 1262'
    arrow = 'M 1252 340 H 1282 L 1316 370 L 1282 400 H 1252 L 1278 370 Z'
    dots = ''.join(f'<circle cx="{x}" cy="{y}" r="7" style="fill: {AMARELO};"></circle>' for x, y in [(150, 420), (470, 360), (820, 430), (1110, 370)])
    city = f'''<svg class="city-abs" viewBox="0 0 1440 {B}" preserveAspectRatio="xMidYMax slice" aria-hidden="true" style="position: absolute; left: 0; right: 0; bottom: 0; margin-top: auto; width: 100%; height: {B}px; display: block;">
<path d="{far}" style="fill: #1F2853;"></path>
<path d="{mid}" style="fill: {NOITE};"></path>
<path d="{route}" style="fill: none; stroke: {OURO}; stroke-width: 12; stroke-linejoin: round; stroke-linecap: round;"></path>
<path d="{arrow}" style="fill: {OURO};"></path>
{dots}
<path d="{near}" style="fill: #121830;"></path>
</svg>'''
    body = f'''<div id="inicio" style="position: relative; background: {MARINHO}; color: #FFFFFF; min-height: 900px; display: flex; flex-direction: column; overflow: hidden; font-family: {FONT};">
<div style="position: relative; z-index: 1;">
{header('dark')}
</div>
<main class="city-pad" style="position: relative; z-index: 1; max-width: 1280px; width: 100%; margin: 0 auto; box-sizing: border-box; padding: clamp(24px, 4vw, 48px) {PADX} 300px; display: flex; flex-direction: column; gap: 28px;">
<h1 class="rise" style="margin: 0; font-size: clamp(2.75rem, 5.4vw, 5.25rem); font-weight: 800; line-height: 1; letter-spacing: -0.025em;">Planeje rotas<br>para a cidade<br>de verdade.</h1>
<p class="rise rise-2" style="margin: 0; max-width: 40ch; font-size: clamp(1.125rem, 1.4vw, 1.25rem); line-height: 1.55; color: {TEXTO2}; text-wrap: pretty;">Trânsito, chuva e horário de pico entram na conta antes do caminhão sair. O UrbanLink Flow mostra a frota ao vivo e refaz o caminho quando algo muda.</p>
{ctas('dark')}
</main>
{city}
</div>
'''
    return head('Hero B, Cidade em camadas') + body + tail({'$preview': {'width': 1440, 'height': 900}})

# ---------- Hero C ----------
def build_hero_c():
    sign = f'''<svg viewBox="0 0 1200 120" aria-hidden="true" style="width: 100%; height: auto; display: block;">
<circle cx="22" cy="92" r="15" style="fill: none; stroke: {NOITE}; stroke-width: 8;"></circle>
<path d="M 37 92 H 380 L 440 32 H 1100" style="fill: none; stroke: {NOITE}; stroke-width: 16; stroke-linejoin: round;"></path>
<path d="M 1086 2 H 1124 L 1166 32 L 1124 62 H 1086 L 1116 32 Z" style="fill: {NOITE};"></path>
</svg>'''
    body = f'''<div id="inicio" style="background: {OURO}; color: {NOITE}; min-height: 900px; box-sizing: border-box; padding: clamp(12px, 1.7vw, 24px); display: flex; font-family: {FONT};">
<div style="flex: 1; border: 4px solid {NOITE}; border-radius: clamp(12px, 1.4vw, 20px); display: flex; flex-direction: column; overflow: hidden;">
{header('mono')}
<main style="flex: 1; max-width: 1280px; width: 100%; margin: 0 auto; box-sizing: border-box; padding: 16px {PADX} clamp(32px, 5vw, 64px); display: flex; flex-direction: column; justify-content: center; gap: clamp(24px, 3vw, 40px);">
<h1 class="rise" style="margin: 0; font-size: clamp(3.25rem, 10.5vw, 10rem); font-weight: 900; line-height: 0.9; letter-spacing: -0.035em;">Do galpão à porta.</h1>
{sign}
<div style="display: flex; flex-direction: column; align-items: flex-start; gap: 28px;">
<p class="rise rise-2" style="margin: 0; max-width: 42ch; font-size: clamp(1.125rem, 1.6vw, 1.375rem); line-height: 1.45; font-weight: 500; text-wrap: pretty;">Monitoramento da frota, otimização de rotas e simulação de cenários numa plataforma só, feita para a logística urbana.</p>
{ctas('light')}
</div>
</main>
</div>
</div>
'''
    return head('Hero C, Placa', theme='light') + body + tail({'$preview': {'width': 1440, 'height': 900}})

def write(name, content):
    with open(os.path.join(OUT, name), 'w') as fh:
        fh.write(content)
    print('wrote', name, len(content))

if __name__ == '__main__':
    which = sys.argv[1]
    if which == 'main':
        write('Main.dc.html', build_main())
    elif which == 'frame':
        name, t = sys.argv[2], float(sys.argv[3])
        pts = json.load(open('/home/user/ulgen/points.json'))
        write(f'{name}.dc.html', build_frame(name.lower().replace('-', ''), t, pts[str(t)]))
    elif which == 'a':
        write('Hero-A.dc.html', build_hero_a())
    elif which == 'b':
        write('Hero-B.dc.html', build_hero_b())
    elif which == 'c':
        write('Hero-C.dc.html', build_hero_c())


# ---------- Main v2: CSS-only, looping ----------
CYCLE = 4.6
def pc(t): return f'{t / CYCLE * 100:.2f}%'
E_IO = 'cubic-bezier(0.65, 0, 0.35, 1)'
E_EXPO = 'cubic-bezier(0.16, 1, 0.3, 1)'
E_BACK = 'cubic-bezier(0.34, 1.56, 0.64, 1)'

def main_css():
    Lf = f(L)
    css = []
    css.append(f'''.ul-mk{{animation:ul-mk {CYCLE}s infinite}}
@keyframes ul-mk{{0%{{stroke-dashoffset:{Lf}}}{pc(0.35)}{{stroke-dashoffset:{Lf};animation-timing-function:{E_IO}}}{pc(1.55)}{{stroke-dashoffset:0}}100%{{stroke-dashoffset:0}}}}''')
    css.append(f'''.ul-dot{{offset-path:path('{CENTER}');offset-rotate:0deg;offset-distance:100%;transform-box:fill-box;transform-origin:center;animation:ul-dot {CYCLE}s infinite}}
@keyframes ul-dot{{0%{{offset-distance:0%;opacity:1;transform:scale(0);animation-timing-function:{E_BACK}}}{pc(0.3)}{{offset-distance:0%;opacity:1;transform:scale(1);animation-timing-function:linear}}{pc(0.35)}{{offset-distance:0%;opacity:1;transform:scale(1);animation-timing-function:{E_IO}}}{pc(1.55)}{{offset-distance:100%;opacity:1;transform:scale(1);animation-timing-function:linear}}{pc(1.75)}{{offset-distance:100%;opacity:0;transform:scale(1)}}100%{{offset-distance:100%;opacity:0;transform:scale(1)}}}}
@supports not (offset-path: path('M 0 0 L 1 1')){{.ul-dot{{display:none}}}}''')
    css.append(f'''.ul-arw{{animation:ul-arw {CYCLE}s infinite}}
@keyframes ul-arw{{0%{{opacity:0;transform:translateX(-18px)}}{pc(1.5)}{{opacity:0;transform:translateX(-18px);animation-timing-function:{E_BACK}}}{pc(1.65)}{{opacity:1}}{pc(1.95)}{{opacity:1;transform:translateX(0)}}100%{{opacity:1;transform:translateX(0)}}}}''')
    for k, s0 in list(zip(ROW1, ROW1_START)) + [(k, 1.3 + 0.07*i) for i, k in enumerate(ROW2)]:
        dy = 215 if k in ROW1 else 200
        css.append(f'''.ul-l-{k}{{animation:ul-l-{k} {CYCLE}s infinite}}
@keyframes ul-l-{k}{{0%{{transform:translateY({dy}px)}}{pc(s0)}{{transform:translateY({dy}px);animation-timing-function:{E_EXPO}}}{pc(s0 + 0.55)}{{transform:translateY(0)}}100%{{transform:translateY(0)}}}}''')
    css.append(f'''.ul-all{{animation:ul-all {CYCLE}s infinite}}
@keyframes ul-all{{0%{{opacity:1}}{pc(4.2)}{{opacity:1}}{pc(4.5)}{{opacity:0}}100%{{opacity:0}}}}''')
    css.append('.ul-paused *{animation-play-state:paused !important}')
    css.append('@media (prefers-reduced-motion: reduce){.ul-root *{animation:none !important}}')
    return '\n'.join(css)

MAIN2_JS = r'''renderVals() {
    const paused = !!(this.state && this.state.paused);
    if (!this._toggle) this._toggle = () => this.setState({ paused: !(this.state && this.state.paused) });
    return {
      rootClass: paused ? 'ul-root ul-paused' : 'ul-root',
      label: paused ? 'Continuar animação' : 'Pausar animação',
      toggle: this._toggle
    };
  }'''

def build_main2():
    letters1 = ''.join(f'<path class="ul-l-{k}" d="{D[k]}" style="fill: #FFFFFF;"></path>' for k in ROW1)
    letters2 = ''.join(f'<path class="ul-l-{k}" d="{D[k]}" style="fill: {OURO};"></path>' for k in ROW2)
    svg = f'''<svg viewBox="533.86 327 852.28 419.28" role="img" aria-label="UrbanLink" style="width: 620px; height: auto; display: block; overflow: visible;">
<defs>
<mask id="mn-mk" maskUnits="userSpaceOnUse" x="1000" y="300" width="320" height="280">
<path class="ul-mk" d="{CENTER}" style="fill: none; stroke: #FFFFFF; stroke-width: 64; stroke-linecap: butt; stroke-linejoin: round; stroke-dasharray: {f(L)} {f(L)}; stroke-dashoffset: 0;"></path>
</mask>
<clipPath id="mn-c1"><rect x="530" y="335" width="860" height="206"></rect></clipPath>
<clipPath id="mn-c2"><rect x="530" y="548" width="600" height="196"></rect></clipPath>
<clipPath id="mn-ca"><rect x="1212" y="330" width="80" height="220"></rect></clipPath>
<clipPath id="mn-cm"><rect x="1000" y="330" width="213" height="220"></rect></clipPath>
</defs>
<g class="ul-all">
<g clip-path="url(#mn-c1)">{letters1}</g>
<g clip-path="url(#mn-c2)">{letters2}</g>
<g clip-path="url(#mn-cm)"><path d="{D['loop']}" mask="url(#mn-mk)" style="fill: {OURO};"></path></g>
<g clip-path="url(#mn-ca)"><path class="ul-arw" d="{D['loop']}" style="fill: {OURO};"></path></g>
<circle class="ul-dot" cx="0" cy="0" r="14" style="fill: {AMARELO}; opacity: 0;"></circle>
</g>
</svg>'''
    h = head('Abertura animada da logo').replace('</style>', main_css() + '\n</style>')
    body = f'''<div class="{{{{ rootClass }}}}" style="width: 1280px; height: 720px; box-sizing: border-box; background: {NOITE}; position: relative; display: flex; align-items: center; justify-content: center; font-family: {FONT};">
{svg}
<button onClick="{{{{ toggle }}}}" style="position: absolute; right: 40px; bottom: 36px; min-height: 44px; padding: 0 22px; background: transparent; color: #FFFFFF; border: 1px solid rgba(255, 255, 255, 0.4); border-radius: 6px; font-family: {FONT}; font-size: 16px; font-weight: 500; cursor: pointer;">{{{{ label }}}}</button>
</div>
'''
    return h + body + tail({'$preview': {'width': 1280, 'height': 720}}, MAIN2_JS)

if __name__ == '__main__' and sys.argv[1] == 'code':
    write('Abertura-Codigo.dc.html', build_main2().replace('<title>Abertura animada da logo</title>', '<title>Abertura em código CSS</title>'))


# ---------- v3: two strands, each revealing only its own region ----------
P1, P2 = G['P1'], G['P2']
L1, L2 = G['L1'], G['L2']
DG, SH = G['DG'], G['SH']
LT = L1 + L2

def strand_offsets(prog):
    dist = prog*LT
    return L1 - min(dist, L1), L2 - max(0.0, dist - L1)

def masks_svg(pfx, o1, o2):
    sty = 'fill: none; stroke: #FFFFFF; stroke-width: 64; stroke-linecap: butt; stroke-linejoin: round;'
    return f'''<mask id="{pfx}-m1" maskUnits="userSpaceOnUse" x="1000" y="300" width="320" height="280">
<path class="ul-s1" d="{P1}" style="{sty} stroke-dasharray: {f(L1)} {f(L1)}; stroke-dashoffset: {f(o1)};"></path>
<path d="{DG}" style="fill: #000000;"></path>
<path d="{SH}" style="fill: #000000;"></path>
</mask>
<mask id="{pfx}-m2" maskUnits="userSpaceOnUse" x="1000" y="300" width="320" height="280">
<path class="ul-s2" d="{P2}" style="{sty} stroke-dasharray: {f(L2)} {f(L2)}; stroke-dashoffset: {f(o2)};"></path>
</mask>
<clipPath id="{pfx}-ca"><rect x="1212" y="330" width="80" height="220"></rect></clipPath>
<clipPath id="{pfx}-cm"><rect x="1000" y="330" width="213" height="220"></rect></clipPath>
<clipPath id="{pfx}-c1"><rect x="530" y="335" width="860" height="206"></rect></clipPath>
<clipPath id="{pfx}-c2"><rect x="530" y="548" width="600" height="196"></rect></clipPath>'''

def loop_layers(pfx, masked=True, arrow_style='', arrow_cls=''):
    if masked:
        body = f'''<g clip-path="url(#{pfx}-cm)"><path d="{D['loop']}" mask="url(#{pfx}-m1)" style="fill: {OURO};"></path><path d="{D['loop']}" mask="url(#{pfx}-m2)" style="fill: {OURO};"></path></g>'''
    else:
        body = f'''<g clip-path="url(#{pfx}-cm)"><path d="{D['loop']}" style="fill: {OURO};"></path></g>'''
    cls = f' class="{arrow_cls}"' if arrow_cls else ''
    body += f'''<g clip-path="url(#{pfx}-ca)"><path{cls} d="{D['loop']}" style="fill: {OURO};{arrow_style}"></path></g>'''
    return body

def build_frame3(name, t, point):
    pfx = name.lower().replace('-', '')
    st = state(t)
    o1, o2 = strand_offsets(st['prog'])
    l1 = ''.join(f'<path d="{D[k]}" transform="translate(0 {f(st[k])})" style="fill: #FFFFFF;"></path>' for k in ROW1)
    l2 = ''.join(f'<path d="{D[k]}" transform="translate(0 {f(st[k])})" style="fill: {OURO};"></path>' for k in ROW2)
    px, py = point
    svg = f'''<svg viewBox="533.86 327 852.28 419.28" role="img" aria-label="UrbanLink" style="width: 310px; height: auto; display: block; overflow: visible;">
<defs>
{masks_svg(pfx, o1, o2)}
</defs>
<g clip-path="url(#{pfx}-c1)">{l1}</g>
<g clip-path="url(#{pfx}-c2)">{l2}</g>
{loop_layers(pfx, masked=st['masked'], arrow_style=f" opacity: {f(st['arrow_op'])};").replace('<g clip-path="url(#' + pfx + '-ca)"><path', '<g clip-path="url(#' + pfx + '-ca)"><path transform="translate(' + f(st['arrow_dx']) + ' 0)"')}
<circle cx="{f(px)}" cy="{f(py)}" r="{f(st['dot_r'])}" style="fill: {AMARELO}; opacity: {f(st['dot_op'])};"></circle>
</svg>'''
    body = f'''<div style="width: 640px; height: 360px; box-sizing: border-box; background: {NOITE}; display: flex; align-items: center; justify-content: center;">
{svg}
</div>
'''
    return head(f'Abertura em {str(t).replace(".", ",")} s') + body + tail({'$preview': {'width': 640, 'height': 360}})

def main_css3():
    css = []
    # sampled route progress (same easing for both strands and the dot)
    N = 30
    k1, k2, kd = [f'0%{{stroke-dashoffset:{f(L1)}}}'], [f'0%{{stroke-dashoffset:{f(L2)}}}'], []
    kd.append(f'0%{{offset-distance:0%;opacity:1;transform:scale(0);animation-timing-function:{E_BACK}}}')
    kd.append(f'{pc(0.3)}{{offset-distance:0%;opacity:1;transform:scale(1);animation-timing-function:linear}}')
    for i in range(N + 1):
        t = 0.35 + 1.2*i/N
        r = ioc(i/N)
        o1, o2 = strand_offsets(r)
        k1.append(f'{pc(t)}{{stroke-dashoffset:{f(o1)}}}')
        k2.append(f'{pc(t)}{{stroke-dashoffset:{f(o2)}}}')
        kd.append(f'{pc(t)}{{offset-distance:{r*100:.3f}%;opacity:1;transform:scale(1)}}')
    k1.append('100%{stroke-dashoffset:0}'); k2.append('100%{stroke-dashoffset:0}')
    kd.append(f'{pc(1.75)}{{offset-distance:100%;opacity:0;transform:scale(1)}}')
    kd.append('100%{offset-distance:100%;opacity:0;transform:scale(1)}')
    css.append(f'.ul-s1{{animation:ul-s1 {CYCLE}s linear infinite}}\n@keyframes ul-s1{{{"".join(k1)}}}')
    css.append(f'.ul-s2{{animation:ul-s2 {CYCLE}s linear infinite}}\n@keyframes ul-s2{{{"".join(k2)}}}')
    css.append(f".ul-dot{{offset-path:path('{CENTER}');offset-rotate:0deg;offset-distance:100%;transform-box:fill-box;transform-origin:center;animation:ul-dot {CYCLE}s linear infinite}}\n@keyframes ul-dot{{{''.join(kd)}}}\n@supports not (offset-path: path('M 0 0 L 1 1')){{.ul-dot{{display:none}}}}")
    rest = main_css().split('\n')
    # keep arrow, letters, fade, pause, reduced-motion rules from v2 (drop its mask/dot rules)
    keep, skip = [], False
    for line in rest:
        if line.startswith('.ul-mk') or line.startswith('@keyframes ul-mk') or line.startswith('.ul-dot') or line.startswith('@keyframes ul-dot') or line.startswith('@supports not'):
            continue
        keep.append(line)
    css.append('\n'.join(keep))
    return '\n'.join(css)

def build_code3():
    l1 = ''.join(f'<path class="ul-l-{k}" d="{D[k]}" style="fill: #FFFFFF;"></path>' for k in ROW1)
    l2 = ''.join(f'<path class="ul-l-{k}" d="{D[k]}" style="fill: {OURO};"></path>' for k in ROW2)
    svg = f'''<svg viewBox="533.86 327 852.28 419.28" role="img" aria-label="UrbanLink" style="width: 620px; height: auto; display: block; overflow: visible;">
<defs>
{masks_svg('mn', 0, 0)}
</defs>
<g class="ul-all">
<g clip-path="url(#mn-c1)">{l1}</g>
<g clip-path="url(#mn-c2)">{l2}</g>
{loop_layers('mn', masked=True, arrow_cls='ul-arw')}
<circle class="ul-dot" cx="0" cy="0" r="14" style="fill: {AMARELO}; opacity: 0;"></circle>
</g>
</svg>'''
    h = head('Abertura em código CSS').replace('</style>', main_css3() + '\n</style>')
    body = f'''<div class="{{{{ rootClass }}}}" style="width: 1280px; height: 720px; box-sizing: border-box; background: {NOITE}; position: relative; display: flex; align-items: center; justify-content: center; font-family: {FONT};">
{svg}
<button onClick="{{{{ toggle }}}}" style="position: absolute; right: 40px; bottom: 36px; min-height: 44px; padding: 0 22px; background: transparent; color: #FFFFFF; border: 1px solid rgba(255, 255, 255, 0.4); border-radius: 6px; font-family: {FONT}; font-size: 16px; font-weight: 500; cursor: pointer;">{{{{ label }}}}</button>
</div>
'''
    return h + body + tail({'$preview': {'width': 1280, 'height': 720}}, MAIN2_JS)

if __name__ == '__main__' and sys.argv[1] == 'code3':
    write('Abertura-Codigo.dc.html', build_code3())
if __name__ == '__main__' and sys.argv[1] == 'frame3':
    name, t = sys.argv[2], float(sys.argv[3])
    pts = json.load(open('/home/user/ulgen/points.json'))
    write(f'{name}.dc.html', build_frame3(name, t, pts[str(t)]))


# ---------- v4: code artboard with reduced-motion notice + "play anyway" ----------
CODE4_JS = r'''renderVals() {
    const s = this.state || {};
    if (!this._toggle) {
      this._toggle = () => this.setState({ paused: !(this.state && this.state.paused) });
      this._force = () => this.setState({ force: !(this.state && this.state.force) });
    }
    const cls = ['ul-root'];
    if (s.paused) cls.push('ul-paused');
    if (s.force) cls.push('ul-force');
    return {
      rootClass: cls.join(' '),
      label: s.paused ? 'Continuar animação' : 'Pausar animação',
      toggle: this._toggle,
      force: this._force,
      forceLabel: s.force ? 'Voltar ao modo sem movimento' : 'Ver a animação mesmo assim'
    };
  }'''

def build_code4():
    html = build_code3()
    # local reduced-motion handling (can be overridden by the "play anyway" button)
    html = html.replace('@media (prefers-reduced-motion: reduce){*,*::before,*::after{animation-duration:1ms !important;animation-delay:0ms !important;transition-duration:1ms !important}}\n', '')
    html = html.replace('@media (prefers-reduced-motion: reduce){.ul-root *{animation:none !important}}',
        '.rm-note{display:none}\n@media (prefers-reduced-motion: reduce){.ul-root:not(.ul-force) *{animation:none !important}.rm-note{display:flex}}')
    assert '.rm-note{display:none}' in html
    note = f'''<div class="rm-note" style="position: absolute; left: 40px; top: 32px; max-width: 520px; flex-direction: column; align-items: flex-start; gap: 12px; color: #FFFFFF; font-family: {FONT};">
<p style="margin: 0; font-size: 16px; line-height: 1.5; color: {TEXTO2};">O teu sistema está com "reduzir movimento" ligado, então a animação fica parada de propósito, por acessibilidade.</p>
<button onClick="{{{{ force }}}}" style="min-height: 44px; padding: 0 20px; background: {OURO}; color: {NOITE}; border: none; border-radius: 6px; font-family: {FONT}; font-size: 16px; font-weight: 600; cursor: pointer;">{{{{ forceLabel }}}}</button>
</div>
'''
    html = html.replace('<button onClick="{{ toggle }}"', note + '<button onClick="{{ toggle }}"', 1)
    html = html.replace(MAIN2_JS, CODE4_JS)
    assert CODE4_JS in html
    return html

if __name__ == '__main__' and sys.argv[1] == 'code4':
    write('Abertura-Codigo.dc.html', build_code4())
