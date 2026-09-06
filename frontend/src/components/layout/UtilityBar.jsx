import { Link } from 'react-router-dom'
import Icono from '../ui/Icono.jsx'
import { utilidad } from '../../data/navegacion.js'

// UtilityBar — clone .utilidad (data-od-id="barra-utilidad"), uniform across
// all 18 pages. Tel/mail are literal external hrefs (verbatim from the data
// module); "Consultar mi extracto" is an internal route, so it renders as a
// router Link with its derived slug. Icons: telefono/correo/usuario (clone
// utility bar shapes, width 18, stroke-width 1.8). Styled by paridad.css
// group 6; the DOM keeps the clone classes for parity.

const ICONOS_GRUPO_UNO = ['telefono', 'correo']

export default function UtilityBar() {
  return (
    <div className="utilidad" data-od-id="barra-utilidad">
      <div className="shell utilidad__fila">
        <div className="utilidad__grupo">
          {utilidad.slice(0, 2).map((enlace, i) => (
            <a key={enlace.href} href={enlace.href}>
              <Icono nombre={ICONOS_GRUPO_UNO[i]} size={18} />
              <span>{enlace.etiqueta}</span>
            </a>
          ))}
        </div>
        <div className="utilidad__grupo">
          <Link to={utilidad[2].slug} discover="none">
            <Icono nombre="usuario" size={18} />
            <span>{utilidad[2].etiqueta}</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
