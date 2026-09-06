import Seccion from '../sections/Seccion.jsx'
import BotonCta from '../sections/BotonCta.jsx'

// NotFound — fallback 404 del router (P7, ruta "*"). El clon no tiene página
// 404: es un composite inventado mínimo y sin contenido nuevo, con la
// gramática de secciones/primitivas de la Fase 2 (sin estilo inline, sin
// literales de datos, sin data-od-id — no hay contraparte del clon).

export default function NotFoundPage() {
  return (
    <Seccion>
      <div className="shell">
        <h1>Página no encontrada</h1>
        <p>La página que buscás no existe o cambió de dirección.</p>
        <BotonCta to="/" className="mt-4">
          Volver al inicio
        </BotonCta>
      </div>
    </Seccion>
  )
}
