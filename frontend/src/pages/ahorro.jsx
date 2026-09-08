import EncabezadoPagina from '../sections/EncabezadoPagina.jsx'
import Seccion from '../sections/Seccion.jsx'
import Banda from '../sections/Banda.jsx'
import BotonCta from '../sections/BotonCta.jsx'
import FilaFoto from '../sections/FilaFoto.jsx'
import Franja from '../components/ui/Franja.jsx'
import { ahorro } from '../data/ahorro.js'
import permanenteFoto from '../assets/images/banner/ahorro-Permanente-seccion.jpg'
import voluntarioFoto from '../assets/images/banner/Ahorro-voluntario-seccion.jpg'

// ahorro — página de ahorro. Banner interior + dos filas con fotografía
// (Permanente y Voluntario) + franja de retiro parcial + banda de cierre.
// La estructura sigue a producción, medida el 2026-09-08: antes eran dos
// tarjetas lado a lado. El contenido viene de ahorro.js (P2) y los CTA
// internos usan los slugs derivados (preguntas-frecuentes,
// credito-de-libre-inversion). data-od-id: seccion-ahorro,
// ahorro-voluntario, banda-cierre.

// El rótulo de cada fila es la etiqueta del registro ("Obligatorio" /
// "Opcional"), igual que producción.
const [PERMANENTE, VOLUNTARIO] = ahorro.opciones.map((opcion, i) => ({
  rotulo: opcion.etiqueta,
  titulo: opcion.titulo,
  texto: opcion.texto,
  lista: opcion.lista,
  imagen: i === 0 ? permanenteFoto : voluntarioFoto,
  alt:
    i === 0
      ? 'Alcancía y monedas que representan el ahorro permanente del fondo.'
      : 'Asociada de Fondefos consultando su ahorro voluntario.',
}))

export default function AhorroPage() {
  return (
    <>
      <EncabezadoPagina
        rutas={[
          { texto: 'Inicio', slug: '/' },
          { texto: 'Ahorro' },
        ]}
        titulo="Ahorro"
        entrada={ahorro.entrada}
        banner="ahorro"
      />

      {/* Permanente: foto a la derecha sobre blanco. Voluntario: foto a la
          izquierda sobre surface-bright. Es la estructura de producción,
          medida el 2026-09-08; antes eran dos tarjetas lado a lado. */}
      <Seccion data-od-id="seccion-ahorro">
        <FilaFoto datos={PERMANENTE} />
      </Seccion>

      <Seccion tono="bright" data-od-id="ahorro-voluntario">
        <FilaFoto datos={VOLUNTARIO} fotoIzquierda />
      </Seccion>

      <Seccion>
        <div className="shell">
          {/* Franja (P3, congelada) no propaga atributos extra (sin ...rest):
              el data-od-id="franja-retiro-parcial" del clon no se renderiza
              para no envolver la franja en un div extra. Desviación
              documentada (solo atributo marcador, sin comportamiento). */}
          <Franja icono="ahorro" titulo={ahorro.franja.titulo}>
            <BotonCta to={ahorro.franja.accion.slug} variant="fantasma">
              {ahorro.franja.accion.etiqueta}
            </BotonCta>
          </Franja>
        </div>
      </Seccion>

      <Banda
        primario
        data-od-id="banda-cierre"
        titulo={ahorro.cierre.titulo}
        texto={ahorro.cierre.texto}
        accion={{ etiqueta: ahorro.cierre.accion.etiqueta, to: ahorro.cierre.accion.slug }}
      />
    </>
  )
}
