<?php
// Funciones compartidas entre enviar.php y reintentar.php.
//
// Están acá y no dentro de enviar.php porque el cron de reintentos necesita
// escribirEnHoja() y registrar(), y duplicarlas sería garantizar que un día
// las dos copias dejen de coincidir.

declare(strict_types=1);

use PHPMailer\PHPMailer\PHPMailer;

/**
 * Cierra la petición con un JSON. Los mensajes son códigos, no frases: la
 * traducción vive en el frontend (src/lib/enviarFormulario.js) y así el
 * servidor no filtra detalles internos ni tiene que saber el idioma del sitio.
 */
function responder(int $codigo, array $cuerpo): void
{
    http_response_code($codigo);
    echo json_encode($cuerpo, JSON_UNESCAPED_UNICODE);
    exit;
}

function registrar(string $linea): void
{
    @file_put_contents(
        RUTA_ESTADO . '/registro-' . date('Y-m') . '.log',
        date('c') . ' ' . $linea . PHP_EOL,
        FILE_APPEND | LOCK_EX
    );
}

/**
 * Emite las cabeceras de CORS solo si el origen está en la lista. Nunca un
 * comodín: con `*` cualquier sitio podría usar el endpoint desde el navegador
 * de un visitante.
 *
 * En producción el SPA y el endpoint comparten dominio, así que el navegador
 * no manda Origin en estas peticiones y esto no se activa. Existe para el
 * proxy de desarrollo y para bloquear el uso desde otro sitio web.
 *
 * No es una frontera de seguridad: un cliente que no sea navegador puede
 * falsear la cabecera. Las defensas reales son la validación, el límite por IP
 * y el tiempo mínimo.
 */
function aplicarCors(): void
{
    $origen = $_SERVER['HTTP_ORIGIN'] ?? '';
    if ($origen === '') {
        return;
    }

    if (!in_array($origen, ORIGENES_PERMITIDOS, true)) {
        responder(403, ['ok' => false, 'error' => 'origen_no_permitido']);
    }

    header('Access-Control-Allow-Origin: ' . $origen);
    header('Access-Control-Allow-Methods: POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type');
    header('Access-Control-Max-Age: 86400');
    header('Vary: Origin');
}

/**
 * Guarda el PNG de la firma fuera de public_html y devuelve su ruta.
 *
 * Va como archivo y no como BLOB en la base: son decenas de KB por envío que
 * no se consultan nunca, solo se abren. El respaldo de cPanel cubre archivos y
 * base por igual, así que no se pierde nada por separarlos.
 */
function guardarFirma(string $radicado, string $firma): string
{
    if ($firma === '') {
        return '';
    }

    $binario = base64_decode(
        (string) preg_replace('#^data:image/png;base64,#', '', $firma),
        true
    );
    if ($binario === false || $binario === '') {
        return '';
    }

    $ruta = RUTA_ESTADO . '/firmas/' . $radicado . '.png';
    if (@file_put_contents($ruta, $binario) === false) {
        registrar('ERROR: no se pudo escribir la firma de ' . $radicado);
        return '';
    }

    return $ruta;
}

/**
 * Cinco envíos por hora y por IP.
 *
 * Se queda en archivo y no en la base a propósito: es dato efímero que se
 * descarta a la hora, y meterlo en MySQL sumaría dos escrituras a cada
 * petición —incluidas las que se van a rechazar— sin ganar nada.
 */
function limitarPorIp(string $ip): void
{
    $archivo = RUTA_ESTADO . '/limite.json';
    $ahora = time();

    $registro = is_file($archivo)
        ? json_decode((string) file_get_contents($archivo), true)
        : [];
    if (!is_array($registro)) {
        $registro = [];
    }

    // Se limpia en cada visita: si no, el archivo crece sin techo.
    foreach ($registro as $direccion => $marcas) {
        $vigentes = array_values(array_filter(
            is_array($marcas) ? $marcas : [],
            function ($marca) use ($ahora) {
                return is_int($marca) && $marca > $ahora - 3600;
            }
        ));
        if ($vigentes) {
            $registro[$direccion] = $vigentes;
        } else {
            unset($registro[$direccion]);
        }
    }

    $propias = $registro[$ip] ?? [];
    if (count($propias) >= 5) {
        registrar('LIMITE alcanzado por ' . $ip);
        responder(429, ['ok' => false, 'error' => 'limite_alcanzado']);
    }

    $propias[] = $ahora;
    $registro[$ip] = $propias;
    @file_put_contents($archivo, json_encode($registro), LOCK_EX);
}

/**
 * Verifica el token de reCAPTCHA v3. Sin RECAPTCHA_SECRETO configurado no hace
 * nada y devuelve true: queda cableado pero apagado.
 */
function verificarRecaptcha(string $token): bool
{
    if (RECAPTCHA_SECRETO === '') {
        return true;
    }
    if ($token === '' || !function_exists('curl_init')) {
        return false;
    }

    $ch = curl_init('https://www.google.com/recaptcha/api/siteverify');
    curl_setopt_array($ch, [
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => http_build_query([
            'secret'   => RECAPTCHA_SECRETO,
            'response' => $token,
            'remoteip' => $_SERVER['REMOTE_ADDR'] ?? '',
        ]),
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT        => 10,
    ]);
    $respuesta = curl_exec($ch);
    curl_close($ch);

    if ($respuesta === false) {
        registrar('ERROR reCAPTCHA: sin respuesta de Google');
        return false;
    }

    $json = json_decode((string) $respuesta, true);
    if (!is_array($json) || empty($json['success'])) {
        return false;
    }

    return (float) ($json['score'] ?? 0) >= RECAPTCHA_MINIMO;
}

/**
 * Manda el aviso interno y, si el formulario pide correo, el acuse de recibo.
 * Devuelve true solo si el aviso interno salió.
 */
function enviarCorreos(
    array $definicion,
    array $valores,
    string $radicado,
    string $fecha,
    string $firma,
    string $correoRemitente
): bool {
    // El escapado va acá, al imprimir, y NO al recibir el dato. Escapar en la
    // entrada corrompe lo que se guarda: alguien apellidado D'Angelo quedaría
    // como D&#039;Angelo en el correo, en la hoja y en todo lo que se lea
    // después.
    // $valores viene indexado por el id del campo; la etiqueta legible se
    // busca en la definición, que es donde vive.
    $filas = '';
    foreach ($definicion['campos'] as $id => $campo) {
        $filas .= '<tr>'
            . '<td style="padding:6px 12px;border:1px solid #ddd;background:#f6f6f6;"><strong>'
            . htmlspecialchars($campo['etiqueta'], ENT_QUOTES, 'UTF-8')
            . '</strong></td>'
            . '<td style="padding:6px 12px;border:1px solid #ddd;">'
            . nl2br(htmlspecialchars((string) ($valores[$id] ?? ''), ENT_QUOTES, 'UTF-8'))
            . '</td></tr>';
    }

    $cuerpo = '<p><strong>Radicado ' . htmlspecialchars($radicado, ENT_QUOTES, 'UTF-8') . '</strong><br>'
        . htmlspecialchars($definicion['nombre'], ENT_QUOTES, 'UTF-8')
        . '<br>Recibido el ' . htmlspecialchars($fecha, ENT_QUOTES, 'UTF-8') . '</p>'
        . '<table style="border-collapse:collapse;font-family:sans-serif;font-size:14px;">'
        . $filas . '</table>';

    // En pruebas nunca se escribe al buzón del cliente.
    $destinatarios = ENTORNO === 'produccion'
        ? $definicion['destinatarios']
        : [CORREO_PRUEBAS];

    try {
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

        $correo->setFrom(SMTP_USUARIO, SMTP_NOMBRE);
        foreach ($destinatarios as $destino) {
            $correo->addAddress($destino);
        }

        // Responder desde Gmail le contesta directo a la persona. El valor ya
        // pasó por FILTER_VALIDATE_EMAIL, así que no hay inyección de
        // cabeceras posible.
        if ($correoRemitente !== '') {
            $correo->addReplyTo($correoRemitente);
        }

        $correo->Subject = '[' . $radicado . '] ' . $definicion['nombre'];
        $correo->isHTML(true);
        $correo->Body = $cuerpo;
        $correo->AltBody = trim(strip_tags(str_replace(['</tr>', '</td>'], ["\n", ' '], $cuerpo)));

        if ($firma !== '') {
            $binario = base64_decode(
                (string) preg_replace('#^data:image/png;base64,#', '', $firma),
                true
            );
            if ($binario !== false && $binario !== '') {
                $correo->addStringAttachment($binario, $radicado . '-firma.png', 'base64', 'image/png');
            }
        }

        $correo->send();

        // Acuse de recibo. Solo existe si el formulario pide correo: el formato
        // del Programa 100 no lo hace, así que ahí no hay a dónde mandarlo.
        if ($correoRemitente !== '') {
            $correo->clearAddresses();
            $correo->clearReplyTos();
            $correo->clearAttachments();
            $correo->addAddress($correoRemitente);
            $correo->Subject = 'Recibimos tu mensaje — radicado ' . $radicado;
            $correo->Body = '<p>Hola,</p>'
                . '<p>Recibimos tu mensaje el ' . htmlspecialchars($fecha, ENT_QUOTES, 'UTF-8')
                . '. Tu número de radicado es <strong>'
                . htmlspecialchars($radicado, ENT_QUOTES, 'UTF-8')
                . '</strong>. Guardalo para cualquier consulta.</p>'
                . '<p>Te responderemos al correo o al teléfono que dejaste.</p>'
                . '<p>FONDEFOS — Fondo de Empleados</p>';
            $correo->AltBody = trim(strip_tags($correo->Body));
            $correo->send();
        }

        return true;
    } catch (Throwable $error) {
        // El detalle va al log, nunca a la respuesta.
        registrar('ERROR SMTP ' . $radicado . ': ' . $error->getMessage());
        return false;
    }
}

/**
 * Escribe la fila en el Google Sheet del formulario.
 *
 * Cada formulario tiene su propia hoja de cálculo y su propio Apps Script, así
 * que hay una URL por formulario en vez de una sola repartiendo por dentro.
 * La clave del formulario viaja en la carga para que el reintento sepa a cuál
 * de las dos hojas mandar cada pendiente.
 */
function escribirEnHoja(array $carga): bool
{
    if (!function_exists('curl_init')) {
        registrar('ERROR: la extensión curl no está activa.');
        return false;
    }

    $clave = (string) ($carga['clave_formulario'] ?? '');
    $url = URLS_APPS_SCRIPT[$clave] ?? '';
    if ($url === '') {
        registrar('ERROR Sheet: no hay webhook configurado para "' . $clave . '"');
        return false;
    }

    // No se le manda al Apps Script: es de uso interno del backend.
    unset($carga['clave_formulario']);

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => json_encode($carga, JSON_UNESCAPED_UNICODE),
        CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
        CURLOPT_RETURNTRANSFER => true,
        // Apps Script responde 302 hacia googleusercontent. Sin esto el cuerpo
        // de la respuesta nunca llega y no habría forma de saber si escribió.
        CURLOPT_FOLLOWLOCATION => true,
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_TIMEOUT        => 20,
    ]);

    $respuesta = curl_exec($ch);
    $codigo = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $fallo = curl_error($ch);
    curl_close($ch);

    $radicado = $carga['radicado'] ?? 'sin-radicado';

    if ($respuesta === false || $codigo !== 200) {
        registrar('ERROR Sheet ' . $radicado . ': HTTP ' . $codigo . ' ' . $fallo);
        return false;
    }

    // Se aceptan las dos claves. Si el script devolviera solo la que acá no se
    // mira, toda escritura exitosa se leería como fallida, el envío quedaría
    // marcado pendiente y el cron reenviaría la misma fila cada 15 minutos
    // para siempre, duplicándola en la hoja.
    $json = json_decode((string) $respuesta, true);
    $acepto = is_array($json) && (!empty($json['ok']) || !empty($json['success']));
    if (!$acepto) {
        registrar('ERROR Sheet ' . $radicado . ': ' . substr((string) $respuesta, 0, 300));
        return false;
    }

    return true;
}
