/*
  Fase CorpoPleno Livros 003.2 (2026-10-03) — controlador REAL de
  login.html. Chama POST /api/auth/login de verdade
  (server/auth/customer_auth_routes.js). Nunca grava senha/token em
  localStorage — a sessão vive inteiramente no cookie HttpOnly
  corpopleno_customer_session, que este script nunca lê nem escreve
  diretamente (quem decide é sempre o servidor via
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
    return window.CP_I18N && typeof window.CP_I18N.t === "function"
      ? window.CP_I18N.t(key, currentLang())
      : fallback || key;
  }

  function mensagemParaErro(erro) {
    if (erro === "CREDENCIAIS_INVALIDAS") {
      return t("login.form.error.invalid_credentials", "E-mail ou senha incorretos.");
    }
    if (erro === "MUITAS_TENTATIVAS") {
      return "Muitas tentativas seguidas. Aguarde 15 minutos e tente novamente.";
    }
    return t("login.form.error.generic", "Não foi possível entrar agora. Tente novamente em alguns minutos.");
  }

  // Fase CorpoPleno Livros 011 -- "voltar para onde eu estava" (ex.: o
  // livro que eu queria comprar) depois do login. NUNCA um redirect
  // aberto: só aceita um caminho relativo deste mesmo site, no formato
  // exato "pagina.html" ou "pagina.html?query" -- qualquer outra coisa
  // (URL absoluta, "//", "javascript:", protocolo) cai no destino padrão
  // de sempre (minha-area.html).
  var REDIRECT_SEGURO_REGEX = /^[a-zA-Z0-9_-]+\.html(\?[^\s#]*)?$/;
  function destinoAposLogin() {
    var params = new URLSearchParams(window.location.search);
    var redirect = params.get("redirect");
    if (redirect && REDIRECT_SEGURO_REGEX.test(redirect)) {
      return redirect;
    }
    return "minha-area.html";
  }

  document.addEventListener("DOMContentLoaded", function () {
    // Preserva o "voltar para onde eu estava" ao trocar para cadastro.html.
    var paramsAtual = new URLSearchParams(window.location.search);
    var redirectAtual = paramsAtual.get("redirect");
    if (redirectAtual && REDIRECT_SEGURO_REGEX.test(redirectAtual)) {
      var linkCadastro = document.querySelector('a[href="cadastro.html"]');
      if (linkCadastro) linkCadastro.href = "cadastro.html?redirect=" + encodeURIComponent(redirectAtual);
    }

    var form = document.getElementById("cp-login-form");
    if (!form) return;
    var status = document.getElementById("cp-login-status");
    var submitBtn = form.querySelector('button[type="submit"]');

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var email = document.getElementById("cp-login-email").value.trim();
      var password = document.getElementById("cp-login-password").value;

      status.hidden = true;
      if (!email || !password) {
        status.textContent = t("login.form.error.missing_fields", "Preencha e-mail e senha.");
        status.hidden = false;
        return;
      }

      if (submitBtn) submitBtn.disabled = true;

      fetch(apiBase() + "/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email: email, password: password }),
      })
        .then(function (res) {
          return res.json().then(function (dados) { return { ok: res.ok, dados: dados }; });
        })
        .then(function (resultado) {
          if (!resultado.ok || !resultado.dados || resultado.dados.ok !== true) {
            status.textContent = mensagemParaErro(resultado.dados && resultado.dados.erro);
            status.hidden = false;
            if (submitBtn) submitBtn.disabled = false;
            return;
          }
          window.location.href = destinoAposLogin();
        })
        .catch(function () {
          status.textContent = t("login.form.error.generic", "Não foi possível entrar agora. Tente novamente em alguns minutos.");
          status.hidden = false;
          if (submitBtn) submitBtn.disabled = false;
        });
    });
  });
})();
