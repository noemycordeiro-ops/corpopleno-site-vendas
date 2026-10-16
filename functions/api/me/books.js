/*
  GET /api/me/books -- livros liberados para a cliente logada.
  Contrato de books-account.js: 200 {ok:true, livros:[{bookId, grantedAt, purchaseCode, progress}]} | 401.
*/
import { json, methodNotAllowed } from "../../_lib/http.js";
import { getDb } from "../../_lib/db.js";
import { getSessionUser } from "../../_lib/auth.js";

export async function onRequest({ request, env }) {
  if (request.method !== "GET") return methodNotAllowed();
  const db = await getDb(env);
  if (!db) return json(503, { ok: false, erro: "BANCO_NAO_CONFIGURADO" });
  const user = await getSessionUser(db, request);
  if (!user) return json(401, { ok: false, erro: "NAO_AUTENTICADO" });
  const { results } = await db
    .prepare(
      `SELECT e.book_id, e.granted_at, e.purchase_id, r.locale, r.page_index, r.updated_at AS progress_at
         FROM entitlements e
         LEFT JOIN reading_progress r ON r.user_id = e.user_id AND r.book_id = e.book_id
        WHERE e.user_id = ? ORDER BY e.granted_at`
    )
    .bind(user.id)
    .all();
  return json(200, {
    ok: true,
    livros: (results || []).map((r) => ({ bookId: r.book_id, grantedAt: new Date(r.granted_at).toISOString(), purchaseCode: r.purchase_id,
      progress: r.locale ? { locale: r.locale, page: r.page_index + 1, updatedAt: new Date(r.progress_at).toISOString() } : null,
    })),
  });
}
