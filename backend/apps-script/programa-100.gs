// Apps Script de la hoja de cálculo "Programa 100".
//
// Va en SU PROPIO archivo de Google Sheets, con su propio encabezado y su
// propia URL /exec. El de Contáctenos es otro script en otra hoja.
//
// INSTALACIÓN
//   1. En la hoja: Extensiones → Apps Script. Borrar Código.gs y pegar esto.
//   2. Configuración del proyecto → Propiedades del script → agregar TOKEN,
//      con el mismo valor que TOKEN_HOJA en config.php.
//   3. Implementar → Nueva implementación → Aplicación web
//        · Ejecutar como: Yo
//        · Quién tiene acceso: Cualquier usuario
//   4. Copiar la URL /exec a URLS_APPS_SCRIPT['programa-100'] en config.php.
//
// Cada vez que se edite este archivo hay que crear una implementación NUEVA, o
// la URL sigue sirviendo el código viejo.

// Las claves son los `id` de los campos tal como los manda enviar.php.
//
// `expedicion` y `grupo` van primeros y no estaban en la lista original: el
// formulario los envía y sin ellos esas dos columnas nunca aparecerían.
// `acepta-terminos` se agrega aparte, después del último campo del formato.
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
];

// Los 12 meses del programa. El total se calcula acá y no se guarda, igual que
// en la página: así la hoja no puede quedar en desacuerdo con la cuota.
const MESES = 12;

function doPost(e) {
  const bloqueo = LockService.getScriptLock();
  bloqueo.waitLock(30000);

  try {
    const data = JSON.parse(e.postData.contents);

    if (data.token !== PropertiesService.getScriptProperties().getProperty('TOKEN')) {
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
      cuota * MESES,
      campos['acepta-terminos'] != null ? campos['acepta-terminos'] : 'No',
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

function asegurarCabeceras(hoja) {
  if (hoja.getLastRow() === 0) {
    hoja.appendRow([
      'Fecha',
      'Radicado',
      ...CAMPOS.map(function (c) { return c.etiqueta; }),
      'Total proyectado',
      'Acepta términos',
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

// `ok` en vez de `success`: es lo que enviar.php verifica para decidir si el
// envío quedó pendiente de reintento.
function respuesta(exito, mensaje) {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: exito, mensaje: mensaje }))
    .setMimeType(ContentService.MimeType.JSON);
}
