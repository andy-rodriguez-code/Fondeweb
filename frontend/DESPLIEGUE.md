# Despliegue en cPanel

Cómo publicar el sitio. Toma unos diez minutos la primera vez.

## Antes de la primera vez

Verificar en cPanel, una sola vez:

1. **Versión de PHP** — Software → *Select PHP Version*. Hoy marca 7.4, sin
   soporte desde noviembre de 2022. Si el desplegable ofrece 8.1 o superior,
   subir. Si el WordPress viejo todavía vive en este mismo hosting, probar
   primero: el cambio de versión puede tumbarlo.
2. **Extensiones `curl` y `mbstring`** — misma pantalla. Sin `curl` no hay
   escritura en el Google Sheet.
3. **SSL** — SSL/TLS Status. Activar el certificado gratuito de Let's Encrypt si
   el dominio no lo tiene. Sin candado, el `.htaccess` va a redirigir a una
   página que el navegador marca como insegura.
4. **SPF y DKIM** — Email → *Deliverability*. Si aparece en rojo, usar
   *Reparar*. Sin esto los avisos de los formularios caen en spam.

## Compilar

```bash
cd frontend
npm ci
npm run build
```

Queda todo en `frontend/dist/`. Incluye el `.htaccess`: verificarlo con
`ls -a dist/.htaccess` antes de subir.

## Subir

En cPanel → Archivos → *Administrador de archivos*, dentro de `public_html`:

1. Borrar el contenido anterior del sitio, **menos** la carpeta `api/`. Si
   todavía está el WordPress viejo, moverlo a una carpeta de respaldo en vez de
   borrarlo, hasta confirmar que el sitio nuevo anda.
2. Comprimir el contenido de `dist/` en un ZIP —el contenido, no la carpeta—.
3. Subir el ZIP a `public_html` y extraerlo ahí.
4. Confirmar que `public_html/.htaccess` y `public_html/index.html` quedaron en
   la raíz, no dentro de un subdirectorio.

## Verificar

En este orden. Cada paso aísla una causa distinta:

1. `https://fondefos.com.co` carga la portada.
2. Navegar a Convenios desde el menú.
3. **Recargar esa página con F5.** Si da 404, el `.htaccess` no llegó o el
   hosting tiene `AllowOverride` apagado.
4. `http://fondefos.com.co` (sin la ese) redirige a HTTPS.
5. Abrir una imagen del sitio directo por URL: debe cargar.

## Actualizar el sitio

Repetir *Compilar* y *Subir*. Los bundles llevan hash en el nombre, así que el
navegador toma los nuevos sin que nadie limpie caché.

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
| El sitio carga sin estilos | el ZIP se extrajo dentro de un subdirectorio |
| Cambios que no aparecen | se subió `dist/` como carpeta en vez de su contenido |
| Error 500 sin explicación | el `.htaccess` llegó con finales de línea CRLF |

El backend de los formularios se configura aparte: ver `BACKEND-FORMULARIOS.md`
en la raíz del proyecto.
