import Portada from '../sections/Portada.jsx'
import Banda from '../sections/Banda.jsx'
import Seccion from '../sections/Seccion.jsx'
import Split from '../sections/Split.jsx'
import NotifondoGrid from '../sections/NotifondoGrid.jsx'
import LineasGrid from '../sections/LineasGrid.jsx'
import Rotulo from '../components/ui/Rotulo.jsx'
import TituloDual from '../components/ui/TituloDual.jsx'
import Acceso from '../components/ui/Acceso.jsx'
import Cifra from '../components/ui/Cifra.jsx'
import DatoContacto from '../components/ui/DatoContacto.jsx'
import Button from '../components/ui/Button.jsx'
import { creditos } from '../data/creditos.js'
import { contacto, ubicacionInicio } from '../data/navegacion.js'

// portada — página de inicio (clon index.html). Compone Portada + banda de
// registro + Notifondo + accesos rápidos en tinta + líneas de crédito +
// ubicación. Los literales exclusivos del inicio viven aquí (sin módulo P2
// propio): la especificación exige módulos de datos solo para líneas/faq/
// ahorro/convenios/notifondo/navegación; el resto se consume de navegacion.js
// (bloque contacto) y creditos.js (tarjetas de línea).
// data-od-id del clon: portada, banda-registro, seccion-notifondo,
// seccion-accesos (acceso-*), seccion-lineas (linea-*), seccion-ubicacion.

const PORTADA = {
  rotulo: 'Fondo de empleados · Floridablanca',
  titulo: (
    <>
      Tu Fondo de <br />Servicios
    </>
  ),
  bajada: 'Conoce nuestra variedad de créditos, convenios y servicios que tenemos para ofrecerte.',
  // Variantes para superficie oscura: el héroe pasó a llevar la fotografía real
  // de producción, y las de fondo claro ('' y 'secundario') quedaban con
  // contraste insuficiente sobre ella. Es el mismo par que usa producción:
  // botón blanco sólido y botón de contorno blanco.
  // `clase` achica el par en pantallas angostas para que quepan en un renglón:
  // con el relleno y el cuerpo de texto por defecto suman 404px y el ancho útil
  // a 390px es 350px. Va como utilidad en el botón y no en paridad.css porque
  // las utilidades de Tailwind viven en una capa posterior y ganan siempre.
  acciones: [
    {
      etiqueta: 'Conoce el fondo',
      to: '/nosotros',
      variante: 'claro',
      odId: 'cta-portada',
      clase: 'max-[480px]:px-3 max-[480px]:text-[0.78rem] max-[480px]:whitespace-nowrap',
    },
    {
      etiqueta: 'Ver líneas de crédito',
      href: '#lineas-de-credito',
      variante: 'fantasma',
      clase: 'max-[480px]:px-3 max-[480px]:text-[0.78rem] max-[480px]:whitespace-nowrap',
    },
  ],
}

const BANDA_REGISTRO = {
  titulo: 'Regístrate ahora y recibe todos los beneficios como asociado.',
  texto: 'Sin costo de afiliación. Solo necesitas tu último desprendible de nómina, la fotocopia de la cédula y la certificación laboral.',
  accion: { etiqueta: 'Registrarme aquí', to: '/como-ser-asociado', variante: 'claro', odId: 'cta-registro' },
}

const ACCESOS = [
  { icono: 'tag', titulo: 'Convenios', texto: 'Con múltiples marcas de la región', href: '/convenios', odId: 'acceso-convenios' },
  { icono: 'alianza', titulo: 'Cómo ser asociado', texto: 'Descarga el formato y afíliate', href: '/como-ser-asociado', odId: 'acceso-como-ser-asociado' },
  { icono: 'ahorro', titulo: 'Ahorro', texto: 'Programado y de fácil acceso', href: '/ahorro', odId: 'acceso-ahorro' },
  { icono: 'regalo', titulo: 'Beneficios', texto: 'En servicios a nuestros asociados', href: '/beneficios', odId: 'acceso-beneficios' },
]

const CIFRAS_INICIO = [
  { valor: '1.200+', etiqueta: 'Ya somos asociados' },
  { valor: '65+', etiqueta: 'Y tenemos convenios' },
  { valor: '0,8%', etiqueta: 'Desde, en tasa mensual' },
]

const ENCABEZADO_LINEAS = {
  rotulo: 'Servicios',
  titulo: (
    <>
      Nueve líneas de crédito y <strong>dos formas de ahorro</strong>
    </>
  ),
  texto: 'Cada línea tiene su propia tasa, plazo y requisitos. Estos son los valores vigentes publicados por el fondo.',
}

// Orden visual de la rejilla "Nueve líneas". Manda producción, verificada el
// 2026-09-08: recreación y turismo va antes que impuestos, y coincide con la
// numeración de los iconos (5_recreacion_turismo, 6_impuestos). El array de
// creditos.js (P2, solo lectura) trae otro orden.
const ORDEN_LINEAS = [
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
const LINEAS_INICIO = ORDEN_LINEAS.map((slug) => creditos.find((credito) => credito.slug === slug))

export default function PortadaPage() {
  return (
    <>
      <Portada
        rotulo={PORTADA.rotulo}
        titulo={PORTADA.titulo}
        bajada={PORTADA.bajada}
        acciones={PORTADA.acciones}
      />

      <Banda
        data-od-id="banda-registro"
        titulo={BANDA_REGISTRO.titulo}
        texto={BANDA_REGISTRO.texto}
        accion={BANDA_REGISTRO.accion}
      />

      <Seccion id="notifondo" data-od-id="seccion-notifondo">
        <NotifondoGrid />
      </Seccion>

      <Seccion tono="tinta" data-od-id="seccion-accesos">
        <div className="shell">
          <div className="max-w-[58ch] mb-[34px] max-md:mx-auto max-md:text-center">
            <Rotulo tono="blanco">Accesos rápidos</Rotulo>
            <TituloDual tono="naranja">
              Todo lo que el fondo <strong>tiene para ti</strong>
            </TituloDual>
          </div>
          <div className="rejilla rejilla--4">
            {ACCESOS.map((acceso) => (
              <Acceso
                href={acceso.href}
                icono={acceso.icono}
                titulo={acceso.titulo}
                tono="naranja"
                data-od-id={acceso.odId}
                key={acceso.odId}
              >
                {acceso.texto}
              </Acceso>
            ))}
          </div>
          <div className="cifras mt-[clamp(44px,5vw,72px)]">
            {CIFRAS_INICIO.map((cifra) => (
              <Cifra valor={cifra.valor} etiqueta={cifra.etiqueta} key={cifra.etiqueta} />
            ))}
          </div>
        </div>
      </Seccion>

      <Seccion tono="bright" id="lineas-de-credito" data-od-id="seccion-lineas">
        <LineasGrid lineas={LINEAS_INICIO} encabezado={ENCABEZADO_LINEAS} />
      </Seccion>

      <Seccion data-od-id="seccion-ubicacion">
        <Split>
          <div>
            {/* Centrado solo en teléfono; en escritorio queda a la izquierda.
                La lista de datos conserva su alineación en ambos casos, por eso
                el text-center vive solo acá. El botón usa min-w y no px-*: el
                relleno chocaría con el px-[26px] de la primitiva, y ese
                conflicto lo resuelve el orden de la hoja, no el atributo. */}
            <div className="max-md:text-center">
              <Rotulo>Aquí nos encontrarás.</Rotulo>
              <TituloDual>
                ¿Dónde estamos <strong>ubicados</strong>?
              </TituloDual>
              <p className="max-md:mx-auto">
                Atendemos de manera presencial en la sede de Floridablanca, Santander.
              </p>
            </div>
            <div className="mt-6 mb-7" data-od-id="datos-ubicacion">
              {ubicacionInicio.items.map((item) => (
                <DatoContacto
                  icono={item.icono}
                  titulo={item.titulo}
                  tituloEnMayuscula
                  key={item.titulo}
                >
                  {item.texto}
                </DatoContacto>
              ))}
            </div>
            <div className="max-md:text-center">
              <Button
                href={contacto.comoLlegar.href}
                variant="secundario"
                target="_blank"
                rel="noopener"
                className="max-md:min-w-[260px]"
              >
                Cómo llegar
              </Button>
            </div>
          </div>
          <div className="split__media" data-od-id="mapa-sede">
            <iframe
              className="w-full aspect-[4/3] rounded-md border border-border"
              src={ubicacionInicio.mapa.src}
              title={ubicacionInicio.mapa.titulo}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </Split>
      </Seccion>
    </>
  )
}
