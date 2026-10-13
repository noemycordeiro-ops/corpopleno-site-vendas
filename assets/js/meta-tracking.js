/* =========================================================================
   CorpoPleno — Meta Pixel (navegador) + preparo de deduplicação com a
   futura Conversions API (CAPI)
   ---------------------------------------------------------------------
   Fase Meta Pixel 001 (2026-10-07) — PRIMEIRA implementação real de
   qualquer rastreamento Meta neste site (auditoria prévia confirmou:
   nenhum outro arquivo carrega fbq()/connect.facebook.net antes desta
   fase).

   REGRAS DESTA FASE (não violar sem nova autorização explícita):
   - O Pixel só é carregado se /api/public-config (ver server/public_config.js
     no Cordex) devolver um metaPixelId real. Nenhum ID fica hardcoded
     aqui -- um Pixel ID não é segredo (pode ir ao navegador por desenho
     da própria Meta), mas a fonte de verdade de "existe ou não" continua
     sendo o servidor, nunca este arquivo.
   - Ausência de configuração (Cordex fora do ar, rede falhando, variável
     não configurada) NUNCA quebra o restante do site -- apenas o Pixel
     fica desativado silenciosamente.
   - PageView é disparado automaticamente quando o Pixel carrega.
   - Purchase NUNCA é disparado por este arquivo sozinho -- só quando
     outra página (ex. meus-livros.html via books-account.js) chama
     window.CP_META.trackPurchase(...) com dados JÁ confirmados pelo
     servidor (GET /api/books/:bookId/purchase-confirmation), nunca no
     clique de "Comprar" nem em qualquer estado PENDING.
   - Deduplicação: cada eventId só dispara fbq('track','Purchase',...)
     uma única vez por navegador (localStorage) -- protege contra reload
     da página e contra visitas repetidas à mesma tela depois da compra.
     O eventId (gerado pelo servidor, estável por compra) é o mesmo
     identificador que uma futura Conversions API deverá reusar via
     'eventID' (Pixel) / 'event_id' (CAPI) para a Meta deduplicar os dois
     canais -- ver developers.facebook.com/docs/marketing-api/conversions-api/
     deduplicate-pixel-and-server-events (consultado em 2026-10-07).
   - Nunca envia CPF/CNPJ/e-mail/senha/token/conteúdo do livro -- apenas
     value (number), currency (string) e eventId (string opaca, sem PII).
   ========================================================================= */
(function (global) {
  "use strict";

  var SENT_EVENTS_STORAGE_KEY = "cp_meta_purchase_sent_v1";
  var MAX_EVENTOS_GUARDADOS = 200;

  function apiBase() {
    return typeof global.CP_API_BASE === "string" ? global.CP_API_BASE : "";
  }

  function lerEventosJaEnviados() {
    try {
      var raw = global.localStorage.getItem(SENT_EVENTS_STORAGE_KEY);
      var parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      // localStorage indisponível (modo privado, bloqueio de site data,
      // etc.) -- trata como "nunca enviado antes" nesta sessão; o pior
      // caso é reenviar o mesmo eventID, que a própria Meta já deduplica
      // do lado dela (event_id/eventID) dentro da janela de 48h.
      return [];
    }
  }

  function marcarEventoComoEnviado(eventId) {
    try {
      var atuais = lerEventosJaEnviados();
      if (atuais.indexOf(eventId) === -1) {
        atuais.push(eventId);
        if (atuais.length > MAX_EVENTOS_GUARDADOS) {
          atuais = atuais.slice(atuais.length - MAX_EVENTOS_GUARDADOS);
        }
        global.localStorage.setItem(SENT_EVENTS_STORAGE_KEY, JSON.stringify(atuais));
      }
    } catch (e) {
      /* Sem persistência de deduplicação local disponível -- a chamada
         que já disparou o evento não é desfeita por causa disso. */
    }
  }

  function jaEnviadoNesteNavegador(eventId) {
    return lerEventosJaEnviados().indexOf(eventId) !== -1;
  }

  var pixelPronto = false;

  // Código-base OFICIAL do Meta Pixel (developers.facebook.com/documentation/
  // meta-pixel/get-started, confirmado em 2026-10-07): carrega fbevents.js
  // de forma assíncrona e define o stub fbq() antes do script real
  // terminar de carregar -- chamadas feitas antes do carregamento completo
  // ficam enfileiradas (n.queue), nunca se perdem.
  function carregarBasePixel(pixelId) {
    if (global.fbq) {
      global.fbq("init", pixelId);
      global.fbq("track", "PageView");
      pixelPronto = true;
      return;
    }
    (function (f, b, e, v) {
      var n, t, s;
      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = true;
      n.version = "2.0";
      n.queue = [];
      t = b.createElement(e);
      t.async = true;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(global, document, "script", "https://connect.facebook.net/en_US/fbevents.js");

    global.fbq("init", pixelId);
    global.fbq("track", "PageView");
    pixelPronto = true;
  }

  // Chamada SOMENTE por outra página (ex. books-account.js em
  // meus-livros.html), nunca por este arquivo sozinho. `detalhe` deve
  // vir EXATAMENTE do retorno de GET /api/books/:bookId/purchase-confirmation
  // -- nunca de um valor calculado no navegador.
  function trackPurchase(detalhe) {
    if (!pixelPronto || typeof global.fbq !== "function") return; // Pixel ausente/desativado -- nunca quebra o chamador.
    if (!detalhe || typeof detalhe.eventId !== "string" || !detalhe.eventId) return;
    if (typeof detalhe.value !== "number" || !isFinite(detalhe.value) || detalhe.value < 0) return;
    if (typeof detalhe.currency !== "string" || !detalhe.currency) return;
    if (jaEnviadoNesteNavegador(detalhe.eventId)) return; // já disparado antes (reload ou nova visita) -- nunca duplica.

    try {
      global.fbq(
        "track",
        "Purchase",
        { value: detalhe.value, currency: detalhe.currency },
        { eventID: detalhe.eventId }
      );
      marcarEventoComoEnviado(detalhe.eventId);
    } catch (e) {
      /* Qualquer falha ao disparar o Pixel nunca pode quebrar o restante
         da página que chamou trackPurchase(). */
    }
  }

  function init() {
    var url = apiBase() + "/api/public-config";
    fetch(url)
      .then(function (res) {
        return res && res.ok ? res.json() : null;
      })
      .then(function (cfg) {
        var pixelId = cfg && typeof cfg.metaPixelId === "string" ? cfg.metaPixelId.trim() : "";
        if (pixelId) {
          carregarBasePixel(pixelId);
        }
      })
      .catch(function () {
        /* /api/public-config indisponível (Cordex fora do ar, rede, CORS
           etc.) -- o site continua funcionando normalmente, só sem o
           Pixel carregado. Nunca lança, nunca aparece como erro visível. */
      });
  }

  global.CP_META = {
    trackPurchase: trackPurchase,
    // Exposto só para diagnóstico manual/console -- nunca usado para
    // decidir nada de negócio fora deste arquivo.
    _pixelPronto: function () {
      return pixelPronto;
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(window);
