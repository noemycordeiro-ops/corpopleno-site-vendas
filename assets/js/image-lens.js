/*
  Fase CorpoPleno Livros 018 (2026-10-16) — "lupa mágica" de tradução nas
  capas. Ao passar o mouse (ou tocar e arrastar no celular) sobre uma área
  de texto marcada em assets/data/image-hotspots/<book_id>.json, aparece
  uma lupa circular que AMPLIA a capa; fora do pt-BR, mostra também o
  texto traduzido no idioma escolhido no seletor do site.

  - Funciona em qualquer <img> de capa original
    (assets/img/livros/<id>/cover-pt-BR.png): cards de Produtos, página do
    livro e composições de combos (inclusive capas giradas por CSS).
  - Nunca altera a imagem, nunca usa innerHTML, nunca chama
    preventDefault: cliques e rolagem continuam iguais.
  - Acessível: cada capa ganha uma legenda oculta (sr-only) com o texto
    da capa no idioma atual, atualizada ao trocar de idioma.
*/
(function () {
  "use strict";

  var SRC_RE = /assets\/img\/livros\/([a-z0-9-]+)\/cover-pt-BR\.png/;
  var LENS_SIZE = 170;
  var ZOOM = 2.2;
  var cache = {};
  var lens = null;
  var lensImg = null;
  var lensText = null;
  var hideTimer = null;
  var tocando = false;

  function lang() {
    return window.CP_I18N && typeof window.CP_I18N.currentLang === "function"
      ? window.CP_I18N.currentLang()
      : "pt-BR";
  }

  function loadData(bookId) {
    if (!cache[bookId]) {
      cache[bookId] = fetch("assets/data/image-hotspots/" + encodeURIComponent(bookId) + ".json")
        .then(function (r) { return r.ok ? r.json() : null; })
        .catch(function () { return null; });
    }
    return cache[bookId];
  }

  function ensureLens() {
    if (lens) return;
    lens = document.createElement("div");
    lens.className = "cp-lens";
    lens.setAttribute("aria-hidden", "true"); // conteúdo acessível vai na legenda oculta
    lensImg = document.createElement("div");
    lensImg.className = "cp-lens__img";
    lensText = document.createElement("div");
    lensText.className = "cp-lens__text";
    lens.appendChild(lensImg);
    lens.appendChild(lensText);
    document.body.appendChild(lens);
  }

  function textFor(area, l) {
    var tr = area.traducoes && (area.traducoes[l] || area.traducoes["pt-BR"]);
    return tr ? tr.texto : area.original;
  }

  // Ponto da tela -> coordenadas locais da imagem (0..1), considerando
  // rotações/escala aplicadas por CSS (capas sobrepostas dos combos).
  function localPoint(img, clientX, clientY) {
    var rect = img.getBoundingClientRect();
    var w = img.offsetWidth, h = img.offsetHeight;
    if (!w || !h) return null;
    var cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
    var tf = window.getComputedStyle(img).transform;
    var px = clientX - cx, py = clientY - cy;
    if (tf && tf !== "none" && window.DOMMatrix) {
      var p = new DOMMatrix(tf).inverse().transformPoint(new DOMPoint(px, py));
      px = p.x; py = p.y;
    }
    return { x: (px + w / 2) / w, y: (py + h / 2) / h };
  }

  function areaAt(data, pt) {
    if (!data || !pt) return null;
    var X = pt.x * 100, Y = pt.y * 100;
    for (var i = 0; i < data.areas.length; i++) {
      var a = data.areas[i];
      if (X >= a.x && X <= a.x + a.w && Y >= a.y && Y <= a.y + a.h) return a;
    }
    return null;
  }

  function show(img, data, clientX, clientY) {
    var pt = localPoint(img, clientX, clientY);
    var area = areaAt(data, pt);
    img.style.cursor = area ? "zoom-in" : "";
    if (!area) { hide(); return; }
    ensureLens();
    window.clearTimeout(hideTimer);
    // Imagem ampliada (o "vidro" da lupa), sempre a capa original.
    var bw = img.offsetWidth * ZOOM, bh = img.offsetHeight * ZOOM;
    lensImg.style.backgroundImage = 'url("' + img.currentSrc.replace(/"/g, "") + '")';
    lensImg.style.backgroundSize = bw + "px " + bh + "px";
    lensImg.style.backgroundPosition = (LENS_SIZE / 2 - pt.x * bw) + "px " + (LENS_SIZE / 2 - pt.y * bh) + "px";
    var l = lang();
    if (l === "pt-BR") {
      lensText.textContent = "";
      lensText.hidden = true;
    } else {
      lensText.textContent = textFor(area, l);
      lensText.lang = l;
      lensText.hidden = false;
    }
    var left = Math.min(window.innerWidth - LENS_SIZE - 4, Math.max(4, clientX - LENS_SIZE / 2));
    var top = clientY - LENS_SIZE - 18;
    if (top < 4) top = clientY + 18;
    lens.style.transform = "translate(" + left + "px," + top + "px)";
    lens.classList.add("is-visible");
  }

  function hide(delay) {
    if (!lens) return;
    window.clearTimeout(hideTimer);
    hideTimer = window.setTimeout(function () { lens.classList.remove("is-visible"); }, delay || 0);
  }

  function updateCaption(img, data) {
    var cap = img._cpLensCaption;
    if (!cap) {
      cap = document.createElement("span");
      cap.className = "sr-only cp-lens-caption";
      img._cpLensCaption = cap;
      if (img.parentNode) img.parentNode.insertBefore(cap, img.nextSibling);
    }
    var l = lang();
    var partes = data.areas.map(function (a) { return textFor(a, l); });
    cap.lang = l;
    var prefixo = { "pt-BR": "Texto da capa: ", "pt-PT": "Texto da capa (tradução): ", "en-US": "Cover text (translation): ", "ko-KR": "표지 문구(번역): ", "es-CL": "Texto de la portada (traducción): " };
    cap.textContent = (prefixo[l] || prefixo["pt-BR"]) + partes.join(" · ");
  }

  function attach(img) {
    if (img._cpLens) return;
    var m = SRC_RE.exec(img.getAttribute("src") || "");
    if (!m) return;
    img._cpLens = true;
    loadData(m[1]).then(function (data) {
      if (!data || !Array.isArray(data.areas)) return;
      img._cpLensData = data;
      updateCaption(img, data);
      img.addEventListener("mousemove", function (e) { show(img, data, e.clientX, e.clientY); });
      img.addEventListener("mouseleave", function () { img.style.cursor = ""; hide(); });
      img.addEventListener("touchstart", function (e) {
        tocando = true;
        var t = e.touches[0]; show(img, data, t.clientX, t.clientY);
      }, { passive: true });
      img.addEventListener("touchmove", function (e) {
        var t = e.touches[0]; show(img, data, t.clientX, t.clientY);
      }, { passive: true });
      img.addEventListener("touchend", function () { tocando = false; hide(1200); }, { passive: true });
    });
  }

  function scan(root) {
    var imgs = (root || document).querySelectorAll ? (root || document).querySelectorAll("img") : [];
    for (var i = 0; i < imgs.length; i++) attach(imgs[i]);
  }

  document.addEventListener("DOMContentLoaded", function () {
    scan(document);
    // Cards e páginas são montados depois (fetch do metadata.json).
    new MutationObserver(function (muts) {
      muts.forEach(function (mu) {
        mu.addedNodes.forEach(function (n) {
          if (n.nodeType !== 1) return;
          if (n.tagName === "IMG") attach(n); else scan(n);
        });
      });
    }).observe(document.body, { childList: true, subtree: true });
  });

  window.addEventListener("corpopleno:lang-changed", function () {
    hide();
    document.querySelectorAll("img").forEach(function (img) {
      if (img._cpLensData) updateCaption(img, img._cpLensData);
    });
  });
  window.addEventListener("scroll", function () { if (!tocando) hide(); }, { passive: true });

  // Só para testes automatizados/diagnóstico.
  window.CP_IMAGE_LENS = { _show: show, _localPoint: localPoint };
})();
