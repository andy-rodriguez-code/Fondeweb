<?php
// Manda los correos y escribe en el Google Sheet los envíos pendientes.
//
// Esto NO es una red de seguridad: es el camino normal. Desde el 16/09/2026
// `enviar.php` solo guarda en MySQL y contesta, porque el LiteSpeed de este
// hosting mata el proceso al cerrar la conexión y todo lo que iba después se
// perdía en silencio. Acá, por línea de comandos, no hay worker que reciclar.
//
// La cola vive en la base —`envios.correo_enviado = 0` y `envios.hoja_escrita
// = 0`— y no en una carpeta de archivos .json: un solo lugar donde mirar
// cuando algo falta, y sin riesgo de que la carpeta y la base cuenten
// historias distintas.
//
// Lo corre el cron de cPanel cada minuto:
//   /usr/local/bin/php /home/USUARIO/public_html/api/reintentar.php

declare(strict_types=1);

ini_set('display_errors', '0');
ini_set('log_errors', '1');
error_reporting(E_ALL);

// Misma zona que enviar.php: si el cron corriera en UTC, los reenvios
// llegarian a la hoja con otra hora que los envios originales.
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

// ── Un candado, para que dos corridas no se pisen ─────────────────────────
// Con el cron cada minuto esto deja de ser teórico: una corrida con la cola
// llena tarda más de un minuto —cada escritura en la hoja puede esperar hasta
// sesenta segundos— y la siguiente arrancaría leyendo los mismos pendientes,
// porque las banderas se marcan recién al terminar cada envío. Resultado: el
// mismo correo dos veces y la misma fila duplicada en la hoja.
//
// `LOCK_NB` es lo que importa: si ya hay una corrida en curso, esta se va sin
// hacer nada en vez de quedarse esperando y amontonar procesos.
$candado = fopen(RUTA_ESTADO . '/reintentar.lock', 'c');
if ($candado === false || !flock($candado, LOCK_EX | LOCK_NB)) {
    exit(0);
}

// ── La hoja ───────────────────────────────────────────────────────────────

$pendientes = enviosPendientesDeHoja();
$recuperados = 0;

foreach ($pendientes as $carga) {
    if (escribirEnHoja($carga)) {
        marcarEnvio($carga['radicado'], 'hoja_escrita', true);
        $recuperados++;
    }
}

if ($recuperados > 0) {
    registrar('REINTENTO hoja: recuperó ' . $recuperados . ' de ' . count($pendientes));
}

// ── El correo ─────────────────────────────────────────────────────────────
// Desde que enviar.php contesta antes de mandar el correo, un fallo de SMTP ya
// no se le puede avisar a nadie en el momento: esta es la única red que queda.

$sinCorreo = enviosPendientesDeCorreo();
$reenviados = 0;

foreach ($sinCorreo as $envio) {
    $salio = enviarCorreos(
        $envio['definicion'],
        $envio['valores'],
        $envio['radicado'],
        $envio['fecha'],
        $envio['firma'],
        $envio['remitente']
    );

    if ($salio) {
        marcarEnvio($envio['radicado'], 'correo_enviado', true);
        $reenviados++;
    }
}

if ($reenviados > 0) {
    registrar('REINTENTO correo: recuperó ' . $reenviados . ' de ' . count($sinCorreo));
}

flock($candado, LOCK_UN);
fclose($candado);

exit(0);
