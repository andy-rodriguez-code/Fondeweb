<?php
// Reenvía al Google Sheet los envíos que quedaron marcados como pendientes.
//
// La cola vive en la base —`envios.hoja_escrita = 0`— y ya no en una carpeta
// de archivos .json: un solo lugar donde mirar cuando algo falta, y sin riesgo
// de que la carpeta y la base cuenten historias distintas.
//
// Lo corre el cron de cPanel cada 15 minutos:
//   /usr/local/bin/php /home/USUARIO/public_html/api/reintentar.php

declare(strict_types=1);

ini_set('display_errors', '0');
ini_set('log_errors', '1');
error_reporting(E_ALL);

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

$pendientes = enviosPendientesDeHoja();
if (!$pendientes) {
    exit(0);
}

$recuperados = 0;

foreach ($pendientes as $carga) {
    if (escribirEnHoja($carga)) {
        marcarEnvio($carga['radicado'], 'hoja_escrita', true);
        $recuperados++;
    }
}

if ($recuperados > 0) {
    registrar('REINTENTO recuperó ' . $recuperados . ' de ' . count($pendientes));
}

exit(0);
