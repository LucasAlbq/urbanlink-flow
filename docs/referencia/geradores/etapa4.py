"""Etapa 4 do canvas: quadros da passagem abertura -> hero (desktop, 1440x900)."""
import os, sys, json
sys.path.insert(0, '/home/claude/ulgen')
import gen
import sitegen as S
from land import NOITE, AMARELO

# ---- easings ----
def bezier(p1x, p1y, p2x, p2y):
    def bx(t): return 3*(1-t)**2*t*p1x + 3*(1-t)*t**2*p2x + t**3
    def by(t): return 3*(1-t)**2*t*p1y + 3*(1-t)*t**2*p2y + t**3
    def f(x):
        lo, hi = 0.0, 1.0
        for _ in range(60):
            mid = (lo + hi) / 2
            if bx(mid) < x: lo = mid
            else: hi = mid
        return by((lo + hi) / 2)
    return f

ul = bezier(0.22, 1, 0.36, 1)
def p2io(x): return 4*x**3 if x < 0.5 else 1 - (-2*x + 2)**3 / 2
def cl(x): return max(0.0, min(1.0, x))

# ---- geometria (tela de 1440 x 900) ----
LOGO_W = 620
esc = LOGO_W / 852.28
logo_h = 419.28 * esc
L0x, L0y = (1440 - LOGO_W) / 2, (900 - logo_h) / 2
A = (L0x + (1214 - 533.86) * esc, L0y + (408 - 327) * esc)    # fim da rota no logo
B = (470, 900 - 520 + 360)                                     # ponto da rota no hero
C = ((A[0] + B[0]) / 2, (A[1] + B[1]) / 2 - 160)               # controle: arco passa 80 px acima do meio

def voo(t):
    return ((1-t)**2*A[0] + 2*t*(1-t)*C[0] + t**2*B[0], (1-t)**2*A[1] + 2*t*(1-t)*C[1] + t**2*B[1])

QUADROS = [  # (nome, momento em s, descrição curta)
    ('Passagem-1', 2.20, 'logo pronto, cortina parada'),
    ('Passagem-2', 2.35, 'cortina subindo, pacote saindo do logo'),
    ('Passagem-3', 2.50, 'pacote no meio do voo, hero aparecendo'),
    ('Passagem-4', 2.65, 'cortina fora, pacote chegando na rota'),
    ('Passagem-5', 2.80, 'pacote pousado, hero pronto'),
]

def estado(t):
    cortina = ul(cl((t - 2.20) / 0.5))          # 0 = cobrindo tudo, 1 = fora da tela
    pacote = p2io(cl((t - 2.20) / 0.6))         # 0 = no logo, 1 = na rota
    texto = ul(cl((t - 2.45) / 0.3))            # entrada do hero
    return cortina, pacote, texto

def quadro(pfx, t):
    cortina, pacote, texto = estado(t)
    hero = S.hero()
    for k in ('class="rise"', 'class="rise rise-2"', 'class="rise rise-3"'):
        hero = hero.replace(k, 'class="fr"')
    pousou = pacote >= 0.999
    if not pousou:
        hero = hero.replace('<circle cx="470" cy="360" r="17" style="', '<circle cx="470" cy="360" r="17" style="display: none; ')
        hero = hero.replace('<circle cx="470" cy="360" r="10" style="', '<circle cx="470" cy="360" r="10" style="display: none; ')
    logo = gen.logo_anim_svg(pfx, None, f'{LOGO_W}px')
    x, y = voo(pacote)
    voando = '' if pousou else f'<div aria-hidden="true" style="position: absolute; z-index: 11; left: {x - 10:.1f}px; top: {y - 10:.1f}px; width: 20px; height: 20px; border-radius: 50%; background: {AMARELO}; box-shadow: 0 0 0 3px {NOITE};"></div>'
    cortina_html = '' if cortina >= 0.999 else f'''<div aria-hidden="true" style="position: absolute; z-index: 10; left: 0; top: 0; width: 1440px; height: 900px; background: {NOITE}; transform: translateY({-cortina * 100:.2f}%); display: flex; align-items: center; justify-content: center;">
{logo}
</div>'''
    css = f'\n.fr{{opacity:{texto:.3f};transform:translateY({12 * (1 - texto):.2f}px)}}'
    corpo = f'''<div style="width: 1440px; height: 900px; position: relative; overflow: hidden; background: {NOITE}; font-family: {S.FONT};">
{hero}
{cortina_html}
{voando}
</div>'''
    return css, corpo

if __name__ == '__main__':
    base_css = S.CSS
    for i, (nome, t, desc) in enumerate(QUADROS):
        css, corpo = quadro(f'pa{i + 1}', t)
        S.CSS = base_css + css
        html = S.head(f'Passagem em {str(t).replace(".", ",")} s') + corpo + '\n' + S.tail({'$preview': {'width': 1440, 'height': 900}})
        with open(os.path.join(S.OUT, f'{nome}.dc.html'), 'w') as fh:
            fh.write(html)
        c, p, tx = estado(t)
        print(nome, t, f'cortina {c:.2f} pacote {p:.2f} texto {tx:.2f}')
    S.CSS = base_css
