// reCAPTCHA v3 — obtiene el token que el backend le manda a Google a verificar.
//
// A diferencia de v2, acá la persona no resuelve nada: Google observa cómo se
// comporta en la página y devuelve un puntaje de 0 a 1. El backend lo compara
// contra RECAPTCHA_MINIMO y decide.
//
// LA CLAVE DE SITIO ES PÚBLICA. Va con prefijo VITE_ y termina dentro del
// bundle, que cualquiera puede leer. Está bien: Google la diseñó así. La que no
// puede salir nunca del servidor es la clave secreta, que vive en el config.php
// de fuera de public_html y es la única que sirve para verificar.
//
// El script se carga solo cuando hace falta y no en toda visita: pesa unos 50 KB
// desde los servidores de Google, y la mayoría de las páginas del sitio no
// tienen formulario.

const CLAVE_SITIO = import.meta.env.VITE_RECAPTCHA_SITE_KEY || ''

// Una sola promesa para toda la vida de la página. Si dos formularios piden el
// script a la vez, esperan la misma carga en vez de pedirlo dos veces.
let cargando = null

function cargarScript() {
  if (cargando) return cargando

  cargando = new Promise((resolver, rechazar) => {
    if (window.grecaptcha) {
      resolver(window.grecaptcha)
      return
    }

    const script = document.createElement('script')
    script.src = `https://www.google.com/recaptcha/api.js?render=${CLAVE_SITIO}`
    script.async = true
    script.defer = true
    script.onload = () => resolver(window.grecaptcha)
    script.onerror = () => {
      // Se limpia para que un segundo intento vuelva a probar: la carga pudo
      // fallar por un corte momentáneo, no porque el script no exista.
      cargando = null
      rechazar(new Error('No se pudo cargar reCAPTCHA'))
    }
    document.head.appendChild(script)
  })

  return cargando
}

/**
 * Devuelve el token para una acción, o cadena vacía si reCAPTCHA no está
 * configurado o no se pudo cargar.
 *
 * Nunca lanza: que Google no responda no puede ser motivo para que una persona
 * no pueda escribirle al fondo. Si vuelve vacío, el servidor decide —y si allá
 * la clave secreta está puesta, rechazará el envío con un mensaje claro.
 */
export async function obtenerTokenRecaptcha(accion) {
  if (!CLAVE_SITIO) return ''

  try {
    const grecaptcha = await cargarScript()

    // `ready` espera a que Google termine de inicializarse por dentro. Pedir el
    // token antes devuelve un error poco descriptivo.
    return await new Promise((resolver) => {
      grecaptcha.ready(() => {
        grecaptcha
          .execute(CLAVE_SITIO, { action: accion })
          .then(resolver)
          .catch(() => resolver(''))
      })
    })
  } catch {
    return ''
  }
}

/**
 * Empieza a cargar el script sin pedir token todavía.
 *
 * Se llama al abrir la página del formulario: para cuando la persona termine de
 * escribir, Google ya está listo y el envío no espera nada.
 */
export function precargarRecaptcha() {
  if (!CLAVE_SITIO) return
  cargarScript().catch(() => {})
}

export const recaptchaActivo = CLAVE_SITIO !== ''
