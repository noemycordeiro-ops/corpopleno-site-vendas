/*
  GET /api/books/:bookId/content -- idiomas com conteúdo REAL carregado
  para este livro (o leitor só oferece esses; nada de tradução automática).
  Só para quem tem acesso ao livro.
    200 {ok, locales:[{locale, pages, reviewed}]}
    401 NAO_AUTENTICADO | 403 ACESSO_NEGADO
  reviewed=false -> o leitor mostra o selo "Tradução não revisada".
*/
import { json, methodNotAllowed } from "../../../../_lib/http.js";
import { getDb } from "../../../../_lib/db.js";
import { getSessionUser } from "../../../../_lib/auth.js";
import { hasAccess, READER_LOCALES } from "../../../../_lib/reading.js";
import { REVIEWED_LOCALES } from "../../../../_lib/catalog.js";

export async function onRequest({ request, env, params }) {
  if (request.method !== "GET") return methodNotAllowed();
  const db = await getDb(env);
  if (!db) return json(503, { ok: false, erro: "BANCO_NAO_CONFIGURADO" });
  const user = await getSessionUser(db, request);
  if (!user) return json(401, { ok: false, erro: "NAO_AUTENTICADO" });
  const bookId = String(params.bookId || "");
  if (!(await hasAccess(db, user.id, bookId))) return json(403, { ok: false, erro: "ACESSO_NEGADO" });

  const { results } = await db
    .prepare("SELECT locale, COUNT(*) AS n FROM book_pages WHERE book_id = ? GROUP BY locale")
    .bind(bookId)
    .all();
  const revisados = REVIEWED_LOCALES[bookId] || [];
  const locales = (results || [])
    .filter((r) => READER_LOCALES.includes(r.locale))
    .sort((a, b) => READER_LOCALES.indexOf(a.locale) - READER_LOCALES.indexOf(b.locale))
    .map((r) => ({ locale: r.locale, pages: r.n, reviewed: revisados.includes(r.locale) }));
  return json(200, { ok: true, locales }, { "Cache-Control": "private, no-store" });
}
