import EncabezadoPagina from '../sections/EncabezadoPagina.jsx'
import Seccion from '../sections/Seccion.jsx'
import Banda from '../sections/Banda.jsx'
import FilasAccordion from '../sections/FilasAccordion.jsx'
import { faq } from '../data/faq.js'

// preguntas-frecuentes — página de FAQ (clon preguntas-frecuentes.html).
// Banner interior + acordeón (.filas, data-acordeon) + banda de cierre
// primaria. Todo el contenido verbatim viene de faq.js (P2). El shell del
// acordeón reproduce el max-width del clon:
// max-width:min(100% - (var(--gutter) * 2), 900px).
// data-od-id del clon: seccion-faq (faq), banda-cierre.

export default function PreguntasFrecuentesPage() {
  return (
    <>
      <EncabezadoPagina
        rutas={[
          { texto: 'Inicio', slug: '/' },
          { texto: 'Preguntas frecuentes' },
        ]}
        titulo="Preguntas frecuentes"
        entrada={faq.entrada}
        banner="preguntas-frecuentes"
      />

      <Seccion data-od-id="seccion-faq">
        <div className="shell max-w-[min(calc(100%-(var(--gutter)*2)),900px)]">
          <FilasAccordion id="faq" items={faq.items} data-od-id="faq" />
        </div>
      </Seccion>

      <Banda
        primario
        data-od-id="banda-cierre"
        titulo={faq.cierre.titulo}
        texto={faq.cierre.texto}
        accion={{ etiqueta: faq.cierre.accion.etiqueta, to: faq.cierre.accion.slug }}
      />
    </>
  )
}
