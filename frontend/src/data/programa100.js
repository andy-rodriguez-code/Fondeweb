// Programa 100 de ahorro voluntario — literales y estructura del formulario
// de inscripción. Fuente: el formato entregado por el cliente (code.html en la
// raíz del proyecto, maqueta suelta en Tailwind CDN). Acá se conserva el
// contenido — grupos, campos, orden y los ocho términos, verbatim — y se deja
// fuera su paleta: la página se dibuja con los tokens del sitio.
//
// Los campos se declaran como datos para que agregar o mover uno sea editar
// esta lista y no la vista. `col` es el ancho en la rejilla de 12 columnas de
// escritorio; en teléfono todos ocupan el ancho completo.

// Reglas del programa, tomadas de los términos: doce cuotas mensuales y un
// sorteo de $100.000. El total proyectado se calcula con MESES, no se escribe
// a mano, para que cuota y total nunca queden en desacuerdo.
export const MESES = 12
export const SORTEO = 100000

export const grupos = [
  {
    id: 'ahorrador',
    titulo: 'Datos del ahorrador principal',
    icono: 'usuario',
    campos: [
      { id: 'nombre', etiqueta: 'Nombres y apellidos del ahorrador', tipo: 'text', col: 7, requerido: true, autoComplete: 'name', error: 'Escribí el nombre completo del ahorrador.' },
      { id: 'tipo-documento', etiqueta: 'Tipo', tipo: 'select', col: 2, opciones: ['CC', 'CE', 'NIT'] },
      { id: 'documento', etiqueta: 'Número de identificación', tipo: 'text', col: 3, requerido: true, inputMode: 'numeric', error: 'Escribí el número de identificación.' },
      { id: 'direccion', etiqueta: 'Dirección', tipo: 'text', col: 6, autoComplete: 'street-address' },
      { id: 'telefono', etiqueta: 'Teléfono', tipo: 'tel', col: 3, requerido: true, autoComplete: 'tel', error: 'Escribí un teléfono de contacto.' },
      { id: 'ciudad', etiqueta: 'Ciudad', tipo: 'text', col: 3, autoComplete: 'address-level2' },
    ],
  },
  {
    id: 'beneficiario',
    titulo: 'Beneficiario',
    nota: 'Opcional',
    icono: 'alianza',
    campos: [
      { id: 'ben-nombre', etiqueta: 'Nombres y apellidos del beneficiario', tipo: 'text', col: 7 },
      { id: 'ben-tipo-documento', etiqueta: 'Tipo', tipo: 'select', col: 2, opciones: ['CC', 'CE', 'TI', 'RC'] },
      { id: 'ben-documento', etiqueta: 'Número de identificación', tipo: 'text', col: 3, inputMode: 'numeric' },
      { id: 'ben-direccion', etiqueta: 'Dirección', tipo: 'text', col: 6 },
      { id: 'ben-telefono', etiqueta: 'Teléfono', tipo: 'tel', col: 3 },
      { id: 'ben-ciudad', etiqueta: 'Ciudad', tipo: 'text', col: 3 },
    ],
  },
]

export const terminos = [
  'El periodo del ahorro será de 12 meses, al final de los cuales se reintegrarán a cada ahorrador la suma de $360.000.',
  'El sorteo de los $100.000 se efectuará el séptimo día hábil de cada mes, en las instalaciones del Complejo Médico FOSCAL en presencia del Revisor Fiscal, un directivo de la FOSCAL, un invitado socio y un miembro del comité de Control Social; se elaborará un acta con las firmas de los invitados para avalar el sorteo.',
  'El valor total de ahorro se cancelará una vez cumplidos los doce (12) meses. Si el ahorrador se retira antes de los seis (6) meses perderá lo ahorrado hasta ese momento, y dicho valor hará parte de otros ingresos de FONDEFOS; si se retira entre los seis (6) y nueve (9) meses perderá el 50% de lo ahorrado.',
  'El poseedor del ahorro voluntario puede cederlo a un tercero previo aviso a FONDEFOS, y el sorteo, si llegase a ganar, será para el nuevo ahorrador.',
  'El ahorrador, para tener derecho a participar en el sorteo, deberá estar al día con las cuotas a más tardar el día anterior al sorteo.',
  'El ahorrador que esté atrasado más de tres meses en su cuota de ahorro perderá el valor del monto ahorrado, previa cancelación a favor de FONDEFOS.',
  'El ahorrador tiene derecho a un seguro por el valor total ahorrado en el año en caso de fallecimiento; este valor será reembolsado al beneficiario.',
  'En caso de retiro forzoso de la institución donde labora, el ahorrador podrá ceder el ahorro voluntario a un tercero o cederlo a FONDEFOS. En este caso FONDEFOS descontará el valor correspondiente a una cuota y el valor restante se reintegrará.',
]

// Las dos firmas que el formato trae ya impresas: no las diligencia quien se
// inscribe, las pone FONDEFOS al recibir el formulario.
export const firmasFondo = ['Firma presidente', 'Firma gerente']

export const programa100 = {
  titulo: 'Programa 100 de ahorro voluntario',
  entrada: 'Ahorrá una cuota fija durante doce meses, participá cada mes en el sorteo de $100.000 y recibí todo lo ahorrado al cumplir el año. Diligenciá el formulario de inscripción y llevalo a la oficina de FONDEFOS.',
  formulario: {
    titulo: 'Formulario de inscripción',
    // El formato no pide correo, así que no hay acuse de recibo posible para
    // quien se inscribe: el radicado en pantalla es toda su constancia.
    aviso: {
      antes: 'Listo. Registramos tu inscripción con el radicado ',
      despues: '. Guardalo: es tu constancia mientras FONDEFOS procesa el formato.',
    },
    enviar: 'Guardar registro',
    enviando: 'Enviando…',
    limpiarFirma: 'Limpiar firma',
    firmaVacia: 'Tocá o arrastrá para firmar',
    firmaError: 'Hace falta la firma del ahorrador.',
    aceptaError: 'Tenés que aceptar los términos para continuar.',
    autorizaError: 'Tenés que autorizar el tratamiento de datos para continuar.',
    firmaRegistrada: 'Firma digital registrada',
  },
}
