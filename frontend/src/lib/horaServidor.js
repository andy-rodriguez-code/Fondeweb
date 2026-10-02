// horaServidor — la hora actual según el servidor del sitio, en milisegundos.
//
// Sirve para decidir por fecha sin depender del reloj de quien visita, que
// puede estar mal puesto. No hace falta un endpoint propio: toda respuesta HTTP
// trae la cabecera `Date` con la hora de quien responde, y al ser el mismo
// origen el navegador deja leerla.
//
// Se pide la portada con HEAD —solo cabeceras, sin cuerpo— y `no-store`, para
// que el navegador no conteste con una respuesta guardada, cuya fecha sería la
// del día en que se guardó.
//
// Si la consulta falla o la cabecera no viene, rechaza: quien llama decide qué
// hacer sin hora de servidor.

export default async function horaServidor() {
  const respuesta = await fetch('/', { method: 'HEAD', cache: 'no-store' })
  const hora = Date.parse(respuesta.headers.get('date') ?? '')
  if (Number.isNaN(hora)) throw new Error('La respuesta no trae la cabecera Date')
  return hora
}
