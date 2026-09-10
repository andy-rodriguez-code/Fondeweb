# Backend de formularios

Endpoint PHP que atiende todos los formularios del sitio: valida, guarda en
MySQL, manda el correo y escribe la fila en el Google Sheet.

## El orden importa

```
validar → MySQL → correo → Google Sheet
          ↑                  ↑
    fuente de verdad     derivados
```

**MySQL es la fuente de verdad.** Si ahí no se pudo escribir, el envío no
existió y se rechaza la petición: es preferible que la persona vuelva a
intentar a decirle que quedó registrada cuando no quedó en ninguna parte.

El correo y la hoja son derivados. Que fallen no borra el registro: se marcan
en las columnas `correo_enviado` y `hoja_escrita`, y el cron los recupera
leyendo de la propia base.

## Qué hay acá

```
backend/
├── api/
│   ├── enviar.php             ← único punto de entrada
│   ├── bd.php                 ← acceso a MySQL con PDO
│   ├── enviar-funciones.php   ← compartido con el cron
│   ├── reintentar.php         ← reenvía lo pendiente a la hoja (solo CLI)
│   └── .htaccess              ← solo enviar.php se sirve por HTTP
├── apps-script/
│   └── Codigo.gs              ← se pega en el Apps Script de la hoja
├── sql/
│   └── esquema.sql            ← se ejecuta una vez en phpMyAdmin
├── config.example.php         ← plantilla; el real NO se versiona
└── README.md
```

## Las tablas

| Tabla | Para qué |
|---|---|
| `envios` | un renglón por envío: radicado, formulario, fecha, IP, autorización, y si el correo y la hoja salieron |
| `envio_campos` | los campos de cada envío, uno por fila |
| `consecutivos` | el número del radicado, por formulario y por año |

`envio_campos` es clave-valor y no una columna por campo. Van a ser varios
formularios con campos distintos: una tabla por formulario obligaría a un
`ALTER TABLE` cada vez que el cliente pida un campo nuevo.

Las firmas van como PNG en `estado/firmas/` con la ruta en la base, no como
BLOB: son decenas de KB por envío que nunca se consultan, solo se abren. El
respaldo de cPanel cubre archivos y base por igual.

## Dónde va cada cosa en el servidor

| En el repositorio | En el hosting |
|---|---|
| `backend/api/*` | `public_html/api/` |
| `backend/config.example.php` | `/home/USUARIO/fondefos-config/config.php`, rellenado |
| `backend/apps-script/Codigo.gs` | pegado en Extensiones → Apps Script de la hoja |
| — | `public_html/api/phpmailer/` con `PHPMailer.php`, `SMTP.php` y `Exception.php` |

El `config.php` va **fuera** de `public_html` a propósito. La receta habitual
es dejarlo en `api/` protegido con `<Files "config.php"> Order allow,deny /
Deny from all`, pero eso es sintaxis de Apache 2.2: en 2.4 se ignora salvo que
el hosting cargue `mod_access_compat`, y muchos no lo hacen. Creerías que está
bloqueado mientras el archivo con la contraseña se sirve por URL. Un archivo
que no está bajo el directorio público no se sirve nunca.

## Instalación

1. **PHPMailer sin Composer.** Descargar el ZIP de la última 6.x de
   `https://github.com/PHPMailer/PHPMailer/releases` y subir solo tres archivos
   de su carpeta `src/` a `public_html/api/phpmailer/`: `PHPMailer.php`,
   `SMTP.php` y `Exception.php`.

2. **Base de datos.** En cPanel → Bases de datos → *MySQL® Databases*:

   1. Crear la base.
   2. Crear el usuario.
   3. **Asignar el usuario a la base con todos los privilegios.** Este tercer
      paso es el que se olvida: las credenciales parecen correctas y la
      conexión falla igual.

   cPanel antepone el prefijo de la cuenta, así que los nombres reales quedan
   como `usuario_fondefos`. Después, en *phpMyAdmin*, pestaña **SQL**, pegar y
   ejecutar `sql/esquema.sql`.

3. **Carpetas de estado.** Crear y dejar escribibles:

   ```
   /home/USUARIO/fondefos-config/estado/
   /home/USUARIO/fondefos-config/estado/firmas/
   ```

   Permisos `755`; si algo falla al escribir, subir a `775`. Acá ya no hay
   contador ni cola de pendientes: los dos se movieron a MySQL.

4. **Configuración.** Copiar `config.example.php` como
   `/home/USUARIO/fondefos-config/config.php` y rellenarlo. Dejarlo con
   `ENTORNO = 'pruebas'` hasta terminar de probar: en ese modo todo el correo va
   a `CORREO_PRUEBAS` y no al buzón del cliente.

5. **Apps Script.** Pegar `apps-script/Codigo.gs`, crear las propiedades del
   script `TOKEN` y `CARPETA_FIRMAS_ID`, implementar como aplicación web
   (ejecutar como «Yo», acceso «Cualquier usuario») y copiar la URL `/exec` a
   `URL_APPS_SCRIPT`.

6. **Cron de reintentos**, cada 15 minutos:

   ```
   /usr/local/bin/php /home/USUARIO/public_html/api/reintentar.php
   ```

7. **Pasar a producción:** cambiar `ENTORNO` a `'produccion'`.

Los pasos con capturas y la configuración de SPF/DKIM están en
`BACKEND-FORMULARIOS.md`, en la raíz del proyecto.

## Cómo responde

Siempre JSON. Los errores son **códigos, no frases**: la traducción vive en
`frontend/src/lib/enviarFormulario.js`, así el servidor no filtra detalles
internos y no tiene que saber en qué idioma está el sitio.

```json
{ "ok": true,  "radicado": "CTC-2026-0001" }
{ "ok": false, "error": "campo_requerido", "campo": "telefono" }
```

| Código | HTTP | Significa |
|---|---|---|
| `base_no_disponible` | 503 | no se pudo conectar a MySQL |
| `no_se_pudo_guardar` | 503 | la transacción falló; **no quedó nada guardado** |
| `metodo_no_permitido` | 405 | no fue POST |
| `origen_no_permitido` | 403 | el `Origin` no está en `ORIGENES_PERMITIDOS` |
| `json_invalido` | 400 | el cuerpo no era JSON |
| `formulario_desconocido` | 400 | la clave no está en `FORMULARIOS` |
| `demasiado_rapido` | 429 | llegó en menos de 3 segundos |
| `limite_alcanzado` | 429 | seis envíos en una hora desde la misma IP |
| `verificacion_fallida` | 400 | reCAPTCHA, si está activado |
| `campo_requerido` | 422 | falta un obligatorio; viene con `campo` |
| `correo_invalido` | 422 | no pasó `FILTER_VALIDATE_EMAIL` |
| `monto_invalido` | 422 | la cuota no es mayor que cero |
| `falta_autorizacion` | 422 | no marcó la autorización de datos |
| `falta_firma` | 422 | el formulario la exige y no llegó |
| `correo_no_enviado` | 502 | los datos quedaron guardados, el correo no salió; **incluye el radicado** |

## Agregar un formulario

Cuatro pasos, sin tocar `enviar.php`:

1. Agregar el bloque en `FORMULARIOS` dentro de `config.php`: prefijo del
   radicado, destinatarios, si lleva firma y la lista blanca de campos.
2. En la página React, llamar a `enviarFormulario` con la clave nueva.
3. Enviar una prueba. La pestaña de la hoja se crea sola con sus encabezados.
4. Verificar que llegó el correo y la fila.

Lo que no esté en la lista blanca se descarta **en silencio**. Si un campo
llega vacío al correo, casi siempre es que la clave del payload no coincide con
la de `config.php`.

## Decisiones que no conviene revisar sin motivo nuevo

- **El correo sale por una cuenta del propio dominio**, no por
  `smtp.gmail.com`. Gmail exigiría App Password con 2FA, reescribiría el `From`
  a `@gmail.com` y sumaría el riesgo de un 587 bloqueado por el hosting. El
  buzón de Gmail sigue siendo el que recibe.
- **El radicado lo asigna MySQL**, dentro de la misma transacción que las
  filas del envío, con `INSERT ... ON DUPLICATE KEY UPDATE` sobre
  `consecutivos`. Antes vivía en un archivo con `flock`; se movió porque dos
  contadores son dos fuentes de verdad, y al restaurar un respaldo de la base
  el archivo habría quedado desfasado repitiendo números ya usados.
- **El límite por IP sí se queda en archivo.** Es dato efímero que se descarta
  a la hora; meterlo en MySQL sumaría dos escrituras a cada petición, incluidas
  las que se van a rechazar, sin ganar nada.
- **`CURLOPT_FOLLOWLOCATION` es obligatorio**: Apps Script responde 302 hacia
  googleusercontent y sin eso el cuerpo de la respuesta nunca llega.
- **El escapado va al imprimir, no al recibir.** Aplicar `htmlspecialchars` a
  la entrada corrompe el dato: alguien apellidado D'Angelo quedaría como
  `D&#039;Angelo` en el correo, en la hoja y en todo lo que se lea después.
- **`error_reporting(E_ALL)` con `display_errors` apagado**, no
  `error_reporting(0)`: lo segundo apaga también el registro y deja sin
  diagnóstico cuando algo falla.
- **reCAPTCHA queda cableado pero apagado** (`RECAPTCHA_SECRETO` vacío). Con
  trampa, límite por IP y tiempo mínimo alcanza para el volumen de un fondo de
  empleados. Si aparece spam real, se pega la clave y ya.
