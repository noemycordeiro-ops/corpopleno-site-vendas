/*
  Renderiza os cards e filtros do catálogo (Produtos/Cursos) a partir de
  assets/js/catalog-data.js, mostrando SOMENTE categorias com status
  "published". Categorias "draft" nunca chegam a existir no HTML da página
  — não são inseridas no DOM, então não aparecem nem no "Ver código-fonte".

  Roda antes do DOMContentLoaded (script sem defer/async, no fim do body),
  então os elementos com data-i18n criados aqui já são traduzidos pela
  primeira passada do i18n.js e continuam reagindo normalmente a troca de
  idioma depois.
*/
(function () {
  "use strict";

  function buildIcon(icon) {
    var wrap = document.createElement("div");
    wrap.setAttribute("aria-hidden", "true");

    if (icon.type === "photo") {
      wrap.className = "card__icon card__icon--photo";
      var img = document.createElement("img");
      img.className = "card__icon-img";
      img.src = icon.src;
      img.alt = "";
      wrap.appendChild(img);
    } else {
      wrap.className = "card__icon " + icon.tone;
      wrap.textContent = icon.glyph;
    }
    return wrap;
  }

  function buildCard(item) {
    var article = document.createElement("article");
    article.className = "card";
    article.setAttribute("data-category", item.id);
    article.appendChild(buildIcon(item.icon));

    var badge = document.createElement("span");
    badge.className = "badge " + item.badge.badgeClass;
    badge.setAttribute("data-i18n", item.badge.badgeKey);
    article.appendChild(badge);

    var h3 = document.createElement("h3");
    h3.setAttribute("data-i18n", item.titleKey);
    article.appendChild(h3);

    var p = document.createElement("p");
    p.setAttribute("data-i18n", item.bodyKey);
    article.appendChild(p);

    return article;
  }

  function buildFilterChip(item) {
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "filter-chip";
    btn.setAttribute("aria-pressed", "false");
    btn.setAttribute("data-filter", item.id);
    btn.setAttribute("data-i18n", item.filterKey);
    return btn;
  }

  function renderSection(section) {
    var grid = document.getElementById(section.gridId);
    if (!grid) return;

    var filterBar = document.querySelector(section.filterBarSelector);
    var notice = document.getElementById(section.noticeId);
    var emptyState = document.getElementById(section.emptyStateId);

    var published = section.items.filter(function (item) {
      return item.status === "published";
    });

    published.forEach(function (item) {
      grid.appendChild(buildCard(item));
      if (filterBar) filterBar.appendChild(buildFilterChip(item));
    });

    var hasPublished = published.length > 0;
    if (filterBar) filterBar.hidden = !hasPublished;
    if (notice) notice.hidden = !hasPublished;
    if (emptyState) emptyState.hidden = hasPublished;
  }

  if (window.CP_CATALOG) {
    renderSection(window.CP_CATALOG.products);
    renderSection(window.CP_CATALOG.courses);
  }
})();
