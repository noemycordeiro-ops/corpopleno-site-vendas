/*
  GET /api/books/:bookId/content/:locale -- conteúdo PAGO do livro.
  Contrato de assets/js/reader.js:
    200 {ok:true, pages:[...]}
    401 NAO_AUTENTICADO | 403 ACESSO_NEGADO (sem compra ou livro inexistente)
    404 CONTEUDO_NAO_ENCONTRADO (idioma sem conteúdo carregado)
    429 MUITAS_REQUISICOES (mais de 60 leituras em 10 min)
  Só serve o conteúdo se a cliente tiver acesso registrado no D1
  (entitlements). O conteúdo vive na tabela book_pages, nunca em arquivo
  público.
*/
import { json, methodNotAllowed } from "../../../../_lib/http.js";
import { getDb } from "../../../../_lib/db.js";
import { getSessionUser } from "../../../../_lib/auth.js";
import { hasAccess, contentRateLimited, READER_LOCALES } from "../../../../_lib/reading.js";

const LOCALES = new Set(READER_LOCALES);
const PRIVATE = { "Cache-Control": "private, no-store" };

export async function onRequest({ request, env, params }) {
  if (request.method !== "GET") return methodNotAllowed();
  const db = await getDb(env);
  if (!db) return json(503, { ok: false, erro: "BANCO_NAO_CONFIGURADO" });

  const user = await getSessionUser(db, request);
  if (!user) return json(401, { ok: false, erro: "NAO_AUTENTICADO" });

  const bookId = String(params.bookId || "");
  const locale = String(params.locale || "");
  // Mesma resposta para "sem compra" e "livro inexistente".
  if (!(await hasAccess(db, user.id, bookId))) return json(403, { ok: false, erro: "ACESSO_NEGADO" });
  if (await contentRateLimited(db, user.id)) return json(429, { ok: false, erro: "MUITAS_REQUISICOES" });

  if (!LOCALES.has(locale)) return json(404, { ok: false, erro: "CONTEUDO_NAO_ENCONTRADO" });

  const { results } = await db
    .prepare("SELECT content FROM book_pages WHERE book_id = ? AND locale = ? ORDER BY page_index")
    .bind(bookId, locale)
    .all();
  if (!results || results.length === 0) return json(404, { ok: false, erro: "CONTEUDO_NAO_ENCONTRADO" });

  // As páginas já estão guardadas como JSON; monta a resposta sem re-parsear.
  const body = `{"ok":true,"pages":[${results.map((r) => r.content).join(",")}]}`;
  return new Response(body, {
    status: 200,
    headers: { "Content-Type": "application/json; charset=utf-8", ...PRIVATE },
  });
}
