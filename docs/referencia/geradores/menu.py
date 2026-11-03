"""Etapa 1 do canvas: menu do celular aberto (390 x 844)."""
import os, sys, json
sys.path.insert(0, '/home/claude/ulgen')
import sitegen as S
from land import NOITE, MARINHO, OURO, AMARELO, TEXTO2, ARROW, logo_h

X_ICON = '<svg viewBox="0 0 24 24" aria-hidden="true" style="width: 26px; height: 26px; fill: none; stroke: #FFFFFF; stroke-width: 2.2; stroke-linecap: round;"><path d="M 5 5 L 19 19 M 19 5 L 5 19"></path></svg>'

ITENS = [  # (texto, destino no protótipo, atual?)
    ('Início', 'Landing-Celular.dc.html', True),
    ('Como funciona', 'Landing-Celular.dc.html', False),
    ('Rastrear entrega', 'Rastreamento-Celular.dc.html', False),
    ('Fale com a gente', 'Contato-Celular.dc.html', False),
]

def item(texto, href, atual, ultimo):
    cur = ' aria-current="page"' if atual else ''
    und = 'text-decoration: underline; text-underline-offset: 8px; text-decoration-thickness: 3px; text-decoration-color: ' + AMARELO + ';' if atual else 'text-decoration: none;'
    if atual:
        marca = f'<span aria-hidden="true" style="position: absolute; top: 50%; left: 50%; width: 26px; height: 26px; border-radius: 50%; background: {AMARELO}; box-shadow: 0 0 0 4px {NOITE}; transform: translate(-50%, -50%);"></span>'
    else:
        marca = f'<span aria-hidden="true" style="position: absolute; top: 50%; left: 50%; width: 12px; height: 12px; border-radius: 50%; background: {TEXTO2}; transform: translate(-50%, -50%);"></span>'
    fim = ''
    if ultimo:
        fim = f'<svg viewBox="0 0 64 60" aria-hidden="true" style="position: absolute; left: 50%; bottom: -24px; width: 44px; height: 42px; transform: translateX(-50%) rotate(90deg);"><path d="{ARROW}" style="fill: {OURO};"></path></svg>'
    return f'''<li style="display: grid; grid-template-columns: 22px minmax(0, 1fr); column-gap: 22px;">
<span aria-hidden="true" style="position: relative; background: {MARINHO};"><span style="position: absolute; left: 9px; top: 0; bottom: 0; width: 4px; background: repeating-linear-gradient(180deg, {AMARELO} 0 22px, transparent 22px 42px); opacity: 0.85;"></span>{marca}{fim}</span>
<a class="lnk" href="{href}"{cur} style="display: flex; align-items: center; min-height: 72px; color: #FFFFFF; font-size: 28px; font-weight: 800; letter-spacing: -0.015em; {und}">{texto}</a>
</li>'''

def menu():
    lis = '\n'.join(item(t, h, a, i == len(ITENS) - 1) for i, (t, h, a) in enumerate(ITENS))
    return f'''<div role="dialog" aria-modal="true" aria-label="Menu" style="min-height: 844px; box-sizing: border-box; background: {NOITE}; color: #FFFFFF; display: flex; flex-direction: column; padding: 24px 20px 32px;">
<div style="display: flex; align-items: center; justify-content: space-between; gap: 16px;">
<a href="Landing-Celular.dc.html" aria-label="UrbanLink, início" style="display: flex; align-items: center; min-height: 44px;">{logo_h('dark')}</a>
<a class="btn" href="Landing-Celular.dc.html" aria-label="Fechar menu" style="display: inline-flex; align-items: center; justify-content: center; width: 48px; height: 48px; box-sizing: border-box; border: 2px solid rgba(255, 255, 255, 0.55); border-radius: 6px;">{X_ICON}</a>
</div>
<nav aria-label="Principal" style="margin-top: 48px;">
<ol style="list-style: none; margin: 0; padding: 0;">
{lis}
</ol>
</nav>
<a class="btn" href="Login-Celular.dc.html" style="{S.BTN_OURO} width: 100%; margin-top: 64px;">Entrar na plataforma</a>
<p style="margin: auto 0 0; padding-top: 32px; font-size: 15px; line-height: 1.5; color: {TEXTO2};">UrbanLink Systems, tecnologia para logística urbana desde 2017.</p>
</div>'''

if __name__ == '__main__':
    with open(os.path.join(S.OUT, 'Menu-Celular.dc.html'), 'w') as fh:
        fh.write(S.page('Menu do celular', menu(), 390, 844))
    hp = '/home/claude/ulgen/heights.json'
    S.write_all(json.load(open(hp)))
    print('ok')
