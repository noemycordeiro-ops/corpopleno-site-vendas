/* =========================================================================
   CorpoPleno — admin-preview — DADOS DEMONSTRATIVOS
   Nenhum valor abaixo representa venda, visita, reembolso ou faturamento
   real. Tudo é fictício e existe apenas para ilustrar como o painel de
   funil funcionará quando conectado a dados reais (via backend/Portão A).
   ========================================================================= */

(function (global) {
  "use strict";

  var FUNIL_DEMO = {
    visitantes: 4820,
    interessados: 1260,
    checkout: 340,
    vendas: 118,
    reembolsos: 9,
  };

  var VISITAS_DEMO = [
    { periodo: "Sem 1", valor: 640 },
    { periodo: "Sem 2", valor: 710 },
    { periodo: "Sem 3", valor: 905 },
    { periodo: "Sem 4", valor: 860 },
    { periodo: "Sem 5", valor: 980 },
    { periodo: "Sem 6", valor: 725 },
  ];

  var CONVERSAO_DEMO = [
    { periodo: "Sem 1", valor: 1.8 },
    { periodo: "Sem 2", valor: 2.1 },
    { periodo: "Sem 3", valor: 2.6 },
    { periodo: "Sem 4", valor: 2.3 },
    { periodo: "Sem 5", valor: 3.0 },
    { periodo: "Sem 6", valor: 2.4 },
  ];

  var VENDAS_POR_SEMANA_DEMO = [
    { periodo: "Sem 1", valor: 14 },
    { periodo: "Sem 2", valor: 19 },
    { periodo: "Sem 3", valor: 24 },
    { periodo: "Sem 4", valor: 21 },
    { periodo: "Sem 5", valor: 27 },
    { periodo: "Sem 6", valor: 13 },
  ];

  var PRODUTOS_CATEGORIA_DEMO = [
    { categoria: "eBooks", valor: 32 },
    { categoria: "Livros", valor: 11 },
    { categoria: "Mini apps", valor: 18 },
    { categoria: "Autocuidado", valor: 21 },
    { categoria: "CorpoPleno Natural", valor: 15 },
    { categoria: "Capilares", valor: 9 },
    { categoria: "Nutrição", valor: 12 },
  ];

  var REEMBOLSOS_POR_SEMANA_DEMO = [
    { periodo: "Sem 1", valor: 1 },
    { periodo: "Sem 2", valor: 2 },
    { periodo: "Sem 3", valor: 1 },
    { periodo: "Sem 4", valor: 3 },
    { periodo: "Sem 5", valor: 1 },
    { periodo: "Sem 6", valor: 1 },
  ];

  var CATEGORIAS = [
    "eBooks",
    "Livros",
    "Mini apps",
    "Autocuidado",
    "CorpoPleno Natural",
    "Capilares",
    "Nutrição",
  ];

  var STATUS = ["Pago", "Pendente", "Reembolsado"];

  function pad(n) {
    return n < 10 ? "0" + n : String(n);
  }

  function gerarPlanilhaDemo() {
    var linhas = [];
    var nomesPorCategoria = {
      "eBooks": ["eBook Organização de Rotina", "eBook Fundamentos de Autocuidado", "eBook Guia Inicial"],
      "Livros": ["Coleção CorpoPleno Vol. 1", "Coleção CorpoPleno Vol. 2"],
      "Mini apps": ["Mini App Diário de Hábitos", "Mini App Calculadora de Bem-estar"],
      "Autocuidado": ["Guia Rotina de Autocuidado", "Kit Autocuidado Básico"],
      "CorpoPleno Natural": ["Linha Introdutória Natural", "Kit Natural Essencial"],
      "Capilares": ["Guia Capilar Cuidados Básicos"],
      "Nutrição": ["Guia Nutrição Consciente", "Planner Refeições Semanais"],
    };

    var id = 1;
    for (var mes = 1; mes <= 3; mes++) {
      for (var i = 0; i < 8; i++) {
        var categoria = CATEGORIAS[(id + i) % CATEGORIAS.length];
        var nomes = nomesPorCategoria[categoria];
        var produto = nomes[id % nomes.length];
        var dia = pad(((id * 3) % 27) + 1);
        var data = "2026-0" + mes + "-" + dia;
        var quantidade = 1 + ((id * 7) % 5);
        var precoBase = 29.9 + ((id * 13) % 8) * 10;
        var preco = Math.round(precoBase * 100) / 100;
        var receita = Math.round(preco * quantidade * 100) / 100;
        var statusIdx = id % 11;
        var status = statusIdx === 0 ? "Reembolsado" : statusIdx <= 1 ? "Pendente" : "Pago";
        var reembolso = status === "Reembolsado" ? receita : 0;

        linhas.push({
          id: id,
          produto: produto,
          data: data,
          categoria: categoria,
          quantidade: quantidade,
          preco: preco,
          receita: receita,
          reembolso: reembolso,
          status: status,
        });
        id++;
      }
    }
    return linhas;
  }

  global.CP_DEMO = {
    FUNIL_DEMO: FUNIL_DEMO,
    VISITAS_DEMO: VISITAS_DEMO,
    CONVERSAO_DEMO: CONVERSAO_DEMO,
    VENDAS_POR_SEMANA_DEMO: VENDAS_POR_SEMANA_DEMO,
    PRODUTOS_CATEGORIA_DEMO: PRODUTOS_CATEGORIA_DEMO,
    REEMBOLSOS_POR_SEMANA_DEMO: REEMBOLSOS_POR_SEMANA_DEMO,
    CATEGORIAS: CATEGORIAS,
    STATUS: STATUS,
    PLANILHA_DEMO: gerarPlanilhaDemo(),
  };
})(window);
