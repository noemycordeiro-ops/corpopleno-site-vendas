/*
  Fase CorpoPleno Livros 020 (2026-10-16) — exibição de preço por idioma.

  - O preço OFICIAL é sempre em BRL (metadata.json, price.amount) e o
    Asaas cobra sempre em BRL. Nada aqui é enviado ao checkout.
  - pt-BR: "R$ 29,90". Outros idiomas: valor convertido pela cotação de
    GET /api/rates (pt-PT -> EUR, en-US -> USD, ko-KR -> KRW, es-CL -> CLP),
    só símbolo + valor. O valor em R$ que será cobrado aparece no checkout.
  - Sem cotação (falha/rede): mostra o valor em R$.
  - Formatação sempre com Intl.NumberFormat.
*/
(function (global) {
  "use strict";

  var MOEDA = { "pt-BR": "BRL", "pt-PT": "EUR", "en-US": "USD", "ko-KR": "KRW", "es-CL": "CLP" };
  var rates = null;
  var promessa = null;

  function brl(valor) {
    // O valor cobrado é mostrado sempre no formato oficial brasileiro.
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", currencyDisplay: "narrowSymbol" }).format(valor);
  }
  function local(valor, lang) {
    var moeda = MOEDA[lang];
    if (!moeda || moeda === "BRL" || !rates || !rates[moeda]) return null;
    return new Intl.NumberFormat(lang, { style: "currency", currency: moeda, currencyDisplay: "narrowSymbol" }).format(valor * rates[moeda]);
  }

  function carregarCotacao() {
    if (promessa) return promessa;
    try {
      var salvo = JSON.parse(global.sessionStorage.getItem("cp_rates") || "null");
      if (salvo && salvo.t > Date.now() - 6 * 3600 * 1000 && salvo.rates) {
        rates = salvo.rates;
        promessa = Promise.resolve(rates);
        return promessa;
      }
    } catch (e) { /* segue para a rede */ }
    var base = typeof global.CP_API_BASE === "string" ? global.CP_API_BASE : "";
    promessa = fetch(base + "/api/rates")
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (d) {
        if (d && d.ok && d.rates) {
          rates = d.rates;
          try { global.sessionStorage.setItem("cp_rates", JSON.stringify({ t: Date.now(), rates: rates })); } catch (e) { /* sem cache local */ }
          global.dispatchEvent(new CustomEvent("corpopleno:rates-ready"));
        }
        return rates;
      })
      .catch(function () { return null; });
    return promessa;
  }

  /* Preço de exibição: só símbolo + valor no formato do idioma
     (currencyDisplay "narrowSymbol"), ex.: "R$ 29,90", "5,28 €", "$5.92",
     "₩7,953", "$5.833". Sem código de moeda, sem "≈". Sem cotação, mostra
     o valor em R$. O aviso de que a cobrança é em reais aparece SÓ no
     checkout (book-detail.js, #cp-checkout-amount). */
  function formatar(meta, lang) {
    if (!meta || !meta.price || typeof meta.price.amount !== "number") return null;
    return local(meta.price.amount, lang) || brl(meta.price.amount);
  }

  global.CP_PRICE = { formatar: formatar, brl: brl, carregarCotacao: carregarCotacao };
  carregarCotacao();
})(window);
