import { Outlet, ScrollRestoration } from 'react-router-dom'
import SkipLink from './SkipLink.jsx'
import UtilityBar from './UtilityBar.jsx'
import Header from './Header.jsx'
import Footer from './Footer.jsx'

// Layout — the clone's body shell order: saltar > utilidad > cabecera >
// main#contenido > pie (design.md data flow; the Visor dialog joins in P8
// with useVisor). main keeps id="contenido" (skip-link target) and the
// clone's data-od-id="contenido-principal". <Outlet/> renders the routed
// page (P6/P7). ScrollRestoration (data router) restores scroll on
// navigation: push = top, pop = restore — clone parity without manual
// listeners (design.md "Scroll/hash" decision).
export default function Layout() {
  return (
    <>
      <SkipLink />
      <UtilityBar />
      <Header />
      <main id="contenido" data-od-id="contenido-principal">
        <Outlet />
      </main>
      <Footer />
      <ScrollRestoration />
    </>
  )
}
