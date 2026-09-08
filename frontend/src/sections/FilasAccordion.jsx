import useAcordeon from '../hooks/useAcordeon.js'

// FilasAccordion — acordeón FAQ (clon .filas/.fila, data-acordeon en el
// contenedor). useAcordeon (P8) refleja los atributos del clon desde estado:
// data-abierta="si"/"no" y aria-expanded por fila, alternando de forma
// independiente (el clon permite varias abiertas). El CSS (paridad.css grupo
// 13) selecciona por [data-abierta="si"], sin reescribirlo (decisión de
// diseño "State model"). items: [{ pregunta, respuesta }]; id: prefijo de
// aria-controls/id del cuerpo (clon: faq-0, faq-1…); abierta: índice de la
// fila abierta por defecto (0).

export default function FilasAccordion({ id, items, abierta = 0, ...rest }) {
  const { abiertas, alternar } = useAcordeon(abierta)
  return (
    <div className="filas" data-acordeon="" {...rest}>
      {items.map((item, i) => {
        const esAbierta = abiertas.has(i)
        return (
          <div className="fila" data-abierta={esAbierta ? 'si' : 'no'} key={i}>
            <h3 className="m-0">
              <button
                type="button"
                className="fila__boton"
                aria-expanded={esAbierta}
                aria-controls={`${id}-${i}`}
                onClick={() => alternar(i)}
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
