<?php
// Vacía la cola de envíos que no llegaron al Google Sheet.
//
// Lo corre el cron de cPanel cada 15 minutos:
//   /usr/local/bin/php /home/USUARIO/public_html/api/reintentar.php
//
// No recibe peticiones del navegador: el .htaccess de esta carpeta lo bloquea
// por HTTP y solo se ejecuta desde la línea de comandos.

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

$archivos = glob(RUTA_ESTADO . '/pendientes/*.json') ?: [];
if (!$archivos) {
    exit(0);
}

$recuperados = 0;

foreach ($archivos as $archivo) {
    $carga = json_decode((string) file_get_contents($archivo), true);
    if (!is_array($carga)) {
        // Un archivo ilegible no se reintenta para siempre: se aparta.
        @rename($archivo, $archivo . '.roto');
        registrar('REINTENTO ilegible: ' . basename($archivo));
        continue;
    }

    // El token puede haber rotado desde que se encoló.
    $carga['token'] = TOKEN_HOJA;

    if (escribirEnHoja($carga)) {
        unlink($archivo);
        $recuperados++;
    }
}

if ($recuperados > 0) {
    registrar('REINTENTO recuperó ' . $recuperados . ' de ' . count($archivos));
}

exit(0);
