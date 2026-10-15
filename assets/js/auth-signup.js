/*
  Fase CorpoPleno Livros 003.2 (2026-10-03) — controlador REAL de
  cadastro.html. Chama POST /api/auth/signup de verdade. Coleta SOMENTE
  nome, e-mail, senha, confirmação de senha e aceite dos termos.
  Fase Livros 015 (2026-10-15): nome completo, e-mail, telefone e senha
  passaram a ser obrigatórios (decisão da Noemi), validados no servidor.
  Nunca dispara cobrança/ASAAS aqui.
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
    if (erro === "EMAIL_JA_CADASTRADO") {
      return t("signup.form.error.email_taken", "Este e-mail já tem uma conta. Tente entrar.");
    }
    if (erro === "EMAIL_INVALIDO") {
      return t("signup.form.error.invalid_email", "Digite um e-mail válido.");
    }
    if (erro === "NOME_INVALIDO") {
      return "Digite seu nome completo (nome e sobrenome).";
    }
    if (erro === "TELEFONE_INVALIDO") {
      return "Digite um telefone válido com DDD.";
    }
    if (erro === "TERMS_NOT_ACCEPTED") {
      return t("signup.form.error.terms_required", "Você precisa aceitar os Termos de Uso e a Política de Privacidade.");
    }
    if (erro === "MUITAS_TENTATIVAS") {
      return "Muitas tentativas seguidas. Aguarde alguns minutos e tente novamente.";
    }
    if (erro === "SENHA_FORA_DO_TAMANHO_PERMITIDO") {
      return t("signup.form.error.password_length", "A senha deve ter entre 8 e 512 caracteres.");
    }
    return t("signup.form.error.generic", "Não foi possível criar sua conta agora. Tente novamente em alguns minutos.");
  }

  // Fase CorpoPleno Livros 011 -- mesmo "voltar para onde eu estava" do
  // login (ver auth-login.js). NUNCA um redirect aberto.
  var REDIRECT_SEGURO_REGEX = /^[a-zA-Z0-9_-]+\.html(\?[^\s#]*)?$/;
  function destinoAposCadastro() {
    var params = new URLSearchParams(window.location.search);
    var redirect = params.get("redirect");
    if (redirect && REDIRECT_SEGURO_REGEX.test(redirect)) {
      return redirect;
    }
    return "minha-area.html";
  }

  document.addEventListener("DOMContentLoaded", function () {
    // Preserva o "voltar para onde eu estava" ao trocar para login.html.
    var paramsAtual = new URLSearchParams(window.location.search);
    var redirectAtual = paramsAtual.get("redirect");
    if (redirectAtual && REDIRECT_SEGURO_REGEX.test(redirectAtual)) {
      var linkLogin = document.querySelector('a[href="login.html"]');
      if (linkLogin) linkLogin.href = "login.html?redirect=" + encodeURIComponent(redirectAtual);
    }

    var form = document.getElementById("cp-signup-form");
    if (!form) return;
    var status = document.getElementById("cp-signup-status");
    var submitBtn = form.querySelector('button[type="submit"]');

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var nome = document.getElementById("cp-signup-name").value.trim();
      var email = document.getElementById("cp-signup-email").value.trim();
      var telefoneEl = document.getElementById("cp-signup-phone");
      var telefone = telefoneEl ? telefoneEl.value.trim() : "";
      var password = document.getElementById("cp-signup-password").value;
      var passwordConfirm = document.getElementById("cp-signup-password-confirm").value;
      var termos = document.getElementById("cp-signup-terms").checked;

      status.hidden = true;

      // Fase Livros 015 -- todos os campos são obrigatórios (validados
      // de novo no servidor, que é quem decide).
      if (!nome || !email || !telefone || !password) {
        status.textContent = "Preencha nome completo, e-mail, telefone e senha.";
        status.hidden = false;
        return;
      }
      if (!termos) {
        status.textContent = t("signup.form.error.terms_required", "Você precisa aceitar os Termos de Uso e a Política de Privacidade.");
        status.hidden = false;
        return;
      }
      if (password !== passwordConfirm) {
        status.textContent = t("signup.form.error.password_mismatch", "As senhas não coincidem.");
        status.hidden = false;
        return;
      }

      if (submitBtn) submitBtn.disabled = true;

      fetch(apiBase() + "/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ nomeCompleto: nome, email: email, telefone: telefone, password: password, termsAccepted: termos }),
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
          window.location.href = destinoAposCadastro();
        })
        .catch(function () {
          status.textContent = t("signup.form.error.generic", "Não foi possível criar sua conta agora. Tente novamente em alguns minutos.");
          status.hidden = false;
          if (submitBtn) submitBtn.disabled = false;
        });
    });
  });
})();
