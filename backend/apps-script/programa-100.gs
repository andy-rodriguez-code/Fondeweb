// Apps Script de la hoja de cálculo "Programa 100".
//
// Va en SU PROPIO archivo de Google Sheets, con su propio encabezado y su
// propia URL /exec. El de Contáctenos es otro script en otra hoja.
//
// INSTALACIÓN
//   1. En la hoja: Extensiones → Apps Script. Borrar Código.gs y pegar esto.
//   2. Configuración del proyecto → Propiedades del script → agregar
//      TOKEN_HOJA, con el mismo valor que la constante del mismo nombre en
//      config.php.
//   3. Implementar → Nueva implementación → Aplicación web
//        · Ejecutar como: Yo
//        · Quién tiene acceso: Cualquier usuario
//   4. Copiar la URL /exec a URLS_APPS_SCRIPT['programa-100'] en config.php.
//
// Cada vez que se edite este archivo hay que crear una implementación NUEVA, o
// la URL sigue sirviendo el código viejo.

// Las claves son los `id` de los campos tal como los manda enviar.php.
//
// `expedicion` y `grupo` van primeros: el formulario los envía y sin ellos
// esas dos columnas nunca aparecerían.
//
// `acepta-terminos` va como un campo más de la lista y no aparte: es un dato
// que llega dentro de `campos` como cualquier otro, y tenerlo en dos lugares
// distintos era pedir que un día se desincronizaran.
const CAMPOS = [
  { clave: 'expedicion',         etiqueta: 'Fecha de expedición' },
  { clave: 'grupo',              etiqueta: 'Grupo' },
  { clave: 'nombre',             etiqueta: 'Nombre del ahorrador' },
  { clave: 'tipo-documento',     etiqueta: 'Tipo de documento' },
  { clave: 'documento',          etiqueta: 'Número de identificación' },
  { clave: 'direccion',          etiqueta: 'Dirección' },
  { clave: 'telefono',           etiqueta: 'Teléfono' },
  { clave: 'ciudad',             etiqueta: 'Ciudad' },
  { clave: 'cuota',              etiqueta: 'Cuota mensual' },
  { clave: 'ben-nombre',         etiqueta: 'Beneficiario' },
  { clave: 'ben-tipo-documento', etiqueta: 'Beneficiario — tipo doc.' },
  { clave: 'ben-documento',      etiqueta: 'Beneficiario — documento' },
  { clave: 'ben-direccion',      etiqueta: 'Beneficiario — dirección' },
  { clave: 'ben-telefono',       etiqueta: 'Beneficiario — teléfono' },
  { clave: 'ben-ciudad',         etiqueta: 'Beneficiario — ciudad' },
  { clave: 'acepta-terminos',    etiqueta: 'Aceptó los términos' },
];

// Los 12 meses del programa. El total se calcula acá y no se guarda, igual que
// en la página: así la hoja no puede quedar en desacuerdo con la cuota.
const MESES = 12;

// En qué columna queda el radicado. Es la tercera por el orden del appendRow:
// Fecha, Hora, Radicado. Si algún día se agrega una columna antes, hay que
// mover este número o la comprobación de duplicados deja de ver nada.
const COLUMNA_RADICADO = 3;

function doPost(e) {
  const bloqueo = LockService.getScriptLock();
  bloqueo.waitLock(30000);

  try {
    const data = JSON.parse(e.postData.contents);

    if (!tokenValido(data.token)) {
      return respuesta(false, 'token_invalido');
    }

    // getSheets()[0] y no getActiveSheet(): en una llamada por webhook no hay
    // "hoja activa" y el resultado depende de en qué pestaña quedó parado el
    // último que abrió el archivo.
    const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    asegurarCabeceras(hoja);

    // El radicado es la identidad del envío y llega igual en cada reintento.
    // Si ya está en la hoja, esta llamada es un reintento de algo que sí se
    // escribió y lo único correcto es no escribirlo otra vez.
    const radicado = String(data.radicado || '');
    if (yaEstaEscrito(hoja, radicado)) {
      // `true` a propósito: para el backend esto es un éxito. Devolver falso
      // dejaría el envío marcado como pendiente y lo traería de vuelta cada
      // minuto para siempre, que es justo lo que estamos cerrando.
      return respuesta(true, 'duplicado_ignorado');
    }

    // `data.fecha` llega en ISO 8601 con desfase (2026-09-10T04:08:04-05:00).
    // Sin el desfase, new Date() la interpretaría en la zona del script y la
    // hora saldría corrida sin que nadie lo note.
    const momento = data.fecha ? new Date(data.fecha) : new Date();
    const campos = data.campos || {};
    const cuota = Number(campos['cuota']) || 0;

    hoja.appendRow([
      formatoFecha(momento),
      formatoHora(momento),
      data.radicado || '',
      ...CAMPOS.map(function (c) { return campos[c.clave] != null ? campos[c.clave] : ''; }),
      // Derivada, no un campo del formulario. Si no la querés, borrá esta
      // línea y su encabezado: no rompe nada más.
      cuota * MESES,
      formatoSiNo(data.autoriza),
      formatoSiNo(data.firma),
    ]);

    return respuesta(true, 'ok');
  } catch (err) {
    return respuesta(false, 'error_interno: ' + err.message);
  } finally {
    bloqueo.releaseLock();
  }
}

/**
 * ¿Este radicado ya tiene su fila en la hoja?
 *
 * Esto es lo que hace que reenviar sea inofensivo, y hace falta porque el
 * backend no puede saber si escribimos. Manda la fila por HTTP y espera la
 * respuesta; si la respuesta se pierde en el camino —se agota el tiempo, se
 * cae la conexión, Google devuelve un error transitorio— él lee "no se
 * escribió" cuando en realidad sí se escribió, deja el envío en la cola y lo
 * vuelve a mandar. Así aparecieron cuatro filas idénticas del mismo radicado
 * en producción.
 *
 * Eso no se arregla del lado que manda: sobre HTTP nadie puede garantizar
 * "exactamente una vez". Se arregla acá, que es el único lugar que sabe la
 * verdad. Mientras el que recibe sea idempotente, el backend puede reintentar
 * las veces que necesite y la hoja queda igual.
 *
 * Va DENTRO del LockService del doPost a propósito: mirar y escribir tienen
 * que ser un solo paso, o dos llamadas simultáneas del mismo radicado miran
 * las dos, no ven nada, y las dos escriben.
 *
 * Se recorre de abajo hacia arriba porque un reintento es siempre de algo
 * reciente: en una hoja con miles de filas encuentra a la primera.
 */
function yaEstaEscrito(hoja, radicado) {
  // Sin radicado no hay con qué comparar. Es preferible una fila de más que
  // descartar en silencio un envío real.
  if (!radicado) return false;

  const ultima = hoja.getLastRow();
  // 1 es solo el encabezado; 0 es una hoja recién creada.
  if (ultima < 2) return false;

  // Una sola lectura de la columna entera. Leer celda por celda son miles de
  // llamadas al servicio y revienta la cuota antes que el tiempo.
  const columna = hoja.getRange(2, COLUMNA_RADICADO, ultima - 1, 1).getValues();

  for (let i = columna.length - 1; i >= 0; i--) {
    if (String(columna[i][0]).trim() === radicado) return true;
  }

  return false;
}

// El nombre de la propiedad es TOKEN_HOJA, igual que la constante de
// config.php: dos nombres para lo mismo es una invitación a que se
// desincronicen.
//
// Configuración del proyecto → Propiedades del script → Añadir propiedad.
// Nombre: TOKEN_HOJA · Valor: el mismo TOKEN_HOJA de config.php.
// El mismo valor en LOS DOS scripts.
// Formato colombiano y zona fija: el servidor puede estar en UTC —en cPanel
// suele estarlo— y la hoja tiene que mostrar la hora de Floridablanca.
function formatoFecha(fecha) {
  return Utilities.formatDate(fecha, 'America/Bogota', 'dd/MM/yyyy');
}

function formatoHora(fecha) {
  return Utilities.formatDate(fecha, 'America/Bogota', 'hh:mm a').toLowerCase();
}

function tokenValido(recibido) {
  const esperado = PropertiesService.getScriptProperties().getProperty('TOKEN_HOJA');
  // El `esperado &&` importa: sin la propiedad configurada, un payload sin
  // token cumpliría `undefined === undefined` y entraría cualquiera.
  return Boolean(esperado) && recibido === esperado;
}

function asegurarCabeceras(hoja) {
  if (hoja.getLastRow() === 0) {
    hoja.appendRow([
      'Fecha',
      'Hora',
      'Radicado',
      ...CAMPOS.map(function (c) { return c.etiqueta; }),
      'Total proyectado',
      'Autorización de datos',
      'Firma capturada',
    ]);
    hoja.getRange(1, 1, 1, CAMPOS.length + 6).setFontWeight('bold');
    hoja.setFrozenRows(1);
  }
}

// `data.firma` llega como booleano desde enviar.php. Comparar contra `true` a
// secas fallaba cuando el backend mandaba la imagen en base64: una cadena de
// 60 KB no es === true, así que un formulario firmado salía "No".
function formatoSiNo(valor) {
  if (valor === true || valor === 1 || valor === 'true') return 'Sí';
  if (typeof valor === 'string' && valor !== '' && valor !== 'false') return 'Sí';
  return 'No';
}

// Se devuelven las DOS claves, `ok` y `success`, a propósito. El backend
// verifica una de ellas para decidir si el envío quedó pendiente de reintento;
// si el script devolviera solo la que el backend no mira, toda escritura
// exitosa se leería como fallida y el cron reenviaría la misma fila cada 15
// minutos, para siempre.
function respuesta(exito, mensaje) {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: exito, success: exito, mensaje: mensaje }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ---------------------------------------------------------------------------
// Prueba manual desde el editor de Apps Script: elegir `pruebaEnvio` en el
// desplegable de funciones y darle a Ejecutar. Escribe una fila real en la
// hoja; borrarla después.
//
// El token se lee de la propiedad, no se pega acá: si te olvidás de crearla,
// esta prueba falla con token_invalido y te enterás antes de publicar.
// ---------------------------------------------------------------------------
function pruebaEnvio() {
  const falso = {
    postData: {
      contents: JSON.stringify({
        token: PropertiesService.getScriptProperties().getProperty('TOKEN_HOJA'),
        fecha: new Date().toISOString(),
        radicado: 'P100-PRUEBA-0001',
        autoriza: true,
        firma: true,
        campos: {
          expedicion: '2026-09-09',
          grupo: 'A1',
          nombre: 'Juan Pérez',
          'tipo-documento': 'CC',
          documento: '1098765432',
          direccion: 'Calle 155 A #23-09',
          telefono: '3001234567',
          ciudad: 'Floridablanca',
          cuota: '30000',
          'ben-nombre': 'María Pérez',
          'ben-tipo-documento': 'TI',
          'ben-documento': '1102334455',
          'ben-direccion': 'Calle 155 A #23-09',
          'ben-telefono': '3181112222',
          'ben-ciudad': 'Floridablanca',
          'acepta-terminos': 'Sí',
        },
      }),
    },
  };
  Logger.log(doPost(falso).getContent());
}
