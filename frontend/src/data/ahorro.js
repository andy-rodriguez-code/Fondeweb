// Ahorro content — single auditable source for the "Ahorro" page.
// Read-only source: root ahorro.html clone. Every literal is a verbatim
// byte-copy (percentages, distribution figures, call-to-action bands).

export const ahorro = {
  entrada: 'Dos formas de ahorro dentro del fondo: la permanente, que es obligatoria y periódica, y la voluntaria.',
  opciones: [
    {
      etiqueta: 'Obligatorio',
      titulo: 'Permanente',
      texto: 'Los asociados al Fondo de Empleados se comprometen a hacer aportes individuales periódicos y a ahorrar de forma permanente así:',
      lista: [
        'Por lo menos el cuatro por ciento (4%) de un salario mínimo mensual vigente, sin que ello exceda del diez por ciento (10%) del mismo.',
        'Esa suma se distribuye en veinte por ciento (20%) para aportes sociales y ochenta por ciento (80%) para ahorros permanentes.',
      ],
    },
    {
      etiqueta: 'Opcional',
      titulo: 'Voluntario',
      texto: 'Los asociados que así lo deseen podrán realizar aportes voluntarios, los cuales serán reglamentados por la Junta Directiva, al igual que los ahorros permanentes.',
    },
  ],
  franja: {
    titulo: 'Podés retirar un porcentaje del ahorro permanente una vez al año',
    accion: { etiqueta: 'Ver condiciones', href: 'preguntas-frecuentes.html', slug: '/preguntas-frecuentes' },
  },
  cierre: {
    titulo: 'Tu ahorro es también tu cupo de crédito',
    texto: 'La línea de libre inversión presta hasta cinco veces el capital ahorrado.',
    accion: { etiqueta: 'Ver crédito de libre inversión', href: 'credito-de-libre-inversion.html', slug: '/credito-de-libre-inversion' },
  },
}

export default ahorro
