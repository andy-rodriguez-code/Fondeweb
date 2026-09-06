// Notifondo content — single auditable source for the "Notifondo" viewer section
// (boletín del asociado, 8 pages). Read-only source: root index.html clone.
// `src` values are the verbatim clone paths; consumers resolve them to Vite
// imports under src/assets/ (the files were copied there in P1, slice 1).

export const notifondo = {
  encabezado: {
    rotulo: 'Boletín del asociado',
    titulo: { inicio: '¡', destacado: 'Notifondo', fin: '!' },
    texto: 'Las novedades del fondo, edición vigente. Tocá cualquier página para ampliarla.',
  },
  paginas: [
    { pagina: 'Página 1', accion: 'Ampliar', src: 'assets/images/fondefos.com.co/notifondo-web-1-819x1024-d6a063db7d.webp', alt: 'Notifondo de Fondefos, página 1 de 8' },
    { pagina: 'Página 2', accion: 'Ampliar', src: 'assets/images/fondefos.com.co/notifondo-web-2-819x1024-afc67e0c3e.webp', alt: 'Notifondo de Fondefos, página 2 de 8' },
    { pagina: 'Página 3', accion: 'Ampliar', src: 'assets/images/fondefos.com.co/notifondo-web-3-819x1024-32b3fd5ffc.webp', alt: 'Notifondo de Fondefos, página 3 de 8' },
    { pagina: 'Página 4', accion: 'Ampliar', src: 'assets/images/fondefos.com.co/notifondo-web-4-819x1024-e6da5c7238.webp', alt: 'Notifondo de Fondefos, página 4 de 8' },
    { pagina: 'Página 5', accion: 'Ampliar', src: 'assets/images/fondefos.com.co/notifondo-web-5-819x1024-d85f16a967.webp', alt: 'Notifondo de Fondefos, página 5 de 8' },
    { pagina: 'Página 6', accion: 'Ampliar', src: 'assets/images/fondefos.com.co/notifondo-web-6-819x1024-9fca35ab8e.webp', alt: 'Notifondo de Fondefos, página 6 de 8' },
    { pagina: 'Página 7', accion: 'Ampliar', src: 'assets/images/fondefos.com.co/notifondo-web-7-819x1024-ba03ca86a2.webp', alt: 'Notifondo de Fondefos, página 7 de 8' },
    { pagina: 'Página 8', accion: 'Ampliar', src: 'assets/images/fondefos.com.co/notifondo-web-8-819x1024-d797337280.webp', alt: 'Notifondo de Fondefos, página 8 de 8' },
  ],
}

export default notifondo
