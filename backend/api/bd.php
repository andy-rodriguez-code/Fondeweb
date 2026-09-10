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
 * Envíos que todavía no llegaron al Google Sheet. Los usa reintentar.php.
 *
 * La cola vive en la base y ya no en una carpeta de archivos .json: un solo
 * lugar donde mirar cuando algo falta.
 */
function enviosPendientesDeHoja(int $limite = 50): array
{
    $consulta = bd()->prepare(
        'SELECT id, radicado, nombre_formulario, recibido_en, ip, autoriza_datos, firma_archivo
         FROM envios
         WHERE hoja_escrita = 0
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
