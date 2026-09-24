<?php
// Funciones compartidas entre enviar.php y reintentar.php.
//
// Están acá y no dentro de enviar.php porque el cron de reintentos necesita
// escribirEnHoja() y registrar(), y duplicarlas sería garantizar que un día
// las dos copias dejen de coincidir.

declare(strict_types=1);

use PHPMailer\PHPMailer\PHPMailer;

/**
 * Lo máximo que puede tardar una entrega antes de que la demos por perdida.
 *
 * Están acá y no sueltos en cada llamada porque reintentar.php los necesita
 * para su presupuesto de tiempo: la única forma de que una corrida no se pase
 * del minuto es saber de antemano cuánto puede tardar lo próximo que va a
 * intentar. Si alguno de estos dos números cambia sin que el otro lado se
 * entere, el presupuesto deja de ser un presupuesto.
 *
 * Los dos son deliberadamente cortos. Antes de tener cola con candado, esperar
 * de más solo retrasaba a quien ya estaba esperando; ahora retrasa a todos los
 * que vienen detrás. Rendirse rápido y volver al minuto siguiente sale más
 * barato que insistir.
 */
const TIEMPO_MAXIMO_SMTP = 20;
const TIEMPO_MAXIMO_HOJA = 30;

/**
 * El tope del correo cuando sale DENTRO de la petición, con alguien esperando.
 *
 * Ocho y no veinte porque los dos fallos no cuestan lo mismo. Acá el costo de
 * insistir lo paga una persona mirando un botón que no responde; el de
 * rendirse no lo paga nadie, porque el envío ya está en MySQL y la cola lo
 * entrega en el minuto siguiente. Entre hacer esperar y entregar un minuto
 * más tarde, se elige entregar un minuto más tarde.
 *
 * Ocho segundos le sobran a un SMTP sano del mismo hosting: conectar, STARTTLS,
 * autenticar y mandar son milisegundos en la misma red. Lo que pase de ahí no
 * está sano y no va a mejorar por esperarlo diez segundos más.
 *
 * Un fallo acá NO cuenta como intento (`intentos_correo` no se toca): se
 * rindió con un tope más corto que el de la cola, así que no es la misma
 * pregunta y no tiene por qué gastar las oportunidades de la cola.
 */
const TIEMPO_MAXIMO_SMTP_EN_PETICION = 8;

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

// Acá vivía `responderYSeguir()`, que contestaba al navegador y seguía
// trabajando con la conexión cerrada para mandar el correo y escribir en la
// hoja sin hacer esperar a nadie.
//
// Se eliminó el 16/09/2026 porque en este hosting no funciona: LiteSpeed con
// lsphp recicla el proceso en `fastcgi_finish_request()` y nada de lo que
// venía después llegaba a ejecutarse. No dejaba rastro —ni línea en el
// registro ni error en el log de PHP—, así que estuvo semanas perdiendo
// correos en silencio.
//
// Si algún día el hosting pasa a PHP-FPM, el patrón vuelve a ser válido. Pero
// no hay que volver a atarle el correo: la cola de reintentar.php no depende
// del servidor y ya demostró que entrega.

/**
 * Escribe una línea en el registro como mucho una vez por día.
 *
 * Para condiciones permanentes del servidor, que son verdad en cada envío. La
 * de `exec()` deshabilitado se repitió en cada uno durante una semana: el
 * registro se llenó de la misma línea y lo que sí había que leer quedó
 * sepultado. Un aviso que aparece siempre deja de ser un aviso.
 *
 * Una vez al día y no una sola vez nunca más: si la condición se arregla y
 * vuelve, hay que enterarse. El testigo es un archivo con la fecha, así que se
 * reinicia solo al cambiar el día y no hay nada que limpiar.
 */
function avisarUnaVezAlDia(string $clave, string $linea): void
{
    $testigo = RUTA_ESTADO . '/aviso-' . $clave . '.txt';
    $hoy = date('Y-m-d');

    if (is_file($testigo) && trim((string) @file_get_contents($testigo)) === $hoy) {
        return;
    }

    @file_put_contents($testigo, $hoy);
    registrar($linea);
}

/**
 * Lanza el trabajo de la cola en un proceso aparte y vuelve enseguida.
 *
 * Esto es lo que devuelve la entrega instantánea sin volver a depender de que
 * el proceso web sobreviva a la respuesta. La diferencia con lo que había
 * antes es de fondo: no se trata de seguir trabajando después de contestar
 * —eso acá no funciona—, sino de que el trabajo lo haga OTRO proceso. El hijo
 * se desprende con `nohup` y la salida redirigida, así que cuando LiteSpeed
 * recicle al padre, el hijo ya no le pertenece y termina igual.
 *
 * El candado de reintentar.php es lo que hace esto seguro por mucho que se
 * dispare: si ya hay una corrida en curso, la nueva se va sin tocar nada. Sin
 * ese candado, diez envíos juntos serían diez procesos leyendo la misma cola
 * y mandando el mismo correo diez veces.
 *
 * Si el hosting tiene exec() deshabilitado —que es el caso de este, confirmado
 * en el registro— no hace nada. No es una falla y ya no retrasa el correo, que
 * desde el 23/09/2026 sale dentro de la petición: lo único que queda para el
 * cron es la fila de la hoja, y esa puede esperar un minuto.
 *
 * Se deja igual porque es correcta el día que el hosting cambie, y porque el
 * aviso de que no se puede es información que hay que tener a mano.
 */
function dispararCola(): void
{
    $deshabilitadas = array_map('trim', explode(',', (string) ini_get('disable_functions')));
    if (!function_exists('exec') || in_array('exec', $deshabilitadas, true)) {
        avisarUnaVezAlDia(
            'exec-no-disponible',
            'AVISO: exec() no disponible; la hoja queda a cargo del cron.'
        );
        return;
    }

    // En cPanel el binario de consola suele ser /usr/local/bin/php. PHP_BINARY
    // apunta al lsphp de la petición web, que no siempre sirve para lanzar un
    // proceso de consola, así que se puede fijar en el config.
    $php = defined('RUTA_PHP_CLI') && RUTA_PHP_CLI !== ''
        ? RUTA_PHP_CLI
        : '/usr/local/bin/php';
    $guion = __DIR__ . '/reintentar.php';

    if (!is_file($php)) {
        // También es una condición permanente: la ruta no va a aparecer sola
        // entre un envío y el siguiente.
        avisarUnaVezAlDia(
            'sin-php-cli',
            'AVISO: no existe el PHP de consola en ' . $php . '; la hoja queda a cargo del cron.'
        );
        return;
    }

    $inicio = microtime(true);

    if (DIRECTORY_SEPARATOR === '\\') {
        // Windows (el XAMPP de desarrollo). `exec()` con `start /B` se queda
        // esperando igual —medido: 8 s con un hijo de 8 s— porque comparte la
        // consola. Con popen/pclose vuelve en centésimas.
        $tuberia = popen(
            sprintf('start /B "" %s %s', escapeshellarg($php), escapeshellarg($guion)),
            'r'
        );
        if ($tuberia !== false) {
            pclose($tuberia);
        }
    } else {
        // Linux (el servidor). Las tres piezas hacen falta: `nohup` para que
        // no lo mate la señal de cuelgue cuando LiteSpeed cierra la petición,
        // la redirección para que exec() no espere a que se cierre la salida,
        // y el `&` para que el shell devuelva el control enseguida. Si falta
        // cualquiera de las tres, la persona vuelve a esperar por el correo.
        @exec(sprintf(
            'nohup %s %s > /dev/null 2>&1 &',
            escapeshellarg($php),
            escapeshellarg($guion)
        ));
    }

    // Testigo. Lanzar un proceso son milisegundos; si esto tarda, es que el
    // hijo NO se desprendió y la persona está esperando por el correo otra
    // vez. Mejor que lo diga el registro a que lo descubramos por una queja.
    $tardanza = microtime(true) - $inicio;
    if ($tardanza > 1.0) {
        registrar(sprintf(
            'AVISO: lanzar la cola tardó %.1f s — el proceso no se está desprendiendo.',
            $tardanza
        ));
    }
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
 * Lo más que puede medir la firma que llega del navegador, en caracteres de la
 * cadena base64.
 *
 * Está acá y no suelto en enviar.php porque es el par del control de contenido
 * de guardarFirma(): los dos acotan lo mismo desde dos ángulos —cuánto pesa y
 * qué es— y separarlos es garantizar que un día uno cambie sin el otro.
 *
 * 400 000 caracteres son unos 300 KB de PNG. Una firma de este lienzo pesa
 * decenas de KB, así que el margen es amplio a propósito: el objetivo es poner
 * un techo, no apretar a quien firma con un dedo grande en una pantalla densa.
 */
const MAXIMO_FIRMA_BASE64 = 400000;

/**
 * Los ocho bytes con los que empieza todo PNG. Están en la especificación y no
 * dependen del programa que lo haya generado.
 */
const FIRMA_PNG_BYTES_MAGICOS = "\x89PNG\r\n\x1a\n";

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

    // Que la cadena empiece con `data:image/png;base64,` no la hace un PNG: ese
    // prefijo lo escribe quien envía y no dice nada de los bytes que vienen
    // detrás. Sin esta comprobación se guardaba con nombre .png cualquier cosa
    // que decodificara, y eso mismo se adjuntaba al correo del fondo.
    //
    // Se mira la firma del formato y además se pide que getimagesizefromstring
    // lo reconozca: lo primero descarta el contenido que no es PNG, lo segundo
    // el PNG con la cabecera correcta y el resto roto.
    //
    // Devolver '' es lo correcto y no rechazar el envío: acá ya estamos después
    // de validar, y perder una firma es malo, perder la inscripción entera es
    // peor. El motivo queda en el registro para poder verlo.
    if (strncmp($binario, FIRMA_PNG_BYTES_MAGICOS, 8) !== 0
        || @getimagesizefromstring($binario) === false) {
        registrar('FIRMA descartada: el contenido no es un PNG (' . $radicado . ')');
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
 * La IP real de quien envía, no la del proxy.
 *
 * El sitio está detrás de Cloudflare, así que `REMOTE_ADDR` puede ser una IP
 * del borde de Cloudflare y no la de la persona. Si el servidor no restaura la
 * original, TODO el tráfico del sitio llega con un puñado de direcciones
 * repetidas y el límite por IP deja de ser «por persona» para volverse «por
 * sitio»: cinco envíos por hora en total, de todo el mundo.
 *
 * `CF-Connecting-IP` trae la verdadera, pero solo se acepta cuando la petición
 * viene de un rango de Cloudflare. Es una cabecera y cualquiera puede
 * escribirla: creerle a ciegas sería regalar la forma de saltarse el límite
 * cambiando un valor en cada intento.
 */
function ipDelCliente(): string
{
    $directa = (string) ($_SERVER['REMOTE_ADDR'] ?? '0.0.0.0');
    $reenviada = (string) ($_SERVER['HTTP_CF_CONNECTING_IP'] ?? '');

    if ($reenviada === '' || !filter_var($reenviada, FILTER_VALIDATE_IP)) {
        return $directa;
    }

    // Rangos publicados por Cloudflare. Cambian muy de vez en cuando; si algún
    // día dejara de reconocerlos, lo peor que pasa es volver a contar por la IP
    // del proxy, que es exactamente como estaba antes.
    $rangosCloudflare = [
        '173.245.48.0/20', '103.21.244.0/22', '103.22.200.0/22', '103.31.4.0/22',
        '141.101.64.0/18', '108.162.192.0/18', '190.93.240.0/20', '188.114.96.0/20',
        '197.234.240.0/22', '198.41.128.0/17', '162.158.0.0/15', '104.16.0.0/13',
        '104.24.0.0/14', '172.64.0.0/13', '131.0.72.0/22',
    ];

    foreach ($rangosCloudflare as $rango) {
        [$red, $bits] = explode('/', $rango);
        $mascara = -1 << (32 - (int) $bits);
        if ((ip2long($directa) & $mascara) === (ip2long($red) & $mascara)) {
            return $reenviada;
        }
    }

    return $directa;
}

/**
 * Límite de envíos por hora y por IP.
 *
 * El tope sale de LIMITE_POR_IP si el config lo define; si no, treinta. Empezó
 * en cinco y era demasiado poco para este público: los asociados escriben desde
 * la red de la clínica, así que decenas de personas comparten una sola IP
 * pública y entre todas agotaban el cupo en minutos. El que frena el spam de
 * verdad es el filtro de contenido; esto es solo un techo contra una avalancha.
 *
 * Se queda en archivo y no en la base a propósito: es dato efímero que se
 * descarta a la hora, y meterlo en MySQL sumaría dos escrituras a cada
 * petición —incluidas las que se van a rechazar— sin ganar nada.
 */
function limitarPorIp(string $ip): void
{
    $tope = defined('LIMITE_POR_IP') ? (int) LIMITE_POR_IP : 30;

    $archivo = RUTA_ESTADO . '/limite.json';
    $ahora = time();

    // Un solo descriptor con el candado tomado alrededor de leer, contar y
    // escribir. Antes se leía con file_get_contents y se escribía con
    // file_put_contents(LOCK_EX), y eso no alcanza: LOCK_EX ahí es un candado
    // por operación, no una sección crítica. Dos peticiones que se solapan leen
    // la misma foto del archivo y la última en escribir descarta las marcas de
    // la otra, así que una ráfaga en paralelo pasaba del tope sin que el
    // contador se diera cuenta.
    //
    // El modo 'c+' abre para leer y escribir, crea el archivo si no está y NO
    // lo trunca: truncar antes de tomar el candado sería borrar el contador de
    // las peticiones que están en curso.
    $puntero = @fopen($archivo, 'c+');
    if ($puntero === false || !flock($puntero, LOCK_EX)) {
        // Sin candado no se puede contar bien, y un contador que no cuenta no
        // es motivo para rechazar a una persona: el que frena el spam de verdad
        // es el filtro de contenido. Se deja pasar y queda la constancia, que
        // es lo único que permite enterarse de que el directorio de estado
        // tiene un problema de permisos.
        avisarUnaVezAlDia(
            'sin-candado-limite',
            'AVISO: no se pudo tomar el candado de ' . $archivo . '; el límite por IP no está contando.'
        );
        if ($puntero !== false) {
            fclose($puntero);
        }
        return;
    }

    $registro = json_decode((string) stream_get_contents($puntero), true);
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
    if (count($propias) >= $tope) {
        registrar('LIMITE alcanzado por ' . $ip);
        // `responder()` termina el proceso, y al terminar el sistema libera el
        // candado y cierra el descriptor. Es correcto, pero es la razón por la
        // que entre el flock y esta línea no puede entrar trabajo lento: cada
        // segundo acá es un segundo que espera la siguiente petición.
        responder(429, ['ok' => false, 'error' => 'limite_alcanzado']);
    }

    $propias[] = $ahora;
    $registro[$ip] = $propias;

    // Truncar y volver al principio antes de escribir: el descriptor quedó
    // posicionado al final por la lectura, y sin esto el JSON nuevo se pegaría
    // detrás del viejo y el archivo dejaría de ser válido en el primer envío.
    ftruncate($puntero, 0);
    rewind($puntero);
    fwrite($puntero, json_encode($registro));
    fflush($puntero);
    flock($puntero, LOCK_UN);
    fclose($puntero);
}

/**
 * Filtro de spam propio, sin servicios de terceros.
 *
 * Devuelve el motivo por el que el envío parece spam, o cadena vacía si está
 * limpio. El motivo se registra y sirve para ajustar las reglas mirando el log.
 *
 * La idea es no adivinar intenciones sino aprovechar que este formulario tiene
 * un público muy definido: empleados de una clínica de Floridablanca que
 * escriben en español sobre créditos y ahorros. Casi todo el spam automático se
 * cae solo contra esa forma.
 *
 * Cada regla rechaza con un mensaje que una persona puede entender y corregir.
 * No se responde «ok» en silencio como con el campo trampa: ahí sabemos que es
 * un robot, acá es una sospecha, y a quien sospechamos de más hay que darle
 * forma de arreglarlo.
 */
/**
 * Cuenta enlaces sin contar dos veces el mismo.
 *
 * El orden de las alternativas importa: `https?://\S+` va primero y se come la
 * URL entera, así que el dominio de adentro ya no vuelve a coincidir con la
 * tercera regla. Al revés, «https://fondefos.com.co» contaba como dos.
 *
 * Los enlaces al propio sitio no cuentan: alguien que escribe «vi en la página
 * de convenios que…» está citando, no haciendo propaganda.
 */
function contarEnlaces(string $texto): int
{
    // Las direcciones de correo se sacan ANTES de contar: toda dirección lleva
    // un dominio adentro, y sin esto «maria@gmail.com» en la casilla del correo
    // se cuenta como enlace y rechaza el formulario entero. Pasó en la prueba.
    $texto = (string) preg_replace('/\b[^\s@]+@[^\s@]+\.[a-z]{2,}\b/i', ' ', $texto);

    preg_match_all(
        '#https?://\S+|www\.\S+|\b[a-z0-9-]+\.(?:com|net|org|ru|xyz|top|click|info|biz)\b#i',
        $texto,
        $encontrados
    );

    $ajenos = array_filter(
        $encontrados[0],
        function ($enlace) {
            return stripos($enlace, 'fondefos.com.co') === false;
        }
    );

    return count($ajenos);
}

function motivoDeSpam(array $definicion, array $valores): string
{
    // Qué campo tolera un enlace se deduce de la definición del formulario y no
    // de una lista de nombres escrita a mano. La primera versión listaba
    // `nombre, telefono, asunto, ciudad, direccion` y dejaba pasar spam por los
    // campos del beneficiario del Programa 100, que nadie se acordó de agregar.
    // Una lista así queda vieja el día que alguien sume un campo.
    //
    // El criterio: solo la prosa libre puede llevar un enlace. Un campo con
    // tope de 500 caracteres o más es un mensaje; el resto son datos —un
    // nombre, una cédula, una dirección— donde una URL no tiene nada que hacer.
    $prosaLibre = [];
    foreach ($definicion['campos'] as $id => $campo) {
        if (($campo['max'] ?? 0) >= 500) {
            $prosaLibre[] = $id;
        }
    }

    foreach ($valores as $clave => $valor) {
        if ($valor === '') {
            continue;
        }

        // Alfabetos que este formulario no escribe. Un mensaje en cirílico o en
        // chino a un fondo de empleados de Santander es spam con una certeza
        // que ninguna otra regla alcanza. Se dejan pasar los acentos y la eñe,
        // que son latinos.
        if (preg_match('/[\x{0400}-\x{04FF}\x{0600}-\x{06FF}\x{4E00}-\x{9FFF}\x{3040}-\x{30FF}\x{0E00}-\x{0E7F}]/u', $valor)) {
            return 'alfabeto no latino en ' . $clave;
        }

        $enlaces = contarEnlaces($valor);

        if ($enlaces > 0 && !in_array($clave, $prosaLibre, true)) {
            return 'enlace en ' . $clave;
        }

        // En el mensaje se tolera uno —alguien puede citar una página del
        // propio sitio— pero dos o más ya es propaganda.
        if ($enlaces >= 2) {
            return $enlaces . ' enlaces en ' . $clave;
        }

        // Etiquetas HTML o BBCode: el formulario es texto plano y nadie las
        // escribe a mano. Los robots las pegan para armar enlaces.
        if (preg_match('#<\s*(a|script|iframe|img)\b|\[url[=\]]#i', $valor)) {
            return 'marcado de enlaces en ' . $clave;
        }
    }

    // El mismo texto repetido palabra por palabra suele ser una plantilla
    // disparada muchas veces. Se revisa cualquier campo con texto suficiente y
    // no solo `mensaje`: el Programa 100 no tiene ese campo, y atarse a un
    // nombre dejaba la regla sin efecto en ese formulario.
    foreach ($valores as $clave => $valor) {
        if ($valor === '' || mb_strlen($valor) <= 40) {
            continue;
        }

        $palabras = preg_split('/\s+/u', mb_strtolower($valor), -1, PREG_SPLIT_NO_EMPTY);
        if (count($palabras) < 20) {
            continue;
        }

        // Menos de un quinto de palabras distintas es texto generado, no
        // escrito: «crédito crédito crédito…».
        if (count(array_unique($palabras)) / count($palabras) < 0.2) {
            return 'texto repetitivo en ' . $clave;
        }
    }

    return '';
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
 *
 * `$tiempoMaximo` cambia según quién llame, y la diferencia importa. Desde
 * `enviar.php` hay una persona mirando la pantalla, así que se usa un tope
 * corto: más vale soltar y dejar que la cola lo entregue en un minuto que
 * tener a alguien esperando. Desde la cola no hay nadie esperando y el tope
 * puede ser más largo, que es lo que le da la última oportunidad a un servidor
 * que anda lento.
 */
function enviarCorreos(
    array $definicion,
    array $valores,
    string $radicado,
    string $fecha,
    string $firma,
    string $correoRemitente,
    int $tiempoMaximo = TIEMPO_MAXIMO_SMTP
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
        $e,
        $tiempoMaximo
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
    callable $e,
    int $tiempoMaximo = TIEMPO_MAXIMO_SMTP
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

        // PHPMailer trae 300 segundos por omisión, y eso acá es inaceptable:
        // un servidor SMTP que acepta la conexión y después no contesta deja
        // colgada a la persona que envió el formulario, o a toda la cola si
        // esto corre desde el cron. Cinco minutos, en cualquiera de los dos
        // casos. El tope lo decide quien llama, porque no es el mismo si hay
        // alguien esperando que si no.
        $correo->Timeout = $tiempoMaximo;

        // La conexión se mantiene abierta entre el aviso interno y el acuse de
        // recibo. Sin esto PHPMailer cierra al terminar el primer send() y el
        // segundo vuelve a hacer todo: TCP, STARTTLS y autenticación contra el
        // servidor de correo. Medido con Gmail: 9,9 s de respuesta para la
        // persona, cuando una sola conexión son unos 5.
        //
        // Importa además porque `Timeout` es POR CONEXIÓN, no por petición:
        // con dos conexiones el peor caso era el doble del tope que creíamos
        // haber puesto. Con una sola, el tope vuelve a significar lo que dice.
        //
        // Obliga a cerrar a mano al final (`smtpClose()`).
        $correo->SMTPKeepAlive = true;

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

        // ── A partir de acá el aviso interno YA SALIÓ ─────────────────────
        // Lo que siga no puede cambiar eso. El acuse de recibo va en su propio
        // try porque si falla y dejáramos que se lleve puesto el `return true`,
        // el envío quedaría con `correo_enviado = 0`, la cola lo tomaría, y el
        // fondo recibiría el aviso interno DOS VECES por un acuse que no salió.
        // Es el mismo error que duplicó filas en la hoja: un fallo parcial
        // contado como fallo total.

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
                . 'line-height:20px;">Guárdalo: con ese número ubicamos tu '
                . 'mensaje si necesitas consultarlo. Te respondemos al correo o '
                . 'al teléfono que dejaste.</div>',
                $definicion['nombre']
            );
            $correo->AltBody = "Recibimos tu mensaje\n\n"
                . 'Registramos tu mensaje el ' . $cuando . ".\n"
                . 'Tu radicado es ' . $radicado . ". Guárdalo para cualquier consulta.\n\n"
                . "Te respondemos al correo o al teléfono que dejaste.\n\n"
                . 'FONDEFOS — Fondo de Empleados';

            try {
                $correo->send();
            } catch (Throwable $error) {
                // Se anota con su propio prefijo para poder distinguirlo:
                // "ERROR SMTP" es el aviso interno, que sí es grave; "ACUSE"
                // es que la persona no recibió su copia, que se puede vivir.
                registrar('ACUSE no salió ' . $radicado . ': ' . $error->getMessage());
            }
        }

        cerrarSmtp($correo);

        return true;
    } catch (Throwable $error) {
        // El detalle va al log, nunca a la respuesta.
        registrar('ERROR SMTP ' . $radicado . ': ' . $error->getMessage());
        cerrarSmtp($correo ?? null);
        return false;
    }
}

/**
 * Cierra la conexión SMTP que `SMTPKeepAlive` deja abierta.
 *
 * Hace falta porque sin `SMTPKeepAlive` PHPMailer cerraba solo al terminar
 * cada `send()`, y con él ya no. Dejar el socket abierto no rompe una petición
 * web —termina y se cierra igual—, pero sí una corrida de la cola, que manda
 * decenas de correos seguidos y acumularía una conexión por cada uno.
 *
 * Acepta null porque el `catch` de afuera también cubre el `new PHPMailer`: si
 * revienta ahí, no hay objeto que cerrar.
 */
function cerrarSmtp(?PHPMailer $correo): void
{
    if ($correo === null) {
        return;
    }

    try {
        $correo->smtpClose();
    } catch (Throwable $error) {
        // Cerrar un socket que ya se cayó no es un problema de nadie.
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
        // Treinta segundos. Estuvo en sesenta unos días, y fue un error de
        // razonamiento que salió caro: se subió para que ninguna escritura se
        // cayera por tiempo agotado, porque entonces una caída por tiempo
        // significaba una fila duplicada —el Apps Script escribía igual, la
        // respuesta no llegaba a tiempo, y el reintento la escribía otra vez.
        //
        // Eso ya no pasa: los Apps Script descartan un radicado que ya está en
        // la hoja, así que una caída por tiempo no duplica nada, solo demora.
        // Y con esa red puesta, esperar de más es lo caro: la corrida es una
        // sola, con candado, y cada segundo que pasa acá es un segundo que el
        // correo de otra persona pasa en la cola.
        //
        // Treinta le alcanzan de sobra a una escritura sana, incluso con el
        // LockService del Apps Script encolando un lote. Lo que tarde más que
        // eso no está sano, y lo correcto es soltarlo y volver en un minuto.
        CURLOPT_TIMEOUT        => TIEMPO_MAXIMO_HOJA,
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
