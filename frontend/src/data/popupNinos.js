// Contenido del popup del Día de los Niños. Los textos son los de la pieza que
// entregó el cliente y se copian tal cual; para otra fecha, otro lugar u otro
// formulario se cambia este archivo y no el componente.

export const popupNinos = {
  // Ventana en la que el popup se muestra, en hora de Colombia (UTC-5, sin
  // horario de verano). Fuera de ella no aparece y no hay que tocar nada más.
  // `hasta` es el primer instante en que ya no sale: la medianoche que sigue
  // a las 11:59 p. m. del 12 de octubre, cierre de las inscripciones.
  vigencia: {
    desde: '2026-10-01T00:00:00-05:00',
    hasta: '2026-10-13T00:00:00-05:00',
  },
  // Cada línea del título va en su propio renglón.
  titulo: ['Día de los', 'Niños'],
  subtitulo: '¡Un día lleno de emociones!',
  imagenAlt: 'Personajes de Intensamente',
  edad: { antes: 'NIÑOS DE', rango: '2 a 10', despues: 'AÑOS' },
  datos: [
    {
      icono: 'lapiz',
      tono: 'alegria',
      titulo: 'Inscripciones: del 2 al 12 de octubre',
    },
    {
      icono: 'calendario',
      tono: 'furia',
      titulo: 'Sábado 31 de octubre',
      detalle: 'Ingreso 8:30 AM · Salida 11:30 AM',
    },
    {
      icono: 'lugar',
      tono: 'tristeza',
      titulo: 'UNAB – Campus El Bosque',
      detalle: 'Auditorio de la Facultad de Ciencias de la Salud / Medicina, Floridablanca',
    },
  ],
  nota: {
    rotulo: '📌 Importante:',
    texto:
      'al inscribir al niño para la actividad, el asociado se compromete a garantizar su asistencia. En caso de no asistir sin justa causa, el asociado deberá asumir el valor correspondiente al costo de la actividad por el niño inscrito.',
  },
  inscripcion: {
    etiqueta: '¡Inscribir a mi niño!',
    href: 'https://docs.google.com/forms/d/e/1FAIpQLScx1ruszJspZgkUspk_EtHmNlqUeoDBh7qv3VoMEp7FBq9pKg/viewform',
  },
}
