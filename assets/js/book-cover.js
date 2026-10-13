/*
  Fase CorpoPleno Livros 006 (2026-10-03) — resolução e renderização de
  capa de livro, compartilhada por books-render.js (catálogo),
  book-detail.js (página do livro) e reader.js (leitor). Fonte única de
  verdade para "qual capa mostrar neste idioma", nunca duplicada em cada
  consumidor.

  DOIS MODOS suportados (metadata.json, campo "cover"):

    mode: "localized-image" — uma imagem PRONTA por idioma (texto já
    incorporado na arte). Formato:
      cover: {
        mode: "localized-image",
        locales: {
          "pt-BR": { status: "READY"|"PENDING", image: "caminho.png"|null },
          ...
        }
      }

    mode: "dynamic" — uma arte-base (sem texto) + texto traduzido
    renderizado pelo sistema por cima. Formato:
      cover: {
        mode: "dynamic",
        artwork: "caminho-arte-limpa.png",
        localizedText: {
          "pt-BR": { status: "READY"|"PENDING", title: "...", subtitle: "...", volumeLabel: "..." },
          ...
        },
        layout: { default: {...}, "en-US": {...} }  // opcional, por idioma
      }

  Em AMBOS os modos: um idioma sem tradução/arte aprovada (status
  "PENDING" ou ausente) NUNCA é inventado -- cai para pt-BR (mesmo
  princípio de fallback já usado para título/subtítulo/descrição em todo
  o catálogo). Se nem pt-BR estiver pronto, mostra um placeholder neutro
  ("📖"), nunca uma capa fabricada.
*/
(function (global) {
  "use strict";

  function resolverEntradaCover(cover, lang) {
    if (!cover || !cover.mode) return { mode: null, pronto: false };

    if (cover.mode === "localized-image") {
      var locales = cover.locales || {};
      var alvo = locales[lang];
      var fallback = locales["pt-BR"];
      var usar = (alvo && alvo.status === "READY" && alvo.image) ? alvo : fallback;
      if (usar && usar.status === "READY" && usar.image) {
        return { mode: "localized-image", pronto: true, imagem: usar.image };
      }
      return { mode: "localized-image", pronto: false };
    }

    if (cover.mode === "dynamic") {
      var textos = cover.localizedText || {};
      var textoAlvo = textos[lang];
      var textoFallback = textos["pt-BR"];
      var textoUsar = (textoAlvo && textoAlvo.status === "READY" && textoAlvo.title) ? textoAlvo : textoFallback;
      if (cover.artwork && textoUsar && textoUsar.status === "READY" && textoUsar.title) {
        var layoutCfg = cover.layout || {};
        var layout = layoutCfg[lang] || layoutCfg["default"] || {};
        return { mode: "dynamic", pronto: true, artwork: cover.artwork, texto: textoUsar, layout: layout };
      }
      return { mode: "dynamic", pronto: false };
    }

    return { mode: cover.mode, pronto: false };
  }

  // Constrói o elemento DOM da capa já resolvido para o idioma pedido.
  // className é SEMPRE aplicado (para herdar o CSS já existente de
  // dimensão/aspect-ratio); placeholderClassName é um extra só no caso
  // de fallback.
  function construirElementoCover(cover, lang, opcoes) {
    opcoes = opcoes || {};
    var resolvido = resolverEntradaCover(cover, lang);
    var className = opcoes.className || "book-cover";

    if (resolvido.mode === "localized-image" && resolvido.pronto) {
      var img = document.createElement("img");
      img.className = className;
      img.src = resolvido.imagem;
      img.alt = opcoes.alt || "";
      if (opcoes.loading) img.loading = opcoes.loading;
      if (opcoes.width) img.width = opcoes.width;
      if (opcoes.height) img.height = opcoes.height;
      return img;
    }

    if (resolvido.mode === "dynamic" && resolvido.pronto) {
      var wrap = document.createElement("div");
      wrap.className = className + " book-cover--dynamic";
      wrap.style.backgroundImage = "url('" + resolvido.artwork + "')";
      if (resolvido.layout.fontScale) {
        wrap.style.setProperty("--book-cover-font-scale", String(resolvido.layout.fontScale));
      }
      if (resolvido.texto.volumeLabel) {
        var volume = document.createElement("div");
        volume.className = "book-cover__dynamic-volume";
        volume.textContent = resolvido.texto.volumeLabel;
        wrap.appendChild(volume);
      }
      var titulo = document.createElement("div");
      titulo.className = "book-cover__dynamic-title";
      titulo.textContent = resolvido.texto.title;
      wrap.appendChild(titulo);
      if (resolvido.texto.subtitle) {
        var subtitulo = document.createElement("div");
        subtitulo.className = "book-cover__dynamic-subtitle";
        subtitulo.textContent = resolvido.texto.subtitle;
        wrap.appendChild(subtitulo);
      }
      return wrap;
    }

    var placeholder = document.createElement("div");
    placeholder.className = className + " " + (opcoes.placeholderClassName || "book-cover--placeholder");
    placeholder.setAttribute("aria-hidden", "true");
    placeholder.textContent = "📖";
    return placeholder;
  }

  // Substitui o conteúdo de `container` pela capa resolvida -- usado
  // pelas páginas que têm um slot fixo no HTML (detalhe do livro,
  // leitor), em vez de criar o card inteiro do zero (catálogo).
  function renderizarCoverEm(container, cover, lang, opcoes) {
    if (!container) return;
    container.innerHTML = "";
    container.appendChild(construirElementoCover(cover, lang, opcoes));
  }

  global.CP_BOOK_COVER = {
    resolverEntradaCover: resolverEntradaCover,
    construirElementoCover: construirElementoCover,
    renderizarCoverEm: renderizarCoverEm,
  };
})(window);
