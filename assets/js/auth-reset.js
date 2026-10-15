/*
  Fase Livros 015 (2026-10-15) — recuperação de senha.
  esqueci-senha.html  -> POST /api/auth/password-reset/request {email}
  redefinir-senha.html -> POST /api/auth/password-reset/confirm {token, password}

  O token chega no FRAGMENTO da URL (#token=...), que o navegador nunca
  envia ao servidor. Este script é carregado ANTES dos outros: lê o token
  e o apaga da barra de endereço na hora (history.replaceState), para ele
  não ficar no histórico nem ser lido por outro script.
*/
(function () {
  "use strict";

  var tokenDaUrl = null;
  var m = /(?:^#|&)token=([A-Za-z0-9_-]+)/.exec(window.location.hash || "");
  if (m) {
    tokenDaUrl = m[1];
    try {
      history.replaceState(null, "", window.location.pathname + window.location.search);
    } catch (e) { /* navegador antigo -- segue mesmo assim */ }
  }

  function apiBase() {
    return typeof window.CP_API_BASE === "string" ? window.CP_API_BASE : "";
  }

  function post(path, dados) {
    return fetch(apiBase() + path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(dados),
    }).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (corpo) {
        return { status: res.status, corpo: corpo || {} };
      });
    });
  }

  function mostrar(status, texto) {
    status.textContent = texto;
    status.hidden = false;
  }

  document.addEventListener("DOMContentLoaded", function () {
    var status = document.getElementById("cp-reset-status");

    var pedido = document.getElementById("cp-reset-request-form");
    if (pedido) {
      pedido.addEventListener("submit", function (ev) {
        ev.preventDefault();
        var email = document.getElementById("cp-reset-email").value.trim();
        if (!email) return mostrar(status, "Informe o e-mail da sua conta.");
        var botao = pedido.querySelector('button[type="submit"]');
        botao.disabled = true;
        post("/api/auth/password-reset/request", { email: email })
          .then(function (r) {
            if (r.status === 200) {
              mostrar(status, "Se este e-mail estiver cadastrado, você vai receber um link para criar uma nova senha. O link vale por 60 minutos. Confira também a caixa de spam.");
            } else if (r.corpo.erro === "EMAIL_INVALIDO") {
              mostrar(status, "Digite um e-mail válido.");
              botao.disabled = false;
            } else if (r.corpo.erro === "MUITAS_TENTATIVAS") {
              mostrar(status, "Muitos pedidos seguidos. Aguarde um pouco e tente novamente.");
              botao.disabled = false;
            } else {
              mostrar(status, "Não foi possível enviar agora. Tente novamente em alguns minutos.");
              botao.disabled = false;
            }
          })
          .catch(function () {
            mostrar(status, "Não foi possível enviar agora. Tente novamente em alguns minutos.");
            botao.disabled = false;
          });
      });
    }

    var confirmar = document.getElementById("cp-reset-confirm-form");
    if (confirmar) {
      if (!tokenDaUrl) {
        mostrar(status, "Link inválido ou incompleto. Peça um novo link em \"Esqueci minha senha\".");
      }
      confirmar.addEventListener("submit", function (ev) {
        ev.preventDefault();
        var senha = document.getElementById("cp-reset-password").value;
        var conf = document.getElementById("cp-reset-password-confirm").value;
        if (!tokenDaUrl) return mostrar(status, "Link inválido ou incompleto. Peça um novo link em \"Esqueci minha senha\".");
        if (senha.length < 8) return mostrar(status, "A senha deve ter pelo menos 8 caracteres.");
        if (senha !== conf) return mostrar(status, "As senhas não coincidem.");
        var botao = confirmar.querySelector('button[type="submit"]');
        botao.disabled = true;
        post("/api/auth/password-reset/confirm", { token: tokenDaUrl, password: senha })
          .then(function (r) {
            if (r.status === 200 && r.corpo.ok) {
              tokenDaUrl = null;
              mostrar(status, "Senha alterada! Redirecionando para Entrar…");
              setTimeout(function () { window.location.href = "login.html"; }, 1500);
            } else if (r.corpo.erro === "TOKEN_INVALIDO_OU_EXPIRADO") {
              mostrar(status, "Este link expirou ou já foi usado. Peça um novo em \"Esqueci minha senha\".");
            } else if (r.corpo.erro === "SENHA_FORA_DO_TAMANHO_PERMITIDO") {
              mostrar(status, "A senha deve ter entre 8 e 512 caracteres.");
              botao.disabled = false;
            } else {
              mostrar(status, "Não foi possível alterar a senha agora. Tente novamente em alguns minutos.");
              botao.disabled = false;
            }
          })
          .catch(function () {
            mostrar(status, "Não foi possível alterar a senha agora. Tente novamente em alguns minutos.");
            botao.disabled = false;
          });
      });
    }
  });
})();
