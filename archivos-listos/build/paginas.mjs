// Contenido real de fondefos.com.co, transcrito desde RECON/content/pages.json.
// Ningún texto de esta tabla es inventado: los porcentajes, plazos y requisitos
// son los que publica el fondo. Los "resumen" son extractos de esos mismos textos.

export const CREDITOS = [
  {
    archivo: "crediaportes-10.html",
    titulo: "Crediaportes + 10%",
    entrada:
      "Un crédito respaldado por lo que ya tenés en el fondo: se otorga hasta el monto de tus aportes sociales y tu ahorro permanente.",
    resumen: [
      ["Interés", "0,8% mensual"],
      ["Plazo máximo", "72 meses"],
      ["Tipo de cuota", "Cuota fija"]
    ],
    bloques: [
      {
        h: "Monto",
        p: "Hasta el monto de los aportes sociales y ahorro permanente que el asociado tiene al diligenciar el crédito."
      },
      { h: "Plazo", p: "El plazo máximo, dependiendo del monto, será hasta de setenta y dos (72) meses." },
      { h: "Interés y tipo de cuota", p: "El interés será del 0,8% por ciento, cuota fija." }
    ],
    requisitos: [
      "Ser un asociado hábil.",
      "Llevar como mínimo tres (3) meses de afiliación al Fondo de Empleados.",
      "Estar al día en los pagos de sus obligaciones.",
      "Demostrar solvencia económica.",
      "Garantías: libranza y pagaré con carta de instrucciones firmado.",
      "Amortización: por descuentos a través de la oficina de nómina para los asociados que sean trabajadores activos, o por caja, previa autorización del Comité de Crédito.",
      "Tener disponibilidad por nómina para realizar el descuento del crédito solicitado."
    ]
  },
  {
    archivo: "credito-de-confianza.html",
    titulo: "Crédito de confianza",
    entrada:
      "Aprobado por la Junta Directiva según tu capacidad de pago. Disponible desde el primer mes de afiliación.",
    resumen: [
      ["Interés por libranza", "1,6% sobre saldo"],
      ["Interés por caja", "1,8% sobre saldo"],
      ["Plazo máximo", "72 meses"]
    ],
    bloques: [
      {
        h: "Monto",
        p: "Estos créditos serán autorizados por la Junta Directiva, quien determinará la cuantía autorizada, previa verificación de los ingresos y capacidad de pago del solicitante."
      },
      { h: "Plazo", p: "El plazo máximo de los créditos de confianza será de hasta setenta y dos (72) meses." },
      {
        h: "Interés",
        lista: [
          "Por libranza, el interés de los créditos de confianza es del uno punto seis (1,6%) por ciento sobre el saldo.",
          "Para pago por caja es del uno punto ocho (1,8%) por ciento sobre saldo."
        ]
      }
    ],
    requisitos: [
      "Tener una antigüedad mínima de un (1) mes de afiliación, entendiéndose por tal la fecha en que se canceló la primera cuota de aporte.",
      "Tener disponibilidad por nómina para realizar el descuento del crédito solicitado.",
      "La amortización se hará por descuento a través de la oficina de nómina, o por caja, previa autorización de la Junta Directiva.",
      "Garantías: pagaré y carta de instrucciones debidamente firmado."
    ]
  },
  {
    archivo: "credito-de-consumo-por-bonos.html",
    titulo: "Crédito de consumo por bonos",
    entrada:
      "Para compra de mercancías a través de bonos, con cuantía máxima de 3 salarios mínimos mensuales legales vigentes.",
    resumen: [
      ["Interés", "2% sobre saldo"],
      ["Plazo máximo", "12 meses"],
      ["Cuantía máxima", "3 SMMLV"]
    ],
    bloques: [
      {
        h: "Cupo",
        p: "Estos créditos serán autorizados por el gerente de FONDEFOS, quien determinará la cuantía autorizada, previa verificación de los ingresos y capacidad de pago del solicitante. En todo caso, para créditos de consumo (mercancías) la cuantía máxima no podrá ser superior a 3 SMMLV."
      },
      { h: "Plazo", p: "El plazo máximo de los créditos de consumo por bonos será de doce (12) meses." },
      { h: "Interés", p: "El interés de los créditos de consumo por bonos es del dos (2%) por ciento sobre el saldo." }
    ],
    requisitos: [
      "Tener una antigüedad mínima de un (1) mes de afiliación, entendiéndose por tal la fecha en que se canceló la primera cuota de aporte.",
      "Tener disponibilidad por nómina para realizar el descuento del crédito solicitado.",
      "La amortización se hará por descuento a través de la oficina de nómina, o por caja, previa autorización de la Gerencia.",
      "Garantías: pagaré y carta de instrucciones debidamente firmada.",
      "Este crédito podrá solicitarse teniendo otro tipo de préstamos, siempre y cuando la totalidad de los créditos no supere el monto de los 70 salarios mínimos legales vigentes (SMMLV)."
    ]
  },
  {
    archivo: "credito-de-libre-inversion.html",
    titulo: "Crédito de libre inversión",
    entrada:
      "La línea de mayor cupo del fondo: hasta cinco veces tu capital ahorrado cuando el pago se hace por libranza.",
    resumen: [
      ["Cupo con libranza", "5× capital ahorrado"],
      ["Cupo por caja", "3× capital ahorrado"],
      ["Plazo máximo", "72 meses"]
    ],
    bloques: [
      {
        h: "Cupo",
        lista: [
          "Hasta cinco (5) veces el capital ahorrado cuando tenga garantía de libranza.",
          "Hasta tres (3) veces el capital ahorrado cuando el pago es realizado por caja.",
          "En todos los casos, ninguno de estos créditos podrá superar el tope máximo de 70 salarios mínimos mensuales legales vigentes."
        ]
      },
      { h: "Plazo", p: "Máximo setenta y dos (72) meses." },
      {
        h: "Interés",
        p: "El interés estará sujeto a las condiciones pactadas al inicio del otorgamiento del crédito.",
        lista: [
          "Con libranza: 1,6% cuota fija o variable.",
          "Créditos sin libranza: 1,8% cuota fija o variable."
        ]
      }
    ],
    requisitos: [
      "Ser un asociado hábil.",
      "Llevar como mínimo tres (3) meses de afiliación al Fondo de Empleados.",
      "Estar al día en los pagos de sus obligaciones con el Fondo de Empleados.",
      "Demostrar solvencia económica.",
      "Garantías: libranza y pagaré con carta de instrucciones firmado conjuntamente con codeudor(es).",
      "Tener disponibilidad por nómina para realizar el descuento del crédito solicitado."
    ]
  },
  {
    archivo: "credito-de-impuestos.html",
    titulo: "Crédito de impuestos",
    entrada:
      "Para cubrir obligaciones tributarias dentro del año, con la tasa más baja del fondo después de la línea educativa.",
    resumen: [
      ["Interés por libranza", "1,2% sobre saldo"],
      ["Interés por caja", "1,4% sobre saldo"],
      ["Plazo máximo", "12 meses"]
    ],
    bloques: [
      {
        h: "Monto",
        p: "Estos créditos serán autorizados por el gerente del Fondo, quien determinará la cuantía autorizada, previa verificación de los ingresos y capacidad de pago del solicitante."
      },
      { h: "Plazo", p: "El plazo máximo de los créditos de impuestos será de doce (12) meses." },
      {
        h: "Interés",
        p: "El interés de los créditos de impuestos es del uno punto dos (1,2%) por ciento sobre el saldo para pago con libranza. Para pago por caja será del uno punto cuatro por ciento (1,4%) sobre saldo."
      }
    ],
    requisitos: [
      "Tener una antigüedad mínima de un (1) mes de afiliación, entendiéndose por tal la fecha en que se canceló la primera cuota de aporte.",
      "Tener disponibilidad por nómina para realizar el descuento del crédito solicitado.",
      "La amortización se hará por descuento a través de la oficina de nómina, o por caja, previa autorización de la Gerencia del Fondo.",
      "Garantías: pagaré y carta de instrucciones debidamente firmada."
    ]
  },
  {
    archivo: "credito-de-recreacion-y-turismo.html",
    titulo: "Crédito de recreación y turismo",
    entrada:
      "Para viajes y planes de descanso con las agencias en convenio. Requiere cotización previa del prestador del servicio.",
    resumen: [
      ["Interés por libranza", "1,5% sobre saldo"],
      ["Interés por caja", "1,7% sobre saldo"],
      ["Plazo máximo", "36 meses"]
    ],
    bloques: [
      {
        h: "Monto",
        p: "Estos créditos serán autorizados por el gerente o comité de créditos de acuerdo con los montos que cada instancia pueda aprobar, quienes determinarán la cuantía autorizada, previa verificación de los ingresos y capacidad de pago del solicitante."
      },
      { h: "Plazo", p: "El plazo máximo de los créditos de recreación y turismo será de treinta y seis (36) meses." },
      {
        h: "Interés",
        p: "El interés de los créditos de recreación y turismo es del uno punto cinco (1,5%) por ciento sobre el saldo para pago con libranza. Para pago por caja el interés es de uno punto siete por ciento (1,7%) sobre el saldo."
      }
    ],
    requisitos: [
      "Tener una antigüedad mínima de un (1) mes de afiliación, entendiéndose por tal la fecha en que se canceló la primera cuota de aporte.",
      "Tener disponibilidad por nómina para realizar el descuento del crédito solicitado.",
      "La amortización se hará por descuento a través de la oficina de nómina, o por caja, previa autorización de la Gerencia del Fondo.",
      "Garantías: pagaré y carta de instrucciones debidamente firmada.",
      "Para la solicitud del crédito de turismo y recreación, el asociado deberá presentar cotización de la agencia o empresa que va a prestar el servicio."
    ]
  },
  {
    archivo: "credito-educativo.html",
    titulo: "Crédito educativo",
    entrada:
      "La tasa más baja del fondo, extendida al cónyuge y a los hijos en primer grado de consanguinidad.",
    resumen: [
      ["Interés", "1% sobre saldo"],
      ["Cuantía máxima", "6 a 12 SMMLV"],
      ["Plazo", "6 a 12 meses"]
    ],
    bloques: [
      {
        h: "Monto",
        lista: [
          "Para estudios de educación formal o informal, educación cooperativa y estudios universitarios: cuantía máxima de seis (6) salarios mínimos legales vigentes.",
          "Para estudios de especialización profesional: cuantía máxima de doce (12) salarios mínimos legales vigentes."
        ]
      },
      {
        h: "Plazo",
        lista: [
          "Para educación formal o informal, educación cooperativa y estudios universitarios: seis (6) meses.",
          "Para especialización profesional: doce (12) meses."
        ]
      },
      {
        h: "Interés",
        p: "Será del uno (1%) por ciento sobre el saldo, tanto para el asociado como para sus familiares en primer grado de consanguinidad (cónyuge e hijos)."
      }
    ],
    requisitos: [
      "Ser asociado hábil con antigüedad mínima de un (1) mes, estar al día en los pagos de aportes y demostrar solvencia económica.",
      "Libranza y pagaré con carta de instrucciones firmado conjuntamente con codeudor(es) que sea(n) preferiblemente asociado(s) hábil(es) o trabajador(es) con vínculo laboral, previa demostración de la solvencia económica. Cuando el valor prestado no sea superior al capital ahorrado, no se requerirá de codeudor(es) y podrá otorgarse mediante libranza.",
      "Amortización: por descuento a través de la oficina de nómina para los asociados que sean trabajadores activos, o por caja, previa autorización del Comité de Crédito.",
      "Tener disponibilidad por nómina para realizar el descuento del crédito solicitado."
    ]
  },
  {
    archivo: "creditos-de-tesoreria.html",
    titulo: "Créditos de tesorería",
    entrada:
      "Disponible desde el momento en que cancelás tu primera cuota de aporte social. Un solo crédito activo por esta línea.",
    resumen: [
      ["Interés", "2% sobre saldo"],
      ["Plazo máximo", "36 cuotas"],
      ["Monto", "15× la cuota mensual"]
    ],
    bloques: [
      {
        h: "Monto",
        p: "Hasta quince (15) veces el valor de la cuota aportada mensualmente por el asociado. Solo puede tenerse un crédito por esta línea."
      },
      { h: "Plazo", p: "El plazo máximo será de 36 cuotas." },
      {
        h: "Interés",
        p: "El interés para los créditos de tesorería será de dos (2%) por ciento sobre el saldo. Este tipo de crédito será otorgado por la Gerencia, previo diligenciamiento del formato de solicitud respectivo, y podrá otorgarse desde el mismo momento en que el solicitante haya cancelado la primera cuota de aporte social."
      }
    ],
    requisitos: [
      "Como condición para el otorgamiento del crédito de tesorería, la Gerencia deberá verificar que el asociado tenga disponibilidad por nómina para realizar el descuento del crédito solicitado."
    ]
  },
  {
    archivo: "tarjeta-express.html",
    titulo: "Tarjeta expréss",
    entrada:
      "Cupo rotativo de trámite rápido, con la misma tasa por libranza o por caja.",
    resumen: [
      ["Interés", "2% sobre saldo"],
      ["Plazo máximo", "24 meses"],
      ["Pago", "Libranza o caja"]
    ],
    bloques: [
      {
        h: "Monto",
        p: "Estos créditos serán autorizados por el gerente del Fondo, quien determinará la cuantía autorizada, previa verificación de los ingresos y capacidad de pago del solicitante."
      },
      { h: "Plazo", p: "El plazo máximo de los créditos de tarjeta expréss será de veinticuatro (24) meses." },
      {
        h: "Interés",
        p: "El interés de los créditos de tarjeta expréss es del dos (2%) por ciento sobre el saldo para pago con libranza o por caja."
      }
    ],
    requisitos: [
      "Tener una antigüedad mínima de un (1) mes de afiliación, entendiéndose por tal la fecha en que se canceló la primera cuota de aporte.",
      "Tener disponibilidad por nómina para realizar el descuento del crédito solicitado.",
      "La amortización se hará por descuento a través de la oficina de nómina, o por caja, previa autorización de la Gerencia del Fondo.",
      "Garantías: pagaré y carta de instrucciones debidamente firmado."
    ]
  }
];

export const PREGUNTAS = [
  [
    "¿Cuánto me descuentan por retirarme del fondo y qué tiempo demora la devolución del dinero?",
    "Sólo se descuenta $14.000. La devolución del dinero se realiza dos meses después de pasada la carta de retiro."
  ],
  ["¿La afiliación tiene algún costo?", "No, ninguno."],
  [
    "¿Qué documentos se requieren para la afiliación?",
    "Último desprendible de nómina, fotocopia de la cédula y certificación laboral (aplica para independientes)."
  ],
  [
    "¿Puedo retirar una parte de lo que tengo ahorrado?",
    "Sí, un porcentaje que se aplica al ahorro permanente. El trámite solo se puede hacer una vez al año."
  ],
  [
    "¿Cuánto tiempo debo tener de afiliado para hacer una solicitud de crédito?",
    "Después del primer mes de ahorro. Se puede tramitar la solicitud por la línea de crédito de tesorería."
  ],
  [
    "¿Puedo hacer abonos o la cancelación de la deuda en cualquier momento?",
    "Sí, se pueden hacer abonos parciales o la cancelación total de la deuda."
  ],
  [
    "Siendo empleado de cualquier empresa, ¿me puedo afiliar?",
    "Sí, siempre y cuando demuestre estabilidad laboral."
  ],
  [
    "Si tengo un crédito de libre inversión, ¿en cuánto tiempo puedo solicitar un crédito nuevo?",
    "Para hacer una nueva solicitud de crédito, según el reglamento, debo tener cancelado el 25% del monto inicial del crédito."
  ],
  ["¿En cuánto tiempo me puedo volver a afiliar?", "Tres meses después de pasada la carta de retiro."]
];

export const BENEFICIOS = [
  [
    "Fomenta el hábito del ahorro",
    "El Fondo de Empleados recibe directamente los aportes y ahorros de los asociados, convirtiéndolos en capital de trabajo. En FONDEFOS existen dos formas diferentes de ahorro y ambas brindan grandes beneficios al asociado."
  ],
  [
    "Crédito inmediato y con tasa baja",
    "El Fondo de Empleados otorga créditos a los integrantes con una tasa de interés muy baja y sin trámites engorrosos, protegiendo siempre el capital de todos los asociados mediante la aplicación del reglamento de crédito vigente."
  ],
  [
    "Administración de los propios asociados",
    "La administración es llevada por la Junta Directiva, conformada por asociados elegidos democráticamente en la asamblea general. Es decir, no hay personas externas."
  ],
  [
    "Protección social",
    "El Fondo de Empleados es una opción para la protección social: permite satisfacer necesidades en cuanto a servicios de salud, calamidad doméstica, seguridad social y gastos funerarios."
  ],
  [
    "Servicios para toda la familia",
    "Los integrantes y sus familias pueden gozar de servicios sociales tales como créditos para estudio, recreación y obtención de bienes y servicios, gracias a los convenios que se realizan con entidades comerciales."
  ],
  [
    "Los excedentes vuelven al asociado",
    "Los excedentes que se generan de esta actividad se reinvierten en el bienestar de los integrantes y, al mismo tiempo, contribuyen al patrimonio del fondo."
  ]
];

export const PRINCIPIOS = ["Honestidad", "Democracia", "Solidaridad", "Equidad", "Transparencia"];

export const NOTIFONDO = [1, 2, 3, 4, 5, 6, 7, 8].map((n) => ({
  n,
  archivo: `assets/images/fondefos.com.co/notifondo-web-${n}-819x1024-${
    {
      1: "d6a063db7d",
      2: "afc67e0c3e",
      3: "32b3fd5ffc",
      4: "e6da5c7238",
      5: "d85f16a967",
      6: "9fca35ab8e",
      7: "ba03ca86a2",
      8: "d797337280"
    }[n]
  }.webp`
}));

export const PORTADA_LAMINAS = [
  {
    src: "assets/images/fondefos.com.co/PLAN-100-NOVIEMBRE_11zon-768x960-9bf7cfe8ff.webp",
    alt: "Pieza de Fondefos: ganadores del ahorro Plan 100 de noviembre de 2025."
  },
  {
    src: "assets/images/fondefos.com.co/MERCAMIL-NOVIEMBRE_11zon-768x960-66de9a4dcc.webp",
    alt: "Pieza de Fondefos: sorteo Mercamil de noviembre."
  },
  {
    src: "assets/images/fondefos.com.co/P2-1-768x960-6f1468d4e0.png",
    alt: "Pieza de Fondefos: convocatoria a los asociados del fondo."
  },
  {
    src: "assets/images/fondefos.com.co/P2-2-768x960-304188c20a.png",
    alt: "Pieza de Fondefos: segunda convocatoria a los asociados del fondo."
  }
];
