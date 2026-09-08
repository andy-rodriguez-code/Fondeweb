// Cascarón compartido: <head>, cabecera, pie. Un único origen para las 18 páginas.
export const SITIO = {
  nombre: "Fondefos",
  lema: "Tu Fondo de Servicios",
  logo: "assets/images/fondefos.com.co/cropped-fondefos_logo-300x116-2546eaee42.webp",
  logoPie: "assets/images/fondefos.com.co/cropped-fondefos_logo-300x116-2546eaee42.webp",
  favicon: "assets/images/fondefos.com.co/fondefos_favicon-b6c180865f.png",
  marcaAgua: "assets/images/fondefos.com.co/background_fondo_ico-e48e1f6f69.webp",
  telefonos: ["304 4962328", "302 2619797", "317 4357685"],
  fijo: "67008000 ext 2167",
  correo: "fondo.empleados@foscal.com.co",
  correoExtracto: "contactenos@fondefos.com.co",
  horario: "Lunes a viernes: 7:30 a. m. – 12:00 m. y 1:00 p. m. – 5:00 p. m.",
  direccion:
    "AP Floridablanca – Calle 155 A 23 09, frente a la Fundación Cardiovascular, junto a consulta externa – Nueva EPS.",
  extracto: "https://fondefos.misaldoweb.co",
  asociados: "1.200+",
  convenios: "65+",
  anio: "2026"
};

export const SERVICIOS = [
  ["ahorro.html", "Ahorro"],
  ["crediaportes-10.html", "Crediaportes + 10%"],
  ["credito-de-confianza.html", "Crédito de confianza"],
  ["credito-de-consumo-por-bonos.html", "Crédito de consumo por bonos"],
  ["credito-de-libre-inversion.html", "Crédito de libre inversión"],
  ["credito-de-impuestos.html", "Crédito de impuestos"],
  ["credito-de-recreacion-y-turismo.html", "Crédito de recreación y turismo"],
  ["credito-educativo.html", "Crédito educativo"],
  ["creditos-de-tesoreria.html", "Créditos de tesorería"],
  ["tarjeta-express.html", "Tarjeta expréss"]
];

export const NAV = [
  ["index.html", "Inicio"],
  ["nosotros.html", "Nosotros"],
  ["como-ser-asociado.html", "Cómo ser asociado"],
  ["__servicios__", "Servicios"],
  ["convenios.html", "Convenios"],
  ["beneficios.html", "Beneficios"],
  ["estado-de-cuenta.html", "Estado de cuenta"],
  ["preguntas-frecuentes.html", "Preguntas frecuentes"],
  ["contactenos.html", "Contáctenos"]
];

export const esc = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const ICONOS = {
  telefono:
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z"/></svg>',
  correo:
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 6 10-6"/></svg>',
  reloj:
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>',
  lugar:
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>',
  usuario:
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  alcancia:
    '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 11h2v4h-2"/><path d="M3 12a7 7 0 0 1 7-7h3a7 7 0 0 1 6.7 5"/><path d="M3 12v3a4 4 0 0 0 4 4h1v2h3v-2h2v2h3v-2.5"/><circle cx="8.5" cy="11.5" r="1"/><path d="M13 5V3"/></svg>',
  manos:
    '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 14 8.5 11.5a2 2 0 0 0-3 2.6l3 3.4a4 4 0 0 0 3 1.5h3l3-3"/><path d="m13 10 2.5-2.5a2 2 0 0 1 3 2.6l-3 3.4"/><path d="M2 9h3M19 9h3"/></svg>',
  regalo:
    '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="8" width="18" height="4" rx="1"/><path d="M5 12v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-8M12 8v13"/><path d="M12 8S10.5 3 8 3a2.5 2.5 0 0 0 0 5M12 8s1.5-5 4-5a2.5 2.5 0 0 1 0 5"/></svg>',
  etiqueta:
    '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.6 13.4 12 22l-9-9V3h10l7.6 7.6a2 2 0 0 1 0 2.8Z"/><circle cx="7.5" cy="7.5" r="1.3"/></svg>',
  documento:
    '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7Z"/><path d="M14 2v5h5M9 13h6M9 17h4"/></svg>',
  descarga:
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12m0 0 4-4m-4 4-4-4"/><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"/></svg>',
  facebook:
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M13.5 22v-8h2.7l.4-3.1h-3.1V8.9c0-.9.25-1.5 1.55-1.5h1.65V4.6A22 22 0 0 0 14.3 4.5c-2.4 0-4 1.45-4 4.1v2.3H7.6V14h2.7v8Z"/></svg>',
  instagram:
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none"/></svg>',
  flechaIzq:
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>',
  flechaDer:
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>',
  chevron:
    '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>',
  menu:
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18"/></svg>',
  check:
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>'
};

export const icono = (n) => ICONOS[n] || "";

function navHTML(actual) {
  const enServicios = SERVICIOS.some(([h]) => h === actual);
  return NAV.map(([href, texto]) => {
    if (href === "__servicios__") {
      const items = SERVICIOS.map(
        ([h, t]) =>
          `<a href="${h}"${h === actual ? ' aria-current="page"' : ""}>${esc(t)}</a>`
      ).join("\n              ");
      return `<div class="nav__grupo" data-abierto="no">
            <button type="button" class="nav__enlace nav__disparador" aria-expanded="false"${
              enServicios ? ' aria-current="page"' : ""
            }>Servicios ${ICONOS.chevron}</button>
            <div class="nav__panel">
              ${items}
            </div>
          </div>`;
    }
    return `<a class="nav__enlace" href="${href}"${
      href === actual ? ' aria-current="page"' : ""
    }>${esc(texto)}</a>`;
  }).join("\n          ");
}

export function cabecera(actual) {
  return `<a class="saltar" href="#contenido">Saltar al contenido principal</a>

    <div class="utilidad" data-od-id="barra-utilidad">
      <div class="shell utilidad__fila">
        <div class="utilidad__grupo">
          <a href="tel:+573044962328">${ICONOS.telefono}<span>${esc(SITIO.telefonos[0])}</span></a>
          <a href="mailto:${SITIO.correo}">${ICONOS.correo}<span>${esc(SITIO.correo)}</span></a>
        </div>
        <div class="utilidad__grupo">
          <a href="estado-de-cuenta.html">${ICONOS.usuario}<span>Consultar mi extracto</span></a>
        </div>
      </div>
    </div>

    <header class="cabecera" data-od-id="cabecera" data-menu="cerrado" data-fijo="no">
      <div class="shell cabecera__fila">
        <a class="marca" href="index.html" data-od-id="marca">
          <img src="${SITIO.logo}" width="300" height="116" alt="Fondefos, tu fondo de servicios" />
        </a>
        <button type="button" class="hamburguesa" aria-expanded="false" aria-label="Abrir el menú de navegación">
          ${ICONOS.menu}<span>Menú</span>
        </button>
        <nav class="nav" aria-label="Navegación principal" data-od-id="nav-principal">
          ${navHTML(actual)}
        </nav>
      </div>
    </header>`;
}

export function pie() {
  const servicios = SERVICIOS.slice(0, 6)
    .map(([h, t]) => `<li><a href="${h}">${esc(t)}</a></li>`)
    .join("\n            ");
  return `<footer class="pie" data-od-id="pie">
      <div class="shell">
        <div class="pie__rejilla">
          <div>
            <img class="pie__logo" src="${SITIO.logoPie}" width="300" height="116" alt="Fondefos, tu fondo de servicios" />
            <p>${esc(SITIO.direccion)}</p>
            <p style="margin-top:12px">${esc(SITIO.horario)}</p>
          </div>
          <div>
            <h4>Servicios</h4>
            <ul>
            ${servicios}
              <li><a href="convenios.html">Ver todos los convenios</a></li>
            </ul>
          </div>
          <div>
            <h4>El fondo</h4>
            <ul>
              <li><a href="nosotros.html">Nosotros</a></li>
              <li><a href="como-ser-asociado.html">Cómo ser asociado</a></li>
              <li><a href="beneficios.html">Beneficios</a></li>
              <li><a href="preguntas-frecuentes.html">Preguntas frecuentes</a></li>
              <li><a href="contactenos.html">Contáctenos</a></li>
            </ul>
          </div>
          <div>
            <h4>Atención</h4>
            <ul>
              <li><a href="tel:+573044962328">${esc(SITIO.telefonos[0])}</a></li>
              <li><a href="tel:+573022619797">${esc(SITIO.telefonos[1])}</a></li>
              <li><a href="tel:+573174357685">${esc(SITIO.telefonos[2])}</a></li>
              <li><a href="mailto:${SITIO.correo}">${esc(SITIO.correo)}</a></li>
            </ul>
          </div>
        </div>
        <p style="max-width:70ch">FONDEFOS cumple con la Ley 1581 de 2012 y el Decreto 1377 de 2013, en el marco general de la protección de datos personales.</p>
        <div class="pie__legal">
          <span>Copyright © ${SITIO.anio} | Fondefos</span>
          <div class="redes">
            <a href="https://www.facebook.com/fondefos" target="_blank" rel="noopener" aria-label="Fondefos en Facebook">${ICONOS.facebook}</a>
            <a href="https://www.instagram.com/fondefos.oficial/" target="_blank" rel="noopener" aria-label="Fondefos en Instagram">${ICONOS.instagram}</a>
          </div>
        </div>
      </div>
    </footer>`;
}

export function documento({ archivo, titulo, descripcion, cuerpo, extras = "" }) {
  return `<!doctype html>
<html lang="es-CO">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${esc(titulo)}</title>
    <meta name="description" content="${esc(descripcion)}" />
    <link rel="icon" href="${SITIO.favicon}" />
    <link rel="stylesheet" href="assets/site.css" />
  </head>
  <body data-pagina="${archivo.replace(".html", "")}">
    ${cabecera(archivo)}

    <main id="contenido" data-od-id="contenido-principal">
${cuerpo}
    </main>

    ${pie()}
${extras}
    <script src="assets/site.js"></script>
  </body>
</html>
`;
}
