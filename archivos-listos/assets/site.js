/* Fondefos — comportamiento del sitio.
   Sin dependencias externas: navegación, carrusel, acordeones,
   filtro de convenios con cajón de detalle, visor de Notifondo y
   validación de formularios. */
(function () {
  "use strict";

  var $ = function (sel, ctx) {
    return (ctx || document).querySelector(sel);
  };
  var $$ = function (sel, ctx) {
    return Array.prototype.slice.call((ctx || document).querySelectorAll(sel));
  };

  /* Mantiene el foco dentro de un modal abierto (visor, cajón) al tabular. */
  var trampaFoco = function (contenedor) {
    return function (e) {
      if (e.key !== "Tab") return;
      var focos = $$(
        "a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])",
        contenedor
      ).filter(function (el) {
        return el.getClientRects().length > 0 && !el.hasAttribute("hidden");
      });
      if (!focos.length) return;
      var primero = focos[0];
      var ultimo = focos[focos.length - 1];
      if (e.shiftKey && document.activeElement === primero) {
        e.preventDefault();
        ultimo.focus();
      } else if (!e.shiftKey && document.activeElement === ultimo) {
        e.preventDefault();
        primero.focus();
      }
    };
  };

  /* ---------------- Cabecera: sombra al desplazar + menú móvil ------------- */
  var cabecera = $("[data-od-id='cabecera']");
  if (cabecera) {
    var marcarFijo = function () {
      cabecera.setAttribute("data-fijo", window.scrollY > 8 ? "si" : "no");
    };
    marcarFijo();
    window.addEventListener("scroll", marcarFijo, { passive: true });

    var botonMenu = $(".hamburguesa", cabecera);
    if (botonMenu) {
      botonMenu.addEventListener("click", function () {
        var abierto = cabecera.getAttribute("data-menu") === "abierto";
        cabecera.setAttribute("data-menu", abierto ? "cerrado" : "abierto");
        botonMenu.setAttribute("aria-expanded", String(!abierto));
      });
    }
  }

  /* Submenú de Servicios: click en escritorio y móvil, cierra con Escape */
  $$(".nav__grupo").forEach(function (grupo) {
    var disparador = $(".nav__disparador", grupo);
    if (!disparador) return;
    disparador.addEventListener("click", function (e) {
      e.preventDefault();
      var abierto = grupo.getAttribute("data-abierto") === "si";
      $$(".nav__grupo").forEach(function (otro) {
        otro.setAttribute("data-abierto", "no");
        var d = $(".nav__disparador", otro);
        if (d) d.setAttribute("aria-expanded", "false");
      });
      grupo.setAttribute("data-abierto", abierto ? "no" : "si");
      disparador.setAttribute("aria-expanded", String(!abierto));
    });
  });

  document.addEventListener("click", function (e) {
    if (!e.target.closest(".nav__grupo")) {
      $$(".nav__grupo").forEach(function (g) {
        g.setAttribute("data-abierto", "no");
        var d = $(".nav__disparador", g);
        if (d) d.setAttribute("aria-expanded", "false");
      });
    }
  });

  /* ---------------- Acordeones (preguntas, requisitos, listas) ------------- */
  $$("[data-acordeon] .fila__boton").forEach(function (boton) {
    boton.addEventListener("click", function () {
      var fila = boton.closest(".fila");
      var abierta = fila.getAttribute("data-abierta") === "si";
      fila.setAttribute("data-abierta", abierta ? "no" : "si");
      boton.setAttribute("aria-expanded", String(!abierta));
    });
  });

  /* ---------------- Carrusel de portada ------------------------------------ */
  $$("[data-carrusel]").forEach(function (carrusel) {
    var laminas = $$(".carrusel__lamina", carrusel);
    var puntos = $$(".carrusel__punto", carrusel);
    if (laminas.length < 2) return;
    var indice = 0;
    var temporizador = null;

    var mostrar = function (i) {
      indice = (i + laminas.length) % laminas.length;
      laminas.forEach(function (l, k) {
        l.setAttribute("data-activa", k === indice ? "si" : "no");
        l.setAttribute("aria-hidden", k === indice ? "false" : "true");
      });
      puntos.forEach(function (p, k) {
        if (k === indice) {
          p.setAttribute("aria-current", "true");
        } else {
          p.removeAttribute("aria-current");
        }
      });
    };

    var reducido = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var arrancar = function () {
      if (reducido) return;
      detener();
      temporizador = window.setInterval(function () {
        mostrar(indice + 1);
      }, 6000);
    };
    var detener = function () {
      if (temporizador) window.clearInterval(temporizador);
      temporizador = null;
    };

    var prev = $(".carrusel__nav--prev", carrusel);
    var sig = $(".carrusel__nav--sig", carrusel);
    if (prev)
      prev.addEventListener("click", function () {
        mostrar(indice - 1);
        arrancar();
      });
    if (sig)
      sig.addEventListener("click", function () {
        mostrar(indice + 1);
        arrancar();
      });
    puntos.forEach(function (p, k) {
      p.addEventListener("click", function () {
        mostrar(k);
        arrancar();
      });
    });

    carrusel.addEventListener("mouseenter", detener);
    carrusel.addEventListener("mouseleave", arrancar);
    carrusel.addEventListener("focusin", detener);
    carrusel.addEventListener("focusout", arrancar);

    mostrar(0);
    arrancar();
  });

  /* ---------------- Convenios: filtro + cajón de detalle ------------------- */
  var rejillaConvenios = $("[data-od-id='rejilla-convenios']");
  if (rejillaConvenios && window.CONVENIOS) {
    var datos = window.CONVENIOS;
    var vacio = $("[data-od-id='convenios-vacio']");
    var conteo = $("[data-od-id='convenios-conteo']");
    var cajon = $("[data-od-id='cajon-convenio']");
    var ultimoDisparador = null;

    var pintarConteo = function (n) {
      if (conteo)
        conteo.textContent = n === 1 ? "1 convenio" : n + " convenios";
    };

    var aplicarFiltro = function (cat) {
      var visibles = 0;
      $$(".convenio", rejillaConvenios).forEach(function (tarjeta) {
        var cats = (tarjeta.getAttribute("data-categorias") || "").split(" ");
        var mostrar = cat === "todos" || cats.indexOf(cat) !== -1;
        tarjeta.hidden = !mostrar;
        if (mostrar) visibles++;
      });
      if (vacio) vacio.hidden = visibles !== 0;
      pintarConteo(visibles);
    };

    $$("[data-od-id='filtros-convenios'] .filtro").forEach(function (boton) {
      boton.addEventListener("click", function () {
        $$("[data-od-id='filtros-convenios'] .filtro").forEach(function (b) {
          b.setAttribute("aria-pressed", "false");
        });
        boton.setAttribute("aria-pressed", "true");
        aplicarFiltro(boton.getAttribute("data-categoria"));
      });
    });
    pintarConteo($$(".convenio", rejillaConvenios).length);

    var cerrarCajon = function () {
      if (!cajon) return;
      cajon.setAttribute("data-abierto", "no");
      document.body.style.overflow = "";
      if (history.replaceState) history.replaceState(null, "", location.pathname);
      if (ultimoDisparador) ultimoDisparador.focus();
    };

    var abrirCajon = function (id, disparador) {
      var item = datos.filter(function (c) {
        return c.id === id;
      })[0];
      if (!item || !cajon) return;
      ultimoDisparador = disparador || null;

      $("[data-od-id='cajon-titulo']", cajon).textContent = item.nombre;
      $("[data-od-id='cajon-categoria']", cajon).textContent = item.categoriaNombre;

      var marca = $("[data-od-id='cajon-marca']", cajon);
      marca.innerHTML = "";
      if (item.logo) {
        var img = document.createElement("img");
        img.src = item.logo;
        img.alt = "Logotipo de " + item.nombre;
        img.loading = "lazy";
        marca.appendChild(img);
      } else {
        var inicial = document.createElement("span");
        inicial.className = "convenio__inicial";
        inicial.setAttribute("aria-hidden", "true");
        inicial.textContent = item.nombre.charAt(0);
        marca.appendChild(inicial);
        var nota = document.createElement("p");
        nota.style.margin = "12px 0 0";
        nota.style.fontSize = "0.85rem";
        nota.style.color = "#667487";
        nota.textContent = "Este convenio no publica logotipo en el sitio original.";
        marca.appendChild(nota);
      }

      var ficha = $("[data-od-id='cajon-ficha']", cajon);
      ficha.innerHTML = "";
      var campos = [
        ["Asesor comercial", item.asesor, null],
        ["Teléfono", item.telefono, item.telefono ? "tel:" + item.telefono.replace(/[^0-9+]/g, "") : null],
        ["Correo", item.correo, item.correo ? "mailto:" + item.correo.split(/[\s/]+/)[0] : null],
        ["Dirección", item.direccion, null]
      ];
      campos.forEach(function (campo) {
        if (!campo[1]) return;
        var wrap = document.createElement("div");
        wrap.className = "ficha__campo";
        var dt = document.createElement("dt");
        dt.textContent = campo[0];
        var dd = document.createElement("dd");
        if (campo[2]) {
          var a = document.createElement("a");
          a.href = campo[2];
          a.textContent = campo[1];
          dd.appendChild(a);
        } else {
          dd.textContent = campo[1];
        }
        wrap.appendChild(dt);
        wrap.appendChild(dd);
        ficha.appendChild(wrap);
      });

      cajon.setAttribute("data-abierto", "si");
      document.body.style.overflow = "hidden";
      if (history.replaceState) history.replaceState(null, "", "#" + item.id);
      var cerrar = $(".cajon__cerrar", cajon);
      if (cerrar) cerrar.focus();
    };

    rejillaConvenios.addEventListener("click", function (e) {
      var tarjeta = e.target.closest(".convenio");
      if (!tarjeta) return;
      abrirCajon(tarjeta.getAttribute("data-convenio"), tarjeta);
    });

    if (cajon) {
      $$("[data-cerrar-cajon]", cajon).forEach(function (b) {
        b.addEventListener("click", cerrarCajon);
      });
      var trampaCajon = trampaFoco(cajon);
      document.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && cajon.getAttribute("data-abierto") === "si") cerrarCajon();
        if (cajon.getAttribute("data-abierto") === "si") trampaCajon(e);
      });
    }

    if (location.hash.length > 1) abrirCajon(location.hash.slice(1), null);
  }

  /* ---------------- Visor de Notifondo ------------------------------------- */
  var visor = $("[data-od-id='visor']");
  if (visor) {
    var visorImg = $("img", visor);
    var visorOrigen = null;
    var cerrarVisor = function () {
      visor.setAttribute("data-abierto", "no");
      document.body.style.overflow = "";
      if (visorOrigen) visorOrigen.focus();
    };
    $$("[data-visor-src]").forEach(function (boton) {
      boton.addEventListener("click", function () {
        visorOrigen = boton;
        visorImg.src = boton.getAttribute("data-visor-src");
        visorImg.alt = boton.getAttribute("data-visor-alt") || "";
        visor.setAttribute("data-abierto", "si");
        document.body.style.overflow = "hidden";
        $(".visor__cerrar", visor).focus();
      });
    });
    $$("[data-cerrar-visor]", visor).forEach(function (b) {
      b.addEventListener("click", cerrarVisor);
    });
    visor.addEventListener("click", function (e) {
      if (e.target === visor) cerrarVisor();
    });
    var trampaVisor = trampaFoco(visor);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && visor.getAttribute("data-abierto") === "si") cerrarVisor();
      if (visor.getAttribute("data-abierto") === "si") trampaVisor(e);
    });
  }

  /* ---------------- Formularios: validación en cliente --------------------- */
  $$("[data-formulario]").forEach(function (form) {
    var aviso = $(".aviso-envio", form);
    form.setAttribute("novalidate", "novalidate");

    var validarCampo = function (control) {
      var campo = control.closest(".campo");
      if (!campo) return true;
      var ok = control.checkValidity() && String(control.value).trim() !== "";
      campo.setAttribute("data-error", ok ? "no" : "si");
      return ok;
    };

    $$("input, select, textarea", form).forEach(function (control) {
      control.addEventListener("blur", function () {
        if (control.required) validarCampo(control);
      });
      control.addEventListener("input", function () {
        var campo = control.closest(".campo");
        if (campo && campo.getAttribute("data-error") === "si") validarCampo(control);
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var primerError = null;
      $$("[required]", form).forEach(function (control) {
        if (!validarCampo(control) && !primerError) primerError = control;
      });
      if (primerError) {
        if (aviso) aviso.setAttribute("data-visible", "no");
        primerError.focus();
        return;
      }
      form.reset();
      $$(".campo", form).forEach(function (c) {
        c.setAttribute("data-error", "no");
      });
      if (aviso) {
        aviso.setAttribute("data-visible", "si");
        aviso.focus();
      }
    });
  });
})();
