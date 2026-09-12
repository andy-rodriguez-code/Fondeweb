-- =========================================================================
-- FONDEFOS — base de datos de los formularios web
--
-- CÓMO SE EJECUTA
--   1. cPanel → Bases de datos → MySQL® Databases
--        · Crear base de datos:  fondefos
--        · Crear usuario:        fondeweb
--        · Agregar el usuario a la base con TODOS LOS PRIVILEGIOS
--          ← este tercer paso es el que se olvida; sin él las credenciales
--            parecen correctas y la conexión falla igual
--   2. cPanel → phpMyAdmin → elegir la base → pestaña SQL
--   3. Pegar este archivo completo y ejecutar
--
-- ACÁ NO HAY `CREATE DATABASE` NI `USE` A PROPÓSITO.
-- En cPanel el usuario de MySQL no tiene privilegio para crear bases: eso lo
-- hace la pantalla de MySQL® Databases. Si este archivo intentara crearla,
-- fallaría en la primera línea. Se ejecuta con la base ya seleccionada.
--
-- EL NOMBRE REAL NO ES EL QUE ESCRIBÍS.
-- cPanel antepone el nombre de la cuenta. Si la cuenta es `fondefo1` y
-- escribís `fondefos`, la base real queda `fondefo1_fondefos` y el usuario
-- `fondefo1_fondeweb`. Esos nombres completos son los que van en config.php:
--
--     const BD_NOMBRE  = 'fondefo1_fondefos';
--     const BD_USUARIO = 'fondefo1_fondeweb';
--
-- utf8mb4 en todo: `utf8` a secas en MySQL no cubre el plano astral y se come
-- los emoji y algunos caracteres que la gente sí escribe en un mensaje.
--
-- InnoDB por las transacciones: el radicado y las filas del envío se escriben
-- juntos o no se escribe nada. Con MyISAM no habría forma de garantizarlo.
-- =========================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 1;


-- -------------------------------------------------------------------------
-- 1. Consecutivos del radicado, uno por formulario y por año.
--
-- Vive en la base y no en un archivo con flock: dos contadores son dos
-- fuentes de verdad, y el día que se restaure un respaldo de la base el
-- archivo quedaría desfasado repitiendo números ya usados.
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS consecutivos (
    prefijo VARCHAR(10)  NOT NULL,
    anio    SMALLINT     NOT NULL,
    ultimo  INT UNSIGNED NOT NULL DEFAULT 0,
    PRIMARY KEY (prefijo, anio)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;


-- -------------------------------------------------------------------------
-- 2. Un renglón por envío, con lo común a todos los formularios.
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS envios (
    id                INT UNSIGNED NOT NULL AUTO_INCREMENT,
    radicado          VARCHAR(24)  NOT NULL,
    formulario        VARCHAR(40)  NOT NULL COMMENT 'la clave: contacto, programa-100',
    nombre_formulario VARCHAR(120) NOT NULL COMMENT 'como se lee en el correo',
    recibido_en       DATETIME     NOT NULL,
    -- 45 caracteres es el largo de una IPv6 con sufijo IPv4 embebido.
    ip                VARCHAR(45)  NOT NULL,
    autoriza_datos    TINYINT(1)   NOT NULL DEFAULT 0,
    -- 190 y no 255: en MySQL 5.6 con utf8mb4 el índice tiene 767 bytes y a
    -- cuatro bytes por carácter no entra más.
    correo_respuesta  VARCHAR(190) NULL,
    firma_archivo     VARCHAR(255) NULL COMMENT 'ruta del PNG, fuera de public_html',
    correo_enviado    TINYINT(1)   NOT NULL DEFAULT 0,
    hoja_escrita      TINYINT(1)   NOT NULL DEFAULT 0,
    PRIMARY KEY (id),
    UNIQUE KEY uq_radicado (radicado),
    KEY idx_formulario (formulario, recibido_en),
    -- Sostiene la consulta del cron de reintentos.
    KEY idx_hoja_pendiente (hoja_escrita, id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;


-- -------------------------------------------------------------------------
-- 3. Los campos de cada envío, uno por fila.
--
-- Clave-valor y no una columna por campo: van a ser varios formularios con
-- campos distintos, y una tabla por formulario obligaría a un ALTER TABLE
-- cada vez que el cliente pida un campo nuevo. Acá se agrega solo.
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS envio_campos (
    id       INT UNSIGNED NOT NULL AUTO_INCREMENT,
    envio_id INT UNSIGNED NOT NULL,
    clave    VARCHAR(60)  NOT NULL COMMENT 'el id del campo: nombre, ben-telefono',
    etiqueta VARCHAR(120) NOT NULL COMMENT 'como se lee en el correo y en la hoja',
    valor    TEXT         NOT NULL,
    orden    SMALLINT     NOT NULL DEFAULT 0 COMMENT 'para reconstruir el formato',
    PRIMARY KEY (id),
    KEY idx_envio (envio_id),
    KEY idx_clave (clave),
    CONSTRAINT fk_campos_envio FOREIGN KEY (envio_id)
        REFERENCES envios (id) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;


-- -------------------------------------------------------------------------
-- 4. Arranque de los consecutivos del año en curso.
--
-- No es obligatorio —el endpoint crea la fila si no existe— pero deja la
-- tabla legible desde el primer día en vez de vacía.
-- -------------------------------------------------------------------------
INSERT INTO consecutivos (prefijo, anio, ultimo) VALUES
    ('CTC',  YEAR(CURDATE()), 0),
    ('P100', YEAR(CURDATE()), 0)
ON DUPLICATE KEY UPDATE ultimo = ultimo;


-- =========================================================================
-- 5. Vistas de lectura, una por formulario.
--
-- El clave-valor es cómodo para escribir pero incómodo para mirar: en
-- phpMyAdmin verías una fila por campo. Estas vistas lo aplanan a una fila por
-- envío con una columna por campo, que es como cualquiera espera leerlo.
--
-- Son derivadas: no guardan nada y se pueden borrar y recrear sin perder un
-- dato. Si algún día se agrega un campo al formulario, hay que agregar acá su
-- línea o simplemente no aparecerá en la vista.
--
-- SQL SECURITY INVOKER y no el DEFINER que MySQL usa por omisión: una vista
-- DEFINER corre con los permisos de quien la creó, y en un hosting compartido
-- ese usuario puede no tener todo lo que hace falta o dejar de existir cuando
-- se rehace la base. Con INVOKER corre con los permisos de quien la consulta,
-- que siempre es el mismo usuario de la aplicación.
--
-- Se listan todas las columnas en el GROUP BY en vez de agrupar solo por e.id:
-- con ONLY_FULL_GROUP_BY activo, apoyarse en la dependencia funcional de la
-- clave primaria funciona en MySQL 5.7+ pero no en todas las versiones de
-- MariaDB que trae cPanel.
-- =========================================================================

DROP VIEW IF EXISTS vista_contacto;
CREATE SQL SECURITY INVOKER VIEW vista_contacto AS
SELECT
    -- Mismo formato que el Google Sheet: dd/MM/yyyy y hh:mm am/pm. La base y
    -- la hoja tienen que leerse igual, o alguien va a comparar dos formatos
    -- distintos del mismo instante y creer que son cosas diferentes.
    DATE_FORMAT(e.recibido_en, '%d/%m/%Y')             AS fecha,
    LOWER(DATE_FORMAT(e.recibido_en, '%h:%i %p'))      AS hora,
    e.radicado,
    MAX(CASE WHEN c.clave = 'nombre'   THEN c.valor END) AS nombre,
    MAX(CASE WHEN c.clave = 'correo'   THEN c.valor END) AS correo,
    MAX(CASE WHEN c.clave = 'telefono' THEN c.valor END) AS telefono,
    MAX(CASE WHEN c.clave = 'asunto'   THEN c.valor END) AS asunto,
    MAX(CASE WHEN c.clave = 'mensaje'  THEN c.valor END) AS mensaje,
    e.autoriza_datos,
    e.correo_enviado,
    e.hoja_escrita,
    e.ip
FROM envios e
LEFT JOIN envio_campos c ON c.envio_id = e.id
WHERE e.formulario = 'contacto'
GROUP BY e.id, e.radicado, e.recibido_en, e.autoriza_datos,
         e.correo_enviado, e.hoja_escrita, e.ip
ORDER BY e.id DESC;


DROP VIEW IF EXISTS vista_programa_100;
CREATE SQL SECURITY INVOKER VIEW vista_programa_100 AS
SELECT
    -- Mismo formato que el Google Sheet: dd/MM/yyyy y hh:mm am/pm.
    DATE_FORMAT(e.recibido_en, '%d/%m/%Y')        AS fecha,
    LOWER(DATE_FORMAT(e.recibido_en, '%h:%i %p')) AS hora,
    e.radicado,
    MAX(CASE WHEN c.clave = 'expedicion'         THEN c.valor END) AS expedicion,
    MAX(CASE WHEN c.clave = 'grupo'              THEN c.valor END) AS grupo,
    MAX(CASE WHEN c.clave = 'nombre'             THEN c.valor END) AS ahorrador,
    MAX(CASE WHEN c.clave = 'tipo-documento'     THEN c.valor END) AS tipo_documento,
    MAX(CASE WHEN c.clave = 'documento'          THEN c.valor END) AS documento,
    MAX(CASE WHEN c.clave = 'direccion'          THEN c.valor END) AS direccion,
    MAX(CASE WHEN c.clave = 'telefono'           THEN c.valor END) AS telefono,
    MAX(CASE WHEN c.clave = 'ciudad'             THEN c.valor END) AS ciudad,
    -- La cuota se guarda como texto porque el campo es libre; acá se convierte
    -- para poder sumar y ordenar desde phpMyAdmin.
    CAST(MAX(CASE WHEN c.clave = 'cuota' THEN c.valor END) AS DECIMAL(12, 2)) AS cuota_mensual,
    -- Los 12 meses del programa. Se calcula y no se guarda, igual que en la
    -- página: así el dato no puede quedar en desacuerdo con la cuota.
    CAST(MAX(CASE WHEN c.clave = 'cuota' THEN c.valor END) AS DECIMAL(12, 2)) * 12 AS total_proyectado,
    MAX(CASE WHEN c.clave = 'ben-nombre'         THEN c.valor END) AS beneficiario,
    MAX(CASE WHEN c.clave = 'ben-tipo-documento' THEN c.valor END) AS ben_tipo_documento,
    MAX(CASE WHEN c.clave = 'ben-documento'      THEN c.valor END) AS ben_documento,
    MAX(CASE WHEN c.clave = 'ben-direccion'      THEN c.valor END) AS ben_direccion,
    MAX(CASE WHEN c.clave = 'ben-telefono'       THEN c.valor END) AS ben_telefono,
    MAX(CASE WHEN c.clave = 'ben-ciudad'         THEN c.valor END) AS ben_ciudad,
    MAX(CASE WHEN c.clave = 'acepta-terminos'    THEN c.valor END) AS acepto_terminos,
    e.autoriza_datos,
    e.firma_archivo,
    e.correo_enviado,
    e.hoja_escrita,
    e.ip
FROM envios e
LEFT JOIN envio_campos c ON c.envio_id = e.id
WHERE e.formulario = 'programa-100'
GROUP BY e.id, e.radicado, e.recibido_en, e.autoriza_datos, e.firma_archivo,
         e.correo_enviado, e.hoja_escrita, e.ip
ORDER BY e.id DESC;
