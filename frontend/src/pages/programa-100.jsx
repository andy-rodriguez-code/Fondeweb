import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import EncabezadoPagina from '../sections/EncabezadoPagina.jsx'
import Seccion from '../sections/Seccion.jsx'
import Icono from '../components/ui/Icono.jsx'
import Button from '../components/ui/Button.jsx'
import useFirma from '../hooks/useFirma.js'
import { grupos, terminos, firmasFondo, programa100, MESES } from '../data/programa100.js'
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
// Como el resto del prototipo, el envío es inerte: valida, avisa y no manda
// nada a ningún servidor (mismo criterio que el formulario de Contáctenos).

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
    ...Object.fromEntries(
      grupos.flatMap((g) => g.campos.map((c) => [c.id, c.tipo === 'select' ? c.opciones[0] : ''])),
    ),
  }))
  const [errores, setErrores] = useState({})
  const [enviado, setEnviado] = useState(false)
  const avisoRef = useRef(null)
  const { lienzoRef, hayFirma, limpiar, manejadores } = useFirma()

  const cuota = Number(valores.cuota) || 0
  const total = useMemo(() => PESOS.format(cuota * MESES), [cuota])
  const terminacion = useMemo(() => sumarMeses(valores.expedicion, MESES), [valores.expedicion])

  // El foco al aviso va en un efecto y no dentro del envío: en ese momento el
  // aviso todavía está en display:none, y focus() sobre un nodo oculto no hace
  // nada. Después del render ya es visible y sí recibe el foco.
  useEffect(() => {
    if (enviado) avisoRef.current?.focus()
  }, [enviado])

  const cambiar = (campo) => (evento) => {
    const valor = evento.target.type === 'checkbox' ? evento.target.checked : evento.target.value
    setValores((previos) => ({ ...previos, [campo]: valor }))
    // El error se limpia al escribir, no en el siguiente envío: mantenerlo en
    // rojo mientras el campo ya está corregido es engañoso.
    setErrores((previos) => (previos[campo] ? { ...previos, [campo]: false } : previos))
  }

  const enviar = (evento) => {
    evento.preventDefault()
    const nuevos = {}
    for (const grupo of grupos) {
      for (const campo of grupo.campos) {
        if (campo.requerido && !String(valores[campo.id]).trim()) nuevos[campo.id] = true
      }
    }
    if (cuota <= 0) nuevos.cuota = true
    if (!hayFirma) nuevos.firma = true
    if (!valores.acepta) nuevos.acepta = true

    setErrores(nuevos)
    if (Object.keys(nuevos).length) {
      setEnviado(false)
      // Lleva el foco al primer campo con error, que en teléfono puede estar
      // muy por encima del botón.
      const primero = Object.keys(nuevos)[0]
      document.getElementById(`p100-${primero}`)?.focus()
      return
    }
    setEnviado(true)
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
              {/* El consecutivo lo asigna FONDEFOS al radicar: el prototipo no
                  tiene servidor que lo entregue, así que no se inventa. */}
              <p className="registro__consecutivo">
                <span>N.º</span>
                <strong>Al radicar</strong>
              </p>
            </header>

            <div
              className="aviso-envio"
              data-visible={enviado ? 'si' : 'no'}
              tabIndex="-1"
              role="status"
              ref={avisoRef}
            >
              <Icono nombre="check" size={18} />
              <span>
                {programa100.formulario.aviso.antes}
                <a href={programa100.formulario.aviso.enlace.href}>
                  {programa100.formulario.aviso.enlace.etiqueta}
                </a>
                {programa100.formulario.aviso.despues}
              </span>
            </div>

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
              <div className="campo campo--check" data-error={errores.acepta ? 'si' : 'no'}>
                <label htmlFor="p100-acepta">
                  <input
                    id="p100-acepta"
                    type="checkbox"
                    checked={valores.acepta}
                    onChange={cambiar('acepta')}
                    aria-required="true"
                  />
                  <span>
                    Acepto los términos del Programa 100 y la{' '}
                    <Link to="/politica-de-datos" discover="none">
                      política de tratamiento de datos
                    </Link>
                    .
                  </span>
                </label>
                <span className="campo__error">{programa100.formulario.aceptaError}</span>
              </div>
            </section>

            <Grupo grupo={{ titulo: 'Firmas', icono: 'firma' }}>
              <div className="registro__firmas">
                <div className="campo firma" data-error={errores.firma ? 'si' : 'no'}>
                  <div className="firma__lienzo" data-firmado={hayFirma ? 'si' : 'no'}>
                    <canvas
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

            <div className="registro__acciones">
              <Button as="button" type="submit">
                {programa100.formulario.enviar}
              </Button>
            </div>
          </form>
        </div>
      </Seccion>
    </>
  )
}
