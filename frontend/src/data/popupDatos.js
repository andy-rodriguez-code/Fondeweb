// Contenido del popup de actualización de datos. Para cambiar textos, fechas o
// el video se toca este archivo y no el componente (PopupDatos.jsx).

export const popupDatos = {
  // Ventana en la que se muestra, en hora de Colombia (UTC-5). `hasta` es el
  // primer instante en que ya no sale. Pasada la fecha deja de aparecer sola.
  vigencia: {
    desde: '2026-11-01T00:00:00-05:00',
    hasta: '2027-01-01T00:00:00-05:00',
  },
  rotulo: 'Actualización de datos',
  titulo: { inicio: '¿Tus datos están ', destacado: 'al día', fin: '?' },
  texto:
    'Actualiza tu información y no te pierdas nada del fondo. En este video te mostramos cómo hacerlo en pocos pasos.',
  beneficios: [
    { icono: 'documento', texto: 'Tus extractos y estados de cuenta' },
    { icono: 'regalo', texto: 'Tu saludo de cumpleaños y los sorteos' },
    { icono: 'campana', texto: 'Las novedades y beneficios del fondo' },
  ],
  video: {
    etiqueta: 'Ver el video',
    // Enlace limpio, sin los parámetros de rastreo de la copia de Instagram.
    href: 'https://www.instagram.com/reel/DfS5fz4BFUK/',
    nota: 'Se abre en Instagram',
  },
}
