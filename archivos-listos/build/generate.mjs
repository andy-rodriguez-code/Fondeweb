// Genera las 18 páginas estáticas del sitio a partir del contenido real
// extraído de fondefos.com.co. Ejecutar: node build/generate.mjs
import { writeFileSync, mkdirSync } from "node:fs";
import { documento, SITIO, SERVICIOS, esc, icono } from "./shell.mjs";
import { CREDITOS, PREGUNTAS, BENEFICIOS, PRINCIPIOS, NOTIFONDO, PORTADA_LAMINAS } from "./paginas.mjs";
import { CONVENIOS, CATEGORIAS, CATEGORIAS_USADAS } from "./convenios.mjs";

const raiz = new URL("../", import.meta.url);
const emitidos = [];
const emitir = (archivo, html) => {
  writeFileSync(new URL(`./${archivo}`, raiz), html);
  emitidos.push(archivo);
};

const idKebab = (s) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/* ---------------------------------------------------------------- piezas -- */

const rotulo = (t) => `<span class="rotulo">${esc(t)}</span>`;

function encabezado({ titulo, entrada, miga, aparte = "" }) {
  const migas = [["index.html", "Inicio"], ...miga]
    .map(([h, t], i, a) =>
      i === a.length - 1
        ? `<li aria-current="page">${esc(t)}</li>`
        : `<li><a href="${h}">${esc(t)}</a></li>`
    )
    .join("\n            ");
  return `      <section class="encabezado" data-od-id="encabezado-pagina">
        <div class="shell encabezado__rejilla">
          <div>
            <ol class="miga">
            ${migas}
            </ol>
            <h1>${esc(titulo)}</h1>
            ${entrada ? `<p class="entrada">${esc(entrada)}</p>` : ""}
          </div>
          ${aparte}
        </div>
      </section>`;
}

function bandaCierre({
  titulo,
  texto,
  cta = ["contactenos.html", "Hablar con el fondo"],
  variante = "banda--primario",
  claseBoton = "btn btn--fantasma"
}) {
  return `      <section class="banda ${variante}" data-od-id="banda-cierre">
        <div class="shell banda__fila">
          <div>
            <h2>${esc(titulo)}</h2>
            ${texto ? `<p>${esc(texto)}</p>` : ""}
          </div>
          <a class="${claseBoton}" href="${cta[0]}">${esc(cta[1])}</a>
        </div>
      </section>`;
}

const acordeon = (items, idBase) => `        <div class="filas" data-acordeon data-od-id="${idBase}">
${items
  .map(
    ([p, r], i) => `          <div class="fila" data-abierta="${i === 0 ? "si" : "no"}">
            <h3 style="margin:0">
              <button type="button" class="fila__boton" aria-expanded="${i === 0}" aria-controls="${idBase}-${i}">
                <span>${esc(p)}</span>
                <span class="fila__signo" aria-hidden="true">+</span>
              </button>
            </h3>
            <div class="fila__cuerpo" id="${idBase}-${i}">${esc(r)}</div>
          </div>`
  )
  .join("\n")}
        </div>`;

/* ------------------------------------------------------------- 1. portada -- */

const laminas = PORTADA_LAMINAS.map(
  (l, i) => `              <div class="carrusel__lamina" data-activa="${i === 0 ? "si" : "no"}" aria-hidden="${i !== 0}">
                <img src="${l.src}" width="768" height="960" alt="${esc(l.alt)}" ${
    i === 0 ? 'fetchpriority="high"' : 'loading="lazy"'
  } />
              </div>`
).join("\n");

const puntos = PORTADA_LAMINAS.map(
  (l, i) =>
    `              <button type="button" class="carrusel__punto" role="tab" aria-selected="${i === 0}" aria-label="Ver pieza ${
      i + 1
    } de ${PORTADA_LAMINAS.length}"></button>`
).join("\n");

const accesos = [
  ["convenios.html", "etiqueta", "Convenios", "Con múltiples marcas de la región"],
  ["como-ser-asociado.html", "manos", "Cómo ser asociado", "Descargá el formato y afiliate"],
  ["ahorro.html", "alcancia", "Ahorro", "Programado y de fácil acceso"],
  ["beneficios.html", "regalo", "Beneficios", "En servicios a nuestros asociados"]
]
  .map(
    ([h, ic, t, d]) => `            <a class="acceso" href="${h}" data-od-id="acceso-${idKebab(t)}">
              <span class="acceso__icono">${icono(ic)}</span>
              <h4>${esc(t)}</h4>
              <p>${esc(d)}</p>
            </a>`
  )
  .join("\n");

const hojasNotifondo = NOTIFONDO.map(
  (h) => `            <button type="button" class="notifondo__hoja" data-od-id="notifondo-${h.n}"
              data-visor-src="${h.archivo}"
              data-visor-alt="Notifondo de Fondefos, página ${h.n} de ${NOTIFONDO.length}">
              <img src="${h.archivo}" width="819" height="1024" loading="lazy"
                alt="Notifondo de Fondefos, página ${h.n} de ${NOTIFONDO.length}" />
              <span class="notifondo__pie"><span>Página ${h.n}</span><span>Ampliar</span></span>
            </button>`
).join("\n");

const portada = `      <section class="portada" data-od-id="portada">
        <img class="portada__marca-agua" src="${SITIO.marcaAgua}" width="298" height="355" alt="" aria-hidden="true" />
        <div class="shell portada__rejilla">
          <div class="portada__texto">
            ${rotulo("Fondo de empleados · Floridablanca")}
            <h1>Tu Fondo de <br />Servicios</h1>
            <p class="portada__bajada">Conocé nuestra variedad de créditos, convenios y servicios que tenemos para ofrecerte.</p>
            <div class="portada__acciones">
              <a class="btn" href="nosotros.html" data-od-id="cta-portada">Conocé el fondo</a>
              <a class="btn btn--secundario" href="#lineas-de-credito">Ver líneas de crédito</a>
            </div>
          </div>

          <div class="marco-offset">
            <div class="marco-offset__caja carrusel" data-carrusel data-od-id="carrusel-portada">
              <div class="carrusel__pista">
${laminas}
              </div>
              <button type="button" class="carrusel__nav carrusel__nav--prev" aria-label="Pieza anterior">${icono(
                "flechaIzq"
              )}</button>
              <button type="button" class="carrusel__nav carrusel__nav--sig" aria-label="Pieza siguiente">${icono(
                "flechaDer"
              )}</button>
              <div class="carrusel__puntos" role="tablist" aria-label="Piezas destacadas">
${puntos}
              </div>
              <div class="dato-flotante">
                <div>
                  <strong>${esc(SITIO.asociados)}</strong>
                  <span>Asociados</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="banda" data-od-id="banda-registro">
        <div class="shell banda__fila">
          <div>
            <h2>Registrate ahora y recibí todos los beneficios como asociado.</h2>
            <p>Sin costo de afiliación. Solo necesitás tu último desprendible de nómina, la fotocopia de la cédula y la certificación laboral.</p>
          </div>
          <a class="btn btn--claro" href="como-ser-asociado.html" data-od-id="cta-registro">Registrarme aquí</a>
        </div>
      </section>

      <section class="seccion" id="notifondo" data-od-id="seccion-notifondo">
        <div class="shell">
          <div style="max-width:60ch;margin-bottom:34px">
            ${rotulo("Boletín del asociado")}
            <h2 class="titulo-dual">¡<strong>Notifondo</strong>!</h2>
            <p>Las novedades del fondo, edición vigente. Tocá cualquier página para ampliarla.</p>
          </div>
          <div class="notifondo" data-od-id="rejilla-notifondo">
${hojasNotifondo}
          </div>
        </div>
      </section>

      <section class="seccion seccion--tinta" data-od-id="seccion-accesos">
        <div class="shell">
          <div style="max-width:58ch;margin-bottom:34px">
            ${rotulo("Accesos rápidos")}
            <h2 class="titulo-dual">Todo lo que el fondo <strong>hace por vos</strong></h2>
          </div>
          <div class="rejilla rejilla--4">
${accesos}
          </div>

          <div class="cifras" style="margin-top:clamp(44px,5vw,72px)">
            <div class="cifra"><strong>${esc(SITIO.asociados)}</strong><span>Ya somos asociados</span></div>
            <div class="cifra"><strong>${esc(SITIO.convenios)}</strong><span>Y tenemos convenios</span></div>
            <div class="cifra"><strong>0,8%</strong><span>Desde, en tasa mensual</span></div>
          </div>
        </div>
      </section>

      <section class="seccion seccion--bright" id="lineas-de-credito" data-od-id="seccion-lineas">
        <div class="shell">
          <div style="max-width:60ch;margin-bottom:34px">
            ${rotulo("Servicios")}
            <h2 class="titulo-dual">Nueve líneas de crédito y <strong>dos formas de ahorro</strong></h2>
            <p>Cada línea tiene su propia tasa, plazo y requisitos. Estos son los valores vigentes publicados por el fondo.</p>
          </div>
          <div class="rejilla rejilla--3">
${CREDITOS.map(
  (c) => `            <a class="tarjeta" href="${c.archivo}" data-od-id="linea-${c.archivo.replace(".html", "")}">
              <h3>${esc(c.titulo)}</h3>
              <p>${esc(c.entrada)}</p>
              <div class="tarjeta__pie">
                <span class="etiqueta">${esc(c.resumen[0][1])}</span>
              </div>
            </a>`
).join("\n")}
          </div>
        </div>
      </section>

      <section class="seccion" data-od-id="seccion-ubicacion">
        <div class="shell split">
          <div>
            ${rotulo("Dónde estamos")}
            <h2 class="titulo-dual">¿Dónde estamos <strong>ubicados</strong>?</h2>
            <p>Atendemos de manera presencial en la sede de Floridablanca, Santander.</p>
            <a class="btn btn--secundario" href="https://www.google.com/maps/search/?api=1&amp;query=Calle+155A+%2323-09+Floridablanca+Santander" target="_blank" rel="noopener">Cómo llegar</a>
          </div>
          <div class="tarjeta" style="padding:clamp(24px,3vw,34px)">
            <div class="dato-contacto">
              <span class="dato-contacto__icono">${icono("lugar")}</span>
              <div><h4>Sede</h4><p>${esc(SITIO.direccion)}</p></div>
            </div>
            <div class="dato-contacto">
              <span class="dato-contacto__icono">${icono("reloj")}</span>
              <div><h4>Horario de atención</h4><p>${esc(SITIO.horario)}</p></div>
            </div>
            <div class="dato-contacto">
              <span class="dato-contacto__icono">${icono("telefono")}</span>
              <div><h4>Teléfonos</h4><p>${esc(SITIO.telefonos.join(" · "))}<br />Fijo: ${esc(SITIO.fijo)}</p></div>
            </div>
          </div>
        </div>
      </section>`;

const visor = `    <div class="visor" data-od-id="visor" data-abierto="no" role="dialog" aria-modal="true" aria-label="Notifondo ampliado">
      <button type="button" class="visor__cerrar" data-cerrar-visor aria-label="Cerrar la vista ampliada">✕</button>
      <img src="" alt="" />
    </div>`;

emitir(
  "index.html",
  documento({
    archivo: "index.html",
    titulo: "Fondefos – Tu Fondo de Servicios",
    descripcion:
      "Fondo de empleados en Floridablanca: nueve líneas de crédito, ahorro programado y más de 65 convenios para los asociados.",
    cuerpo: portada,
    extras: visor
  })
);

/* ------------------------------------------------------------ 2. nosotros -- */

const nosotros = `${encabezado({
  titulo: "Nosotros",
  entrada:
    "FONDEFOS es una empresa asociativa de derecho privado constituida para fomentar el ahorro y prestar servicios de crédito a sus asociados.",
  miga: [["nosotros.html", "Nosotros"]],
  aparte: `<div class="cifras" style="--enfasis:#e8792b">
            <div class="cifra" style="border-color:var(--primario)"><strong style="color:var(--tinta)">${esc(
              SITIO.asociados
            )}</strong><span style="color:var(--muted)">Asociados</span></div>
            <div class="cifra" style="border-color:var(--interactivo)"><strong style="color:var(--tinta)">${esc(
              SITIO.convenios
            )}</strong><span style="color:var(--muted)">Convenios</span></div>
          </div>`
})}

      <section class="seccion" data-od-id="seccion-vision-mision">
        <div class="shell split">
          <div class="tarjeta" style="padding:clamp(26px,3vw,38px);background:var(--tinta);border-color:var(--tinta)">
            <span class="rotulo" style="color:#6fd9ef">Visión</span>
            <h2 style="color:#fff">Solución inmediata a lo más apremiante</h2>
            <p style="color:#cfd8e6">La visión de FONDEFOS es la de ser fuente para la solución inmediata de las necesidades más apremiantes y ordinarias de sus asociados, mediante la regulación del ahorro y el crédito en forma solidaria.</p>
          </div>
          <div>
            ${rotulo("Misión")}
            <h2 class="titulo-dual">Contribuir al <strong>desarrollo integral</strong> del asociado y su familia</h2>
            <p>La misión de FONDEFOS es contribuir al desarrollo integral de los asociados y su grupo familiar, y propender por un vínculo socioempresarial y un elevamiento de identidad laboral que les motive a fortalecer y crear mayor capital para su usufructo personal y la inversión en la familia.</p>
          </div>
        </div>
      </section>

      <section class="seccion seccion--bright" data-od-id="seccion-principios">
        <div class="shell">
          <div style="max-width:56ch;margin-bottom:32px">
            ${rotulo("Principios")}
            <h2 class="titulo-dual">Cinco principios que <strong>ordenan cada decisión</strong></h2>
          </div>
          <div class="rejilla rejilla--3">
${PRINCIPIOS.map(
  (p, i) => `            <div class="tarjeta" data-od-id="principio-${idKebab(p)}">
              <span class="etiqueta">0${i + 1}</span>
              <h3 style="margin-top:14px;margin-bottom:0">${esc(p)}</h3>
            </div>`
).join("\n")}
          </div>
        </div>
      </section>

      <section class="seccion" data-od-id="seccion-objetivos">
        <div class="shell split split--invertido">
          <div class="split__media">
            <div class="marco-offset">
              <div class="marco-offset__caja">
                <img src="${NOTIFONDO[0].archivo}" width="819" height="1024" loading="lazy"
                  alt="Notifondo de Fondefos con las actividades y novedades del fondo." />
              </div>
            </div>
          </div>
          <div>
            ${rotulo("Objetivos")}
            <h2 class="titulo-dual">Ahorro, crédito y <strong>bienestar social</strong></h2>
            <p>El Fondo de Empleados, como empresa asociativa y de derecho privado del orden legal, está constituido con el objeto de fomentar el ahorro y prestar los servicios de crédito en distintas formas a los asociados, y proporcionar otros servicios en forma permanente.</p>
            <p>Además, busca dar oportuno apoyo de previsión, solidaridad y bienestar social, fortaleciendo los lazos de compañerismo y ayuda mutua entre sus asociados.</p>
          </div>
        </div>
      </section>

${bandaCierre({
  titulo: "¿Querés hacer parte del fondo?",
  texto: "La afiliación no tiene costo y el trámite se hace con tres documentos.",
  cta: ["como-ser-asociado.html", "Ver cómo afiliarme"]
})}`;

emitir(
  "nosotros.html",
  documento({
    archivo: "nosotros.html",
    titulo: "Nosotros – Fondefos",
    descripcion:
      "Visión, misión, principios y objetivos de FONDEFOS, el fondo de empleados de Floridablanca.",
    cuerpo: nosotros
  })
);

/* -------------------------------------------------- 3. cómo ser asociado -- */

const pasos = [
  ["Descargá el formato", "Bajá el formato de afiliación y el formulario de conocimiento del asociado."],
  ["Reuní los documentos", "Último desprendible de nómina, fotocopia de la cédula y certificación laboral (aplica para independientes)."],
  ["Entregalo en la sede", "Radicá los documentos en la oficina de Floridablanca o consultanos por teléfono."],
  ["Empezá a ahorrar", "Desde el primer mes de ahorro ya podés tramitar un crédito por la línea de tesorería."]
];

const comoSerAsociado = `${encabezado({
  titulo: "Cómo ser asociado",
  entrada: "Sé parte del Fondo de Empleados. La afiliación no tiene ningún costo.",
  miga: [["como-ser-asociado.html", "Cómo ser asociado"]]
})}

      <section class="seccion" data-od-id="seccion-pasos">
        <div class="shell split">
          <div>
            ${rotulo("El trámite")}
            <h2 class="titulo-dual">Cuatro pasos y <strong>ya estás dentro</strong></h2>
            <p>En el siguiente enlace se encuentra el formulario descargable para que puedas inscribirte.</p>
            <div class="portada__acciones" style="margin-top:26px">
              <a class="btn" href="assets/docs/formato-afiliacion-fondefos.pdf" download data-od-id="cta-formato">${icono(
                "descarga"
              )}Descargar formato de afiliación</a>
            </div>
            <p style="margin-top:18px;font-size:0.9rem;color:var(--muted)">
              También podés descargar el
              <a href="assets/docs/formulario-conocimiento-personas-naturales.pdf" download>formulario de conocimiento de personas naturales y asociados (v2)</a>.
            </p>
          </div>
          <div>
            <ol class="requisitos" style="counter-reset:req">
${pasos
  .map(
    ([t, d]) => `              <li data-od-id="paso-${idKebab(t)}"><strong style="display:block;font-family:var(--display);color:var(--tinta);margin-bottom:4px">${esc(
      t
    )}</strong>${esc(d)}</li>`
  )
  .join("\n")}
            </ol>
          </div>
        </div>
      </section>

      <section class="seccion seccion--bright" data-od-id="seccion-documentos">
        <div class="shell">
          <div style="max-width:56ch;margin-bottom:30px">
            ${rotulo("Documentos")}
            <h2 class="titulo-dual">Lo que tenés que <strong>llevar</strong></h2>
          </div>
          <div class="rejilla rejilla--3">
            ${[
              ["Desprendible de nómina", "El más reciente."],
              ["Fotocopia de la cédula", "Del asociado que se afilia."],
              ["Certificación laboral", "Aplica para independientes."]
            ]
              .map(
                ([t, d]) => `<div class="tarjeta" data-od-id="documento-${idKebab(t)}">
              <span class="acceso__icono" style="background:var(--surface-low);color:var(--primario)">${icono(
                "documento"
              )}</span>
              <h3 style="margin-top:16px">${esc(t)}</h3>
              <p>${esc(d)}</p>
            </div>`
              )
              .join("\n            ")}
          </div>
        </div>
      </section>

${bandaCierre({
  titulo: "¿Dudas antes de afiliarte?",
  texto: "Respondemos las nueve preguntas que más nos hacen.",
  cta: ["preguntas-frecuentes.html", "Ver preguntas frecuentes"]
})}`;

emitir(
  "como-ser-asociado.html",
  documento({
    archivo: "como-ser-asociado.html",
    titulo: "Cómo ser asociado – Fondefos",
    descripcion:
      "Pasos, documentos y formatos descargables para afiliarte al Fondo de Empleados FONDEFOS.",
    cuerpo: comoSerAsociado
  })
);

/* -------------------------------------------------------------- 4. ahorro -- */

const ahorro = `${encabezado({
  titulo: "Ahorro",
  entrada:
    "Dos formas de ahorro dentro del fondo: la permanente, que es obligatoria y periódica, y la voluntaria.",
  miga: [["ahorro.html", "Ahorro"]]
})}

      <section class="seccion" data-od-id="seccion-ahorro">
        <div class="shell">
          <div class="rejilla rejilla--2">
            <article class="tarjeta" style="padding:clamp(26px,3vw,38px)" data-od-id="ahorro-permanente">
              <span class="etiqueta">Obligatorio</span>
              <h2 style="margin-top:16px">Permanente</h2>
              <p>Los asociados al Fondo de Empleados se comprometen a hacer aportes individuales periódicos y a ahorrar de forma permanente así:</p>
              <ul class="prosa" style="padding-left:20px">
                <li>Por lo menos el cuatro por ciento (4%) de un salario mínimo mensual vigente, sin que ello exceda del diez por ciento (10%) del mismo.</li>
                <li>Esa suma se distribuye en veinte por ciento (20%) para aportes sociales y ochenta por ciento (80%) para ahorros permanentes.</li>
              </ul>
            </article>
            <article class="tarjeta" style="padding:clamp(26px,3vw,38px)" data-od-id="ahorro-voluntario">
              <span class="etiqueta">Opcional</span>
              <h2 style="margin-top:16px">Voluntario</h2>
              <p>Los asociados que así lo deseen podrán realizar aportes voluntarios, los cuales serán reglamentados por la Junta Directiva, al igual que los ahorros permanentes.</p>
            </article>
          </div>

          <div class="franja" style="margin-top:clamp(32px,4vw,52px)" data-od-id="franja-retiro-parcial">
            <span class="acceso__icono" style="flex:0 0 42px">${icono("alcancia")}</span>
            <h3>Podés retirar un porcentaje del ahorro permanente una vez al año</h3>
            <a class="btn btn--fantasma" href="preguntas-frecuentes.html">Ver condiciones</a>
          </div>
        </div>
      </section>

${bandaCierre({
  titulo: "Tu ahorro es también tu cupo de crédito",
  texto: "La línea de libre inversión presta hasta cinco veces el capital ahorrado.",
  cta: ["credito-de-libre-inversion.html", "Ver crédito de libre inversión"]
})}`;

emitir(
  "ahorro.html",
  documento({
    archivo: "ahorro.html",
    titulo: "Ahorro – Fondefos",
    descripcion: "Ahorro permanente y ahorro voluntario en el Fondo de Empleados FONDEFOS.",
    cuerpo: ahorro
  })
);

/* --------------------------------------------------- 5-13. líneas de crédito */

CREDITOS.forEach((c, indice) => {
  const otras = CREDITOS.filter((x) => x.archivo !== c.archivo).slice(0, 3);
  const bloques = c.bloques
    .map(
      (b) => `          <div class="credito__bloque" data-od-id="bloque-${idKebab(b.h)}">
            <h2>${esc(b.h)}</h2>
            ${b.p ? `<p>${esc(b.p)}</p>` : ""}
            ${
              b.lista
                ? `<ul class="prosa">${b.lista.map((l) => `<li>${esc(l)}</li>`).join("")}</ul>`
                : ""
            }
          </div>`
    )
    .join("\n");

  const cuerpo = `${encabezado({
    titulo: c.titulo,
    entrada: c.entrada,
    miga: [["ahorro.html", "Servicios"], [c.archivo, c.titulo]]
  })}

      <section class="seccion" data-od-id="seccion-credito">
        <div class="shell credito">
          <aside class="credito__resumen" data-od-id="resumen-credito">
            <h2>Condiciones vigentes</h2>
            <dl style="margin:0">
${c.resumen
  .map(
    ([k, v]) => `              <div class="credito__dato"><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`
  )
  .join("\n")}
            </dl>
            <a class="btn" style="width:100%;margin-top:24px" href="contactenos.html" data-od-id="cta-solicitar">Solicitar este crédito</a>
            <p style="margin-top:14px;font-size:0.82rem;color:#9fb2ca">Los valores corresponden al reglamento de crédito vigente publicado por FONDEFOS.</p>
          </aside>

          <div>
${bloques}

            <div class="credito__bloque" data-od-id="bloque-requisitos">
              <h2>Requisitos</h2>
              <ol class="requisitos">
${c.requisitos.map((r) => `                <li>${esc(r)}</li>`).join("\n")}
              </ol>
            </div>
          </div>
        </div>
      </section>

      <section class="seccion seccion--bright" data-od-id="seccion-otras-lineas">
        <div class="shell">
          <div style="max-width:52ch;margin-bottom:28px">
            ${rotulo("Otras líneas")}
            <h2 class="titulo-dual">Compará antes de <strong>decidir</strong></h2>
          </div>
          <div class="rejilla rejilla--3">
${otras
  .map(
    (o) => `            <a class="tarjeta" href="${o.archivo}" data-od-id="otra-${o.archivo.replace(".html", "")}">
              <h3>${esc(o.titulo)}</h3>
              <p>${esc(o.entrada)}</p>
              <div class="tarjeta__pie"><span class="etiqueta">${esc(o.resumen[0][1])}</span></div>
            </a>`
  )
  .join("\n")}
          </div>
        </div>
      </section>`;

  emitir(
    c.archivo,
    documento({
      archivo: c.archivo,
      titulo: `${c.titulo} – Fondefos`,
      descripcion: c.entrada,
      cuerpo
    })
  );
  void indice;
});

/* ----------------------------------------------------------- 14. convenios -- */

const filtros = [["todos", "Todos"], ...CATEGORIAS_USADAS.map((k) => [k, CATEGORIAS[k]])]
  .map(
    ([k, t], i) =>
      `            <button type="button" class="filtro" data-categoria="${k}" aria-pressed="${
        i === 0
      }">${esc(t)}</button>`
  )
  .join("\n");

const tarjetasConvenio = CONVENIOS.map(
  (c) => `            <button type="button" class="convenio" data-convenio="${c.id}" data-categorias="${
    c.categoria
  }" data-od-id="convenio-${c.id}">
              <span class="convenio__marca">
                ${
                  c.logo
                    ? `<img src="${c.logo}" loading="lazy" alt="Logotipo de ${esc(c.nombre)}" />`
                    : `<span class="convenio__inicial" aria-hidden="true">${esc(c.nombre.charAt(0))}</span>`
                }
              </span>
              <span class="convenio__cuerpo">
                <span class="etiqueta">${esc(c.categoriaNombre)}</span>
                <h3>${esc(c.nombre)}</h3>
                <span class="convenio__ver">Ver datos del asesor →</span>
              </span>
            </button>`
).join("\n");

const cajon = `    <div class="cajon" data-od-id="cajon-convenio" data-abierto="no" role="dialog" aria-modal="true" aria-labelledby="cajon-titulo">
      <button type="button" class="cajon__velo" data-cerrar-cajon aria-label="Cerrar el detalle del convenio"></button>
      <div class="cajon__panel">
        <button type="button" class="cajon__cerrar" data-cerrar-cajon aria-label="Cerrar el detalle del convenio">✕</button>
        <span class="etiqueta" data-od-id="cajon-categoria"></span>
        <h2 id="cajon-titulo" data-od-id="cajon-titulo" style="margin-top:12px"></h2>
        <div class="cajon__marca" data-od-id="cajon-marca"></div>
        <dl class="ficha" data-od-id="cajon-ficha"></dl>
        <a class="btn btn--secundario" style="width:100%;margin-top:26px" href="contactenos.html">¿Tu empresa quiere ser convenio?</a>
      </div>
    </div>
    <script src="assets/data/convenios.js"></script>`;

const convenios = `${encabezado({
  titulo: "Convenios",
  entrada: `Descuentos y condiciones preferenciales con ${CONVENIOS.length} aliados comerciales de Santander. Elegí una categoría y consultá los datos del asesor.`,
  miga: [["convenios.html", "Convenios"]],
  aparte: `<div class="cifras">
            <div class="cifra"><strong style="color:var(--tinta)">${CONVENIOS.length}</strong><span style="color:var(--muted)">Aliados publicados</span></div>
            <div class="cifra" style="border-color:var(--interactivo)"><strong style="color:var(--tinta)">${CATEGORIAS_USADAS.length}</strong><span style="color:var(--muted)">Categorías</span></div>
          </div>`
})}

      <section class="seccion" data-od-id="seccion-convenios">
        <div class="shell">
          <div class="filtros" data-od-id="filtros-convenios" role="group" aria-label="Filtrar convenios por categoría">
${filtros}
          </div>
          <p style="margin-bottom:24px;color:var(--muted);font-size:0.92rem" data-od-id="convenios-conteo" aria-live="polite"></p>
          <div class="rejilla rejilla--4" data-od-id="rejilla-convenios">
${tarjetasConvenio}
          </div>
          <p class="vacio" data-od-id="convenios-vacio" hidden>No hay convenios publicados en esta categoría.</p>
        </div>
      </section>

${bandaCierre({
  titulo: "Si estás interesado en realizar convenio con nosotros",
  texto: 'Escribinos desde el formulario de contacto con el asunto "Convenios".',
  cta: ["contactenos.html", "Proponer un convenio"]
})}`;

emitir(
  "convenios.html",
  documento({
    archivo: "convenios.html",
    titulo: "Convenios – Fondefos",
    descripcion: `${CONVENIOS.length} convenios comerciales para los asociados de FONDEFOS, con datos de contacto de cada asesor.`,
    cuerpo: convenios,
    extras: cajon
  })
);

mkdirSync(new URL("./assets/data/", raiz), { recursive: true });
writeFileSync(
  new URL("./assets/data/convenios.js", raiz),
  `/* Datos de convenios extraídos de fondefos.com.co — generado por build/generate.mjs */\nwindow.CONVENIOS = ${JSON.stringify(
    CONVENIOS,
    null,
    1
  )};\n`
);

/* ---------------------------------------------------------- 15. beneficios -- */

const beneficios = `${encabezado({
  titulo: "Beneficios",
  entrada: "Pertenecer a un fondo de empleados como FONDEFOS te puede brindar beneficios como:",
  miga: [["beneficios.html", "Beneficios"]],
  aparte: `<img src="assets/images/content/icono-beneficios.jpg" width="1024" height="1024"
            style="width:min(180px,42vw);margin-left:auto;border-radius:var(--r-md)" loading="lazy"
            alt="Icono de regalo usado por Fondefos para identificar la sección de beneficios." />`
})}

      <section class="seccion" data-od-id="seccion-beneficios">
        <div class="shell">
          <div class="rejilla rejilla--2">
${BENEFICIOS.map(
  ([t, d], i) => `            <article class="tarjeta" data-od-id="beneficio-${idKebab(t)}">
              <span class="etiqueta">0${i + 1}</span>
              <h3 style="margin-top:14px">${esc(t)}</h3>
              <p>${esc(d)}</p>
            </article>`
).join("\n")}
          </div>
        </div>
      </section>

${bandaCierre({
  titulo: "Los beneficios empiezan con el primer aporte",
  texto: "Desde el primer mes de ahorro ya podés tramitar un crédito de tesorería.",
  cta: ["ahorro.html", "Ver cómo funciona el ahorro"]
})}`;

emitir(
  "beneficios.html",
  documento({
    archivo: "beneficios.html",
    titulo: "Beneficios – Fondefos",
    descripcion: "Los beneficios de pertenecer al Fondo de Empleados FONDEFOS.",
    cuerpo: beneficios
  })
);

/* ------------------------------------------------------ 16. estado de cuenta */

const pasosExtracto = [
  `Ingresá a la página web: <a href="${SITIO.extracto}" target="_blank" rel="noopener">fondefos.misaldoweb.co</a>`,
  "Digitá tu usuario: número de cédula.",
  "Digitá la contraseña: los últimos 4 números de la cédula.",
  "Cambiá la contraseña y hacé clic en la opción «Aplicar».",
  "Listo, ya podés acceder a la información de tu cuenta."
];

const estadoCuenta = `${encabezado({
  titulo: "Estado de cuenta",
  entrada: "Consultá tu extracto en línea. Si es la primera vez que vas a ingresar, seguí estos pasos.",
  miga: [["estado-de-cuenta.html", "Estado de cuenta"]]
})}

      <section class="seccion" data-od-id="seccion-extracto">
        <div class="shell split">
          <div>
            ${rotulo("Primer ingreso")}
            <h2 class="titulo-dual">Consultá tu extracto <strong>¡aquí!</strong></h2>
            <ol class="requisitos" style="margin-top:24px">
${pasosExtracto.map((p) => `              <li>${p}</li>`).join("\n")}
            </ol>
          </div>
          <div class="tarjeta" style="padding:clamp(26px,3vw,38px);background:var(--tinta);border-color:var(--tinta)">
            <span class="acceso__icono">${icono("usuario")}</span>
            <h3 style="color:#fff;margin-top:18px">Portal del asociado</h3>
            <p style="color:#cfd8e6">Saldos, aportes y estado de tus créditos, actualizados por el fondo.</p>
            <a class="btn btn--claro" style="margin-top:22px" href="${SITIO.extracto}" target="_blank" rel="noopener" data-od-id="cta-extracto">Ir a mi extracto</a>
            <div class="dato-contacto" style="margin-top:28px;border-color:rgba(255,255,255,0.15)">
              <span class="dato-contacto__icono" style="background:rgba(255,255,255,0.1);color:#6fd9ef">${icono(
                "correo"
              )}</span>
              <div>
                <h4 style="color:#fff">¿Olvidaste tu contraseña?</h4>
                <p style="color:#cfd8e6">Escribí a <a href="mailto:${SITIO.correoExtracto}" style="color:#6fd9ef">${esc(
  SITIO.correoExtracto
)}</a></p>
              </div>
            </div>
          </div>
        </div>
      </section>`;

emitir(
  "estado-de-cuenta.html",
  documento({
    archivo: "estado-de-cuenta.html",
    titulo: "Estado de cuenta – Fondefos",
    descripcion: "Cómo consultar tu extracto de asociado en el portal en línea de FONDEFOS.",
    cuerpo: estadoCuenta
  })
);

/* --------------------------------------------------- 17. preguntas frecuentes */

const faq = `${encabezado({
  titulo: "Preguntas frecuentes",
  entrada: "Las nueve consultas que más nos hacen sobre afiliación, ahorro y créditos.",
  miga: [["preguntas-frecuentes.html", "Preguntas frecuentes"]]
})}

      <section class="seccion" data-od-id="seccion-faq">
        <div class="shell" style="max-width:min(100% - (var(--gutter) * 2), 900px)">
${acordeon(PREGUNTAS, "faq")}
        </div>
      </section>

${bandaCierre({
  titulo: "Para consultar tu extracto",
  texto: "El portal del asociado está disponible las 24 horas.",
  cta: ["estado-de-cuenta.html", "Ver instrucciones"]
})}`;

emitir(
  "preguntas-frecuentes.html",
  documento({
    archivo: "preguntas-frecuentes.html",
    titulo: "Preguntas frecuentes – Fondefos",
    descripcion: "Respuestas sobre afiliación, retiro, ahorro y solicitud de créditos en FONDEFOS.",
    cuerpo: faq
  })
);

/* ---------------------------------------------------------- 18. contáctenos */

const asuntos = ["Afiliación", "Créditos", "Ahorro", "Convenios", "Estado de cuenta", "Otro"];

const contacto = `${encabezado({
  titulo: "Contáctenos",
  entrada: "Atendemos de forma presencial en Floridablanca y respondemos por teléfono y correo.",
  miga: [["contactenos.html", "Contáctenos"]]
})}

      <section class="seccion" data-od-id="seccion-contacto">
        <div class="shell contacto">
          <div>
            ${rotulo("Datos de atención")}
            <h2 class="titulo-dual">Hablemos <strong>directo</strong></h2>
            <div style="margin-top:26px">
              <div class="dato-contacto">
                <span class="dato-contacto__icono">${icono("telefono")}</span>
                <div>
                  <h4>Celulares</h4>
                  <p><a href="tel:+573044962328">304 4962328</a> · <a href="tel:+573022619797">302 2619797</a> · <a href="tel:+573174357685">317 4357685</a></p>
                </div>
              </div>
              <div class="dato-contacto">
                <span class="dato-contacto__icono">${icono("telefono")}</span>
                <div><h4>Fijo</h4><p>${esc(SITIO.fijo)}</p></div>
              </div>
              <div class="dato-contacto">
                <span class="dato-contacto__icono">${icono("correo")}</span>
                <div><h4>Correo</h4><p><a href="mailto:${SITIO.correo}">${esc(SITIO.correo)}</a></p></div>
              </div>
              <div class="dato-contacto">
                <span class="dato-contacto__icono">${icono("reloj")}</span>
                <div><h4>Horario de atención</h4><p>${esc(SITIO.horario)}</p></div>
              </div>
              <div class="dato-contacto">
                <span class="dato-contacto__icono">${icono("lugar")}</span>
                <div><h4>Sede</h4><p>${esc(SITIO.direccion)}</p></div>
              </div>
            </div>
          </div>

          <form class="formulario" data-formulario data-od-id="formulario-contacto">
            <div class="aviso-envio" data-visible="no" tabindex="-1" role="status">
              ${icono("check")}
              <span>Listo. Este formulario es una demostración del prototipo: no envía datos a ningún servidor. Escribinos a <a href="mailto:${
                SITIO.correo
              }">${esc(SITIO.correo)}</a> para una respuesta real.</span>
            </div>
            <h2 style="font-size:1.3rem">Escribinos</h2>
            <div class="campo" data-error="no">
              <label for="c-nombre">Nombre completo *</label>
              <input id="c-nombre" name="nombre" type="text" required autocomplete="name" placeholder="María Gómez" />
              <span class="campo__error">Ingresá tu nombre completo.</span>
            </div>
            <div class="campo" data-error="no">
              <label for="c-correo">Correo electrónico *</label>
              <input id="c-correo" name="correo" type="email" required autocomplete="email" placeholder="nombre@correo.com" />
              <span class="campo__error">Ingresá un correo electrónico válido.</span>
            </div>
            <div class="campo" data-error="no">
              <label for="c-telefono">Teléfono</label>
              <input id="c-telefono" name="telefono" type="tel" autocomplete="tel" placeholder="300 000 0000" />
            </div>
            <div class="campo" data-error="no">
              <label for="c-asunto">Asunto *</label>
              <select id="c-asunto" name="asunto" required>
                <option value="">Elegí un asunto</option>
${asuntos.map((a) => `                <option value="${esc(a)}">${esc(a)}</option>`).join("\n")}
              </select>
              <span class="campo__error">Seleccioná un asunto.</span>
            </div>
            <div class="campo" data-error="no">
              <label for="c-mensaje">Mensaje *</label>
              <textarea id="c-mensaje" name="mensaje" required placeholder="Contanos en qué te podemos ayudar."></textarea>
              <span class="campo__error">Escribí tu mensaje.</span>
            </div>
            <button type="submit" class="btn" style="width:100%">Enviar mensaje</button>
            <p style="margin-top:14px;font-size:0.82rem;color:var(--muted)">FONDEFOS cumple con la Ley 1581 de 2012 y el Decreto 1377 de 2013 sobre protección de datos personales.</p>
          </form>
        </div>
      </section>`;

emitir(
  "contactenos.html",
  documento({
    archivo: "contactenos.html",
    titulo: "Contáctenos – Fondefos",
    descripcion:
      "Teléfonos, correo, horario y sede de FONDEFOS en Floridablanca, Santander, y formulario de contacto.",
    cuerpo: contacto
  })
);

console.log(`Generadas ${emitidos.length} páginas:`);
emitidos.forEach((a) => console.log("  ·", a));
void SERVICIOS;
