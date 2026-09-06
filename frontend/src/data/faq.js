// FAQ content — single auditable source for the "Preguntas frecuentes" page.
// Read-only source: root preguntas-frecuentes.html clone. Every literal is a
// verbatim byte-copy (question/answer pairs, closing call-to-action band).

export const faq = {
  entrada: 'Las nueve consultas que más nos hacen sobre afiliación, ahorro y créditos.',
  items: [
    {
      pregunta: '¿Cuánto me descuentan por retirarme del fondo y qué tiempo demora la devolución del dinero?',
      respuesta: 'Sólo se descuenta $14.000. La devolución del dinero se realiza dos meses después de pasada la carta de retiro.',
    },
    {
      pregunta: '¿La afiliación tiene algún costo?',
      respuesta: 'No, ninguno.',
    },
    {
      pregunta: '¿Qué documentos se requieren para la afiliación?',
      respuesta: 'Último desprendible de nómina, fotocopia de la cédula y certificación laboral (aplica para independientes).',
    },
    {
      pregunta: '¿Puedo retirar una parte de lo que tengo ahorrado?',
      respuesta: 'Sí, un porcentaje que se aplica al ahorro permanente. El trámite solo se puede hacer una vez al año.',
    },
    {
      pregunta: '¿Cuánto tiempo debo tener de afiliado para hacer una solicitud de crédito?',
      respuesta: 'Después del primer mes de ahorro. Se puede tramitar la solicitud por la línea de crédito de tesorería.',
    },
    {
      pregunta: '¿Puedo hacer abonos o la cancelación de la deuda en cualquier momento?',
      respuesta: 'Sí, se pueden hacer abonos parciales o la cancelación total de la deuda.',
    },
    {
      pregunta: 'Siendo empleado de cualquier empresa, ¿me puedo afiliar?',
      respuesta: 'Sí, siempre y cuando demuestre estabilidad laboral.',
    },
    {
      pregunta: 'Si tengo un crédito de libre inversión, ¿en cuánto tiempo puedo solicitar un crédito nuevo?',
      respuesta: 'Para hacer una nueva solicitud de crédito, según el reglamento, debo tener cancelado el 25% del monto inicial del crédito.',
    },
    {
      pregunta: '¿En cuánto tiempo me puedo volver a afiliar?',
      respuesta: 'Tres meses después de pasada la carta de retiro.',
    },
  ],
  cierre: {
    titulo: 'Para consultar tu extracto',
    texto: 'El portal del asociado está disponible las 24 horas.',
    accion: { etiqueta: 'Ver instrucciones', href: 'estado-de-cuenta.html', slug: '/estado-de-cuenta' },
  },
}

export default faq
