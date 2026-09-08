import { bannerDe } from '../data/banners.js'

// BannerFoto — fotografía de fondo de un encabezado, con el velo azul encima.
// La usan EncabezadoPagina (15 páginas interiores) y Portada (inicio).
//
// Producción resuelve el par escritorio/móvil con dos background-image y un
// media query; acá va un <picture>, que deja la elección al navegador, no
// descarga las dos, admite fetchPriority y evita el `style=` inline que la
// guarda 9.4 prohíbe. El velo lo pinta el ::after en paridad.css (grupo 20).
//
// La foto es decorativa: el h1 de la sección ya nombra la página, así que
// alt="" evita repetirlo en el lector de pantalla.
//
// Devuelve null si el slug no tiene par de imágenes, para que la sección
// caiga en su fondo degradado de siempre.

export default function BannerFoto({ slug }) {
  const foto = bannerDe(slug)
  if (!foto) return null
  return (
    <picture className="banner-foto">
      <source media="(max-width: 767px)" srcSet={foto.movil} />
      <img src={foto.escritorio} alt="" fetchPriority="high" decoding="async" />
    </picture>
  )
}
