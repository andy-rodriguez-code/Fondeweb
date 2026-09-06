// FilasAccordion — acordeón FAQ (clon .filas/.fila, data-acordeon en el
// contenedor). Renders el estado inicial del clon: la fila `abierta` (por
// defecto la primera) con data-abierta="si" y aria-expanded="true"; las
// demás cerradas. El CSS (paridad.css grupo 13) selecciona por
// [data-abierta="si"]; useAcordeon (P8) reflejará esos mismos atributos
// desde estado, sin reescribir el CSS (decisión de diseño "State model").
// items: [{ pregunta, respuesta }]; id: prefijo de aria-controls/id del
// cuerpo (clon: faq-0, faq-1…).

export default function FilasAccordion({ id, items, abierta = 0, ...rest }) {
  return (
    <div className="filas" data-acordeon="" {...rest}>
      {items.map((item, i) => {
        const esAbierta = i === abierta
        return (
          <div className="fila" data-abierta={esAbierta ? 'si' : 'no'} key={i}>
            <h3 className="m-0">
              <button
                type="button"
                className="fila__boton"
                aria-expanded={esAbierta}
                aria-controls={`${id}-${i}`}
              >
                <span>{item.pregunta}</span>
                <span className="fila__signo" aria-hidden="true">
                  +
                </span>
              </button>
            </h3>
            <div className="fila__cuerpo" id={`${id}-${i}`}>
              {item.respuesta}
            </div>
          </div>
        )
      })}
    </div>
  )
}
