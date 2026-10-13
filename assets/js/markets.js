/* =========================================================================
   CorpoPleno — configuração central de mercados e moedas
   ---------------------------------------------------------------------
   Este arquivo é a ÚNICA fonte de verdade para: qual mercado corresponde
   a cada idioma, qual moeda esse mercado usa para EXIBIR preços, e qual
   moeda/processador o CHECKOUT desse mercado realmente usa. Nenhum outro
   arquivo deve conter taxa de câmbio, símbolo de moeda ou lógica de
   conversão — tudo passa por aqui.

   IMPORTANTE (regra de honestidade do projeto):
   - O valor de referência (base) de todo produto é sempre em BRL (Brasil).
   - displayCurrency é a moeda mostrada na tela para aquele mercado.
   - checkoutCurrency é a moeda que o processador de pagamento realmente
     cobra — pode ser diferente de displayCurrency, e a interface nunca
     deve confundir uma com a outra.
   - NENHUMA taxa de câmbio é inventada aqui. Enquanto não houver uma
     cotação real cadastrada pela proprietária (campo "rateFromBRL" com
     valor numérico) ou um serviço de câmbio real conectado, qualquer
     tentativa de converter um preço deve mostrar "indisponível" —
     nunca um número calculado a partir de uma taxa inventada.
   ========================================================================= */

(function (global) {
  "use strict";

  /* Mapa idioma → mercado. Cada mercado poderá futuramente ter preço
     próprio, promoção própria, checkout próprio, textos próprios e
     métricas próprias — mas todos compartilham a mesma base de código
     (uma CorpoPleno, configurada por mercado; não cinco sites). */
  var MARKETS = {
    "pt-BR": {
      market: "BR",
      countryName: "Brasil",
      currency: "BRL",
      symbol: "R$",
      isBaseCurrency: true, // BRL é sempre o valor de referência dos produtos
      displayCurrency: "BRL",
      checkoutEnabled: true, // Kiwify/BRL é o caminho fiscal já validado para o Brasil
      checkoutCurrency: "BRL",
      checkoutProvider: "Kiwify",
      checkoutUrl: "PENDENTE", // KIWIFY_CHECKOUT_URL_PENDENTE — falta só a URL por produto
      rateFromBRL: 1
    },
    "pt-PT": {
      market: "PT",
      countryName: "Portugal",
      currency: "EUR",
      symbol: "€",
      isBaseCurrency: false,
      displayCurrency: "EUR",
      // checkoutEnabled=false: a cobrança em EUR ainda não foi validada com
      // um processador apropriado (nem a parte fiscal aplicável). O funil
      // Portugal fica pronto e navegável, mas nenhuma compra real é
      // permitida enquanto isso não for validado — nunca cobrar em BRL
      // apresentando o produto como se fosse cobrado em EUR.
      checkoutEnabled: false,
      checkoutCurrency: "PENDENTE",
      checkoutProvider: "PENDENTE",
      checkoutUrl: "PENDENTE",
      rateFromBRL: null // sem cotação real cadastrada — preço aparece como indisponível
    },
    "en-US": {
      market: "US",
      countryName: "United States",
      currency: "USD",
      symbol: "US$",
      isBaseCurrency: false,
      displayCurrency: "USD",
      checkoutEnabled: false, // nenhum processador validado para USD ainda
      checkoutCurrency: "PENDENTE",
      checkoutProvider: "PENDENTE",
      checkoutUrl: "PENDENTE",
      rateFromBRL: null
    },
    "ko-KR": {
      market: "KR",
      countryName: "대한민국",
      currency: "KRW",
      symbol: "₩",
      isBaseCurrency: false,
      displayCurrency: "KRW",
      checkoutEnabled: false, // nenhum processador validado para KRW ainda
      checkoutCurrency: "PENDENTE",
      checkoutProvider: "PENDENTE",
      checkoutUrl: "PENDENTE",
      rateFromBRL: null
    },
    "es-CL": {
      market: "CL",
      countryName: "Chile",
      currency: "CLP",
      symbol: "$",
      isBaseCurrency: false,
      displayCurrency: "CLP",
      checkoutEnabled: false, // nenhum processador validado para CLP ainda
      checkoutCurrency: "PENDENTE",
      checkoutProvider: "PENDENTE",
      checkoutUrl: "PENDENTE",
      rateFromBRL: null
    }
  };

  function getMarket(lang) {
    return MARKETS[lang] || MARKETS["pt-BR"];
  }

  /* Formata um valor já convertido, sem inventar separadores: usa
     Intl.NumberFormat quando disponível (respeita a convenção de cada
     moeda automaticamente), com um fallback simples se o navegador não
     suportar. */
  function formatAmount(amount, currency, locale) {
    try {
      return new Intl.NumberFormat(locale, { style: "currency", currency: currency }).format(amount);
    } catch (e) {
      return currency + " " + amount.toFixed(2);
    }
  }

  /* Converte um preço-base em BRL para o mercado do idioma informado.
     Retorna { available: true, text: "€ 18,50" } quando existe uma
     cotação real cadastrada, ou { available: false, text: "..." } com um
     aviso honesto quando não existe — NUNCA um valor calculado a partir
     de uma taxa inventada. */
  function convertFromBRL(amountBRL, lang) {
    var m = getMarket(lang);
    if (m.isBaseCurrency) {
      return { available: true, text: formatAmount(amountBRL, m.currency, lang) };
    }
    if (typeof m.rateFromBRL !== "number") {
      return {
        available: false,
        text: global.CP_I18N ? global.CP_I18N.t("common.price_unavailable", lang) : "Preço indisponível neste mercado."
      };
    }
    var converted = amountBRL * m.rateFromBRL;
    return { available: true, text: formatAmount(converted, m.displayCurrency, lang) };
  }

  /* Aplica a conversão a qualquer elemento marcado com
     [data-price-brl="100.00"] na página, no idioma atual — chamado uma
     vez no carregamento e de novo sempre que o idioma mudar (ver evento
     "corpopleno:lang-changed" em i18n.js), sem precisar recarregar a
     página. Hoje nenhuma página usa esse atributo (nenhum produto tem
     preço aprovado ainda) — a função fica pronta para quando existir. */
  function refreshDisplayedPrices(lang) {
    var nodes = document.querySelectorAll("[data-price-brl]");
    for (var i = 0; i < nodes.length; i++) {
      var base = parseFloat(nodes[i].getAttribute("data-price-brl"));
      if (isNaN(base)) continue;
      var result = convertFromBRL(base, lang);
      nodes[i].textContent = result.text;
      nodes[i].classList.toggle("price-unavailable", !result.available);
    }
  }

  global.CP_MARKETS = {
    MARKETS: MARKETS,
    getMarket: getMarket,
    convertFromBRL: convertFromBRL,
    refreshDisplayedPrices: refreshDisplayedPrices
  };

  document.addEventListener("DOMContentLoaded", function () {
    var lang = global.CP_I18N ? global.CP_I18N.currentLang() : "pt-BR";
    refreshDisplayedPrices(lang);
  });

  global.addEventListener("corpopleno:lang-changed", function (event) {
    refreshDisplayedPrices(event.detail.lang);
  });
})(window);
