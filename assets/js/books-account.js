/*
  Fase CorpoPleno Livros 003 (2026-10-03) — controlador REAL de
  meus-livros.html. Substitui o redirecionamento incondicional da Fase
  001 (que nunca verificava sessão nenhuma, porque nenhum backend de
  autenticação existia ainda).

  Chama de verdade GET /api/auth/me e GET /api/me/books (ver
  server/auth/customer_auth_routes.js) -- NUNCA confia em
  localStorage/query-string/qualquer dado vindo só do navegador como
  prova de que o cliente está logado ou comprou algo: toda decisão vem
  da resposta do servidor, autenticada pelo cookie de sessão
  (corpopleno_customer_session, HttpOnly -- este script nunca lê nem
  grava esse cookie diretamente, só deixa o navegador enviá-lo via
  `credentials: "include"`).
*/
(function () {
  "use strict";

  function apiBase() {
    return typeof window.CP_API_BASE === "string" ? window.CP_API_BASE : "";
  }

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

  function el(id) { return document.getElementById(id); }

  function mostrarApenas(idVisivel) {
    ["cp-books-account-loading", "cp-books-account-redirect", "cp-books-account-empty", "cp-books-account-error", "cp-books-account-list"].forEach(function (id) {
      var node = el(id);
      if (node) node.hidden = id !== idVisivel;
    });
  }

  function montarCard(livro, meta) {
    var lang = currentLang();
    var ed = localeOf(meta, lang);

    var article = document.createElement("article");
    article.className = "card book-card";
    article.setAttribute("data-book-id", livro.bookId);

    // Fase Livros 017 -- capa pela mesma lógica do catálogo (book-cover.js);
    // antes usava ed.cover, campo que não existe no metadata.json.
    var cover = window.CP_BOOK_COVER
      ? window.CP_BOOK_COVER.construirElementoCover(meta.cover, lang, {
          className: "book-card__cover", placeholderClassName: "book-card__cover--placeholder",
          alt: ed.title, loading: "lazy", width: 400, height: 600,
        })
      : document.createElement("div");
    article.appendChild(cover);

    var body = document.createElement("div");
    body.className = "book-card__body";

    var h3 = document.createElement("h3");
    h3.className = "book-card__title";
    h3.textContent = ed.title;
    body.appendChild(h3);

    var readBtn = document.createElement("a");
    readBtn.className = "btn btn-primary";
    readBtn.href = "leitor.html?id=" + encodeURIComponent(livro.bookId);
    // Fase Livros 017 -- com progresso salvo no servidor, o botão vira
    // "Continuar leitura (pág. N)"; o leitor reabre no ponto salvo.
    if (livro.progress && typeof livro.progress.page === "number" && livro.progress.page > 1) {
      readBtn.textContent = t("books.account.continue", "Continuar leitura (pág. {page})").replace("{page}", livro.progress.page);
    } else {
      readBtn.setAttribute("data-i18n", "books.account.read_now");
      readBtn.textContent = t("books.account.read_now", "Ler agora");
    }
    body.appendChild(readBtn);

    // Livro de Receitas: versão interativa (questionário de restrições,
    // cardápios e filtros), servida só a quem comprou por /api/books/:id/app.
    if (livro.bookId === "receitas-corpopleno") {
      var smart = document.createElement("a");
      smart.className = "btn btn-secondary";
      smart.style.marginTop = "10px";
      smart.href = apiBase() + "/api/books/" + encodeURIComponent(livro.bookId) + "/app";
      smart.textContent = t("books.account.open_smart", "Abrir livro inteligente 🧭");
      body.appendChild(smart);
      var dica = document.createElement("p");
      dica.className = "books-account__hint";
      dica.style.cssText = "font-size:0.85rem;margin:6px 0 0;opacity:.8";
      dica.textContent = t("books.account.open_smart_hint", "Questionário de restrições, cardápios e filtros (versão em português)");
      body.appendChild(dica);
    }

    article.appendChild(body);
    return article;
  }

  // Último conjunto exibido: ao trocar de idioma, os cards são refeitos
  // (título, capa e botão no novo idioma) sem nova chamada de rede.
  var ultimos = null;
  function redesenharNoIdioma() {
    var grid = el("cp-books-account-grid");
    if (!grid || !ultimos) return;
    grid.innerHTML = "";
    ultimos.livros.forEach(function (livro, idx) {
      if (ultimos.metas[idx]) grid.appendChild(montarCard(livro, ultimos.metas[idx]));
    });
  }
  window.addEventListener("corpopleno:lang-changed", redesenharNoIdioma);

  function renderizarLivros(livros) {
    var grid = el("cp-books-account-grid");
    if (!grid) return;
    grid.innerHTML = "";

    if (livros.length === 0) {
      mostrarApenas("cp-books-account-empty");
      return;
    }

    var pendentes = livros.length;
    var cards = [];
    var metas = [];
    livros.forEach(function (livro, idx) {
      fetch("assets/books/" + encodeURIComponent(livro.bookId) + "/metadata.json")
        .then(function (res) {
          if (!res.ok) throw new Error("metadata_fetch_failed");
          return res.json();
        })
        .then(function (meta) {
          metas[idx] = meta;
          cards[idx] = montarCard(livro, meta);
        })
        .catch(function () {
          cards[idx] = null; // livro com entitlement ativo mas metadata ausente -- nunca quebra a página inteira.
        })
        .then(function () {
          pendentes--;
          if (pendentes === 0) {
            ultimos = { livros: livros, metas: metas };
            cards.forEach(function (card) { if (card) grid.appendChild(card); });
            mostrarApenas("cp-books-account-list");
          }
        });
    });
  }

  /* =======================================================================
     Fase Meta Pixel 001 (2026-10-07) — dispara Purchase para a Meta
     SOMENTE a partir de confirmação real do servidor (nunca no clique de
     comprar, nunca em PENDING). Para cada livro com entitlement ACTIVE
     (já é o único tipo de livro que chega aqui -- ver GET /api/me/books),
     pergunta a GET /api/books/:bookId/purchase-confirmation (nova rota,
     autenticada pela MESMA sessão, nunca aceita customerId/preço do
     navegador) se existe mesmo um pagamento CONFIRMED/RECEIVED por trás.
     Só então chama window.CP_META.trackPurchase(...), que já faz sua
     própria deduplicação local por eventId (nunca duplica em reload nem
     em visitas repetidas a esta página). Totalmente desacoplado da
     renderização da grade de livros: uma falha aqui nunca impede o
     cliente de ver/ler seus livros. */
  function dispararComprasConfirmadasParaMeta(livros) {
    if (!window.CP_META || typeof window.CP_META.trackPurchase !== "function") return;
    if (!Array.isArray(livros)) return;

    livros.forEach(function (livro) {
      if (!livro || typeof livro.bookId !== "string" || !livro.bookId) return;
      fetch(apiBase() + "/api/books/" + encodeURIComponent(livro.bookId) + "/purchase-confirmation", { credentials: "include" })
        .then(function (res) {
          return res && res.ok ? res.json() : null;
        })
        .then(function (dados) {
          if (dados && dados.ok === true) {
            window.CP_META.trackPurchase({
              eventId: dados.eventId,
              value: dados.value,
              currency: dados.currency
            });
          }
        })
        .catch(function () {
          /* Confirmação indisponível para este livro agora -- nunca
             quebra a tela nem impede tentar de novo na próxima visita. */
        });
    });
  }

  function init() {
    mostrarApenas("cp-books-account-loading");

    fetch(apiBase() + "/api/auth/me", { credentials: "include" })
      .then(function (res) {
        if (!res.ok) throw new Error("auth_me_failed");
        return res.json();
      })
      .then(function (dados) {
        if (!dados || dados.autenticado !== true) {
          mostrarApenas("cp-books-account-redirect");
          window.location.replace("login.html");
          return null;
        }
        return fetch(apiBase() + "/api/me/books", { credentials: "include" });
      })
      .then(function (res) {
        if (!res) return; // já redirecionou para login.html acima.
        if (res.status === 401) {
          // Sessão expirou/foi revogada entre as duas chamadas -- mesmo
          // tratamento de "não autenticado", nunca um erro genérico.
          mostrarApenas("cp-books-account-redirect");
          window.location.replace("login.html");
          return null;
        }
        if (!res.ok) throw new Error("me_books_failed");
        return res.json();
      })
      .then(function (dados) {
        if (!dados) return;
        var livros = Array.isArray(dados.livros) ? dados.livros : [];
        renderizarLivros(livros);
        dispararComprasConfirmadasParaMeta(livros);
      })
      .catch(function () {
        mostrarApenas("cp-books-account-error");
      });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
