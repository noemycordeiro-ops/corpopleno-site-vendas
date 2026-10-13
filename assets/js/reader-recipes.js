/*
  Fase CorpoPleno Livros 012 -- busca e favoritos do Livro de Receitas,
  100% client-side (localStorage), zero chamada de rede nova e zero
  dependência de backend/banco -- consistente com a arquitetura real
  confirmada (Cordex não tem hoje nenhuma capacidade de busca/favoritos
  nem progresso de leitura persistido; tudo client-side já).

  Separado de reader.js de propósito: reader.js é o leitor GENÉRICO
  (qualquer livro), nunca deve saber o que é uma "receita" -- este arquivo
  reage ao evento aditivo "cp-reader-page-rendered" e à API pública
  mínima window.CP_READER, sem modificar o leitor genérico. Livro de
  novela: este arquivo roda, não encontra nenhuma página RECIPE, não faz
  nada (custo zero).
*/
(function () {
  "use strict";

  var STORAGE_PREFIX = "cp_reader_recipes_";
  var indiceReceitas = null; // [{recipeId, variantId, title, pageIndex}]
  var bookIdAtual = null;
  var ativado = false;

  function t(key, fallback, vars) {
    var str = window.CP_I18N && typeof window.CP_I18N.t === "function"
      ? window.CP_I18N.t(key, window.CP_I18N.currentLang())
      : (fallback || key);
    if (vars) {
      Object.keys(vars).forEach(function (k) {
        str = str.split("{" + k + "}").join(String(vars[k]));
      });
    }
    return str;
  }

  function normalizar(texto) {
    return (texto || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "");
  }

  function construirIndice(pages) {
    var indice = [];
    pages.forEach(function (pagina, i) {
      var meta = pagina.meta;
      if (meta && meta.type === "RECIPE") {
        var headingBlock = pagina.blocks.filter(function (b) { return b.type === "heading"; })[0];
        indice.push({
          recipeId: meta.recipeId,
          variantId: meta.variantId,
          title: headingBlock ? headingBlock.text : meta.recipeId,
          pageIndex: i,
        });
      }
    });
    return indice;
  }

  function favoritosStorageKey() {
    return STORAGE_PREFIX + bookIdAtual + "_favoritos";
  }
  function carregarFavoritos() {
    try {
      var raw = window.localStorage.getItem(favoritosStorageKey());
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }
  function salvarFavoritos(lista) {
    try {
      window.localStorage.setItem(favoritosStorageKey(), JSON.stringify(lista));
    } catch (e) {
      /* localStorage indisponível -- segue sem persistir, nunca quebra a leitura */
    }
  }
  function ehFavorito(variantId) {
    return carregarFavoritos().some(function (f) { return f.variantId === variantId; });
  }
  function alternarFavorito(recipeId, variantId) {
    var lista = carregarFavoritos();
    var idx = lista.findIndex(function (f) { return f.variantId === variantId; });
    if (idx >= 0) {
      lista.splice(idx, 1);
    } else {
      lista.push({ recipeId: recipeId, variantId: variantId });
    }
    salvarFavoritos(lista);
    return idx < 0; // true se acabou de favoritar
  }

  function expandirTermoBusca(termo) {
    var lang = (window.CP_I18N && window.CP_I18N.currentLang()) || "pt-BR";
    var dicionario = (window.CP_RECIPE_SEARCH_SYNONYMS && window.CP_RECIPE_SEARCH_SYNONYMS[lang]) || {};
    var termoNorm = normalizar(termo);
    var termos = [termoNorm];
    Object.keys(dicionario).forEach(function (sinonimo) {
      if (normalizar(sinonimo) === termoNorm) {
        termos.push(normalizar(dicionario[sinonimo]));
      }
    });
    return termos;
  }

  function renderizarResultados(container, itens, emptyEl) {
    container.innerHTML = "";
    if (emptyEl) emptyEl.hidden = itens.length > 0;
    itens.forEach(function (item) {
      var li = document.createElement("li");
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "reader-search-result";
      btn.textContent = item.title;
      btn.addEventListener("click", function () {
        window.CP_READER.goToPage(item.pageIndex);
        fecharPaineis();
      });
      li.appendChild(btn);
      container.appendChild(li);
    });
  }

  function executarBusca() {
    var input = document.getElementById("cp-reader-search-input");
    var resultsEl = document.getElementById("cp-reader-search-results");
    if (!input || !resultsEl || !indiceReceitas) return;
    var consulta = input.value.trim();
    if (!consulta) {
      renderizarResultados(resultsEl, []);
      return;
    }
    var termosBusca = expandirTermoBusca(consulta);
    var encontrados = indiceReceitas.filter(function (item) {
      var tituloNorm = normalizar(item.title);
      return termosBusca.some(function (termo) { return tituloNorm.indexOf(termo) !== -1; });
    });
    renderizarResultados(resultsEl, encontrados.slice(0, 50));
  }

  function atualizarPainelFavoritos() {
    var resultsEl = document.getElementById("cp-reader-favorites-results");
    var emptyEl = document.getElementById("cp-reader-favorites-empty");
    if (!resultsEl || !indiceReceitas) return;
    var favoritos = carregarFavoritos();
    var itens = favoritos
      .map(function (f) {
        return indiceReceitas.filter(function (i) { return i.variantId === f.variantId; })[0];
      })
      .filter(Boolean);
    renderizarResultados(resultsEl, itens, emptyEl);
  }

  function fecharPaineis() {
    [["cp-reader-search-panel", "cp-reader-search-btn"], ["cp-reader-favorites-panel", "cp-reader-favorites-btn"]].forEach(function (par) {
      var painel = document.getElementById(par[0]);
      var btn = document.getElementById(par[1]);
      if (painel) painel.hidden = true;
      if (btn) btn.setAttribute("aria-expanded", "false");
    });
  }

  function alternarPainel(painelId, btnId) {
    var painel = document.getElementById(painelId);
    var btn = document.getElementById(btnId);
    var abrir = painel.hidden;
    fecharPaineis();
    painel.hidden = !abrir;
    btn.setAttribute("aria-expanded", String(abrir));
    if (abrir && painelId === "cp-reader-favorites-panel") atualizarPainelFavoritos();
    if (abrir && painelId === "cp-reader-search-panel") document.getElementById("cp-reader-search-input").focus();
  }

  function ativarUiSeNecessario() {
    if (ativado) return;
    ativado = true;
    document.getElementById("cp-reader-search-btn").hidden = false;
    document.getElementById("cp-reader-favorites-btn").hidden = false;

    document.getElementById("cp-reader-search-btn").addEventListener("click", function () {
      alternarPainel("cp-reader-search-panel", "cp-reader-search-btn");
    });
    document.getElementById("cp-reader-favorites-btn").addEventListener("click", function () {
      alternarPainel("cp-reader-favorites-panel", "cp-reader-favorites-btn");
    });
    document.getElementById("cp-reader-search-input").addEventListener("input", executarBusca);

    document.addEventListener("click", function (e) {
      var dentroSearch = document.getElementById("cp-reader-search-panel").contains(e.target);
      var dentroFav = document.getElementById("cp-reader-favorites-panel").contains(e.target);
      // e.target pode ser o <span> do ícone DENTRO do botão (clique não
      // muda o alvo do evento para o ancestral) -- usar closest() em vez de
      // comparar id direto, senão o próprio clique que ABRE o painel é
      // tratado como "clique fora" e fecha o painel imediatamente (achado
      // real, confirmado com teste de navegador real).
      var eBotao = !!(e.target.closest && e.target.closest("#cp-reader-search-btn, #cp-reader-favorites-btn"));
      if (!dentroSearch && !dentroFav && !eBotao) fecharPaineis();
    });

    document.getElementById("cp-reader-favorite-toggle").addEventListener("click", function (e) {
      var btn = e.currentTarget;
      var recipeId = btn.getAttribute("data-recipe-id");
      var variantId = btn.getAttribute("data-variant-id");
      if (!variantId) return;
      var favoritado = alternarFavorito(recipeId, variantId);
      atualizarBotaoFavorito(btn, favoritado);
    });
  }

  function atualizarBotaoFavorito(btn, favoritado) {
    btn.setAttribute("aria-pressed", String(favoritado));
    btn.querySelector("span[aria-hidden]").textContent = favoritado ? "★" : "☆";
    btn.querySelector("span:not([aria-hidden])").textContent = favoritado
      ? t("reader.recipe.favorite.remove", "Remover dos favoritos")
      : t("reader.recipe.favorite.add", "Favoritar esta receita");
  }

  window.addEventListener("cp-reader-page-rendered", function (e) {
    var detail = e.detail;
    if (bookIdAtual !== detail.bookId) {
      bookIdAtual = detail.bookId;
      indiceReceitas = construirIndice(window.CP_READER.getPages());
    }
    if (!indiceReceitas || indiceReceitas.length === 0) return; // livro sem receitas (ex. novela) -- nada a fazer

    ativarUiSeNecessario();

    var favBtn = document.getElementById("cp-reader-favorite-toggle");
    var meta = detail.pageData.meta;
    if (meta && meta.type === "RECIPE") {
      favBtn.hidden = false;
      favBtn.setAttribute("data-recipe-id", meta.recipeId);
      favBtn.setAttribute("data-variant-id", meta.variantId);
      atualizarBotaoFavorito(favBtn, ehFavorito(meta.variantId));
    } else {
      favBtn.hidden = true;
    }
  });
})();
