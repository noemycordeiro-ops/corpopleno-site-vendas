/*
  Fase CorpoPleno Livros 012 -- sinônimos culinários regionais para a busca
  do Livro de Receitas. pt-BR (Fase 012) + en-US (Fase 012.8, piloto de
  tradução). pt-PT/ko-KR/es-CL ainda pendentes (sequência combinada com
  Noemi: um idioma por vez, com relatório antes de avançar).

  Cada entrada liga um termo regional/alternativo ao termo usado de fato no
  texto das receitas -- a busca expande a consulta do usuário por este
  dicionário ANTES de comparar com os títulos/ingredientes já carregados
  (nunca troca o texto exibido, só amplia o que é encontrado).

  Lista deliberadamente pequena e conferida contra os ingredientes reais do
  livro (nunca um sinônimo "genérico" supostamente universal) -- crescer
  esta lista exige confirmar que o termo-base realmente aparece no livro.
*/
(function (global) {
  "use strict";

  global.CP_RECIPE_SEARCH_SYNONYMS = {
    "pt-BR": {
      "jerimum": "abóbora",
      "moranga": "abóbora",
    },
    /* Fase CorpoPleno Livros 012.8 -- mesma disciplina: só termos
       conferidos contra o conteúdo en-US real já traduzido. */
    "en-US": {
      "green onion": "scallion",
      "green onions": "scallion",
      "japanese pumpkin": "kabocha squash",
    },
    /* Fase CorpoPleno Livros 012.9 -- idem para pt-PT: termos realmente
       usados no conteúdo pt-PT (courgette/ananás/beringela/sumo), mais os
       termos brasileiros equivalentes como sinônimo de busca (útil para
       quem já conhece o vocabulário do Brasil), nunca trocados no texto
       exibido. */
    "pt-PT": {
      "curgete": "courgette",
      "abobrinha": "courgette",
      "abacaxi": "ananás",
      "suco": "sumo",
      "berinjela": "beringela",
    },
  };
})(window);
