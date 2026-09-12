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

/**
 * Contesta al navegador y sigue trabajando con la conexión ya cerrada.
 *
 * El envío se guarda en MySQL en menos de un parpadeo, pero después hay que
 * mandar el correo por SMTP y escribir en el Google Sheet, y eso son segundos:
 * el Apps Script responde con un 302 que hay que seguir, y a veces tarda. La
 * persona quedaba mirando el botón mientras tanto, y en una red móvil lenta el
 * navegador cortaba la espera antes de recibir nada: el formulario mostraba
 * "no se pudo enviar" cuando en realidad había entrado perfecto.
 *
 * Acá se le contesta apenas la base confirma, que es lo único que decide si el
 * envío existe. El correo y la hoja son derivados: se hacen después, y si
 * fallan quedan marcados y el cron los recupera.
 *
 * `ignore_user_abort` es la pieza que hace que esto funcione: sin eso, PHP mata
 * el proceso cuando la conexión se cierra y no se mandaría ningún correo.
 */
function responderYSeguir(int $codigo, array $cuerpo): void
{
    $json = json_encode($cuerpo, JSON_UNESCAPED_UNICODE);

    ignore_user_abort(true);
    set_time_limit(120);

    http_response_code($codigo);
    header('Content-Length: ' . strlen($json));
    header('Connection: close');
    echo $json;

    // Con PHP-FPM y con el LiteSpeed de cPanel esta función cierra la conexión
    // de verdad y deja el proceso corriendo. Es el camino bueno.
    if (function_exists('fastcgi_finish_request')) {
        fastcgi_finish_request();
        return;
    }

    // Sin FastCGI se vacían los búferes a mano. No garantiza que el navegador
    // corte la espera —depende del servidor de adelante—, pero no rompe nada:
    // en el peor caso la petición dura lo que duraba antes.
    while (ob_get_level() > 0) {
        ob_end_flush();
    }
    flush();
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

// Paleta de la marca, la misma de frontend/src/styles/index.css. Va acá
// duplicada a propósito: el correo se arma en el servidor y no tiene forma de
// leer el CSS del sitio. Si cambian los colores de la marca, se cambian en los
// dos lados.
const CORREO_AZUL     = '#01509C';
const CORREO_AZUL_OSC = '#10305f';
const CORREO_NARANJA  = '#F36F21';
const CORREO_TINTA    = '#152238';
const CORREO_TEXTO    = '#3d4a5c';
const CORREO_SUAVE    = '#667487';
const CORREO_FONDO    = '#f4f8fd';
const CORREO_CELDA    = '#e7eff8';
const CORREO_BORDE    = '#d3e0ee';

/**
 * Pasa el `Y-m-d H:i:s` que se guarda en MySQL al formato que lee una persona:
 * "11/09/2026 · 7:48 pm".
 *
 * No convierte zonas horarias y no tiene por qué: enviar.php fija
 * America/Bogota antes de generar la fecha, así que el valor que entra ya es
 * hora de Floridablanca. Esto es presentación, nada más.
 *
 * Mismo formato que usan los Apps Script en la hoja —dd/MM/yyyy y hh:mm a en
 * minúscula— para que el correo, la hoja y la base se lean igual.
 */
function fechaLegible(string $fecha): string
{
    $momento = date_create($fecha);
    if ($momento === false) {
        return $fecha;
    }

    return $momento->format('d/m/Y') . ' · ' . strtolower($momento->format('g:i a'));
}

// El logotipo blanco del pie del sitio, copiado acá para que viaje con la
// carpeta api/ y tenga una ruta estable. El del sitio no sirve: Vite le pone un
// hash al nombre en cada build y la URL cambiaría sola.
const RUTA_LOGO = __DIR__ . '/marca/logo-fondefos-blanco.png';

// Identificador del logotipo adjunto. Va embebido en el propio correo y no
// enlazado a fondefos.com.co: casi todos los clientes bloquean las imágenes
// remotas hasta que la persona da "mostrar imágenes", y ahí el encabezado se ve
// roto justo en el primer correo, que es el que cuenta.
const LOGO_CID = 'logo-fondefos';

/**
 * Envuelve el contenido en la plantilla de la marca.
 *
 * Todo va con estilos en línea y maquetado con tablas. No es descuido: Gmail
 * descarta las hojas de estilo embebidas, y Outlook usa el motor de Word, que
 * no entiende flexbox ni grid. Lo aburrido es lo que se ve igual en todos
 * lados.
 *
 * El ancho de 600px es el de siempre para correo: entra en la vista previa de
 * escritorio sin barras y se adapta solo en el teléfono.
 *
 * $encabezado es la línea bajo la marca: de qué formulario se trata.
 */
function plantillaCorreo(
    string $titulo,
    string $bajada,
    string $contenido,
    string $encabezado = ''
): string {
    $e = function (string $texto): string {
        return htmlspecialchars($texto, ENT_QUOTES, 'UTF-8');
    };

    return '<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8">'
        . '<meta name="viewport" content="width=device-width,initial-scale=1">'
        . '<title>' . $e($titulo) . '</title>'

        // Única hoja de estilos del correo, y solo para el teléfono. Gmail
        // descarta los <style> en escritorio pero respeta las media queries en
        // su aplicación móvil, que es donde el problema se ve: la etiqueta y el
        // valor peleando por el ancho en dos columnas de pantalla angosta.
        //
        // Apiladas, cada una se lee entera. Si un cliente ignora el bloque, se
        // queda con la tabla de dos columnas de siempre: se ve apretado, no
        // roto.
        . '<style>'
        . '@media only screen and (max-width:600px){'
        . '.campo-etiqueta,.campo-valor{display:block!important;width:100%!important;'
        . 'box-sizing:border-box!important;}'
        . '.campo-etiqueta{padding:8px 14px 2px!important;border-bottom:0!important;}'
        . '.campo-valor{padding:0 14px 10px!important;}'
        . '.marco{padding:20px!important;}'
        . '}'
        . '</style></head>'
        . '<body style="margin:0;padding:0;background:' . CORREO_FONDO . ';">'

        // Texto de vista previa: lo que se lee en la bandeja debajo del asunto,
        // sin abrir el correo. Oculto en el cuerpo.
        . '<div style="display:none;max-height:0;overflow:hidden;opacity:0;">'
        . $e($bajada) . '</div>'

        . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0"'
        . ' style="background:' . CORREO_FONDO . ';padding:24px 12px;">'
        . '<tr><td align="center">'

        . '<table role="presentation" width="600" cellpadding="0" cellspacing="0"'
        . ' style="width:100%;max-width:600px;background:#ffffff;border-radius:8px;'
        . 'overflow:hidden;border:1px solid ' . CORREO_BORDE . ';'
        . 'font-family:Arial,Helvetica,sans-serif;">'

        // Encabezado, centrado. El `alt` importa más que de costumbre: si el
        // cliente de correo no muestra la imagen, ahí queda la marca escrita.
        . '<tr><td align="center" style="background:' . CORREO_AZUL . ';'
        . 'padding:26px 28px 22px;text-align:center;">'
        . '<img src="cid:' . LOGO_CID . '" alt="FONDEFOS" width="205" height="42"'
        . ' style="display:block;margin:0 auto;border:0;outline:none;'
        . 'width:205px;height:auto;max-width:60%;">'
        . '<div style="color:#cfe0f2;font-size:12px;padding-top:10px;'
        . 'letter-spacing:0.5px;text-align:center;">Fondo de Empleados</div>'
        . ($encabezado !== ''
            ? '<div style="color:#ffffff;font-size:14px;font-weight:bold;'
                . 'padding-top:14px;text-align:center;">Formulario de '
                . $e($encabezado) . '</div>'
            : '')
        . '</td></tr>'

        // Franja naranja: corta el azul y da el acento de la marca.
        . '<tr><td style="background:' . CORREO_NARANJA . ';height:4px;'
        . 'line-height:4px;font-size:0;">&nbsp;</td></tr>'

        . '<tr><td class="marco" style="padding:28px;">' . $contenido . '</td></tr>'

        // Pie
        . '<tr><td align="center" style="background:' . CORREO_FONDO . ';'
        . 'padding:18px 28px;border-top:1px solid ' . CORREO_BORDE . ';'
        . 'text-align:center;">'
        . '<div style="color:' . CORREO_SUAVE . ';font-size:11px;line-height:17px;'
        . 'text-align:center;">'
        . 'Mensaje automático del sitio fondefos.com.co. No hace falta responderlo.<br>'
        . 'FONDEFOS — Fondo de Empleados · Floridablanca, Santander'
        . '</div></td></tr>'

        . '</table></td></tr></table></body></html>';
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
    $cuando = fechaLegible($fecha);
    $aviso = cuerpoAviso($definicion, $valores, $radicado, $fecha, $firma, $correoRemitente);
    $cuerpo = $aviso['html'];
    $llanoCompleto = $aviso['texto'];

    $e = function (string $texto): string {
        return htmlspecialchars($texto, ENT_QUOTES, 'UTF-8');
    };

    // En pruebas nunca se escribe al buzón del cliente.
    $destinatarios = ENTORNO === 'produccion'
        ? $definicion['destinatarios']
        : [CORREO_PRUEBAS];

    return despacharCorreos(
        $definicion,
        $destinatarios,
        $radicado,
        $cuando,
        $firma,
        $correoRemitente,
        $cuerpo,
        $llanoCompleto,
        $e
    );
}

/**
 * Arma el aviso interno: devuelve `html` y `texto`, la versión para clientes
 * que no muestran HTML.
 *
 * Está separado del envío para poder verlo sin mandar un correo: eso es lo que
 * hace `vista-previa-correo.php`.
 */
function cuerpoAviso(
    array $definicion,
    array $valores,
    string $radicado,
    string $fecha,
    string $firma,
    string $correoRemitente
): array {
    // El escapado va acá, al imprimir, y NO al recibir el dato. Escapar en la
    // entrada corrompe lo que se guarda: alguien apellidado D'Angelo quedaría
    // como D&#039;Angelo en el correo, en la hoja y en todo lo que se lea
    // después.
    // $valores viene indexado por el id del campo; la etiqueta legible se
    // busca en la definición, que es donde vive.
    $e = function (string $texto): string {
        return htmlspecialchars($texto, ENT_QUOTES, 'UTF-8');
    };

    $cuando = fechaLegible($fecha);

    $filas = '';
    $llano = '';
    foreach ($definicion['campos'] as $id => $campo) {
        $valor = (string) ($valores[$id] ?? '');

        // Un campo opcional vacío no aporta nada y alarga el correo: se omite.
        if (trim($valor) === '') {
            continue;
        }

        // Los montos se muestran con separador de miles: "150000" no se lee, y
        // a ojo se confunde con 15.000. Solo cambia acá, en el correo: en la
        // base y en la hoja sigue el valor tal como lo escribió la persona,
        // porque ahí se usa para calcular.
        if ($campo['tipo'] === 'monto' && is_numeric($valor)) {
            $valor = '$ ' . number_format((float) $valor, 0, ',', '.');
        }

        $filas .= '<tr>'
            . '<td class="campo-etiqueta" style="padding:10px 14px;background:' . CORREO_CELDA . ';'
            . 'border-bottom:1px solid #ffffff;color:' . CORREO_AZUL_OSC . ';'
            . 'font-size:12px;font-weight:bold;width:38%;vertical-align:top;">'
            . $e($campo['etiqueta'])
            . '</td>'
            . '<td class="campo-valor" style="padding:10px 14px;border-bottom:1px solid ' . CORREO_BORDE . ';'
            . 'color:' . CORREO_TEXTO . ';font-size:12px;line-height:19px;vertical-align:top;">'
            . nl2br($e($valor))
            . '</td></tr>';

        $llano .= $campo['etiqueta'] . ': ' . $valor . "\n";
    }

    $contenido =
        // Radicado: es el dato con el que después se busca el envío, así que va
        // primero y en grande.
        '<div style="color:' . CORREO_SUAVE . ';font-size:11px;'
        . 'letter-spacing:1px;text-transform:uppercase;">Radicado</div>'
        . '<div style="color:' . CORREO_AZUL . ';font-size:22px;font-weight:bold;'
        . 'padding:2px 0 14px;">' . $e($radicado) . '</div>'

        // El nombre del formulario ya va en el encabezado: acá solo la fecha.
        . '<div style="color:' . CORREO_SUAVE . ';font-size:12px;padding:0 0 18px;">'
        . 'Recibido el ' . $e($cuando) . '</div>'

        . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0"'
        . ' style="border-collapse:collapse;border:1px solid ' . CORREO_BORDE . ';'
        . 'border-radius:6px;overflow:hidden;">' . $filas . '</table>';

    if ($firma !== '') {
        $contenido .= '<div style="padding-top:18px;color:' . CORREO_SUAVE . ';'
            . 'font-size:12px;">La firma va adjunta a este correo, en PNG.</div>';
    }

    if ($correoRemitente !== '') {
        $contenido .= '<div style="padding-top:18px;color:' . CORREO_SUAVE . ';'
            . 'font-size:12px;">Respondiendo este correo le llega directo a '
            . $e($correoRemitente) . '.</div>';
    }

    $cuerpo = plantillaCorreo(
        $definicion['nombre'],
        'Radicado ' . $radicado . ' · ' . $cuando,
        $contenido,
        $definicion['nombre']
    );

    // La versión de texto plano se arma aparte y no con strip_tags del cuerpo:
    // sobre una plantilla con tablas eso deja un reguero de espacios y saltos.
    $llanoCompleto = $definicion['nombre'] . "\n"
        . 'Radicado ' . $radicado . "\n"
        . 'Recibido el ' . $cuando . "\n\n"
        . $llano;

    return ['html' => $cuerpo, 'texto' => $llanoCompleto];
}

/**
 * Embebe el logotipo del encabezado en el propio correo.
 *
 * Si el archivo no está —por ejemplo si al desplegar se subió api/ sin la
 * carpeta marca/—, no se interrumpe nada: el <img> queda roto y en su lugar se
 * lee el texto alternativo "FONDEFOS". Un correo sin logotipo se manda igual;
 * un correo que no sale porque faltaba una imagen, no.
 */
function adjuntarLogo(PHPMailer $correo): void
{
    if (!is_file(RUTA_LOGO)) {
        registrar('AVISO: falta el logotipo del correo en ' . RUTA_LOGO);
        return;
    }

    try {
        $correo->addEmbeddedImage(RUTA_LOGO, LOGO_CID, 'fondefos.png', 'base64', 'image/png');
    } catch (Throwable $error) {
        registrar('AVISO: no se pudo embeber el logotipo: ' . $error->getMessage());
    }
}

/**
 * Manda el aviso interno y, si hay a quién, el acuse de recibo.
 */
function despacharCorreos(
    array $definicion,
    array $destinatarios,
    string $radicado,
    string $cuando,
    string $firma,
    string $correoRemitente,
    string $cuerpo,
    string $llanoCompleto,
    callable $e
): bool {
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

        adjuntarLogo($correo);

        // Responder desde Gmail le contesta directo a la persona. El valor ya
        // pasó por FILTER_VALIDATE_EMAIL, así que no hay inyección de
        // cabeceras posible.
        if ($correoRemitente !== '') {
            $correo->addReplyTo($correoRemitente);
        }

        $correo->Subject = '[' . $radicado . '] ' . $definicion['nombre'];
        $correo->isHTML(true);
        $correo->Body = $cuerpo;
        $correo->AltBody = trim($llanoCompleto);

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

            // clearAttachments() se lleva también las imágenes embebidas, así
            // que el logotipo hay que volver a ponerlo o el acuse sale con el
            // encabezado roto.
            $correo->clearAttachments();
            adjuntarLogo($correo);

            $correo->addAddress($correoRemitente);
            $correo->Subject = 'Recibimos tu mensaje — radicado ' . $radicado;
            $correo->Body = plantillaCorreo(
                'Recibimos tu mensaje',
                'Tu radicado es ' . $radicado,
                '<div style="color:' . CORREO_TINTA . ';font-size:16px;'
                . 'font-weight:bold;padding-bottom:10px;">Recibimos tu mensaje</div>'

                . '<div style="color:' . CORREO_TEXTO . ';font-size:12px;'
                . 'line-height:20px;">Gracias por escribirnos. Registramos tu '
                . 'mensaje el ' . $e($cuando) . '.</div>'

                // El radicado enmarcado: es lo único que la persona tiene que
                // guardar, así que se separa del texto para que no se pierda.
                . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0"'
                . ' style="margin:18px 0;"><tr>'
                . '<td style="background:' . CORREO_FONDO . ';border-left:4px solid '
                . CORREO_NARANJA . ';padding:14px 18px;">'
                . '<div style="color:' . CORREO_SUAVE . ';font-size:11px;'
                . 'letter-spacing:1px;text-transform:uppercase;">Tu radicado</div>'
                . '<div style="color:' . CORREO_AZUL . ';font-size:20px;'
                . 'font-weight:bold;padding-top:2px;">' . $e($radicado) . '</div>'
                . '</td></tr></table>'

                . '<div style="color:' . CORREO_TEXTO . ';font-size:12px;'
                . 'line-height:20px;">Guardalo: con ese número ubicamos tu '
                . 'mensaje si necesitás consultarlo. Te respondemos al correo o '
                . 'al teléfono que dejaste.</div>',
                $definicion['nombre']
            );
            $correo->AltBody = "Recibimos tu mensaje\n\n"
                . 'Registramos tu mensaje el ' . $cuando . ".\n"
                . 'Tu radicado es ' . $radicado . ". Guardalo para cualquier consulta.\n\n"
                . "Te respondemos al correo o al teléfono que dejaste.\n\n"
                . 'FONDEFOS — Fondo de Empleados';
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
