import { Link } from 'react-router-dom'
import BannerFoto from './BannerFoto.jsx'
import { bannerDe } from '../data/banners.js'

// EncabezadoPagina — banner de página interior (clon .encabezado,
// data-od-id="encabezado-pagina"): miga + h1 + entrada + slot derecho
// opcional (bloque .cifras en convenios/nosotros, imagen en beneficios).
// Estilos: paridad.css grupo 9 (base, ::after, rejilla, overrides), grupo 3
// (::before con mask-image, P1) y grupo 20 (variante con foto). La miga
// conserva el contrato DOM de la primitiva Miga (ol.miga > li > a,
// aria-current="page" en el último nivel), pero los enlaces son router Link
// con el slug derivado: Miga (P3) renderiza <a> plano y no puede alojar un
// Link sin tocar el archivo P3 (fuera del alcance de escritura de esta fase);
// reconciliar si Miga gana un prop `enlace` en el futuro.
//
// `banner` recibe el slug de la página y trae el par de fotos reales del
// cliente (data/banners.js); el detalle de cómo se sirven vive en BannerFoto.

// `debajo` coloca el slot dentro de la columna de texto, después de la bajada,
// en vez de en la columna derecha de la rejilla. Lo usan Nosotros y Convenios
// para sus cifras, en las tres resoluciones.

export default function EncabezadoPagina({ rutas, titulo, entrada, banner, debajo = false, children }) {
  const foto = banner ? bannerDe(banner) : null
  return (
    <section
      className={foto ? 'encabezado encabezado--foto' : 'encabezado'}
      data-od-id="encabezado-pagina"
      {...(foto ? { 'data-alto-movil': foto.altoMovil } : {})}
    >
      {foto ? <BannerFoto slug={banner} /> : null}
      <div className="shell encabezado__rejilla">
        {/* En teléfono el banner va centrado, igual que el héroe del inicio. */}
        <div className="max-md:text-center">
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
            <p className="entrada max-w-[62ch] text-[1.03rem] max-md:mx-auto">{entrada}</p>
          ) : null}
          {debajo ? <div className="mt-8">{children}</div> : null}
        </div>
        {debajo ? null : children}
      </div>
    </section>
  )
}
