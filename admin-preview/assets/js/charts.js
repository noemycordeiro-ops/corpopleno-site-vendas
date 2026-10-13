/* =========================================================================
   CorpoPleno — admin-preview — gráficos leves em SVG puro
   Sem biblioteca externa: gerado diretamente em JavaScript para manter o
   painel leve e sem dependência obrigatória de internet.
   ========================================================================= */

(function (global) {
  "use strict";

  var NS = "http://www.w3.org/2000/svg";

  function el(tag, attrs) {
    var node = document.createElementNS(NS, tag);
    for (var key in attrs) {
      if (Object.prototype.hasOwnProperty.call(attrs, key)) {
        node.setAttribute(key, attrs[key]);
      }
    }
    return node;
  }

  function clear(container) {
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
  }

  /* Gráfico de barras verticais simples. data: [{periodo|categoria, valor}] */
  function barChart(container, data, opts) {
    opts = opts || {};
    var width = opts.width || 480;
    var height = opts.height || 240;
    var padding = { top: 20, right: 16, bottom: 36, left: 40 };
    var color = opts.color || "#3b82f6";
    var labelKey = opts.labelKey || "periodo";
    var suffix = opts.suffix || "";

    clear(container);

    var svg = el("svg", {
      viewBox: "0 0 " + width + " " + height,
      width: "100%",
      height: "100%",
      role: "img",
      "aria-label": opts.ariaLabel || "Gráfico",
    });

    var maxValue = Math.max.apply(
      null,
      data.map(function (d) {
        return d.valor;
      })
    );
    maxValue = maxValue <= 0 ? 1 : maxValue * 1.15;

    var chartW = width - padding.left - padding.right;
    var chartH = height - padding.top - padding.bottom;
    var barGap = 14;
    var barWidth = (chartW - barGap * (data.length - 1)) / data.length;

    /* Linhas de grade horizontais */
    var gridLines = 4;
    for (var g = 0; g <= gridLines; g++) {
      var y = padding.top + (chartH / gridLines) * g;
      svg.appendChild(
        el("line", {
          x1: padding.left,
          x2: width - padding.right,
          y1: y,
          y2: y,
          stroke: "#ece6f0",
          "stroke-width": "1",
        })
      );
    }

    data.forEach(function (d, i) {
      var barHeight = (d.valor / maxValue) * chartH;
      var x = padding.left + i * (barWidth + barGap);
      var y = padding.top + chartH - barHeight;

      svg.appendChild(
        el("rect", {
          x: x,
          y: y,
          width: barWidth,
          height: Math.max(barHeight, 1),
          rx: 6,
          fill: color,
        })
      );

      var valueLabel = el("text", {
        x: x + barWidth / 2,
        y: y - 6,
        "text-anchor": "middle",
        "font-size": "11",
        "font-weight": "700",
        fill: "#241c2c",
      });
      valueLabel.textContent = d.valor + suffix;
      svg.appendChild(valueLabel);

      var axisLabel = el("text", {
        x: x + barWidth / 2,
        y: height - padding.bottom + 18,
        "text-anchor": "middle",
        "font-size": "11",
        fill: "#5c5468",
      });
      axisLabel.textContent = d[labelKey];
      svg.appendChild(axisLabel);
    });

    container.appendChild(svg);
  }

  /* Gráfico de linha simples. data: [{periodo, valor}] */
  function lineChart(container, data, opts) {
    opts = opts || {};
    var width = opts.width || 480;
    var height = opts.height || 240;
    var padding = { top: 20, right: 16, bottom: 36, left: 40 };
    var color = opts.color || "#14b8a6";
    var suffix = opts.suffix || "";

    clear(container);

    var svg = el("svg", {
      viewBox: "0 0 " + width + " " + height,
      width: "100%",
      height: "100%",
      role: "img",
      "aria-label": opts.ariaLabel || "Gráfico de linha",
    });

    var values = data.map(function (d) {
      return d.valor;
    });
    var maxValue = Math.max.apply(null, values) * 1.15 || 1;
    var minValue = Math.min(0, Math.min.apply(null, values));

    var chartW = width - padding.left - padding.right;
    var chartH = height - padding.top - padding.bottom;
    var stepX = data.length > 1 ? chartW / (data.length - 1) : 0;

    function toX(i) {
      return padding.left + i * stepX;
    }
    function toY(v) {
      var ratio = (v - minValue) / (maxValue - minValue || 1);
      return padding.top + chartH - ratio * chartH;
    }

    var gridLines = 4;
    for (var g = 0; g <= gridLines; g++) {
      var y = padding.top + (chartH / gridLines) * g;
      svg.appendChild(
        el("line", {
          x1: padding.left,
          x2: width - padding.right,
          y1: y,
          y2: y,
          stroke: "#ece6f0",
          "stroke-width": "1",
        })
      );
    }

    var points = data
      .map(function (d, i) {
        return toX(i) + "," + toY(d.valor);
      })
      .join(" ");

    svg.appendChild(
      el("polyline", {
        points: points,
        fill: "none",
        stroke: color,
        "stroke-width": "3",
        "stroke-linecap": "round",
        "stroke-linejoin": "round",
      })
    );

    data.forEach(function (d, i) {
      var x = toX(i);
      var y = toY(d.valor);

      svg.appendChild(el("circle", { cx: x, cy: y, r: 4, fill: color }));

      var valueLabel = el("text", {
        x: x,
        y: y - 10,
        "text-anchor": "middle",
        "font-size": "11",
        "font-weight": "700",
        fill: "#241c2c",
      });
      valueLabel.textContent = d.valor + suffix;
      svg.appendChild(valueLabel);

      var axisLabel = el("text", {
        x: x,
        y: height - padding.bottom + 18,
        "text-anchor": "middle",
        "font-size": "11",
        fill: "#5c5468",
      });
      axisLabel.textContent = d.periodo;
      svg.appendChild(axisLabel);
    });

    container.appendChild(svg);
  }

  /* Funil horizontal. steps: [{label, value}] em ordem decrescente esperada */
  function funnelChart(container, steps, opts) {
    opts = opts || {};
    var width = opts.width || 760;
    var rowHeight = 54;
    var gap = 10;
    var height = steps.length * (rowHeight + gap);
    var colors = opts.colors || ["#ec4899", "#f97316", "#eab308", "#22c55e", "#8b5cf6"];

    clear(container);

    var svg = el("svg", {
      viewBox: "0 0 " + width + " " + height,
      width: "100%",
      height: "100%",
      role: "img",
      "aria-label": opts.ariaLabel || "Funil de vendas demonstrativo",
    });

    var maxValue = steps[0] ? steps[0].value : 1;

    steps.forEach(function (step, i) {
      var ratio = maxValue > 0 ? step.value / maxValue : 0;
      var barWidth = Math.max(ratio * width, 8);
      var y = i * (rowHeight + gap);
      var color = colors[i % colors.length];

      svg.appendChild(
        el("rect", {
          x: 0,
          y: y,
          width: width,
          height: rowHeight,
          rx: 12,
          fill: "#faf7f5",
        })
      );

      svg.appendChild(
        el("rect", {
          x: 0,
          y: y,
          width: barWidth,
          height: rowHeight,
          rx: 12,
          fill: color,
        })
      );

      var label = el("text", {
        x: 18,
        y: y + rowHeight / 2 - 4,
        "font-size": "13",
        "font-weight": "700",
        fill: ratio > 0.28 ? "#ffffff" : "#241c2c",
      });
      label.textContent = step.label;
      svg.appendChild(label);

      var value = el("text", {
        x: 18,
        y: y + rowHeight / 2 + 15,
        "font-size": "12",
        fill: ratio > 0.28 ? "#ffffff" : "#5c5468",
      });
      value.textContent = step.value.toLocaleString("pt-BR") + " (demonstrativo)";
      svg.appendChild(value);
    });

    container.appendChild(svg);
  }

  global.CP_CHARTS = {
    barChart: barChart,
    lineChart: lineChart,
    funnelChart: funnelChart,
  };
})(window);
