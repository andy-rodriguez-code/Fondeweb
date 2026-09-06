import { Link } from 'react-router-dom'

// EncabezadoPagina — banner de página interior (clon .encabezado,
// data-od-id="encabezado-pagina"): miga + h1 + entrada + slot derecho
// opcional (bloque .cifras en convenios/nosotros, imagen en beneficios).
// Estilos: paridad.css grupo 9 (base, ::after, rejilla, overrides) y grupo 3
// (::before con mask-image, P1). La miga conserva el contrato DOM de la
// primitiva Miga (ol.miga > li > a, aria-current="page" en el último nivel),
// pero los enlaces son router Link con el slug derivado: Miga (P3) renderiza
// <a> plano y no puede alojar un Link sin tocar el archivo P3 (fuera del
// alcance de escritura de esta fase); reconciliar si Miga gana un prop
// `enlace` en el futuro.

export default function EncabezadoPagina({ rutas, titulo, entrada, children }) {
  return (
    <section className="encabezado" data-od-id="encabezado-pagina">
      <div className="shell encabezado__rejilla">
        <div>
          <ol className="miga">
            {rutas.map((ruta, i) => {
              const esActual = i === rutas.length - 1
              return (
                <li key={ruta.texto} {...(esActual ? { 'aria-current': 'page' } : {})}>
                  {esActual ? (
                    ruta.texto
                  ) : (
                    <Link to={ruta.slug} discover="none">
                      {ruta.texto}
                    </Link>
                  )}
                </li>
              )
            })}
          </ol>
          <h1>{titulo}</h1>
          {entrada ? (
            <p className="entrada max-w-[62ch] text-[1.03rem]">{entrada}</p>
          ) : null}
        </div>
        {children}
      </div>
    </section>
  )
}
