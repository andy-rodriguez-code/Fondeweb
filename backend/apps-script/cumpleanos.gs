// Apps Script de la hoja de cálculo "Cumpleaños".
//
// Esta hoja NO recibe filas: es la lista de asociados que el fondo mantiene a
// mano, con tres columnas —Nombre completo, Fecha_Nacimiento, Email—. El
// script solo la LEE y se la entrega al backend, que es quien decide a quién
// le toca hoy y quien manda el correo.
//
// Por qué el correo no sale desde acá con MailApp, que sería más corto: saldría
// desde una cuenta @gmail.com o @foscal.com.co, y el remitente del fondo es
// @fondefos.com.co, el único dominio cuyo SPF, DKIM y DMARC alinean con el
// servidor que manda. Un saludo de cumpleaños que cae en spam es peor que no
// mandarlo. Ver el bloque SMTP de config.example.php.
//
// INSTALACIÓN
//   1. En la hoja: Extensiones → Apps Script. Borrar Código.gs y pegar esto.
//   2. Configuración del proyecto → Propiedades del script → agregar
//      TOKEN_HOJA, con el mismo valor que la constante del mismo nombre en
//      config.php. El mismo valor que en los otros dos scripts.
//   3. Implementar → Nueva implementación → Aplicación web
//        · Ejecutar como: Yo
//        · Quién tiene acceso: Cualquier usuario
//   4. Copiar la URL /exec a URLS_APPS_SCRIPT['cumpleanos'] en config.php.
//
// Cada vez que se edite este archivo hay que crear una implementación NUEVA, o
// la URL sigue sirviendo el código viejo.
//
// LA HOJA
//   Primera fila: encabezados. Se buscan por nombre y no por posición, así que
//   se pueden reordenar las columnas o agregar otras sin romper nada. Se
//   aceptan con o sin tilde, con guion bajo o espacio, en mayúscula o no:
//
//     Nombre completo   ·  Fecha_Nacimiento  ·  Email
//     (también: Nombre  ·  Fecha de nacimiento · Correo)
//
//   La fecha puede ser una celda con formato de fecha —lo normal— o texto
//   dd/mm/aaaa. Las filas con datos que no sirven se pueden ver con
//   `revisarHoja`, al final.

// Encabezados aceptados para cada dato, ya normalizados (ver normalizar()).
const ENCABEZADOS = {
  nombre: ['nombre completo', 'nombre', 'nombres'],
  fecha:  ['fecha nacimiento', 'fecha de nacimiento', 'nacimiento', 'cumpleanos'],
  correo: ['email', 'e mail', 'correo', 'correo electronico'],
};

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    // Esta lista son datos personales de cientos de asociados —nombre, fecha
    // de nacimiento y correo—. Sin token, cualquiera que averigüe la URL se
    // la lleva entera.
    if (!tokenValido(data.token)) {
      return respuesta(false, 'token_invalido', []);
    }

    return respuesta(true, 'ok', leerAsociados().asociados);
  } catch (err) {
    return respuesta(false, 'error_interno: ' + err.message, []);
  }
}

/**
 * Lee la hoja y devuelve las filas utilizables y las que no.
 *
 * Se manda la lista ENTERA y el backend filtra por fecha, en vez de filtrar
 * acá: así "qué día es hoy" se decide en un solo lugar —el servidor, en hora
 * de Floridablanca— y la regla del 29 de febrero vive en un solo archivo. Dos
 * relojes deciden distinto justo en la medianoche.
 */
function leerAsociados() {
  // getSheets()[0] y no getActiveSheet(): en una llamada por webhook no hay
  // "hoja activa".
  const libro = SpreadsheetApp.getActiveSpreadsheet();
  const hoja = libro.getSheets()[0];
  const valores = hoja.getDataRange().getValues();
  if (valores.length < 2) return { asociados: [], problemas: [] };

  const columnas = ubicarColumnas(valores[0]);
  const faltan = Object.keys(columnas).filter(function (k) { return columnas[k] < 0; });
  if (faltan.length) {
    throw new Error('no encuentro la columna de: ' + faltan.join(', '));
  }

  // La zona de la HOJA, no la del script. Una celda de fecha es medianoche en
  // la zona del libro; formateada en otra zona, el 15 de marzo puede salir 14.
  const zona = libro.getSpreadsheetTimeZone();

  const asociados = [];
  const problemas = [];

  for (let i = 1; i < valores.length; i++) {
    const fila = valores[i];
    const nombre = String(fila[columnas.nombre]).trim();
    const correo = String(fila[columnas.correo]).trim();
    const fecha = fechaIso(fila[columnas.fecha], zona);

    // Una fila vacía al final de la hoja no es un problema, es una fila vacía.
    if (!nombre && !correo && !fecha) continue;

    const numeroFila = i + 1;
    if (!nombre || !fecha || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(correo)) {
      problemas.push({ fila: numeroFila, nombre: nombre, correo: correo, fecha: String(fila[columnas.fecha]) });
      continue;
    }

    asociados.push({ fila: numeroFila, nombre: nombre, fecha: fecha, correo: correo });
  }

  return { asociados: asociados, problemas: problemas };
}

function ubicarColumnas(encabezado) {
  const normalizados = encabezado.map(normalizar);
  const columnas = {};
  Object.keys(ENCABEZADOS).forEach(function (dato) {
    columnas[dato] = normalizados.findIndex(function (h) {
      return ENCABEZADOS[dato].indexOf(h) >= 0;
    });
  });
  return columnas;
}

// "Fecha_Nacimiento" → "fecha nacimiento"; "Cumpleaños" → "cumpleanos".
function normalizar(texto) {
  return String(texto)
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[_\-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * La fecha de nacimiento como 'yyyy-MM-dd', o '' si no se entiende.
 *
 * Una celda con formato de fecha llega como Date. Una escrita como texto llega
 * como string, y en Colombia se escribe día primero: 05/03/1990 es 5 de marzo,
 * nunca 3 de mayo.
 */
function fechaIso(valor, zona) {
  if (valor instanceof Date && !isNaN(valor.getTime())) {
    return Utilities.formatDate(valor, zona, 'yyyy-MM-dd');
  }

  const texto = String(valor).trim();
  let m = texto.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (m) return armar(m[1], m[2], m[3]);

  m = texto.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/);
  if (m) return armar(m[3], m[2], m[1]);

  return '';
}

function armar(anio, mes, dia) {
  const a = Number(anio), me = Number(mes), d = Number(dia);
  const prueba = new Date(a, me - 1, d);
  // Descarta 31/02 y similares: Date los corre al mes siguiente sin avisar.
  if (prueba.getFullYear() !== a || prueba.getMonth() !== me - 1 || prueba.getDate() !== d) return '';
  return a + '-' + ('0' + me).slice(-2) + '-' + ('0' + d).slice(-2);
}

function tokenValido(recibido) {
  const esperado = PropertiesService.getScriptProperties().getProperty('TOKEN_HOJA');
  // El `esperado &&` importa: sin la propiedad configurada, un payload sin
  // token cumpliría `undefined === undefined` y entraría cualquiera.
  return Boolean(esperado) && recibido === esperado;
}

// Las dos claves, `ok` y `success`, igual que los otros scripts: el backend
// acepta cualquiera de las dos.
function respuesta(exito, mensaje, asociados) {
  return ContentService
    .createTextOutput(JSON.stringify({ ok: exito, success: exito, mensaje: mensaje, asociados: asociados }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ---------------------------------------------------------------------------
// Herramientas de mano, desde el editor: elegir la función en el desplegable
// y darle a Ejecutar. Ninguna manda correos ni escribe en la hoja.
// ---------------------------------------------------------------------------

/**
 * Lista en el registro las filas que el backend va a saltarse: sin nombre,
 * con una fecha que no se entiende o con un correo mal escrito. Correrla cada
 * vez que se carguen asociados nuevos.
 */
function revisarHoja() {
  const resultado = leerAsociados();
  Logger.log('Filas válidas: ' + resultado.asociados.length);
  Logger.log('Filas con problemas: ' + resultado.problemas.length);
  resultado.problemas.forEach(function (p) {
    Logger.log('  fila ' + p.fila + ' · ' + (p.nombre || '(sin nombre)')
      + ' · fecha «' + p.fecha + '» · correo «' + p.correo + '»');
  });
}

/** Simula la llamada del backend con el token configurado. */
function pruebaConsulta() {
  const falso = {
    postData: {
      contents: JSON.stringify({
        token: PropertiesService.getScriptProperties().getProperty('TOKEN_HOJA'),
      }),
    },
  };
  Logger.log(doPost(falso).getContent().slice(0, 2000));
}
