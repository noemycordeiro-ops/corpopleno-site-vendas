/* =========================================================================
   CorpoPleno — arquitetura do funil de vendas (preparação, sem publicar)
   ---------------------------------------------------------------------
   Este arquivo é a base para, no futuro, um anúncio (Meta/Google/TikTok/
   YouTube) apontar diretamente para o produto certo, com preço no
   mercado certo e checkout correspondente. Hoje ele NÃO:
   - publica nenhum anúncio;
   - acessa nenhuma conta externa;
   - envia nenhum evento para fora deste navegador;
   - permite nenhuma compra real (nenhum checkoutUrl real existe ainda).

   Tudo aqui é honesto sobre o que falta: enquanto não houver checkout
   real configurado por produto/mercado, os botões de compra permanecem
   desativados, exatamente como em produtos.html.
   ========================================================================= */

(function (global) {
  "use strict";

  var UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
  var UTM_STORAGE_KEY = "cp_utm";

  /* =======================================================================
     1) CAPTURA DE UTM (atribuição de campanha, não dado pessoal)
     Lida uma vez por sessão de aba (sessionStorage, não localStorage) a
     partir da própria URL. Se a pessoa chegar pela Home sem parâmetros,
     nada é sobrescrito — a última origem de campanha real continua
     disponível enquanto a aba estiver aberta, para uso em "click_buy" /
     "begin_checkout" / mensagens de contato.
     ======================================================================= */
  function captureUTMs() {
    var params;
    try {
      params = new URLSearchParams(global.location.search);
    } catch (e) {
      return; // navegador muito antigo sem URLSearchParams
    }

    var found = {};
    var hasAny = false;
    UTM_KEYS.forEach(function (key) {
      var value = params.get(key);
      if (value) {
        found[key] = value;
        hasAny = true;
      }
    });

    if (!hasAny) return;

    try {
      global.sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(found));
    } catch (e) {
      /* sessionStorage indisponível — segue sem persistir a origem da campanha */
    }
  }

  function getUTMs() {
    try {
      var raw = global.sessionStorage.getItem(UTM_STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  }

  /* Monta uma URL de campanha para um produto/mercado, só com os
     parâmetros informados explicitamente — nunca inventa utm_source,
     utm_campaign etc. */
  function buildCampaignUrl(baseUrl, utmParams) {
    var url;
    try {
      url = new URL(baseUrl, global.location.origin);
    } catch (e) {
      return baseUrl;
    }
    UTM_KEYS.forEach(function (key) {
      if (utmParams && utmParams[key]) {
        url.searchParams.set(key, utmParams[key]);
      }
    });
    return url.toString();
  }

  /* =======================================================================
     2) EVENTOS DO FUNIL (preparados, não conectados a nenhum serviço)
     Nomes fixos combinados com a proprietária: view_product, click_buy,
     begin_checkout, purchase, lead, contact_support. Cada chamada apenas
     registra o evento localmente (console + fila em memória) — quando um
     serviço real (GA4, Meta Pixel, TikTok Pixel, ou a Central Master via
     Cordex) for conectado, basta substituir o corpo de sendEvent() por
     uma chamada real, sem mudar quem chama trackEvent() em cada página.
     NUNCA inclui CPF, telefone, e-mail ou qualquer dado pessoal — apenas
     identificadores de produto/mercado/campanha e valores monetários.
     ======================================================================= */
  var EVENT_NAMES = [
    "view_product",
    "click_buy",
    "begin_checkout",
    "purchase",
    "lead",
    "contact_support"
  ];

  var eventQueue = [];

  function sendEvent(payload) {
    /* Hoje: só log local, nada sai deste navegador. */
    eventQueue.push(payload);
    if (global.console && typeof global.console.info === "function") {
      global.console.info("[CorpoPleno funil]", payload);
    }
  }

  function trackEvent(name, detail) {
    if (EVENT_NAMES.indexOf(name) === -1) {
      if (global.console && typeof global.console.warn === "function") {
        global.console.warn("[CorpoPleno funil] evento desconhecido ignorado:", name);
      }
      return;
    }
    var payload = {
      event: name,
      timestamp: new Date().toISOString(),
      productId: (detail && detail.productId) || null,
      market: (detail && detail.market) || null,
      locale: (detail && detail.locale) || (global.CP_I18N ? global.CP_I18N.currentLang() : null),
      utm: getUTMs(),
      value: (detail && typeof detail.value === "number") ? detail.value : null,
      currency: (detail && detail.currency) || null
    };
    sendEvent(payload);
  }

  /* =======================================================================
     3) CONFIGURAÇÃO PRODUTO × MERCADO
     Esquema oficial combinado com a proprietária: productId, market,
     locale, displayCurrency, checkoutCurrency, checkoutProvider,
     checkoutUrl. O registro abaixo começa VAZIO de propósito — nenhum
     produto real está aprovado ainda (ver revisão do catálogo em
     RELATORIO_VALIDACAO.md). Quando um produto for aprovado, adicionar
     uma entrada aqui seguindo exatamente o formato do exemplo comentado.

     Exemplo de formato (não é um produto real, apenas ilustra o schema).
     "PENDENTE" (não null) sinaliza "ainda não configurado", seguindo o
     mesmo padrão já usado em todo o site (KIWIFY_CHECKOUT_URL_PENDENTE,
     CORPOPLENO_WHATSAPP_PENDENTE). O mercado só permite compra real
     quando MARKETS[locale].checkoutEnabled === true (ver acima) E os 3
     campos abaixo estiverem preenchidos de verdade — nunca basta um só:
     PRODUCTS["EXEMPLO_ID"] = {
       name: "Nome do produto (exemplo)",
       markets: {
         "pt-BR": { price: 97.00, checkoutCurrency: "BRL",      checkoutProvider: "Kiwify", checkoutUrl: "PENDENTE" },
         "pt-PT": { price: null,  checkoutCurrency: "PENDENTE", checkoutProvider: "PENDENTE", checkoutUrl: "PENDENTE" },
         "en-US": { price: null,  checkoutCurrency: "PENDENTE", checkoutProvider: "PENDENTE", checkoutUrl: "PENDENTE" },
         "ko-KR": { price: null,  checkoutCurrency: "PENDENTE", checkoutProvider: "PENDENTE", checkoutUrl: "PENDENTE" },
         "es-CL": { price: null,  checkoutCurrency: "PENDENTE", checkoutProvider: "PENDENTE", checkoutUrl: "PENDENTE" }
       }
     };
     ======================================================================= */
  var PRODUCTS = {};

  /* "PENDENTE" é o mesmo placeholder honesto usado em todo o site
     (KIWIFY_CHECKOUT_URL_PENDENTE, CORPOPLENO_WHATSAPP_PENDENTE) — uma
     string, não null, mas que NUNCA deve ser tratada como um valor real
     configurado. */
  function isPending(value) {
    return !value || value === "PENDENTE";
  }

  function getProductMarketConfig(productId, locale) {
    var product = PRODUCTS[productId];
    if (!product) return null;
    var marketCfg = product.markets && product.markets[locale];
    if (!marketCfg) return null;
    var marketInfo = global.CP_MARKETS ? global.CP_MARKETS.getMarket(locale) : null;
    return {
      productId: productId,
      name: product.name,
      market: marketInfo ? marketInfo.market : null,
      locale: locale,
      displayCurrency: marketInfo ? marketInfo.displayCurrency : null,
      checkoutEnabled: !!(marketInfo && marketInfo.checkoutEnabled),
      price: typeof marketCfg.price === "number" ? marketCfg.price : null,
      checkoutCurrency: isPending(marketCfg.checkoutCurrency) ? null : marketCfg.checkoutCurrency,
      checkoutProvider: isPending(marketCfg.checkoutProvider) ? null : marketCfg.checkoutProvider,
      checkoutUrl: isPending(marketCfg.checkoutUrl) ? null : marketCfg.checkoutUrl
    };
  }

  /* Único ponto de decisão sobre "pode comprar de verdade": só quando (a)
     o MERCADO tiver checkoutEnabled=true (processador/fiscal validados
     para aquela moeda) E (b) existir checkoutUrl e checkoutCurrency reais
     cadastrados para aquele produto naquele mercado — nunca basta um dos
     dois. "PENDENTE" e null contam igualmente como "ainda não existe".
     Isso impede, por exemplo, oferecer compra em EUR (Portugal) usando o
     checkout em BRL do Brasil por engano. */
  function canCheckout(productId, locale) {
    var cfg = getProductMarketConfig(productId, locale);
    return !!(cfg && cfg.checkoutEnabled && cfg.checkoutUrl && cfg.checkoutCurrency);
  }

  global.CP_FUNNEL = {
    UTM_KEYS: UTM_KEYS,
    EVENT_NAMES: EVENT_NAMES,
    captureUTMs: captureUTMs,
    getUTMs: getUTMs,
    buildCampaignUrl: buildCampaignUrl,
    trackEvent: trackEvent,
    PRODUCTS: PRODUCTS,
    getProductMarketConfig: getProductMarketConfig,
    canCheckout: canCheckout
  };
})(window);
