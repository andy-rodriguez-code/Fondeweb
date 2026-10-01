import { Link } from 'react-router-dom'
import Icono from '../ui/Icono.jsx'
import { marca, pie } from '../../data/navegacion.js'
import logotipo from '../../assets/images/banner/Logo-Fondefos-blanco.png'
import supersolidaria from '../../assets/images/banner/supersolidaria.png'

// Footer — clone .pie (data-od-id="pie"), byte-identical across all 18 pages
// (verified: diff of the footer block between index.html and ahorro.html is
// empty). Literals come from navegacion.js (P2, verbatim). Internal links
// render as router Links with their derived slugs (discover="none" keeps the
// clone's markup free of react-router's data-discover attribute); tel/mailto/
// social are literal external anchors. The clone's two inline styles are
// converted per §4.3: style="margin-top:12px" → mt-3, style="max-width:70ch"
// → max-w-[70ch].
// Styled by paridad.css group 7; the DOM keeps the clone classes.
//
// Beyond the clone (client request, 2026-10-01): the legal row carries the
// supervising entity's logo and a third social network, and the notice and
// the legal row take their own classes (pie__aviso, pie__creditos) because
// their phone layout no longer fits in a couple of utilities.

export default function Footer() {
  return (
    <footer className="pie" data-od-id="pie">
      <div className="shell">
        <div className="pie__rejilla">
          <div>
            <img className="pie__logo" src={logotipo} width="295" height="61" alt={marca.alt} />
            <h4>{pie.tituloUbicacion}</h4>
            <p>{pie.direccion}</p>
            <h4 className="mt-5">{pie.tituloHorario}</h4>
            <p>{pie.horario}</p>
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
        {/* Sin max-width: el aviso de la Ley 1581 va en un solo renglón en
            escritorio. En teléfono se parte solo (forzarlo con nowrap metería
            scroll horizontal); cómo se ve ahí lo decide paridad.css. */}
        <p className="pie__aviso">
          {pie.proteccion}{' '}
          <Link to="/politica-de-datos" discover="none">
            {pie.politica}
          </Link>
        </p>
        <div className="pie__legal">
          <div className="pie__creditos">
            <span>{pie.legal}</span>
            <span className="pie__vigilancia">
              {pie.vigilancia.etiqueta}
              <a href={pie.vigilancia.href} target="_blank" rel="noopener">
                <img src={supersolidaria} width="103" height="45" alt={pie.vigilancia.nombre} />
              </a>
            </span>
          </div>
          <div className="redes">
            {pie.redes.map((red) => (
              <a
                key={red.etiqueta}
                href={red.href}
                target="_blank"
                rel="noopener"
                aria-label={red.etiqueta}
              >
                <Icono nombre={red.icono} size={18} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
