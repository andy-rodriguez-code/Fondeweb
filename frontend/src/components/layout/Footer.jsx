import { Link } from 'react-router-dom'
import Icono from '../ui/Icono.jsx'
import { marca, pie } from '../../data/navegacion.js'
import logotipo from '../../assets/images/fondefos.com.co/cropped-fondefos_logo-300x116-2546eaee42.webp'

// Footer — clone .pie (data-od-id="pie"), byte-identical across all 18 pages
// (verified: diff of the footer block between index.html and ahorro.html is
// empty). Literals come from navegacion.js (P2, verbatim). Internal links
// render as router Links with their derived slugs (discover="none" keeps the
// clone's markup free of react-router's data-discover attribute); tel/mailto/
// social are literal external anchors. The clone's two inline styles are
// converted per §4.3: style="margin-top:12px" → mt-3, style="max-width:70ch"
// → max-w-[70ch].
// Styled by paridad.css group 7; the DOM keeps the clone classes.

const ICONOS_REDES = ['facebook', 'instagram']

export default function Footer() {
  return (
    <footer className="pie" data-od-id="pie">
      <div className="shell">
        <div className="pie__rejilla">
          <div>
            <img className="pie__logo" src={logotipo} width="300" height="116" alt={marca.alt} />
            <p>{pie.direccion}</p>
            <p className="mt-3">{pie.horario}</p>
          </div>
          {pie.columnas.map((columna) => (
            <div key={columna.titulo}>
              <h4>{columna.titulo}</h4>
              <ul>
                {columna.enlaces.map((enlace) => (
                  <li key={enlace.etiqueta}>
                    {enlace.slug ? (
                      <Link to={enlace.slug} discover="none">
                        {enlace.etiqueta}
                      </Link>
                    ) : (
                      <a href={enlace.href}>{enlace.etiqueta}</a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="max-w-[70ch]">{pie.proteccion}</p>
        <div className="pie__legal">
          <span>{pie.legal}</span>
          <div className="redes">
            {pie.redes.map((red, i) => (
              <a
                key={red.etiqueta}
                href={red.href}
                target="_blank"
                rel="noopener"
                aria-label={red.etiqueta}
              >
                <Icono nombre={ICONOS_REDES[i]} size={18} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
