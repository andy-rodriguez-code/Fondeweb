-- =========================================================================
-- FONDEFOS — migración del 23/09/2026: contador de intentos de entrega
--
-- PARA QUÉ
--   La cola de reintentar.php no tenía forma de rendirse. Una fila que no se
--   pudiera entregar —un webhook reimplementado con otra URL, una casilla que
--   ya no existe, un formulario que se sacó de config.php— se reintentaba
--   cada minuto, indefinidamente. Cada reintento gasta hasta 30 segundos de
--   la corrida, y como la corrida es una sola y con candado, esa fila
--   atascada le retrasa el correo a todos los envíos que vengan detrás.
--
--   Con el contador, después de MAX_INTENTOS_ENTREGA (api/bd.php) la fila
--   sale de la cola y queda una línea en el registro diciendo cuál es y por
--   qué. No se pierde nada: el envío sigue completo en `envios`, y para
--   reencolarlo basta con volver el contador a 0 (ver el final).
--
-- CÓMO SE EJECUTA
--   cPanel → phpMyAdmin → elegir la base → pestaña SQL → pegar y ejecutar.
--   Se puede correr con el sitio al aire: son dos columnas con valor por
--   omisión, no reescriben los datos que ya están.
--
-- ESTO NO REEMPLAZA A esquema.sql. Ese archivo ya trae las dos columnas para
-- una instalación nueva; esta migración es para la base que ya está viva.
-- =========================================================================

SET NAMES utf8mb4;

ALTER TABLE envios
    ADD COLUMN intentos_correo SMALLINT UNSIGNED NOT NULL DEFAULT 0 AFTER hoja_escrita,
    ADD COLUMN intentos_hoja   SMALLINT UNSIGNED NOT NULL DEFAULT 0 AFTER intentos_correo;

-- Los índices se rehacen para que incluyan el contador: la consulta de la cola
-- filtra por bandera Y por intentos, y un índice que solo cubra la bandera
-- obliga a leer cada fila candidata para descartarla.
--
-- `idx_correo_pendiente` no existía. La consulta del correo recorría la tabla
-- entera, y eso pasó desapercibido mientras el correo salía dentro de la
-- petición; desde que es la cola quien lo manda, corre cada minuto.
ALTER TABLE envios
    DROP INDEX idx_hoja_pendiente,
    ADD  INDEX idx_hoja_pendiente   (hoja_escrita, intentos_hoja, id),
    ADD  INDEX idx_correo_pendiente (correo_enviado, intentos_correo, id);


-- -------------------------------------------------------------------------
-- Consultas de mano para cuando algo quede atascado. No se ejecutan acá.
-- -------------------------------------------------------------------------
--
-- Qué hay pendiente y cuántas veces se intentó:
--
--   SELECT radicado, formulario, recibido_en,
--          correo_enviado, intentos_correo,
--          hoja_escrita,   intentos_hoja
--     FROM envios
--    WHERE correo_enviado = 0 OR hoja_escrita = 0
--    ORDER BY id;
--
-- Reencolar una fila que se rindió, después de arreglar la causa:
--
--   UPDATE envios SET intentos_hoja = 0 WHERE radicado = 'CTC-2026-0042';
--
-- Reencolar todo lo que se rindió de una vez:
--
--   UPDATE envios SET intentos_correo = 0 WHERE correo_enviado = 0;
--   UPDATE envios SET intentos_hoja   = 0 WHERE hoja_escrita   = 0;
