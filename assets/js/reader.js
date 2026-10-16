/*
  Fase CorpoPleno Livros 001 + Adendo de Proteção/Responsividade —
  leitor.html. Lê ?id= (livro) e ?qa_preview=1 (ver checkEntitlement
  abaixo), carrega metadata.json + pages.json do idioma atual, renderiza
  a página corrente em blocos, controla paginação, idioma, modo de
  dispositivo, tamanho de fonte, tela cheia, progresso local e proteção
  de conteúdo.

  CONTROLE DE ACESSO (Fase CorpoPleno Livros 003.2, 2026-10-03): para o
  livro de teste interno (metadata.internalTestOnly===true) com
  ?qa_preview=1 na URL, o acesso e o conteúdo continuam vindo do fetch
  estático antigo (assets/books/<id>/<lang>/pages.json) -- nunca usado
  como precedente para um livro comercial. Para QUALQUER outro livro, o
  acesso é decidido por GET /api/books/:bookId/access (OWNER autenticada
  OU sessão de cliente + entitlement ACTIVE) e o conteúdo real das
  páginas vem exclusivamente de GET /api/books/:bookId/content/:locale
  (server/auth/customer_auth_routes.js) -- nunca mais do arquivo
  pages.json público usado pelo livro de teste. Ambos os endpoints
  revalidam a autorização no servidor a cada chamada; este arquivo nunca
  decide sozinho se o acesso é válido.
*/
(function () {
  "use strict";

  var SUPPORTED_LANGS = ["pt-BR", "pt-PT", "en-US", "ko-KR", "es-CL"];
  var FONT_SCALES = [0.85, 1, 1.15, 1.3];
  var DEFAULT_FONT_INDEX = 1;
  var STORAGE_PREFIX = "cp_reader_";
  // Fase CorpoPleno Livros 013 -- chave fixa (nunca por livro) do
  // identificador de DISPOSITIVO, gerado uma única vez por navegador.
  // Isto é preferência de LEITURA, nunca dado sensível (não é PII, não
  // sai deste navegador, não tem relação com o customerId real).
  var DEVICE_ID_KEY = "cp_reader_device_id";

  function qs(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name);
  }
  function currentLang() {
    return window.CP_I18N && typeof window.CP_I18N.currentLang === "function"
      ? window.CP_I18N.currentLang()
      : "pt-BR";
  }
  function t(key, fallback, vars) {
    var str = window.CP_I18N && typeof window.CP_I18N.t === "function"
      ? window.CP_I18N.t(key, currentLang())
      : (fallback || key);
    if (vars) {
      Object.keys(vars).forEach(function (k) {
        str = str.split("{" + k + "}").join(String(vars[k]));
      });
    }
    return str;
  }

  var bookId = qs("id");
  var qaPreview = qs("qa_preview") === "1";
  var meta = null;
  var pages = null;
  var readingLang = currentLang();
  var pageIndex = 0;
  var deviceMode = "AUTO";
  var fontIndex = DEFAULT_FONT_INDEX;
  // Fase CorpoPleno Livros 013 -- modo de disposição de página: AUTO
  // (decide sozinho pela largura real da tela, nunca abaixo de 960px),
  // DOUBLE (forçar duas páginas -- cai para 1 mesmo assim em tela
  // estreita, ver books.css) ou SINGLE (forçar sempre 1 página).
  var pageLayoutMode = "AUTO";
  // Fase CorpoPleno Livros 013 -- "cliente" (chave opaca devolvida por
  // GET /api/books/:bookId/access, nunca o customerId real -- ver
  // server/auth/customer_auth_routes.js) + "dispositivo" (gerado local,
  // abaixo). Combinados com bookId+idioma, resolvem "memorização da
  // última página lida por cliente, dispositivo e livro". Valor inicial
  // nunca usado para salvar/ler progresso de verdade -- sempre
  // substituído antes disso por checkEntitlement() (ver init()).
  var readerSubjectKey = "SEM_SESSAO_RESOLVIDA";
  // Fase Livros 017 -- estado novo do leitor.
  var theme = "light";
  var watermarkCode = null;        // código curto do cliente (nunca e-mail)
  var availableLocales = null;     // [{locale, pages, reviewed}] vindos do servidor
  var serverProgress = null;       // progresso salvo no D1
  var pendingBlockMarker = null;   // marcador a restaurar após renderizar
  var serverSaveTimer = null;

  function getOrCreateDeviceId() {
    try {
      var existente = window.localStorage.getItem(DEVICE_ID_KEY);
      if (existente) return existente;
      var novo = (window.crypto && typeof window.crypto.randomUUID === "function")
        ? window.crypto.randomUUID()
        : "dev-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2);
      window.localStorage.setItem(DEVICE_ID_KEY, novo);
      return novo;
    } catch (e) {
      // localStorage indisponível (ex. navegação privada) -- segue com um
      // valor fixo só para esta execução; sem persistência real possível
      // de qualquer forma nesse cenário (nenhuma preferência sobrevive).
      return "SEM_ARMAZENAMENTO_LOCAL";
    }
  }
  var deviceId = getOrCreateDeviceId();

  function apiBase() {
    return typeof window.CP_API_BASE === "string" ? window.CP_API_BASE : "";
  }

  /* ---- Acesso / entitlement -------------------------------------------
     Livro de teste interno: decisão 100% local, sem nenhuma chamada de
     rede -- comportamento inalterado desde a Fase 001/Adendo. Qualquer
     outro livro: pergunta de verdade ao backend (OWNER ou entitlement
     ACTIVE), nunca decidido no navegador. */
  function checkEntitlement(m) {
    if (m.internalTestOnly === true && qaPreview) {
      readerSubjectKey = "QA_PREVIEW";
      return Promise.resolve({ granted: true, reason: "INTERNAL_TEST_PREVIEW" });
    }
    return fetch(apiBase() + "/api/books/" + encodeURIComponent(bookId) + "/access", { credentials: "include" })
      .then(function (res) {
        if (!res.ok) throw new Error("access_check_failed");
        return res.json();
      })
      .then(function (dados) {
        if (dados && dados.allowReading === true) {
          // Fase Livros 013 -- chave opaca resolvida no servidor (OWNER ou
          // cliente real); nunca inventada aqui. Sem ela (resposta antiga/
          // inesperada), cai num valor fixo -- ainda separa por
          // dispositivo+livro, só perde a separação entre clientes
          // diferentes no MESMO navegador (caso raro, nunca pior que o
          // comportamento anterior a esta fase).
          readerSubjectKey = typeof dados.readerSubjectKey === "string" && dados.readerSubjectKey
            ? dados.readerSubjectKey
            : "SUBJECT_KEY_AUSENTE";
          watermarkCode = typeof dados.watermark === "string" ? dados.watermark : null;
          return { granted: true, reason: "REAL_ENTITLEMENT" };
        }
        return { granted: false, reason: "ACCESS_DENIED" };
      })
      .catch(function () {
        return { granted: false, reason: "ACCESS_CHECK_FAILED" };
      });
  }

  /* ---- Persistência local (progresso + preferências) ------------------
     IMPORTANTE: sem conta real de cliente ainda, isto é salvo POR
     NAVEGADOR, nunca por usuário de verdade — documentado para nunca ser
     confundido com entitlement real. */
  // Fase CorpoPleno Livros 013 -- chave agora combina cliente (opaco,
  // resolvido pelo servidor em checkEntitlement) + dispositivo (gerado
  // local) + livro, atendendo ao pedido "memorização por cliente,
  // dispositivo e livro". Antes desta fase a chave só tinha bookId: duas
  // pessoas diferentes no MESMO navegador (ex. computador compartilhado)
  // veriam o progresso uma da outra -- corrigido aqui, nunca um problema
  // de segurança de acesso (quem pode LER o livro continua decidido só
  // por /api/books/:bookId/access, nunca por esta chave de preferência).
  function storageKey(suffix) {
    return STORAGE_PREFIX + readerSubjectKey + "_" + deviceId + "_" + bookId + "_" + suffix;
  }
  function loadProgressFor(lang) {
    try {
      var raw = window.localStorage.getItem(storageKey("progress_" + lang));
      if (!raw) return null;
      var data = JSON.parse(raw);
      return typeof data.page_number === "number" ? data.page_number : null;
    } catch (e) {
      return null;
    }
  }
  function saveProgress() {
    try {
      window.localStorage.setItem(
        storageKey("progress_" + readingLang),
        JSON.stringify({
          book_id: bookId,
          edition_language: readingLang,
          page_number: pageIndex + 1,
          updated_at: new Date().toISOString(),
        })
      );
    } catch (e) {
      /* localStorage indisponível (ex.: navegação privada) — segue sem persistir */
    }
  }
  function loadPreferences() {
    try {
      deviceMode = window.localStorage.getItem(storageKey("device_mode")) || "AUTO";
    } catch (e) {
      deviceMode = "AUTO";
    }
    try {
      var f = parseInt(window.localStorage.getItem(storageKey("font_index")), 10);
      fontIndex = isNaN(f) ? DEFAULT_FONT_INDEX : Math.max(0, Math.min(FONT_SCALES.length - 1, f));
    } catch (e) {
      fontIndex = DEFAULT_FONT_INDEX;
    }
    try {
      theme = window.localStorage.getItem(storageKey("theme")) === "dark" ? "dark" : "light";
    } catch (e) {
      theme = "light";
    }
    try {
      var layout = window.localStorage.getItem(storageKey("page_layout_mode"));
      pageLayoutMode = (layout === "DOUBLE" || layout === "SINGLE") ? layout : "AUTO";
    } catch (e) {
      pageLayoutMode = "AUTO";
    }
  }
  function savePreferences() {
    try {
      window.localStorage.setItem(storageKey("device_mode"), deviceMode);
      window.localStorage.setItem(storageKey("font_index"), String(fontIndex));
      window.localStorage.setItem(storageKey("page_layout_mode"), pageLayoutMode);
      window.localStorage.setItem(storageKey("theme"), theme);
    } catch (e) {
      /* segue sem persistir */
    }
    scheduleServerSave();
  }

  /* ---- Fase Livros 017 -- progresso e preferências no servidor (D1) ----
     Por cliente + livro: idioma, página, marcador estável do bloco no topo
     da tela ("p<página>-b<bloco>") e preferências. Gravação com espera de
     1,5 s para não gerar uma chamada a cada clique. */
  function isTestFixtureMode() {
    return !!(meta && meta.internalTestOnly === true && qaPreview);
  }
  function currentPrefs() {
    return { fontIndex: fontIndex, theme: theme, deviceMode: deviceMode, pageLayoutMode: pageLayoutMode };
  }
  function currentBlockMarker() {
    var blocks = document.querySelectorAll("#cp-reader-page-content [data-block]");
    for (var i = 0; i < blocks.length; i++) {
      if (blocks[i].getBoundingClientRect().bottom > 80) return blocks[i].getAttribute("data-block");
    }
    return blocks.length ? blocks[0].getAttribute("data-block") : null;
  }
  function scheduleServerSave() {
    if (!pages || isTestFixtureMode()) return;
    window.clearTimeout(serverSaveTimer);
    serverSaveTimer = window.setTimeout(function () {
      fetch(apiBase() + "/api/books/" + encodeURIComponent(bookId) + "/progress", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ locale: readingLang, pageIndex: pageIndex, blockMarker: currentBlockMarker(), prefs: currentPrefs() }),
      }).catch(function () { /* sem rede: o progresso local continua valendo */ });
    }, 1500);
  }
  function fetchServerState() {
    if (isTestFixtureMode()) return Promise.resolve();
    var base = apiBase() + "/api/books/" + encodeURIComponent(bookId);
    return Promise.all([
      fetch(base + "/content", { credentials: "include" }).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }),
      fetch(base + "/progress", { credentials: "include" }).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }),
    ]).then(function (res) {
      availableLocales = res[0] && Array.isArray(res[0].locales) ? res[0].locales : null;
      serverProgress = res[1] && res[1].progress ? res[1].progress : null;
      if (serverProgress && serverProgress.prefs) {
        var pr = serverProgress.prefs;
        if (typeof pr.fontIndex === "number") fontIndex = Math.max(0, Math.min(FONT_SCALES.length - 1, pr.fontIndex));
        if (pr.theme === "dark" || pr.theme === "light") theme = pr.theme;
        if (pr.deviceMode) deviceMode = pr.deviceMode;
        if (pr.pageLayoutMode) pageLayoutMode = pr.pageLayoutMode;
      }
    });
  }
  // Só os idiomas com conteúdo real ficam no seletor.
  function applyAvailableLocales() {
    if (!availableLocales) return;
    var codes = availableLocales.map(function (l) { return l.locale; });
    var select = document.getElementById("cp-reader-lang-select");
    Array.prototype.slice.call(select.options).forEach(function (opt) {
      if (codes.indexOf(opt.value) === -1) opt.remove();
    });
  }
  function chooseInitialLang(preferida) {
    if (!availableLocales || availableLocales.length === 0) return preferida;
    var codes = availableLocales.map(function (l) { return l.locale; });
    if (serverProgress && codes.indexOf(serverProgress.locale) !== -1) return serverProgress.locale;
    if (codes.indexOf(preferida) !== -1) return preferida;
    if (codes.indexOf("pt-BR") !== -1) return "pt-BR";
    return codes[0];
  }
  function updateTranslationBadge() {
    var badge = document.getElementById("cp-reader-translation-badge");
    if (!badge) return;
    var info = availableLocales ? availableLocales.filter(function (l) { return l.locale === readingLang; })[0] : null;
    badge.hidden = !(info && info.reviewed === false);
  }
  function applyTheme() {
    document.body.classList.toggle("reader-theme-dark", theme === "dark");
    var btn = document.getElementById("cp-reader-theme-btn");
    if (btn) {
      btn.setAttribute("aria-pressed", String(theme === "dark"));
      btn.setAttribute("aria-label", theme === "dark" ? "Modo claro" : "Modo escuro");
      btn.firstElementChild.textContent = theme === "dark" ? "☀️" : "🌙";
    }
  }
  function applyWatermark() {
    var wm = document.getElementById("cp-reader-watermark");
    if (!wm) return;
    wm.textContent = "";
    if (!watermarkCode) return;
    for (var i = 0; i < 18; i++) {
      var span = document.createElement("span");
      span.textContent = "CorpoPleno · " + watermarkCode;
      wm.appendChild(span);
    }
  }
  // Sumário: primeiro título de cada página (sem repetir títulos seguidos).
  function buildToc() {
    var list = document.getElementById("cp-reader-toc-list");
    if (!list || !pages) return;
    list.textContent = "";
    var anterior = null;
    pages.forEach(function (pg, idx) {
      var h = (pg.blocks || []).filter(function (b) { return b.type === "heading" && b.text; })[0];
      if (!h || h.text === anterior) return;
      anterior = h.text;
      var li = document.createElement("li");
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "reader-search-result";
      btn.textContent = h.text + " — pág. " + (idx + 1);
      btn.addEventListener("click", function () {
        goToPage(idx);
        document.getElementById("cp-reader-toc-panel").hidden = true;
        document.getElementById("cp-reader-toc-btn").setAttribute("aria-expanded", "false");
      });
      li.appendChild(btn);
      list.appendChild(li);
    });
  }

  /* ---- Modo de dispositivo / tamanho de fonte --------------------------- */
  function applyDeviceMode() {
    var shell = document.getElementById("cp-reader-shell");
    shell.classList.remove("reader--desktop-tv", "reader--tablet", "reader--mobile");
    if (deviceMode === "DESKTOP_TV") shell.classList.add("reader--desktop-tv");
    else if (deviceMode === "TABLET") shell.classList.add("reader--tablet");
    else if (deviceMode === "MOBILE") shell.classList.add("reader--mobile");
    document.querySelectorAll(".reader-adjust-option[data-device-mode]").forEach(function (btn) {
      btn.setAttribute("aria-pressed", String(btn.getAttribute("data-device-mode") === deviceMode));
    });
  }
  function applyFontScale() {
    document.documentElement.style.setProperty("--reader-font-scale", FONT_SCALES[fontIndex]);
  }

  /* ---- Fase CorpoPleno Livros 013 -- modo "duas páginas" ----------------
     .reader--spread é só um SINALIZADOR de intenção: quem decide se o
     grid de 2 colunas realmente aparece é a media query (min-width:960px)
     em books.css -- por isso forçar DOUBLE numa tela estreita cai sozinho
     para 1 página, sem nenhuma lógica extra aqui (fallback automático
     pedido por Noemi). TABLET/MOBILE forçados manualmente no painel
     "Ajustar leitura" sempre suprimem o modo duas páginas, mesmo em tela
     larga -- são escolhas explícitas de simular um aparelho menor. */
  function isSpreadActive() {
    if (deviceMode === "MOBILE" || deviceMode === "TABLET") return false;
    if (pageLayoutMode === "SINGLE") return false;
    if (pageLayoutMode === "DOUBLE") return true;
    return window.matchMedia("(min-width: 960px)").matches;
  }
  function applyPageLayoutMode() {
    var shell = document.getElementById("cp-reader-shell");
    shell.classList.toggle("reader--spread", isSpreadActive());
    document.querySelectorAll(".reader-layout-option").forEach(function (btn) {
      btn.setAttribute("aria-pressed", String(btn.getAttribute("data-page-layout") === pageLayoutMode));
    });
  }

  /* ---- Renderização de blocos -------------------------------------------- */
  function renderBlock(block) {
    switch (block.type) {
      case "heading": {
        var h = document.createElement("h2");
        h.className = "reader-block reader-block--heading";
        h.textContent = block.text;
        return h;
      }
      case "paragraph": {
        var p = document.createElement("p");
        p.className = "reader-block reader-block--paragraph";
        p.textContent = block.text;
        return p;
      }
      case "image": {
        var fig = document.createElement("figure");
        fig.className = "reader-block reader-block--image";
        var img = document.createElement("img");
        img.src = block.src;
        img.alt = block.alt || "";
        img.draggable = false;
        fig.appendChild(img);
        if (block.caption) {
          var cap = document.createElement("figcaption");
          cap.textContent = block.caption;
          fig.appendChild(cap);
        }
        return fig;
      }
      case "callout": {
        var call = document.createElement("div");
        call.className = "reader-block reader-block--callout";
        call.textContent = block.text;
        return call;
      }
      case "icon": {
        var wrap = document.createElement("div");
        wrap.className = "reader-block reader-block--icon";
        var glyph = document.createElement("span");
        glyph.setAttribute("aria-hidden", "true");
        glyph.textContent = block.glyph || "★";
        wrap.appendChild(glyph);
        if (block.label) {
          var label = document.createElement("span");
          label.className = "reader-block--icon-label";
          label.textContent = block.label;
          wrap.appendChild(label);
        }
        return wrap;
      }
      case "reference": {
        var ref = document.createElement("p");
        ref.className = "reader-block reader-block--reference";
        if (block.url) {
          var refLink = document.createElement("a");
          refLink.href = block.url;
          refLink.target = "_blank";
          refLink.rel = "noopener";
          refLink.textContent = block.text;
          ref.appendChild(refLink);
        } else {
          ref.textContent = block.text;
        }
        return ref;
      }
      /* Fase CorpoPleno Livros 012 -- tipos de bloco do Livro de Receitas.
         Nunca usados pelo livro de novela (pages.json dele não os contém);
         amount/unit/valores nutricionais/tags de alergênicos NUNCA são
         traduzidos ou convertidos entre idiomas -- só os textos o são. */
      case "recipe-meta": {
        var metaWrap = document.createElement("dl");
        metaWrap.className = "reader-block reader-block--recipe-meta";
        [["reader.recipe.tempo", "Tempo aproximado", block.tempo], ["reader.recipe.rendimento", "Rendimento", block.rendimento]].forEach(function (par) {
          var dt = document.createElement("dt");
          dt.textContent = t(par[0], par[1]);
          var dd = document.createElement("dd");
          dd.textContent = par[2] || "";
          metaWrap.appendChild(dt);
          metaWrap.appendChild(dd);
        });
        return metaWrap;
      }
      case "ingredient-list": {
        var ingWrap = document.createElement("ul");
        ingWrap.className = "reader-block reader-block--ingredient-list";
        (block.items || []).forEach(function (item) {
          var li = document.createElement("li");
          var texto = item.description || "";
          if (item.amount != null && item.unit) {
            texto = item.amount + " " + item.unit + " " + texto;
          }
          li.textContent = texto;
          if (item.note) {
            var nota = document.createElement("span");
            nota.className = "reader-block--ingredient-note";
            nota.textContent = " — " + item.note;
            li.appendChild(nota);
          }
          ingWrap.appendChild(li);
        });
        return ingWrap;
      }
      case "steps": {
        var stepsWrap = document.createElement("ol");
        stepsWrap.className = "reader-block reader-block--steps";
        (block.items || []).forEach(function (passo) {
          var li = document.createElement("li");
          li.textContent = passo;
          stepsWrap.appendChild(li);
        });
        return stepsWrap;
      }
      case "nutrition-table": {
        var nutriWrap = document.createElement("div");
        nutriWrap.className = "reader-block reader-block--nutrition-table";
        if (!block.quantified) {
          var naoQuant = document.createElement("p");
          naoQuant.className = "reader-block--nutrition-note";
          naoQuant.textContent = block.note || "";
          nutriWrap.appendChild(naoQuant);
          return nutriWrap;
        }
        var tabela = document.createElement("table");
        var campos = [
          ["reader.recipe.energia", "Energia", block.energia],
          ["reader.recipe.carboidratos", "Carboidratos", block.carboidratos],
          ["reader.recipe.proteinas", "Proteínas", block.proteinas],
          ["reader.recipe.gorduras", "Gorduras", block.gorduras],
          ["reader.recipe.fibras", "Fibras", block.fibras],
          ["reader.recipe.sodio", "Sódio", block.sodio],
        ];
        var linhaCab = document.createElement("tr");
        var linhaVal = document.createElement("tr");
        campos.forEach(function (c) {
          var th = document.createElement("th");
          th.textContent = t(c[0], c[1]);
          linhaCab.appendChild(th);
          var td = document.createElement("td");
          td.textContent = c[2] ? c[2].valor + " " + c[2].unidade : "";
          linhaVal.appendChild(td);
        });
        tabela.appendChild(linhaCab);
        tabela.appendChild(linhaVal);
        nutriWrap.appendChild(tabela);
        if (block.note) {
          var notaRodape = document.createElement("p");
          notaRodape.className = "reader-block--nutrition-note";
          notaRodape.textContent = block.note;
          nutriWrap.appendChild(notaRodape);
        }
        return nutriWrap;
      }
      case "allergens": {
        var alWrap = document.createElement("p");
        alWrap.className = "reader-block reader-block--allergens";
        var alLabel = document.createElement("strong");
        alLabel.textContent = t("reader.recipe.alergenicos", "Alergênicos") + ": ";
        alWrap.appendChild(alLabel);
        alWrap.appendChild(document.createTextNode(block.text || ""));
        return alWrap;
      }
      case "menu-table": {
        var menuWrap = document.createElement("div");
        menuWrap.className = "reader-block reader-block--menu-table";
        (block.days || []).forEach(function (dia) {
          var diaHeading = document.createElement("h3");
          diaHeading.className = "reader-block--menu-day-heading";
          diaHeading.textContent = t("reader.recipe.dia", "Dia {n}", { n: dia.day });
          menuWrap.appendChild(diaHeading);
          var tabelaDia = document.createElement("table");
          tabelaDia.className = "reader-block--menu-day-table";
          (dia.meals || []).forEach(function (refeicao) {
            var tr = document.createElement("tr");
            var tdLabel = document.createElement("td");
            tdLabel.className = "reader-block--menu-meal-label";
            tdLabel.textContent = refeicao.label;
            tr.appendChild(tdLabel);
            var tdItens = document.createElement("td");
            (refeicao.items || []).forEach(function (item) {
              var linhaItem = document.createElement("div");
              if (item.recipeRef && item.recipeRef.variantId) {
                var linkItem = document.createElement("a");
                linkItem.href = "#";
                linkItem.className = "reader-block--menu-item-link";
                linkItem.textContent = item.text;
                linkItem.setAttribute("data-variant-id", item.recipeRef.variantId);
                linhaItem.appendChild(linkItem);
              } else {
                linhaItem.textContent = item.text;
              }
              tdItens.appendChild(linhaItem);
            });
            tr.appendChild(tdItens);
            tabelaDia.appendChild(tr);
          });
          menuWrap.appendChild(tabelaDia);
        });
        return menuWrap;
      }
      default:
        return document.createDocumentFragment();
    }
  }

  function renderPage() {
    var container = document.getElementById("cp-reader-page-content");
    container.innerHTML = "";
    var pageData = pages[pageIndex];
    if (!pageData) return;
    var numeroPagina = typeof pageData.page === "number" ? pageData.page : pageIndex + 1;
    pageData.blocks.forEach(function (block, bi) {
      var nodo = renderBlock(block);
      if (nodo && nodo.setAttribute) nodo.setAttribute("data-block", "p" + numeroPagina + "-b" + bi);
      container.appendChild(nodo);
    });

    /* Fase CorpoPleno Livros 013 -- página direita ("duas páginas lado a
       lado"), só preenchida quando o modo está ativo de verdade (ver
       isSpreadActive()/books.css) E existe uma próxima página real (a
       última página de um livro com total ímpar fica sozinha à esquerda,
       nunca inventa conteúdo para preencher a direita). */
    var rightContainer = document.getElementById("cp-reader-page-content-right");
    var spreadAtivo = document.getElementById("cp-reader-shell").classList.contains("reader--spread");
    var rightPageData = spreadAtivo ? pages[pageIndex + 1] : null;
    rightContainer.innerHTML = "";
    if (rightPageData) {
      rightPageData.blocks.forEach(function (block) {
        rightContainer.appendChild(renderBlock(block));
      });
      rightContainer.hidden = false;
    } else {
      rightContainer.hidden = true;
    }

    document.getElementById("cp-reader-page-status").textContent = rightPageData
      ? t("reader.nav.pages_of", "Páginas {current}–{current2} de {total}", {
          current: pageIndex + 1,
          current2: pageIndex + 2,
          total: pages.length,
        })
      : t("reader.nav.page_of", "Página {current} de {total}", { current: pageIndex + 1, total: pages.length });
    document.getElementById("cp-reader-prev").disabled = pageIndex === 0;
    document.getElementById("cp-reader-next").disabled = pageIndex >= pages.length - 1;

    saveProgress();

    // Fase Livros 017 -- volta ao bloco salvo (se houver) ou ao topo.
    if (pendingBlockMarker) {
      var alvo = container.querySelector('[data-block="' + pendingBlockMarker.replace(/[^a-z0-9-]/gi, "") + '"]');
      pendingBlockMarker = null;
      if (alvo && alvo.scrollIntoView) alvo.scrollIntoView({ block: "start" });
    }
    scheduleServerSave();

    /* Fase CorpoPleno Livros 012 -- evento aditivo, nenhum consumidor
       existente escuta isto. Permite a um módulo externo (reader-recipes.js)
       reagir a cada página renderizada (ex. mostrar botão de favorito,
       destacar resultado de busca) sem reader.js precisar saber nada sobre
       receitas/busca/favoritos -- separação de responsabilidades. */
    window.dispatchEvent(new CustomEvent("cp-reader-page-rendered", {
      detail: { bookId: bookId, pageIndex: pageIndex, pageData: pageData, totalPages: pages.length },
    }));
  }

  /* Fase CorpoPleno Livros 013 -- no modo "duas páginas" cada clique
     avança/volta 2 páginas (pedido explícito de Noemi: "avançar 2
     páginas por vez quando em modo livro duplo"); fora dele, continua 1
     por clique, exatamente como antes. */
  function goPrev() {
    if (!pages || pageIndex <= 0) return;
    var passo = document.getElementById("cp-reader-shell").classList.contains("reader--spread") ? 2 : 1;
    pageIndex = Math.max(0, pageIndex - passo);
    renderPage();
  }
  function goNext() {
    if (!pages || pageIndex >= pages.length - 1) return;
    var passo = document.getElementById("cp-reader-shell").classList.contains("reader--spread") ? 2 : 1;
    pageIndex = Math.min(pages.length - 1, pageIndex + passo);
    renderPage();
  }
  /* Fase CorpoPleno Livros 012 -- navegação direta por índice, necessária
     para links de cardápio -> receita, busca e favoritos (livro de
     novela nunca usa isto, só prev/next sequencial). */
  function goToPage(indice) {
    if (pages && indice >= 0 && indice < pages.length) {
      pageIndex = indice;
      renderPage();
    }
  }
  function encontrarPageIndexPorVariantId(variantId) {
    if (!pages) return -1;
    for (var i = 0; i < pages.length; i++) {
      var meta = pages[i].meta;
      if (meta && meta.type === "RECIPE" && meta.variantId === variantId) return i;
    }
    return -1;
  }

  /* ---- Carregamento de livro/edição ---------------------------------------
     Fixture de teste interno: fetch estático antigo, inalterado. Livro
     comercial: SEMPRE o endpoint autenticado -- o arquivo pages.json
     público nem existe para um livro comercial real; o conteúdo real
     vive em private_content/, fora de qualquer raiz pública (ver
     server/billing/book_content_repository.js). */
  function loadEdition(lang, targetPageIndex) {
    var isTestFixture = meta.internalTestOnly === true && qaPreview;
    var contentPromise = isTestFixture
      ? fetch("assets/books/" + bookId + "/" + lang + "/pages.json").then(function (res) {
          if (!res.ok) throw new Error("pages_fetch_failed");
          return res.json();
        })
      : fetch(apiBase() + "/api/books/" + encodeURIComponent(bookId) + "/content/" + encodeURIComponent(lang), { credentials: "include" })
          .then(function (res) {
            if (res.status === 401 || res.status === 403) {
              showAccessDenied();
              throw new Error("access_denied");
            }
            if (!res.ok) throw new Error("content_fetch_failed");
            return res.json();
          })
          .then(function (dados) {
            return dados.pages;
          });

    return contentPromise
      .then(function (data) {
        pages = data;
        readingLang = lang;
        var maxIndex = pages.length - 1;
        pageIndex = Math.max(0, Math.min(targetPageIndex != null ? targetPageIndex : 0, maxIndex));

        var ed = meta.locales[lang] || meta.locales["pt-BR"];
        // Fase CorpoPleno Livros 006 — capa resolvida por idioma (mesma
        // lógica do catálogo/detalhe, assets/js/book-cover.js). Troca de
        // idioma aqui já atualiza a capa automaticamente (loadEdition é
        // chamada de novo a cada switchLanguage()).
        window.CP_BOOK_COVER.renderizarCoverEm(
          document.getElementById("cp-reader-cover-slot"),
          meta.cover,
          lang,
          { className: "reader-book-strip__cover", alt: ed.title }
        );
        document.getElementById("cp-reader-title").textContent = ed.title;
        document.title = ed.title + " — CorpoPleno";

        updateTranslationBadge();
        buildToc();
        renderPage();
      });
  }

  function switchLanguage(lang) {
    if (SUPPORTED_LANGS.indexOf(lang) === -1) return;
    if (availableLocales && !availableLocales.some(function (l) { return l.locale === lang; })) return;
    if (window.CP_I18N && typeof window.CP_I18N.setLang === "function") {
      window.CP_I18N.setLang(lang);
    }
    /* Passo 9: ao trocar idioma, manter o MESMO livro e, quando
       tecnicamente possível, o mesmo índice de página -- nunca misturar
       trechos de idiomas diferentes na mesma edição (cada chamada troca
       a edição inteira, nunca um bloco isolado). */
    loadEdition(lang, pageIndex).catch(function () {});
  }

  /* ---- Estados iniciais --------------------------------------------------- */
  function showAccessDenied() {
    document.getElementById("cp-reader-access-denied").hidden = false;
  }
  function showNotFound() {
    document.getElementById("cp-reader-not-found").hidden = false;
  }

  function init() {
    if (!bookId) {
      showNotFound();
      return;
    }
    var cfg = window.CP_BOOKS;
    /* Fase CorpoPleno Livros 012.7 -- SÓ este filtro (nunca books-data.js
       em si) aceita um livro não-PUBLISHED quando ?qa_preview=1 está na
       URL, para permitir revisão OWNER/QA real sem alterar o status
       comercial. NUNCA pula autorização real: checkEntitlement() abaixo
       continua chamando /api/books/:id/access de verdade (a menos que o
       metadata.json do livro tenha internalTestOnly:true, o que
       receitas-corpopleno não tem) -- sem sessão OWNER/entitlement real,
       o acesso continua negado normalmente. books-render.js,
       catalog-render.js e book-detail.js têm filtros próprios e
       independentes; nada disto os afeta. */
    var item = cfg && cfg.items.filter(function (i) {
      if (i.id !== bookId) return false;
      if (i.status === "PUBLISHED") return true;
      return qaPreview && i.status !== "ARCHIVED";
    })[0];
    if (!item) {
      showNotFound();
      return;
    }

    fetch(item.metadataUrl)
      .then(function (res) {
        if (!res.ok) throw new Error("metadata_fetch_failed");
        return res.json();
      })
      .then(function (m) {
        meta = m;
        return checkEntitlement(meta).then(function (entitlement) {
          if (!entitlement.granted) {
            showAccessDenied();
            return;
          }

          document.getElementById("cp-reader-shell").hidden = false;
          if (entitlement.reason === "INTERNAL_TEST_PREVIEW") {
            document.getElementById("cp-reader-qa-banner").hidden = false;
          }

          loadPreferences();
          return fetchServerState().then(function () {
            applyDeviceMode();
            applyFontScale();
            applyPageLayoutMode();
            applyTheme();
            applyWatermark();
            applyAvailableLocales();

            var lang = chooseInitialLang(currentLang());
            var alvoPagina;
            if (serverProgress && serverProgress.locale === lang) {
              alvoPagina = serverProgress.pageIndex;
              pendingBlockMarker = serverProgress.blockMarker || null;
            } else {
              var savedPage = loadProgressFor(lang);
              alvoPagina = savedPage != null ? savedPage - 1 : 0;
            }
            document.getElementById("cp-reader-lang-select").value = lang;
            loadEdition(lang, alvoPagina).catch(function () {});
          });
        });
      })
      .catch(showNotFound);
  }

  document.addEventListener("DOMContentLoaded", function () {
    init();

    document.getElementById("cp-reader-prev").addEventListener("click", goPrev);
    document.getElementById("cp-reader-next").addEventListener("click", goNext);

    /* Fase CorpoPleno Livros 012 -- clique num item de cardápio que
       referencia uma receita (data-variant-id) pula direto para a página
       daquela ficha. Delegado no container de conteúdo porque os links só
       existem dentro de páginas de cardápio, renderizadas dinamicamente. */
    // Fase Livros 013 -- mesmo delegado nas duas páginas: no modo "duas
    // páginas" uma página de cardápio pode cair na direita, e o link
    // precisa continuar funcionando igual à esquerda.
    ["cp-reader-page-content", "cp-reader-page-content-right"].forEach(function (containerId) {
      document.getElementById(containerId).addEventListener("click", function (e) {
        var link = e.target.closest ? e.target.closest(".reader-block--menu-item-link") : null;
        if (!link) return;
        e.preventDefault();
        var variantId = link.getAttribute("data-variant-id");
        var indice = encontrarPageIndexPorVariantId(variantId);
        if (indice >= 0) goToPage(indice);
      });
    });

    document.getElementById("cp-reader-lang-select").addEventListener("change", function (e) {
      switchLanguage(e.target.value);
    });

    document.getElementById("cp-reader-restart").addEventListener("click", function () {
      var msg = t("reader.restart.confirm", "Voltar para a primeira página? Seu progresso atual será perdido.");
      if (window.confirm(msg)) {
        pageIndex = 0;
        renderPage();
      }
    });

    /* Painel "Ajustar leitura" */
    var adjustBtn = document.getElementById("cp-reader-adjust-btn");
    var adjustPanel = document.getElementById("cp-reader-adjust-panel");
    adjustBtn.addEventListener("click", function () {
      var willOpen = adjustPanel.hidden;
      adjustPanel.hidden = !willOpen;
      adjustBtn.setAttribute("aria-expanded", String(willOpen));
    });
    document.addEventListener("click", function (e) {
      if (!adjustPanel.hidden && !adjustPanel.contains(e.target) && e.target !== adjustBtn) {
        adjustPanel.hidden = true;
        adjustBtn.setAttribute("aria-expanded", "false");
      }
    });
    document.querySelectorAll(".reader-adjust-option[data-device-mode]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        deviceMode = btn.getAttribute("data-device-mode");
        applyDeviceMode();
        // Fase Livros 013 -- forçar TABLET/MOBILE precisa suprimir "duas
        // páginas" na hora, mesmo sem a pessoa tocar no outro grupo de
        // botões (ver isSpreadActive()).
        applyPageLayoutMode();
        if (pages) renderPage();
        savePreferences();
      });
    });
    document.querySelectorAll(".reader-layout-option").forEach(function (btn) {
      btn.addEventListener("click", function () {
        pageLayoutMode = btn.getAttribute("data-page-layout");
        applyPageLayoutMode();
        if (pages) renderPage();
        savePreferences();
      });
    });
    // Fase Livros 013 -- modo AUTO reage a redimensionar/girar a tela
    // (ex. tablet em pé -> deitado cruzando 960px) sem precisar reabrir o
    // leitor; debounce simples só para não recalcular a cada pixel.
    var resizeTimer = null;
    window.addEventListener("resize", function () {
      if (pageLayoutMode !== "AUTO") return;
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(function () {
        var estavaAtivo = document.getElementById("cp-reader-shell").classList.contains("reader--spread");
        applyPageLayoutMode();
        var agoraAtivo = document.getElementById("cp-reader-shell").classList.contains("reader--spread");
        if (pages && estavaAtivo !== agoraAtivo) renderPage();
      }, 200);
    });
    document.getElementById("cp-reader-font-smaller").addEventListener("click", function () {
      fontIndex = Math.max(0, fontIndex - 1);
      applyFontScale();
      savePreferences();
    });
    document.getElementById("cp-reader-font-reset").addEventListener("click", function () {
      fontIndex = DEFAULT_FONT_INDEX;
      applyFontScale();
      savePreferences();
    });
    document.getElementById("cp-reader-font-larger").addEventListener("click", function () {
      fontIndex = Math.min(FONT_SCALES.length - 1, fontIndex + 1);
      applyFontScale();
      savePreferences();
    });

    /* Tela cheia */
    var fsBtn = document.getElementById("cp-reader-fullscreen-btn");
    fsBtn.addEventListener("click", function () {
      if (!document.fullscreenElement) {
        var el = document.documentElement;
        if (el.requestFullscreen) el.requestFullscreen().catch(function () {});
      } else if (document.exitFullscreen) {
        document.exitFullscreen().catch(function () {});
      }
    });
    document.addEventListener("fullscreenchange", function () {
      var exiting = !document.fullscreenElement;
      var key = exiting ? "reader.fullscreen.enter" : "reader.fullscreen.exit";
      fsBtn.setAttribute("aria-label", t(key, exiting ? "Expandir leitura" : "Sair da tela cheia"));
      fsBtn.setAttribute("data-i18n-aria-label", key);
    });

    /* ---- Navegação por teclado + bloqueio de atalhos de cópia/impressão.
       Nunca a ÚNICA forma de navegar (as setas na tela sempre funcionam). */
    document.addEventListener("keydown", function (e) {
      if (pages) {
        if (e.key === "ArrowLeft") { goPrev(); return; }
        if (e.key === "ArrowRight") { goNext(); return; }
      }
      var mod = e.ctrlKey || e.metaKey;
      if (!mod) return;
      var k = e.key.toLowerCase();
      // Fase Livros 017 -- campos de digitação (ex.: busca de receitas)
      // continuam podendo copiar/colar; o bloqueio vale para a leitura.
      var tag = (e.target && e.target.tagName) || "";
      var emCampo = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
      if (k === "p" || (!emCampo && (k === "c" || k === "x" || k === "a"))) {
        e.preventDefault();
      }
    });

    /* Fase Livros 017 -- área de leitura: sem menu de contexto, cópia,
       recorte nem arrastar. Captura de tela NÃO pode ser impedida por um
       site; a marca d'água com o código do cliente é a dissuasão. */
    var areaLeitura = document.getElementById("cp-reader-pages-wrap");
    ["contextmenu", "copy", "cut", "dragstart", "selectstart"].forEach(function (evt) {
      areaLeitura.addEventListener(evt, function (e) { e.preventDefault(); });
    });

    /* Fase Livros 017 -- swipe (celular/tablet): deslizar para o lado
       troca de página; deslizar mais na vertical continua rolando. */
    var toqueX = null, toqueY = null;
    areaLeitura.addEventListener("touchstart", function (e) {
      if (e.touches.length !== 1) return;
      toqueX = e.touches[0].clientX;
      toqueY = e.touches[0].clientY;
    }, { passive: true });
    areaLeitura.addEventListener("touchend", function (e) {
      if (toqueX === null) return;
      var dx = e.changedTouches[0].clientX - toqueX;
      var dy = e.changedTouches[0].clientY - toqueY;
      toqueX = toqueY = null;
      if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
      if (dx < 0) goNext(); else goPrev();
    }, { passive: true });

    /* Fase Livros 017 -- tema claro/escuro e sumário. */
    document.getElementById("cp-reader-theme-btn").addEventListener("click", function () {
      theme = theme === "dark" ? "light" : "dark";
      applyTheme();
      savePreferences();
    });
    var tocBtn = document.getElementById("cp-reader-toc-btn");
    var tocPanel = document.getElementById("cp-reader-toc-panel");
    tocBtn.addEventListener("click", function () {
      var abrir = tocPanel.hidden;
      tocPanel.hidden = !abrir;
      tocBtn.setAttribute("aria-expanded", String(abrir));
    });
    document.addEventListener("click", function (e) {
      if (!tocPanel.hidden && !tocPanel.contains(e.target) && !tocBtn.contains(e.target)) {
        tocPanel.hidden = true;
        tocBtn.setAttribute("aria-expanded", "false");
      }
    });

    // Salva o ponto de leitura também ao rolar a página (celular).
    window.addEventListener("scroll", function () { if (pages) scheduleServerSave(); }, { passive: true });

    var readerMain = document.getElementById("conteudo-principal");
    readerMain.addEventListener("paste", function (e) {
      e.preventDefault();
    });

    window.addEventListener("beforeprint", function () {
      document.body.classList.add("reader-print-block-active");
    });
    window.addEventListener("afterprint", function () {
      document.body.classList.remove("reader-print-block-active");
    });

    /* Dissuasão de captura de tela — NUNCA uma garantia (ver cabeçalho
       deste arquivo e o relatório da fase: ABSOLUTE_SCREENSHOT_PREVENTION_CLAIM=false).
       Ao perder o foco da aba/janela, esconde brevemente o conteúdo. */
    document.addEventListener("visibilitychange", function () {
      var shell = document.getElementById("cp-reader-shell");
      if (!shell || shell.hidden) return;
      shell.classList.toggle("reader-dimmed", document.hidden);
    });
  });

  /* Fase CorpoPleno Livros 012 -- API pública mínima e aditiva, só para
     reader-recipes.js (busca/favoritos). Nenhum código existente lê isto;
     nunca expõe estado além do necessário (lista de páginas é só leitura
     por valor de referência -- reader-recipes.js nunca deve mutá-la). */
  window.CP_READER = {
    goToPage: goToPage,
    getPages: function () { return pages; },
    getPageIndex: function () { return pageIndex; },
    getBookId: function () { return bookId; },
  };
})();
