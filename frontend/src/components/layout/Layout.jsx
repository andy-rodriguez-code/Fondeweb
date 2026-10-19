import { Outlet, ScrollRestoration } from 'react-router-dom'
import SkipLink from './SkipLink.jsx'
import UtilityBar from './UtilityBar.jsx'
import Header from './Header.jsx'
import Footer from './Footer.jsx'
import BotonWhatsapp from './BotonWhatsapp.jsx'
import Icono from '../ui/Icono.jsx'
import VolverArriba from './VolverArriba.jsx'
import PopupNinos from './PopupNinos.jsx'
import useVisor from '../../hooks/useVisor.js'
import useMetadatos from '../../hooks/useMetadatos.js'

// Layout — the clone's body shell order: saltar > utilidad > cabecera >
// main#contenido > pie > visor (index.html lines 375-380). main keeps
// id="contenido" (skip-link target) and the clone's
// data-od-id="contenido-principal". <Outlet/> renders the routed page
// (P6/P7). ScrollRestoration (data router) restores scroll on navigation:
// push = top, pop = restore — clone parity without manual listeners
// (design.md "Scroll/hash" decision). useVisor (P8) drives the Notifondo
// dialog: data-abierto="si"/"no", image src/alt, close button + backdrop,
// Escape, focus trap and focus restore (the clone's site.js visor section).
// The dialog mounts inert on every page (design data flow places Visor in
// Layout); only the portada has [data-visor-src] triggers — observably
// identical to the clone, where the visor markup only exists on index.html.
export default function Layout() {
  const {
    abierto,
    src,
    alt,
    enlace,
    enlaceEtiqueta,
    indice,
    total,
    visorRef,
    cerrar,
    anterior,
    siguiente,
    gestos,
  } = useVisor()
  // Con más de una publicación el visor es navegable: flechas, contador
  // "N de M" y gestos. Si la publicación trae enlace, un botón lo abre.
  const navegable = total > 1
  // Título y descripción por página: acá y no en cada una, porque el Layout es
  // el único punto por el que pasan todas las rutas.
  useMetadatos()
  return (
    <>
      <SkipLink />
      <UtilityBar />
      <Header />
      <main id="contenido" data-od-id="contenido-principal">
        <Outlet />
      </main>
      <Footer />
      <div
        className="visor"
        data-od-id="visor"
        data-abierto={abierto ? 'si' : 'no'}
        data-navegable={navegable ? 'si' : 'no'}
        role="dialog"
        aria-modal="true"
        aria-label="Notifondo ampliado"
        ref={visorRef}
        {...gestos}
        onClick={(e) => {
          if (e.target === e.currentTarget) cerrar()
        }}
      >
        <button
          type="button"
          className="visor__cerrar"
          data-cerrar-visor
          aria-label="Cerrar la vista ampliada"
          onClick={cerrar}
        >
          ✕
        </button>
        <img src={src || undefined} alt={alt} />
        {enlace ? (
          <span className="visor__enlace">
            <a
              href={enlace}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${enlaceEtiqueta || 'Abrir el enlace'} (abre en una pestaña nueva)`}
            >
              <Icono nombre="enlace" size={30} />
            </a>
          </span>
        ) : null}
        {navegable ? (
          <>
            <button
              type="button"
              className="visor__paso visor__paso--anterior"
              aria-label="Página anterior"
              onClick={anterior}
            >
              <Icono nombre="chevron-izquierda" size={24} />
            </button>
            <button
              type="button"
              className="visor__paso visor__paso--siguiente"
              aria-label="Página siguiente"
              onClick={siguiente}
            >
              <Icono nombre="chevron-derecha" size={24} />
            </button>
            <p className="visor__cuenta" aria-live="polite">
              {indice + 1} de {total}
            </p>
          </>
        ) : null}
      </div>
      <BotonWhatsapp />
      <VolverArriba />
      <PopupNinos />
      <ScrollRestoration />
    </>
  )
}
