import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'

// Só o alfabeto latino: cobre o português inteiro (ç, ã, é…).
import '@fontsource/fira-sans/latin-400.css'
import '@fontsource/fira-sans/latin-500.css'
import '@fontsource/fira-sans/latin-600.css'
import '@fontsource/fira-sans/latin-800.css'
import '@fontsource/fira-sans/latin-900.css'
import './styles/tokens.css'
import './styles/base.css'

import { rotas } from './rotas.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={rotas} />
  </StrictMode>,
)
