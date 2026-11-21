import { createBrowserRouter } from 'react-router'

import { Layout } from './components/Layout.jsx'
import { Landing } from './pages/Landing.jsx'
import { Rastreamento } from './pages/Rastreamento.jsx'
import { Contato } from './pages/Contato.jsx'
import { Enviado } from './pages/Enviado.jsx'
import { Login } from './pages/Login.jsx'
import { Politica } from './pages/Politica.jsx'
import { RecuperarSenha } from './pages/RecuperarSenha.jsx'
import { NovaSenha } from './pages/NovaSenha.jsx'
import { NaoEncontrada } from './pages/NaoEncontrada.jsx'
import { Moldura } from './pages/app/Moldura.jsx'
import { Monitoramento } from './pages/app/Monitoramento.jsx'
import { Rotas } from './pages/app/Rotas.jsx'
import { Simulacao } from './pages/app/Simulacao.jsx'
import { Cadastros } from './pages/app/Cadastros.jsx'
import NaoEncontradaApp from './pages/app/NaoEncontradaApp.jsx'

// Tabela de rotas de docs/plano/01-plano.md.
export const rotas = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <Landing /> },
      { path: '/rastreamento', element: <Rastreamento /> },
      { path: '/rastreamento/:codigo', element: <Rastreamento /> },
      { path: '/contato', element: <Contato /> },
      { path: '/contato/enviado', element: <Enviado /> },
      { path: '/contato/enviado/:protocolo', element: <Enviado /> },
      { path: '/login', element: <Login />, handle: { soConteudo: true } },
      { path: '/privacidade', element: <Politica /> },
      { path: '/recuperar-senha', element: <RecuperarSenha />, handle: { soConteudo: true } },
      { path: '/nova-senha/:token', element: <NovaSenha />, handle: { soConteudo: true } },
      // Plataforma: sem o Header e o Rodape do site, com a moldura própria (barra e menu).
      {
        path: '/app',
        element: <Moldura />,
        handle: { soConteudo: true },
        children: [
          { index: true, element: <Monitoramento /> },
          { path: 'rotas', element: <Rotas /> },
          { path: 'simulacao', element: <Simulacao /> },
          { path: 'cadastros', element: <Cadastros /> },
          { path: 'cadastros/:aba', element: <Cadastros /> },
          { path: '*', element: <NaoEncontradaApp /> },
        ],
      },
      { path: '*', element: <NaoEncontrada /> },
    ],
  },
])
