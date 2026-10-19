// Notifondo content — single auditable source for the "Notifondo" section
// (boletín del asociado). Las publicaciones van de la más reciente a la más
// antigua: la primera es la portada de la revista y la que abre "Leer el
// Notifondo". `src` se resuelve a import de Vite por basename
// (lib/imagenesNotifondo.js), así que cada imagen nueva va en
// src/assets/images/notifondo/ en .webp.
//
// Opcionales por publicación:
//   ancho/alto  medidas reales de la imagen cuando no es 819×1024 (las
//               páginas del boletín impreso).
//   enlace      { href, etiqueta }: el visor muestra un botón que lo abre en
//               una pestaña nueva (p. ej. un formulario de inscripción).

export const notifondo = {
  encabezado: {
    rotulo: 'Boletín del asociado',
    titulo: { inicio: '¡', destacado: 'Notifondo', fin: '!' },
    texto: 'Las novedades del fondo, de la más reciente a la más antigua. Ábrelo y pasa las páginas como en la revista impresa.',
    accion: 'Leer el Notifondo',
  },
  paginas: [
    {
      pagina: 'Día de los Niños',
      src: 'assets/images/notifondo/dia-de-los-ninos-2.webp',
      alt: 'Día de los Niños de Fondefos: sábado 31 de octubre en la UNAB, Campus El Bosque, para niños de 2 a 10 años. Inscripciones del 2 al 16 de octubre.',
      ancho: 2481,
      alto: 3509,
      enlace: {
        href: 'https://docs.google.com/forms/d/e/1FAIpQLScx1ruszJspZgkUspk_EtHmNlqUeoDBh7qv3VoMEp7FBq9pKg/viewform',
        etiqueta: 'Ir al formulario de inscripción del Día de los Niños',
      },
    },
    // Ganadores de julio de 2026. Las imágenes salen de los PDF que entregó
    // el fondo (primera y única página de cada uno, 1448×2048).
    {
      pagina: 'Sorteo Cumpleaños',
      src: 'assets/images/notifondo/ganadores-sorteo-cumpleanos-julio.webp',
      alt: 'Ganadores del sorteo de cumpleaños de julio de 2026: Alba Leonor Osma Chaparro, Daniel Eduardo Mantilla García y Belsy Fernández Arenas.',
      ancho: 1448,
      alto: 2048,
    },
    {
      pagina: 'Sorteo Mercamil',
      src: 'assets/images/notifondo/ganadores-sorteo-mercamil-julio.webp',
      alt: 'Ganadores del sorteo Mercamil de julio de 2026: Jaime Arenas Gómez y Elizabeth Arciniegas Mutis.',
      ancho: 1448,
      alto: 2048,
    },
    {
      pagina: 'Sorteo Plan 100',
      src: 'assets/images/notifondo/ganadores-sorteo-plan100-julio.webp',
      alt: 'Ganadoras del sorteo Plan 100 de julio de 2026: Martha Vargas Morales (grupo 32, balota 97) y Sayda Carolina Rueda (grupo 31, balota 96).',
      ancho: 1448,
      alto: 2048,
    },
    { pagina: 'Página 1', src: 'assets/images/fondefos.com.co/notifondo-web-1-819x1024-d6a063db7d.webp', alt: 'Notifondo de septiembre, página 1 de 8' },
    { pagina: 'Página 2', src: 'assets/images/fondefos.com.co/notifondo-web-2-819x1024-afc67e0c3e.webp', alt: 'Notifondo de septiembre, página 2 de 8' },
    { pagina: 'Página 3', src: 'assets/images/fondefos.com.co/notifondo-web-3-819x1024-32b3fd5ffc.webp', alt: 'Notifondo de septiembre, página 3 de 8' },
    { pagina: 'Página 4', src: 'assets/images/fondefos.com.co/notifondo-web-4-819x1024-e6da5c7238.webp', alt: 'Notifondo de septiembre, página 4 de 8' },
    { pagina: 'Página 5', src: 'assets/images/fondefos.com.co/notifondo-web-5-819x1024-d85f16a967.webp', alt: 'Notifondo de septiembre, página 5 de 8' },
    { pagina: 'Página 6', src: 'assets/images/fondefos.com.co/notifondo-web-6-819x1024-9fca35ab8e.webp', alt: 'Notifondo de septiembre, página 6 de 8' },
    { pagina: 'Página 7', src: 'assets/images/fondefos.com.co/notifondo-web-7-819x1024-ba03ca86a2.webp', alt: 'Notifondo de septiembre, página 7 de 8' },
    { pagina: 'Página 8', src: 'assets/images/fondefos.com.co/notifondo-web-8-819x1024-d797337280.webp', alt: 'Notifondo de septiembre, página 8 de 8' },
  ],
}

export default notifondo
