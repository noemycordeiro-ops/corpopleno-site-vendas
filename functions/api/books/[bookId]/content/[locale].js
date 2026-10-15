/*
  GET /api/books/:bookId/content/:locale -- conteúdo PAGO do livro.
  Contrato de assets/js/reader.js (o mesmo do Cordex):
    200 {ok:true, pages:[...]}
    401 NAO_AUTENTICADO | 403 ACESSO_NEGADO (sem compra ou livro inexistente)
    404 CONTEUDO_NAO_ENCONTRADO (idioma sem conteúdo carregado)
  Só serve o conteúdo se a cliente tiver acesso registrado no D1
  (entitlements). O conteúdo vive na tabela book_pages, nunca em arquivo
  público.
*/
import { json, methodNotAllowed } from "../../../../_lib/http.js";
import { getDb } from "../../../../_lib/db.js";
import { getSessionUser } from "../../../../_lib/auth.js";

const LOCALES = new Set(["pt-BR", "pt-PT", "en-US", "ko-KR", "es-CL"]);
const BOOK_ID_REGEX = /^[a-z0-9-]{1,100}$/;
const PRIVATE = { "Cache-Control": "private, no-store" };

export async function onRequest({ request, env, params }) {
  if (request.method !== "GET") return methodNotAllowed();
  const db = await getDb(env);
  if (!db) return json(503, { ok: false, erro: "BANCO_NAO_CONFIGURADO" });

  const user = await getSessionUser(db, request);
  if (!user) return json(401, { ok: false, erro: "NAO_AUTENTICADO" });

  const bookId = String(params.bookId || "");
  const locale = String(params.locale || "");
  if (!BOOK_ID_REGEX.test(bookId)) return json(403, { ok: false, erro: "ACESSO_NEGADO" });

  const acesso = await db
    .prepare("SELECT 1 AS ok FROM entitlements WHERE user_id = ? AND book_id = ?")
    .bind(user.id, bookId)
    .first();
  // Mesma resposta para "sem compra" e "livro inexistente".
  if (!acesso) return json(403, { ok: false, erro: "ACESSO_NEGADO" });

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
