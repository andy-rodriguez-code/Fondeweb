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
import Tarjeta from '../components/ui/Tarjeta.jsx'
import DatoContacto from '../components/ui/DatoContacto.jsx'
import Button from '../components/ui/Button.jsx'
import { creditos } from '../data/creditos.js'
import { contacto } from '../data/navegacion.js'

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
  bajada: 'Conocé nuestra variedad de créditos, convenios y servicios que tenemos para ofrecerte.',
  acciones: [
    { etiqueta: 'Conocé el fondo', to: '/nosotros', odId: 'cta-portada' },
    { etiqueta: 'Ver líneas de crédito', href: '#lineas-de-credito', variante: 'secundario' },
  ],
  laminas: [
    { alt: 'Pieza de Fondefos: ganadores del ahorro Plan 100 de noviembre de 2025.' },
    { alt: 'Pieza de Fondefos: sorteo Mercamil de noviembre.' },
    { alt: 'Pieza de Fondefos: convocatoria a los asociados del fondo.' },
    { alt: 'Pieza de Fondefos: segunda convocatoria a los asociados del fondo.' },
  ],
  datoFlotante: { valor: '1.200+', etiqueta: 'Asociados' },
}

const BANDA_REGISTRO = {
  titulo: 'Registrate ahora y recibí todos los beneficios como asociado.',
  texto: 'Sin costo de afiliación. Solo necesitás tu último desprendible de nómina, la fotocopia de la cédula y la certificación laboral.',
  accion: { etiqueta: 'Registrarme aquí', to: '/como-ser-asociado', variante: 'claro', odId: 'cta-registro' },
}

const ACCESOS = [
  { icono: 'tag', titulo: 'Convenios', texto: 'Con múltiples marcas de la región', href: '/convenios', odId: 'acceso-convenios' },
  { icono: 'alianza', titulo: 'Cómo ser asociado', texto: 'Descargá el formato y afiliate', href: '/como-ser-asociado', odId: 'acceso-como-ser-asociado' },
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

// Orden visual del clon en la rejilla "Nueve líneas" (index.html): el array
// de creditos.js (P2, solo lectura) tiene libre-inversión e impuestos en otro
// orden; la página reproduce el orden de tarjetas del clon, que es el que
// manda (misma clase de discrepancia que 9-vs-10 creditos, reconciliar en P9).
const ORDEN_LINEAS = [
  'crediaportes-10',
  'credito-de-confianza',
  'credito-de-consumo-por-bonos',
  'credito-de-libre-inversion',
  'credito-de-impuestos',
  'credito-de-recreacion-y-turismo',
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
        laminas={PORTADA.laminas}
        datoFlotante={PORTADA.datoFlotante}
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
          <div className="max-w-[58ch] mb-[34px]">
            <Rotulo>Accesos rápidos</Rotulo>
            <TituloDual>
              Todo lo que el fondo <strong>hace por vos</strong>
            </TituloDual>
          </div>
          <div className="rejilla rejilla--4">
            {ACCESOS.map((acceso) => (
              <Acceso
                href={acceso.href}
                icono={acceso.icono}
                titulo={acceso.titulo}
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
            <Rotulo>Dónde estamos</Rotulo>
            <TituloDual>
              ¿Dónde estamos <strong>ubicados</strong>?
            </TituloDual>
            <p>Atendemos de manera presencial en la sede de Floridablanca, Santander.</p>
            <Button href={contacto.comoLlegar.href} variant="secundario" target="_blank" rel="noopener">
              Cómo llegar
            </Button>
          </div>
          <Tarjeta relleno="contacto">
            <DatoContacto icono="pin" titulo="Sede">
              {contacto.sede}
            </DatoContacto>
            <DatoContacto icono="reloj" titulo="Horario de atención">
              {contacto.horario}
            </DatoContacto>
            <DatoContacto icono="telefono" titulo="Teléfonos">
              {contacto.telefonos[0]}
              <br />
              {contacto.telefonos[1]}
            </DatoContacto>
          </Tarjeta>
        </Split>
      </Seccion>
    </>
  )
}
