import EncabezadoPagina from '../sections/EncabezadoPagina.jsx'
import Seccion from '../sections/Seccion.jsx'
import Banda from '../sections/Banda.jsx'
import Convenios from '../sections/Convenios.jsx'
import Cifra from '../components/ui/Cifra.jsx'

// convenios — página de convenios (clon convenios.html). Banner con dos
// cifras (28 aliados / 14 categorías) + sección Convenios (P5: filtros,
// rejilla--4, vacío y cajón) + banda de cierre primaria. El listado de 28
// convenios viene de convenios.js (P2). data-od-id del clon:
// seccion-convenios (filtros-convenios, rejilla-convenios, convenios-vacio,
// cajon-convenio), banda-cierre.

const ENCABEZADO = {
  entrada: 'Descuentos y condiciones preferenciales con 28 aliados comerciales de Santander. Elegí una categoría y consultá los datos del asesor.',
  cifras: [
    { valor: '28', etiqueta: 'Aliados publicados', acento: '' },
    { valor: '14', etiqueta: 'Categorías', acento: 'interactivo' },
  ],
}

const BANDA_CIERRE = {
  titulo: 'Si estás interesado en realizar convenio con nosotros',
  texto: 'Escribinos desde el formulario de contacto con el asunto "Convenios".',
  accion: { etiqueta: 'Proponer un convenio', to: '/contactenos' },
}

export default function ConveniosPage() {
  return (
    <>
      <EncabezadoPagina
        rutas={[
          { texto: 'Inicio', slug: '/' },
          { texto: 'Convenios' },
        ]}
        titulo="Convenios"
        entrada={ENCABEZADO.entrada}
      >
        <div className="cifras">
          {ENCABEZADO.cifras.map((cifra) => (
            <Cifra valor={cifra.valor} etiqueta={cifra.etiqueta} acento={cifra.acento} key={cifra.etiqueta} />
          ))}
        </div>
      </EncabezadoPagina>

      <Seccion data-od-id="seccion-convenios">
        <Convenios />
      </Seccion>

      <Banda
        primario
        data-od-id="banda-cierre"
        titulo={BANDA_CIERRE.titulo}
        texto={BANDA_CIERRE.texto}
        accion={BANDA_CIERRE.accion}
      />
    </>
  )
}
