<?php
// Único punto de entrada de los formularios del sitio.
//
// Recibe JSON, valida contra la lista blanca del formulario y guarda en MySQL.
//
// El orden importa: **la base primero**. Es la fuente de verdad, así que si
// ahí no se pudo escribir el envío no existió y se le avisa a la persona. El
// correo y el Google Sheet son derivados: que fallen no borra el registro, se
// marcan como pendientes y el cron de reintentar.php los recupera leyendo de
// la propia base.
//
// Se despliega en public_html/api/. La configuración vive fuera de
// public_html: ver ../config.example.php.

declare(strict_types=1);

// Un error de PHP no debe salir nunca al navegador: revelaría rutas del
// servidor y fragmentos de configuración. Se reporta todo, pero al log.
// Ojo con `error_reporting(0)`: apaga también el registro, y entonces cuando
// algo falle no hay con qué diagnosticarlo.
ini_set('display_errors', '0');
ini_set('log_errors', '1');
error_reporting(E_ALL);

// El servidor puede estar en UTC —en cPanel suele estarlo— y entonces la base
// guardaría una hora y la hoja mostraría otra. Se fija acá para que el
// radicado, el correo, MySQL y el Google Sheet hablen todos de la misma hora:
// la de Floridablanca.
date_default_timezone_set('America/Bogota');

// Ajustar si public_html no cuelga directo de /home/USUARIO.
require __DIR__ . '/../../fondefos-config/config.php';
require __DIR__ . '/phpmailer/Exception.php';
require __DIR__ . '/phpmailer/PHPMailer.php';
require __DIR__ . '/phpmailer/SMTP.php';
require __DIR__ . '/enviar-funciones.php';
require __DIR__ . '/bd.php';

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

aplicarCors();

// El preflight del navegador termina acá, sin cuerpo.
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    responder(405, ['ok' => false, 'error' => 'metodo_no_permitido']);
}

$entrada = json_decode((string) file_get_contents('php://input'), true);
if (!is_array($entrada)) {
    responder(400, ['ok' => false, 'error' => 'json_invalido']);
}

$clave = (string) ($entrada['formulario'] ?? '');
if (!isset(FORMULARIOS[$clave])) {
    responder(400, ['ok' => false, 'error' => 'formulario_desconocido']);
}
$definicion = FORMULARIOS[$clave];

// ── Antispam ──────────────────────────────────────────────────────────────

// Campo trampa: queda vacío siempre. Se responde ok para no darle señal al
// robot de que fue detectado, pero no se procesa nada.
if (!empty($entrada['website'])) {
    registrar('TRAMPA activada desde ' . ($_SERVER['REMOTE_ADDR'] ?? '?'));
    responder(200, ['ok' => true, 'radicado' => 'no-procesado']);
}

// Un formulario llenado en menos de tres segundos no lo llenó una persona.
if ((int) ($entrada['demora'] ?? 0) < 3000) {
    responder(429, ['ok' => false, 'error' => 'demasiado_rapido']);
}

$ip = (string) ($_SERVER['REMOTE_ADDR'] ?? '0.0.0.0');
limitarPorIp($ip);

// Apagado mientras RECAPTCHA_SECRETO esté vacío.
if (!verificarRecaptcha((string) ($entrada['recaptcha'] ?? ''))) {
    responder(400, ['ok' => false, 'error' => 'verificacion_fallida']);
}

// ── Validación en el servidor ─────────────────────────────────────────────
// Se valida de nuevo aunque el frontend ya lo haga: cualquiera puede llamar a
// este endpoint con curl y saltarse el navegador por completo. La validación
// del cliente es comodidad para la persona; esta es la que manda.

$valores = [];
$correoRemitente = '';

foreach ($definicion['campos'] as $id => $campo) {
    $bruto = $entrada['campos'][$id] ?? '';
    if (is_array($bruto) || is_object($bruto)) {
        responder(422, ['ok' => false, 'error' => 'campo_invalido', 'campo' => $id]);
    }

    // Se recorta al máximo y se limpian los caracteres de control, pero NO se
    // escapa: el escapado va al imprimir.
    $valor = trim((string) $bruto);
    $valor = (string) preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $valor);
    $valor = function_exists('mb_substr')
        ? mb_substr($valor, 0, $campo['max'])
        : substr($valor, 0, $campo['max']);

    if ($campo['requerido'] && $valor === '') {
        responder(422, ['ok' => false, 'error' => 'campo_requerido', 'campo' => $id]);
    }
    if ($campo['tipo'] === 'correo' && $valor !== '' && !filter_var($valor, FILTER_VALIDATE_EMAIL)) {
        responder(422, ['ok' => false, 'error' => 'correo_invalido', 'campo' => $id]);
    }
    if ($campo['tipo'] === 'monto' && ((float) $valor) <= 0) {
        responder(422, ['ok' => false, 'error' => 'monto_invalido', 'campo' => $id]);
    }
    if ($id === $definicion['campoCorreo']) {
        $correoRemitente = $valor;
    }

    // Se indexa por el id del campo y NO por su etiqueta. La etiqueta es texto
    // de pantalla que el cliente puede cambiar cualquier día —una tilde, una
    // palabra— y eso rompería en silencio el Apps Script, la base y el correo:
    // columnas vacías sin un solo error. El id es el identificador estable.
    $valores[$id] = $valor;
}

// Autorización de tratamiento de datos (Ley 1581 de 2012). Obligatoria: sin
// ella no hay base legal para guardar nada, así que se rechaza acá también y
// no solo en la interfaz.
$autoriza = ($entrada['autoriza'] ?? false) === true;
if (!$autoriza) {
    responder(422, ['ok' => false, 'error' => 'falta_autorizacion']);
}

$firma = '';
if ($definicion['firma']) {
    $firma = (string) ($entrada['firma'] ?? '');
    if (strpos($firma, 'data:image/png;base64,') !== 0) {
        responder(422, ['ok' => false, 'error' => 'falta_firma']);
    }
}

// ── Base de datos: la fuente de verdad ────────────────────────────────────
// El radicado se asigna acá dentro, en la misma transacción que las filas del
// envío. Si esto falla, no hay envío y no se manda nada.

$fecha = date('Y-m-d H:i:s');

// La firma se escribe antes de la transacción porque su ruta es una columna
// del envío. Si la escritura falla, el envío se guarda igual sin ella: perder
// una firma es malo, perder la inscripción entera es peor.
$rutaFirma = '';
if ($firma !== '') {
    // Nombre provisional: todavía no hay radicado. Se renombra al tenerlo.
    $rutaFirma = guardarFirma('tmp-' . bin2hex(random_bytes(8)), $firma);
}

$radicado = guardarEnvio(
    $clave,
    $definicion,
    $valores,
    $fecha,
    $ip,
    $autoriza,
    $correoRemitente,
    $rutaFirma
);

// Ya con el radicado, la firma toma su nombre definitivo.
if ($rutaFirma !== '') {
    $definitiva = RUTA_ESTADO . '/firmas/' . $radicado . '.png';
    if (@rename($rutaFirma, $definitiva)) {
        bd()->prepare('UPDATE envios SET firma_archivo = :ruta WHERE radicado = :radicado')
            ->execute([':ruta' => $definitiva, ':radicado' => $radicado]);
    }
}

// ── Derivados: correo y Google Sheet ──────────────────────────────────────
// A partir de acá nada puede hacer desaparecer el envío. Lo que falle queda
// marcado en la base y lo recupera el cron.

$enviado = enviarCorreos($definicion, $valores, $radicado, $fecha, $firma, $correoRemitente);
marcarEnvio($radicado, 'correo_enviado', $enviado);

$escrita = escribirEnHoja([
    'clave_formulario' => $clave,
    'token'            => TOKEN_HOJA,
    'formulario'       => $definicion['nombre'],
    'radicado'         => $radicado,
    // ISO 8601 con desfase (2026-09-10T04:08:04-05:00), no el formato de
    // MySQL. Sin el desfase, el `new Date()` del Apps Script interpretaría la
    // cadena en la zona horaria del script y la hora saldría corrida sin que
    // nadie lo note. Es el mismo instante que `recibido_en`, escrito distinto.
    'fecha'            => date('c', strtotime($fecha)),
    'campos'           => $valores,
    // Booleano, no la imagen: la hoja solo registra si hubo firma. Mandar los
    // 60 KB de base64 en cada envío es tráfico que nadie usa y arriesga el
    // tiempo de espera del Apps Script.
    'firma'            => $firma !== '',
    'ip'               => $ip,
    'autoriza'         => $autoriza,
]);
marcarEnvio($radicado, 'hoja_escrita', $escrita);

registrar(sprintf(
    '%s | %s | correo=%s | hoja=%s',
    $radicado,
    $definicion['nombre'],
    $enviado ? 'ok' : 'fallo',
    $escrita ? 'ok' : 'pendiente'
));

// El envío está guardado y el radicado es válido pase lo que pase. Si el
// correo no salió se avisa, pero el radicado va en la respuesta para que la
// persona conserve su constancia.
if (!$enviado) {
    responder(502, ['ok' => false, 'error' => 'correo_no_enviado', 'radicado' => $radicado]);
}

responder(200, ['ok' => true, 'radicado' => $radicado]);
