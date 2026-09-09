import EncabezadoPagina from '../sections/EncabezadoPagina.jsx'
import Seccion from '../sections/Seccion.jsx'
import Rotulo from '../components/ui/Rotulo.jsx'
import TituloDual from '../components/ui/TituloDual.jsx'
import DatoContacto from '../components/ui/DatoContacto.jsx'
import Icono from '../components/ui/Icono.jsx'
import Button from '../components/ui/Button.jsx'
import { contacto } from '../data/navegacion.js'

// contactenos — página de contacto. Rejilla .contacto con los datos de
// atención a la izquierda (celular, correo, horario y sede, en el orden de
// producción) y el formulario a la derecha, con sus mismas etiquetas,
// marcadores y opciones de asunto (medido el 2026-09-08).
//
// El formulario sigue INERTE: markup completo sin handlers, validación ni
// envío; lo cablea la Fase 3. Los estados (data-error="no", data-visible="no")
// se renderizan en su valor inicial y el CSS §4.4 (grupo 17) selecciona por
// ellos. Los literales no tienen módulo P2 propio (mismo criterio que
// beneficios/nosotros). data-od-id: seccion-contacto (formulario-contacto).

const ENCABEZADO = {
  entrada: 'Estamos aquí para escucharte y ayudarte. Ponte en contacto con nuestro equipo y encuentra la orientación que necesitas para resolver tus inquietudes, conocer nuestros servicios y aprovechar todas las oportunidades que FONDEFOS tiene para ti.',
}

// Los cuatro datos de atención, en el orden de producción (medido el
// 2026-09-08): celular, correo, horario y sede. Producción publica un solo
// celular en esta página.
const DATOS = [
  { icono: 'telefono', titulo: 'Celular', enlace: contacto.celulares[2] },
  { icono: 'correo', titulo: 'Correo', enlace: contacto.correo },
  { icono: 'reloj', titulo: 'Horario de atención', texto: contacto.horario },
  { icono: 'pin', titulo: 'Sede', texto: contacto.sedeCorta },
]

const ASUNTOS = ['Afiliación', 'Créditos', 'Ahorro', 'Convenios', 'Estados de cuenta', 'Otro']

const FORMULARIO = {
  titulo: 'Dejanos tus datos, pronto te responderemos',
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
              {DATOS.map((dato) => (
                <DatoContacto icono={dato.icono} titulo={dato.titulo} key={dato.titulo}>
                  {dato.enlace ? (
                    <a href={dato.enlace.href}>{dato.enlace.etiqueta}</a>
                  ) : (
                    dato.texto
                  )}
                </DatoContacto>
              ))}
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
            <h2 className="text-[1.3rem] text-center">{FORMULARIO.titulo}</h2>
            <div className="campo" data-error="no">
              <label htmlFor="c-nombre">Nombre completo</label>
              <input id="c-nombre" name="nombre" type="text" required autoComplete="name" placeholder="Ingresa tu nombre" />
              <span className="campo__error">Ingresá tu nombre completo.</span>
            </div>
            <div className="campo" data-error="no">
              <label htmlFor="c-correo">Correo electrónico</label>
              <input id="c-correo" name="correo" type="email" required autoComplete="email" placeholder="Email" />
              <span className="campo__error">Ingresá un correo electrónico válido.</span>
            </div>
            <div className="campo" data-error="no">
              <label htmlFor="c-telefono">Teléfono</label>
              <input id="c-telefono" name="telefono" type="tel" required autoComplete="tel" placeholder="Ingresa tu teléfono" />
              <span className="campo__error">Ingresá tu teléfono.</span>
            </div>
            <div className="campo" data-error="no">
              <label htmlFor="c-asunto">Asunto</label>
              {/* Sin defaultValue: React añadiría selected al primer option,
                  atributo que el clon no tiene (el navegador ya selecciona la
                  primera opción). */}
              <select id="c-asunto" name="asunto" required>
                <option value="">Selecciona un asunto</option>
                {ASUNTOS.map((asunto) => (
                  <option value={asunto} key={asunto}>
                    {asunto}
                  </option>
                ))}
              </select>
              <span className="campo__error">Seleccioná un asunto.</span>
            </div>
            <div className="campo" data-error="no">
              <label htmlFor="c-mensaje">Mensaje</label>
              {/* Sin `required`: producción deja el mensaje opcional y exige
                  los otros cuatro campos. */}
              <textarea id="c-mensaje" name="mensaje" placeholder="Mensaje"></textarea>
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
