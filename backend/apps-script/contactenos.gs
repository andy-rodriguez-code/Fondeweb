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

    // `data.fecha` llega en ISO 8601 con desfase (2026-09-10T04:08:04-05:00).
    // Sin el desfase, new Date() la interpretaría en la zona del script y la
    // hora saldría corrida sin que nadie lo note.
    const momento = data.fecha ? new Date(data.fecha) : new Date();
    const campos = data.campos || {};

    hoja.appendRow([
      formatoFecha(momento),
      formatoHora(momento),
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
      'Autorización de datos',
    ]);
    hoja.getRange(1, 1, 1, CAMPOS.length + 4).setFontWeight('bold');
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
        radicado: 'CTC-PRUEBA-0001',
        autoriza: true,
        campos: {
          nombre: 'Juan Pérez',
          correo: 'juan@ejemplo.com',
          telefono: '3001234567',
          asunto: 'Esto es una prueba',
          mensaje: 'Si ves esto en la hoja, funcionó.',
        },
      }),
    },
  };
  Logger.log(doPost(falso).getContent());
}
