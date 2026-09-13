# Frontend de fondefos.com.co

Sitio de FONDEFOS, el fondo de empleados de la FOSCAL. React con Vite y
Tailwind, compilado a estáticos que se sirven desde cPanel.

## Desarrollo

```bash
npm ci
npm run dev     # http://localhost:5173
npm run lint
npm test
```

El endpoint de los formularios vive en el hosting. Para trabajar contra un PHP
local, el proxy se apunta con una variable del shell:

```bash
VITE_API_ORIGEN=http://127.0.0.1:8000 npm run dev
```

Va en el shell y no solo en `.env.local` porque `vite.config.js` la lee con
`loadEnv` pero da prioridad al entorno. Ver `.env.example`.

## Compilar

```bash
npm run build
```

Deja todo en `dist/`, y además de los estáticos escribe **un `index.html` por
ruta**: cada página con su propio título, su descripción y sus etiquetas de
vista previa. Hace falta porque los rastreadores de WhatsApp, Facebook y
LinkedIn no ejecutan JavaScript, y con un solo documento todas las páginas
compartirían la vista previa de la portada.

`dist/` incluye el `.htaccess`. Verificarlo con `ls -a dist/.htaccess` antes de
subir: sin él, recargar una ruta interna da 404.

---

# Despliegue en cPanel

Toma unos diez minutos la primera vez.

## Antes de la primera vez

Verificar en cPanel, una sola vez:

1. **Versión de PHP** — Software → *Select PHP Version*. Hoy marca 7.4, sin
   soporte desde noviembre de 2022. Si el desplegable ofrece 8.1 o superior,
   subir. Si el WordPress viejo todavía vive en este mismo hosting, probar
   primero: el cambio de versión puede tumbarlo.
2. **Extensiones `curl` y `mbstring`** — misma pantalla. Sin `curl` no hay
   escritura en el Google Sheet.
3. **SSL** — SSL/TLS Status. Activar el certificado gratuito de Let's Encrypt si
   el dominio no lo tiene. Va **antes** de subir el `.htaccess`: ese archivo
   manda HSTS, y si el navegador la recibe sin HTTPS funcionando se niega a
   abrir el sitio hasta que venza el plazo.
4. **SPF y DKIM** — Email → *Deliverability*. Si aparece en rojo, usar
   *Reparar*. Sin esto los avisos de los formularios caen en spam.

## Subir

En cPanel → Archivos → *Administrador de archivos*, dentro de `public_html`:

1. Borrar el contenido anterior del sitio, **menos** la carpeta `api/`. Si
   todavía está el WordPress viejo, moverlo a una carpeta de respaldo en vez de
   borrarlo, hasta confirmar que el sitio nuevo anda.
2. Comprimir el contenido de `dist/` en un ZIP —el contenido, no la carpeta—.
3. Subir el ZIP a `public_html` y extraerlo ahí.
4. Confirmar que `public_html/.htaccess` y `public_html/index.html` quedaron en
   la raíz, no dentro de un subdirectorio.
5. **Purgar la caché de Cloudflare.** El sitio está detrás de Cloudflare, y el
   `index.html`, el `robots.txt` y el `sitemap.xml` conservan el mismo nombre
   entre despliegues: sin purgar se siguen sirviendo los viejos.

Al comprimir desde Windows, armar el ZIP con una herramienta que escriba las
rutas con `/`. El `Compress-Archive` de PowerShell 5.1 usa `\`, y al
descomprimir en el Linux del hosting quedan archivos llamados literalmente
`api\enviar.php`.

## Verificar

En este orden. Cada paso aísla una causa distinta:

1. `https://fondefos.com.co` carga la portada.
2. Navegar a Convenios desde el menú.
3. **Recargar esa página con F5.** Si da 404, el `.htaccess` no llegó o el
   hosting tiene `AllowOverride` apagado.
4. `http://fondefos.com.co` (sin la ese) redirige a HTTPS.
5. Abrir una imagen del sitio directo por URL: debe cargar.
6. Enviar el formulario de Contáctenos: tiene que llevar a la pantalla de
   gracias con un radicado.

## Qué NO se sube

- `node_modules/`
- `src/`
- Cualquier `.env` o `.env.local`
- El `config.php` del backend: va **fuera** de `public_html`, en
  `/home/USUARIO/fondefos-config/`

## Cuando algo falla

| Síntoma | Causa casi siempre |
|---|---|
| 404 al recargar una ruta interna | falta el `.htaccess` o `AllowOverride` está apagado |
| `/api/enviar.php` devuelve el HTML del sitio | la regla `^api/` quedó después de la del SPA |
| El sitio carga sin estilos o en blanco | faltó subir el `assets/` nuevo: el JS y el CSS cambian de hash en cada compilación |
| Cambios que no aparecen | se subió `dist/` como carpeta en vez de su contenido, o falta purgar Cloudflare |
| Error 500 en todo `/api/` | un `.php` se cortó en la subida; comparar los tamaños |
| Error 500 sin explicación | el `.htaccess` llegó con finales de línea CRLF |

El backend de los formularios se configura aparte: ver `backend/README.md`.
