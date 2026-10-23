-- =========================================================================
-- FONDEFOS — migración del 22/10/2026: saludo de cumpleaños
--
-- PARA QUÉ
--   api/cumpleanos.php corre cada hora y manda el saludo a quien cumple hoy.
--   Esta tabla es la que hace que mande UNA vez: antes de escribirle a
--   alguien mira si ya tiene su fila del año con `enviado_en`.
--
--   La clave es (correo, anio) y no la fila de la hoja: la hoja se reordena,
--   se pega encima, se le borran filas. El correo es lo que identifica a
--   quién ya se le escribió.
--
-- CÓMO SE EJECUTA
--   cPanel → phpMyAdmin → elegir la base → pestaña SQL → pegar y ejecutar.
--   Se puede correr con el sitio al aire: es una tabla nueva.
--
-- esquema.sql ya trae esta tabla para una instalación nueva.
-- =========================================================================

SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS cumpleanos_enviados (
    id           INT UNSIGNED      NOT NULL AUTO_INCREMENT,
    -- 190 por el mismo límite de índice de MySQL 5.6 con utf8mb4 que en `envios`.
    correo       VARCHAR(190)      NOT NULL,
    anio         SMALLINT          NOT NULL,
    nombre       VARCHAR(160)      NOT NULL,
    -- NULL mientras no haya salido. Una fila con intentos y sin fecha es un
    -- saludo que falló.
    enviado_en   DATETIME          NULL,
    intentos     SMALLINT UNSIGNED NOT NULL DEFAULT 0,
    ultimo_error VARCHAR(255)      NULL,
    PRIMARY KEY (id),
    UNIQUE KEY uq_correo_anio (correo, anio),
    KEY idx_anio (anio)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;


-- -------------------------------------------------------------------------
-- Consultas de mano. No se ejecutan acá.
-- -------------------------------------------------------------------------
--
-- Saludos de hoy:
--
--   SELECT nombre, correo, enviado_en, intentos, ultimo_error
--     FROM cumpleanos_enviados
--    WHERE DATE(enviado_en) = CURDATE() OR (enviado_en IS NULL AND intentos > 0);
--
-- Los que se rindieron este año:
--
--   SELECT * FROM cumpleanos_enviados
--    WHERE anio = YEAR(CURDATE()) AND enviado_en IS NULL;
--
-- Volver a intentar con alguien (después de corregir su correo en la hoja):
--
--   DELETE FROM cumpleanos_enviados WHERE correo = 'persona@ejemplo.com' AND anio = 2026;
