<?php
// Manda el saludo de cumpleaños a los asociados que cumplen hoy.
//
// La lista vive en una hoja de Google —Nombre completo, Fecha_Nacimiento,
// Email— que el fondo mantiene a mano. El Apps Script de esa hoja
// (apps-script/cumpleanos.gs) se la entrega completa a este script, que decide
// quién cumple y manda el correo desde el buzón del dominio.
//
// Lo corre el cron de cPanel CADA HORA, no una vez al día a las 6:
//
//   0 * * * *  /usr/local/bin/php /home/USUARIO/public_html/api/cumpleanos.php
//
// La hora de Colombia la resuelve este script, no el cron. El servidor puede
// estar en UTC o en la zona que sea, y un cron "a las 6" en UTC es la una de
// la madrugada en Floridablanca. Corriendo cada hora, la primera corrida desde
// las 6:00 de Bogotá (CUMPLEANOS_HORA) es la que manda, y las demás:
//
//   · si todo salió, se van sin hacer nada (testigo del día en RUTA_ESTADO);
//   · si algo falló, lo reintentan, hasta MAX_INTENTOS_CUMPLEANOS por persona.
//
// La tabla `cumpleanos_enviados` es la que garantiza un solo saludo por
// persona y por año, por más veces que corra.
//
// Para probar a mano, sin esperar al cron:
//
//   php cumpleanos.php --simular                    quién cumple hoy, sin mandar
//   php cumpleanos.php --simular --fecha=2026-03-15 lo mismo para otra fecha
//   php cumpleanos.php --fecha=2026-03-15           manda como si fuera ese día
//   php cumpleanos.php --vista-previa="Ana Gómez"   el HTML del correo, a stdout

declare(strict_types=1);

ini_set('display_errors', '0');
ini_set('log_errors', '1');
error_reporting(E_ALL);

// El "hoy" del cumpleaños es el de Floridablanca, no el del servidor.
date_default_timezone_set('America/Bogota');

// Solo por CLI. Si alguien lo pide por URL, no hace nada.
if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

require __DIR__ . '/../../fondefos-config/config.php';
require __DIR__ . '/phpmailer/Exception.php';
require __DIR__ . '/phpmailer/PHPMailer.php';
require __DIR__ . '/phpmailer/SMTP.php';
require __DIR__ . '/enviar-funciones.php';
require __DIR__ . '/bd.php';
require __DIR__ . '/cumpleanos-funciones.php';

$opciones = getopt('', ['simular', 'fecha:', 'vista-previa:']);

// ── Vista previa: solo arma el HTML ───────────────────────────────────────
if (isset($opciones['vista-previa'])) {
    echo cuerpoCumpleanos((string) $opciones['vista-previa'], new DateTimeImmutable('today'))['html'];
    exit(0);
}

$simular = isset($opciones['simular']);
$fechaForzada = isset($opciones['fecha']);

if ($fechaForzada) {
    $hoy = DateTimeImmutable::createFromFormat('!Y-m-d', (string) $opciones['fecha']);
    if ($hoy === false) {
        fwrite(STDERR, "--fecha va como AAAA-MM-DD\n");
        exit(1);
    }
} else {
    $hoy = new DateTimeImmutable('today');

    // Antes de la hora no se manda nada. Un saludo a las 12:05 de la
    // madrugada llega con la notificación que despierta a la persona.
    $hora = defined('CUMPLEANOS_HORA') ? (int) CUMPLEANOS_HORA : 6;
    if ((int) date('G') < $hora) {
        exit(0);
    }
}

// Testigo de "hoy ya quedó todo enviado": las corridas de la tarde se van sin
// preguntarle nada a Google. Solo vale para el día real, no para una fecha
// forzada a mano.
$testigo = RUTA_ESTADO . '/cumpleanos-' . $hoy->format('Y-m-d') . '.ok';
if (!$simular && !$fechaForzada && is_file($testigo)) {
    exit(0);
}

// Dos corridas a la vez leerían los mismos pendientes y mandarían dos veces.
$candado = fopen(RUTA_ESTADO . '/cumpleanos.lock', 'c');
if ($candado === false || !flock($candado, LOCK_EX | LOCK_NB)) {
    exit(0);
}

$asociados = leerAsociadosDeHoja();
if ($asociados === null) {
    // Ya quedó anotado por qué. Sin testigo: la corrida de la próxima hora
    // vuelve a intentar.
    exit(1);
}

$cumplen = cumpleanerosDe($asociados, $hoy);

if ($simular) {
    echo 'Asociados en la hoja: ' . count($asociados) . PHP_EOL;
    echo 'Cumplen el ' . $hoy->format('d/m/Y') . ': ' . count($cumplen) . PHP_EOL;
    foreach ($cumplen as $persona) {
        echo '  · ' . nombrePropio($persona['nombre']) . ' <' . $persona['correo'] . '>' . PHP_EOL;
    }
    exit(0);
}

$anio = (int) $hoy->format('Y');
$estado = saludosDelAnio($anio);

$enviados = 0;
$pendientes = 0;
$correo = null;

foreach ($cumplen as $persona) {
    $previo = $estado[$persona['correo']] ?? null;

    if ($previo !== null && $previo['enviado_en'] !== null) {
        continue;
    }
    if ($previo !== null && (int) $previo['intentos'] >= MAX_INTENTOS_CUMPLEANOS) {
        // Ya se rindió en una corrida anterior y quedó anotado entonces.
        continue;
    }

    // La conexión se abre recién cuando hay a quién escribirle: la mayoría de
    // las corridas no mandan nada y no tienen por qué autenticarse.
    $correo = $correo ?? smtpCumpleanos();

    $error = enviarSaludo($correo, $persona, $hoy);
    if ($error === '') {
        marcarSaludoEnviado($persona['correo'], $persona['nombre'], $anio);
        $enviados++;
        continue;
    }

    $intentos = anotarSaludoFallido($persona['correo'], $persona['nombre'], $anio, $error);
    if ($intentos >= MAX_INTENTOS_CUMPLEANOS) {
        registrar(sprintf(
            'CUMPLEAÑOS SE RINDIÓ con %s tras %d intentos: %s. Revisar el correo en la hoja; '
            . 'para reintentar, borrar su fila de cumpleanos_enviados del año %d.',
            $persona['correo'],
            $intentos,
            $error,
            $anio
        ));
    } else {
        registrar('ERROR CUMPLEAÑOS ' . $persona['correo'] . ': ' . $error);
        $pendientes++;
    }
}

if ($correo !== null) {
    cerrarSmtp($correo);
}

if (count($cumplen) > 0) {
    registrar(sprintf(
        'CUMPLEAÑOS %s: %d cumplen, %d saludos enviados en esta corrida, %d por reintentar',
        $hoy->format('Y-m-d'),
        count($cumplen),
        $enviados,
        $pendientes
    ));
}

// Sin pendientes, el día quedó cerrado. Se borran los testigos de días
// anteriores para que la carpeta no junte uno por día para siempre.
if ($pendientes === 0 && !$fechaForzada) {
    foreach (glob(RUTA_ESTADO . '/cumpleanos-*.ok') ?: [] as $viejo) {
        @unlink($viejo);
    }
    @file_put_contents($testigo, date('c'));
}

flock($candado, LOCK_UN);
fclose($candado);

exit(0);
