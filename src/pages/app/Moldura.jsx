import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router'

import { buscarEu, sair } from '../../api/auth.js'
import { AREAS_PLATAFORMA } from '../../components/iconesPlataforma.jsx'
import { Logo } from '../../components/Logo.jsx'
import { Aviso, Carregando } from './pecas.jsx'
import { ROTULOS } from './uteis.js'
import css from './Moldura.module.css'

// Moldura da plataforma (/app), a mesma da ilustração da landing: barra Noite com a logo em
// cima, menu com as quatro áreas ao lado. Ao abrir, confere a sessão (GET /auth/me); sem
// sessão, vai pro /login?volta= e depois volta pra mesma tela (04-api-e-dados.md).
export function Moldura() {
  const [usuario, setUsuario] = useState(null)
  const [erro, setErro] = useState(null)
  const [saindo, setSaindo] = useState(false)
  const navegar = useNavigate()
  const { pathname } = useLocation()

  useEffect(() => {
    const controle = new AbortController()
    buscarEu({ sinal: controle.signal })
      .then(({ usuario: eu }) => setUsuario(eu))
      .catch((falha) => {
        if (controle.signal.aborted) return
        if (falha.erro === 'NAO_AUTENTICADO') {
          navegar(`/login?volta=${encodeURIComponent(pathname)}`, { replace: true })
          return
        }
        setErro(falha)
      })
    return () => controle.abort()
    // Só na primeira carga: trocar de tela dentro de /app não confere a sessão de novo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function aoSair() {
    setSaindo(true)
    try {
      await sair()
    } catch {
      // Sem conexão, o cookie continua; o login mostra a tela de entrar de qualquer jeito.
    }
    navegar('/login', { replace: true })
  }

  return (
    <div className={css.app}>
      <div className={css.barra}>
        <Link to="/" className={css.logo} aria-label="UrbanLink, ir para o site">
          <Logo className={css.logoSvg} />
        </Link>
        {usuario && (
          <div className={css.quem}>
            <p className={css.nome}>
              {usuario.nome}
              <span className={css.papel}>{ROTULOS.papel[usuario.papel] ?? usuario.papel}</span>
            </p>
            <button type="button" className={css.sair} onClick={aoSair} aria-disabled={saindo || undefined}>
              {saindo ? 'Saindo…' : 'Sair'}
            </button>
          </div>
        )}
      </div>

      <div className={css.corpo}>
        <nav className={css.menu} aria-label="Plataforma">
          <ul className={css.itens}>
            {AREAS_PLATAFORMA.map((area) => (
              <li key={area.caminho}>
                <NavLink to={area.caminho} end={area.caminho === '/app'} className={css.item}>
                  <svg viewBox="0 0 24 24" className={css.icone} aria-hidden="true" focusable="false">
                    {area.icone}
                  </svg>
                  <span>{area.nome}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className={css.principal}>
          {usuario ? (
            <Outlet context={{ usuario }} />
          ) : erro ? (
            <div className={css.erroSessao}>
              <h1 tabIndex={-1}>Não deu pra abrir a plataforma</h1>
              <Aviso erro={erro} />
            </div>
          ) : (
            <Carregando texto="Conferindo a sessão" />
          )}
        </div>
      </div>
    </div>
  )
}
