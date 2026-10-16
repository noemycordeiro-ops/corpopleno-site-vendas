/* =========================================================================
   CorpoPleno — interações leves do site público (sem dependências externas)
   ========================================================================= */

(function () {
  "use strict";

  function setupNavToggle() {
    var toggle = document.getElementById("cp-nav-toggle");
    var nav = document.getElementById("cp-main-nav");
    if (!toggle || !nav) return;

    toggle.addEventListener("click", function () {
      var isOpen = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        nav.classList.remove("is-open");
        toggle.setAttribute("aria-expanded", "false");
      });
    });
  }

  function setupFilters() {
    var bar = document.querySelector("[data-filter-bar]");
    if (!bar) return;

    var chips = Array.prototype.slice.call(bar.querySelectorAll(".filter-chip"));
    var items = Array.prototype.slice.call(document.querySelectorAll("[data-category]"));

    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (c) {
          c.setAttribute("aria-pressed", "false");
        });
        chip.setAttribute("aria-pressed", "true");

        var target = chip.getAttribute("data-filter");
        items.forEach(function (item) {
          var cats = (item.getAttribute("data-category") || "").split(" ");
          var show = target === "all" || cats.indexOf(target) !== -1;
          item.style.display = show ? "" : "none";
        });
      });
    });

    // Fase Livros 016 -- "Voltar aos livros" (livro.html) chega com
    // #livros: já abre a aba Livros e rola até a seção de livros.
    if (window.location.hash === "#livros") {
      var chipLivros = bar.querySelector('.filter-chip[data-filter="livros"]');
      if (chipLivros) chipLivros.click();
      var secao = document.getElementById("cp-books-section");
      if (secao && secao.scrollIntoView) secao.scrollIntoView();
    }
  }

  function setupYear() {
    var el = document.getElementById("cp-year");
    if (el) {
      el.textContent = String(new Date().getFullYear());
    }
  }

  /* =======================================================================
     CONFIGURAÇÃO ÚNICA DO WHATSAPP CORPOPLENO
     Altere APENAS o valor de "numero" abaixo se o número oficial da
     CorpoPleno mudar (formato E.164 sem símbolos, ex.: "5511999999999").
     Nenhum outro arquivo precisa ser tocado: o botão flutuante, o rodapé e o
     cartão de Atendimento leem todos daqui. A mensagem inicial não fica
     fixa em português: vem de "whatsapp.initial_message" no i18n.js,
     seguindo sempre o idioma atual do site — nunca hardcoded aqui, para
     nunca divergir da tradução oficial de cada idioma.
     ======================================================================= */
  var CP_WHATSAPP = {
    // WhatsApp Business CorpoPleno real (não é mais um placeholder).
    numero: "5511999356501",
    // Formato de exibição pública — mesmo dado objetivo em todos os 5
    // idiomas (nunca traduzido, só o rótulo "WhatsApp" ao lado é que já
    // vem localizado por "footer.contact.whatsapp_label").
    numeroExibicao: "+55 11 99935-6501"
  };

  function cpWhatsappMensagemInicial() {
    return currentLangText(
      "whatsapp.initial_message",
      "Olá! Vim pelo site da CorpoPleno e gostaria de atendimento."
    );
  }

  function cpWhatsappLink() {
    if (!CP_WHATSAPP.numero) return null;
    return "https://wa.me/" + CP_WHATSAPP.numero + "?text=" + encodeURIComponent(cpWhatsappMensagemInicial());
  }

  function setupWhatsappFloat() {
    var floatBtn = document.getElementById("cp-whatsapp-float");

    if (floatBtn) {
      floatBtn.addEventListener("click", function () {
        /* Recalculado a cada clique (nunca capturado uma vez só) para que
           a mensagem inicial sempre acompanhe o idioma ATUAL do site,
           mesmo que a pessoa tenha trocado de idioma depois de a página
           carregar — nunca mistura pt-BR/pt-PT/en-US/ko-KR/es-CL. */
        var link = cpWhatsappLink();
        if (link) {
          window.open(link, "_blank", "noopener,noreferrer");
        }
      });
    }

    function refreshWhatsappUI() {
      var link = cpWhatsappLink();

      if (floatBtn) {
        /* Sem número real configurado: o botão fica pronto no código, mas
           oculto visualmente — não deve parecer funcional ao cliente antes
           de existir um número de verdade. */
        floatBtn.hidden = !link;
      }

      /* Reflete no rodapé de todas as páginas: "WhatsApp: +55 11 99935-6501",
         número inteiro clicável, abrindo o link real (com a mensagem
         inicial no idioma atual) — ajuste aprovado em 2026-09-21. */
      document.querySelectorAll("[data-whatsapp-status]").forEach(function (el) {
        if (!link) return;
        var label = CP_WHATSAPP.numeroExibicao;
        if (el.tagName === "A") {
          el.href = link;
          el.textContent = label;
        } else {
          var a = document.createElement("a");
          a.href = link;
          a.target = "_blank";
          a.rel = "noopener noreferrer";
          a.setAttribute("data-whatsapp-status", "");
          a.textContent = label;
          el.replaceWith(a);
        }
      });
    }

    refreshWhatsappUI();
    /* Idioma pode mudar sem recarregar a página (ver i18n.js) — o link e o
       texto do rodapé precisam acompanhar, nunca ficar presos ao idioma
       de quando a página abriu. */
    window.addEventListener("corpopleno:lang-changed", refreshWhatsappUI);
  }

  /* =======================================================================
     BLOQUEIO LEVE DE SELEÇÃO/CÓPIA (obstáculo, não segurança real)
     Restrito ao conteúdo principal (#conteudo-principal) — o rodapé e
     qualquer elemento marcado com a classe "allow-select" (e-mail/WhatsApp
     de contato) continuam funcionando normalmente: selecionáveis, com menu
     de botão direito e copiáveis. Não impede ver o código-fonte, desativar
     JavaScript, usar ferramentas de desenvolvedor, nem captura de tela —
     isso é tecnicamente impossível para qualquer site. Ver README.
     ======================================================================= */
  function setupNoCopyMain() {
    var main = document.getElementById("conteudo-principal");
    if (!main) return;

    function isAllowed(target) {
      return !!(target && target.closest && target.closest(".allow-select"));
    }

    ["contextmenu", "copy", "cut", "selectstart", "dragstart"].forEach(function (evtName) {
      main.addEventListener(evtName, function (event) {
        if (!isAllowed(event.target)) {
          event.preventDefault();
        }
      });
    });
  }

  /* Fase CorpoPleno Livros 003.2 (2026-10-03) — sessão REAL. Pergunta a
     GET /api/auth/me (nunca localStorage/cookie lido diretamente aqui —
     o cookie HttpOnly corpopleno_customer_session é invisível a este
     JS por desenho; quem decide é sempre o servidor) e troca o botão
     entre "Entrar"/login.html e "Minha área"/minha-area.html conforme a
     resposta real. Falha de rede/CORS -> trata como não autenticado
     (fail-closed visualmente: nunca mostra "Minha área" por engano). */
  function setupMinhaArea() {
    var btn = document.getElementById("cp-minha-area");
    if (!btn) return;
    var apiBase = typeof window.CP_API_BASE === "string" ? window.CP_API_BASE : "";

    btn.addEventListener("click", function (event) {
      event.preventDefault();
      window.location.href = btn.getAttribute("data-cp-autenticado") === "1" ? "minha-area.html" : "login.html";
    });

    fetch(apiBase + "/api/auth/me", { credentials: "include" })
      .then(function (res) { return res.ok ? res.json() : { autenticado: false }; })
      .then(function (dados) {
        var autenticado = !!(dados && dados.autenticado === true);
        btn.setAttribute("data-cp-autenticado", autenticado ? "1" : "0");
        var chave = autenticado ? "nav.account" : "nav.login";
        var fallback = autenticado ? "Minha área" : "Entrar";
        btn.setAttribute("data-i18n", chave);
        btn.textContent = currentLangText(chave, fallback);
      })
      .catch(function () {
        btn.setAttribute("data-cp-autenticado", "0");
      });
  }

  function currentLangText(key, fallback) {
    if (window.CP_I18N && typeof window.CP_I18N.t === "function") {
      var lang = window.CP_I18N.currentLang ? window.CP_I18N.currentLang() : "pt-BR";
      return window.CP_I18N.t(key, lang);
    }
    return fallback;
  }

  /* =======================================================================
     FORMULÁRIO ÚNICO DE ATENDIMENTO
     Um único campo de mensagem, sem categorias públicas (reclamação,
     cancelamento etc. são classificados internamente, não escolhidos pelo
     cliente). O botão ENVIAR NÃO abre e-mail nem qualquer app externo, e
     NÃO grava nada em localStorage — nenhum dado sai do campo de texto
     enquanto não houver uma conexão segura real com a Central de
     Atendimento. Por enquanto, ele só mostra um aviso honesto de que o
     envio direto ainda está sendo preparado.
     ======================================================================= */
  function setupContactForm() {
    var button = document.getElementById("cp-contact-send");
    var textarea = document.getElementById("cp-contact-message");
    var status = document.getElementById("cp-contact-status");
    if (!button || !textarea || !status) return;

    button.addEventListener("click", function () {
      if (!textarea.value.trim()) {
        textarea.focus();
        return;
      }
      var message = currentLangText("support.form.pending", "");
      if (cpWhatsappLink()) {
        message += " " + currentLangText("support.form.pending_whatsapp", "");
      }
      status.textContent = message;
      status.hidden = false;

      /* Evento do funil (preparação — não envia nada para fora do
         navegador; ver assets/js/funnel.js). Nenhum dado do campo de
         texto entra no evento, só o registro de que houve um contato. */
      if (window.CP_FUNNEL) {
        window.CP_FUNNEL.trackEvent("contact_support", {});
      }
    });
  }

  /* =======================================================================
     LOGIN / CADASTRO (login.html, cadastro.html)
     Estrutura visual real, mas SEM autenticação de verdade ainda: o
     formulário nunca lê o valor de e-mail/senha em JS, nunca grava nada em
     localStorage, nunca faz fetch/POST para lugar nenhum. Ao tentar
     enviar, só mostra um aviso honesto de que o acesso seguro está sendo
     preparado — mesmo padrão já usado no formulário de Atendimento acima.
     Quando o backend seguro existir, é aqui que a chamada real de
     login/cadastro deve ser conectada. ======================================================================= */
  function setupAuthForm(formId, statusId, eventName) {
    var form = document.getElementById(formId);
    var status = document.getElementById(statusId);
    if (!form || !status) return;
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      status.textContent = currentLangText("auth.form.pending", "");
      status.hidden = false;
      if (window.CP_FUNNEL) {
        window.CP_FUNNEL.trackEvent(eventName, {});
      }
    });
  }

  function setupForgotPassword() {
    var link = document.getElementById("cp-login-forgot");
    var status = document.getElementById("cp-login-status");
    if (!link || !status) return;
    link.addEventListener("click", function (event) {
      event.preventDefault();
      status.textContent = currentLangText("auth.form.pending", "");
      status.hidden = false;
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    setupNavToggle();
    setupFilters();
    setupYear();
    setupWhatsappFloat();
    setupMinhaArea();
    setupContactForm();
    setupAuthForm("cp-login-form", "cp-login-status", "login_attempt");
    setupAuthForm("cp-signup-form", "cp-signup-status", "signup_attempt");
    setupForgotPassword();
    setupNoCopyMain();

    /* Captura utm_source/utm_medium/utm_campaign/utm_content/utm_term da
       URL (se a pessoa chegou por um anúncio), em qualquer página do
       site — preparação do funil de vendas, ver assets/js/funnel.js.
       Não envia nada para fora do navegador. */
    if (window.CP_FUNNEL) {
      window.CP_FUNNEL.captureUTMs();
    }
  });
})();
