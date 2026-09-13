# Fondefos — sitio web

Sitio institucional de **FONDEFOS**, el fondo de empleados de la FOSCAL, en
Floridablanca, Santander.

Reemplaza al sitio anterior en WordPress, que cargaba 74 archivos por visita —27
de JavaScript y 28 de CSS— con un TTFB de 1,7 s. Esta versión sirve **un bundle
de JavaScript y una hoja de estilos**.

En producción: <https://fondefos.com.co>

---

## Qué hay acá

```
frontend/    el sitio: React + Vite, compila a estáticos
backend/     el endpoint PHP de los formularios y sus Apps Script
```

Cada carpeta tiene su propio README con el detalle. Este documento es el mapa.

| | |
|---|---|
| Framework | React 19 |
| Compilador | Vite 8 |
| Estilos | Tailwind CSS 4 (tokens con `@theme`, sin `tailwind.config.js`) |
| Rutas | React Router 7 (`createBrowserRouter`) |
| Backend | PHP sin framework, MySQL, PHPMailer |
| Pruebas | Vitest — 18, sobre los dos formularios |
| Lint | oxlint |
| Hosting | cPanel con LiteSpeed, detrás de Cloudflare |

## Puesta en marcha

```bash
cd frontend
npm ci
npm run dev      # http://localhost:5173
npm run build    # compila a dist/ y prerenderiza el head de cada ruta
npm test
npm run lint
```

Para trabajar contra un PHP local en vez del hosting, ver `frontend/README.md`.

## Cómo funciona un envío

```
formulario → api/enviar.php → MySQL → respuesta al navegador
                                 ↓
                        correo + Google Sheet
                        (con la conexión ya cerrada)
```

**MySQL es la fuente de verdad.** Si ahí no se guarda, el envío no existió y se
rechaza. El correo y la hoja son derivados: que fallen no borra nada, quedan
marcados en la base y un cron los recupera cada quince minutos.

El navegador recibe su respuesta **apenas la base confirma**, no al final. Antes
esperaba también al SMTP y al Apps Script, y en redes móviles lentas el teléfono
cortaba la espera y mostraba un error con el envío ya guardado.

## Las 20 páginas

Portada, nueve líneas de crédito, ahorro, nosotros, cómo ser asociado,
convenios, beneficios, estado de cuenta, preguntas frecuentes, contáctenos,
Programa 100 y política de datos. Más `/gracias`, que es el cierre de un envío y
va fuera del layout.

## Formularios

Dos, los dos conectados y funcionando:

| | Contáctenos | Programa 100 |
|---|---|---|
| Radicado | `CTC-2026-0001` | `P100-2026-0001` |
| Firma | no | sí, se dibuja y viaja como PNG |
| Acuse a quien escribe | sí | no pide correo |
| Hoja de cálculo | propia | propia |

Cada uno tiene su hoja, su Apps Script y su URL. Agregar un formulario nuevo es
agregar un bloque en `config.php` y su hoja; no se toca `enviar.php`.

## Antispam, sin servicios de terceros

Siete defensas, todas en el propio servidor:

1. Campo trampa que un robot llena y una persona no ve
2. Tiempo mínimo: menos de tres segundos no lo llenó nadie
3. Límite de cinco envíos por hora y por IP
4. Alfabetos no latinos —cirílico, árabe, chino, japonés, tailandés—
5. Enlaces en campos donde nunca son legítimos
6. Dos o más enlaces externos en la prosa; uno se tolera
7. Etiquetas HTML o BBCode, y texto generado por repetición

reCAPTCHA v3 está **cableado y apagado**. Se descartó a propósito: no bloquea,
puntúa, y una persona real con VPN o en incógnito saca puntaje bajo y queda
afuera sin saber por qué. Si algún día hace falta, se enciende pegando dos
claves.

Las reglas se deducen de la definición del formulario, nunca de listas de
nombres de campo: así cualquier campo nuevo queda cubierto solo.

## SEO

- Un `index.html` por ruta, generado al compilar, con su propio título,
  descripción y etiquetas de vista previa. Los rastreadores de WhatsApp y
  Facebook no ejecutan JavaScript: sin esto, las veinte páginas compartirían la
  vista previa de la portada
- Datos estructurados: `FinancialService`, `BreadcrumbList` y `FAQPage`
- `robots.txt` y `sitemap.xml` como archivos reales, no reescritos por el SPA
- Imagen de vista previa propia, 1200×630, con la marca

## Decisiones que conviene conocer

**Los tokens de marca viven en `styles/index.css`**, dentro de `@theme`. Es el
único lugar del proyecto con literales hexadecimales; el resto usa
`var(--color-*)`. Tailwind 4 configura desde CSS, por eso no hay
`tailwind.config.js`.

**`styles/paridad.css` agrupa lo que Tailwind no puede expresar**: contadores
CSS, `mask-image`, coreografías de estado por atributo, pseudo-elementos con
contenido. Cada grupo lleva su justificación y la fuente de la que se portó.

**Cuidado con las capas de Tailwind.** Las utilidades viven en una capa
posterior a `components`, así que ganan a cualquier regla de `paridad.css` sin
importar la especificidad. Si un color o un tamaño «no aplica», suele ser esto:
la solución es ponerlo en el componente, no subir especificidad en el CSS.

**El contenido está separado de la vista**, en `src/data/`. Cambiar una tasa, un
teléfono o un horario es editar un dato, no un componente.

**Las imágenes van en `src/assets/images/`, no en `public/`**: así Vite las
procesa, les agrega hash de contenido y **falla el build si falta un archivo**.
`public/` queda para lo que necesita URL fija: los PDF, el `robots.txt`, el
`sitemap.xml` y la imagen de vista previa.

**El radicado lo asigna MySQL**, dentro de la misma transacción que el envío.
Antes vivía en un archivo con `flock`; dos contadores son dos fuentes de verdad,
y al restaurar un respaldo de la base el archivo habría repetido números.

**Accesibilidad**: todos los campos con `<label>`, trampa de foco en los
diálogos, cierre con Escape, `prefers-reduced-motion` respetado en el contador
de cifras, y las mayúsculas de los títulos se aplican por CSS para que un lector
de pantalla no deletree.

## Seguridad

**Nada de credenciales en el repositorio.** Es público. El `config.php` con las
contraseñas vive fuera de `public_html`, en `/home/USUARIO/fondefos-config/`, y
el `.gitignore` lo excluye. Los archivos `*.example` son plantillas: todo valor
real va como `REEMPLAZAR`.

Antes de cada `git push`, auditar **el contenido** y no solo los nombres de
archivo. Un `config.example.php` no levanta sospecha por su nombre y sí puede
traer una contraseña adentro.

Lo demás: consultas con sentencias preparadas sin excepción, CORS por lista
blanca, errores al registro y nunca a la pantalla, y cabeceras de seguridad —
HSTS, `X-Frame-Options`, `nosniff`, `Referrer-Policy`— en el `.htaccess`.

## Despliegue

Está en `frontend/README.md`, con la lista de verificación y la tabla de fallas
habituales. La configuración del backend, en `backend/README.md`.

## Notas de operación

`archivos-listos/` guarda el clon estático del sitio anterior, los documentos de
trabajo del cliente y los paquetes de despliegue. Está fuera del control de
versiones: es material de consulta con datos del cliente, no parte del producto.
