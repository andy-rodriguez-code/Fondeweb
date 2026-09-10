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

    const campos = data.campos || {};
    const cuota = Number(campos['cuota']) || 0;

    hoja.appendRow([
      data.fecha || new Date().toISOString(),
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

// El nombre de la propiedad es TOKEN_HOJA, igual que la constante de
// config.php: dos nombres para lo mismo es una invitación a que se
// desincronicen.
//
// Configuración del proyecto → Propiedades del script → Añadir propiedad.
// Nombre: TOKEN_HOJA · Valor: el mismo TOKEN_HOJA de config.php.
// El mismo valor en LOS DOS scripts.
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
      'Radicado',
      ...CAMPOS.map(function (c) { return c.etiqueta; }),
      'Total proyectado',
      'Autorización de datos',
      'Firma capturada',
    ]);
    hoja.getRange(1, 1, 1, CAMPOS.length + 5).setFontWeight('bold');
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
