import { useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import Icono from '../ui/Icono.jsx'
import useCabeceraFija from '../../hooks/useCabeceraFija.js'
import useMenuMovil from '../../hooks/useMenuMovil.js'
import useSubmenu from '../../hooks/useSubmenu.js'
import { marca, principal, servicios } from '../../data/navegacion.js'
import logotipo from '../../assets/images/banner/Logo-Fondefos-sin-fondo.png'

// Header — clone .cabecera (data-od-id="cabecera"): marca + hamburguesa +
// nav (8 plain links + "Servicios" trigger with 10-link panel).
// Read-only source: root *.html header block (uniform; the active link is the
// only per-page difference). Active route state mirrors the clone semantics:
// - each plain nav link and each panel link carries aria-current="page" when
//   its slug matches the current pathname (NavLink does this automatically);
// - the "Servicios" trigger carries aria-current="page" when the current
//   route is one of the servicios slugs (clone: ahorro.html line 39).
// data-fijo (useCabeceraFija), data-menu (useMenuMovil) y data-abierto
// (useSubmenu) se reflejan desde estado con los valores del clon
// ("si"/"no"/"abierto"/"cerrado") — el CSS contract (paridad.css group 6)
// selects on these same attributes.
// All internal Link/NavLink use discover="none": react-router v7 defaults to
// discover="render", which injects data-discover="true" — an attribute the
// clone does not have; suppressed for markup parity (inert in library mode).
// NavLink would also append its default "active" class; the className
// functions below return the clone's class verbatim (and undefined for the
// classless panel links) so the DOM stays byte-identical — active state is
// carried exclusively by aria-current, exactly like the clone.

const SLUGS_SERVICIOS = servicios.map((servicio) => servicio.slug)

export default function Header() {
  const { pathname } = useLocation()
  const enServicio = SLUGS_SERVICIOS.includes(pathname)
  const fijo = useCabeceraFija()
  const { abierto: menuAbierto, alternar: alternarMenu, cerrar: cerrarMenu } = useMenuMovil()
  const { abierto: submenuAbierto, alternar: alternarSubmenu, cerrar: cerrarSubmenu } = useSubmenu()

  // Al navegar se repliegan el panel móvil y el submenú. El clic en el enlace
  // ya los cierra; este efecto cubre los casos donde la ruta cambia sin pasar
  // por ellos: atrás/adelante del navegador o una redirección.
  useEffect(() => {
    cerrarMenu()
    cerrarSubmenu()
  }, [pathname, cerrarMenu, cerrarSubmenu])

  const alNavegar = () => {
    cerrarMenu()
    cerrarSubmenu()
  }
  return (
    <header
      className="cabecera"
      data-od-id="cabecera"
      data-menu={menuAbierto ? 'abierto' : 'cerrado'}
      data-fijo={fijo ? 'si' : 'no'}
    >
      <div className="shell cabecera__fila">
        <Link className="marca" to="/" data-od-id="marca" discover="none">
          <img src={logotipo} width="295" height="61" alt={marca.alt} />
        </Link>
        <button
          type="button"
          className="hamburguesa"
          aria-expanded={menuAbierto}
          aria-label="Abrir el menú de navegación"
          onClick={alternarMenu}
        >
          <Icono nombre="menu" size={18} />
          <span>Menú</span>
        </button>
        <nav className="nav" aria-label="Navegación principal" data-od-id="nav-principal">
          {principal.map((item) =>
            item.submenu ? (
              <div key={item.etiqueta} className="nav__grupo" data-abierto={submenuAbierto ? 'si' : 'no'}>
                <button
                  type="button"
                  className="nav__enlace nav__disparador"
                  aria-expanded={submenuAbierto}
                  aria-current={enServicio ? 'page' : undefined}
                  onClick={alternarSubmenu}
                >
                  Servicios <Icono nombre="chevron-abajo" size={13} />
                </button>
                <div className="nav__panel">
                  {servicios.map((servicio) => (
                    <NavLink
                      key={servicio.slug}
                      to={servicio.slug}
                      discover="none"
                      className={() => undefined}
                      onClick={alNavegar}
                    >
                      {servicio.etiqueta}
                    </NavLink>
                  ))}
                </div>
              </div>
            ) : (
              <NavLink
                key={item.etiqueta}
                className={() => 'nav__enlace'}
                to={item.slug}
                end={item.slug === '/'}
                discover="none"
                onClick={alNavegar}
              >
                {item.etiqueta}
              </NavLink>
            ),
          )}
        </nav>
      </div>
    </header>
  )
}
