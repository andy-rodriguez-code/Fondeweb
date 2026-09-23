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
en las columnas `correo_enviado` y `hoja_escrita`, y la cola recoge lo que
quedó pendiente leyendo de la propia base.

### Qué se entrega dónde

| | Cuándo sale | Por qué ahí |
|---|---|---|
| **Correo** | dentro de la petición, antes de contestar | hay una persona esperándolo |
| **Hoja** | en la cola, por el cron | es registro, tarda, y falla seguido |

Lo que este hosting mata es lo que pasa **después** de responder. Antes de
responder se puede trabajar tranquilo — es lo mismo que hace WordPress en este
mismo servidor, y por eso su formulario parece más rápido: no lo es, hace
esperar unos segundos y nadie lo nota.

El correo sale con un tope corto (`TIEMPO_MAXIMO_SMTP_EN_PETICION`). Si el SMTP
no responde pronto se suelta sin drama: el envío ya está en MySQL, así que la
cola lo entrega en el minuto siguiente. Nunca se pierde; como mucho, llega
tarde.

La hoja no va acá a propósito. Es la que devuelve 404 y páginas HTML de Google
a mitad de camino: ponerla en el camino de la persona sería cambiar un minuto
de demora por un formulario que a veces se cuelga.

> `dispararCola()` existe para que la hoja tampoco espere al cron, pero en este
> hosting **`exec()` está deshabilitado** y no puede funcionar. Se deja porque
> es correcta el día que eso cambie.

### Cómo entrega la cola

Tres reglas la sostienen, y las tres salen de fallas reales en producción:

1. **El correo primero, la hoja después.** Detrás del correo hay una persona
   esperando; la hoja es registro. Con la hoja adelante, una fila que Google
   tardaba en aceptar se comía la corrida entera y el correo de todos los
   demás salía tarde.
2. **Presupuesto de tiempo por corrida.** Una corrida no arranca una entrega
   más si no le entra en el peor caso. La corrida siguiente encuentra el
   candado tomado y se va sin hacer nada, así que pasarse del minuto no se
   atrasa a sí misma: atrasa al correo del que acaba de enviar.
3. **Tope de intentos por fila** (`intentos_correo`, `intentos_hoja`). Al
   agotarlos la fila sale de la cola y queda una línea `SE RINDIÓ` en el
   registro con qué hacer. Sin tope, una fila que nunca se pueda entregar se
   reintenta para siempre y nadie se entera.

Y del lado de la hoja, **los dos Apps Script descartan un radicado que ya está
escrito**. Eso es lo que hace que reintentar sea inofensivo: el backend no
puede saber si la fila entró cuando la respuesta se pierde en el camino, así
que la reenvía. Sobre HTTP nadie puede garantizar «exactamente una vez»; lo
único que se puede hacer es que el que recibe sea idempotente.

## Qué hay acá

```
backend/
├── api/
│   ├── enviar.php             ← único punto de entrada
│   ├── bd.php                 ← acceso a MySQL con PDO
│   ├── enviar-funciones.php   ← compartido con la cola
│   ├── reintentar.php         ← entrega correo y hoja (solo CLI)
│   └── .htaccess              ← solo enviar.php se sirve por HTTP
├── apps-script/
│   ├── contactenos.gs         ← se pega en el Apps Script de SU hoja
│   └── programa-100.gs        ← otra hoja, otro script, otra URL /exec
├── sql/
│   ├── esquema.sql            ← se ejecuta una vez en phpMyAdmin
│   └── migracion-*.sql        ← cambios sobre una base que ya está viva
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
| `backend/apps-script/contactenos.gs` | pegado en Extensiones → Apps Script de la hoja «Contáctenos» |
| `backend/apps-script/programa-100.gs` | pegado en el Apps Script de la hoja del Programa 100 |
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

5. **Apps Script, una vez por formulario.** Cada formulario tiene su propia
   hoja de cálculo, con su propio script y su propia URL. Para cada uno:

   1. Crear la hoja y abrir Extensiones → *Apps Script*.
   2. Borrar el `Código.gs` que viene y pegar el archivo que corresponde:
      `apps-script/contactenos.gs` o `apps-script/programa-100.gs`.
   3. Configuración del proyecto → *Propiedades del script* → agregar
      **`TOKEN_HOJA`** con el mismo valor que la constante del mismo nombre en
      `config.php`. El nombre tiene que ser exacto: el script compara contra esa
      propiedad y si no existe rechaza todos los envíos.
   4. Implementar → *Nueva implementación* → Aplicación web, ejecutar como
      «Yo», acceso «Cualquier usuario».
   5. Copiar la URL `/exec` al arreglo `URLS_APPS_SCRIPT` de `config.php`, en la
      clave del formulario: `'contacto'` o `'programa-100'`.

   Al editar un script después hay que crear una implementación **nueva**, o la
   URL sigue sirviendo el código viejo.

6. **Cron de reintentos**, cada 15 minutos:

   ```
   /usr/local/bin/php /home/USUARIO/public_html/api/reintentar.php
   ```

7. **Pasar a producción:** cambiar `ENTORNO` a `'produccion'`.

Los pasos con capturas y la configuración de SPF/DKIM están en
`BACKEND-FORMULARIOS.md`, dentro de `archivos-listos/documentacion-cliente/`.
Esa carpeta no se versiona: son documentos de trabajo con datos del cliente,
y este repositorio es público.

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
| `limite_alcanzado` | 429 | se superó `LIMITE_POR_IP` envíos en una hora desde la misma IP (30 por omisión) |
| `verificacion_fallida` | 400 | reCAPTCHA, si está activado |
| `contenido_no_permitido` | 422 | el filtro antispam lo marcó; el motivo queda en el registro |
| `campo_requerido` | 422 | falta un obligatorio; viene con `campo` |
| `correo_invalido` | 422 | no pasó `FILTER_VALIDATE_EMAIL` |
| `monto_invalido` | 422 | la cuota no es mayor que cero |
| `falta_autorizacion` | 422 | no marcó la autorización de datos |
| `falta_firma` | 422 | el formulario la exige y no llegó |
| `correo_no_enviado` | 502 | los datos quedaron guardados, el correo no salió; **incluye el radicado** |

## Agregar un formulario

Sin tocar `enviar.php`:

1. Agregar el bloque en `FORMULARIOS` dentro de `config.php`: prefijo del
   radicado, destinatarios, si lleva firma y la lista blanca de campos.
2. Crear la hoja de cálculo del formulario nuevo y montarle su Apps Script
   siguiendo el paso 5 de *Instalación*. Partir de uno de los `.gs` existentes y
   ajustar su arreglo `CAMPOS`, que es el que fija las columnas y su orden.
3. Pegar la URL `/exec` en `URLS_APPS_SCRIPT`, bajo la clave nueva. Sin esa
   entrada el envío se guarda en MySQL pero nunca llega a ninguna hoja, ni
   siquiera por el cron.
4. En la página React, llamar a `enviarFormulario` con la clave nueva.
5. Enviar una prueba. Los encabezados se escriben solos en la primera fila.
6. Verificar que llegó el correo y la fila.

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
