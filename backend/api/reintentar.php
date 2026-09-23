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
// El correo va primero y la hoja después, cada corrida tiene un presupuesto de
// tiempo, y cada fila tiene un tope de intentos. Las tres cosas son del
// 23/09/2026 y salen del mismo incidente: con la hoja adelante y sin topes,
// una sola fila que Google tardaba en aceptar se comía la corrida entera y el
// correo de todos los demás salía tarde. Las razones están al lado de cada
// una, más abajo.
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

// ── El presupuesto de tiempo ──────────────────────────────────────────────
// Una corrida no puede durar más de lo que tarda en llegar la siguiente. El
// candado hace que mientras esta trabaje, la del minuto que viene se vaya sin
// hacer nada, y lo mismo el disparo de cada envío nuevo: un lote largo deja a
// todo el mundo esperando su correo detrás de una cola que no es la suya.
//
// Lo que no entre se queda en la cola con sus banderas intactas y lo toma la
// corrida siguiente. Perder un minuto no le cuesta nada a nadie; que una fila
// atascada le robe el correo a los demás, sí.
const PRESUPUESTO_SEGUNDOS = 55;

$arranque = microtime(true);

/**
 * ¿Alcanza el tiempo para intentar una entrega más, en el PEOR caso?
 *
 * La reserva es lo máximo que puede tardar lo que se va a intentar
 * —TIEMPO_MAXIMO_SMTP o TIEMPO_MAXIMO_HOJA—, y sumarla es lo único que hace
 * que esto sea un presupuesto de verdad. Preguntar solo "¿ya me pasé?" no
 * sirve: se mide ANTES de arrancar la entrega, así que una que arranque en el
 * segundo 49 termina en el 79 y la corrida se pasa igual del minuto.
 *
 * Medido: con tres filas contra un destino que no contesta, preguntando solo
 * si ya se había pasado, la corrida duró 64 s. Con la reserva sumada corta
 * antes de arrancar la que no cabe, y la corrida no puede pasar de
 * PRESUPUESTO_SEGUNDOS por construcción: arranca en E solo si E + reserva
 * está dentro, y la entrega nunca tarda más que su reserva.
 *
 * Y que no se pase importa porque la corrida siguiente encuentra el candado
 * tomado y se va sin hacer nada: una corrida larga no se atrasa a sí misma,
 * atrasa a la del minuto que viene, que es la que lleva el correo de alguien
 * que acaba de enviar el formulario.
 */
function hayTiempoPara(float $arranque, int $reserva): bool
{
    return (microtime(true) - $arranque) + $reserva <= PRESUPUESTO_SEGUNDOS;
}

/**
 * Anota el fallo y avisa en el registro si con este la fila agotó sus intentos.
 *
 * Es el único momento en que se puede avisar: después la fila desaparece de la
 * consulta de pendientes y nada la vuelve a mirar. Sin esta línea, rendirse
 * sería exactamente igual de silencioso que el fallo que estamos arreglando.
 */
function contarFallo(string $radicado, string $columna, string $que): void
{
    $intentos = anotarIntentoFallido($radicado, $columna);

    if ($intentos >= MAX_INTENTOS_ENTREGA) {
        registrar(sprintf(
            'SE RINDIÓ %s: %s tras %d intentos. El envío está completo en la base; '
            . 'arreglar la causa y poner %s en 0 para reencolarlo.',
            $radicado,
            $que,
            $intentos,
            $columna
        ));
    }
}

// ── El correo va PRIMERO ──────────────────────────────────────────────────
// Este orden es el arreglo, no una preferencia de estilo. Hasta el 23/09/2026
// la hoja iba primero, y el resultado medido fue que el correo salía tarde:
// una corrida podía gastarse todo su tiempo en el lote de la hoja —cada
// escritura esperando a Google— antes de mirar el primer correo.
//
// Del otro lado hay una persona esperando su acuse de recibo y alguien del
// fondo esperando enterarse de que escribieron. La hoja es registro: que su
// fila llegue un minuto después no lo nota nadie. Lo primero que se entrega
// tiene que ser lo que alguien está esperando.

$sinCorreo = enviosPendientesDeCorreo();
$reenviados = 0;
$intentados = 0;

foreach ($sinCorreo as $envio) {
    if (!hayTiempoPara($arranque, TIEMPO_MAXIMO_SMTP)) {
        break;
    }
    $intentados++;

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
    } else {
        contarFallo($envio['radicado'], 'intentos_correo', 'no se pudo mandar el correo');
    }
}

if ($intentados > 0) {
    registrar('COLA correo: entregó ' . $reenviados . ' de ' . $intentados);
}

// ── Y después la hoja ─────────────────────────────────────────────────────
// Reenviar acá es seguro desde que los Apps Script descartan un radicado que
// ya está escrito. Antes no lo era: una respuesta que se perdía en el camino
// se leía como "no se escribió" y la fila se volvía a mandar, y así fue como
// el mismo radicado terminó cuatro veces en la hoja.

$pendientes = enviosPendientesDeHoja();
$recuperados = 0;
$intentados = 0;

foreach ($pendientes as $carga) {
    if (!hayTiempoPara($arranque, TIEMPO_MAXIMO_HOJA)) {
        break;
    }
    $intentados++;

    if (escribirEnHoja($carga)) {
        marcarEnvio($carga['radicado'], 'hoja_escrita', true);
        $recuperados++;
    } else {
        contarFallo($carga['radicado'], 'intentos_hoja', 'no se pudo escribir en la hoja');
    }
}

if ($intentados > 0) {
    registrar('COLA hoja: escribió ' . $recuperados . ' de ' . $intentados);
}

flock($candado, LOCK_UN);
fclose($candado);

exit(0);
