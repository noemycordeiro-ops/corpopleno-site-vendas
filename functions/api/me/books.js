/*
  GET /api/me/books -- livros liberados para a cliente logada.
  Contrato de books-account.js: 200 {ok:true, livros:[{bookId, grantedAt, purchaseCode}]} | 401.
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
    .prepare("SELECT book_id, granted_at, purchase_id FROM entitlements WHERE user_id = ? ORDER BY granted_at")
    .bind(user.id)
    .all();
  return json(200, {
    ok: true,
    livros: (results || []).map((r) => ({ bookId: r.book_id, grantedAt: new Date(r.granted_at).toISOString(), purchaseCode: r.purchase_id })),
  });
}
