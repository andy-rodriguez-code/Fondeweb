// Apps Script de la hoja de cálculo "Contáctenos".
//
// Va en SU PROPIO archivo de Google Sheets, con su propio encabezado y su
// propia URL /exec. El del Programa 100 es otro script en otra hoja.
//
// INSTALACIÓN
//   1. En la hoja: Extensiones → Apps Script. Borrar Código.gs y pegar esto.
//   2. Configuración del proyecto → Propiedades del script → agregar
//      TOKEN_HOJA, con el mismo valor que la constante del mismo nombre en
//      config.php.
//   3. Implementar → Nueva implementación → Aplicación web
//        · Ejecutar como: Yo
//        · Quién tiene acceso: Cualquier usuario
//   4. Copiar la URL /exec a URLS_APPS_SCRIPT['contacto'] en config.php.
//
// Cada vez que se edite este archivo hay que crear una implementación NUEVA, o
// la URL sigue sirviendo el código viejo. Es la causa número uno de "cambié el
// script y no pasó nada".

// Las claves son los `id` de los campos tal como los manda enviar.php, no sus
// etiquetas: la etiqueta es texto de pantalla que el cliente puede cambiar y
// eso dejaría las columnas vacías sin un solo error.
const CAMPOS = [
  { clave: 'nombre',   etiqueta: 'Nombre completo' },
  { clave: 'correo',   etiqueta: 'Correo electrónico' },
  { clave: 'telefono', etiqueta: 'Teléfono' },
  { clave: 'asunto',   etiqueta: 'Asunto' },
  { clave: 'mensaje',  etiqueta: 'Mensaje' },
];

function doPost(e) {
  // Sin bloqueo, dos envíos a la vez pueden entrelazar la creación del
  // encabezado con el appendRow y duplicar la primera fila.
  const bloqueo = LockService.getScriptLock();
  bloqueo.waitLock(30000);

  try {
    const data = JSON.parse(e.postData.contents);

    // Una URL larga no es una contraseña: sin token, cualquiera que la
    // averigüe puede inyectar filas en la hoja del fondo.
    if (!tokenValido(data.token)) {
      return respuesta(false, 'token_invalido');
    }

    // getSheets()[0] y no getActiveSheet(): en una llamada por webhook no hay
    // "hoja activa" y el resultado depende de en qué pestaña quedó parado el
    // último que abrió el archivo.
    const hoja = SpreadsheetApp.getActiveSpreadsheet().getSheets()[0];
    asegurarCabeceras(hoja);

    const campos = data.campos || {};
    hoja.appendRow([
      data.fecha || new Date().toISOString(),
      data.radicado || '',
      ...CAMPOS.map(function (c) { return campos[c.clave] != null ? campos[c.clave] : ''; }),
      formatoSiNo(data.autoriza),
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
      'Autorización de datos',
    ]);
    hoja.getRange(1, 1, 1, CAMPOS.length + 3).setFontWeight('bold');
    hoja.setFrozenRows(1);
  }
}

function formatoSiNo(valor) {
  return (valor === true || valor === 'true' || valor === 1) ? 'Sí' : 'No';
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
