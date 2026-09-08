// Iconos de las nueve líneas de crédito — ilustraciones reales del cliente,
// las mismas que sirve producción en las tarjetas de "Nueve líneas de crédito"
// (allá como `N_nombre-150x150.png`). El círculo de fondo viene dentro del PNG,
// así que la tarjeta no le agrega ningún chip.
//
// La numeración del archivo es el orden de la rejilla en producción, y por eso
// `credito-de-recreacion-y-turismo` (5) va antes que `credito-de-impuestos` (6).
//
// Importados uno por uno a propósito: la carpeta `banner/` guarda otros diez
// PNG numerados (accesos rápidos, datos de contacto) y un glob `[0-9]_*.png`
// se los llevaba al bundle sin que nadie los use.

import crediaportes from '../assets/images/banner/1_crediaportes.png'
import confianza from '../assets/images/banner/2_confianza.png'
import bonos from '../assets/images/banner/3_bonos.png'
import libreInversion from '../assets/images/banner/4_libre_inversion.png'
import recreacionTurismo from '../assets/images/banner/5_recreacion_turismo.png'
import impuestos from '../assets/images/banner/6_impuestos.png'
import educativo from '../assets/images/banner/7_educativo.png'
import tesoreria from '../assets/images/banner/8_tesoreria.png'
import tarjetaExpress from '../assets/images/banner/9_tarjeta_expres.png'

export const iconosLineas = {
  'crediaportes-10': crediaportes,
  'credito-de-confianza': confianza,
  'credito-de-consumo-por-bonos': bonos,
  'credito-de-libre-inversion': libreInversion,
  'credito-de-recreacion-y-turismo': recreacionTurismo,
  'credito-de-impuestos': impuestos,
  'credito-educativo': educativo,
  'creditos-de-tesoreria': tesoreria,
  'tarjeta-express': tarjetaExpress,
}

export function iconoDe(slug) {
  return iconosLineas[slug] || null
}
