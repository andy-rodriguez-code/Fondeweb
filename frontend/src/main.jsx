import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import './styles/index.css'
import router from './router.jsx'

// main — punto de entrada del data router (P7): RouterProvider monta el árbol
// de router.jsx (Layout con <Outlet/> + 18 slugs + 2 alias + '*' → NotFound).
// App.jsx (demo de tokens de la Fase 1) se elimina: lo reemplaza el router.

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
