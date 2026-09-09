import { createBrowserRouter } from 'react-router-dom'
import Layout from './components/layout/Layout.jsx'
import PortadaPage from './pages/portada.jsx'
import AhorroPage from './pages/ahorro.jsx'
import Crediaportes10 from './pages/crediaportes-10.jsx'
import CreditoDeConfianza from './pages/credito-de-confianza.jsx'
import CreditoDeConsumoPorBonos from './pages/credito-de-consumo-por-bonos.jsx'
import CreditoDeImpuestos from './pages/credito-de-impuestos.jsx'
import CreditoDeLibreInversion from './pages/credito-de-libre-inversion.jsx'
import CreditoDeRecreacionYTurismo from './pages/credito-de-recreacion-y-turismo.jsx'
import CreditoEducativo from './pages/credito-educativo.jsx'
import CreditosDeTesoreria from './pages/creditos-de-tesoreria.jsx'
import TarjetaExpress from './pages/tarjeta-express.jsx'
import NosotrosPage from './pages/nosotros.jsx'
import ComoSerAsociadoPage from './pages/como-ser-asociado.jsx'
import ConveniosPage from './pages/convenios.jsx'
import BeneficiosPage from './pages/beneficios.jsx'
import EstadoDeCuentaPage from './pages/estado-de-cuenta.jsx'
import PreguntasFrecuentesPage from './pages/preguntas-frecuentes.jsx'
import ContactenosPage from './pages/contactenos.jsx'
import PoliticaDeDatosPage from './pages/politica-de-datos.jsx'
import NotFoundPage from './pages/NotFound.jsx'

// router — cableado createBrowserRouter (react-router-dom 7.18.3, decisión de
// diseño "Router"): Layout raíz con <Outlet/> (P4, que ya monta
// ScrollRestoration — push arriba, pop restaura) y las 18 rutas del clon sin
// sufijo .html (slugs derivados de navegacion.js, P2 — fuente única).
//
// Alias heredados del sitio real (/credito-de-impuestos-2, /como-ser_asociado,
// ver RECON/content/pages.json): entradas duplicadas, no redirects — la
// decisión de diseño "Legacy aliases" conserva el comportamiento del clon,
// que sirve ambas URLs directo y no reescribe la barra de direcciones. El
// comodín '*' monta el fallback mínimo NotFound (spec frontend-routing
// "Minimal NotFound fallback", sin contenido inventado).
//
// Los hash de ancla (#lineas-de-credito) y de convenios (#santur) llegan
// intactos al navegador con el routing por fragmento del data router; el hook
// P8 los consume (drawer/scroll). El estado activo del nav lo resuelve el
// Header (P4) vía NavLink aria-current; una URL alias no marca activo el
// enlace canónico (desviación aceptada y documentada en P4).

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <PortadaPage /> },
      { path: 'ahorro', element: <AhorroPage /> },
      { path: 'crediaportes-10', element: <Crediaportes10 /> },
      { path: 'credito-de-confianza', element: <CreditoDeConfianza /> },
      { path: 'credito-de-consumo-por-bonos', element: <CreditoDeConsumoPorBonos /> },
      { path: 'credito-de-libre-inversion', element: <CreditoDeLibreInversion /> },
      { path: 'credito-de-impuestos', element: <CreditoDeImpuestos /> },
      { path: 'credito-de-recreacion-y-turismo', element: <CreditoDeRecreacionYTurismo /> },
      { path: 'credito-educativo', element: <CreditoEducativo /> },
      { path: 'creditos-de-tesoreria', element: <CreditosDeTesoreria /> },
      { path: 'tarjeta-express', element: <TarjetaExpress /> },
      { path: 'nosotros', element: <NosotrosPage /> },
      { path: 'como-ser-asociado', element: <ComoSerAsociadoPage /> },
      { path: 'convenios', element: <ConveniosPage /> },
      { path: 'beneficios', element: <BeneficiosPage /> },
      { path: 'estado-de-cuenta', element: <EstadoDeCuentaPage /> },
      { path: 'preguntas-frecuentes', element: <PreguntasFrecuentesPage /> },
      { path: 'contactenos', element: <ContactenosPage /> },
      { path: 'politica-de-datos', element: <PoliticaDeDatosPage /> },
      // Alias heredados — entradas duplicadas, misma página canónica.
      { path: 'credito-de-impuestos-2', element: <CreditoDeImpuestos /> },
      { path: 'como-ser_asociado', element: <ComoSerAsociadoPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])

export default router
