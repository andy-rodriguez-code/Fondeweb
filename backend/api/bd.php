<?php
// Acceso a la base de datos MySQL de cPanel.
//
// La base es la fuente de verdad: si acá no se pudo guardar, el envío no
// existió y se le avisa a la persona. El correo y el Google Sheet son
// derivados, y que fallen no borra el registro.
//
// Todo con PDO y sentencias preparadas. Ninguna consulta arma SQL concatenando
// valores: la lista de campos es blanca y viene de config.php, pero los datos
// son de quien llene el formulario.

declare(strict_types=1);

/** Conexión única por petición. */
function bd(): PDO
{
    static $conexion = null;
    if ($conexion instanceof PDO) {
        return $conexion;
    }

    try {
        $conexion = new PDO(
            'mysql:host=' . BD_HOST . ';port=' . BD_PUERTO . ';dbname=' . BD_NOMBRE . ';charset=utf8mb4',
            BD_USUARIO,
            BD_CLAVE,
            [
                // Los errores llegan como excepciones y no como códigos que se
                // pueden ignorar por accidente.
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                // Sentencias preparadas de verdad en el servidor, no emuladas
                // por el driver.
                PDO::ATTR_EMULATE_PREPARES   => false,
            ]
        );
    } catch (Throwable $error) {
        // El detalle va al log: un mensaje de PDO trae el usuario y el nombre
        // de la base.
        registrar('ERROR BD conexión: ' . $error->getMessage());
        responder(503, ['ok' => false, 'error' => 'base_no_disponible']);
    }

    return $conexion;
}

/**
 * Guarda el envío completo y devuelve el radicado.
 *
 * El consecutivo y las filas se escriben en la misma transacción: o queda todo
 * o no queda nada. Antes el contador vivía en un archivo con flock, y eso eran
 * dos fuentes de verdad que podían divergir al restaurar un respaldo.
 */
function guardarEnvio(
    string $claveFormulario,
    array $definicion,
    array $campos,
    string $fecha,
    string $ip,
    bool $autoriza,
    string $correoRespuesta,
    string $rutaFirma
): string {
    $conexion = bd();

    try {
        $conexion->beginTransaction();

        // INSERT ... ON DUPLICATE KEY toma el bloqueo exclusivo de la fila, así
        // que el SELECT siguiente ve su propio valor y cualquier otra petición
        // espera hasta el commit. Dos envíos simultáneos no se llevan el mismo
        // número.
        $conexion->prepare(
            'INSERT INTO consecutivos (prefijo, anio, ultimo) VALUES (:prefijo, :anio, 1)
             ON DUPLICATE KEY UPDATE ultimo = ultimo + 1'
        )->execute([
            ':prefijo' => $definicion['prefijo'],
            ':anio'    => (int) date('Y'),
        ]);

        $lectura = $conexion->prepare(
            'SELECT ultimo FROM consecutivos WHERE prefijo = :prefijo AND anio = :anio'
        );
        $lectura->execute([
            ':prefijo' => $definicion['prefijo'],
            ':anio'    => (int) date('Y'),
        ]);
        $ultimo = (int) $lectura->fetchColumn();

        $radicado = sprintf('%s-%s-%04d', $definicion['prefijo'], date('Y'), $ultimo);

        $conexion->prepare(
            'INSERT INTO envios
                (radicado, formulario, nombre_formulario, recibido_en, ip,
                 autoriza_datos, correo_respuesta, firma_archivo)
             VALUES
                (:radicado, :formulario, :nombre, :fecha, :ip,
                 :autoriza, :correo, :firma)'
        )->execute([
            ':radicado'   => $radicado,
            ':formulario' => $claveFormulario,
            ':nombre'     => $definicion['nombre'],
            ':fecha'      => $fecha,
            ':ip'         => $ip,
            ':autoriza'   => $autoriza ? 1 : 0,
            ':correo'     => $correoRespuesta !== '' ? $correoRespuesta : null,
            ':firma'      => $rutaFirma !== '' ? $rutaFirma : null,
        ]);

        $envioId = (int) $conexion->lastInsertId();

        $insertaCampo = $conexion->prepare(
            'INSERT INTO envio_campos (envio_id, clave, etiqueta, valor, orden)
             VALUES (:envio, :clave, :etiqueta, :valor, :orden)'
        );

        $orden = 0;
        foreach ($definicion['campos'] as $clave => $campo) {
            $insertaCampo->execute([
                ':envio'    => $envioId,
                ':clave'    => $clave,
                ':etiqueta' => $campo['etiqueta'],
                ':valor'    => $campos[$clave] ?? '',
                ':orden'    => $orden++,
            ]);
        }

        $conexion->commit();

        return $radicado;
    } catch (Throwable $error) {
        if ($conexion->inTransaction()) {
            $conexion->rollBack();
        }
        registrar('ERROR BD guardar: ' . $error->getMessage());
        responder(503, ['ok' => false, 'error' => 'no_se_pudo_guardar']);
    }
}

/** Marca en la base si el correo salió y si la fila llegó a la hoja. */
function marcarEnvio(string $radicado, string $columna, bool $valor): void
{
    // La columna nunca viene del usuario: se restringe acá por si algún día
    // alguien la pasa desde otro lado.
    if (!in_array($columna, ['correo_enviado', 'hoja_escrita'], true)) {
        return;
    }

    try {
        bd()->prepare("UPDATE envios SET {$columna} = :valor WHERE radicado = :radicado")
            ->execute([':valor' => $valor ? 1 : 0, ':radicado' => $radicado]);
    } catch (Throwable $error) {
        registrar('ERROR BD marcar ' . $columna . ' ' . $radicado . ': ' . $error->getMessage());
    }
}

/**
 * Cuántas veces se intenta una entrega antes de darla por perdida.
 *
 * La cola tiene que poder rendirse. Sin un tope, una fila que no se pueda
 * entregar nunca —el webhook se reimplementó con otra URL, la casilla de
 * destino dejó de existir, el formulario se sacó de config.php— vuelve cada
 * minuto para siempre. Y como la corrida es una sola y con candado, esa fila
 * atascada se come el tiempo de la corrida y le retrasa el correo a todos los
 * envíos que vengan detrás. Un problema de una fila se convierte en un
 * problema de todo el sitio.
 *
 * Diez es generoso a propósito: con el cron cada minuto, cubre más de diez
 * minutos de caída de Google o del SMTP sin rendirse. Lo que pasa de ahí ya no
 * es intermitente y reintentar no lo va a resolver; lo que hace falta es que
 * alguien lo vea, y para eso está la línea `SE RINDIÓ` del registro.
 *
 * Rendirse no pierde nada: el envío sigue completo en `envios`. Para
 * reencolarlo, poner el contador en 0 (ver migracion-2026-09-23-intentos.sql).
 */
const MAX_INTENTOS_ENTREGA = 10;

/**
 * Anota que un intento de entrega falló y devuelve cuántos van.
 *
 * El contador sube en el intento fallido y no en el exitoso: mientras entregue,
 * el número queda donde estaba y no hay nada que limpiar.
 *
 * Devuelve el total para que quien llama pueda avisar en el registro justo
 * cuando la fila agota los intentos. Avisar una sola vez, en el momento
 * exacto, es lo que hace que el aviso se lea; una línea por intento es ruido
 * que se aprende a ignorar.
 */
function anotarIntentoFallido(string $radicado, string $columna): int
{
    // Igual que en marcarEnvio: el nombre de la columna nunca viene de afuera,
    // pero la lista blanca se queda porque es lo único que separa a esta
    // consulta de una concatenación peligrosa.
    if (!in_array($columna, ['intentos_correo', 'intentos_hoja'], true)) {
        return 0;
    }

    try {
        bd()->prepare("UPDATE envios SET {$columna} = {$columna} + 1 WHERE radicado = :radicado")
            ->execute([':radicado' => $radicado]);

        $consulta = bd()->prepare("SELECT {$columna} FROM envios WHERE radicado = :radicado");
        $consulta->execute([':radicado' => $radicado]);

        return (int) $consulta->fetchColumn();
    } catch (Throwable $error) {
        registrar('ERROR BD ' . $columna . ' ' . $radicado . ': ' . $error->getMessage());
        return 0;
    }
}

/**
 * Envíos cuyo correo no salió y que todavía no agotaron sus intentos.
 *
 * Existe desde que enviar.php contesta antes de mandar el correo: si el SMTP
 * falla, ya no hay a quién avisarle en el momento, así que el reintento es la
 * única red. Devuelve lo que hace falta para rearmar el correo entero.
 */
function enviosPendientesDeCorreo(int $limite = 25): array
{
    $consulta = bd()->prepare(
        'SELECT id, radicado, formulario, recibido_en, correo_respuesta, firma_archivo
         FROM envios
         WHERE correo_enviado = 0
           AND intentos_correo < ' . MAX_INTENTOS_ENTREGA . '
         ORDER BY id
         LIMIT ' . (int) $limite
    );
    $consulta->execute();

    $pendientes = [];
    foreach ($consulta->fetchAll() as $envio) {
        // Un formulario que ya no está en config.php no se puede rearmar: sus
        // etiquetas y destinatarios viven ahí. Se salta en vez de reventar.
        if (!isset(FORMULARIOS[$envio['formulario']])) {
            registrar('REINTENTO correo: formulario desconocido en ' . $envio['radicado']);
            continue;
        }

        $campos = bd()->prepare(
            'SELECT clave, valor FROM envio_campos WHERE envio_id = :envio ORDER BY orden'
        );
        $campos->execute([':envio' => $envio['id']]);

        $valores = [];
        foreach ($campos->fetchAll() as $campo) {
            $valores[$campo['clave']] = $campo['valor'];
        }

        // La firma vive en disco; enviarCorreos() la espera como data URI,
        // igual que cuando llegó del navegador.
        $firma = '';
        if ($envio['firma_archivo'] !== null && is_file($envio['firma_archivo'])) {
            $firma = 'data:image/png;base64,'
                . base64_encode((string) file_get_contents($envio['firma_archivo']));
        }

        $pendientes[] = [
            'definicion' => FORMULARIOS[$envio['formulario']],
            'valores'    => $valores,
            'radicado'   => $envio['radicado'],
            'fecha'      => (string) $envio['recibido_en'],
            'firma'      => $firma,
            'remitente'  => (string) ($envio['correo_respuesta'] ?? ''),
        ];
    }

    return $pendientes;
}

/**
 * Envíos que todavía no llegaron al Google Sheet y no agotaron sus intentos.
 *
 * La cola vive en la base y ya no en una carpeta de archivos .json: un solo
 * lugar donde mirar cuando algo falta.
 *
 * El límite bajó de 50 a 15. Cincuenta filas por corrida se pensó cuando esto
 * era una red de seguridad que corría cada quince minutos; ahora corre cada
 * minuto y comparte la corrida con el correo, que es lo que alguien está
 * esperando. Quince entran holgadas en el presupuesto de tiempo de una
 * corrida, y lo que sobre lo toma la del minuto siguiente.
 */
function enviosPendientesDeHoja(int $limite = 15): array
{
    // `formulario` es la clave del formulario, y hay que traerla sí o sí: desde
    // que cada formulario tiene su propia hoja, es lo único que dice a cuál de
    // los webhooks de URLS_APPS_SCRIPT hay que reenviar el pendiente. Sin ella
    // el reenvío queda sin destino y la fila no sale nunca de la cola.
    $consulta = bd()->prepare(
        'SELECT id, radicado, formulario, nombre_formulario, recibido_en, ip,
                autoriza_datos, firma_archivo
         FROM envios
         WHERE hoja_escrita = 0
           AND intentos_hoja < ' . MAX_INTENTOS_ENTREGA . '
         ORDER BY id
         LIMIT ' . (int) $limite
    );
    $consulta->execute();

    $pendientes = [];
    foreach ($consulta->fetchAll() as $envio) {
        $campos = bd()->prepare(
            'SELECT clave, valor FROM envio_campos WHERE envio_id = :envio ORDER BY orden'
        );
        $campos->execute([':envio' => $envio['id']]);

        // Indexado por clave, igual que lo manda enviar.php: es lo que leen
        // los Apps Script.
        $valores = [];
        foreach ($campos->fetchAll() as $campo) {
            $valores[$campo['clave']] = $campo['valor'];
        }

        $pendientes[] = [
            // El envío pendiente conserva su formulario de origen para saber a
            // cuál de las dos hojas hay que reenviarlo.
            'clave_formulario' => $envio['formulario'],
            'token'            => TOKEN_HOJA,
            'formulario'       => $envio['nombre_formulario'],
            'radicado'         => $envio['radicado'],
            // Mismo formato que manda enviar.php: ISO 8601 con desfase, para
            // que un reenvio no escriba una hora distinta a la del original.
            'fecha'            => date('c', strtotime((string) $envio['recibido_en'])),
            'campos'           => $valores,
            // Booleano y no la imagen: la hoja solo registra si hubo firma.
            // El PNG vive en el servidor y va adjunto en el correo.
            'firma'            => $envio['firma_archivo'] !== null,
            'ip'               => $envio['ip'],
            'autoriza'         => (bool) $envio['autoriza_datos'],
        ];
    }

    return $pendientes;
}
