// Banners de encabezado — un par de imágenes reales del cliente por página,
// tomadas de `assets/images/banner/`. Fuente de la relación página → archivo:
// inspección del sitio en producción (fondefos.com.co) el 2026-09-08, midiendo
// el `background-image` del contenedor del banner a 1440px y a 390px.
//
// En tablet (768–1024px) WordPress sirve la imagen de escritorio; el par solo
// distingue escritorio y móvil.
//
// Dos correcciones frente a producción, donde WordPress sirve hoy la imagen
// equivocada y el archivo correcto existe:
//   - como-ser-asociado: producción usa `Nosotros-mobil.jpg` → acá `asociados-movil.jpg`
//   - credito-de-consumo-por-bonos: producción usa `10-crediahorro-MOBIL.jpg` → acá `credito-bonos-movil.jpg`
//
// `convenios`, `preguntas-frecuentes` y `politica-de-datos` no tienen banner en
// producción, pero el cliente entregó sus fotos y acá sí lo llevan.

const ESCRITORIO = import.meta.glob('../assets/images/banner/*-pc.jpg', {
  eager: true,
  import: 'default',
})
const MOVIL = import.meta.glob('../assets/images/banner/*-movil.jpg', {
  eager: true,
  import: 'default',
})

const ruta = (mapa, archivo) => mapa[`../assets/images/banner/${archivo}`]

// Pares cuyo archivo de móvil no sigue el patrón `<base>-movil.jpg`.
const MOVIL_IRREGULAR = {
  // El archivo entregado va en singular.
  convenios: 'convenio-movil.jpg',
}

// slug de la ruta → nombre base del par en disco.
const BASES = {
  '/': 'home',
  nosotros: 'Nosotros',
  'como-ser-asociado': 'asociados',
  ahorro: 'Ahorra',
  beneficios: 'beneficios',
  'estado-de-cuenta': 'Estadode-cuenta',
  contactenos: 'contactenos',
  'crediaportes-10': 'Crediaportes-10',
  'credito-de-confianza': 'credito-confianza',
  'credito-de-consumo-por-bonos': 'credito-bonos',
  'credito-de-libre-inversion': 'credito-libreinversion',
  'credito-de-impuestos': 'credito-impuestos',
  'credito-de-recreacion-y-turismo': 'credito-de-recreacion-turismo',
  'credito-educativo': 'credito-educativo',
  'creditos-de-tesoreria': 'credito-tesoreria',
  'tarjeta-express': 'credito-tarjeta-express',
  convenios: 'convenios',
  'preguntas-frecuentes': 'preguntas-frecuentes',
  'politica-de-datos': 'politica-de-datos',
}

// Altura del banner en móvil. Producción usa 720px salvo en Nosotros, que la
// baja a 594px; se conserva esa diferencia.
const ALTO_MOVIL = { nosotros: 594 }

export const banners = Object.fromEntries(
  Object.entries(BASES).map(([slug, base]) => [
    slug,
    {
      escritorio: ruta(ESCRITORIO, `${base}-pc.jpg`),
      movil: ruta(MOVIL, MOVIL_IRREGULAR[slug] ?? `${base}-movil.jpg`),
      altoMovil: ALTO_MOVIL[slug] ?? 720,
    },
  ]),
)

export function bannerDe(slug) {
  const banner = banners[slug]
  if (!banner || !banner.escritorio || !banner.movil) return null
  return banner
}
