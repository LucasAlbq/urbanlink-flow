"""Etapa 2 do canvas: página 404 e rastreamento 'não encontrado' (desktop + celular)."""
import os, sys, json
sys.path.insert(0, '/home/user/ulgen')
import sitegen as S
from land import NOITE, MARINHO, OURO, AMARELO, TEXTO2, NEVOA, BRANCO, ARROW, PADX, wrap

CINZA, LINHA = S.CINZA, S.LINHA

RETORNO = f'''<svg viewBox="0 0 26 24" aria-hidden="true" style="width: 26px; height: 24px; flex: none;"><path d="M 19 22 V 10 A 6 6 0 0 0 7 10 V 17" style="fill: none; stroke: {NOITE}; stroke-width: 3.2; stroke-linecap: round;"></path><path d="M 2.5 13 L 7 17.5 L 11.5 13" style="fill: none; stroke: {NOITE}; stroke-width: 3.2; stroke-linecap: round; stroke-linejoin: round;"></path></svg>'''


def placa_retorno():
    return f'''<div style="display: inline-flex; align-items: center; gap: 14px; padding: 16px 22px; border-radius: 10px; background: {AMARELO}; color: {NOITE}; box-shadow: inset 0 0 0 5px {AMARELO}, inset 0 0 0 8px {NOITE};">
<span style="font-size: clamp(1.5rem, 2.1vw, 2rem); font-weight: 900; line-height: 1; letter-spacing: -0.02em; white-space: nowrap;">Retorno</span>
{RETORNO}
</div>'''


def rua_sem_saida():
    """Estrada escura com o pacote, placa de Retorno no fim e o trecho que não existe (claro, tracejado)."""
    dash = f'background: repeating-linear-gradient(90deg, {AMARELO} 0 26px, transparent 26px 50px);'
    return f'''<div aria-hidden="true" style="display: grid; grid-template-columns: minmax(0, 3fr) minmax(0, 2fr); align-items: end;">
<div style="position: relative; display: flex; flex-direction: column; align-items: flex-end;">
<div style="display: flex; flex-direction: column; align-items: center; margin-right: -2px;">
{placa_retorno()}
<div style="width: 8px; height: 44px; background: {NOITE};"></div>
</div>
<div style="position: relative; align-self: stretch; height: 22px; background: {NOITE};">
<span style="position: absolute; left: 0; right: 0; top: 9px; height: 4px; {dash}"></span>
<span style="position: absolute; left: max(0px, calc(100% - 200px)); top: 50%; width: 26px; height: 26px; border-radius: 50%; background: {AMARELO}; box-shadow: 0 0 0 4px {NOITE}, 0 0 0 10px rgba(255,215,69,.45); transform: translateY(-50%);"></span>
</div>
</div>
<div style="height: 22px; box-sizing: border-box; border: 3px dashed {LINHA}; border-left: 0;"></div>
</div>'''


def pagina_404():
    top = f'''<div style="display: flex; flex-direction: column; gap: 16px;">
<h1 style="margin: 0; font-size: clamp(2.75rem, 5.6vw, 5.5rem); font-weight: 800; line-height: 1; letter-spacing: -0.025em;">Essa rua não existe.</h1>
<p style="margin: 0; max-width: 46ch; font-size: clamp(1.0625rem, 1.3vw, 1.25rem); line-height: 1.55; color: {TEXTO2}; text-wrap: pretty;">O endereço que você abriu não leva a nenhuma página do site. Pode ser um link digitado errado ou uma página que mudou de lugar.</p>
</div>'''
    acoes = f'''<div style="display: flex; flex-wrap: wrap; align-items: center; gap: 12px 28px; margin-top: clamp(48px, 6vw, 72px);">
<a class="btn" href="{S.LANDING}" style="{S.BTN_NOITE}">Voltar para o início</a>
<a class="lnk" href="{S.RASTREIO}" style="font-size: 18px; font-weight: 600; text-underline-offset: 6px; min-height: 44px; display: inline-flex; align-items: center;">Rastrear uma entrega</a>
<a class="lnk" href="{S.CONTATO}" style="font-size: 18px; font-weight: 600; text-underline-offset: 6px; min-height: 44px; display: inline-flex; align-items: center;">Falar com a gente</a>
</div>'''
    body = f'<section class="light" style="background: {NEVOA}; color: {NOITE};">{wrap(rua_sem_saida() + acoes)}</section>'
    return S.band(top) + '\n' + body + '\n' + S.rodape()


def rastreio_nao_encontrado():
    top = f'''<div style="display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: 32px 64px;">
<div style="flex: 1 1 420px; min-width: 0; display: flex; flex-direction: column; gap: 16px;">
<h1 style="margin: 0; font-size: clamp(2.5rem, 5vw, 4.5rem); font-weight: 800; line-height: 1; letter-spacing: -0.025em;">Rastrear uma entrega.</h1>
<p style="margin: 0; max-width: 40ch; font-size: clamp(1.0625rem, 1.3vw, 1.25rem); line-height: 1.55; color: {TEXTO2}; text-wrap: pretty;">Veja em que ponto do caminho a sua entrega está, do galpão até a sua porta.</p>
</div>
<div style="flex: 1 1 460px; min-width: 0;">{S.rastrear_form(value='UL12345678BR')}</div>
</div>'''
    sz = 'clamp(1.25rem, 1.6vw, 1.5rem)'
    placa = S.sign('?', 'Código não encontrado', state='next', size=sz)
    texto = f'<p style="margin: 0; font-size: 1.0625rem; line-height: 1.5; color: {MARINHO};">Nenhuma etapa registrada pra esse código.</p>'
    estrada = f'<ol class="jr" aria-label="Etapas da entrega" style="list-style: none; margin: 0; padding: 0; grid-template-columns: minmax(0, 1fr);">{S.stage(placa, texto, road="light", end=True)}</ol>'
    status = f'''<div style="display: flex; flex-direction: column; gap: 10px; margin-bottom: clamp(40px, 5vw, 64px);">
<p style="margin: 0; font-size: 17px; color: {MARINHO};">Entrega <strong style="font-weight: 700; color: {NOITE}; letter-spacing: 0.02em;">UL12345678BR</strong></p>
<h2 style="margin: 0; font-size: clamp(2rem, 3.8vw, 3.25rem); font-weight: 800; line-height: 1.05; letter-spacing: -0.02em; color: {NOITE};">Não achamos essa entrega</h2>
<p style="margin: 6px 0 0; max-width: 52ch; font-size: 18px; line-height: 1.55; color: {MARINHO}; text-wrap: pretty;">Confira as letras e os números do código ou fale com a gente.</p>
</div>'''
    ajuda = f'''<div style="margin-top: clamp(40px, 5vw, 64px); display: flex; flex-wrap: wrap; align-items: center; gap: 12px 28px;">
<a class="btn" href="#codigo" style="{S.BTN_NOITE}">Tentar outro código</a>
<a class="lnk" href="{S.CONTATO}" style="font-size: 18px; font-weight: 600; text-underline-offset: 6px; min-height: 44px; display: inline-flex; align-items: center;">Falar com a gente</a>
</div>'''
    body = f'<section class="light" aria-label="Resultado" style="background: {NEVOA}; color: {NOITE};">{wrap(status + estrada + ajuda)}</section>'
    return S.band(top, active='rastreio') + '\n' + body + '\n' + S.rodape()


PAGES = {
    'Pagina-404': ('Página não encontrada', pagina_404),
    'Rastreamento-Nao-Encontrado': ('Entrega não encontrada', rastreio_nao_encontrado),
}

if __name__ == '__main__':
    hp = '/home/user/ulgen/heights.json'
    H = json.load(open(hp))
    for key, (title, fn) in PAGES.items():
        body = fn()
        for suf, w in (('', 1440), ('-Celular', 390)):
            name = f'{key}{suf}.dc.html'
            with open(os.path.join(S.OUT, name), 'w') as fh:
                fh.write(S.page(title + (' (celular)' if suf else ''), body, w, H.get(key + suf, 1000)))
    print('ok')
