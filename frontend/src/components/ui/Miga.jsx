// Miga — breadcrumb (assets/site.css lines 1097-1122). The "/" separator is a
// li + li::before pseudo-element ported to styles/paridad.css (§4.4 group 5);
// this component only composes <ol>/<li>/<a> and marks the last level with
// aria-current="page" as the clone does.

export default function Miga({ rutas, className = '' }) {
  return (
    <ol className={`miga ${className}`.trim()}>
      {rutas.map((ruta, i) => {
        const esActual = i === rutas.length - 1
        return (
          <li key={ruta.texto} {...(esActual ? { 'aria-current': 'page' } : {})}>
            {esActual ? ruta.texto : <a href={ruta.href}>{ruta.texto}</a>}
          </li>
        )
      })}
    </ol>
  )
}
