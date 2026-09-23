<?php
// Plantilla de configuración. Copiar como config.php, rellenar y subir a
// /home/USUARIO/fondefos-config/config.php — FUERA de public_html.
//
// Por qué fuera y no en api/ con una directiva que lo bloquee: la receta
// habitual es `<Files "config.php"> Order allow,deny / Deny from all`, que es
// sintaxis de Apache 2.2. En 2.4 se ignora salvo que el hosting cargue
// mod_access_compat, y muchos no lo hacen: creerías que está protegido
// mientras el archivo con la contraseña se sirve por URL. Un archivo que no
// está bajo el directorio público no se sirve nunca, sin depender de la
// versión de Apache ni de AllowOverride.
//
// Este archivo lleva valores ficticios y sí se versiona. El config.php real
// está en .gitignore desde antes de que existiera esta carpeta.

declare(strict_types=1);

// ── Entorno ───────────────────────────────────────────────────────────────
// 'pruebas' ignora los destinatarios de cada formulario y manda todo a
// CORREO_PRUEBAS. Es la diferencia entre probar tranquilo y llenarle el buzón
// al cliente con envíos de prueba.
const ENTORNO = 'pruebas';
const CORREO_PRUEBAS = 'tu-casilla@ejemplo.com';

// ── SMTP ──────────────────────────────────────────────────────────────────
// Cuenta del propio dominio, creada en cPanel → Email → Cuentas de correo.
// **Nunca el SMTP de Gmail**, y esto no es preferencia: es la única forma de
// que el correo no caiga en spam.
//
// El DNS de fondefos.com.co ya está armado para enviar, y bien:
//
//   SPF    v=spf1 +a +mx +ip4:190.8.176.55 ... -all   ← rechazo duro
//   DKIM   default._domainkey → clave RSA publicada
//   DMARC  v=DMARC1; p=reject                          ← la política más dura
//
// Saliendo desde este servidor con un remitente @fondefos.com.co, las tres
// alinean y el correo llega con la máxima confianza posible. Saliendo desde
// una cuenta @gmail.com, el mensaje dice "Sitio web FONDEFOS" pero la
// dirección real es un Gmail cualquiera: ninguna de las tres aplica y los
// filtros lo tratan como lo que parece. Así estuvo hasta el 16/09/2026.
//
// Tampoco sirve poner acá una dirección de otro dominio —por ejemplo
// @foscal.com.co, que es Google Workspace de la clínica—: su SPF no incluye
// la IP de este hosting, no podemos firmar DKIM por un dominio ajeno, y su
// DMARC está en `p=quarantine`. Sería el mismo problema con otro nombre.
// Los destinos pueden ser de cualquier dominio; el REMITENTE no.
//
// El puerto define el cifrado en enviar-funciones.php: 587 va con STARTTLS,
// cualquier otro con SSL directo. Poner 465 esperando STARTTLS no conecta.
//
// Este archivo SÍ se versiona: es la plantilla. Nunca puede tener un valor
// real. Todo lo que sea credencial va como REEMPLAZAR, y el valor verdadero
// solo existe en el config.php del servidor, que el .gitignore excluye.
const SMTP_HOST    = 'mail.fondefos.com.co';
const SMTP_PUERTO  = 465;            // 465 con SSL/TLS, 587 con STARTTLS
// La contraseña normal del buzón, la del webmail (puerto 2096). No es una
// App Password: eso era cosa de Gmail y ya no aplica.
const SMTP_USUARIO = 'administracion@fondefos.com.co';
const SMTP_CLAVE   = 'REEMPLAZAR';
const SMTP_NOMBRE  = 'Sitio web FONDEFOS';

// ── PHP de consola ────────────────────────────────────────────────────────
// Con qué binario se lanza el proceso que entrega el correo y escribe la hoja.
// Es lo que hace que el correo salga en el momento del envío y no cuando pase
// el cron.
//
// En cPanel casi siempre es /usr/local/bin/php, que es el valor por omisión si
// esta constante no está. Se puede ver el camino exacto en
// cPanel → Trabajos cron, en los ejemplos que muestra la propia página.
//
// Si el hosting tiene exec() deshabilitado, esto no se usa y la entrega queda
// a cargo del cron: hasta un minuto de demora y nada se pierde.
const RUTA_PHP_CLI = '/usr/local/bin/php';

// ── Base de datos MySQL ───────────────────────────────────────────────────
// Se crea en cPanel → Bases de datos → MySQL® Databases: primero la base,
// después el usuario, y por último hay que ASIGNAR el usuario a la base con
// todos los privilegios. Saltarse ese tercer paso es el error habitual: las
// credenciales parecen correctas y la conexión falla igual.
//
// cPanel antepone el prefijo de la cuenta, así que los nombres reales quedan
// como `usuario_fondefos` y no como los escribiste.
//
// Es la fuente de verdad del sistema: si acá no se guarda, el envío se
// rechaza. El correo y el Sheet son derivados.
const BD_HOST    = 'localhost';
const BD_PUERTO  = 3306;
const BD_NOMBRE  = 'usuario_fondefos';
const BD_USUARIO = 'usuario_fondeweb';
const BD_CLAVE   = 'REEMPLAZAR';

// ── Google Sheets ─────────────────────────────────────────────────────────
// Una hoja de cálculo por formulario, cada una con su propio Apps Script y su
// propio encabezado. La clave del arreglo es la misma que la de FORMULARIOS.
//
// Agregar un formulario nuevo con hoja propia es agregar su línea acá; si un
// formulario no tiene hoja, se omite y el envío se guarda igual en MySQL.
const URLS_APPS_SCRIPT = [
    'contacto'     => 'https://script.google.com/macros/s/REEMPLAZAR_CONTACTO/exec',
    'programa-100' => 'https://script.google.com/macros/s/REEMPLAZAR_PROGRAMA100/exec',
];

// El mismo token en los dos Apps Script, como propiedad del script.
// Sin él, cualquiera que averigüe la URL puede inyectar filas en la hoja del
// fondo: una URL larga no es una contraseña.
const TOKEN_HOJA = 'REEMPLAZAR';

// ── Estado en disco ───────────────────────────────────────────────────────
// Registro, límite por IP y las firmas en PNG. El consecutivo del radicado y
// la cola de pendientes ya NO viven acá: se movieron a MySQL para no tener dos
// fuentes de verdad. Debe existir y ser escribible, con una subcarpeta firmas/.
const RUTA_ESTADO = '/home/USUARIO/fondefos-config/estado';

// ── Origen permitido ──────────────────────────────────────────────────────
// Sin comodines. El SPA y el endpoint viven en el mismo dominio, así que en
// producción el navegador no manda Origin en estas peticiones; la lista existe
// para bloquear el uso del endpoint desde otro sitio web.
const ORIGENES_PERMITIDOS = [
    'https://ejemplo.com',
    'https://www.ejemplo.com',
];

// ── Límite de envíos por hora y por IP ────────────────────────────────────
// Treinta es lo razonable para este público: los asociados escriben desde la
// red de la clínica, así que decenas de personas comparten una sola IP pública
// y con un tope bajo se bloquean entre ellas. El que frena el spam de verdad es
// el filtro de contenido; esto es un techo contra una avalancha.
const LIMITE_POR_IP = 30;

// ── reCAPTCHA v3 (opcional) ───────────────────────────────────────────────
// Vacío = desactivado, y es el estado por defecto: con trampa, límite por IP y
// tiempo mínimo alcanza para el volumen de un fondo de empleados. Si aparece
// spam real, se pega acá la clave secreta y el endpoint empieza a exigir el
// token sin tocar más código.
const RECAPTCHA_SECRETO = '';
const RECAPTCHA_MINIMO  = 0.5;

// ── Formularios ───────────────────────────────────────────────────────────
// Un bloque por formulario. Agregar uno nuevo es agregar una entrada acá.
//
//   prefijo       → primeras letras del radicado
//   destinatarios → a quién le llega el aviso interno. Acá sí puede ir
//                   cualquier dominio: el que no puede ser ajeno es el
//                   REMITENTE, no el destino. Van las casillas
//                   institucionales, nunca una cuenta personal: el día que esa
//                   persona se va del fondo, los formularios se quedan sin
//                   nadie que los lea y nadie se entera.
//   campoCorreo   → clave del campo con el correo de quien escribe, para el
//                   acuse de recibo y el Reply-To. null si no lo pide.
//   firma         → true si el formulario trae firma digital
//   campos        → lista blanca. Lo que no esté acá se descarta en silencio.
const FORMULARIOS = [

    'contacto' => [
        'nombre'        => 'Contáctenos',
        'prefijo'       => 'CTC',
        'destinatarios' => [
            'administracion@fondefos.com.co',
            'fondo.empleados@foscal.com.co',
        ],
        'campoCorreo'   => 'correo',
        'firma'         => false,
        'campos'        => [
            'nombre'   => ['etiqueta' => 'Nombre completo',    'tipo' => 'texto',  'requerido' => true,  'max' => 120],
            'correo'   => ['etiqueta' => 'Correo electrónico', 'tipo' => 'correo', 'requerido' => true,  'max' => 160],
            'telefono' => ['etiqueta' => 'Teléfono',           'tipo' => 'texto',  'requerido' => true,  'max' => 40],
            'asunto'   => ['etiqueta' => 'Asunto',             'tipo' => 'texto',  'requerido' => true,  'max' => 60],
            'mensaje'  => ['etiqueta' => 'Mensaje',            'tipo' => 'texto',  'requerido' => false, 'max' => 4000],
        ],
    ],

    // Los 16 campos del formato, en el orden en que aparecen en pantalla.
    // El formato impreso que entregó el cliente no pide correo, así que
    // campoCorreo es null: quien se inscribe no recibe acuse, se queda con el
    // radicado en pantalla. `total` y `terminacion` no viajan: son calculados
    // y el servidor los recalcula para que el documento no pueda quedar en
    // desacuerdo consigo mismo.
    'programa-100' => [
        'nombre'        => 'Programa 100 de ahorro voluntario',
        'prefijo'       => 'P100',
        'destinatarios' => [
            'administracion@fondefos.com.co',
            'fondo.empleados@foscal.com.co',
        ],
        'campoCorreo'   => null,
        'firma'         => true,
        'campos'        => [
            'expedicion'         => ['etiqueta' => 'Fecha de expedición',      'tipo' => 'texto', 'requerido' => true,  'max' => 10],
            'grupo'              => ['etiqueta' => 'Grupo',                    'tipo' => 'texto', 'requerido' => false, 'max' => 20],
            'nombre'             => ['etiqueta' => 'Nombre del ahorrador',     'tipo' => 'texto', 'requerido' => true,  'max' => 120],
            'tipo-documento'     => ['etiqueta' => 'Tipo de documento',        'tipo' => 'texto', 'requerido' => false, 'max' => 10],
            'documento'          => ['etiqueta' => 'Número de identificación', 'tipo' => 'texto', 'requerido' => true,  'max' => 20],
            'direccion'          => ['etiqueta' => 'Dirección',                'tipo' => 'texto', 'requerido' => false, 'max' => 160],
            'telefono'           => ['etiqueta' => 'Teléfono',                 'tipo' => 'texto', 'requerido' => true,  'max' => 40],
            'ciudad'             => ['etiqueta' => 'Ciudad',                   'tipo' => 'texto', 'requerido' => false, 'max' => 80],
            'cuota'              => ['etiqueta' => 'Cuota mensual',            'tipo' => 'monto', 'requerido' => true,  'max' => 20],
            'ben-nombre'         => ['etiqueta' => 'Beneficiario',             'tipo' => 'texto', 'requerido' => false, 'max' => 120],
            'ben-tipo-documento' => ['etiqueta' => 'Beneficiario — tipo doc.', 'tipo' => 'texto', 'requerido' => false, 'max' => 10],
            'ben-documento'      => ['etiqueta' => 'Beneficiario — documento', 'tipo' => 'texto', 'requerido' => false, 'max' => 20],
            'ben-direccion'      => ['etiqueta' => 'Beneficiario — dirección', 'tipo' => 'texto', 'requerido' => false, 'max' => 160],
            'ben-telefono'       => ['etiqueta' => 'Beneficiario — teléfono',  'tipo' => 'texto', 'requerido' => false, 'max' => 40],
            'ben-ciudad'         => ['etiqueta' => 'Beneficiario — ciudad',    'tipo' => 'texto', 'requerido' => false, 'max' => 80],
            'acepta-terminos'    => ['etiqueta' => 'Aceptó los términos',      'tipo' => 'texto', 'requerido' => true,  'max' => 3],
        ],
    ],

];
