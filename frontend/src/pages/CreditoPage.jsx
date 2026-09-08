import EncabezadoPagina from '../sections/EncabezadoPagina.jsx'
import Seccion from '../sections/Seccion.jsx'
import Credito from '../sections/Credito.jsx'
import LineasGrid from '../sections/LineasGrid.jsx'
import { creditos } from '../data/creditos.js'

// CreditoPage — plantilla interna compartida por las 9 páginas .credito del
// clon (crediaportes-10 … tarjeta-express). Cada página del clon comparte la
// misma composición: banner interior (miga Inicio > Servicios > línea, donde
// "Servicios" apunta a ahorro.html — verbatim del clon), sección .credito
// (resumen + bloques + requisitos) y sección bright "Otras líneas" con las 3
// tarjetas derivadas del campo `otras` del registro (P2).
// Estructura verificada contra las 9 páginas: mismos data-od-id
// (seccion-credito, resumen-credito, bloque-*, seccion-otras-lineas, otra-*),
// mismo encabezado "Compará antes de <strong>decidir</strong>" con
// max-width 52ch / margen 28px.
// Helper interno de páginas (patrón BotonCta de P5): el router (P7) importa
// cada página por su propio archivo.

export default function CreditoPage({ slug }) {
  const datos = creditos.find((credito) => credito.slug === slug)
  const otras = creditos.filter((credito) => datos.otras.includes(credito.slug))
  return (
    <>
      <EncabezadoPagina
        rutas={[
          { texto: 'Inicio', slug: '/' },
          { texto: 'Servicios', slug: '/ahorro' },
          { texto: datos.titulo },
        ]}
        titulo={datos.titulo}
        entrada={datos.entrada}
        banner={slug}
      />
      <Seccion data-od-id="seccion-credito">
        <Credito datos={datos} />
      </Seccion>
      <Seccion tono="bright" data-od-id="seccion-otras-lineas">
        <LineasGrid
          lineas={otras}
          encabezado={{
            rotulo: 'Otras líneas',
            titulo: (
              <>
                Compará antes de <strong>decidir</strong>
              </>
            ),
          }}
          maxAncho="52ch"
          margen="28px"
          prefijoId="otra"
        />
      </Seccion>
    </>
  )
}
