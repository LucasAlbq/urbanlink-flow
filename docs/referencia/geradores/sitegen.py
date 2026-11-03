"""Site UrbanLink Flow v2: landing + login + rastreamento + fale com a gente + mensagem enviada.
Funções vindas do Figma do grupo, visual da landing v1."""
import os, sys
sys.path.insert(0, '/home/claude/ulgen')
import land
from land import (D, NOITE, MARINHO, OURO, AMARELO, TEXTO2, FONT, FONT_LINK, PADX, NEVOA, BRANCO,
                  logo_h, skyline, tail, ARROW, ICONS, wrap)

OUT = '/home/claude/ulcanvas/project'
CINZA = '#5A6285'      # texto/borda secundária em fundo claro (5,9:1 no branco)
LINHA = '#C5CBE3'      # estrada ainda não percorrida

CSS = land.CSS.replace('@media (max-width: 600px){{.nav-hide-sm{{display:none !important}}}}', '') + f'''
.nav-links{{display:flex;align-items:center;gap:4px 28px}}
.menu-btn{{display:none}}
.light a:focus-visible,.light button:focus-visible,.light input:focus-visible,.light select:focus-visible,.light textarea:focus-visible{{outline-color:{NOITE}}}
.light a{{color:{NOITE}}}.light a:hover{{color:{MARINHO}}}
.fld{{display:flex;flex-direction:column;gap:8px;min-width:0}}
.fld label{{font-size:15px;font-weight:600;color:{NOITE}}}
.fld input,.fld select,.fld textarea{{font:inherit;font-size:17px;color:{NOITE};background:{BRANCO};border:1.5px solid {CINZA};border-radius:8px;padding:0 14px;min-height:52px;box-sizing:border-box;width:100%;transition:border-color var(--fast) var(--ease),outline-color var(--fast) var(--ease),outline-offset var(--fast) var(--ease)}}
.fld textarea{{padding:14px;min-height:140px;resize:vertical;line-height:1.5}}
.fld input::placeholder,.fld textarea::placeholder{{color:{CINZA}}}
.fld input:hover,.fld select:hover,.fld textarea:hover{{border-color:{NOITE}}}
.fld input:focus-visible,.fld select:focus-visible,.fld textarea:focus-visible{{border-color:{NOITE};outline:2px solid {NOITE};outline-offset:2px}}
.opt{{font-weight:400;color:{CINZA}}}
.dark-in input{{border-color:transparent}}
.dark-in input:focus-visible{{outline-color:{AMARELO}}}
.jr.v{{grid-template-columns:minmax(0,1fr)}}
.jr.v .st{{grid-template-areas:"road pole" "road text";grid-template-columns:22px minmax(0,1fr);grid-template-rows:auto auto;column-gap:20px}}
.jr.v .st-post{{display:none}}
.jr.v .st-road{{align-self:stretch}}
.jr.v .st-dash{{left:9px;right:auto;top:0;bottom:0;width:4px;height:auto;background:repeating-linear-gradient(180deg,{AMARELO} 0 26px,transparent 26px 50px)}}
.jr.v .st-text{{padding:16px 0 44px 0}}
.jr.v .road-start{{left:50%;top:0;transform:translateX(-50%)}}
.jr.v .road-end{{right:auto;left:50%;top:auto;bottom:-6px;transform:translateX(-50%) rotate(90deg)}}
.pac{{position:absolute;top:50%;left:22px;width:26px;height:26px;border-radius:50%;background:{AMARELO};box-shadow:0 0 0 4px {NOITE},0 0 0 10px rgba(255,215,69,.45);transform:translateY(-50%)}}
.split{{display:grid;grid-template-columns:minmax(0,7fr) minmax(0,5fr);gap:clamp(32px,5vw,72px);align-items:start}}
.two{{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px}}
.login{{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);min-height:900px}}
.login-logo-m{{display:none}}
.map-box{{height:clamp(320px,46vw,640px)}}
@media (max-width: 1100px){{.nav-links{{display:none !important}}.menu-btn{{display:inline-flex}}}}
@media (max-width: 900px){{.login{{grid-template-columns:minmax(0,1fr);min-height:0}}.login-art{{display:none !important}}.login-logo-m{{display:flex}}.split{{grid-template-columns:minmax(0,1fr)}}}}
@media (max-width: 760px){{.map-box{{height:auto;aspect-ratio:960/560}}.pac{{top:22px;left:50%;transform:translateX(-50%)}}.two{{grid-template-columns:minmax(0,1fr)}}}}
@media (max-width: 600px){{.nav-hide-sm{{display:none !important}}}}
@media (prefers-reduced-motion: reduce){{html{{scroll-behavior:auto}}}}'''


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


def page(title, body, w, h):
    return head(title) + f'<div style="font-family: {FONT}; background: {NOITE};">\n{body}\n</div>\n' + tail({'$preview': {'width': w, 'height': h}})


LANDING = 'Landing.dc.html'
LOGIN = 'Login.dc.html'
RASTREIO = 'Rastreamento.dc.html'
CONTATO = 'Contato.dc.html'
ENVIADO = 'Contato-Enviado.dc.html'
MENU = 'Menu-Celular.dc.html'

BTN_OURO = f'display: inline-flex; align-items: center; justify-content: center; min-height: 56px; padding: 0 30px; background: {OURO}; color: {NOITE}; border: 0; border-radius: 6px; font-family: inherit; font-size: 19px; font-weight: 600; text-decoration: none; white-space: nowrap; cursor: pointer; box-sizing: border-box;'
BTN_NOITE = f'display: inline-flex; align-items: center; justify-content: center; min-height: 56px; padding: 0 30px; background: {NOITE}; color: #FFFFFF; border: 0; border-radius: 6px; font-family: inherit; font-size: 18px; font-weight: 600; text-decoration: none; white-space: nowrap; cursor: pointer; box-sizing: border-box;'
LINK_W = 'color: #FFFFFF; font-size: 18px; font-weight: 500; text-decoration: underline; text-underline-offset: 6px; text-decoration-thickness: 2px; min-height: 44px; display: inline-flex; align-items: center; white-space: nowrap;'


# ---------------- Header / footer ----------------
def header(on_landing=False, active=None):
    home = '#inicio' if on_landing else LANDING
    como = '#como-funciona' if on_landing else LANDING
    link = 'color: #FFFFFF; text-decoration: none; font-size: 17px; font-weight: 500; min-height: 44px; display: inline-flex; align-items: center; white-space: nowrap;'
    cur = lambda k: ' aria-current="page"' if active == k else ''
    und = lambda k: ' text-decoration: underline; text-underline-offset: 8px; text-decoration-thickness: 2px;' if active == k else ''
    menu_icon = '<svg viewBox="0 0 24 24" aria-hidden="true" style="width: 26px; height: 26px; fill: none; stroke: #FFFFFF; stroke-width: 2.2; stroke-linecap: round;"><path d="M 3 6 H 21 M 3 12 H 21 M 3 18 H 21"></path></svg>'
    return f'''<header style="max-width: 1280px; width: 100%; margin: 0 auto; box-sizing: border-box; padding: 24px {PADX}; display: flex; align-items: center; justify-content: space-between; gap: 16px 32px;">
<a href="{home}" aria-label="UrbanLink, início" style="display: flex; align-items: center; min-height: 44px;">{logo_h('dark')}</a>
<div style="display: flex; align-items: center; gap: 12px 28px;">
<nav class="nav-links" aria-label="Principal">
<a class="lnk" href="{como}" style="{link}">Como funciona</a>
<a class="lnk" href="{RASTREIO}"{cur('rastreio')} style="{link}{und('rastreio')}">Rastrear entrega</a>
<a class="lnk" href="{CONTATO}"{cur('contato')} style="{link}{und('contato')}">Fale com a gente</a>
</nav>
<a class="btn nav-hide-sm" href="{LOGIN}" style="display: inline-flex; align-items: center; min-height: 44px; padding: 0 20px; color: #FFFFFF; border: 2px solid rgba(255, 255, 255, 0.55); border-radius: 6px; font-size: 17px; font-weight: 600; text-decoration: none; white-space: nowrap; box-sizing: border-box;">Entrar na plataforma</a>
<a class="menu-btn btn" href="{MENU}" aria-label="Abrir menu" style="align-items: center; justify-content: center; width: 48px; height: 48px; box-sizing: border-box; padding: 0; background: transparent; border: 2px solid rgba(255, 255, 255, 0.55); border-radius: 6px;">{menu_icon}</a>
</div>
</header>'''


def rodape():
    links = [(RASTREIO, 'Rastrear entrega'), (CONTATO, 'Fale com a gente'), (LOGIN, 'Entrar na plataforma'),
             ('#', 'Documentação da API'), ('#', 'Código no GitHub')]
    lk = ''.join(f'<li><a href="{h}" style="display: inline-flex; align-items: center; min-height: 44px; font-size: 16px;">{t}</a></li>' for h, t in links)
    return f'''<footer class="ft" style="background: {NOITE}; color: {TEXTO2}; border-top: 1px solid rgba(255, 255, 255, 0.14);">
<div style="max-width: 1280px; margin: 0 auto; box-sizing: border-box; padding: 48px {PADX} 40px; display: flex; flex-direction: column; gap: 28px;">
<div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 16px 40px;">
<a href="{LANDING}" aria-label="UrbanLink, voltar ao início" style="display: flex; align-items: center; min-height: 44px;">{logo_h('dark', 26)}</a>
<nav aria-label="Rodapé"><ul style="list-style: none; margin: 0; padding: 0; display: flex; flex-wrap: wrap; gap: 0 28px;">{lk}</ul></nav>
</div>
<div style="display: flex; flex-wrap: wrap; justify-content: space-between; gap: 8px 40px; font-size: 15px; line-height: 1.5;">
<p style="margin: 0;">UrbanLink Systems, tecnologia para logística urbana desde 2017.</p>
<p style="margin: 0;">Projeto acadêmico do curso de Desenvolvimento de Sistemas. A UrbanLink Systems é uma empresa fictícia.</p>
</div>
</div>
</footer>'''


def band(inner, bg=MARINHO, on_landing=False, active=None):
    """Topo das páginas internas: header + título."""
    return f'''<section style="background: {bg}; color: #FFFFFF;">
{header(on_landing, active)}
<div style="max-width: 1280px; margin: 0 auto; box-sizing: border-box; padding: clamp(24px, 4vw, 48px) {PADX} clamp(56px, 7vw, 96px);">
{inner}
</div>
</section>'''


# ---------------- Estrada com placas (componente) ----------------
def glyph(kind, color=NOITE):
    if kind == 'check':
        return f'<svg viewBox="0 0 24 24" aria-hidden="true" style="width: 22px; height: 22px; flex: none;"><path d="M 4 12.5 L 9.5 18 L 20 6.5" style="fill: none; stroke: {color}; stroke-width: 3.2; stroke-linecap: round; stroke-linejoin: round;"></path></svg>'
    if kind == 'desvio':
        return land.glyph('desvio')
    if kind == 'none':
        return ''
    return f'<svg viewBox="0 0 64 60" aria-hidden="true" style="width: 24px; height: 22px; flex: none;"><path d="{ARROW}" style="fill: {color};"></path></svg>'


def sign(n, name, kind='seta', state='normal', bg=OURO, size='clamp(1.5rem, 2.1vw, 2rem)'):
    if state == 'next':
        box = f'background: transparent; color: {CINZA}; box-shadow: inset 0 0 0 2px {CINZA};'
        badge = f'background: transparent; color: {CINZA}; box-shadow: inset 0 0 0 2px {CINZA};'
        g = ''
    else:
        fill = {'done': OURO, 'current': AMARELO}.get(state, bg)
        box = f'background: {fill}; color: {NOITE}; box-shadow: inset 0 0 0 5px {fill}, inset 0 0 0 8px {NOITE};'
        badge = f'background: {NOITE}; color: {AMARELO};'
        g = glyph('check' if state == 'done' else kind)
    return f'''<div style="display: inline-flex; align-items: center; gap: 14px; padding: 16px 22px 16px 16px; border-radius: 10px; {box}">
<span style="display: inline-flex; align-items: center; justify-content: center; min-width: 34px; height: 34px; border-radius: 6px; font-size: 19px; font-weight: 800; {badge}">{n}</span>
<span style="font-size: {size}; font-weight: 900; line-height: 1; letter-spacing: -0.02em; white-space: nowrap;">{name}</span>
{g}
</div>'''


def stage(sign_html, text_html, road='dark', start=False, end=False, here=False, post=True):
    extra = ''
    if start:
        extra += '<span class="road-start" aria-hidden="true"></span>'
    if end:
        col = OURO if road == 'dark' else LINHA
        extra += f'<svg class="road-end" viewBox="0 0 64 60" aria-hidden="true"><path d="{ARROW}" style="fill: {col};"></path></svg>'
    if here:
        extra += '<span class="pac" aria-hidden="true"></span>'
    road_bg = NOITE if road == 'dark' else LINHA
    dash = '<span class="st-dash"></span>' if road == 'dark' else ''
    post_html = '<div class="st-post" aria-hidden="true"></div>' if post else ''
    post_color = '' if road == 'dark' else f' style="background: {LINHA};"'
    if post and road != 'dark':
        post_html = f'<div class="st-post" aria-hidden="true"{post_color}></div>'
    return f'''<li class="st">
<div class="st-pole">
{sign_html}
{post_html}
</div>
<div class="st-road" aria-hidden="true" style="background: {road_bg};">{dash}{extra}</div>
<div class="st-text">
{text_html}
</div>
</li>'''


def stage_text(title, text, small=None):
    s = f'<h3 style="margin: 0 0 10px; font-size: 1.375rem; font-weight: 800; line-height: 1.2; color: {NOITE}; text-wrap: balance;">{title}</h3>'
    s += f'<p style="margin: 0 0 16px; max-width: 32ch; font-size: 1.0625rem; line-height: 1.55; color: {MARINHO}; text-wrap: pretty;">{text}</p>'
    if small:
        s += f'<p style="margin: 0; font-size: 0.9375rem; line-height: 1.4; color: {NOITE};">{small}</p>'
    return s


# ---------------- LANDING ----------------
def hero():
    h = land.hero()
    old_header = h[h.index('<header'):h.index('</header>') + len('</header>')]
    h = h.replace(old_header, header(on_landing=True))
    h = h.replace('<a class="btn" href="#login"', f'<a class="btn" href="{LOGIN}"')
    return h


def jornada():
    stages = []
    for n, name, kind, bg, title, text, area in land.STAGES:
        stages.append(stage(sign(n, name, kind, bg=bg), stage_text(title, text, f'Na plataforma: <strong style="font-weight: 700;">{area}</strong>'),
                            start=(n == 1), end=(n == 4)))
    inner = f'''<div style="display: flex; flex-direction: column; gap: 18px; margin-bottom: clamp(48px, 6vw, 80px);">
<h2 style="margin: 0; font-size: clamp(2.25rem, 4.6vw, 4rem); font-weight: 800; line-height: 1.02; letter-spacing: -0.025em; color: {NOITE};">Do galpão à porta.</h2>
<p style="margin: 0; max-width: 46ch; font-size: clamp(1.0625rem, 1.3vw, 1.25rem); line-height: 1.55; color: {MARINHO}; text-wrap: pretty;">Uma entrega passa por quatro momentos. A UrbanLink Flow tem uma área da plataforma pra cada um.</p>
</div>
<ol class="jr" style="list-style: none; margin: 0; padding: 0;">
{''.join(stages)}
</ol>'''
    return f'<section id="como-funciona" class="light" style="background: {NEVOA}; color: {NOITE};">{wrap(inner)}</section>'


def rastrear_form(compact=False, value=''):
    val = f' value="{value}"' if value else ''
    return f'''<form role="search" action="{RASTREIO}" style="display: flex; flex-direction: column; gap: 10px; margin: 0;">
<label for="codigo" style="font-size: 16px; font-weight: 600; color: #FFFFFF;">Código de rastreio</label>
<div class="dark-in" style="display: flex; flex-wrap: wrap; gap: 12px;">
<div class="fld" style="flex: 1 1 260px;"><input id="codigo" name="codigo" type="text" autocomplete="off" spellcheck="false" placeholder="Ex.: UL123456789BR"{val} style="min-height: 56px; font-size: 18px; letter-spacing: 0.02em;"></div>
<a class="btn" href="{RASTREIO}" style="{BTN_OURO}">Rastrear</a>
</div>
<p style="margin: 0; font-size: 15px; line-height: 1.5; color: {TEXTO2};">O código vem no e-mail ou SMS de envio e tem letras e números.</p>
</form>'''


def rastrear_secao():
    inner = f'''<div style="display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 32px 64px;">
<div style="flex: 1 1 420px; min-width: 0; display: flex; flex-direction: column; gap: 18px;">
<h2 style="margin: 0; font-size: clamp(2.25rem, 4.6vw, 4rem); font-weight: 800; line-height: 1.02; letter-spacing: -0.025em;">Rastrear uma entrega.</h2>
<p style="margin: 0; max-width: 40ch; font-size: clamp(1.0625rem, 1.3vw, 1.25rem); line-height: 1.55; color: {TEXTO2}; text-wrap: pretty;">Veja em que ponto do caminho a sua entrega está, do galpão até a sua porta.</p>
</div>
<div style="flex: 1 1 460px; min-width: 0;">
{rastrear_form()}
</div>
</div>'''
    return f'<section id="rastrear" style="background: {MARINHO}; color: #FFFFFF;">{wrap(inner)}</section>'


def sobre():
    inner = f'''<div class="split" style="align-items: start;">
<h2 style="margin: 0; font-size: clamp(2.25rem, 4.6vw, 4rem); font-weight: 800; line-height: 1.02; letter-spacing: -0.025em; color: {NOITE};">Quem faz a<br>UrbanLink Flow.</h2>
<div style="display: flex; flex-direction: column; gap: 18px; font-size: clamp(1.0625rem, 1.3vw, 1.1875rem); line-height: 1.6; color: {MARINHO};">
<p style="margin: 0; text-wrap: pretty;">A UrbanLink Systems é uma empresa brasileira de tecnologia para logística urbana, fundada em 2017. Desenvolve soluções para otimizar entregas, reduzir congestionamentos e conectar centros de distribuição, veículos e consumidores em tempo real.</p>
<p style="margin: 0; text-wrap: pretty;">A UrbanLink Flow é a nova plataforma da empresa, feita para gestores de logística, operadores de transporte, prefeituras, empresas de e-commerce e profissionais de mobilidade urbana.</p>
<a class="lnk" href="{CONTATO}" style="align-self: flex-start; font-size: 18px; font-weight: 600; text-decoration: underline; text-underline-offset: 6px; text-decoration-thickness: 2px; min-height: 44px; display: inline-flex; align-items: center;">Falar com a equipe</a>
</div>
</div>'''
    return f'<section id="sobre" class="light" style="background: {NEVOA}; color: {NOITE};">{wrap(inner)}</section>'


def chamada():
    c = land.chamada()
    c = c.replace('<a class="btn" href="#login"', f'<a class="btn" href="{LOGIN}"')
    btn_end = c.index('Entrar na plataforma</a>') + len('Entrar na plataforma</a>')
    btn_start = c.rfind('<a class="btn"', 0, btn_end)
    btn = c[btn_start:btn_end]
    group = f'''<div style="display: flex; flex-wrap: wrap; align-items: center; gap: 12px 28px;">
{btn}
<a class="lnk" href="{CONTATO}" style="{LINK_W}">Falar com a equipe</a>
</div>'''
    return c[:btn_start] + group + c[btn_end:]


def landing():
    return '\n'.join([hero(), jornada(), land.plataforma().replace('<section id="plataforma"', '<section id="plataforma" class="light"'),
                      rastrear_secao(), sobre(), chamada(), rodape()])


# ---------------- LOGIN ----------------
def login():
    B = 520
    far = skyline(7, 40, 96, 300, 400, B, rise=(860, 300))
    mid = skyline(21, 54, 120, 350, 420, B, rise=(980, 200))
    near = skyline(42, 70, 160, 452, 492, B, setback=0.15)
    art = f'''<div class="login-art" style="position: relative; background: {MARINHO}; overflow: hidden; display: flex; flex-direction: column; padding: 32px clamp(24px, 4vw, 56px);">
<a href="{LANDING}" aria-label="UrbanLink, voltar ao site" style="position: relative; z-index: 1; display: flex; align-items: center; min-height: 44px; align-self: flex-start;">{logo_h('dark')}</a>
<p style="position: relative; z-index: 1; margin: clamp(48px, 9vh, 120px) 0 0; max-width: 16ch; font-size: clamp(2.25rem, 3.6vw, 3.5rem); font-weight: 800; line-height: 1.02; letter-spacing: -0.025em; color: #FFFFFF;">A cidade toda numa tela só.</p>
<svg viewBox="160 0 900 {B}" preserveAspectRatio="xMidYMax slice" aria-hidden="true" style="position: absolute; left: 0; right: 0; bottom: 0; width: 100%; height: 460px; display: block;">
<path d="{far}" style="fill: #1F2853;"></path>
<path d="{mid}" style="fill: {NOITE};"></path>
<path d="M 140 420 H 250 L 320 360 H 610 L 690 430 H 930 L 1000 370 H 1100" style="fill: none; stroke: {OURO}; stroke-width: 12; stroke-linejoin: round; stroke-linecap: round;"></path>
<circle cx="610" cy="360" r="17" style="fill: none; stroke: {AMARELO}; stroke-width: 3; opacity: 0.45;"></circle>
<circle cx="610" cy="360" r="10" style="fill: {AMARELO};"></circle>
<path d="{near}" style="fill: #121830;"></path>
</svg>
</div>'''
    eye = f'<svg viewBox="0 0 24 24" aria-hidden="true" style="width: 22px; height: 22px; fill: none; stroke: {NOITE}; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round;"><path d="M 2 12 C 4.5 7 8 5 12 5 C 16 5 19.5 7 22 12 C 19.5 17 16 19 12 19 C 8 19 4.5 17 2 12 Z"></path><circle cx="12" cy="12" r="3"></circle></svg>'
    back = f'<svg viewBox="0 0 24 24" aria-hidden="true" style="width: 18px; height: 18px; fill: none; stroke: currentColor; stroke-width: 2.4; stroke-linecap: round; stroke-linejoin: round;"><path d="M 15 5 L 8 12 L 15 19"></path></svg>'
    form = f'''<div class="light" style="background: {BRANCO}; display: flex; flex-direction: column; padding: 32px clamp(20px, 5vw, 72px);">
<div style="display: flex; align-items: center; justify-content: space-between; gap: 16px;">
<a class="login-logo-m" href="{LANDING}" aria-label="UrbanLink, voltar ao site" style="align-items: center; min-height: 44px;">{gen_logo_mono(24)}</a>
<a class="lnk" href="{LANDING}" style="margin-left: auto; display: inline-flex; align-items: center; gap: 6px; min-height: 44px; font-size: 16px; font-weight: 600; text-decoration: none;">{back}Voltar para o site</a>
</div>
<div style="flex: 1; display: flex; align-items: center; justify-content: center; padding: clamp(32px, 6vh, 64px) 0;">
<form style="width: 100%; max-width: 420px; display: flex; flex-direction: column; gap: 22px; margin: 0;">
<div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 6px;">
<h1 style="margin: 0; font-size: clamp(2rem, 3vw, 2.75rem); font-weight: 800; line-height: 1.05; letter-spacing: -0.02em; color: {NOITE};">Entrar na plataforma</h1>
<p style="margin: 0; font-size: 17px; line-height: 1.55; color: {MARINHO};">Use o e-mail e a senha que a sua empresa cadastrou pra você.</p>
</div>
<div class="fld"><label for="email">E-mail</label><input id="email" name="email" type="email" autocomplete="username" placeholder="voce@empresa.com.br"></div>
<div class="fld"><label for="senha">Senha</label>
<div style="position: relative;"><input id="senha" name="senha" type="password" autocomplete="current-password" style="padding-right: 60px;">
<button type="button" aria-label="Mostrar senha" aria-pressed="false" style="position: absolute; right: 4px; top: 4px; width: 44px; height: 44px; display: inline-flex; align-items: center; justify-content: center; background: transparent; border: 0; border-radius: 6px; cursor: pointer;">{eye}</button></div>
</div>
<div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px 16px;">
<label style="display: inline-flex; align-items: center; gap: 10px; min-height: 44px; font-size: 16px; color: {NOITE}; cursor: pointer;"><input type="checkbox" name="manter" style="width: 20px; height: 20px; margin: 0; accent-color: {NOITE};">Manter conectado</label>
<a class="lnk" href="#" style="display: inline-flex; align-items: center; min-height: 44px; font-size: 16px; font-weight: 600; text-underline-offset: 5px;">Esqueci minha senha</a>
</div>
<button class="btn" type="submit" style="{BTN_NOITE} width: 100%;">Entrar</button>
<p style="margin: 6px 0 0; font-size: 16px; line-height: 1.5; color: {MARINHO};">Ainda não tem acesso? <a class="lnk" href="{CONTATO}" style="font-weight: 600; text-underline-offset: 5px;">Fale com a gente</a></p>
</form>
</div>
</div>'''
    return f'<div class="login">\n{art}\n{form}\n</div>'


def gen_logo_mono(h):
    import gen
    return gen.logo_h('mono', h)


# ---------------- RASTREAMENTO ----------------
def map_status():
    m = land.city_map()
    route_old = "M 120 455 V 390 H 330 V 280 H 560 V 190 H 790"
    i = m.index(f'<path d="{route_old}"')
    j = m.index('</path>', i) + len('</path>')
    done = f'<path d="M 120 455 V 390 H 330 V 280 H 560 V 236" style="fill: none; stroke: {OURO}; stroke-width: 10; stroke-linejoin: round; stroke-linecap: round;"></path>'
    rest = f'<path d="M 560 236 V 190 H 790" style="fill: none; stroke: {NOITE}; stroke-width: 6; stroke-dasharray: 2 14; stroke-linecap: round;"></path>'
    pac = f'<circle cx="560" cy="236" r="22" style="fill: none; stroke: {AMARELO}; stroke-width: 6; opacity: 0.55;"></circle><circle cx="560" cy="236" r="14" style="fill: {AMARELO}; stroke: {NOITE}; stroke-width: 5;"></circle>'
    return m[:i] + rest + done + m[j:].replace('</svg>', pac + '</svg>', 1)


def rastreamento():
    top = f'''<div style="display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 32px 64px;">
<div style="flex: 1 1 420px; min-width: 0; display: flex; flex-direction: column; gap: 16px;">
<h1 style="margin: 0; font-size: clamp(2.5rem, 5vw, 4.5rem); font-weight: 800; line-height: 1; letter-spacing: -0.025em;">Rastrear uma entrega.</h1>
<p style="margin: 0; max-width: 40ch; font-size: clamp(1.0625rem, 1.3vw, 1.25rem); line-height: 1.55; color: {TEXTO2}; text-wrap: pretty;">Veja em que ponto do caminho a sua entrega está, do galpão até a sua porta.</p>
</div>
<div style="flex: 1 1 460px; min-width: 0;">{rastrear_form(value='UL123456789BR')}</div>
</div>'''
    sz = 'clamp(1.25rem, 1.6vw, 1.5rem)'
    ev = lambda d, p: f'<p style="margin: 0; font-size: 1.0625rem; line-height: 1.5; color: {MARINHO};"><strong style="font-weight: 700; color: {NOITE};">{d}</strong><br>{p}</p>'
    stages = [
        stage(sign(1, 'Postado', state='done', size=sz), ev('20/10/2026, 14:42', 'São Paulo, SP'), start=True),
        stage(sign(2, 'Em trânsito', state='done', size=sz), ev('21/10/2026, 07:21', 'São Paulo, SP')),
        stage(sign(3, 'Em rota', state='current', size=sz), ev('23/10/2026, 16:22', 'Rio de Janeiro, RJ'), here=True),
        stage(sign(4, 'Entregue', state='next', size=sz), ev('Previsão: 24/10/2026', 'Ainda não chegou'), road='light', end=True),
    ]
    status = f'''<div style="display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 16px 40px; margin-bottom: clamp(40px, 5vw, 64px);">
<div style="display: flex; flex-direction: column; gap: 10px;">
<p style="margin: 0; font-size: 17px; color: {MARINHO};">Entrega <strong style="font-weight: 700; color: {NOITE}; letter-spacing: 0.02em;">UL123456789BR</strong></p>
<h2 style="margin: 0; font-size: clamp(2rem, 3.8vw, 3.25rem); font-weight: 800; line-height: 1.05; letter-spacing: -0.02em; color: {NOITE};">Em rota de entrega</h2>
</div>
<p style="margin: 0; font-size: 18px; line-height: 1.5; color: {NOITE};">Previsão de entrega: <strong style="font-weight: 700;">24/10/2026</strong></p>
</div>'''
    road = f'<ol class="jr" aria-label="Etapas da entrega" style="list-style: none; margin: 0; padding: 0;">{"".join(stages)}</ol>'
    mapa = f'''<div style="margin-top: clamp(48px, 6vw, 80px); border: 2px solid {NOITE}; border-radius: 14px; overflow: hidden; background: {BRANCO};">
<div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px 24px; min-height: 56px; padding: 8px 20px; border-bottom: 1px solid #D6DCEA;">
<h3 style="margin: 0; font-size: 18px; font-weight: 700; color: {NOITE};">No mapa</h3>
<p style="margin: 0; font-size: 15px; color: {CINZA};">Atualizado em tempo real</p>
</div>
<div class="map-box" role="img" aria-label="Mapa com o caminho da entrega: já percorreu a maior parte e está perto do destino" style="position: relative;">{map_status()}</div>
</div>'''
    ajuda = f'''<div style="margin-top: clamp(40px, 5vw, 64px); display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 20px 40px; padding: 28px clamp(20px, 3vw, 36px); background: {BRANCO}; border-radius: 14px; box-shadow: inset 0 0 0 2px #D6DCEA;">
<div style="display: flex; flex-direction: column; gap: 6px; min-width: 0; flex: 1 1 360px;">
<h3 style="margin: 0; font-size: 1.375rem; font-weight: 800; color: {NOITE};">Precisa de ajuda com essa entrega?</h3>
<p style="margin: 0; font-size: 17px; line-height: 1.5; color: {MARINHO};">Se algo parecer errado, fale com a equipe. Ou receba cada mudança de etapa no seu e-mail.</p>
</div>
<div style="display: flex; flex-wrap: wrap; align-items: center; gap: 12px 24px;">
<button class="btn" type="button" style="{BTN_NOITE}">Receber atualizações por e-mail</button>
<a class="lnk" href="{CONTATO}" style="font-size: 18px; font-weight: 600; text-underline-offset: 6px; min-height: 44px; display: inline-flex; align-items: center;">Falar com a gente</a>
</div>
</div>'''
    body = f'<section class="light" aria-label="Resultado" style="background: {NEVOA}; color: {NOITE};">{wrap(status + road + mapa + ajuda)}</section>'
    return band(top, active='rastreio') + '\n' + body + '\n' + rodape()


# ---------------- CONTATO ----------------
def contato():
    top = f'''<div style="display: flex; flex-direction: column; gap: 16px;">
<h1 style="margin: 0; font-size: clamp(2.5rem, 5vw, 4.5rem); font-weight: 800; line-height: 1; letter-spacing: -0.025em;">Fale com a gente.</h1>
<p style="margin: 0; max-width: 46ch; font-size: clamp(1.0625rem, 1.3vw, 1.25rem); line-height: 1.55; color: {TEXTO2}; text-wrap: pretty;">Pra pedir um orçamento, tirar uma dúvida sobre uma entrega ou propor uma parceria. A equipe responde em até 48 horas.</p>
</div>'''
    form = f'''<form style="display: flex; flex-direction: column; gap: 22px; margin: 0; padding: clamp(24px, 3.4vw, 44px); background: {BRANCO}; border: 2px solid {NOITE}; border-radius: 14px;">
<h2 style="margin: 0 0 4px; font-size: clamp(1.5rem, 2.2vw, 2rem); font-weight: 800; line-height: 1.1; color: {NOITE};">Envie sua mensagem</h2>
<div class="two">
<div class="fld"><label for="nome">Nome completo</label><input id="nome" name="nome" type="text" autocomplete="name"></div>
<div class="fld"><label for="email">E-mail</label><input id="email" name="email" type="email" autocomplete="email"></div>
<div class="fld"><label for="tel">Telefone <span class="opt">(opcional)</span></label><input id="tel" name="telefone" type="tel" autocomplete="tel"></div>
<div class="fld"><label for="empresa">Empresa <span class="opt">(opcional)</span></label><input id="empresa" name="empresa" type="text" autocomplete="organization"></div>
</div>
<div class="fld"><label for="assunto">Assunto</label>
<select id="assunto" name="assunto"><option>Pedir um orçamento</option><option>Dúvida sobre uma entrega</option><option>Parceria</option><option>Outro assunto</option></select></div>
<div class="fld"><label for="msg">Mensagem</label><textarea id="msg" name="mensagem" placeholder="Conte o que a sua operação precisa."></textarea></div>
<label style="display: inline-flex; align-items: center; gap: 10px; min-height: 44px; font-size: 16px; color: {NOITE}; cursor: pointer;"><input type="checkbox" name="privacidade" style="width: 20px; height: 20px; margin: 0; flex: none; accent-color: {NOITE};"><span>Li e concordo com a <a href="#" style="font-weight: 600; text-underline-offset: 4px;">Política de Privacidade</a></span></label>
<div><button class="btn" type="submit" style="{BTN_NOITE}">Enviar mensagem</button></div>
</form>'''
    steps = [
        (1, 'Solicitação', 'Você conta o que a sua operação precisa.'),
        (2, 'Proposta', 'A equipe envia uma solução sob medida, com condições e prazos.'),
        (3, 'Acordo', 'As duas empresas alinham as expectativas.'),
        (4, 'Contratação', 'Tudo formalizado, a operação começa.'),
    ]
    sz = 'clamp(1.25rem, 1.6vw, 1.5rem)'
    road = ''.join(stage(sign(n, t, size=sz), f'<p style="margin: 0; max-width: 30ch; font-size: 1.0625rem; line-height: 1.55; color: {MARINHO};">{d}</p>',
                         start=(n == 1), end=(n == 4), post=False) for n, t, d in steps)
    side = f'''<div style="display: flex; flex-direction: column; gap: 28px; padding-top: 8px;">
<div style="display: flex; flex-direction: column; gap: 10px;">
<h2 style="margin: 0; font-size: clamp(1.5rem, 2.2vw, 2rem); font-weight: 800; line-height: 1.1; color: {NOITE};">Como funciona a contratação</h2>
<p style="margin: 0; font-size: 17px; line-height: 1.55; color: {MARINHO};">Do primeiro contato até a operação rodando.</p>
</div>
<ol class="jr v" style="list-style: none; margin: 0; padding: 0;">{road}</ol>
</div>'''
    body = f'<section class="light" style="background: {NEVOA}; color: {NOITE};">{wrap(f"<div class=\"split\">{form}{side}</div>")}</section>'
    return band(top, active='contato') + '\n' + body + '\n' + rodape()


def enviado():
    mini = f'''<svg viewBox="0 0 400 60" aria-hidden="true" style="width: 100%; max-width: 360px; height: auto; display: block;">
<rect x="14" y="19" width="340" height="22" style="fill: {NOITE};"></rect>
<path d="M 30 30 H 330" style="fill: none; stroke: {AMARELO}; stroke-width: 4; stroke-dasharray: 26 24;"></path>
<circle cx="20" cy="30" r="13" style="fill: {AMARELO}; stroke: {NOITE}; stroke-width: 4;"></circle>
<g transform="translate(332 0)"><path d="{ARROW}" style="fill: {OURO};"></path></g>
</svg>'''
    card = f'''<div style="max-width: 720px; margin: 0 auto; display: flex; flex-direction: column; gap: 28px; padding: clamp(28px, 4vw, 56px); background: {BRANCO}; border: 2px solid {NOITE}; border-radius: 14px;">
{mini}
<div style="display: flex; flex-direction: column; gap: 14px;">
<h1 style="margin: 0; font-size: clamp(2.25rem, 4.4vw, 3.5rem); font-weight: 800; line-height: 1.02; letter-spacing: -0.025em; color: {NOITE};">Mensagem enviada.</h1>
<p style="margin: 0; max-width: 46ch; font-size: 18px; line-height: 1.55; color: {MARINHO}; text-wrap: pretty;">A equipe já recebeu e responde em até 48 horas, no e-mail que você informou.</p>
</div>
<div style="display: flex; flex-direction: column; gap: 6px; padding: 20px 24px; background: {NEVOA}; border-radius: 10px;">
<p style="margin: 0; font-size: 16px; font-weight: 600; color: {NOITE};">Número do protocolo</p>
<p style="margin: 0; font-size: clamp(1.75rem, 3vw, 2.25rem); font-weight: 800; letter-spacing: 0.04em; color: {NOITE};">ULS20261246</p>
<p style="margin: 0; font-size: 16px; line-height: 1.5; color: {MARINHO};">Guarde esse número pra acompanhar o seu pedido.</p>
</div>
<div style="display: flex; flex-wrap: wrap; align-items: center; gap: 12px 28px;">
<a class="btn" href="{LANDING}" style="{BTN_NOITE}">Voltar para o início</a>
<a class="lnk" href="{RASTREIO}" style="font-size: 18px; font-weight: 600; text-underline-offset: 6px; min-height: 44px; display: inline-flex; align-items: center;">Rastrear uma entrega</a>
</div>
</div>'''
    top = f'<section style="background: {MARINHO};">{header()}</section>'
    body = f'<section class="light" style="background: {NEVOA}; color: {NOITE};">{wrap(card)}</section>'
    return top + '\n' + body + '\n' + rodape()


PAGES = {
    'Landing': ('Landing: página inicial', landing),
    'Login': ('Entrar na plataforma', login),
    'Rastreamento': ('Rastrear uma entrega', rastreamento),
    'Contato': ('Fale com a gente', contato),
    'Contato-Enviado': ('Mensagem enviada', enviado),
}


def write_all(heights=None):
    heights = heights or {}
    for key, (title, fn) in PAGES.items():
        body = fn()
        for suffix, w in (('', 1440), ('-Celular', 390)):
            h = heights.get(key + suffix, 1000)
            name = f'{key}{suffix}.dc.html'
            with open(os.path.join(OUT, name), 'w') as fh:
                fh.write(page(title + (' (celular)' if suffix else ''), body, w, h))
    print('wrote', len(PAGES) * 2, 'files')


if __name__ == '__main__':
    import json
    hp = '/home/claude/ulgen/heights.json'
    write_all(json.load(open(hp)) if os.path.exists(hp) and '--h' in sys.argv else None)
