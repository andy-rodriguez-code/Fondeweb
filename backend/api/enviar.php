<?php
// Único punto de entrada de los formularios del sitio.
//
// Recibe JSON, valida contra la lista blanca del formulario, asigna el
// radicado, manda el correo y escribe la fila en el Google Sheet. Si Google
// falla, el envío queda en cola y el cron de reintentar.php lo recupera: el
// radicado ya existe y el correo ya salió, así que nada se pierde.
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

// Ajustar si public_html no cuelga directo de /home/USUARIO.
require __DIR__ . '/../../fondefos-config/config.php';
require __DIR__ . '/phpmailer/Exception.php';
require __DIR__ . '/phpmailer/PHPMailer.php';
require __DIR__ . '/phpmailer/SMTP.php';
require __DIR__ . '/enviar-funciones.php';

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

    $valores[$campo['etiqueta']] = $valor;
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

// ── Radicado ──────────────────────────────────────────────────────────────

$radicado = siguienteRadicado($definicion['prefijo']);
$fecha = date('Y-m-d H:i:s');

// ── Correo ────────────────────────────────────────────────────────────────

$enviado = enviarCorreos($definicion, $valores, $radicado, $fecha, $firma, $correoRemitente);

// ── Google Sheet ──────────────────────────────────────────────────────────

$carga = [
    'token'      => TOKEN_HOJA,
    'formulario' => $definicion['nombre'],
    'radicado'   => $radicado,
    'fecha'      => $fecha,
    'campos'     => $valores,
    'firma'      => $firma,
    'ip'         => $ip,
    'autoriza'   => $autoriza,
];

if (!escribirEnHoja($carga)) {
    // Nada se pierde: queda en cola y reintentar.php la vacía.
    @file_put_contents(
        RUTA_ESTADO . '/pendientes/' . $radicado . '.json',
        json_encode($carga, JSON_UNESCAPED_UNICODE)
    );
}

registrar($radicado . ' | ' . $definicion['nombre'] . ' | correo=' . ($enviado ? 'ok' : 'fallo'));

if (!$enviado) {
    // Los datos quedaron guardados y el radicado es válido: se devuelve para
    // que la persona tenga su constancia aunque el correo no haya salido.
    responder(502, ['ok' => false, 'error' => 'correo_no_enviado', 'radicado' => $radicado]);
}

responder(200, ['ok' => true, 'radicado' => $radicado]);
