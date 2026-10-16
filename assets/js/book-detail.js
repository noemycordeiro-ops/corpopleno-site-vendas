/*
  Fase CorpoPleno Livros 001 — lógica de livro.html (página individual do
  livro). Lê ?id= da URL, busca o livro correspondente em
  assets/js/books-data.js (só avança se o status for "PUBLISHED" — um
  livro DRAFT/UNAVAILABLE nunca é exibido aqui, mesmo que alguém conheça
  o id exato pela URL, Passo 3 da fase), carrega seu metadata.json e
  preenche a página. Não requer autenticação para VER os detalhes (isso é
  público, como uma vitrine) — a autorização real só é exigida no leitor
  (assets/js/reader.js), nunca aqui.
*/
(function () {
  "use strict";

  function qs(name) {
    var params = new URLSearchParams(window.location.search);
    return params.get(name);
  }

  function currentLang() {
    return window.CP_I18N && typeof window.CP_I18N.currentLang === "function"
      ? window.CP_I18N.currentLang()
      : "pt-BR";
  }

  function t(key, fallback) {
    if (window.CP_I18N && typeof window.CP_I18N.t === "function") {
      var traduzido = window.CP_I18N.t(key, currentLang());
      // i18n.js devolve a própria chave quando ela não existe -- usa o fallback.
      return traduzido === key && fallback ? fallback : traduzido;
    }
    return fallback || key;
  }

  function localeOf(meta, lang) {
    return meta.locales[lang] || meta.locales["pt-BR"];
  }

  var currentMeta = null;
  var currentItem = null;

  /* ---------------------------------------------------------------------
     Fase Livros 016 (2026-10-16) — resumo comercial oficial do livro
     (metadata.json, campo summary[idioma], texto literal aprovado).
     Markdown SIMPLES convertido para DOM com createElement/textContent:
     parágrafos (linha em branco), listas "- ", **negrito**, *itálico*.
     Nunca usa innerHTML -- qualquer outro caractere vira texto puro.
     Combos mostram o resumo de cada livro do combo, com subtítulo.
     --------------------------------------------------------------------- */
  var summaryCache = {};
  var summaryGeneration = 0;

  function appendInline(parent, text) {
    var re = /\*\*([^*]+)\*\*|\*([^*]+)\*/g;
    var last = 0;
    var m;
    while ((m = re.exec(text)) !== null) {
      if (m.index > last) parent.appendChild(document.createTextNode(text.slice(last, m.index)));
      var node = document.createElement(m[1] != null ? "strong" : "em");
      node.textContent = m[1] != null ? m[1] : m[2];
      parent.appendChild(node);
      last = re.lastIndex;
    }
    if (last < text.length) parent.appendChild(document.createTextNode(text.slice(last)));
  }

  function renderSimpleMarkdown(md, container) {
    var blocks = String(md || "").replace(/\r\n/g, "\n").split(/\n\s*\n/);
    blocks.forEach(function (block) {
      var lines = block.split("\n").map(function (l) { return l.trim(); }).filter(Boolean);
      if (lines.length === 0) return;
      if (lines.every(function (l) { return /^- /.test(l); })) {
        var ul = document.createElement("ul");
        ul.className = "book-summary__list";
        lines.forEach(function (l) {
          var li = document.createElement("li");
          appendInline(li, l.slice(2));
          ul.appendChild(li);
        });
        container.appendChild(ul);
        return;
      }
      var p = document.createElement("p");
      var joined = lines.join("\n");
      if (/^\*[^*][\s\S]*[^*]\*$/.test(joined)) {
        p.className = "book-summary__notice"; // aviso de segurança/legal em itálico
      } else if (/^\*\*[\s\S]+\*\*$/.test(joined)) {
        p.className = "book-summary__lead";
      } else if (/^✅/.test(joined)) {
        p.className = "book-summary__check";
      }
      lines.forEach(function (l, i) {
        if (i > 0) p.appendChild(document.createElement("br"));
        appendInline(p, l);
      });
      container.appendChild(p);
    });
  }

  function summaryOf(meta, lang) {
    if (!meta || !meta.summary) return null;
    return meta.summary[lang] || meta.summary["pt-BR"] || null;
  }

  function loadMeta(bookId) {
    if (summaryCache[bookId]) return Promise.resolve(summaryCache[bookId]);
    return fetch("assets/books/" + encodeURIComponent(bookId) + "/metadata.json")
      .then(function (res) {
        if (!res.ok) throw new Error("metadata_fetch_failed");
        return res.json();
      })
      .then(function (meta) { summaryCache[bookId] = meta; return meta; });
  }

  function renderSummary(meta, lang) {
    var box = document.getElementById("cp-book-summary");
    if (!box) return;
    var myGen = ++summaryGeneration;
    box.textContent = "";
    box.hidden = true;

    var own = summaryOf(meta, lang);
    if (own) {
      renderSimpleMarkdown(own, box);
      box.hidden = false;
      return;
    }
    var items = Array.isArray(meta.combo_items) ? meta.combo_items : [];
    if (items.length === 0) return;
    Promise.all(items.map(function (id) { return loadMeta(id).catch(function () { return null; }); }))
      .then(function (metas) {
        if (myGen !== summaryGeneration) return;
        var rotulos = meta.combo_item_labels ? (meta.combo_item_labels[lang] || meta.combo_item_labels["pt-BR"] || []) : [];
        metas.forEach(function (itemMeta, idx) {
          var texto = summaryOf(itemMeta, lang);
          if (!texto) return;
          var section = document.createElement("section");
          section.className = "book-summary__part";
          var h2 = document.createElement("h2");
          h2.className = "book-summary__part-title";
          h2.textContent = rotulos[idx] || localeOf(itemMeta, lang).title;
          section.appendChild(h2);
          renderSimpleMarkdown(texto, section);
          box.appendChild(section);
        });
        box.hidden = box.childNodes.length === 0;
      });
  }

  function render() {
    if (!currentMeta) return;
    var lang = currentLang();
    var ed = localeOf(currentMeta, lang);

    document.title = ed.title + " — CorpoPleno";

    // Fase CorpoPleno Livros 006 — capa resolvida por idioma (modo
    // "localized-image"/"dynamic", fallback para pt-BR, placeholder
    // neutro se nem isso existir -- nunca uma capa inventada). Lógica
    // compartilhada em assets/js/book-cover.js.
    window.CP_BOOK_COVER.renderizarCoverEm(
      document.getElementById("cp-book-cover-slot"),
      currentMeta.cover,
      lang,
      { className: "book-detail__cover", placeholderClassName: "book-detail__cover--placeholder", alt: ed.title }
    );

    document.getElementById("cp-book-title").textContent = ed.title;
    document.getElementById("cp-book-subtitle").textContent = ed.subtitle;
    var descEl = document.getElementById("cp-book-description");
    descEl.textContent = ed.description || "";
    descEl.hidden = !ed.description;
    renderSummary(currentMeta, lang);
    document.getElementById("cp-book-language").textContent = lang;
    document.getElementById("cp-book-pages").textContent =
      currentMeta.pageCount != null ? String(currentMeta.pageCount) : t("book.detail.pages_pending", "A definir");
    document.getElementById("cp-book-price").textContent = currentMeta.price
      ? (currentMeta.price.display[lang] || currentMeta.price.display["pt-BR"])
      : t("books.card.price_pending", "Preço a definir");

    document.getElementById("cp-book-detail-found").hidden = false;
    document.getElementById("cp-book-detail-not-found").hidden = true;

    /* Link de pré-visualização interna do leitor — SOMENTE para livros
       explicitamente marcados internalTestOnly:true no próprio
       metadata.json (nunca para um livro real). Nunca é prova de compra;
       o próprio leitor exibe um aviso permanente quando usado neste modo
       (ver assets/js/reader.js). */
    var existingPreview = document.getElementById("cp-book-preview-reader");
    if (existingPreview) existingPreview.remove();
    if (currentMeta.internalTestOnly === true) {
      var actions = document.querySelector(".book-detail__actions");
      var link = document.createElement("a");
      link.id = "cp-book-preview-reader";
      link.className = "btn btn-secondary btn-block";
      link.href = "leitor.html?id=" + encodeURIComponent(currentItem.id) + "&qa_preview=1";
      link.textContent = "🧪 Testar o leitor (pré-visualização interna, nunca uma compra real)";
      link.style.marginTop = "10px";
      actions.appendChild(link);
    }
  }

  function showNotFound() {
    document.getElementById("cp-book-detail-found").hidden = true;
    document.getElementById("cp-book-detail-not-found").hidden = false;
  }

  function init() {
    var id = qs("id");
    var cfg = window.CP_BOOKS;
    if (!id || !cfg) {
      showNotFound();
      return;
    }
    var item = cfg.items.filter(function (i) {
      return i.id === id && i.status === "PUBLISHED";
    })[0];
    if (!item) {
      showNotFound();
      return;
    }
    currentItem = item;
    fetch(item.metadataUrl)
      .then(function (res) {
        if (!res.ok) throw new Error("metadata_fetch_failed");
        return res.json();
      })
      .then(function (meta) {
        currentMeta = meta;
        render();
      })
      .catch(showNotFound);
  }

  // =======================================================================
  // Fase CorpoPleno Livros 011 — checkout real, conectado ao backend já
  // existente e testado de ponta a ponta (Fases 008-009.7). O preço
  // exibido em cp-book-price é SÓ exibição (vem do metadata.json) — o
  // preço que REALMENTE é cobrado é sempre o que o servidor usa em
  // POST /api/books/:bookId/checkout (oferta_checkout.js), nunca algo
  // enviado por este script. customer_id nunca é enviado por aqui — o
  // servidor resolve pela sessão (cookie HttpOnly), exatamente como
  // reader.js/books-account.js já fazem.
  // =======================================================================

  function apiBase() {
    return typeof window.CP_API_BASE === "string" ? window.CP_API_BASE : "";
  }

  function el(id) { return document.getElementById(id); }

  // Fase Livros 015 -- devolve os dados da sessão (ou null), para saber
  // se ainda faltam nome/CPF exigidos pelo Asaas na primeira compra.
  var sessaoAtual = null;
  function estaLogado() {
    return fetch(apiBase() + "/api/auth/me", { credentials: "include" })
      .then(function (res) { return res.ok ? res.json() : null; })
      .then(function (dados) {
        sessaoAtual = dados && dados.autenticado === true ? dados : null;
        return !!sessaoAtual;
      })
      .catch(function () { return false; });
  }

  // Parcelamento no cartão: só onde o servidor permite (Receitas, até 4x).
  var PRODUTOS_PARCELAVEIS = { "receitas-corpopleno": true };
  function atualizarCamposExtras() {
    var metodoEl = document.querySelector('input[name="cp-checkout-method"]:checked');
    var parcelas = el("cp-checkout-installments-wrap");
    if (parcelas) {
      parcelas.hidden = !(metodoEl && metodoEl.value === "CREDIT_CARD" && PRODUTOS_PARCELAVEIS[qs("id") || ""]);
    }
    var buyer = el("cp-checkout-buyer");
    var precisaNome = !(sessaoAtual && sessaoAtual.nome);
    var precisaDoc = !(sessaoAtual && sessaoAtual.temDocumento);
    if (el("cp-checkout-name-wrap")) el("cp-checkout-name-wrap").hidden = !precisaNome;
    if (el("cp-checkout-doc-wrap")) el("cp-checkout-doc-wrap").hidden = !precisaDoc;
    if (buyer) buyer.hidden = !(precisaNome || precisaDoc);
  }

  // Mensagens claras para os códigos de erro reais que
  // customer_auth_routes.js (rota /checkout) já pode devolver — nunca
  // inventa um código novo, só traduz o que o backend já manda.
  function mensagemDeErroCheckout(erro) {
    var mapa = {
      BOOK_PRICE_NOT_CONFIGURED: "book.checkout.error.price_not_configured",
      PAYMENT_METHOD_NOT_ALLOWED: "book.checkout.error.method_not_allowed",
      CHARGE_TYPE_NOT_SUPPORTED_FOR_BOOKS: "book.checkout.error.method_not_allowed",
      AMBIENTE_ASAAS_NAO_CONFIGURADO: "book.checkout.error.provider_unavailable",
      BANCO_NAO_CONFIGURADO: "book.checkout.error.provider_unavailable",
      PAYMENT_PROVIDER_UNAVAILABLE: "book.checkout.error.provider_unavailable",
      PAYMENT_PROVIDER_REJECTED: "book.checkout.error.provider_unavailable",
      CUSTOMER_DOCUMENT_REQUIRED: "book.checkout.error.document_required",
      CUSTOMER_DOCUMENT_INVALID: "book.checkout.error.document_invalid",
      CUSTOMER_NAME_REQUIRED: "book.checkout.error.name_required",
      ALREADY_OWNED: "book.checkout.error.already_owned",
      PAYMENT_ATTEMPT_ALREADY_DISPATCHING: "book.checkout.error.already_processing",
      TERMS_NOT_ACCEPTED: "book.checkout.must_accept_terms",
    };
    var chave = mapa[erro] || "book.checkout.error.generic";
    var fallbacks = {
      "book.checkout.error.price_not_configured": "Este livro ainda não está disponível para compra.",
      "book.checkout.error.method_not_allowed": "Esta forma de pagamento não está disponível para este livro.",
      "book.checkout.error.provider_unavailable": "O pagamento ainda não está disponível. Tente novamente mais tarde.",
      "book.checkout.error.already_processing": "Sua compra já está sendo processada. Aguarde um instante e verifique Meus Livros.",
      "book.checkout.error.document_required": "Informe seu CPF ou CNPJ para emitir a cobrança.",
      "book.checkout.error.document_invalid": "CPF ou CNPJ inválido. Confira os números digitados.",
      "book.checkout.error.name_required": "Informe seu nome completo para emitir a cobrança.",
      "book.checkout.error.already_owned": "Você já tem este conteúdo. Veja em Meus Livros.",
      "book.checkout.must_accept_terms": "É preciso aceitar os Termos de Uso e a Política de Privacidade para continuar.",
      "book.checkout.error.generic": "Não foi possível iniciar a compra agora. Tente novamente em alguns minutos.",
    };
    return t(chave, fallbacks[chave]);
  }

  function resetarPainelCheckout() {
    var erro = el("cp-checkout-error");
    var resultado = el("cp-checkout-result");
    var pix = el("cp-checkout-pix");
    var card = el("cp-checkout-card");
    var metodos = document.querySelector(".checkout-panel__methods");
    var notas = document.querySelector(".checkout-panel__notes");
    var termos = document.querySelector("#cp-checkout-panel .cp-checkbox");
    var confirmBtn = el("cp-checkout-confirm");
    var cancelBtn = el("cp-checkout-cancel");
    if (erro) { erro.hidden = true; erro.textContent = ""; }
    if (resultado) resultado.hidden = true;
    if (pix) pix.hidden = true;
    if (card) card.hidden = true;
    [metodos, notas, termos, confirmBtn, cancelBtn].forEach(function (nodo) {
      if (nodo) nodo.hidden = false;
    });
    if (confirmBtn) confirmBtn.disabled = false;
  }

  function exibirErroCheckout(mensagem) {
    var erro = el("cp-checkout-error");
    if (!erro) return;
    erro.textContent = mensagem;
    erro.hidden = false;
  }

  function exibirResultadoCheckout(dados) {
    ["cp-checkout-terms", "cp-checkout-confirm", "cp-checkout-cancel"].forEach(function (id) {
      var nodo = el(id);
      if (nodo) nodo.hidden = true;
    });
    var metodos = document.querySelector(".checkout-panel__methods");
    var notas = document.querySelector(".checkout-panel__notes");
    if (metodos) metodos.hidden = true;
    if (notas) notas.hidden = true;

    var resultado = el("cp-checkout-result");
    if (resultado) resultado.hidden = false;

    if (dados.paymentMethod === "PIX" && dados.pix) {
      var pixWrap = el("cp-checkout-pix");
      var img = el("cp-checkout-pix-qrcode");
      var payload = el("cp-checkout-pix-payload");
      if (img && dados.pix.encodedImage) img.src = "data:image/png;base64," + dados.pix.encodedImage;
      if (payload) payload.value = dados.pix.payload || "";
      if (pixWrap) pixWrap.hidden = false;
    } else if (dados.invoiceUrl) {
      // Fase Livros 015 -- PIX e cartão são pagos na fatura segura
      // hospedada pelo Asaas (invoiceUrl); nenhum dado de cartão passa
      // pelo site.
      var cardWrap = el("cp-checkout-card");
      var link = el("cp-checkout-card-link");
      if (link) link.href = dados.invoiceUrl;
      if (dados.paymentMethod === "PIX" && cardWrap) {
        var h3 = cardWrap.querySelector("h3");
        var p = cardWrap.querySelector("p");
        if (h3) { h3.removeAttribute("data-i18n"); h3.textContent = t("book.checkout.pix_title", "Pague com PIX"); }
        if (p) { p.removeAttribute("data-i18n"); p.textContent = "Abra a fatura segura para ver o QR Code e o código PIX copia e cola. Seu livro é liberado em Meus Livros assim que o pagamento for confirmado."; }
      }
      if (cardWrap) cardWrap.hidden = false;
    } else {
      // Sucesso no servidor, mas sem dado suficiente para exibir ainda
      // (ex.: PIX ainda sem QR Code disponível neste instante) -- nunca
      // inventa um link/QR Code, só informa para tentar de novo.
      exibirErroCheckout(t("book.checkout.error.processing_incomplete", "Compra iniciada. Atualize esta página em alguns segundos para ver os dados de pagamento."));
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    init();

    var buyBtn = document.getElementById("cp-book-buy");
    var buyStatus = document.getElementById("cp-book-buy-status");
    var checkoutPanel = el("cp-checkout-panel");
    var confirmBtn = el("cp-checkout-confirm");
    var cancelBtn = el("cp-checkout-cancel");
    var termsCheckbox = el("cp-checkout-terms");
    var copyBtn = el("cp-checkout-pix-copy");

    if (buyBtn) {
      buyBtn.addEventListener("click", function () {
        if (window.CP_FUNNEL) {
          window.CP_FUNNEL.trackEvent("book_purchase_attempt", { bookId: qs("id") || "" });
        }
        buyBtn.disabled = true;
        estaLogado().then(function (logado) {
          buyBtn.disabled = false;
          if (!logado) {
            var destino = "login.html?redirect=" + encodeURIComponent("livro.html?id=" + (qs("id") || ""));
            window.location.href = destino;
            return;
          }
          resetarPainelCheckout();
          atualizarCamposExtras();
          buyBtn.hidden = true;
          if (buyStatus) buyStatus.hidden = true;
          if (checkoutPanel) checkoutPanel.hidden = false;
        });
      });
    }

    if (cancelBtn) {
      cancelBtn.addEventListener("click", function () {
        if (checkoutPanel) checkoutPanel.hidden = true;
        if (buyBtn) buyBtn.hidden = false;
        resetarPainelCheckout();
      });
    }

    if (confirmBtn) {
      confirmBtn.addEventListener("click", function () {
        var erroNodo = el("cp-checkout-error");
        if (erroNodo) erroNodo.hidden = true;
        if (!termsCheckbox || !termsCheckbox.checked) {
          exibirErroCheckout(t("book.checkout.must_accept_terms", "É preciso aceitar os Termos de Uso e a Política de Privacidade para continuar."));
          return;
        }
        var metodoEl = document.querySelector('input[name="cp-checkout-method"]:checked');
        var metodo = metodoEl ? metodoEl.value : "PIX";
        var bookId = qs("id") || "";
        var payload = { paymentMethod: metodo, termsAccepted: true };
        var nomeEl = el("cp-checkout-name");
        var docEl = el("cp-checkout-doc");
        var parcelasWrap = el("cp-checkout-installments-wrap");
        if (nomeEl && nomeEl.value.trim()) payload.nomeCompleto = nomeEl.value.trim();
        if (docEl && docEl.value.trim()) payload.cpfCnpj = docEl.value.trim();
        if (parcelasWrap && !parcelasWrap.hidden) {
          payload.installmentCount = Number(el("cp-checkout-installments").value) || 1;
        }

        // Idempotência contra duplo-clique é garantida pelo SERVIDOR
        // (referência determinística, Fase 009.2) -- desabilitar o
        // botão aqui é só uma melhoria de UX, nunca a proteção real.
        confirmBtn.disabled = true;

        fetch(apiBase() + "/api/books/" + encodeURIComponent(bookId) + "/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        })
          .then(function (res) {
            return res.json().then(function (dados) { return { status: res.status, dados: dados || {} }; });
          })
          .then(function (resultado) {
            if (resultado.status !== 201 || !resultado.dados.ok) {
              exibirErroCheckout(mensagemDeErroCheckout(resultado.dados.erro));
              confirmBtn.disabled = false;
              return;
            }
            exibirResultadoCheckout(resultado.dados);
          })
          .catch(function () {
            exibirErroCheckout(t("book.checkout.error.generic", "Não foi possível iniciar a compra agora. Tente novamente em alguns minutos."));
            confirmBtn.disabled = false;
          });
      });
    }

    document.querySelectorAll('input[name="cp-checkout-method"]').forEach(function (radio) {
      radio.addEventListener("change", atualizarCamposExtras);
    });

    if (copyBtn) {
      copyBtn.addEventListener("click", function () {
        var payload = el("cp-checkout-pix-payload");
        if (!payload || !payload.value) return;
        var concluir = function () {
          var original = copyBtn.textContent;
          copyBtn.textContent = t("book.checkout.pix_copied", "Código copiado!");
          setTimeout(function () { copyBtn.textContent = original; }, 2500);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(payload.value).then(concluir).catch(function () {
            payload.select();
          });
        } else {
          payload.select();
          try { document.execCommand("copy"); concluir(); } catch (e) { /* navegador sem suporte -- o texto já está selecionado para copiar manualmente */ }
        }
      });
    }
  });
  window.addEventListener("corpopleno:lang-changed", render);
})();
