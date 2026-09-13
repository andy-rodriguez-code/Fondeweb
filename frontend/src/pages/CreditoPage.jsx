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
// La rejilla del pie muestra las nueve líneas, incluida la de la página
// abierta, como producción (medido el 2026-09-08); antes mostraba solo las
// tres del campo `otras` de cada registro, que queda sin consumidores.
// Helper interno de páginas (patrón BotonCta de P5): el router (P7) importa
// cada página por su propio archivo.

// Las nueve líneas, en el orden de la rejilla de la portada: recreación y
// turismo va antes que impuestos, igual que la numeración de sus iconos.
const ORDEN = [
  'crediaportes-10',
  'credito-de-confianza',
  'credito-de-consumo-por-bonos',
  'credito-de-libre-inversion',
  'credito-de-recreacion-y-turismo',
  'credito-de-impuestos',
  'credito-educativo',
  'creditos-de-tesoreria',
  'tarjeta-express',
]
const TODAS = ORDEN.map((s) => creditos.find((credito) => credito.slug === s))

export default function CreditoPage({ slug }) {
  const datos = creditos.find((credito) => credito.slug === slug)
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
          lineas={TODAS}
          encabezado={{
            rotulo: 'Nuestras líneas',
            titulo: (
              <>
                Compara antes de <strong>decidir</strong>
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
