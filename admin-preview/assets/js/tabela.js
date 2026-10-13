/* =========================================================================
   CorpoPleno — admin-preview — planilha demonstrativa
   Ordenação, busca, filtro e exportação CSV compatível com Excel/LibreOffice.
   Todos os dados vêm de CP_DEMO.PLANILHA_DEMO (fictícios).
   ========================================================================= */

(function () {
  "use strict";

  var COLUMNS = [
    { key: "produto", label: "Produto", type: "string" },
    { key: "data", label: "Data", type: "string" },
    { key: "categoria", label: "Categoria", type: "string" },
    { key: "quantidade", label: "Quantidade", type: "number" },
    { key: "preco", label: "Preço (R$)", type: "number" },
    { key: "receita", label: "Receita (R$)", type: "number" },
    { key: "reembolso", label: "Reembolso (R$)", type: "number" },
    { key: "status", label: "Status", type: "string" },
  ];

  var state = {
    search: "",
    categoria: "all",
    status: "all",
    sortKey: "data",
    sortDir: "asc",
  };

  function formatMoney(v) {
    return v.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function getFilteredSortedRows() {
    var rows = window.CP_DEMO.PLANILHA_DEMO.slice();

    if (state.categoria !== "all") {
      rows = rows.filter(function (r) {
        return r.categoria === state.categoria;
      });
    }
    if (state.status !== "all") {
      rows = rows.filter(function (r) {
        return r.status === state.status;
      });
    }
    if (state.search.trim() !== "") {
      var q = state.search.trim().toLowerCase();
      rows = rows.filter(function (r) {
        return r.produto.toLowerCase().indexOf(q) !== -1 || r.categoria.toLowerCase().indexOf(q) !== -1;
      });
    }

    var col = COLUMNS.filter(function (c) {
      return c.key === state.sortKey;
    })[0];

    rows.sort(function (a, b) {
      var av = a[state.sortKey];
      var bv = b[state.sortKey];
      var cmp;
      if (col && col.type === "number") {
        cmp = av - bv;
      } else {
        cmp = String(av).localeCompare(String(bv), "pt-BR");
      }
      return state.sortDir === "asc" ? cmp : -cmp;
    });

    return rows;
  }

  function renderTable() {
    var tbody = document.getElementById("cp-table-body");
    var countEl = document.getElementById("cp-table-count");
    if (!tbody) return;

    var rows = getFilteredSortedRows();
    tbody.innerHTML = "";

    if (rows.length === 0) {
      var emptyRow = document.createElement("tr");
      var emptyCell = document.createElement("td");
      emptyCell.colSpan = COLUMNS.length;
      emptyCell.className = "cp-table-empty";
      emptyCell.textContent = "Nenhum registro demonstrativo encontrado para este filtro.";
      emptyRow.appendChild(emptyCell);
      tbody.appendChild(emptyRow);
    } else {
      rows.forEach(function (r) {
        var tr = document.createElement("tr");
        tr.innerHTML =
          "<td>" + escapeHtml(r.produto) + "</td>" +
          "<td>" + escapeHtml(r.data) + "</td>" +
          "<td>" + escapeHtml(r.categoria) + "</td>" +
          "<td>" + escapeHtml(r.quantidade) + "</td>" +
          "<td>" + formatMoney(r.preco) + "</td>" +
          "<td>" + formatMoney(r.receita) + "</td>" +
          "<td>" + formatMoney(r.reembolso) + "</td>" +
          "<td><span class=\"cp-status cp-status-" + escapeHtml(r.status.toLowerCase()) + "\">" + escapeHtml(r.status) + "</span></td>";
        tbody.appendChild(tr);
      });
    }

    if (countEl) {
      countEl.textContent = rows.length + " registro(s) demonstrativo(s)";
    }

    document.querySelectorAll("[data-sort-key]").forEach(function (th) {
      var key = th.getAttribute("data-sort-key");
      th.setAttribute("aria-sort", "none");
      if (key === state.sortKey) {
        th.setAttribute("aria-sort", state.sortDir === "asc" ? "ascending" : "descending");
      }
    });
  }

  function buildCsv(rows) {
    var headers = COLUMNS.map(function (c) {
      return c.label;
    });
    var lines = [headers.join(";")];

    rows.forEach(function (r) {
      var line = [
        r.produto,
        r.data,
        r.categoria,
        r.quantidade,
        formatMoney(r.preco),
        formatMoney(r.receita),
        formatMoney(r.reembolso),
        r.status,
      ]
        .map(function (value) {
          var v = String(value).replace(/"/g, '""');
          if (v.indexOf(";") !== -1 || v.indexOf('"') !== -1 || v.indexOf("\n") !== -1) {
            v = '"' + v + '"';
          }
          return v;
        })
        .join(";");
      lines.push(line);
    });

    /* BOM UTF-8 garante acentuação correta no Excel; ";" como separador
       porque a formatação numérica usa vírgula decimal (padrão pt-BR). */
    return "﻿" + lines.join("\r\n");
  }

  function exportCsv() {
    var rows = getFilteredSortedRows();
    var csv = buildCsv(rows);
    var blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    var stamp = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = "corpopleno-admin-preview-demonstrativo-" + stamp + ".csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function setupFilters() {
    var searchInput = document.getElementById("cp-table-search");
    var categoriaSelect = document.getElementById("cp-table-categoria");
    var statusSelect = document.getElementById("cp-table-status");
    var exportBtn = document.getElementById("cp-table-export");

    if (categoriaSelect) {
      window.CP_DEMO.CATEGORIAS.forEach(function (cat) {
        var opt = document.createElement("option");
        opt.value = cat;
        opt.textContent = cat;
        categoriaSelect.appendChild(opt);
      });
    }
    if (statusSelect) {
      window.CP_DEMO.STATUS.forEach(function (st) {
        var opt = document.createElement("option");
        opt.value = st;
        opt.textContent = st;
        statusSelect.appendChild(opt);
      });
    }

    if (searchInput) {
      searchInput.addEventListener("input", function () {
        state.search = searchInput.value;
        renderTable();
      });
    }
    if (categoriaSelect) {
      categoriaSelect.addEventListener("change", function () {
        state.categoria = categoriaSelect.value;
        renderTable();
      });
    }
    if (statusSelect) {
      statusSelect.addEventListener("change", function () {
        state.status = statusSelect.value;
        renderTable();
      });
    }
    if (exportBtn) {
      exportBtn.addEventListener("click", exportCsv);
    }

    document.querySelectorAll("[data-sort-key]").forEach(function (th) {
      th.addEventListener("click", function () {
        var key = th.getAttribute("data-sort-key");
        if (state.sortKey === key) {
          state.sortDir = state.sortDir === "asc" ? "desc" : "asc";
        } else {
          state.sortKey = key;
          state.sortDir = "asc";
        }
        renderTable();
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    if (!window.CP_DEMO) return;
    setupFilters();
    renderTable();
  });
})();
