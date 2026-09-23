import EncabezadoPagina from '../sections/EncabezadoPagina.jsx'
import Seccion from '../sections/Seccion.jsx'
import Banda from '../sections/Banda.jsx'
import FilaFoto from '../sections/FilaFoto.jsx'
import Icono from '../components/ui/Icono.jsx'
import Cifra from '../components/ui/Cifra.jsx'
import visionFoto from '../assets/images/banner/vision-fondefos.webp'
import misionFoto from '../assets/images/banner/mision-fondefos.webp'
import objetivosFoto from '../assets/images/banner/principios-fondefos.webp'

// nosotros — página institucional. Banner con cifras + tres filas con
// fotografía (visión, misión y objetivos) + principios sobre tinta + banda de
// cierre. La estructura sigue a producción, medida el 2026-09-08, y ya no al
// clon estático de agosto. Los literales exclusivos de esta página no tienen
// módulo P2 propio (la especificación exige módulos solo para líneas/faq/
// ahorro/convenios/notifondo/navegación): viven aquí como constantes.
// data-od-id: seccion-vision-mision, seccion-mision, seccion-principios
// (principio-*), seccion-objetivos, banda-cierre.

const ENCABEZADO = {
  entrada: 'FONDEFOS es una empresa asociativa de derecho privado constituida para fomentar el ahorro y prestar servicios de crédito a sus asociados.',
  cifras: [
    { valor: '1.200+', etiqueta: 'Asociados', acento: 'primario' },
    { valor: '65+', etiqueta: 'Convenios', acento: 'interactivo' },
  ],
}

// Visión y misión — dos filas alternadas con fotografía, como en producción
// (medido el 2026-09-08): visión con la foto a la derecha sobre fondo blanco,
// misión con la foto a la izquierda sobre surface-bright. En ambas el
// destacado del título va en naranja y el párrafo justificado.
const VISION = {
  rotulo: 'Visión',
  titulo: (
    <>
      Solución inmediata <strong>a lo más apremiante</strong>
    </>
  ),
  texto: 'La visión de FONDEFOS es la de ser fuente para la solución inmediata de las necesidades más apremiantes y ordinarias de sus asociados, mediante la regulación del ahorro y el crédito en forma solidaria.',
  imagen: visionFoto,
  alt: 'Equipo de Fondefos celebrando con las manos juntas frente a un tablero de objetivos.',
}

const MISION = {
  rotulo: 'Misión',
  titulo: (
    <>
      Contribuir al <strong>desarrollo integral</strong> del asociado y su familia
    </>
  ),
  texto: 'La misión de FONDEFOS es contribuir al desarrollo integral de los asociados y su grupo familiar, y propender por un vínculo socioempresarial y un elevamiento de identidad laboral que les motive a fortalecer y crear mayor capital para su usufructo personal y la inversión en la familia.',
  imagen: misionFoto,
  alt: 'Asesor de Fondefos atendiendo a dos asociados en la sede.',
}

// Los principios van sobre tinta (#152238) con un icono por valor. Producción
// usa el azul primario, pero el cliente pidió el tono oscuro (2026-09-08). Sus
// PNG no vienen con los assets, así que se usan iconos del set propio
// dibujados para estos conceptos (Icono.jsx).
const PRINCIPIOS = [
  { icono: 'honestidad', titulo: 'Honestidad', odId: 'principio-honestidad' },
  { icono: 'democracia', titulo: 'Democracia', odId: 'principio-democracia' },
  { icono: 'solidaridad', titulo: 'Solidaridad', odId: 'principio-solidaridad' },
  { icono: 'equidad', titulo: 'Equidad', odId: 'principio-equidad' },
  { icono: 'transparencia', titulo: 'Transparencia', odId: 'principio-transparencia' },
]

// Objetivos usa la misma fila que visión, con la foto a la derecha sobre fondo
// blanco (medido en producción el 2026-09-08). Antes llevaba la portada del
// Notifondo en un marco desplazado.
const OBJETIVOS = {
  rotulo: 'Objetivos',
  titulo: (
    <>
      Ahorro, crédito y <strong>bienestar social</strong>
    </>
  ),
  texto: [
    'El Fondo de Empleados, como empresa asociativa y de derecho privado del orden legal, está constituido con el objeto de fomentar el ahorro y prestar los servicios de crédito en distintas formas a los asociados, y proporcionar otros servicios en forma permanente.',
    'Además, busca dar oportuno apoyo de previsión, solidaridad y bienestar social, fortaleciendo los lazos de compañerismo y ayuda mutua entre sus asociados.',
  ],
  imagen: objetivosFoto,
  alt: 'Equipo de Fondefos reunido en la sede del fondo.',
}

const BANDA_CIERRE = {
  titulo: '¿Quieres hacer parte del fondo?',
  texto: 'La afiliación no tiene costo y el trámite se hace con tres documentos.',
  accion: { etiqueta: 'Ver cómo afiliarme', to: '/como-ser-asociado' },
}

export default function NosotrosPage() {
  return (
    <>
      <EncabezadoPagina
        rutas={[
          { texto: 'Inicio', slug: '/' },
          { texto: 'Nosotros' },
        ]}
        titulo="Nosotros"
        entrada={ENCABEZADO.entrada}
        banner="nosotros"
        debajo
      >
        <div className="cifras">
          {ENCABEZADO.cifras.map((cifra) => (
            <Cifra valor={cifra.valor} etiqueta={cifra.etiqueta} acento={cifra.acento} key={cifra.etiqueta} />
          ))}
        </div>
      </EncabezadoPagina>

      <Seccion data-od-id="seccion-vision-mision">
        <FilaFoto datos={VISION} />
      </Seccion>

      <Seccion tono="bright" data-od-id="seccion-mision">
        <FilaFoto datos={MISION} fotoIzquierda />
      </Seccion>

      <Seccion tono="tinta" data-od-id="seccion-principios">
        <div className="shell">
          <div className="mb-10 text-center">
            <h2 className="text-white">Principios Fondefos</h2>
          </div>
          {/* Cinco columnas en una fila, como producción; en tablet bajan a
              tres y en teléfono a dos. */}
          <ul className="grid grid-cols-5 gap-6 max-lg:grid-cols-3 max-sm:grid-cols-2 list-none m-0 p-0">
            {PRINCIPIOS.map((principio) => (
              <li
                className="flex flex-col items-center gap-3 text-center"
                data-od-id={principio.odId}
                key={principio.odId}
              >
                <span className="grid place-items-center w-[62px] h-[62px] rounded-full bg-white/12 text-accent">
                  <Icono nombre={principio.icono} size={30} />
                </span>
                <h3 className="m-0 text-[1.0625rem] text-white">{principio.titulo}</h3>
              </li>
            ))}
          </ul>
        </div>
      </Seccion>

      <Seccion data-od-id="seccion-objetivos">
        <FilaFoto datos={OBJETIVOS} />
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
