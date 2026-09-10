// Apps Script del Google Sheet. Recibe los envíos de enviar.php y los escribe
// en la hoja, una pestaña por formulario.
//
// Instalación: en la hoja de cálculo, Extensiones → Apps Script, pegar esto en
// Código.gs. Después Configuración del proyecto → Propiedades del script, y
// crear TOKEN y CARPETA_FIRMAS_ID.
//
// Las dos propiedades van ahí y NO quemadas en el código: cualquiera con
// acceso de edición a la hoja puede leer el script.
//
// Implementar → Nueva implementación → Aplicación web, ejecutar como "Yo",
// acceso "Cualquier usuario". Cada vez que se edite este archivo hay que crear
// una implementación nueva o la URL sigue sirviendo el código viejo: es la
// causa número uno de "cambié el script y no pasó nada".

function propiedad(nombre) {
  return PropertiesService.getScriptProperties().getProperty(nombre);
}

function doPost(e) {
  // El bloqueo serializa las escrituras: dos envíos simultáneos no se pisan la
  // fila ni descuadran los encabezados.
  const bloqueo = LockService.getScriptLock();
  bloqueo.waitLock(30000);

  try {
    const datos = JSON.parse(e.postData.contents);

    if (datos.token !== propiedad('TOKEN')) {
      return responder({ ok: false, error: 'token_invalido' });
    }

    const fila = {};
    fila['Radicado'] = datos.radicado || '';
    fila['Fecha'] = datos.fecha || '';

    Object.keys(datos.campos || {}).forEach(function (etiqueta) {
      fila[etiqueta] = datos.campos[etiqueta];
    });

    if (datos.firma) {
      fila['Firma'] = guardarFirma(datos.radicado, datos.firma);
    }
    fila['Autorización de datos'] = datos.autoriza ? 'Sí' : 'No';
    fila['IP'] = datos.ip || '';

    escribirFila(obtenerHoja(datos.formulario), fila);
    return responder({ ok: true, radicado: datos.radicado });
  } catch (error) {
    return responder({ ok: false, error: String(error) });
  } finally {
    bloqueo.releaseLock();
  }
}

// Una pestaña por formulario. Se crea sola la primera vez.
function obtenerHoja(nombre) {
  const libro = SpreadsheetApp.getActiveSpreadsheet();
  return libro.getSheetByName(nombre) || libro.insertSheet(nombre);
}

// Escribe respetando los encabezados existentes y agregando los que falten.
// Así un formulario puede ganar campos nuevos sin descuadrar las filas viejas,
// que es justo lo que rompe la versión de columnas fijas con appendRow.
function escribirFila(hoja, fila) {
  const columnas = hoja.getLastColumn();
  const encabezados = columnas > 0 ? hoja.getRange(1, 1, 1, columnas).getValues()[0] : [];

  Object.keys(fila).forEach(function (clave) {
    if (encabezados.indexOf(clave) === -1) encabezados.push(clave);
  });

  const cabecera = hoja.getRange(1, 1, 1, encabezados.length);
  cabecera.setValues([encabezados]);
  cabecera.setFontWeight('bold');
  hoja.setFrozenRows(1);

  hoja.appendRow(
    encabezados.map(function (clave) {
      return fila[clave] !== undefined ? fila[clave] : '';
    }),
  );
}

function guardarFirma(radicado, base64) {
  const limpio = base64.replace(/^data:image\/png;base64,/, '');
  const blob = Utilities.newBlob(
    Utilities.base64Decode(limpio),
    'image/png',
    radicado + '-firma.png',
  );
  return DriveApp.getFolderById(propiedad('CARPETA_FIRMAS_ID')).createFile(blob).getUrl();
}

function responder(objeto) {
  return ContentService.createTextOutput(JSON.stringify(objeto)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
