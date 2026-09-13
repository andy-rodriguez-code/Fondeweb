import EncabezadoPagina from '../sections/EncabezadoPagina.jsx'
import Seccion from '../sections/Seccion.jsx'
import Icono from '../components/ui/Icono.jsx'
import Tarjeta from '../components/ui/Tarjeta.jsx'
import useIndiceActivo from '../hooks/useIndiceActivo.js'
import { politica } from '../data/politica.js'

// politica-de-datos — documento legal largo (20 secciones). El sitio anterior
// lo publica como un muro de texto corrido; acá se compone con índice lateral
// que sigue la lectura, secciones numeradas y los datos del responsable en
// tarjeta, para que se pueda encontrar algo puntual sin leerlo entero.
//
// El contenido vive en data/politica.js como bloques tipados (párrafo, lista,
// lista numerada, definiciones): la página los compone, no interpreta markdown.

// Tarjeta con los datos del responsable. Aparece dos veces — en "Responsable
// del tratamiento" y en "Contacto" — porque el documento los repite ahí.
function DatosResponsable() {
  const r = politica.responsable
  const filas = [
    { icono: 'documento', etiqueta: 'NIT', valor: r.nit },
    { icono: 'pin', etiqueta: 'Dirección', valor: r.direccion },
    { icono: 'telefono', etiqueta: 'Teléfono', valor: r.telefono.etiqueta, href: r.telefono.href },
    { icono: 'correo', etiqueta: 'Correo', valor: r.correo.etiqueta, href: r.correo.href },
  ]
  return (
    <Tarjeta relleno="contacto" className="my-6">
      <p className="m-0 mb-4 font-display font-bold text-ink">{r.nombre}</p>
      <dl className="grid gap-3 m-0">
        {filas.map((fila) => (
          <div className="flex items-start gap-3" key={fila.etiqueta}>
            <span className="flex-none grid place-items-center w-9 h-9 rounded-sm bg-surface-low text-primary">
              <Icono nombre={fila.icono} size={17} />
            </span>
            <div>
              <dt className="text-[0.72rem] tracking-[0.1em] uppercase text-muted">
                {fila.etiqueta}
              </dt>
              <dd className="m-0 text-[0.95rem]">
                {fila.href ? <a href={fila.href}>{fila.valor}</a> : fila.valor}
              </dd>
            </div>
          </div>
        ))}
      </dl>
    </Tarjeta>
  )
}

function Bloque({ bloque }) {
  if (bloque.p) return <p>{bloque.p}</p>
  if (bloque.lista) {
    return (
      <ul className="prosa pl-5 [&_li]:mb-2">
        {bloque.lista.map((item) => (
          <li key={item.slice(0, 30)}>{item}</li>
        ))}
      </ul>
    )
  }
  if (bloque.pasos) {
    return (
      <ol className="politica__pasos">
        {bloque.pasos.map((item) => (
          <li key={item.slice(0, 30)}>{item}</li>
        ))}
      </ol>
    )
  }
  if (bloque.definiciones) {
    return (
      <dl className="politica__principios">
        {bloque.definiciones.map((d) => (
          <div key={d.termino}>
            <dt>{d.termino}</dt>
            <dd>{d.def}</dd>
          </div>
        ))}
      </dl>
    )
  }
  return null
}

export default function PoliticaDeDatosPage() {
  const ids = politica.secciones.map((s) => s.id)
  const activo = useIndiceActivo(ids)

  return (
    <>
      <EncabezadoPagina
        rutas={[
          { texto: 'Inicio', slug: '/' },
          { texto: 'Política de datos' },
        ]}
        titulo={politica.titulo}
        entrada={politica.resumen}
        banner="politica-de-datos"
      />

      <Seccion data-od-id="seccion-politica">
        <div className="shell politica">
          {/* Índice: se queda a la vista mientras se lee y marca la sección
              actual. En teléfono pasa arriba y deja de ser pegajoso. */}
          <nav className="politica__indice" aria-label="Secciones de la política">
            <p className="politica__indice-titulo">Contenido</p>
            <ol>
              {politica.secciones.map((seccion, i) => (
                <li key={seccion.id}>
                  <a
                    href={`#${seccion.id}`}
                    aria-current={activo === seccion.id ? 'true' : undefined}
                  >
                    <span className="politica__indice-num">{String(i + 1).padStart(2, '0')}</span>
                    {seccion.titulo}
                  </a>
                </li>
              ))}
            </ol>
            <p className="politica__actualizacion">
              Actualizada el {politica.actualizacion}
            </p>
          </nav>

          <div className="politica__cuerpo">
            {politica.secciones.map((seccion, i) => (
              <section
                className={`politica__seccion${seccion.destacada ? ' politica__seccion--destacada' : ''}`}
                id={seccion.id}
                key={seccion.id}
              >
                <h2>
                  <span className="politica__num">{String(i + 1).padStart(2, '0')}</span>
                  {seccion.titulo}
                </h2>
                {seccion.bloques.map((bloque, j) => (
                  <Bloque bloque={bloque} key={j} />
                ))}
                {seccion.destacaResponsable ? <DatosResponsable /> : null}
              </section>
            ))}

            <aside className="politica__cierre">
              <span className="politica__cierre-icono">
                <Icono nombre="honestidad" size={28} />
              </span>
              <h2 className="m-0 text-white">{politica.cierre.titulo}</h2>
              <p className="politica__cierre-destacado">{politica.cierre.destacado}</p>
              <p className="m-0">{politica.cierre.texto}</p>
            </aside>
          </div>
        </div>
      </Seccion>
    </>
  )
}
