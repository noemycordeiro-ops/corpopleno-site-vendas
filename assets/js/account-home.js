/*
  Fase CorpoPleno Livros 003.2 (2026-10-03) — controlador REAL de
  minha-area.html. Substitui o redirecionamento incondicional da Fase
  001 por uma checagem real de sessão (GET /api/auth/me). Nunca mostra
  nome interno de sistemas (Cordex/PostgreSQL/ASAAS/agentes/tokens/
  entitlement/admin/test_data) -- só linguagem amigável.
*/
(function () {
  "use strict";

  function apiBase() {
    return typeof window.CP_API_BASE === "string" ? window.CP_API_BASE : "";
  }

  function el(id) { return document.getElementById(id); }

  function mostrarApenas(idVisivel) {
    ["cp-account-loading", "cp-account-redirect", "cp-account-home"].forEach(function (id) {
      var node = el(id);
      if (node) node.hidden = id !== idVisivel;
    });
  }

  function init() {
    mostrarApenas("cp-account-loading");
    fetch(apiBase() + "/api/auth/me", { credentials: "include" })
      .then(function (res) { return res.ok ? res.json() : { autenticado: false }; })
      .then(function (dados) {
        if (!dados || dados.autenticado !== true) {
          mostrarApenas("cp-account-redirect");
          window.location.replace("login.html");
          return;
        }
        mostrarApenas("cp-account-home");
        document.dispatchEvent(new Event("cp-account-ready"));
      })
      .catch(function () {
        mostrarApenas("cp-account-redirect");
        window.location.replace("login.html");
      });
  }

  document.addEventListener("DOMContentLoaded", function () {
    init();
    var logoutBtn = el("cp-account-logout");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", function () {
        logoutBtn.disabled = true;
        fetch(apiBase() + "/api/auth/logout", { method: "POST", credentials: "include" })
          .catch(function () { /* mesmo se a rede falhar, segue para login.html -- nunca trava o usuário aqui */ })
          .then(function () { window.location.href = "login.html"; });
      });
    }
  });
})();
