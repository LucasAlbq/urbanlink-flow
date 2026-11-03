"""Etapa 3 do canvas: Política de Privacidade + recuperar senha (pedir link, link enviado, senha nova)."""
import os, sys, json
sys.path.insert(0, '/home/claude/ulgen')
import sitegen as S
from land import NOITE, MARINHO, OURO, AMARELO, TEXTO2, NEVOA, BRANCO, ARROW, PADX, wrap

POLITICA = 'Politica.dc.html'
RECUPERAR = 'Recuperar-Senha.dc.html'

S.CSS += '''
.pol{display:grid;grid-template-columns:240px minmax(0,1fr);gap:clamp(32px,6vw,96px);align-items:start}
.ph{background:#FBE8BF;color:#1A223C;border-radius:4px;padding:0 6px;font-weight:600}
@media (max-width: 900px){.pol{grid-template-columns:minmax(0,1fr)}}'''


def ph(t):
    return f'<span class="ph">[{t}]</span>'


# ---------------- Política de Privacidade ----------------
SECOES = [
    ('quem', 'Quem somos', [
        'A UrbanLink Systems é uma empresa fictícia, criada pra um projeto acadêmico do curso de Desenvolvimento de Sistemas. Esta política explica como o site da UrbanLink Flow trata os dados de quem usa.']),
    ('dados', 'Que dados o site coleta', [
        '<strong>No Fale com a gente:</strong> nome, e-mail, assunto e mensagem. Telefone e empresa só se você preencher.',
        '<strong>No login:</strong> e-mail e senha. A senha nunca é guardada em texto aberto.',
        '<strong>No rastreamento:</strong> o código que você digita, só pra fazer a busca.',
        'O site não pede localização, documentos nem acesso à câmera.']),
    ('uso', 'Pra que usamos', [
        'Pra responder a sua mensagem ou pedido de orçamento, pra você entrar na plataforma e continuar conectado, e pra mostrar onde está a sua entrega.',
        'Não vendemos nem emprestamos seus dados pra ninguém.']),
    ('cookies', 'Cookies', [
        'O site usa um único cookie, o da sessão de login, que é necessário pra plataforma funcionar. Não há cookies de propaganda nem de estatística.']),
    ('tempo', 'Por quanto tempo guardamos', [
        f'As mensagens do Fale com a gente ficam guardadas por {ph("prazo a definir pelo grupo")}. Os dados de login ficam guardados enquanto a conta existir.']),
    ('direitos', 'Seus direitos', [
        'Pela Lei Geral de Proteção de Dados (Lei 13.709/2018), você pode pedir, entre outras coisas, pra confirmar se temos dados seus, ver esses dados, corrigir o que estiver errado, apagar o que não for mais necessário e saber com quem eles foram compartilhados.']),
    ('pedir', 'Como fazer um pedido', [
        f'Use o <a href="{S.CONTATO}" style="font-weight: 600; text-underline-offset: 4px;">Fale com a gente</a> e escolha o assunto "Outro assunto", ou escreva pra {ph("e-mail do responsável pelos dados")}.']),
]


def politica():
    top = f'''<div style="display: flex; flex-direction: column; gap: 16px;">
<h1 style="margin: 0; font-size: clamp(2.5rem, 5vw, 4.5rem); font-weight: 800; line-height: 1; letter-spacing: -0.025em;">Política de Privacidade</h1>
<p style="margin: 0; max-width: 46ch; font-size: clamp(1.0625rem, 1.3vw, 1.25rem); line-height: 1.55; color: {TEXTO2}; text-wrap: pretty;">Quais dados o site coleta, pra quê, e o que você pode pedir.</p>
<p style="margin: 0; font-size: 15px; color: {TEXTO2};">Última atualização: <span class="ph">[data]</span></p>
</div>'''
    indice = ''.join(
        f'<li style="position: relative; padding-left: 22px;"><span aria-hidden="true" style="position: absolute; left: -7px; top: 50%; width: 12px; height: 12px; border-radius: 50%; background: {NOITE if i == 0 else S.LINHA}; transform: translateY(-50%);"></span>'
        f'<a class="lnk" href="#{sid}" style="display: inline-flex; align-items: center; min-height: 44px; font-size: 16px; font-weight: {700 if i == 0 else 500}; text-decoration: none;">{t}</a></li>'
        for i, (sid, t, _) in enumerate(SECOES))
    nav = f'''<nav aria-label="Nesta página" style="position: sticky; top: 24px;">
<p style="margin: 0 0 12px; font-size: 15px; font-weight: 600; color: {S.CINZA};">Nesta página</p>
<ol style="list-style: none; margin: 0; padding: 0 0 0 0; border-left: 2px solid {S.LINHA};">{indice}</ol>
</nav>'''
    blocos = ''
    for sid, t, ps in SECOES:
        corpo = ''.join(f'<p style="margin: 0; max-width: 68ch; font-size: 1.125rem; line-height: 1.65; color: {MARINHO}; text-wrap: pretty;">{p}</p>' for p in ps)
        blocos += f'''<section id="{sid}" style="display: flex; flex-direction: column; gap: 14px; padding: 28px 0; border-top: 1px solid #D6DCEA;">
<h2 style="margin: 0; font-size: clamp(1.5rem, 2.2vw, 1.875rem); font-weight: 800; line-height: 1.15; color: {NOITE};">{t}</h2>
{corpo}
</section>'''
    body = f'<section class="light" style="background: {BRANCO}; color: {NOITE};">{wrap(f"<div class=\"pol\">{nav}<div>{blocos}</div></div>")}</section>'
    return S.band(top) + '\n' + body + '\n' + S.rodape()


# ---------------- Recuperar senha (3 estados, no molde do login) ----------------
def molde_login(conteudo):
    full = S.login()
    i = full.index(f'<div class="light" style="background: {BRANCO}; display: flex; flex-direction: column; padding: 32px')
    art = full[:i]
    back = '<svg viewBox="0 0 24 24" aria-hidden="true" style="width: 18px; height: 18px; fill: none; stroke: currentColor; stroke-width: 2.4; stroke-linecap: round; stroke-linejoin: round;"><path d="M 15 5 L 8 12 L 15 19"></path></svg>'
    right = f'''<div class="light" style="background: {BRANCO}; display: flex; flex-direction: column; padding: 32px clamp(20px, 5vw, 72px);">
<div style="display: flex; align-items: center; justify-content: space-between; gap: 16px;">
<a class="login-logo-m" href="{S.LANDING}" aria-label="UrbanLink, voltar ao site" style="align-items: center; min-height: 44px;">{S.gen_logo_mono(24)}</a>
<a class="lnk" href="{S.LOGIN}" style="margin-left: auto; display: inline-flex; align-items: center; gap: 6px; min-height: 44px; font-size: 16px; font-weight: 600; text-decoration: none;">{back}Voltar para o login</a>
</div>
<div style="flex: 1; display: flex; align-items: center; justify-content: center; padding: clamp(32px, 6vh, 64px) 0;">
<div style="width: 100%; max-width: 420px; display: flex; flex-direction: column; gap: 22px;">
{conteudo}
</div>
</div>
</div>'''
    return art + right + '\n</div>'


def titulo(h, p):
    return f'''<div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: 6px;">
<h1 style="margin: 0; font-size: clamp(2rem, 3vw, 2.75rem); font-weight: 800; line-height: 1.05; letter-spacing: -0.02em; color: {NOITE};">{h}</h1>
<p style="margin: 0; font-size: 17px; line-height: 1.55; color: {MARINHO}; text-wrap: pretty;">{p}</p>
</div>'''


def recuperar():
    c = titulo('Criar uma senha nova', 'Digite o e-mail da sua conta. Se ele estiver cadastrado, a gente manda um link pra criar uma senha nova.')
    c += f'''<form style="display: flex; flex-direction: column; gap: 22px; margin: 0;">
<div class="fld"><label for="email">E-mail</label><input id="email" name="email" type="email" autocomplete="email" placeholder="voce@empresa.com.br"></div>
<button class="btn" type="submit" style="{S.BTN_NOITE} width: 100%;">Enviar link</button>
</form>
<p style="margin: 0; font-size: 16px; line-height: 1.5; color: {MARINHO};">Lembrou a senha? <a class="lnk" href="{S.LOGIN}" style="font-weight: 600; text-underline-offset: 5px;">Voltar para o login</a></p>'''
    return molde_login(c)


def mini_estrada():
    return f'''<svg viewBox="0 0 400 60" aria-hidden="true" style="width: 100%; max-width: 300px; height: auto; display: block;">
<rect x="14" y="19" width="340" height="22" style="fill: {NOITE};"></rect>
<path d="M 30 30 H 330" style="fill: none; stroke: {AMARELO}; stroke-width: 4; stroke-dasharray: 26 24;"></path>
<circle cx="190" cy="30" r="13" style="fill: {AMARELO}; stroke: {NOITE}; stroke-width: 4;"></circle>
<g transform="translate(332 0)"><path d="{ARROW}" style="fill: {OURO};"></path></g>
</svg>'''


def recuperar_enviado():
    c = mini_estrada()
    c += titulo('Confira seu e-mail', f'Se esse e-mail tiver uma conta, o link pra criar uma senha nova já está a caminho. Ele vale por {ph("tempo a definir")}.')
    c += f'''<p style="margin: 0; font-size: 16px; line-height: 1.55; color: {MARINHO};">Não chegou em alguns minutos? Olhe a caixa de spam ou peça outro link.</p>
<a class="btn" href="{S.LOGIN}" style="{S.BTN_NOITE} width: 100%;">Voltar para o login</a>
<a class="lnk" href="{RECUPERAR}" style="align-self: flex-start; font-size: 16px; font-weight: 600; text-underline-offset: 5px; min-height: 44px; display: inline-flex; align-items: center;">Pedir outro link</a>'''
    return molde_login(c)


def nova_senha():
    eye = f'<svg viewBox="0 0 24 24" aria-hidden="true" style="width: 22px; height: 22px; fill: none; stroke: {NOITE}; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round;"><path d="M 2 12 C 4.5 7 8 5 12 5 C 16 5 19.5 7 22 12 C 19.5 17 16 19 12 19 C 8 19 4.5 17 2 12 Z"></path><circle cx="12" cy="12" r="3"></circle></svg>'
    def senha(fid, label, ajuda=''):
        aj = f'<p id="{fid}-ajuda" style="margin: 0; font-size: 15px; color: {S.CINZA};">{ajuda}</p>' if ajuda else ''
        desc = f' aria-describedby="{fid}-ajuda"' if ajuda else ''
        return f'''<div class="fld"><label for="{fid}">{label}</label>
<div style="position: relative;"><input id="{fid}" type="password" autocomplete="new-password"{desc} style="padding-right: 60px;">
<button type="button" aria-label="Mostrar senha" aria-pressed="false" style="position: absolute; right: 4px; top: 4px; width: 44px; height: 44px; display: inline-flex; align-items: center; justify-content: center; background: transparent; border: 0; border-radius: 6px; cursor: pointer;">{eye}</button></div>
{aj}</div>'''
    c = titulo('Crie sua senha nova', 'Depois de salvar, é só entrar com o e-mail de sempre e a senha nova.')
    c += f'''<form style="display: flex; flex-direction: column; gap: 22px; margin: 0;">
{senha('nova', 'Senha nova', 'Pelo menos 8 caracteres.')}
{senha('repete', 'Repita a senha nova')}
<button class="btn" type="submit" style="{S.BTN_NOITE} width: 100%;">Salvar senha nova</button>
</form>'''
    return molde_login(c)


PAGES = {
    'Politica': ('Política de Privacidade', politica),
    'Recuperar-Senha': ('Criar uma senha nova', recuperar),
    'Recuperar-Senha-Enviado': ('Confira seu e-mail', recuperar_enviado),
    'Nova-Senha': ('Crie sua senha nova', nova_senha),
}

if __name__ == '__main__':
    hp = '/home/claude/ulgen/heights.json'
    H = json.load(open(hp))
    for key, (title, fn) in PAGES.items():
        body = fn()
        for suf, w in (('', 1440), ('-Celular', 390)):
            name = f'{key}{suf}.dc.html'
            with open(os.path.join(S.OUT, name), 'w') as fh:
                fh.write(S.page(title + (' (celular)' if suf else ''), body, w, H.get(key + suf, 900)))
    # links novos no login e no contato
    for key in ('Login', 'Contato'):
        title, fn = S.PAGES[key]
        body = fn().replace('href="#" style="display: inline-flex; align-items: center; min-height: 44px; font-size: 16px; font-weight: 600; text-underline-offset: 5px;">Esqueci minha senha',
                            f'href="{RECUPERAR}" style="display: inline-flex; align-items: center; min-height: 44px; font-size: 16px; font-weight: 600; text-underline-offset: 5px;">Esqueci minha senha')
        body = body.replace('<a href="#" style="font-weight: 600; text-underline-offset: 4px;">Política de Privacidade</a>',
                            f'<a href="{POLITICA}" style="font-weight: 600; text-underline-offset: 4px;">Política de Privacidade</a>')
        for suf, w in (('', 1440), ('-Celular', 390)):
            with open(os.path.join(S.OUT, f'{key}{suf}.dc.html'), 'w') as fh:
                fh.write(S.page(title + (' (celular)' if suf else ''), body, w, H[key + suf]))
    print('ok')
