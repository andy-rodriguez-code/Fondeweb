import EncabezadoPagina from '../sections/EncabezadoPagina.jsx'
import Seccion from '../sections/Seccion.jsx'
import { Fragment } from 'react'
import Rotulo from '../components/ui/Rotulo.jsx'
import TituloDual from '../components/ui/TituloDual.jsx'
import DatoContacto from '../components/ui/DatoContacto.jsx'
import Icono from '../components/ui/Icono.jsx'
import Button from '../components/ui/Button.jsx'
import { contacto } from '../data/navegacion.js'

// contactenos — página de contacto (clon contactenos.html). Rejilla .contacto
// con datos de atención a la izquierda (los tres celulares y el correo se
// reutilizan del bloque Atención de navegacion.js) y formulario INERTE a la
// derecha: markup completo del clon sin handlers, validación ni envío
// (la Fase 3 lo cablea). Los estados del clon (data-error="no",
// data-visible="no") se renderizan en su valor inicial; el CSS §4.4
// (grupo 17) selecciona por esos atributos. Los literales del formulario no
// tienen módulo P2 propio (mismo criterio que beneficios/nosotros).
// data-od-id del clon: seccion-contacto (formulario-contacto).

const ENCABEZADO = {
  entrada: 'Atendemos de forma presencial en Floridablanca y respondemos por teléfono y correo.',
}

const CELULARES = contacto.celulares
const CORREO = contacto.correo

const ASUNTOS = ['Afiliación', 'Créditos', 'Ahorro', 'Convenios', 'Estado de cuenta', 'Otro']

const FORMULARIO = {
  titulo: 'Escribinos',
  aviso: {
    antes: 'Listo. Este formulario es una demostración del prototipo: no envía datos a ningún servidor. Escribinos a ',
    enlace: { etiqueta: 'fondo.empleados@foscal.com.co', href: 'mailto:fondo.empleados@foscal.com.co' },
    despues: ' para una respuesta real.',
  },
  enviar: 'Enviar mensaje',
  legal: 'FONDEFOS cumple con la Ley 1581 de 2012 y el Decreto 1377 de 2013 sobre protección de datos personales.',
}

export default function ContactenosPage() {
  return (
    <>
      <EncabezadoPagina
        rutas={[
          { texto: 'Inicio', slug: '/' },
          { texto: 'Contáctenos' },
        ]}
        titulo="Contáctenos"
        entrada={ENCABEZADO.entrada}
        banner="contactenos"
      />

      <Seccion data-od-id="seccion-contacto">
        <div className="shell contacto">
          <div>
            {/* Solo el encabezado se centra en teléfono: los datos de contacto
                y el formulario conservan su alineación. */}
            <div className="max-md:text-center">
              <Rotulo>Datos de atención</Rotulo>
              <TituloDual>
                Hablemos <strong>directo</strong>
              </TituloDual>
            </div>
            <div className="mt-[26px]">
              <DatoContacto icono="telefono" titulo="Celulares">
                {CELULARES.map((celular, i) => (
                  <Fragment key={celular.href}>
                    {i > 0 ? ' · ' : ''}
                    <a href={celular.href}>{celular.etiqueta}</a>
                  </Fragment>
                ))}
              </DatoContacto>
              <DatoContacto icono="telefono" titulo="Fijo">
                {contacto.fijo}
              </DatoContacto>
              <DatoContacto icono="correo" titulo="Correo">
                <a href={CORREO.href}>{CORREO.etiqueta}</a>
              </DatoContacto>
              <DatoContacto icono="reloj" titulo="Horario de atención">
                {contacto.horario}
              </DatoContacto>
              <DatoContacto icono="pin" titulo="Sede">
                {contacto.sede}
              </DatoContacto>
            </div>
          </div>

          <form className="formulario" data-formulario="" data-od-id="formulario-contacto">
            <div className="aviso-envio" data-visible="no" tabIndex="-1" role="status">
              <Icono nombre="check" size={18} />
              <span>
                {FORMULARIO.aviso.antes}
                <a href={FORMULARIO.aviso.enlace.href}>{FORMULARIO.aviso.enlace.etiqueta}</a>
                {FORMULARIO.aviso.despues}
              </span>
            </div>
            <h2 className="text-[1.3rem]">{FORMULARIO.titulo}</h2>
            <div className="campo" data-error="no">
              <label htmlFor="c-nombre">Nombre completo *</label>
              <input id="c-nombre" name="nombre" type="text" required autoComplete="name" placeholder="María Gómez" />
              <span className="campo__error">Ingresá tu nombre completo.</span>
            </div>
            <div className="campo" data-error="no">
              <label htmlFor="c-correo">Correo electrónico *</label>
              <input id="c-correo" name="correo" type="email" required autoComplete="email" placeholder="nombre@correo.com" />
              <span className="campo__error">Ingresá un correo electrónico válido.</span>
            </div>
            <div className="campo" data-error="no">
              <label htmlFor="c-telefono">Teléfono</label>
              <input id="c-telefono" name="telefono" type="tel" autoComplete="tel" placeholder="300 000 0000" />
            </div>
            <div className="campo" data-error="no">
              <label htmlFor="c-asunto">Asunto *</label>
              {/* Sin defaultValue: React añadiría selected al primer option,
                  atributo que el clon no tiene (el navegador ya selecciona la
                  primera opción). */}
              <select id="c-asunto" name="asunto" required>
                <option value="">Elegí un asunto</option>
                {ASUNTOS.map((asunto) => (
                  <option value={asunto} key={asunto}>
                    {asunto}
                  </option>
                ))}
              </select>
              <span className="campo__error">Seleccioná un asunto.</span>
            </div>
            <div className="campo" data-error="no">
              <label htmlFor="c-mensaje">Mensaje *</label>
              <textarea id="c-mensaje" name="mensaje" required placeholder="Contanos en qué te podemos ayudar."></textarea>
              <span className="campo__error">Escribí tu mensaje.</span>
            </div>
            <Button type="submit" className="w-full">
              {FORMULARIO.enviar}
            </Button>
            <p className="mt-[14px] text-[0.82rem] text-muted">{FORMULARIO.legal}</p>
          </form>
        </div>
      </Seccion>
    </>
  )
}
