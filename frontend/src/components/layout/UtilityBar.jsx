import Icono from '../ui/Icono.jsx'
import { utilidad } from '../../data/navegacion.js'

// UtilityBar — clone .utilidad (data-od-id="barra-utilidad"), uniform across
// all 18 pages. Tel/mail are literal external hrefs (verbatim from the data
// module). "Consultar mi extracto" pasó a apuntar al portal transaccional
// (fondefos.sflfintech.com), así que ya no es un Link de router sino un ancla
// externa con target y rel. Icons: telefono/correo/usuario (clone utility bar
// shapes, width 18, stroke-width 1.8). Styled by paridad.css group 6; el DOM
// conserva las clases del clon.
//
// En móvil el grupo de contacto se oculta y el extracto queda centrado
// (paridad.css grupo 6): son dos textos largos que a 390px ocupaban tres
// renglones de barra.

const ICONOS_GRUPO_UNO = ['telefono', 'correo']

export default function UtilityBar() {
  const extracto = utilidad[2]
  return (
    <div className="utilidad" data-od-id="barra-utilidad">
      <div className="shell utilidad__fila">
        <div className="utilidad__grupo utilidad__grupo--contacto">
          {utilidad.slice(0, 2).map((enlace, i) => (
            <a key={enlace.href} href={enlace.href}>
              <Icono nombre={ICONOS_GRUPO_UNO[i]} size={18} />
              <span>{enlace.etiqueta}</span>
            </a>
          ))}
        </div>
        <div className="utilidad__grupo utilidad__grupo--extracto">
          <a href={extracto.href} target="_blank" rel="noopener noreferrer">
            <Icono nombre="usuario" size={18} />
            <span>{extracto.etiqueta}</span>
          </a>
        </div>
      </div>
    </div>
  )
}
