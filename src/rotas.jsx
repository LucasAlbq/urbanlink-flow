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
import { Plataforma } from './pages/Plataforma.jsx'
import { NaoEncontrada } from './pages/NaoEncontrada.jsx'

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
      { path: '/nova-senha/:token', element: <NovaSenha /> },
      { path: '/app/*', element: <Plataforma /> },
      { path: '*', element: <NaoEncontrada /> },
    ],
  },
])
