// Política de tratamiento y protección de datos personales.
// Fuente: politica-de datos.md (raíz del proyecto). Los tres datos que el
// documento dejaba entre corchetes — dirección, teléfono y NIT — se tomaron
// del sitio en producción (fondefos.com.co/politica-de-datos, 2026-09-08).
//
// Cada sección lleva `id` para el índice lateral y el enlace directo. El
// contenido va en bloques tipados para que la página los componga sin
// interpretar markdown:
//   { p: '…' }              párrafo
//   { lista: [...] }        lista con viñetas
//   { pasos: [...] }        lista numerada
//   { termino, def }        definición (principios, datos de contacto)

export const politica = {
  titulo: 'Política de tratamiento y protección de datos personales',
  entidad: 'FONDEFOS – Fondo de Empleados',
  actualizacion: '3 de septiembre de 2026',
  resumen:
    'Cómo recolectamos, usamos y protegemos tus datos personales, y qué derechos tenés sobre ellos según la Ley 1581 de 2012.',

  // Datos del responsable, que la página muestra como tarjeta destacada.
  responsable: {
    nombre: 'FONDEFOS – Fondo de Empleados',
    nit: '800154767-3',
    direccion: 'Calle 155 A #23-09, Floridablanca, Santander',
    telefono: { etiqueta: '317 4357685', href: 'tel:+573174357685' },
    correo: {
      etiqueta: 'fondo.empleados@foscal.com.co',
      href: 'mailto:fondo.empleados@foscal.com.co',
    },
  },

  secciones: [
    {
      id: 'introduccion',
      titulo: 'Introducción',
      bloques: [
        { p: 'En FONDEFOS reconocemos la importancia de proteger la información personal de nuestros asociados, empleados, proveedores, usuarios, beneficiarios y demás personas que mantienen algún tipo de relación con nuestra organización.' },
        { p: 'Por esta razón, adoptamos la presente Política de Tratamiento y Protección de Datos Personales, mediante la cual establecemos los lineamientos aplicables a la recolección, almacenamiento, uso, circulación, actualización, conservación y, cuando corresponda, supresión de los datos personales.' },
        { p: 'Esta política se desarrolla de conformidad con el artículo 15 de la Constitución Política de Colombia, la Ley Estatutaria 1581 de 2012, el Decreto 1377 de 2013, las disposiciones actualmente incorporadas al Decreto 1074 de 2015 y demás normas que las modifiquen, adicionen o complementen.' },
      ],
    },
    {
      id: 'responsable',
      titulo: 'Responsable del tratamiento',
      destacaResponsable: true,
      bloques: [
        { p: 'FONDEFOS, en calidad de responsable del tratamiento de datos personales, se compromete a garantizar el adecuado manejo de la información bajo los principios establecidos en la legislación colombiana.' },
      ],
    },
    {
      id: 'objetivo',
      titulo: 'Objetivo',
      bloques: [
        { p: 'La presente política tiene como objetivo establecer los criterios y procedimientos mediante los cuales FONDEFOS realiza el tratamiento de los datos personales, garantizando los derechos de los titulares y el adecuado manejo de la información.' },
        { p: 'FONDEFOS implementará las medidas necesarias para proteger la información contra pérdida, acceso no autorizado, adulteración, uso indebido, divulgación o cualquier tratamiento que no corresponda con las finalidades autorizadas o permitidas por la ley.' },
      ],
    },
    {
      id: 'alcance',
      titulo: 'Alcance',
      bloques: [
        { p: 'Esta política aplica a todos los datos personales registrados en las bases de datos físicas o digitales que sean objeto de tratamiento por parte de FONDEFOS.' },
        { p: 'Comprende la información de asociados, aspirantes, empleados, exempleados, beneficiarios, proveedores, contratistas, usuarios, visitantes y demás personas naturales cuyos datos sean tratados por FONDEFOS.' },
      ],
    },
    {
      id: 'datos',
      titulo: 'Datos personales que podrán ser tratados',
      bloques: [
        { p: 'Dependiendo de la relación existente con FONDEFOS y de las finalidades correspondientes, podrán ser tratados datos tales como:' },
        {
          lista: [
            'Nombres y apellidos.',
            'Número y tipo de documento de identificación.',
            'Datos de contacto.',
            'Dirección de residencia.',
            'Correo electrónico.',
            'Número telefónico y celular.',
            'Información laboral.',
            'Información relacionada con la vinculación como asociado.',
            'Información financiera y transaccional cuando sea necesaria para la prestación de los servicios de FONDEFOS.',
            'Información relacionada con beneficiarios.',
            'Información necesaria para la gestión administrativa, contractual y legal.',
            'Otros datos que sean necesarios para el desarrollo de las actividades propias de FONDEFOS y que sean tratados conforme a la legislación vigente.',
          ],
        },
        { p: 'FONDEFOS recolectará únicamente aquellos datos que resulten pertinentes, adecuados y necesarios para las finalidades informadas al titular.' },
      ],
    },
    {
      id: 'finalidades',
      titulo: 'Finalidades del tratamiento',
      bloques: [
        { p: 'Los datos personales podrán ser tratados por FONDEFOS para las siguientes finalidades:' },
        {
          pasos: [
            'Gestionar la vinculación, permanencia y retiro de asociados.',
            'Administrar los servicios, beneficios y programas ofrecidos por FONDEFOS.',
            'Gestionar solicitudes, consultas, peticiones, quejas y reclamos.',
            'Mantener actualizada la información de los asociados y usuarios.',
            'Realizar procesos administrativos, contables, financieros y operativos.',
            'Gestionar productos, servicios, créditos, ahorros, aportes y demás actividades propias del Fondo, cuando corresponda.',
            'Contactar a los titulares a través de correo electrónico, teléfono, mensajes de texto, WhatsApp u otros canales autorizados.',
            'Informar sobre actividades, programas, beneficios, campañas y servicios de FONDEFOS.',
            'Gestionar información de beneficiarios y personas relacionadas con los asociados.',
            'Cumplir obligaciones legales, reglamentarias, contractuales y administrativas.',
            'Atender requerimientos de autoridades competentes.',
            'Prevenir y detectar posibles situaciones de fraude, suplantación o uso indebido de los servicios.',
            'Realizar procesos de seguridad, control y gestión de riesgos.',
            'Elaborar estadísticas e informes internos utilizando la información de acuerdo con las disposiciones legales aplicables.',
            'Gestionar actividades relacionadas con la comunicación institucional y el relacionamiento con los asociados.',
            'Cumplir cualquier otra finalidad legítima que haya sido informada al titular y para la cual se cuente con la autorización correspondiente, cuando esta sea necesaria.',
          ],
        },
      ],
    },
    {
      id: 'principios',
      titulo: 'Principios para el tratamiento de datos',
      bloques: [
        { p: 'FONDEFOS aplicará los principios establecidos en la legislación colombiana sobre protección de datos personales, especialmente:' },
        {
          definiciones: [
            { termino: 'Legalidad', def: 'El tratamiento se realizará conforme a las disposiciones legales vigentes.' },
            { termino: 'Finalidad', def: 'Los datos serán utilizados para finalidades legítimas, determinadas y previamente informadas.' },
            { termino: 'Libertad', def: 'El tratamiento se realizará, cuando sea necesario, con autorización previa, expresa e informada del titular, salvo las excepciones establecidas por la ley.' },
            { termino: 'Veracidad', def: 'FONDEFOS procurará que la información sea completa, exacta, actualizada y verificable.' },
            { termino: 'Transparencia', def: 'El titular podrá conocer, cuando corresponda, la existencia y el tratamiento de sus datos personales.' },
            { termino: 'Acceso restringido', def: 'Los datos personales no estarán disponibles para cualquier persona y su acceso estará limitado de acuerdo con las funciones y autorizaciones correspondientes.' },
            { termino: 'Seguridad', def: 'FONDEFOS implementará medidas de seguridad razonables para proteger la información.' },
            { termino: 'Confidencialidad', def: 'Las personas que intervengan en el tratamiento de datos personales deberán mantener la reserva de la información.' },
          ],
        },
      ],
    },
    {
      id: 'derechos',
      titulo: 'Derechos de los titulares',
      destacada: true,
      bloques: [
        { p: 'De acuerdo con la Ley 1581 de 2012, los titulares de los datos personales tienen derecho a:' },
        {
          pasos: [
            'Conocer, actualizar y rectificar sus datos personales.',
            'Solicitar información sobre el uso que se ha dado a sus datos.',
            'Solicitar prueba de la autorización otorgada para el tratamiento, cuando esta sea requerida.',
            'Presentar consultas y reclamos relacionados con el tratamiento de sus datos.',
            'Solicitar la supresión de sus datos cuando corresponda.',
            'Revocar la autorización otorgada para el tratamiento, cuando sea procedente.',
            'Acceder gratuitamente a sus datos personales objeto de tratamiento.',
            'Presentar ante la Superintendencia de Industria y Comercio las quejas que considere pertinentes cuando exista un presunto incumplimiento de las normas de protección de datos.',
          ],
        },
        { p: 'Estos derechos estarán sujetos a las excepciones y limitaciones establecidas por la legislación vigente.' },
      ],
    },
    {
      id: 'autorizacion',
      titulo: 'Autorización para el tratamiento',
      bloques: [
        { p: 'FONDEFOS solicitará la autorización del titular para el tratamiento de sus datos personales cuando esta sea necesaria de acuerdo con la legislación vigente.' },
        { p: 'La autorización podrá obtenerse mediante diferentes mecanismos, incluyendo formularios físicos o electrónicos, plataformas digitales, páginas web, aplicaciones, comunicaciones u otros medios que permitan acreditar la autorización.' },
        { p: 'Al otorgar su autorización, el titular podrá ser informado sobre las finalidades para las cuales serán tratados sus datos y sobre la forma de ejercer sus derechos.' },
      ],
    },
    {
      id: 'datos-sensibles',
      titulo: 'Datos sensibles',
      bloques: [
        { p: 'FONDEFOS reconoce que determinados datos personales tienen la condición de datos sensibles y, por tanto, requieren una protección especial.' },
        { p: 'Cuando resulte necesario realizar el tratamiento de datos sensibles, FONDEFOS aplicará las medidas y garantías establecidas por la legislación vigente y solicitará la autorización correspondiente cuando sea exigible.' },
        { p: 'El titular no estará obligado a autorizar el tratamiento de datos sensibles, salvo en los casos expresamente permitidos o establecidos por la ley.' },
      ],
    },
    {
      id: 'menores',
      titulo: 'Datos de niños, niñas y adolescentes',
      bloques: [
        { p: 'FONDEFOS evitará el tratamiento de datos personales de niños, niñas y adolescentes, salvo cuando dicho tratamiento sea necesario, permitido por la legislación aplicable y se respeten sus derechos fundamentales y las garantías establecidas para su protección.' },
        { p: 'Cuando corresponda, se tendrán en cuenta las autorizaciones y condiciones exigidas por la normativa vigente.' },
      ],
    },
    {
      id: 'seguridad',
      titulo: 'Seguridad de la información',
      bloques: [
        { p: 'FONDEFOS adoptará medidas técnicas, administrativas y organizacionales razonables destinadas a proteger los datos personales frente a pérdida, alteración, acceso, uso, divulgación o tratamiento no autorizado.' },
        { p: 'El acceso a la información estará restringido a las personas que, por sus funciones o responsabilidades, requieran conocerla.' },
        { p: 'No obstante, el titular reconoce que ningún sistema de información puede garantizar seguridad absoluta frente a todos los riesgos existentes.' },
      ],
    },
    {
      id: 'encargados',
      titulo: 'Encargados del tratamiento',
      bloques: [
        { p: 'FONDEFOS podrá contratar terceros que actúen como encargados del tratamiento de datos personales, cuando sea necesario para el desarrollo de sus actividades.' },
        { p: 'En estos casos, FONDEFOS procurará establecer las condiciones contractuales y de seguridad necesarias para garantizar que los datos sean tratados de acuerdo con las finalidades autorizadas y con las disposiciones legales aplicables.' },
      ],
    },
    {
      id: 'transferencia',
      titulo: 'Transferencia y transmisión de datos',
      bloques: [
        { p: 'Cuando sea necesario para el desarrollo de sus actividades, FONDEFOS podrá realizar transmisiones o transferencias de datos personales a terceros, proveedores, aliados o encargados del tratamiento, siempre que exista una finalidad legítima y se cumplan las condiciones establecidas por la legislación colombiana.' },
        { p: 'Cuando corresponda realizar transferencias internacionales de datos personales, FONDEFOS observará las restricciones, requisitos y excepciones establecidas por la legislación vigente.' },
      ],
    },
    {
      id: 'conservacion',
      titulo: 'Conservación de los datos',
      bloques: [
        { p: 'Los datos personales serán conservados durante el tiempo que resulte necesario para cumplir las finalidades para las cuales fueron recolectados, atender obligaciones legales, contractuales, administrativas o ejercer los derechos correspondientes.' },
        { p: 'Una vez cumplidas las finalidades y obligaciones aplicables, FONDEFOS podrá proceder con la supresión, anonimización o conservación de la información cuando exista un deber legal o una razón legítima para mantenerla.' },
      ],
    },
    {
      id: 'procedimiento',
      titulo: 'Procedimiento para ejercer los derechos',
      bloques: [
        { p: 'El titular o quien esté legalmente autorizado podrá presentar consultas o reclamos relacionados con sus datos personales mediante comunicación dirigida al correo fondo.empleados@foscal.com.co.' },
        { p: 'La solicitud deberá permitir identificar al titular y, cuando corresponda, contener la descripción clara de la consulta, reclamo o solicitud.' },
        { p: 'Cuando una persona actúe en representación del titular, deberá acreditar dicha representación de acuerdo con las condiciones aplicables.' },
        { p: 'FONDEFOS dará trámite a las solicitudes dentro de los términos establecidos por la legislación colombiana.' },
      ],
    },
    {
      id: 'consultas',
      titulo: 'Consultas',
      bloques: [
        { p: 'Los titulares podrán solicitar información sobre los datos personales que FONDEFOS tenga registrados y sobre el tratamiento que se esté realizando de los mismos.' },
        { p: 'Las consultas serán atendidas de acuerdo con los términos y procedimientos establecidos en la normativa vigente.' },
      ],
    },
    {
      id: 'reclamos',
      titulo: 'Reclamos',
      bloques: [
        { p: 'El titular que considere que la información registrada por FONDEFOS debe ser corregida, actualizada, rectificada, suprimida o cuyo tratamiento deba ser revisado podrá presentar el respectivo reclamo.' },
        { p: 'El reclamo deberá contener la información necesaria para identificar al titular, describir los hechos que dan lugar a la solicitud y señalar la petición correspondiente.' },
        { p: 'FONDEFOS dará respuesta dentro de los términos establecidos por la legislación vigente.' },
      ],
    },
    {
      id: 'vigencia',
      titulo: 'Vigencia de la política',
      bloques: [
        { p: 'La presente Política de Tratamiento y Protección de Datos Personales entra en vigencia a partir de su publicación y permanecerá vigente mientras FONDEFOS realice actividades de tratamiento de datos personales.' },
        { p: 'FONDEFOS podrá modificar, actualizar o complementar esta política cuando sea necesario para adaptarla a cambios normativos, tecnológicos, administrativos o a las necesidades de la organización.' },
        { p: 'Cualquier modificación relevante será comunicada a través de los medios que FONDEFOS considere adecuados.' },
      ],
    },
    {
      id: 'contacto',
      titulo: 'Contacto',
      destacaResponsable: true,
      bloques: [
        { p: 'Para ejercer sus derechos, presentar consultas o reclamos, o solicitar información relacionada con el tratamiento de sus datos personales, puede comunicarse con FONDEFOS a través de:' },
      ],
    },
  ],

  cierre: {
    titulo: 'Nuestro compromiso',
    destacado: 'En FONDEFOS protegemos tu información porque tu confianza también hace parte de nuestro compromiso.',
    texto: 'Trabajamos para que tus datos personales sean tratados de manera responsable, segura y transparente, respetando los derechos que la legislación colombiana te reconoce.',
  },
}

export default politica
