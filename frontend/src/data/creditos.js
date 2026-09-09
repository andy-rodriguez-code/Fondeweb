// Credit lines of Fondefos — single auditable source for the 9 `.credito` pages.
// Read-only source: root *.html clone pages. Every literal is a verbatim byte-copy
// (rates, terms, requirements); nothing is paraphrased or rounded.
//
// Schema follows design.md "Interfaces / Contracts" and expands it where the clone
// varies: `resumen` is the ordered list of dt/dd pairs as rendered by the clone
// (not all lines split libranza/caja, and some add "Tipo de cuota", "Cuantía máxima",
// "Cupo con libranza" or "Pago"); `bloques` is an ordered list because the first block
// is "Cupo" on some pages and content is either `<p>` paragraphs or `<ul>` items.

export const creditos = [
  {
    slug: 'crediaportes-10',
    titulo: 'Crediaportes + 10%',
    entrada: 'Tu ahorro puede abrirte nuevas puertas. Usa lo que ya has construido en FONDEFOS como respaldo y haz realidad tus proyectos.',
    resumen: [
      { etiqueta: 'Interés', valor: '0,8% mensual' },
      { etiqueta: 'Plazo máximo', valor: '72 meses' },
      { etiqueta: 'Tipo de cuota', valor: 'Cuota fija' },
    ],
    bloques: [
      { titulo: 'Monto', parrafos: ['Hasta el monto de los aportes sociales y ahorro permanente que el asociado tiene al diligenciar el crédito.'] },
      { titulo: 'Plazo', parrafos: ['El plazo máximo, dependiendo del monto, será hasta de setenta y dos (72) meses.'] },
      { titulo: 'Interés y tipo de cuota', parrafos: ['El interés será del 0,8% por ciento, cuota fija.'] },
    ],
    requisitos: [
      'Ser un asociado hábil.',
      'Llevar como mínimo tres (3) meses de afiliación al Fondo de Empleados.',
      'Estar al día en los pagos de sus obligaciones.',
      'Demostrar solvencia económica.',
      'Garantías: libranza y pagaré con carta de instrucciones firmado.',
      'Amortización: por descuentos a través de la oficina de nómina para los asociados que sean trabajadores activos, o por caja, previa autorización del Comité de Crédito.',
      'Tener disponibilidad por nómina para realizar el descuento del crédito solicitado.',
    ],
    otras: ['credito-de-confianza', 'credito-de-consumo-por-bonos', 'credito-de-libre-inversion'],
  },
  {
    slug: 'credito-de-confianza',
    titulo: 'Crédito de confianza',
    entrada: 'Empieza a cumplir tus proyectos desde el primer mes. Un crédito pensado para ti, aprobado de acuerdo con tu capacidad de pago y bajo las condiciones establecidas por FONDEFOS.',
    resumen: [
      { etiqueta: 'Interés por libranza', valor: '1,6% sobre saldo' },
      { etiqueta: 'Interés por caja', valor: '1,8% sobre saldo' },
      { etiqueta: 'Plazo máximo', valor: '72 meses' },
    ],
    bloques: [
      { titulo: 'Monto', parrafos: ['Estos créditos serán autorizados por la Junta Directiva, quien determinará la cuantía autorizada, previa verificación de los ingresos y capacidad de pago del solicitante.'] },
      { titulo: 'Plazo', parrafos: ['El plazo máximo de los créditos de confianza será de hasta setenta y dos (72) meses.'] },
      { titulo: 'Interés', lista: ['Por libranza, el interés de los créditos de confianza es del uno punto seis (1,6%) por ciento sobre el saldo.', 'Para pago por caja es del uno punto ocho (1,8%) por ciento sobre saldo.'] },
    ],
    requisitos: [
      'Tener una antigüedad mínima de un (1) mes de afiliación, entendiéndose por tal la fecha en que se canceló la primera cuota de aporte.',
      'Tener disponibilidad por nómina para realizar el descuento del crédito solicitado.',
      'La amortización se hará por descuento a través de la oficina de nómina, o por caja, previa autorización de la Junta Directiva.',
      'Garantías: pagaré y carta de instrucciones debidamente firmado.',
    ],
    otras: ['crediaportes-10', 'credito-de-consumo-por-bonos', 'credito-de-libre-inversion'],
  },
  {
    slug: 'credito-de-consumo-por-bonos',
    titulo: 'Crédito de consumo por bonos',
    entrada: 'Convierte tus bonos en oportunidades y haz realidad eso que necesitas. Un respaldo pensado para que puedas acceder a recursos cuando más los necesitas.',
    resumen: [
      { etiqueta: 'Interés', valor: '2% sobre saldo' },
      { etiqueta: 'Plazo máximo', valor: '12 meses' },
      { etiqueta: 'Cuantía máxima', valor: '3 SMMLV' },
    ],
    bloques: [
      { titulo: 'Cupo', parrafos: ['Estos créditos serán autorizados por el gerente de FONDEFOS, quien determinará la cuantía autorizada, previa verificación de los ingresos y capacidad de pago del solicitante. En todo caso, para créditos de consumo (mercancías) la cuantía máxima no podrá ser superior a 3 SMMLV.'] },
      { titulo: 'Plazo', parrafos: ['El plazo máximo de los créditos de consumo por bonos será de doce (12) meses.'] },
      { titulo: 'Interés', parrafos: ['El interés de los créditos de consumo por bonos es del dos (2%) por ciento sobre el saldo.'] },
    ],
    requisitos: [
      'Tener una antigüedad mínima de un (1) mes de afiliación, entendiéndose por tal la fecha en que se canceló la primera cuota de aporte.',
      'Tener disponibilidad por nómina para realizar el descuento del crédito solicitado.',
      'La amortización se hará por descuento a través de la oficina de nómina, o por caja, previa autorización de la Gerencia.',
      'Garantías: pagaré y carta de instrucciones debidamente firmada.',
      'Este crédito podrá solicitarse teniendo otro tipo de préstamos, siempre y cuando la totalidad de los créditos no supere el monto de los 70 salarios mínimos legales vigentes (SMMLV).',
    ],
    otras: ['crediaportes-10', 'credito-de-confianza', 'credito-de-libre-inversion'],
  },
  {
    slug: 'credito-de-impuestos',
    titulo: 'Crédito de impuestos',
    entrada: 'Tú eliges el destino, FONDEFOS te brinda el respaldo. Obtén el impulso que necesitas para hacer realidad tus proyectos, resolver tus necesidades o cumplir eso que tienes en mente.',
    resumen: [
      { etiqueta: 'Interés por libranza', valor: '1,2% sobre saldo' },
      { etiqueta: 'Interés por caja', valor: '1,4% sobre saldo' },
      { etiqueta: 'Plazo máximo', valor: '12 meses' },
    ],
    bloques: [
      { titulo: 'Monto', parrafos: ['Estos créditos serán autorizados por el gerente del Fondo, quien determinará la cuantía autorizada, previa verificación de los ingresos y capacidad de pago del solicitante.'] },
      { titulo: 'Plazo', parrafos: ['El plazo máximo de los créditos de impuestos será de doce (12) meses.'] },
      { titulo: 'Interés', parrafos: ['El interés de los créditos de impuestos es del uno punto dos (1,2%) por ciento sobre el saldo para pago con libranza. Para pago por caja será del uno punto cuatro por ciento (1,4%) sobre saldo.'] },
    ],
    requisitos: [
      'Tener una antigüedad mínima de un (1) mes de afiliación, entendiéndose por tal la fecha en que se canceló la primera cuota de aporte.',
      'Tener disponibilidad por nómina para realizar el descuento del crédito solicitado.',
      'La amortización se hará por descuento a través de la oficina de nómina, o por caja, previa autorización de la Gerencia del Fondo.',
      'Garantías: pagaré y carta de instrucciones debidamente firmada.',
    ],
    otras: ['crediaportes-10', 'credito-de-confianza', 'credito-de-consumo-por-bonos'],
  },
  {
    slug: 'credito-de-libre-inversion',
    titulo: 'Crédito de libre inversión',
    entrada: 'Tú eliges el destino, FONDEFOS te brinda el respaldo. Obtén el impulso que necesitas para hacer realidad tus proyectos, resolver tus necesidades o cumplir eso que tienes en mente.',
    resumen: [
      { etiqueta: 'Cupo con libranza', valor: '5× capital ahorrado' },
      { etiqueta: 'Cupo por caja', valor: '3× capital ahorrado' },
      { etiqueta: 'Plazo máximo', valor: '72 meses' },
    ],
    bloques: [
      { titulo: 'Cupo', lista: ['Hasta cinco (5) veces el capital ahorrado cuando tenga garantía de libranza.', 'Hasta tres (3) veces el capital ahorrado cuando el pago es realizado por caja.', 'En todos los casos, ninguno de estos créditos podrá superar el tope máximo de 70 salarios mínimos mensuales legales vigentes.'] },
      { titulo: 'Plazo', parrafos: ['Máximo setenta y dos (72) meses.'] },
      { titulo: 'Interés', parrafos: ['El interés estará sujeto a las condiciones pactadas al inicio del otorgamiento del crédito.'], lista: ['Con libranza: 1,6% cuota fija o variable.', 'Créditos sin libranza: 1,8% cuota fija o variable.'] },
    ],
    requisitos: [
      'Ser un asociado hábil.',
      'Llevar como mínimo tres (3) meses de afiliación al Fondo de Empleados.',
      'Estar al día en los pagos de sus obligaciones con el Fondo de Empleados.',
      'Demostrar solvencia económica.',
      'Garantías: libranza y pagaré con carta de instrucciones firmado conjuntamente con codeudor(es).',
      'Tener disponibilidad por nómina para realizar el descuento del crédito solicitado.',
    ],
    otras: ['crediaportes-10', 'credito-de-confianza', 'credito-de-consumo-por-bonos'],
  },
  {
    slug: 'credito-de-recreacion-y-turismo',
    titulo: 'Crédito de recreación y turismo',
    entrada: 'Haz realidad tus planes de viaje y disfruta de nuevas experiencias con un crédito diseñado para cumplir tus sueños',
    resumen: [
      { etiqueta: 'Interés por libranza', valor: '1,5% sobre saldo' },
      { etiqueta: 'Interés por caja', valor: '1,7% sobre saldo' },
      { etiqueta: 'Plazo máximo', valor: '36 meses' },
    ],
    bloques: [
      { titulo: 'Monto', parrafos: ['Estos créditos serán autorizados por el gerente o comité de créditos de acuerdo con los montos que cada instancia pueda aprobar, quienes determinarán la cuantía autorizada, previa verificación de los ingresos y capacidad de pago del solicitante.'] },
      { titulo: 'Plazo', parrafos: ['El plazo máximo de los créditos de recreación y turismo será de treinta y seis (36) meses.'] },
      { titulo: 'Interés', parrafos: ['El interés de los créditos de recreación y turismo es del uno punto cinco (1,5%) por ciento sobre el saldo para pago con libranza. Para pago por caja el interés es de uno punto siete por ciento (1,7%) sobre el saldo.'] },
    ],
    requisitos: [
      'Tener una antigüedad mínima de un (1) mes de afiliación, entendiéndose por tal la fecha en que se canceló la primera cuota de aporte.',
      'Tener disponibilidad por nómina para realizar el descuento del crédito solicitado.',
      'La amortización se hará por descuento a través de la oficina de nómina, o por caja, previa autorización de la Gerencia del Fondo.',
      'Garantías: pagaré y carta de instrucciones debidamente firmada.',
      'Para la solicitud del crédito de turismo y recreación, el asociado deberá presentar cotización de la agencia o empresa que va a prestar el servicio.',
    ],
    otras: ['crediaportes-10', 'credito-de-confianza', 'credito-de-consumo-por-bonos'],
  },
  {
    slug: 'credito-educativo',
    titulo: 'Crédito educativo',
    entrada: 'Financia tus estudios, cursos y proyectos educativos con un crédito pensado para impulsar tu formación y ayudarte a alcanzar tus metas profesionales.',
    resumen: [
      { etiqueta: 'Interés', valor: '1% sobre saldo' },
      { etiqueta: 'Cuantía máxima', valor: '6 a 12 SMMLV' },
      { etiqueta: 'Plazo', valor: '6 a 12 meses' },
    ],
    bloques: [
      { titulo: 'Monto', lista: ['Para estudios de educación formal o informal, educación cooperativa y estudios universitarios: cuantía máxima de seis (6) salarios mínimos legales vigentes.', 'Para estudios de especialización profesional: cuantía máxima de doce (12) salarios mínimos legales vigentes.'] },
      { titulo: 'Plazo', lista: ['Para educación formal o informal, educación cooperativa y estudios universitarios: seis (6) meses.', 'Para especialización profesional: doce (12) meses.'] },
      { titulo: 'Interés', parrafos: ['Será del uno (1%) por ciento sobre el saldo, tanto para el asociado como para sus familiares en primer grado de consanguinidad (cónyuge e hijos).'] },
    ],
    requisitos: [
      'Ser asociado hábil con antigüedad mínima de un (1) mes, estar al día en los pagos de aportes y demostrar solvencia económica.',
      'Libranza y pagaré con carta de instrucciones firmado conjuntamente con codeudor(es) que sea(n) preferiblemente asociado(s) hábil(es) o trabajador(es) con vínculo laboral, previa demostración de la solvencia económica. Cuando el valor prestado no sea superior al capital ahorrado, no se requerirá de codeudor(es) y podrá otorgarse mediante libranza.',
      'Amortización: por descuento a través de la oficina de nómina para los asociados que sean trabajadores activos, o por caja, previa autorización del Comité de Crédito.',
      'Tener disponibilidad por nómina para realizar el descuento del crédito solicitado.',
    ],
    otras: ['crediaportes-10', 'credito-de-confianza', 'credito-de-consumo-por-bonos'],
  },
  {
    slug: 'creditos-de-tesoreria',
    titulo: 'Créditos de tesorería',
    entrada: 'Impulsa tus proyectos, atiende tus necesidades de liquidez y fortalece tu flujo de caja. Obtén el respaldo financiero que necesitas de manera ágil y oportuna para seguir avanzando con tranquilidad y confianza.',
    resumen: [
      { etiqueta: 'Interés', valor: '2% sobre saldo' },
      { etiqueta: 'Plazo máximo', valor: '36 cuotas' },
      { etiqueta: 'Monto', valor: '15× la cuota mensual' },
    ],
    bloques: [
      { titulo: 'Monto', parrafos: ['Hasta quince (15) veces el valor de la cuota aportada mensualmente por el asociado. Solo puede tenerse un crédito por esta línea.'] },
      { titulo: 'Plazo', parrafos: ['El plazo máximo será de 36 cuotas.'] },
      { titulo: 'Interés', parrafos: ['El interés para los créditos de tesorería será de dos (2%) por ciento sobre el saldo. Este tipo de crédito será otorgado por la Gerencia, previo diligenciamiento del formato de solicitud respectivo, y podrá otorgarse desde el mismo momento en que el solicitante haya cancelado la primera cuota de aporte social.'] },
    ],
    requisitos: [
      'Como condición para el otorgamiento del crédito de tesorería, la Gerencia deberá verificar que el asociado tenga disponibilidad por nómina para realizar el descuento del crédito solicitado.',
    ],
    otras: ['crediaportes-10', 'credito-de-confianza', 'credito-de-consumo-por-bonos'],
  },
  {
    slug: 'tarjeta-express',
    titulo: 'Tarjeta expréss',
    entrada: 'La solución rápida y práctica para tener acceso a recursos cuando más los necesitas. Disfruta de mayor flexibilidad financiera para realizar tus compras, atender imprevistos y cumplir tus metas con confianza y facilidad.',
    resumen: [
      { etiqueta: 'Interés', valor: '2% sobre saldo' },
      { etiqueta: 'Plazo máximo', valor: '24 meses' },
      { etiqueta: 'Pago', valor: 'Libranza o caja' },
    ],
    bloques: [
      { titulo: 'Monto', parrafos: ['Estos créditos serán autorizados por el gerente del Fondo, quien determinará la cuantía autorizada, previa verificación de los ingresos y capacidad de pago del solicitante.'] },
      { titulo: 'Plazo', parrafos: ['El plazo máximo de los créditos de tarjeta expréss será de veinticuatro (24) meses.'] },
      { titulo: 'Interés', parrafos: ['El interés de los créditos de tarjeta expréss es del dos (2%) por ciento sobre el saldo para pago con libranza o por caja.'] },
    ],
    requisitos: [
      'Tener una antigüedad mínima de un (1) mes de afiliación, entendiéndose por tal la fecha en que se canceló la primera cuota de aporte.',
      'Tener disponibilidad por nómina para realizar el descuento del crédito solicitado.',
      'La amortización se hará por descuento a través de la oficina de nómina, o por caja, previa autorización de la Gerencia del Fondo.',
      'Garantías: pagaré y carta de instrucciones debidamente firmado.',
    ],
    otras: ['crediaportes-10', 'credito-de-confianza', 'credito-de-consumo-por-bonos'],
  },
]

export default creditos
