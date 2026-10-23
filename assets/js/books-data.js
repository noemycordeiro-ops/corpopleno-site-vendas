/*
  Fase CorpoPleno Livros 001 (criação) + Fase 004 (catálogo real dos 5
  livros, 2026-10-03) — ÚNICA fonte de verdade de CATÁLOGO/ESTADO
  COMERCIAL de cada livro (status, locales disponíveis, preço, compra,
  leitor, conteúdo). Mesmo princípio de segurança de catalog-data.js
  (Produtos/Cursos): só "PUBLISHED" pode aparecer no catálogo público
  (ver books-render.js) — "DRAFT"/"READY"/"ARCHIVED" nunca são inseridos
  no DOM nem ficam alcançáveis por URL direta (book-detail.js/reader.js
  fazem o mesmo filtro).

  CONTEÚDO (texto/capa/descrição traduzidos) continua em
  assets/books/<book_id>/metadata.json + <locale>/pages.json — nunca
  duplicado aqui. Esta separação (registro de estado vs. conteúdo) é
  deliberada, não um "catálogo paralelo": metadata.json nunca decide
  status/preço/disponibilidade, só fornece o texto já aprovado.

  ESTADOS de status (Passo 2, Fase 004): DRAFT | READY | PUBLISHED |
  ARCHIVED. Nenhum livro é promovido a PUBLISHED só por ter arquivo
  local (PDF, imagem) -- isso exige decisão humana explícita, nunca
  automática.

  "livro-teste" continua um livro de TESTE INTERNO, nunca um produto
  real (ver metadata.json dele) -- content_status "READY" aqui só
  reflete que seus pages.json de teste existem, não que seja vendável.

  OS 5 LIVROS OFICIAIS (Fase 004, 2026-10-03): cadastrados
  estruturalmente com os book_id exatos fornecidos por Noemi. NENHUM
  teve conteúdo (pages.json), preço oficial ou capa confirmada
  encontrados em assets/ desta fase -- por isso content_status
  "PENDING_CONTENT", price_status "NOT_SET", status "DRAFT" para todos
  os 5 (nunca inventado). Ver relatório da fase para o que foi
  encontrado em outros locais do sistema (PDFs/artes), ainda não
  importado.
*/
(function (global) {
  "use strict";

  // Agrupamento VISUAL apenas (Passo 9) -- o entitlement continua
  // individual por book_id, nunca por coleção. Nomes só em pt-BR por
  // ora (nomes oficiais fornecidos só nesse idioma; nunca traduzidos
  // automaticamente).
  global.CP_BOOK_COLLECTIONS = [
    // Fase Livros 020 -- nomes nos 5 idiomas (pt-PT/en-US/ko-KR/es-CL a revisar pela Noemi).
    { id: "hene-sem-medo", name: { "pt-BR": "Coleção Henê Sem Medo", "pt-PT": "Coleção Henê Sem Medo", "en-US": "Henê Without Fear Collection", "ko-KR": "Henê, 두려움 없이 컬렉션", "es-CL": "Colección Henê Sin Miedo" } },
    { id: "historias-aprendizado-familiar", name: { "pt-BR": "Coleção Histórias de Aprendizado Familiar", "pt-PT": "Coleção Histórias de Aprendizagem Familiar", "en-US": "Family Learning Stories Collection", "ko-KR": "가족이 함께 배우는 이야기 컬렉션", "es-CL": "Colección Historias de Aprendizaje Familiar" } },
    { id: "corpopleno-alimentacao", name: { "pt-BR": "Coleção CorpoPleno Alimentação", "pt-PT": "Coleção CorpoPleno Alimentação", "en-US": "CorpoPleno Nutrition Collection", "ko-KR": "CorpoPleno 식생활 컬렉션", "es-CL": "Colección CorpoPleno Alimentación" } },
  ];

  global.CP_BOOKS = {
    gridId: "cp-books-grid",
    noticeId: "cp-books-notice",
    emptyStateId: "cp-books-empty",
    items: [
      {
        // CORRIGIDO (Fase CorpoPleno Livros 011, Passo 6, 2026-10-05):
        // achado real de auditoria pré-publicação -- books-render.js/
        // book-detail.js filtram SOMENTE por status==="PUBLISHED" (nunca
        // leem internalTestOnly do metadata.json); com status PUBLISHED
        // aqui, este livro de TESTE INTERNO apareceria no catálogo
        // público/seria clicável num deploy real, contradizendo seu
        // próprio metadata.json ("NÃO é um produto real — nunca exibir
        // sem autorização explícita"). "DRAFT" reaproveita o MESMO
        // enum/filtro já usado para os 4 livros reais ainda não
        // publicados -- nenhuma arquitetura nova, nenhum filtro novo.
        id: "livro-teste",
        book_id: "livro-teste",
        slug: "livro-teste",
        collection: null,
        status: "DRAFT",
        available_locales: ["pt-BR", "pt-PT", "en-US", "ko-KR", "es-CL"],
        price_status: "SET",
        purchase_status: "NOT_AVAILABLE",
        reader_available: true,
        content_status: "READY",
        metadataUrl: "assets/books/livro-teste/metadata.json",
      },
      {
        id: "hene-sem-medo-livro-1",
        book_id: "hene-sem-medo-livro-1",
        slug: "hene-sem-medo-livro-1",
        collection: "hene-sem-medo",
        status: "PUBLISHED",
        available_locales: ["pt-BR", "en-US", "es-CL", "ko-KR", "pt-PT"],
        price_status: "SET",
        purchase_status: "AVAILABLE",
        price: 39.90,
        asaas_product_id: "hene-sem-medo-livro-1",
        reader_available: false,
        content_status: "READY",
        metadataUrl: "assets/books/hene-sem-medo-livro-1/metadata.json",
      },
      {
        id: "hene-sem-medo-livro-2",
        book_id: "hene-sem-medo-livro-2",
        slug: "hene-sem-medo-livro-2",
        collection: "hene-sem-medo",
        status: "PUBLISHED",
        available_locales: ["pt-BR", "en-US", "es-CL", "ko-KR", "pt-PT"],
        price_status: "SET",
        purchase_status: "AVAILABLE",
        price: 39.90,
        asaas_product_id: "hene-sem-medo-livro-2",
        reader_available: false,
        content_status: "READY",
        metadataUrl: "assets/books/hene-sem-medo-livro-2/metadata.json",
      },
      {
        // Fase CorpoPleno Livros 008 (2026-10-04) — preço de lançamento
        // aprovado (R$ 29,90, ver metadata.json) e checkout backend
        // preparado (POST /api/books/:bookId/checkout no Cordex, reusa
        // prepararTentativaPagamento()/criarOuReutilizarContrato() já
        // existentes -- nenhuma chamada real ao Asaas ainda). status
        // continua "READY", nunca "PUBLISHED": falta ainda ligar o botão
        // "Comprar" do site a este endpoint e autorizar a primeira
        // cobrança Sandbox real antes de publicar. purchase_status
        // continua "NOT_AVAILABLE" de propósito (flag do SITE, nunca
        // ativada automaticamente só porque o backend está pronto).
        id: "amor-que-aprendeu-a-ficar",
        book_id: "amor-que-aprendeu-a-ficar",
        slug: "amor-que-aprendeu-a-ficar",
        collection: "historias-aprendizado-familiar",
        status: "PUBLISHED",
        available_locales: ["pt-BR", "pt-PT"],
        price_status: "SET",
        purchase_status: "AVAILABLE",
        price: 29.90,
        asaas_product_id: "amor-que-aprendeu-a-ficar",
        reader_available: false,
        content_status: "READY",
        metadataUrl: "assets/books/amor-que-aprendeu-a-ficar/metadata.json",
      },
      {
        id: "amor-que-ensina-a-crescer",
        book_id: "amor-que-ensina-a-crescer",
        slug: "amor-que-ensina-a-crescer",
        collection: "historias-aprendizado-familiar",
        status: "PUBLISHED",
        available_locales: ["pt-BR", "en-US", "es-CL", "ko-KR", "pt-PT"],
        price_status: "SET",
        purchase_status: "AVAILABLE",
        price: 29.90,
        asaas_product_id: "amor-que-ensina-a-crescer",
        reader_available: false,
        content_status: "READY",
        metadataUrl: "assets/books/amor-que-ensina-a-crescer/metadata.json",
      },
      {
        id: "receitas-corpopleno",
        book_id: "receitas-corpopleno",
        slug: "receitas-corpopleno",
        collection: "corpopleno-alimentacao",
        status: "PUBLISHED",
        available_locales: ["pt-BR", "pt-PT", "en-US", "ko-KR", "es-CL"],
        price_status: "SET",
        purchase_status: "AVAILABLE",
        price: 100.00,
        asaas_product_id: "receitas-corpopleno",
        reader_available: false,
        content_status: "READY",
        metadataUrl: "assets/books/receitas-corpopleno/metadata.json",
      },
      {
        id: "hene-sem-medo-combo",
        book_id: "hene-sem-medo-combo",
        slug: "hene-sem-medo-combo",
        collection: "hene-sem-medo",
        status: "PUBLISHED",
        available_locales: ["pt-BR", "en-US", "es-CL", "ko-KR", "pt-PT"],
        price_status: "SET",
        purchase_status: "AVAILABLE",
        price: 70.00,
        is_combo: true,
        combo_items: ["hene-sem-medo-livro-1", "hene-sem-medo-livro-2"],
        asaas_product_id: "hene-sem-medo-combo",
        reader_available: false,
        content_status: "READY",
        metadataUrl: "assets/books/hene-sem-medo-combo/metadata.json",
      },
      {
        id: "romance-combo",
        book_id: "romance-combo",
        slug: "romance-combo",
        collection: "historias-aprendizado-familiar",
        status: "PUBLISHED",
        available_locales: ["pt-BR", "pt-PT"],
        price_status: "SET",
        purchase_status: "AVAILABLE",
        price: 50.00,
        is_combo: true,
        combo_items: ["amor-que-aprendeu-a-ficar", "amor-que-ensina-a-crescer"],
        asaas_product_id: "romance-combo",
        reader_available: false,
        content_status: "READY",
        metadataUrl: "assets/books/romance-combo/metadata.json",
      },
    ],
  };
})(window);
