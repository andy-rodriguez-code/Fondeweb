<?php
// Funciones del saludo de cumpleaños. Las usa cumpleanos.php.
//
// Separadas del script para poder probar la parte que decide —a quién le toca
// hoy, cómo se escribe su nombre, cómo queda el correo— sin cron, sin base y
// sin SMTP.

declare(strict_types=1);

use PHPMailer\PHPMailer\PHPMailer;

// El diseño del saludo. Es copia de frontend/src/pages/cumpleanos.html, que es
// donde se diseñó; esta es la que viaja con api/ al hosting y la que se manda.
// Si se cambia el diseño, se copia acá.
//
// Marcadores que se reemplazan, ya escapados para HTML:
//   {{NOMBRE}}          nombre completo, con mayúsculas de nombre propio
//   {{PRIMER_NOMBRE}}   la primera palabra del nombre
//   {{FECHA}}           "22 de octubre de 2026"
//   {{ANIO}}            el año en curso
//
// Reglas para editarla: estilos en línea y maquetado con tablas (Gmail
// descarta las hojas de estilo, Outlook no entiende flexbox), y nada de
// imágenes remotas. Para verla sin mandar nada:
//   php api/cumpleanos.php --vista-previa="Ana Gómez" > vista.html
const RUTA_PLANTILLA_CUMPLEANOS = __DIR__ . '/plantillas/cumpleanos.html';

const MESES_ES = [
    1 => 'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

/**
 * Cuántas veces se intenta el saludo de una persona antes de rendirse.
 *
 * Con el cron cada hora, tres intentos son tres horas: si a las 9 de la mañana
 * el correo todavía no sale, casi seguro es la dirección y no el servidor, y
 * seguir intentando todo el día solo llena el registro.
 */
const MAX_INTENTOS_CUMPLEANOS = 3;

/**
 * ¿Cumple años esta persona en la fecha dada?
 *
 * Quien nació un 29 de febrero celebra el 28 en los años que no son
 * bisiestos. Sin esta regla, tres de cada cuatro años no recibiría nada.
 */
function cumpleHoy(string $fechaNacimiento, DateTimeImmutable $hoy): bool
{
    $nacimiento = DateTimeImmutable::createFromFormat('!Y-m-d', $fechaNacimiento);
    if ($nacimiento === false || $nacimiento->format('Y-m-d') !== $fechaNacimiento) {
        return false;
    }

    $mesDia = $nacimiento->format('m-d');
    if ($mesDia === $hoy->format('m-d')) {
        return true;
    }

    return $mesDia === '02-29'
        && $hoy->format('m-d') === '02-28'
        && $hoy->format('L') === '0';
}

/**
 * De la lista completa de la hoja, los que cumplen hoy.
 *
 * Un mismo correo puede estar dos veces —filas duplicadas al pegar una lista
 * nueva encima de la vieja— y no tiene por qué recibir dos saludos. Se compara
 * en minúscula: Gmail no distingue y la persona tampoco.
 */
function cumpleanerosDe(array $asociados, DateTimeImmutable $hoy): array
{
    $hoyCumplen = [];
    foreach ($asociados as $asociado) {
        $correo = strtolower(trim((string) ($asociado['correo'] ?? '')));
        $fecha = trim((string) ($asociado['fecha'] ?? ''));
        $nombre = trim((string) ($asociado['nombre'] ?? ''));

        if ($nombre === '' || !filter_var($correo, FILTER_VALIDATE_EMAIL)) {
            continue;
        }
        if (!cumpleHoy($fecha, $hoy) || isset($hoyCumplen[$correo])) {
            continue;
        }

        $hoyCumplen[$correo] = ['nombre' => $nombre, 'correo' => $correo];
    }

    return array_values($hoyCumplen);
}

/**
 * "MARIA DE LOS ANGELES RUEDA" → "Maria de los Angeles Rueda".
 *
 * Las listas de nómina suelen venir en mayúsculas sostenidas, y un saludo que
 * grita el nombre no parece un saludo. Las partículas van en minúscula como se
 * escriben en español, salvo si abren el nombre.
 */
function nombrePropio(string $nombre): string
{
    $nombre = (string) preg_replace('/\s+/u', ' ', trim($nombre));
    $palabras = explode(' ', mb_convert_case(mb_strtolower($nombre, 'UTF-8'), MB_CASE_TITLE, 'UTF-8'));
    $particulas = ['de', 'del', 'la', 'las', 'los', 'y', 'e'];

    foreach ($palabras as $i => $palabra) {
        $minuscula = mb_strtolower($palabra, 'UTF-8');
        if ($i > 0 && in_array($minuscula, $particulas, true)) {
            $palabras[$i] = $minuscula;
        }
    }

    return implode(' ', $palabras);
}

/**
 * Arma el saludo: devuelve `asunto`, `html` y `texto` (la versión para clientes
 * que no muestran HTML).
 *
 * El escapado va acá, al imprimir: el nombre llega tal cual de la hoja.
 */
function cuerpoCumpleanos(string $nombre, DateTimeImmutable $hoy): array
{
    $nombre = nombrePropio($nombre);
    $primero = explode(' ', $nombre)[0];

    $plantilla = @file_get_contents(RUTA_PLANTILLA_CUMPLEANOS);
    if ($plantilla === false || $plantilla === '') {
        throw new RuntimeException('no se pudo leer la plantilla ' . RUTA_PLANTILLA_CUMPLEANOS);
    }

    $e = function (string $texto): string {
        return htmlspecialchars($texto, ENT_QUOTES, 'UTF-8');
    };

    $html = strtr($plantilla, [
        '{{NOMBRE}}'        => $e($nombre),
        '{{PRIMER_NOMBRE}}' => $e($primero),
        // Escrita a mano y no con strftime ni IntlDateFormatter: el primero
        // está obsoleto desde PHP 8.1 y el segundo depende de que el hosting
        // tenga la extensión intl, que no se puede dar por hecho.
        '{{FECHA}}'         => (int) $hoy->format('j') . ' de ' . MESES_ES[(int) $hoy->format('n')]
                                . ' de ' . $hoy->format('Y'),
        '{{ANIO}}'          => $hoy->format('Y'),
    ]);

    // El mismo texto de la plantilla, para clientes que no muestran HTML.
    $texto = 'Feliz cumpleaños, ' . $nombre . "\n\n"
        . 'Hoy es un día muy especial y para nosotros es un honor acompañarte en él. '
        . 'Celebrar contigo cada etapa de tu vida es parte de lo que somos: una familia '
        . "que crece junto a sus asociados.\n\n"
        . 'Te deseamos un nuevo año lleno de salud, tranquilidad y metas cumplidas. '
        . "Recuerda que siempre estaremos aquí para apoyarte.\n\n"
        . "Con aprecio,\nFamilia FONDEFOS\n\n"
        . "FONDEFOS · Floridablanca, Santander\nfondefos.com.co";

    return [
        'asunto' => '🎉 ¡Feliz cumpleaños, ' . $primero . '!',
        'html'   => $html,
        'texto'  => $texto,
    ];
}

/**
 * Trae la lista de asociados de la hoja de cumpleaños.
 *
 * Devuelve null si no se pudo leer, y lo distingue de una lista vacía a
 * propósito: "no hay nadie" y "no sé" no pueden terminar igual, o un día con
 * Google caído se registraría como un día sin cumpleaños y nadie volvería a
 * intentar.
 */
function leerAsociadosDeHoja(): ?array
{
    $url = URLS_APPS_SCRIPT['cumpleanos'] ?? '';
    if ($url === '') {
        registrar('ERROR CUMPLEAÑOS: falta URLS_APPS_SCRIPT[\'cumpleanos\'] en config.php');
        return null;
    }

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => json_encode(['token' => TOKEN_HOJA]),
        CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
        CURLOPT_RETURNTRANSFER => true,
        // Apps Script responde 302 hacia googleusercontent; sin esto el cuerpo
        // nunca llega. Ver escribirEnHoja().
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_TIMEOUT        => TIEMPO_MAXIMO_HOJA,
    ]);

    $respuesta = curl_exec($ch);
    $codigo = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $fallo = curl_error($ch);

    if ($respuesta === false || $codigo !== 200) {
        registrar('ERROR CUMPLEAÑOS hoja: HTTP ' . $codigo . ' ' . $fallo);
        return null;
    }

    $json = json_decode((string) $respuesta, true);
    $acepto = is_array($json) && (!empty($json['ok']) || !empty($json['success']));
    if (!$acepto || !is_array($json['asociados'] ?? null)) {
        registrar('ERROR CUMPLEAÑOS hoja: ' . substr((string) $respuesta, 0, 300));
        return null;
    }

    return $json['asociados'];
}

/**
 * El estado de cada saludo de este año, indexado por correo.
 *
 * La tabla es lo que hace que correr el script varias veces el mismo día sea
 * inofensivo: el cron lo lanza cada hora y solo la primera corrida manda.
 */
function saludosDelAnio(int $anio): array
{
    $consulta = bd()->prepare(
        'SELECT correo, enviado_en, intentos FROM cumpleanos_enviados WHERE anio = :anio'
    );
    $consulta->execute([':anio' => $anio]);

    $estado = [];
    foreach ($consulta->fetchAll() as $fila) {
        $estado[strtolower($fila['correo'])] = $fila;
    }

    return $estado;
}

/** Anota que el saludo salió. */
function marcarSaludoEnviado(string $correo, string $nombre, int $anio): void
{
    bd()->prepare(
        'INSERT INTO cumpleanos_enviados (correo, anio, nombre, enviado_en, intentos)
         VALUES (:correo, :anio, :nombre, NOW(), 1)
         ON DUPLICATE KEY UPDATE enviado_en = NOW(), intentos = intentos + 1, ultimo_error = NULL'
    )->execute([':correo' => $correo, ':anio' => $anio, ':nombre' => mb_substr($nombre, 0, 160)]);
}

/** Anota un intento fallido y devuelve cuántos lleva. */
function anotarSaludoFallido(string $correo, string $nombre, int $anio, string $error): int
{
    $conexion = bd();
    $conexion->prepare(
        'INSERT INTO cumpleanos_enviados (correo, anio, nombre, intentos, ultimo_error)
         VALUES (:correo, :anio, :nombre, 1, :error)
         ON DUPLICATE KEY UPDATE intentos = intentos + 1, ultimo_error = VALUES(ultimo_error)'
    )->execute([
        ':correo' => $correo,
        ':anio'   => $anio,
        ':nombre' => mb_substr($nombre, 0, 160),
        ':error'  => mb_substr($error, 0, 255),
    ]);

    $lectura = $conexion->prepare(
        'SELECT intentos FROM cumpleanos_enviados WHERE correo = :correo AND anio = :anio'
    );
    $lectura->execute([':correo' => $correo, ':anio' => $anio]);

    return (int) $lectura->fetchColumn();
}

/**
 * Una conexión SMTP para toda la corrida.
 *
 * Misma configuración que despacharCorreos(), con `SMTPKeepAlive`: un día con
 * diez cumpleaños es una sola autenticación contra el servidor, no diez.
 */
function smtpCumpleanos(): PHPMailer
{
    $correo = new PHPMailer(true);
    $correo->CharSet = 'UTF-8';
    $correo->isSMTP();
    $correo->Host = SMTP_HOST;
    $correo->Port = SMTP_PUERTO;
    $correo->SMTPAuth = true;
    $correo->Username = SMTP_USUARIO;
    $correo->Password = SMTP_CLAVE;
    $correo->SMTPSecure = SMTP_PUERTO === 587
        ? PHPMailer::ENCRYPTION_STARTTLS
        : PHPMailer::ENCRYPTION_SMTPS;
    $correo->Timeout = TIEMPO_MAXIMO_SMTP;
    $correo->SMTPKeepAlive = true;

    // El remitente es el buzón del dominio, como todo lo que sale del sitio;
    // solo cambia el nombre visible. "Sitio web FONDEFOS" está bien para un
    // acuse de formulario, no para felicitar a alguien.
    $correo->setFrom(SMTP_USUARIO, defined('CUMPLEANOS_REMITENTE') ? CUMPLEANOS_REMITENTE : 'FONDEFOS');
    $correo->isHTML(true);

    return $correo;
}

/**
 * Manda un saludo por una conexión ya abierta. Devuelve '' si salió o el
 * mensaje de error si no.
 */
function enviarSaludo(PHPMailer $correo, array $persona, DateTimeImmutable $hoy): string
{
    try {
        $saludo = cuerpoCumpleanos($persona['nombre'], $hoy);

        // Sin adjuntarLogo(): este diseño escribe la marca en texto. Una imagen
        // embebida que el HTML no usa, Outlook y Apple Mail la muestran como
        // adjunto suelto al pie del saludo.
        $correo->clearAddresses();

        // En pruebas nunca se le escribe a un asociado. El asunto dice a quién
        // le habría llegado, que es lo que se quiere verificar.
        if (ENTORNO === 'produccion') {
            $correo->addAddress($persona['correo'], nombrePropio($persona['nombre']));
            $correo->Subject = $saludo['asunto'];
        } else {
            $correo->addAddress(CORREO_PRUEBAS);
            $correo->Subject = '[PRUEBA → ' . $persona['correo'] . '] ' . $saludo['asunto'];
        }

        $correo->Body = $saludo['html'];
        $correo->AltBody = $saludo['texto'];
        $correo->send();

        return '';
    } catch (Throwable $error) {
        // Con SMTPKeepAlive, un fallo a mitad de diálogo deja la sesión en un
        // estado que el siguiente send() no espera. RSET la devuelve al
        // principio; si la conexión ya se cayó, PHPMailer reconecta solo.
        try {
            $correo->getSMTPInstance()->reset();
        } catch (Throwable $ignorado) {
        }

        return $error->getMessage() !== '' ? $error->getMessage() : 'error desconocido';
    }
}
