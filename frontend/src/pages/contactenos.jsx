import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import EncabezadoPagina from '../sections/EncabezadoPagina.jsx'
import Seccion from '../sections/Seccion.jsx'
import Rotulo from '../components/ui/Rotulo.jsx'
import TituloDual from '../components/ui/TituloDual.jsx'
import DatoContacto from '../components/ui/DatoContacto.jsx'
import Icono from '../components/ui/Icono.jsx'
import Button from '../components/ui/Button.jsx'
import { contacto } from '../data/navegacion.js'
import { enviarFormulario } from '../lib/enviarFormulario.js'

// contactenos — página de contacto. Rejilla .contacto con los datos de
// atención a la izquierda (celular, correo, horario y sede, en el orden de
// producción) y el formulario a la derecha, con sus mismas etiquetas,
// marcadores y opciones de asunto (medido el 2026-09-08).
//
// El formulario envía contra api/enviar.php. El radicado lo asigna el servidor
// y se muestra como constancia; la persona además recibe una copia por correo.
// Los estados (data-error, data-visible) los mueve React y el CSS §4.4
// (grupo 17) selecciona por ellos. data-od-id: seccion-contacto
// (formulario-contacto).

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

// Los cuatro campos que producción exige. El mensaje queda opcional, igual
// que allá.
const REQUERIDOS = ['nombre', 'correo', 'telefono', 'asunto']

const FORMULARIO = {
  titulo: 'Dejanos tus datos, pronto te responderemos',
  enviar: 'Enviar mensaje',
  enviando: 'Enviando…',
  autorizaError: 'Tenés que autorizar el tratamiento de datos para continuar.',
  legal: 'FONDEFOS cumple con la Ley 1581 de 2012 y el Decreto 1377 de 2013 sobre protección de datos personales.',
}

export default function ContactenosPage() {
  // Momento en que se abrió la página. El servidor descarta lo que llegue en
  // menos de tres segundos: ninguna persona llena cuatro campos en ese tiempo.
  // Va como inicializador diferido (`Date.now` sin paréntesis) y no como
  // `useRef(Date.now())`: llamarla durante el render es impuro y React puede
  // rehacerlo.
  const [abierto] = useState(Date.now)
  const formularioRef = useRef(null)
  const avisoRef = useRef(null)
  const [errores, setErrores] = useState({})
  const [enviando, setEnviando] = useState(false)
  const [radicado, setRadicado] = useState('')
  const [fallo, setFallo] = useState('')

  const limpiarError = (campo) => () => {
    // El error se apaga al escribir, no en el siguiente envío: dejarlo en rojo
    // con el campo ya corregido es engañoso.
    setErrores((previos) => (previos[campo] ? { ...previos, [campo]: false } : previos))
  }

  const enviar = async (evento) => {
    evento.preventDefault()
    setFallo('')
    setRadicado('')

    const datos = Object.fromEntries(new FormData(formularioRef.current).entries())

    const nuevos = {}
    for (const campo of REQUERIDOS) {
      if (!String(datos[campo] || '').trim()) nuevos[campo] = true
    }
    if (datos.correo && !datos.correo.includes('@')) nuevos.correo = true
    // La autorización de datos es obligatoria: sin ella el endpoint rechaza el
    // envío y, sobre todo, no habría base legal para guardar nada.
    if (datos.autoriza !== 'on') nuevos.autoriza = true

    setErrores(nuevos)
    if (Object.keys(nuevos).length) {
      document.getElementById(`c-${Object.keys(nuevos)[0]}`)?.focus()
      return
    }

    setEnviando(true)
    try {
      // `autoriza` viaja aparte de los campos: es consentimiento, no un dato
      // del mensaje, y el servidor lo registra en su propia columna.
      const { autoriza, ...campos } = datos

      const numero = await enviarFormulario({
        formulario: 'contacto',
        campos,
        autoriza: autoriza === 'on',
        abierto,
      })
      setRadicado(numero)
      formularioRef.current.reset()
      // El aviso está en display:none hasta este render: enfocarlo antes no
      // hace nada. Por eso va después, ya visible.
      requestAnimationFrame(() => avisoRef.current?.focus())
    } catch (error) {
      setFallo(error.message)
      if (error.campo) setErrores({ [error.campo]: true })
    } finally {
      setEnviando(false)
    }
  }

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

          <form
            className="formulario"
            ref={formularioRef}
            onSubmit={enviar}
            noValidate
            data-formulario=""
            data-od-id="formulario-contacto"
          >
            <div
              className="aviso-envio"
              data-visible={radicado ? 'si' : 'no'}
              tabIndex="-1"
              role="status"
              ref={avisoRef}
            >
              <Icono nombre="check" size={18} />
              <span>
                Listo. Recibimos tu mensaje con el radicado <strong>{radicado}</strong>.
                Guardalo para cualquier consulta: te llega una copia al correo.
              </span>
            </div>
            <h2 className="text-[1.3rem] text-center">{FORMULARIO.titulo}</h2>
            <div className="campo" data-error={errores.nombre ? 'si' : 'no'}>
              <label htmlFor="c-nombre">Nombre completo</label>
              <input id="c-nombre" name="nombre" type="text" required autoComplete="name" placeholder="Ingresa tu nombre" onChange={limpiarError('nombre')} />
              <span className="campo__error">Ingresá tu nombre completo.</span>
            </div>
            <div className="campo" data-error={errores.correo ? 'si' : 'no'}>
              <label htmlFor="c-correo">Correo electrónico</label>
              <input id="c-correo" name="correo" type="email" required autoComplete="email" placeholder="Email" onChange={limpiarError('correo')} />
              <span className="campo__error">Ingresá un correo electrónico válido.</span>
            </div>
            <div className="campo" data-error={errores.telefono ? 'si' : 'no'}>
              <label htmlFor="c-telefono">Teléfono</label>
              <input id="c-telefono" name="telefono" type="tel" required autoComplete="tel" placeholder="Ingresa tu teléfono" onChange={limpiarError('telefono')} />
              <span className="campo__error">Ingresá tu teléfono.</span>
            </div>
            <div className="campo" data-error={errores.asunto ? 'si' : 'no'}>
              <label htmlFor="c-asunto">Asunto</label>
              {/* Sin defaultValue: React añadiría selected al primer option,
                  atributo que el clon no tiene (el navegador ya selecciona la
                  primera opción). */}
              <select id="c-asunto" name="asunto" required onChange={limpiarError('asunto')}>
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
            </div>
            {/* Autorización de tratamiento de datos (Ley 1581 de 2012).
                Obligatoria: sin ella no hay base legal para guardar el envío.
                Reutiliza .campo--check del grupo 26, que ya trae el estado
                data-error y no está anidado bajo .registro. */}
            <div className="campo campo--check" data-error={errores.autoriza ? 'si' : 'no'}>
              <label htmlFor="c-autoriza">
                <input
                  id="c-autoriza"
                  name="autoriza"
                  type="checkbox"
                  aria-required="true"
                  onChange={limpiarError('autoriza')}
                />
                <span>
                  Autorizo la política de{' '}
                  <Link to="/politica-de-datos" discover="none">
                    tratamiento de datos
                  </Link>
                  .
                </span>
              </label>
              <span className="campo__error">{FORMULARIO.autorizaError}</span>
            </div>
            {fallo ? (
              <p className="formulario__fallo" role="alert">
                {fallo}
              </p>
            ) : null}
            <Button type="submit" className="w-full" disabled={enviando}>
              {enviando ? FORMULARIO.enviando : FORMULARIO.enviar}
            </Button>
            <p className="mt-[14px] text-[0.82rem] text-muted">{FORMULARIO.legal}</p>
          </form>
        </div>
      </Seccion>
    </>
  )
}
