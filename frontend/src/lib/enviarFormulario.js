// enviarFormulario — único punto de salida del sitio hacia el backend.
//
// En producción la ruta es relativa: el endpoint vive en el mismo dominio que
// el SPA, así que no hay CORS que configurar de ningún lado. En desarrollo la
// resuelve el proxy de Vite (vite.config.js).
//
// El radicado lo asigna el servidor y no se calcula acá: es la constancia que
// se le muestra a la persona y tiene que salir de un único lugar.

const URL_API = import.meta.env.VITE_API_URL || '/api/enviar.php'

// El servidor responde con códigos, no con frases. La traducción vive de este
// lado para que el backend no tenga que saber en qué idioma está el sitio.
export const ERRORES = {
  sin_conexion: 'No pudimos conectarnos. Revisá tu conexión e intentá de nuevo.',
  limite_alcanzado: 'Recibimos varios envíos desde acá hace un momento. Esperá unos minutos.',
  demasiado_rapido: 'El formulario se envió demasiado rápido. Intentá de nuevo.',
  campo_requerido: 'Falta completar un campo obligatorio.',
  correo_invalido: 'Revisá el correo electrónico.',
  falta_autorizacion: 'Hace falta autorizar el tratamiento de datos.',
  falta_firma: 'Hace falta la firma del ahorrador.',
  correo_no_enviado: 'Guardamos tus datos, pero no pudimos enviarte la copia por correo.',
  desconocido: 'No se pudo enviar. Intentá de nuevo en unos minutos.',
}

export async function enviarFormulario({ formulario, campos, firma, autoriza, abierto }) {
  let respuesta

  try {
    respuesta = await fetch(URL_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        formulario,
        campos,
        firma,
        autoriza,
        // Campo trampa: queda vacío siempre. Un robot que complete todo lo llena.
        website: '',
        // Milisegundos desde que se abrió la página. El servidor descarta lo
        // que llegue en menos de tres segundos.
        demora: Date.now() - abierto,
      }),
    })
  } catch {
    throw new Error(ERRORES.sin_conexion)
  }

  const datos = await respuesta.json().catch(() => null)

  if (!respuesta.ok || !datos || !datos.ok) {
    const codigo = (datos && datos.error) || 'desconocido'
    const fallo = new Error(ERRORES[codigo] || ERRORES.desconocido)
    // El campo viaja aparte del mensaje: la página lo usa para marcar en rojo
    // el input que el servidor rechazó.
    fallo.campo = datos && datos.campo
    fallo.codigo = codigo
    throw fallo
  }

  return datos.radicado
}
