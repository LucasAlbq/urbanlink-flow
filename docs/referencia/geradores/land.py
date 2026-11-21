"""Landing v1 do UrbanLink Flow: hero B reescrito, jornada com placas, plataforma por dentro,
chamada final com o A gigante e rodapé. Um arquivo, duas pranchas (1440 e 390)."""
import os, random, sys
sys.path.insert(0, '/home/user/ulgen')
import gen
from gen import (D, NOITE, MARINHO, OURO, AMARELO, TEXTO2, FONT, FONT_LINK, PADX,
                 logo_h, skyline, tail)

NEVOA = '#EDF0F7'
BRANCO = '#FFFFFF'
OUT = '/home/user/ulcanvas/project'

CSS = f'''body{{margin:0}}
a{{color:{AMARELO}}}a:hover{{color:#FFFFFF}}
:root{{--ease:cubic-bezier(0.22,1,0.36,1);--fast:180ms}}
a,button{{outline:2px solid transparent;outline-offset:6px;transition:outline-color var(--fast) var(--ease),outline-offset var(--fast) var(--ease)}}
a:focus-visible,button:focus-visible{{outline-color:{AMARELO};outline-offset:3px}}
.btn{{transition:box-shadow var(--fast) var(--ease),transform var(--fast) var(--ease),outline-color var(--fast) var(--ease),outline-offset var(--fast) var(--ease)}}
.btn:hover{{box-shadow:inset 0 0 0 999px rgba(255,255,255,.14)}}
.btn:active{{transform:scale(0.97)}}
.lnk{{transition:text-decoration-thickness var(--fast) var(--ease),outline-color var(--fast) var(--ease),outline-offset var(--fast) var(--ease)}}
.lnk:hover{{text-decoration-thickness:3px}}
.ft a{{color:{TEXTO2};text-decoration:none}}.ft a:hover{{color:#FFFFFF;text-decoration:underline;text-underline-offset:5px}}
.rise{{animation:rise 300ms var(--ease) both}}.rise-2{{animation-delay:40ms}}.rise-3{{animation-delay:80ms}}
@keyframes rise{{from{{opacity:0;transform:translateY(12px)}}to{{opacity:1;transform:none}}}}
.jr{{display:grid;grid-template-columns:repeat(4,minmax(0,1fr))}}
.st{{display:grid;grid-template-areas:"pole" "road" "text";grid-template-rows:auto 22px auto;justify-items:start;align-content:start}}
.st-pole{{grid-area:pole;display:flex;flex-direction:column;align-items:center;padding-right:16px}}
.st-post{{width:8px;height:44px;background:{NOITE}}}
.st-road{{grid-area:road;justify-self:stretch;position:relative;background:{NOITE}}}
.st-dash{{position:absolute;left:0;right:0;top:9px;height:4px;background:repeating-linear-gradient(90deg,{AMARELO} 0 26px,transparent 26px 50px)}}
.st-text{{grid-area:text;padding:32px 28px 0 0}}
.road-start{{position:absolute;left:0;top:50%;width:26px;height:26px;border-radius:50%;background:{AMARELO};box-shadow:0 0 0 4px {NOITE};transform:translateY(-50%)}}
.road-end{{position:absolute;right:-6px;top:50%;width:48px;height:46px;transform:translateY(-50%)}}
.app-body{{display:grid;grid-template-columns:232px minmax(0,1fr)}}
.hero{{min-height:900px}}
@media (max-width: 760px){{
.nav-hide{{display:none !important}}
.city-abs{{position:relative !important;height:380px !important}}.city-pad{{padding-bottom:0 !important}}
.jr{{grid-template-columns:minmax(0,1fr)}}
.st{{grid-template-areas:"road pole" "road text";grid-template-columns:22px minmax(0,1fr);grid-template-rows:auto auto;column-gap:20px}}
.st-post{{display:none}}
.st-road{{align-self:stretch}}
.st-dash{{left:9px;right:auto;top:0;bottom:0;width:4px;height:auto;background:repeating-linear-gradient(180deg,{AMARELO} 0 26px,transparent 26px 50px)}}
.st-text{{padding:18px 0 56px 0}}
.road-start{{left:50%;top:0;transform:translateX(-50%)}}
.road-end{{right:auto;left:50%;top:auto;bottom:-6px;transform:translateX(-50%) rotate(90deg)}}
.app-body{{grid-template-columns:60px minmax(0,1fr)}}
.app-label{{display:none}}
.cta-a{{max-width:250px !important}}
.hero{{min-height:0}}
.city-abs{{height:300px !important;margin-top:-110px}}
}}
@media (max-width: 600px){{.nav-hide-sm{{display:none !important}}}}
@media (prefers-reduced-motion: reduce){{*,*::before,*::after{{animation-duration:1ms !important;animation-delay:0ms !important;transition-duration:1ms !important}}}}'''


def head(title):
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
{CSS}
</style>
</helmet>
'''


ARROW = 'M 0 0 H 30 L 64 30 L 30 60 H 0 L 26 30 Z'   # a seta da logo, normalizada


def wrap(inner, pad_y='clamp(72px, 10vw, 140px)', extra=''):
    return f'<div style="max-width: 1280px; margin: 0 auto; box-sizing: border-box; padding: {pad_y} {PADX}; {extra}">{inner}</div>'


# ---------------- Header + Hero ----------------
def header():
    link = 'color: #FFFFFF; text-decoration: none; font-size: 17px; font-weight: 500; min-height: 44px; display: inline-flex; align-items: center; white-space: nowrap;'
    return f'''<header style="max-width: 1280px; width: 100%; margin: 0 auto; box-sizing: border-box; padding: 24px {PADX}; display: flex; align-items: center; justify-content: space-between; gap: 16px 32px;">
<a href="#inicio" aria-label="UrbanLink, início" style="display: flex; align-items: center; min-height: 44px;">{logo_h('dark')}</a>
<nav class="nav-hide" aria-label="Principal" style="display: flex; align-items: center; gap: 12px 28px;">
<a class="lnk" href="#como-funciona" style="{link}">Como funciona</a>
<a class="lnk" href="#plataforma" style="{link}">A plataforma</a>
<a class="btn" href="#login" style="display: inline-flex; align-items: center; min-height: 44px; padding: 0 20px; color: #FFFFFF; border: 2px solid rgba(255, 255, 255, 0.55); border-radius: 6px; font-size: 17px; font-weight: 600; text-decoration: none; white-space: nowrap; box-sizing: border-box;">Entrar na plataforma</a>
</nav>
</header>'''


def hero():
    B = 520
    far = skyline(7, 40, 96, 300, 400, B, rise=(860, 300))
    mid = skyline(21, 54, 120, 350, 420, B, rise=(980, 200))
    near = skyline(42, 70, 160, 452, 492, B, setback=0.15)
    route = 'M -20 420 H 250 L 320 360 H 610 L 690 430 H 930 L 1000 370 H 1262'
    arrow = 'M 1252 340 H 1282 L 1316 370 L 1282 400 H 1252 L 1278 370 Z'
    city = f'''<svg class="city-abs" viewBox="0 0 1440 {B}" preserveAspectRatio="xMidYMax slice" aria-hidden="true" style="position: absolute; left: 0; right: 0; bottom: 0; width: 100%; height: {B}px; display: block;">
<path d="{far}" style="fill: #1F2853;"></path>
<path d="{mid}" style="fill: {NOITE};"></path>
<path d="{route}" style="fill: none; stroke: {OURO}; stroke-width: 12; stroke-linejoin: round; stroke-linecap: round;"></path>
<path d="{arrow}" style="fill: {OURO};"></path>
<circle cx="470" cy="360" r="17" style="fill: none; stroke: {AMARELO}; stroke-width: 3; opacity: 0.45;"></circle>
<circle cx="470" cy="360" r="10" style="fill: {AMARELO};"></circle>
<path d="{near}" style="fill: #121830;"></path>
</svg>'''
    return f'''<section id="inicio" class="hero" style="position: relative; background: {MARINHO}; color: #FFFFFF; display: flex; flex-direction: column; overflow: hidden;">
<div style="position: relative; z-index: 1;">
{header()}
</div>
<div class="city-pad" style="position: relative; z-index: 1; max-width: 1280px; width: 100%; margin: 0 auto; box-sizing: border-box; padding: clamp(32px, 5vw, 72px) {PADX} 330px; display: flex; flex-direction: column; gap: 28px;">
<h1 class="rise" style="margin: 0; font-size: clamp(2.75rem, 5.6vw, 5.5rem); font-weight: 800; line-height: 1; letter-spacing: -0.025em; text-wrap: balance;">A logística da cidade,<br>em tempo real.</h1>
<p class="rise rise-2" style="margin: 0; max-width: 44ch; font-size: clamp(1.125rem, 1.4vw, 1.3125rem); line-height: 1.55; color: {TEXTO2}; text-wrap: pretty;">Monitore entregas, simule rotas e cenários e treine sua equipe em um só lugar. Para transportadoras, e-commerce e prefeituras.</p>
<div class="rise rise-3" style="display: flex; flex-wrap: wrap; align-items: center; gap: 12px 28px;">
<a class="btn" href="#login" style="display: inline-flex; align-items: center; justify-content: center; min-height: 56px; padding: 0 30px; background: {OURO}; color: {NOITE}; border-radius: 6px; font-size: 19px; font-weight: 600; text-decoration: none; white-space: nowrap;">Entrar na plataforma</a>
<a class="lnk" href="#como-funciona" style="color: #FFFFFF; font-size: 18px; font-weight: 500; text-decoration: underline; text-underline-offset: 6px; text-decoration-thickness: 2px; min-height: 44px; display: inline-flex; align-items: center; white-space: nowrap;">Ver como funciona</a>
</div>
</div>
{city}
</section>'''


# ---------------- Jornada ----------------
def glyph(kind):
    if kind == 'desvio':
        return f'''<svg viewBox="0 0 26 22" aria-hidden="true" style="width: 26px; height: 22px; flex: none;"><path d="M 2 18 H 9 L 15 6 H 22" style="fill: none; stroke: {NOITE}; stroke-width: 3.2; stroke-linejoin: round; stroke-linecap: round;"></path><path d="M 18 1.5 L 23.5 6 L 18 10.5" style="fill: none; stroke: {NOITE}; stroke-width: 3.2; stroke-linejoin: round; stroke-linecap: round;"></path></svg>'''
    return f'<svg viewBox="0 0 64 60" aria-hidden="true" style="width: 24px; height: 22px; flex: none;"><path d="{ARROW}" style="fill: {NOITE};"></path></svg>'


STAGES = [
    (1, 'Saída', 'seta', OURO, 'O pedido sai do galpão',
     'Entregas, veículos e motoristas ficam cadastrados num lugar só, prontos pra rodar.', 'Cadastros'),
    (2, 'Rota', 'seta', OURO, 'O caminho é traçado no mapa',
     'A plataforma calcula a rota com tempo e distância antes do veículo sair.', 'Rotas'),
    (3, 'Imprevisto', 'desvio', AMARELO, 'A cidade muda no meio do caminho',
     'Simule trânsito, bloqueio ou atraso e veja como a operação reage. Serve também pra treinar a equipe.', 'Simulação'),
    (4, 'Entrega', 'seta', OURO, 'O pedido chega na porta',
     'Cada entrega aparece no mapa em tempo real, junto com os indicadores da operação.', 'Monitoramento'),
]


def stage(n, name, kind, bg, title, text, area):
    extra = ''
    if n == 1:
        extra = '<span class="road-start" aria-hidden="true"></span>'
    if n == 4:
        extra = f'<svg class="road-end" viewBox="0 0 64 60" aria-hidden="true"><path d="{ARROW}" style="fill: {OURO};"></path></svg>'
    return f'''<li class="st">
<div class="st-pole">
<div style="display: inline-flex; align-items: center; gap: 14px; padding: 16px 22px 16px 16px; background: {bg}; color: {NOITE}; border-radius: 10px; box-shadow: inset 0 0 0 5px {bg}, inset 0 0 0 8px {NOITE};">
<span style="display: inline-flex; align-items: center; justify-content: center; min-width: 34px; height: 34px; border-radius: 6px; background: {NOITE}; color: {AMARELO}; font-size: 19px; font-weight: 800;">{n}</span>
<span style="font-size: clamp(1.5rem, 2.1vw, 2rem); font-weight: 900; line-height: 1; letter-spacing: -0.02em; white-space: nowrap;">{name}</span>
{glyph(kind)}
</div>
<div class="st-post" aria-hidden="true"></div>
</div>
<div class="st-road" aria-hidden="true"><span class="st-dash"></span>{extra}</div>
<div class="st-text">
<h3 style="margin: 0 0 10px; font-size: 1.375rem; font-weight: 800; line-height: 1.2; color: {NOITE}; text-wrap: balance;">{title}</h3>
<p style="margin: 0 0 16px; max-width: 32ch; font-size: 1.0625rem; line-height: 1.55; color: {MARINHO}; text-wrap: pretty;">{text}</p>
<p style="margin: 0; font-size: 0.9375rem; line-height: 1.4; color: {NOITE};">Na plataforma: <strong style="font-weight: 700;">{area}</strong></p>
</div>
</li>'''


def jornada():
    stages = '\n'.join(stage(*s) for s in STAGES)
    inner = f'''<div style="display: flex; flex-direction: column; gap: 18px; margin-bottom: clamp(48px, 6vw, 80px);">
<h2 style="margin: 0; font-size: clamp(2.25rem, 4.6vw, 4rem); font-weight: 800; line-height: 1.02; letter-spacing: -0.025em; color: {NOITE};">Do galpão à porta.</h2>
<p style="margin: 0; max-width: 46ch; font-size: clamp(1.0625rem, 1.3vw, 1.25rem); line-height: 1.55; color: {MARINHO}; text-wrap: pretty;">Uma entrega passa por quatro momentos. A UrbanLink Flow tem uma área da plataforma pra cada um.</p>
</div>
<ol class="jr" style="list-style: none; margin: 0; padding: 0;">
{stages}
</ol>'''
    return f'<section id="como-funciona" style="background: {NEVOA}; color: {NOITE};">{wrap(inner)}</section>'


# ---------------- Plataforma por dentro ----------------
ICONS = {
    'Monitoramento': '<circle cx="12" cy="10" r="3"></circle><path d="M 12 21 C 12 21 5 14.5 5 10 A 7 7 0 0 1 19 10 C 19 14.5 12 21 12 21 Z"></path>',
    'Rotas': '<circle cx="6" cy="18" r="2.5"></circle><path d="M 8.5 18 H 15 A 3.5 3.5 0 0 0 15 11 H 9 A 3.5 3.5 0 0 1 9 4 H 15"></path><path d="M 15 1.5 L 18 4 L 15 6.5"></path>',
    'Simulação': '<path d="M 4 19 H 20"></path><path d="M 4 15 L 9 9 L 13 13 L 20 5"></path><path d="M 16 5 H 20 V 9"></path>',
    'Cadastros': '<rect x="4" y="3" width="16" height="18" rx="2"></rect><path d="M 8 8 H 16 M 8 12 H 16 M 8 16 H 13"></path>',
}


def city_map():
    """Mapa ilustrado: quarteirões, avenidas e uma rota do galpão (círculo) até a porta (seta). Sem dado."""
    rnd = random.Random(5)
    W, Hh = 960, 560
    blocks = ''
    xs = [0, 120, 250, 330, 470, 560, 690, 800, 960]
    ys = [0, 90, 190, 280, 390, 470, 560]
    for i in range(len(xs) - 1):
        for j in range(len(ys) - 1):
            x0, x1 = xs[i] + 14, xs[i + 1] - 14
            y0, y1 = ys[j] + 14, ys[j + 1] - 14
            fill = '#D6DCEA' if rnd.random() > 0.12 else '#C9DCCF'
            blocks += f'<rect x="{x0}" y="{y0}" width="{x1 - x0}" height="{y1 - y0}" rx="6" style="fill: {fill};"></rect>'
    river = 'M -10 520 C 200 470 320 540 520 500 C 700 465 820 520 980 470'
    avenue = 'M -10 120 L 980 430'
    route = 'M 120 455 V 390 H 330 V 280 H 560 V 190 H 790'
    return f'''<svg viewBox="0 0 {W} {Hh}" preserveAspectRatio="xMidYMid slice" aria-hidden="true" style="position: absolute; inset: 0; width: 100%; height: 100%; display: block;">
<rect x="0" y="0" width="{W}" height="{Hh}" style="fill: {NEVOA};"></rect>
{blocks}
<path d="{river}" style="fill: none; stroke: #B9C8E6; stroke-width: 34; stroke-linecap: round;"></path>
<path d="{avenue}" style="fill: none; stroke: {NEVOA}; stroke-width: 26;"></path>
<path d="{route}" style="fill: none; stroke: {OURO}; stroke-width: 10; stroke-linejoin: round; stroke-linecap: round;"></path>
<circle cx="120" cy="470" r="15" style="fill: {NEVOA}; stroke: {NOITE}; stroke-width: 6;"></circle>
<g transform="translate(782 170) scale(0.66)"><path d="{ARROW}" style="fill: {NOITE};"></path></g>
</svg>'''


def plataforma():
    items = ''
    for i, name in enumerate(['Monitoramento', 'Rotas', 'Simulação', 'Cadastros']):
        active = i == 0
        bg = NEVOA if active else 'transparent'
        weight = 700 if active else 500
        items += f'''<div style="display: flex; align-items: center; gap: 12px; min-height: 44px; padding: 0 12px; border-radius: 8px; background: {bg}; color: {NOITE}; font-size: 16px; font-weight: {weight};">
<svg viewBox="0 0 24 24" aria-hidden="true" style="width: 22px; height: 22px; flex: none; fill: none; stroke: {NOITE}; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round;">{ICONS[name]}</svg>
<span class="app-label">{name}</span>
</div>'''
    frame = f'''<div role="img" aria-label="Ilustração da plataforma: menu com Monitoramento, Rotas, Simulação e Cadastros ao lado do mapa da cidade" style="border: 2px solid {NOITE}; border-radius: 14px; overflow: hidden; background: {BRANCO};">
<div aria-hidden="true" style="display: flex; align-items: center; justify-content: space-between; height: 56px; padding: 0 20px; background: {NOITE};">
{logo_h('dark', 20)}
<span style="width: 30px; height: 30px; border-radius: 50%; border: 2px solid {TEXTO2}; box-sizing: border-box;"></span>
</div>
<div class="app-body" aria-hidden="true">
<div style="display: flex; flex-direction: column; gap: 4px; padding: 16px 10px; border-right: 1px solid #D6DCEA;">
{items}
</div>
<div style="display: flex; flex-direction: column; min-width: 0;">
<div style="display: flex; align-items: center; height: 56px; padding: 0 20px; border-bottom: 1px solid #D6DCEA; font-size: 18px; font-weight: 700; color: {NOITE};">Monitoramento</div>
<div style="position: relative; height: clamp(300px, 38vw, 520px);">
{city_map()}
</div>
</div>
</div>
</div>'''
    inner = f'''<div style="display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 16px 48px; margin-bottom: clamp(40px, 5vw, 64px);">
<h2 style="margin: 0; font-size: clamp(2.25rem, 4.6vw, 4rem); font-weight: 800; line-height: 1.02; letter-spacing: -0.025em; color: {NOITE};">Por dentro<br>da plataforma.</h2>
<p style="margin: 0; max-width: 40ch; font-size: clamp(1.0625rem, 1.3vw, 1.25rem); line-height: 1.55; color: {MARINHO}; text-wrap: pretty;">Quatro áreas, uma pra cada momento da entrega, com o mapa da cidade no centro.</p>
</div>
{frame}'''
    return f'<section id="plataforma" style="background: {BRANCO}; color: {NOITE};">{wrap(inner)}</section>'


# ---------------- Chamada final + rodapé ----------------
def chamada():
    ext = 'M 1041.0 510 L 1084.8 510 L 1085.74 640 L 1043.3 640 Z'
    bleed = 'clamp(0px, (100vw - 600px) * 0.12, 110px)'
    big = f'''<svg class="cta-a" viewBox="1030 335 245 305" aria-hidden="true" style="width: calc(100% + {bleed}); max-width: 640px; margin-right: calc(-1 * {bleed}); height: auto; display: block; margin-bottom: -2px;">
<path d="{D['loop']}" style="fill: {OURO};"></path>
<path d="{ext}" style="fill: {OURO};"></path>
</svg>'''
    return f'''<section id="entrar" style="background: {NOITE}; color: #FFFFFF; overflow: hidden;">
<div style="max-width: 1280px; margin: 0 auto; box-sizing: border-box; padding: clamp(72px, 10vw, 140px) {PADX} 0; display: flex; flex-wrap: wrap; align-items: flex-end; gap: 48px 40px;">
<div style="flex: 1 1 520px; min-width: 0; display: flex; flex-direction: column; align-items: flex-start; gap: 28px; padding-bottom: clamp(72px, 10vw, 140px);">
<h2 style="margin: 0; font-size: clamp(2.5rem, 5vw, 4.5rem); font-weight: 800; line-height: 1; letter-spacing: -0.025em; text-wrap: balance;">Coloque a sua operação no mapa.</h2>
<p style="margin: 0; max-width: 38ch; font-size: clamp(1.125rem, 1.4vw, 1.3125rem); line-height: 1.55; color: {TEXTO2}; text-wrap: pretty;">Entre na plataforma pra acompanhar entregas, traçar rotas e simular cenários.</p>
<a class="btn" href="#login" style="display: inline-flex; align-items: center; justify-content: center; min-height: 56px; padding: 0 30px; background: {OURO}; color: {NOITE}; border-radius: 6px; font-size: 19px; font-weight: 600; text-decoration: none; white-space: nowrap;">Entrar na plataforma</a>
</div>
<div style="flex: 1 1 360px; min-width: 0; display: flex; justify-content: flex-end; align-self: flex-end;">
{big}
</div>
</div>
</section>'''


def rodape():
    links = [('#login', 'Entrar na plataforma'), ('#como-funciona', 'Como funciona'),
             ('#', 'Documentação da API'), ('#', 'Código no GitHub')]
    lk = ''.join(f'<li><a href="{h}" style="display: inline-flex; align-items: center; min-height: 44px; font-size: 16px;">{t}</a></li>' for h, t in links)
    return f'''<footer class="ft" style="background: {NOITE}; color: {TEXTO2}; border-top: 1px solid rgba(255, 255, 255, 0.14);">
<div style="max-width: 1280px; margin: 0 auto; box-sizing: border-box; padding: 48px {PADX} 40px; display: flex; flex-direction: column; gap: 28px;">
<div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 16px 40px;">
<a href="#inicio" aria-label="UrbanLink, voltar ao início" style="display: flex; align-items: center; min-height: 44px;">{logo_h('dark', 26)}</a>
<nav aria-label="Rodapé"><ul style="list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 0 28px;">{lk}</ul></nav>
</div>
<div style="display: flex; flex-wrap: wrap; justify-content: space-between; gap: 8px 40px; font-size: 15px; line-height: 1.5;">
<p style="margin: 0;">UrbanLink Systems, tecnologia para logística urbana desde 2017.</p>
<p style="margin: 0;">Projeto acadêmico do curso de Desenvolvimento de Sistemas. A UrbanLink Systems é uma empresa fictícia.</p>
</div>
</div>
</footer>'''


def build():
    body = f'''<div style="font-family: {FONT}; background: {NOITE};">
{hero()}
{jornada()}
{plataforma()}
{chamada()}
{rodape()}
</div>
'''
    return body


def page(title, w, h):
    return head(title) + build() + tail({'$preview': {'width': w, 'height': h}})


if __name__ == '__main__':
    wd, hd, wm, hm = (int(x) for x in sys.argv[1:5]) if len(sys.argv) > 4 else (1440, 4000, 390, 6000)
    for name, title, w, h in [('Landing.dc.html', 'Landing v1, desktop', wd, hd),
                              ('Landing-Celular.dc.html', 'Landing v1, celular', wm, hm)]:
        with open(os.path.join(OUT, name), 'w') as fh:
            fh.write(page(title, w, h))
        print('wrote', name)
