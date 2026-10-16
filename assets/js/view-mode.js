/*
  Fase CorpoPleno Livros 019 (2026-10-16) — modo de tela escolhido pela
  pessoa: Automático (padrão, pela largura real), Celular, Tablet ou
  Computador/TV.

  COMO FUNCIONA
  - Carregado de forma síncrona no <head>, DEPOIS das folhas de estilo:
    o navegador só executa este script quando o CSS já está carregado,
    então o modo salvo é aplicado ANTES da primeira pintura (sem piscar).
  - Marca <html data-view="mobile|tablet|desktop"> e REAVALIA as regras
    @media de largura já existentes (min-width/max-width) como se a tela
    tivesse a largura do modo: Celular = 390 px, Tablet = 820 px,
    Computador/TV = maior entre a largura real e 1280 px. Nenhum
    breakpoint é duplicado; regras que não são de largura (print,
    prefers-reduced-motion...) ficam intactas. Automático restaura tudo.
  - Celular/Tablet numa tela larga: a página fica centralizada na largura
    do aparelho (style.css, html[data-view]). Computador/TV numa tela
    estreita: largura mínima de 1280 px. Em celular, se a tela física for
    menor que a largura do modo, a viewport passa a ter a largura do modo.
  - Escolha salva em localStorage (com try/catch). O leitor (leitor.html)
    mantém o próprio controle "Ajustar leitura" com os mesmos modos.
*/
(function () {
  "use strict";

  var KEY = "cp_view_mode";
  var MODES = ["auto", "mobile", "tablet", "desktop"];
  var WIDTH = { mobile: 390, tablet: 820 };
  var html = document.documentElement;
  var originais = []; // [{rule, texto}]
  var viewportOriginal = null;

  function lerModo() {
    try {
      var v = window.localStorage.getItem(KEY);
      return MODES.indexOf(v) !== -1 ? v : "auto";
    } catch (e) { return "auto"; }
  }
  function salvarModo(m) {
    try { window.localStorage.setItem(KEY, m); } catch (e) { /* segue sem salvar */ }
  }

  // "(min-width: 640px) and (max-width: 959px)" avaliado com a largura W.
  // Devolve null se a condição tiver algo além de largura (não mexe).
  function avaliar(texto, W) {
    var listas = texto.split(",");
    var algum = false;
    for (var i = 0; i < listas.length; i++) {
      var partes = listas[i].trim().toLowerCase().split(/\s+and\s+/);
      var ok = true;
      for (var j = 0; j < partes.length; j++) {
        var p = partes[j].trim();
        if (p === "screen" || p === "all" || p === "only screen") continue;
        var m = /^\(\s*(min|max)-width\s*:\s*(\d+(?:\.\d+)?)px\s*\)$/.exec(p);
        if (!m) return null;
        var n = parseFloat(m[2]);
        if (m[1] === "min" ? W < n : W > n) ok = false;
      }
      if (ok) algum = true;
    }
    return algum;
  }

  function coletar() {
    if (originais.length) return;
    for (var s = 0; s < document.styleSheets.length; s++) {
      var regras;
      try { regras = document.styleSheets[s].cssRules; } catch (e) { continue; }
      if (!regras) continue;
      for (var r = 0; r < regras.length; r++) {
        var regra = regras[r];
        if (regra.type === 4 /* CSSMediaRule */ && avaliar(regra.media.mediaText, 1000) !== null) {
          originais.push({ rule: regra, texto: regra.media.mediaText });
        }
      }
    }
  }

  function larguraDoModo(modo) {
    if (modo === "mobile" || modo === "tablet") return WIDTH[modo];
    if (modo === "desktop") return Math.max(window.innerWidth || 0, 1280);
    return null;
  }

  function ajustarViewport(modo) {
    var meta = document.querySelector('meta[name="viewport"]');
    if (!meta) return;
    if (viewportOriginal === null) viewportOriginal = meta.getAttribute("content");
    // Tela física menor que a largura do modo (ex.: Tablet ou Computador/TV
    // num celular): viewport na largura do modo, e o navegador encaixa a
    // página na tela, como no "ver versão para computador".
    var alvo = modo === "mobile" ? 390 : modo === "tablet" ? 820 : modo === "desktop" ? 1280 : 0;
    var tela = window.screen && window.screen.width ? window.screen.width : window.innerWidth;
    meta.setAttribute("content", alvo && tela < alvo ? "width=" + alvo : viewportOriginal);
  }

  function aplicar(modo) {
    if (modo === "auto") html.removeAttribute("data-view");
    else html.setAttribute("data-view", modo);
    coletar();
    var W = larguraDoModo(modo);
    for (var i = 0; i < originais.length; i++) {
      var o = originais[i];
      var alvo = W === null ? o.texto : (avaliar(o.texto, W) ? "all" : "not all");
      if (o.rule.media.mediaText !== alvo) o.rule.media.mediaText = alvo;
    }
    ajustarViewport(modo);
  }

  var modoAtual = lerModo();
  aplicar(modoAtual);

  // Computador/TV acompanha a largura real (ex.: janela redimensionada).
  var timer = null;
  window.addEventListener("resize", function () {
    if (modoAtual !== "desktop") return;
    window.clearTimeout(timer);
    timer = window.setTimeout(function () { aplicar("desktop"); }, 150);
  });

  /* ---------------- Botão + menu (SVG inline, acessível) ---------------- */
  var SVG_NS = "http://www.w3.org/2000/svg";
  var ICONES = {
    auto: [["rect", { x: 2, y: 4, width: 14, height: 10, rx: 1.5 }], ["path", { d: "M6 18h6M9 14v4" }], ["rect", { x: 16, y: 9, width: 6, height: 11, rx: 1.2 }]],
    mobile: [["rect", { x: 7, y: 2, width: 10, height: 20, rx: 2 }], ["path", { d: "M11 18h2" }]],
    tablet: [["rect", { x: 4, y: 2, width: 16, height: 20, rx: 2 }], ["path", { d: "M11 18h2" }]],
    desktop: [["rect", { x: 2, y: 3, width: 20, height: 13, rx: 1.5 }], ["path", { d: "M8 21h8M12 16v5" }]],
  };
  function icone(modo) {
    var svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("width", "20");
    svg.setAttribute("height", "20");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "currentColor");
    svg.setAttribute("stroke-width", "1.8");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    ICONES[modo].forEach(function (def) {
      var el = document.createElementNS(SVG_NS, def[0]);
      Object.keys(def[1]).forEach(function (k) { el.setAttribute(k, String(def[1][k])); });
      svg.appendChild(el);
    });
    return svg;
  }
  var ROTULOS = { auto: ["view.auto", "Automático"], mobile: ["view.mobile", "Celular"], tablet: ["view.tablet", "Tablet"], desktop: ["view.desktop", "Computador / TV"] };

  function montarUI() {
    var langWrap = document.querySelector(".header-actions .lang-select-wrap");
    if (!langWrap || document.getElementById("cp-view-btn")) return;

    var wrap = document.createElement("div");
    wrap.className = "cp-view-wrap";
    var btn = document.createElement("button");
    btn.type = "button";
    btn.id = "cp-view-btn";
    btn.className = "cp-view-btn";
    btn.setAttribute("aria-haspopup", "menu");
    btn.setAttribute("aria-expanded", "false");
    btn.setAttribute("aria-controls", "cp-view-menu");
    btn.setAttribute("aria-label", "Modo de tela");
    btn.setAttribute("data-i18n-aria-label", "view.button_label");

    var menu = document.createElement("ul");
    menu.id = "cp-view-menu";
    menu.className = "cp-view-menu";
    menu.setAttribute("role", "menu");
    menu.setAttribute("aria-label", "Modo de tela");
    menu.setAttribute("data-i18n-aria-label", "view.button_label");
    menu.hidden = true;

    var itens = MODES.map(function (modo) {
      var li = document.createElement("li");
      li.setAttribute("role", "none");
      var item = document.createElement("button");
      item.type = "button";
      item.className = "cp-view-item";
      item.setAttribute("role", "menuitemradio");
      item.setAttribute("data-view-mode", modo);
      item.tabIndex = -1;
      item.appendChild(icone(modo));
      var span = document.createElement("span");
      span.setAttribute("data-i18n", ROTULOS[modo][0]);
      span.textContent = ROTULOS[modo][1];
      item.appendChild(span);
      li.appendChild(item);
      menu.appendChild(li);
      return item;
    });

    var rotuloBtn = document.createElement("span");
    rotuloBtn.className = "cp-view-btn__label";
    rotuloBtn.setAttribute("data-i18n", "view.button_label");
    rotuloBtn.textContent = "Modo de tela";
    function atualizar() {
      while (btn.firstChild) btn.removeChild(btn.firstChild);
      btn.appendChild(icone(modoAtual));
      btn.appendChild(rotuloBtn);
      itens.forEach(function (it) {
        it.setAttribute("aria-checked", String(it.getAttribute("data-view-mode") === modoAtual));
      });
    }
    function abrir(focoEm) {
      menu.hidden = false;
      btn.setAttribute("aria-expanded", "true");
      var idx = focoEm === "ultimo" ? itens.length - 1 : Math.max(0, MODES.indexOf(modoAtual));
      itens[idx].focus();
    }
    function fechar(devolverFoco) {
      if (menu.hidden) return;
      menu.hidden = true;
      btn.setAttribute("aria-expanded", "false");
      if (devolverFoco) btn.focus();
    }
    function escolher(modo) {
      modoAtual = modo;
      salvarModo(modo);
      aplicar(modo);
      atualizar();
      fechar(true);
      window.dispatchEvent(new CustomEvent("corpopleno:view-changed", { detail: { mode: modo } }));
    }

    btn.addEventListener("click", function () { if (menu.hidden) abrir(); else fechar(false); });
    btn.addEventListener("keydown", function (e) {
      if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") { e.preventDefault(); abrir(); }
      else if (e.key === "ArrowUp") { e.preventDefault(); abrir("ultimo"); }
    });
    itens.forEach(function (it, i) {
      it.addEventListener("click", function () { escolher(it.getAttribute("data-view-mode")); });
      it.addEventListener("keydown", function (e) {
        var n = itens.length;
        if (e.key === "ArrowDown") { e.preventDefault(); itens[(i + 1) % n].focus(); }
        else if (e.key === "ArrowUp") { e.preventDefault(); itens[(i - 1 + n) % n].focus(); }
        else if (e.key === "Home") { e.preventDefault(); itens[0].focus(); }
        else if (e.key === "End") { e.preventDefault(); itens[n - 1].focus(); }
        else if (e.key === "Escape") { e.preventDefault(); fechar(true); }
        else if (e.key === "Tab") { fechar(false); }
      });
    });
    document.addEventListener("click", function (e) {
      if (!wrap.contains(e.target)) fechar(false);
    });

    wrap.appendChild(btn);
    wrap.appendChild(menu);

    /* Em larguras efetivas de até 560 px o cabeçalho já está no limite
       (marca + Entrar + idioma + menu): o controle vai para dentro do menu
       do celular, com o rótulo visível. Acima disso, fica ao lado do
       seletor de idiomas. */
    var nav = document.getElementById("cp-main-nav");
    function posicionar() {
      var efetiva = larguraDoModo(modoAtual) || window.innerWidth;
      var noMenu = !!nav && efetiva <= 560;
      wrap.classList.toggle("cp-view-wrap--in-nav", noMenu);
      if (noMenu && wrap.parentNode !== nav) nav.appendChild(wrap);
      if (!noMenu && wrap.previousSibling !== langWrap) langWrap.parentNode.insertBefore(wrap, langWrap.nextSibling);
    }
    posicionar();
    window.addEventListener("resize", posicionar);
    window.addEventListener("corpopleno:view-changed", posicionar);
    atualizar();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", montarUI);
  else montarUI();

  window.CP_VIEW_MODE = { get: function () { return modoAtual; }, set: function (m) { if (MODES.indexOf(m) !== -1) { modoAtual = m; salvarModo(m); aplicar(m); } } };
})();
