// Normaliza los 28 convenios extraídos de fondefos.com.co/convenios y sus
// páginas de detalle. Todos los datos (asesor, teléfono, correo, dirección)
// provienen del sitio original — no hay registros inventados.
import { readFileSync, existsSync } from "node:fs";

const crudo = JSON.parse(
  readFileSync(new URL("../RECON/content/convenios.json", import.meta.url))
);

export const CATEGORIAS = {
  "agencia-de-viajes": "Agencia de viajes",
  "asistencia-medica": "Asistencia médica",
  automovilismo: "Automovilismo",
  calzado: "Calzado y ropa",
  capacitacion: "Capacitación",
  cosmeticos: "Cosméticos y belleza",
  detalles: "Detalles",
  educacion: "Educación",
  electrodomesticos: "Electrodomésticos",
  "lenceria-y-hogar": "Lencería y hogar",
  prepagada: "Medicina prepagada",
  seguros: "Seguros",
  servicios: "Servicios fúnebres",
  tecnologia: "Tecnología",
  "sin-categoria": "Otros convenios"
};

export const slug = (s) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

// La extracción arrastra el menú del sitio delante del contenido real;
// el texto útil empieza después del último "Nosotros Contáctenos".
const limpiarNav = (texto) => {
  const marca = "Nosotros Contáctenos ";
  const i = texto.lastIndexOf(marca);
  return (i === -1 ? texto : texto.slice(i + marca.length)).trim();
};

const campo = (texto, etiquetas) => {
  const cortes = "Asesor|Correo|correo|Tel[eé]fonos?|Direcci[oó]n|SEDES";
  for (const et of etiquetas) {
    const re = new RegExp(`${et}\\s*:\\s*([\\s\\S]*?)(?=\\s(?:${cortes})\\s*:|$)`);
    const m = re.exec(texto);
    if (m && m[1].trim()) return m[1].trim().replace(/[.\s]+$/, "");
  }
  return "";
};

// El sitio original mezcla mayúsculas sostenidas y minúsculas en los nombres
// propios. Se normaliza sólo eso: nombres de marca y de asesor. Direcciones y
// teléfonos quedan textualmente como los publica el fondo.
const MENUDAS = new Set(["de", "del", "la", "las", "los", "y", "e", "en"]);
const capitalizar = (texto) =>
  texto
    .toLowerCase()
    .split(/(\s+)/)
    .map((parte, i) =>
      /^\s+$/.test(parte) || (MENUDAS.has(parte) && i > 0)
        ? parte
        : parte.charAt(0).toUpperCase() + parte.slice(1)
    )
    .join("");

const NOMBRES = {
  "MT TECNOLOGIA": "MT Tecnología",
  "AXA- COLPATRIA POLIZA SALUD MEDICA PREPAGADA": "AXA Colpatria · Salud prepagada"
};

export const CONVENIOS = crudo.map((c) => {
  const id = slug(c.title);
  const texto = limpiarNav(c.body.join(" "));
  const cat = c.cats.find((x) => CATEGORIAS[x]) || "sin-categoria";

  let logo = null;
  if (c.img) {
    const ext = (c.img.match(/\.(webp|png|jpe?g|gif)/i) || [".png"])[0];
    const ruta = `assets/images/convenios/${id}${ext}`;
    if (existsSync(new URL(`../${ruta}`, import.meta.url))) logo = ruta;
  }

  return {
    id,
    nombre: NOMBRES[c.title] || c.title,
    categoria: cat,
    categoriaNombre: CATEGORIAS[cat],
    asesor: capitalizar(campo(texto, ["Asesor"])),
    correo: campo(texto, ["Correo", "correo"]),
    telefono: campo(texto, ["Tel[eé]fonos?"]),
    direccion: campo(texto, ["Direcci[oó]n"]),
    logo
  };
});

// Sólo las categorías con al menos un convenio, en orden alfabético.
export const CATEGORIAS_USADAS = Object.keys(CATEGORIAS)
  .filter((k) => CONVENIOS.some((c) => c.categoria === k))
  .sort((a, b) => CATEGORIAS[a].localeCompare(CATEGORIAS[b], "es"));
