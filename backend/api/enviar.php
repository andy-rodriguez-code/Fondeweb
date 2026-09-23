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
    registrar('TRAMPA activada desde ' . ipDelCliente());
    responder(200, ['ok' => true, 'radicado' => 'no-procesado']);
}

// Un formulario llenado en menos de tres segundos no lo llenó una persona.
if ((int) ($entrada['demora'] ?? 0) < 3000) {
    responder(429, ['ok' => false, 'error' => 'demasiado_rapido']);
}

$ip = ipDelCliente();
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

// ── Filtro de spam propio ─────────────────────────────────────────────────
// Va después de validar y antes de guardar: lo que se rechaza acá no llega a
// la base, ni al correo, ni a la hoja, ni gasta un número de radicado.
//
// El motivo queda en el registro para poder ajustar las reglas con datos
// reales en vez de a ojo. Si aparecen rechazos de personas de verdad, ahí se
// ve cuál regla los está atrapando.
$motivo = motivoDeSpam($definicion, $valores);
if ($motivo !== '') {
    registrar('SPAM rechazado desde ' . $ip . ' — ' . $motivo);
    responder(422, ['ok' => false, 'error' => 'contenido_no_permitido']);
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

// ── De acá al final: nada puede hacer desaparecer el envío ────────────────
// El envío ya está en MySQL con su radicado. Lo que sigue son derivados, y
// ninguno puede cambiar el hecho de que entró.
//
// Sobre este archivo pasaron tres diseños, y vale saber por qué, porque los
// dos primeros parecían razonables:
//
// 1. Contestar y seguir trabajando con `fastcgi_finish_request()`. Es lo
//    correcto en PHP-FPM y acá no funciona: este hosting es LiteSpeed con
//    lsphp y recicla el proceso ahí mismo. Ni el correo ni la hoja salían
//    jamás, sin un error en ningún log, porque PHP no falló: lo mataron.
//    Estuvo semanas perdiendo correos en silencio.
//
// 2. No trabajar acá y dejarlo todo en la cola de reintentar.php, disparada
//    además como proceso aparte para que saliera al instante. Lo del proceso
//    aparte NO se puede en este hosting: el registro dice
//    `AVISO: exec() no disponible` en cada envío desde el 16/09/2026. Sin eso,
//    el único que entrega es el cron y el correo tarda hasta un minuto. El
//    cliente lo notó, y con razón: antes llegaba al instante.
//
// 3. Lo que hay hoy, y es la lectura correcta del problema. Lo que LiteSpeed
//    mata es lo que pasa DESPUÉS de responder. Antes de responder, esto es una
//    petición como cualquier otra y se puede trabajar tranquilo. Es
//    exactamente lo que hace WordPress en este mismo servidor, y por eso su
//    formulario parece más rápido: no lo es, hace esperar a la persona unos
//    segundos y nadie lo nota.
//
// El correo va acá porque hay alguien esperándolo. La hoja se queda en la
// cola: es registro, tarda, y es la que devuelve 404 y páginas HTML de Google
// a mitad de camino. Poner eso en el camino de la persona sería cambiar un
// minuto de demora por un formulario que a veces se cuelga.

// El registro va ANTES del correo y de la respuesta, a propósito: es la única
// forma de que quede constancia del envío aunque lo que siga se cuelgue o el
// proceso no sobreviva.
registrar(sprintf('%s | %s | guardado', $radicado, $definicion['nombre']));

// ── El correo, con la persona esperando ───────────────────────────────────
// Con un tope corto (TIEMPO_MAXIMO_SMTP_EN_PETICION): si el SMTP no responde
// pronto se suelta y listo. No se pierde nada, porque `correo_enviado` sigue
// en 0 y la cola lo reintenta con más paciencia en el minuto siguiente.
//
// `enviarCorreos()` no lanza: atrapa lo suyo y devuelve false. Un correo que
// no sale no es motivo para decirle a la persona que su envío falló —sí
// entró, y tiene su radicado.
$correoSalio = enviarCorreos(
    $definicion,
    $valores,
    $radicado,
    $fecha,
    $firma,
    $correoRemitente,
    TIEMPO_MAXIMO_SMTP_EN_PETICION
);

if ($correoSalio) {
    marcarEnvio($radicado, 'correo_enviado', true);
}

// El contador de intentos NO se toca acá. Este intento usó un tope más corto
// que el de la cola, así que rendirse no significa lo mismo y no tiene por qué
// gastarle una oportunidad.
registrar(sprintf(
    '%s | correo %s',
    $radicado,
    $correoSalio ? 'entregado en el envío' : 'no salió acá — queda en cola'
));

// La hoja queda para la cola. Esto la dispara para que no haya que esperar al
// cron, y no hace nada si el hosting tiene exec() deshabilitado —que es el
// caso hoy—. Va antes de `responder()` porque después no corre nada.
dispararCola();

responder(200, ['ok' => true, 'radicado' => $radicado]);
