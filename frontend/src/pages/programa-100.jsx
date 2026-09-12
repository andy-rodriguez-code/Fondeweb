import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import EncabezadoPagina from '../sections/EncabezadoPagina.jsx'
import Seccion from '../sections/Seccion.jsx'
import Icono from '../components/ui/Icono.jsx'
import Button from '../components/ui/Button.jsx'
import useFirma from '../hooks/useFirma.js'
import { grupos, terminos, firmasFondo, programa100, MESES } from '../data/programa100.js'
import { enviarFormulario } from '../lib/enviarFormulario.js'
import logotipo from '../assets/images/banner/Logo-Fondefos-sin-fondo.png'

// programa-100 — formulario de inscripción al Programa 100 de ahorro
// voluntario, en una sola página. Traduce la maqueta suelta que entregó el
// cliente (code.html) al sistema del sitio: sus colores Material y su Tailwind
// por CDN se descartan, y quedan los tokens, la tipografía y las primitivas de
// acá. Los campos y los ocho términos viven en data/programa100.js.
//
// Tres cosas se calculan y no se escriben, para que el documento no pueda
// quedar en desacuerdo consigo mismo:
//   - el total proyectado es la cuota por los 12 meses del programa
//   - la fecha de terminación es la de expedición más esos 12 meses
//   - la fecha de expedición es la de hoy, en horario local
//
// El envío va contra api/enviar.php: el servidor asigna el consecutivo, manda
// el aviso con la firma adjunta y devuelve el radicado, que se muestra en el
// encabezado del formato. Los dos consentimientos —términos del programa y
// autorización de datos— van separados y ambos bloquean el envío.

const PESOS = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
})

// Fecha de hoy en ISO local. `toISOString()` pasa por UTC y en Colombia
// (UTC-5) devuelve el día anterior durante toda la tarde.
function hoyISO() {
  const ahora = new Date()
  const local = new Date(ahora.getTime() - ahora.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 10)
}

function sumarMeses(iso, meses) {
  if (!iso) return ''
  const [anio, mes, dia] = iso.split('-').map(Number)
  // Día 0 del mes siguiente = último día del mes destino: evita que un 31 se
  // desborde al mes que sigue cuando el destino tiene 30.
  const ultimoDia = new Date(anio, mes - 1 + meses + 1, 0).getDate()
  const destino = new Date(anio, mes - 1 + meses, Math.min(dia, ultimoDia))
  return `${destino.getFullYear()}-${String(destino.getMonth() + 1).padStart(2, '0')}-${String(destino.getDate()).padStart(2, '0')}`
}

function Campo({ campo, valor, error, onChange }) {
  const id = `p100-${campo.id}`
  return (
    <div className="campo" data-col={campo.col} data-error={error ? 'si' : 'no'}>
      <label htmlFor={id}>{campo.etiqueta}</label>
      {campo.tipo === 'select' ? (
        <select id={id} name={campo.id} value={valor} onChange={onChange}>
          {campo.opciones.map((opcion) => (
            <option value={opcion} key={opcion}>
              {opcion}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={id}
          name={campo.id}
          type={campo.tipo}
          value={valor}
          onChange={onChange}
          {...(campo.autoComplete ? { autoComplete: campo.autoComplete } : {})}
          {...(campo.inputMode ? { inputMode: campo.inputMode } : {})}
          {...(campo.requerido ? { 'aria-required': 'true' } : {})}
          {...(error ? { 'aria-describedby': `${id}-error` } : {})}
        />
      )}
      <span className="campo__error" id={`${id}-error`}>
        {campo.error}
      </span>
    </div>
  )
}

function Grupo({ grupo, children }) {
  return (
    <section className="registro__grupo">
      <h3 className="registro__grupo-titulo">
        <span className="registro__grupo-icono">
          <Icono nombre={grupo.icono} size={18} />
        </span>
        {grupo.titulo}
        {grupo.nota ? <span className="registro__nota">{grupo.nota}</span> : null}
      </h3>
      <div className="registro__grupo-cuerpo">{children}</div>
    </section>
  )
}

export default function Programa100Page() {
  const [valores, setValores] = useState(() => ({
    expedicion: hoyISO(),
    grupo: '',
    cuota: '',
    acepta: false,
    autoriza: false,
    ...Object.fromEntries(
      grupos.flatMap((g) => g.campos.map((c) => [c.id, c.tipo === 'select' ? c.opciones[0] : ''])),
    ),
  }))
  const [errores, setErrores] = useState({})
  const [enviando, setEnviando] = useState(false)
  const [fallo, setFallo] = useState('')
  // Momento en que se abrió la página, para la comprobación antirrobot del
  // servidor. Inicializador diferido: llamar Date.now() durante el render es
  // impuro.
  const [abierto] = useState(Date.now)
  const navegar = useNavigate()
  const { lienzoRef, hayFirma, limpiar, manejadores } = useFirma()

  const cuota = Number(valores.cuota) || 0
  const total = useMemo(() => PESOS.format(cuota * MESES), [cuota])
  const terminacion = useMemo(() => sumarMeses(valores.expedicion, MESES), [valores.expedicion])

  const cambiar = (campo) => (evento) => {
    const valor = evento.target.type === 'checkbox' ? evento.target.checked : evento.target.value
    setValores((previos) => ({ ...previos, [campo]: valor }))
    // El error se limpia al escribir, no en el siguiente envío: mantenerlo en
    // rojo mientras el campo ya está corregido es engañoso.
    setErrores((previos) => (previos[campo] ? { ...previos, [campo]: false } : previos))
  }

  const enviar = async (evento) => {
    evento.preventDefault()
    setFallo('')

    const nuevos = {}
    for (const grupo of grupos) {
      for (const campo of grupo.campos) {
        if (campo.requerido && !String(valores[campo.id]).trim()) nuevos[campo.id] = true
      }
    }
    if (cuota <= 0) nuevos.cuota = true
    if (!hayFirma) nuevos.firma = true
    if (!valores.acepta) nuevos.acepta = true
    // Consentimiento separado del de los términos: son dos cosas distintas y
    // la Ley 1581 pide que la autorización de datos sea explícita. Bundleados,
    // ninguno de los dos es demostrable por separado.
    if (!valores.autoriza) nuevos.autoriza = true

    setErrores(nuevos)
    if (Object.keys(nuevos).length) {
      // Lleva el foco al primer campo con error, que en teléfono puede estar
      // muy por encima del botón. El orden de las claves es el de inserción,
      // así que el primero es el de más arriba en el documento.
      const primero = Object.keys(nuevos)[0]
      document.getElementById(`p100-${primero}`)?.focus()
      return
    }

    setEnviando(true)
    try {
      // El lienzo se exporta recién acá: durante el llenado la firma vive como
      // puntos en el canvas y convertirla en cada trazo sería tirar trabajo.
      const firma = lienzoRef.current.toDataURL('image/png')
      // Los dos consentimientos salen de `campos`: no son datos del formato, y
      // el servidor los registra en columnas propias.
      const { acepta, autoriza, ...campos } = valores

      const numero = await enviarFormulario({
        formulario: 'programa-100',
        campos: { ...campos, 'acepta-terminos': acepta ? 'Sí' : 'No' },
        firma,
        autoriza,
        abierto,
      })
      // El resultado se muestra en la pantalla de gracias. El radicado viaja
      // en el `state` de la navegación y no en la URL: es el identificador de
      // la inscripción de una persona, y una URL se comparte y se indexa.
      navegar('/gracias', {
        state: {
          radicado: numero,
          aviso: programa100.formulario.aviso.antes,
          avisoFinal: programa100.formulario.aviso.despues,
        },
      })
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
          { texto: 'Ahorro', slug: '/ahorro' },
          { texto: 'Programa 100' },
        ]}
        titulo={programa100.titulo}
        entrada={programa100.entrada}
        banner="ahorro"
      />

      <Seccion tono="bright" data-od-id="seccion-programa-100">
        <div className="shell">
          <form className="registro" onSubmit={enviar} noValidate data-od-id="formulario-programa-100">
            <header className="registro__cabecera">
              <img className="registro__logo" src={logotipo} width="200" height="42" alt="Fondefos, tu fondo de servicios" />
              <div className="registro__titulos">
                <h2>Programa 100</h2>
                <p>De ahorro voluntario</p>
              </div>
              {/* El consecutivo lo asigna el servidor al radicar: hasta que
                  responde no se inventa un número. */}
              <p className="registro__consecutivo">
                <span>N.º</span>
                <strong>Al radicar</strong>
              </p>
            </header>

            <div className="rejilla-campos registro__meta">
              <div className="campo" data-col="4">
                <label htmlFor="p100-expedicion">Fecha de expedición</label>
                <input id="p100-expedicion" type="date" value={valores.expedicion} readOnly />
              </div>
              <div className="campo" data-col="4">
                <label htmlFor="p100-grupo">Grupo</label>
                <input id="p100-grupo" type="text" placeholder="Ej: A1" value={valores.grupo} onChange={cambiar('grupo')} />
              </div>
            </div>

            {grupos.map((grupo) => (
              <Grupo grupo={grupo} key={grupo.id}>
                <div className="rejilla-campos">
                  {grupo.campos.map((campo) => (
                    <Campo
                      campo={campo}
                      valor={valores[campo.id]}
                      error={errores[campo.id]}
                      onChange={cambiar(campo.id)}
                      key={campo.id}
                    />
                  ))}
                </div>
              </Grupo>
            ))}

            <Grupo grupo={{ titulo: 'Detalles del ahorro', icono: 'ahorro' }}>
              <div className="rejilla-campos">
                <div className="campo" data-col="4" data-error={errores.cuota ? 'si' : 'no'}>
                  <label htmlFor="p100-cuota">Valor del ahorro mensual</label>
                  <div className="campo__moneda">
                    <span aria-hidden="true">$</span>
                    <input
                      id="p100-cuota"
                      type="number"
                      min="0"
                      step="1000"
                      inputMode="numeric"
                      placeholder="30.000"
                      value={valores.cuota}
                      onChange={cambiar('cuota')}
                      aria-required="true"
                    />
                  </div>
                  <span className="campo__error">Escribí el valor de la cuota mensual.</span>
                </div>
                <div className="campo" data-col="4">
                  <label htmlFor="p100-total">Valor total ahorrado (proyectado)</label>
                  {/* Calculado: cuota × 12. Va como texto y no como number para
                      poder mostrarlo con el formato de pesos colombianos. */}
                  <input id="p100-total" type="text" value={total} readOnly />
                </div>
                <div className="campo" data-col="4">
                  <label htmlFor="p100-terminacion">Fecha de terminación del ahorro</label>
                  <input id="p100-terminacion" type="date" value={terminacion} readOnly />
                </div>
              </div>
              <p className="registro__calculo">
                {MESES} cuotas mensuales. El total y la fecha de terminación se calculan solos a
                partir de la cuota y de la fecha de expedición.
              </p>
            </Grupo>

            <section className="registro__terminos">
              <h3 className="registro__grupo-titulo">
                <span className="registro__grupo-icono">
                  <Icono nombre="documento" size={18} />
                </span>
                Términos y condiciones
              </h3>
              <ul>
                {terminos.map((termino) => (
                  <li key={termino.slice(0, 40)}>{termino}</li>
                ))}
              </ul>
              {/* Dos consentimientos, no uno. El de los términos es
                  contractual; el de datos es la autorización que exige la Ley
                  1581 de 2012. Cada uno con su data-error y los dos bloquean
                  el envío. */}
              <div className="campo campo--check" data-error={errores.acepta ? 'si' : 'no'}>
                <label htmlFor="p100-acepta">
                  <input
                    id="p100-acepta"
                    type="checkbox"
                    checked={valores.acepta}
                    onChange={cambiar('acepta')}
                    aria-required="true"
                  />
                  <span>Acepto los términos del Programa 100.</span>
                </label>
                <span className="campo__error">{programa100.formulario.aceptaError}</span>
              </div>
              <div className="campo campo--check" data-error={errores.autoriza ? 'si' : 'no'}>
                <label htmlFor="p100-autoriza">
                  <input
                    id="p100-autoriza"
                    type="checkbox"
                    checked={valores.autoriza}
                    onChange={cambiar('autoriza')}
                    aria-required="true"
                  />
                  <span>
                    Autorizo la política de{' '}
                    <Link to="/politica-de-datos" discover="none">
                      tratamiento de datos
                    </Link>
                    .
                  </span>
                </label>
                <span className="campo__error">{programa100.formulario.autorizaError}</span>
              </div>
            </section>

            <Grupo grupo={{ titulo: 'Firmas', icono: 'firma' }}>
              <div className="registro__firmas">
                <div className="campo firma" data-error={errores.firma ? 'si' : 'no'}>
                  <div className="firma__lienzo" data-firmado={hayFirma ? 'si' : 'no'}>
                    {/* El id sigue el patrón `p100-<clave de error>` para que
                        el foco del primer error también alcance a la firma; un
                        canvas no es enfocable sin tabIndex. */}
                    <canvas
                      id="p100-firma"
                      tabIndex="-1"
                      ref={lienzoRef}
                      {...manejadores}
                      aria-label="Área para firmar del ahorrador"
                      role="img"
                    />
                    <span className="firma__pista">
                      <Icono nombre="firma" size={22} />
                      {programa100.formulario.firmaVacia}
                    </span>
                  </div>
                  <div className="firma__pie">
                    <span className="firma__rotulo">Firma ahorrador</span>
                    <button type="button" className="firma__limpiar" onClick={limpiar} disabled={!hayFirma}>
                      {programa100.formulario.limpiarFirma}
                    </button>
                  </div>
                  <span className="campo__error">{programa100.formulario.firmaError}</span>
                </div>

                {firmasFondo.map((rotulo) => (
                  <div className="firma firma--fondo" key={rotulo}>
                    <div className="firma__linea">
                      <span>{programa100.formulario.firmaRegistrada}</span>
                    </div>
                    <span className="firma__rotulo">{rotulo}</span>
                  </div>
                ))}
              </div>
            </Grupo>

            {fallo ? (
              <p className="formulario__fallo" role="alert">
                {fallo}
              </p>
            ) : null}
            <div className="registro__acciones">
              <Button as="button" type="submit" disabled={enviando}>
                {enviando ? programa100.formulario.enviando : programa100.formulario.enviar}
              </Button>
            </div>
          </form>
        </div>
      </Seccion>
    </>
  )
}
