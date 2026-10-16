/*
  Fase CorpoPleno Livros 001 — renderiza os cards de assets/js/books-data.js
  na página livros.html. Mesma garantia de segurança de catalog-render.js:
  SOMENTE livros com status "PUBLISHED" são inseridos no DOM — "DRAFT",
  "READY" e "ARCHIVED" (Fase 004) nunca chegam a existir no HTML
  renderizado (nem aparecem em "Ver código-fonte").

  Cada livro tem título/subtítulo/descrição/capa PRÓPRIOS por idioma
  (metadata.json de cada livro, campo "locales"), ao contrário do catálogo
  de Produtos/Cursos (que usa chaves i18n genéricas) — por isso este
  módulo relê o metadata já carregado e re-renderiza ao trocar de idioma,
  em vez de depender só de assets/js/i18n.js.

  AGRUPAMENTO POR COLEÇÃO (Fase CorpoPleno Livros 004, 2026-10-03) —
  Passo 9: puramente visual, nunca afeta entitlement (sempre individual
  por book_id). Livros com o mesmo campo "collection" (books-data.js)
  aparecem sob um título de coleção (assets/js/books-data.js,
  CP_BOOK_COLLECTIONS); livros sem coleção (collection=null, ex.:
  livro-teste) aparecem numa seção final sem título — comportamento
  visual IDÊNTICO ao de antes da Fase 004 quando não há nenhuma coleção
  publicada ainda.

  CAPA/PREÇO AUSENTES (Fase 004) — um livro real pode estar PUBLISHED sem
  preço/capa definitivos ainda (Passo 11: nunca fingir checkout
  funcional). Este módulo nunca inventa um e nunca quebra: mostra um
  placeholder neutro de capa e "Preço a definir" em vez de lançar erro.

  CAPA POR IDIOMA (Fase CorpoPleno Livros 006, 2026-10-03) — a resolução
  da capa (mode "localized-image"/"dynamic", fallback para pt-BR, nunca
  uma tradução/arte inventada) vive em assets/js/book-cover.js
  (CP_BOOK_COVER), compartilhada com book-detail.js/reader.js -- nunca
  duplicada aqui.

  Requer um servidor local (fetch de arquivo local via file:// é bloqueado
  pelo navegador) — mesmo requisito já documentado para o site em
  CP-SOURCE-OF-TRUTH-001 (servidor local de teste, 127.0.0.1:8765).
*/
(function () {
  "use strict";

  var metadataCache = {};

  function currentLang() {
    return window.CP_I18N && typeof window.CP_I18N.currentLang === "function"
      ? window.CP_I18N.currentLang()
      : "pt-BR";
  }

  function t(key, fallback) {
    if (window.CP_I18N && typeof window.CP_I18N.t === "function") {
      return window.CP_I18N.t(key, currentLang());
    }
    return fallback || key;
  }

  function localeOf(meta, lang) {
    return meta.locales[lang] || meta.locales["pt-BR"];
  }

  function buildCard(item, meta) {
    var lang = currentLang();
    var ed = localeOf(meta, lang);

    var article = document.createElement("article");
    article.className = "card book-card";
    article.setAttribute("data-book-id", item.id);

    var coverLink = document.createElement("a");
    coverLink.href = "livro.html?id=" + encodeURIComponent(item.id);
    coverLink.className = "book-card__cover-link";
    coverLink.appendChild(window.CP_BOOK_COVER.construirElementoCover(meta.cover, lang, {
      className: "book-card__cover",
      placeholderClassName: "book-card__cover--placeholder",
      alt: ed.title,
      loading: "lazy",
      width: 400,
      height: 600,
    }));
    article.appendChild(coverLink);

    var body = document.createElement("div");
    body.className = "book-card__body";

    var h3 = document.createElement("h3");
    h3.className = "book-card__title";
    h3.textContent = ed.title;
    body.appendChild(h3);

    var subtitle = document.createElement("p");
    subtitle.className = "book-card__subtitle";
    subtitle.textContent = ed.subtitle || "";
    subtitle.hidden = !ed.subtitle;
    body.appendChild(subtitle);

    var desc = document.createElement("p");
    desc.className = "book-card__description";
    desc.textContent = ed.description || "";
    desc.hidden = !ed.description;
    body.appendChild(desc);

    var meta_row = document.createElement("div");
    meta_row.className = "book-card__meta";
    // Fase Livros 020 -- sem selo de idioma no card (pedido da Noemi).
    var price = document.createElement("span");
    price.className = "book-card__price";
    // Fase Livros 020 -- preço pelo Intl (BRL oficial + aproximado na moeda
    // do idioma, ver assets/js/price-format.js); display antigo só como reserva.
    price.textContent = meta.price
      ? ((window.CP_PRICE && window.CP_PRICE.formatar(meta, lang)) || meta.price.display[lang] || meta.price.display["pt-BR"])
      : t("books.card.price_pending", "Preço a definir");
    meta_row.appendChild(price);
    body.appendChild(meta_row);

    var actions = document.createElement("div");
    actions.className = "book-card__actions";
    var knowBtn = document.createElement("a");
    knowBtn.className = "btn btn-secondary";
    knowBtn.href = "livro.html?id=" + encodeURIComponent(item.id);
    knowBtn.setAttribute("data-i18n", "books.card.know_book");
    knowBtn.textContent = t("books.card.know_book", "Conhecer o livro");
    actions.appendChild(knowBtn);

    var buyBtn = document.createElement("a");
    buyBtn.className = "btn btn-primary";
    buyBtn.href = "livro.html?id=" + encodeURIComponent(item.id) + "#comprar";
    buyBtn.setAttribute("data-i18n", "books.card.buy");
    buyBtn.textContent = t("books.card.buy", "Comprar");
    actions.appendChild(buyBtn);

    body.appendChild(actions);
    article.appendChild(body);

    return article;
  }

  /* ACHADO REAL (testado com Chromium headless antes de reportar a
     fase pronta): i18n.js dispara "corpopleno:lang-changed" já dentro do
     seu PRÓPRIO listener de DOMContentLoaded (init -> applyToDom ->
     dispatchEvent) -- como este módulo escuta TANTO DOMContentLoaded
     quanto esse evento, render() podia ser chamado duas vezes em
     sequência rápida, e como cada chamada busca o metadata.json de forma
     assíncrona, as DUAS resolviam depois do grid já ter sido limpo pela
     outra, duplicando o card. renderGeneration descarta qualquer
     callback de uma chamada de render() que não seja mais a mais
     recente. */
  var renderGeneration = 0;

  // Agrupa os cards já construídos pela "collection" do item
  // correspondente (Fase 004, Passo 9) e os insere em `grid`. Livros sem
  // coleção (collection=null/desconhecida) vão numa seção final sem
  // título -- comportamento visual idêntico ao de antes da Fase 004
  // quando essa é a ÚNICA seção (nenhum <h2> extra aparece).
  function montarGridAgrupado(grid, published, rendered) {
    grid.innerHTML = "";
    var lang = currentLang();
    var colecoes = window.CP_BOOK_COLLECTIONS || [];
    var usados = {};

    colecoes.forEach(function (col) {
      var cards = [];
      published.forEach(function (item, idx) {
        if (item.collection === col.id && rendered[idx]) cards.push(rendered[idx]);
      });
      if (cards.length === 0) return;
      usados[col.id] = true;

      var section = document.createElement("section");
      section.className = "books-collection";
      var h2 = document.createElement("h2");
      h2.className = "books-collection__title";
      h2.textContent = (col.name && (col.name[lang] || col.name["pt-BR"])) || col.id;
      section.appendChild(h2);
      var subGrid = document.createElement("div");
      subGrid.className = "grid grid-3 books-grid";
      cards.forEach(function (card) { subGrid.appendChild(card); });
      section.appendChild(subGrid);
      grid.appendChild(section);
    });

    var semColecao = [];
    published.forEach(function (item, idx) {
      var temColecaoConhecida = item.collection && usados[item.collection];
      if (!temColecaoConhecida && rendered[idx]) semColecao.push(rendered[idx]);
    });
    if (semColecao.length > 0) {
      var subGridSolta = document.createElement("div");
      subGridSolta.className = "grid grid-3 books-grid";
      semColecao.forEach(function (card) { subGridSolta.appendChild(card); });
      grid.appendChild(subGridSolta);
    }
  }

  // Fase Livros 020 -- o aviso "conteúdo somente em pt-BR" só aparece se
  // algum livro exibido ainda não tiver tradução no idioma escolhido.
  function ajustarAvisoTraducao(published) {
    var aviso = document.getElementById("cp-partial-translation-notice");
    var lang = currentLang();
    if (!aviso || lang === "pt-BR") return;
    var todos = published.every(function (item) {
      var m = metadataCache[item.id];
      return !!(m && m.locales && m.locales[lang]);
    });
    if (todos) aviso.hidden = true;
  }

  function render() {
    var cfg = window.CP_BOOKS;
    if (!cfg) return;
    var grid = document.getElementById(cfg.gridId);
    if (!grid) return;
    var notice = cfg.noticeId ? document.getElementById(cfg.noticeId) : null;
    var emptyState = cfg.emptyStateId ? document.getElementById(cfg.emptyStateId) : null;

    var myGeneration = ++renderGeneration;
    grid.innerHTML = "";

    var published = cfg.items.filter(function (item) {
      return item.status === "PUBLISHED";
    });

    if (published.length === 0) {
      if (notice) notice.hidden = true;
      if (emptyState) emptyState.hidden = false;
      return;
    }

    var pending = published.length;
    var rendered = [];
    published.forEach(function (item, idx) {
      function onMeta(meta) {
        if (myGeneration !== renderGeneration) return;
        rendered[idx] = buildCard(item, meta);
        pending--;
        if (pending === 0) {
          montarGridAgrupado(grid, published, rendered);
          ajustarAvisoTraducao(published);
          var hasAny = rendered.some(function (c) { return !!c; });
          if (notice) notice.hidden = !hasAny;
          if (emptyState) emptyState.hidden = hasAny;
        }
      }
      if (metadataCache[item.id]) {
        onMeta(metadataCache[item.id]);
        return;
      }
      fetch(item.metadataUrl)
        .then(function (res) {
          if (!res.ok) throw new Error("metadata_fetch_failed");
          return res.json();
        })
        .then(function (meta) {
          metadataCache[item.id] = meta;
          onMeta(meta);
        })
        .catch(function () {
          if (myGeneration !== renderGeneration) return;
          pending--;
          if (pending === 0) {
            montarGridAgrupado(grid, published, rendered);
          }
        });
    });
  }

  document.addEventListener("DOMContentLoaded", render);
  window.addEventListener("corpopleno:lang-changed", render);
  window.addEventListener("corpopleno:rates-ready", render);
})();
