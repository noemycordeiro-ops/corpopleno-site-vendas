/*
  Meus dados (minha-area.html): telefone e troca de e-mail com código.
  Só roda depois que account-home.js confirma a sessão (evento
  cp-account-ready). Erros da API viram chaves account.dados.err.*.
*/
(function () {
  "use strict";

  var CODIGOS_CONHECIDOS = [
    "NAO_AUTENTICADO", "TELEFONE_INVALIDO", "EMAIL_INVALIDO", "MESMO_EMAIL", "SENHA_INCORRETA",
    "EMAIL_EM_USO", "MUITAS_TENTATIVAS", "EMAIL_NAO_CONFIGURADO", "EMAIL_NAO_ENVIADO",
    "CODIGO_INVALIDO", "SINCRONIZACAO_INDISPONIVEL",
  ];

  function apiBase() {
    return typeof window.CP_API_BASE === "string" ? window.CP_API_BASE : "";
  }

  function el(id) { return document.getElementById(id); }

  function t(key) {
    var i18n = window.CP_I18N;
    if (!i18n) return key;
    return i18n.t(key, i18n.currentLang());
  }

  function chamar(metodo, caminho, corpo) {
    var opcoes = { method: metodo, credentials: "include", headers: {} };
    if (corpo) {
      opcoes.headers["Content-Type"] = "application/json";
      opcoes.body = JSON.stringify(corpo);
    }
    return fetch(apiBase() + caminho, opcoes).then(function (res) {
      return res.json().catch(function () { return {}; });
    });
  }

  function mostrar(statusEl, ok, texto) {
    statusEl.className = "notice " + (ok ? "notice-info" : "notice-warning");
    statusEl.textContent = texto;
    statusEl.hidden = false;
  }

  function mensagemDeErro(dados) {
    var codigo = dados && dados.erro;
    return t(CODIGOS_CONHECIDOS.indexOf(codigo) !== -1 ? "account.dados.err." + codigo : "account.dados.err.generic");
  }

  function falhaDeRede(statusEl) {
    mostrar(statusEl, false, t("account.dados.err.generic"));
  }

  function enviando(botao, ocupado) {
    botao.disabled = ocupado;
  }

  function carregar() {
    chamar("GET", "/api/me/dados").then(function (dados) {
      if (!dados || dados.ok !== true) return;
      el("cp-dados-email-atual").textContent = dados.email;
      el("cp-dados-telefone").value = dados.telefone || "";
    }).catch(function () { /* o formulário fica vazio; o restante da página segue normal */ });
  }

  function enviarTelefone(ev) {
    ev.preventDefault();
    var status = el("cp-dados-telefone-status");
    var botao = el("cp-dados-telefone-enviar");
    enviando(botao, true);
    chamar("POST", "/api/me/telefone", { telefone: el("cp-dados-telefone").value })
      .then(function (dados) {
        if (dados && dados.ok === true) {
          el("cp-dados-telefone").value = dados.telefone;
          mostrar(status, true, t("account.dados.saved.phone"));
        } else {
          mostrar(status, false, mensagemDeErro(dados));
        }
      })
      .catch(function () { falhaDeRede(status); })
      .then(function () { enviando(botao, false); });
  }

  function abrirTrocaEmail() {
    el("cp-dados-email-abrir").hidden = true;
    el("cp-dados-email-form").hidden = false;
    el("cp-dados-email-novo").focus();
  }

  function fecharTrocaEmail() {
    el("cp-dados-email-form").reset();
    el("cp-dados-codigo-form").reset();
    el("cp-dados-email-form").hidden = true;
    el("cp-dados-codigo-form").hidden = true;
    el("cp-dados-email-abrir").hidden = false;
  }

  function solicitarCodigo(ev) {
    ev.preventDefault();
    var status = el("cp-dados-email-status");
    var botao = el("cp-dados-email-enviar");
    var novoEmail = el("cp-dados-email-novo").value.trim();
    enviando(botao, true);
    chamar("POST", "/api/me/email/solicitar", {
      novoEmail: novoEmail,
      senha: el("cp-dados-email-senha").value,
    })
      .then(function (dados) {
        if (dados && dados.ok === true) {
          el("cp-dados-email-senha").value = "";
          el("cp-dados-codigo-texto").textContent = t("account.dados.code.sent").replace("{email}", dados.novoEmail);
          el("cp-dados-email-form").hidden = true;
          el("cp-dados-codigo-form").hidden = false;
          el("cp-dados-codigo").focus();
          status.hidden = true;
        } else {
          mostrar(status, false, mensagemDeErro(dados));
        }
      })
      .catch(function () { falhaDeRede(status); })
      .then(function () { enviando(botao, false); });
  }

  function confirmarCodigo(ev) {
    ev.preventDefault();
    var status = el("cp-dados-email-status");
    var botao = el("cp-dados-codigo-enviar");
    enviando(botao, true);
    chamar("POST", "/api/me/email/confirmar", { codigo: el("cp-dados-codigo").value })
      .then(function (dados) {
        if (dados && dados.ok === true) {
          el("cp-dados-email-atual").textContent = dados.email;
          fecharTrocaEmail();
          mostrar(status, true, t("account.dados.saved.email"));
        } else {
          mostrar(status, false, mensagemDeErro(dados));
        }
      })
      .catch(function () { falhaDeRede(status); })
      .then(function () { enviando(botao, false); });
  }

  function cancelarTrocaEmail() {
    el("cp-dados-email-status").hidden = true;
    fecharTrocaEmail();
  }

  function iniciar() {
    el("cp-dados-telefone-form").addEventListener("submit", enviarTelefone);
    el("cp-dados-email-abrir").addEventListener("click", abrirTrocaEmail);
    el("cp-dados-email-form").addEventListener("submit", solicitarCodigo);
    el("cp-dados-codigo-form").addEventListener("submit", confirmarCodigo);
    el("cp-dados-codigo-cancelar").addEventListener("click", cancelarTrocaEmail);
    el("cp-dados-email-cancelar").addEventListener("click", cancelarTrocaEmail);
    el("cp-dados-codigo").addEventListener("input", function () {
      this.value = this.value.replace(/\D/g, "").slice(0, 6);
    });
    carregar();
  }

  document.addEventListener("cp-account-ready", iniciar);
})();
