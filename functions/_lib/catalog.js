/*
  Catálogo de PREÇOS do servidor -- única fonte do valor cobrado. O
  navegador nunca envia preço; books-data.js/metadata.json são só exibição.
  `items` = livros liberados quando o pagamento é confirmado.
*/
export const CATALOG = {
  "hene-sem-medo-livro-1": { priceCents: 3990, title: "Henê Sem Medo — Livro 1", items: ["hene-sem-medo-livro-1"], maxInstallments: 1 },
  "hene-sem-medo-livro-2": { priceCents: 3990, title: "Henê Sem Medo — Livro 2", items: ["hene-sem-medo-livro-2"], maxInstallments: 1 },
  "amor-que-aprendeu-a-ficar": { priceCents: 2990, title: "O Amor que Aprendeu a Ficar", items: ["amor-que-aprendeu-a-ficar"], maxInstallments: 1 },
  "amor-que-ensina-a-crescer": { priceCents: 2990, title: "O Amor que Ensina a Crescer", items: ["amor-que-ensina-a-crescer"], maxInstallments: 1 },
  "receitas-corpopleno": { priceCents: 10000, title: "Livro de Receitas CorpoPleno", items: ["receitas-corpopleno"], maxInstallments: 4 },
  "hene-sem-medo-combo": { priceCents: 7000, title: "Henê Sem Medo — Livros 1 e 2 (combo)", items: ["hene-sem-medo-livro-1", "hene-sem-medo-livro-2"], maxInstallments: 1 },
  "romance-combo": { priceCents: 5000, title: "O Amor que Aprendeu a Ficar + O Amor que Ensina a Crescer (combo)", items: ["amor-que-aprendeu-a-ficar", "amor-que-ensina-a-crescer"], maxInstallments: 1 },
};

/*
  Idiomas cujo CONTEÚDO (não só a capa/título) foi revisado por pessoa.
  Os demais idiomas que existirem no banco aparecem no leitor com o selo
  "Tradução não revisada". Para marcar um idioma como revisado, inclua-o
  aqui. Hoje só o original em pt-BR está confirmado.
*/
export const REVIEWED_LOCALES = {
  "hene-sem-medo-livro-1": ["pt-BR"],
  "hene-sem-medo-livro-2": ["pt-BR"],
  "amor-que-aprendeu-a-ficar": ["pt-BR"],
  "amor-que-ensina-a-crescer": ["pt-BR"],
  "receitas-corpopleno": ["pt-BR"],
};

export function getProduct(id) {
  return Object.prototype.hasOwnProperty.call(CATALOG, id) ? CATALOG[id] : null;
}
