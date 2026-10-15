/*
  GET /api/books/:bookId/purchase-confirmation -- usado por
  books-account.js para disparar o evento Purchase da Meta SOMENTE após
  pagamento confirmado pelo webhook. Combo: os 2 livros devolvem o mesmo
  eventId (a compra), e meta-tracking.js deduplica por eventId.
*/
import { json, methodNotAllowed } from "../../../_lib/http.js";
import { getDb } from "../../../_lib/db.js";
import { getSessionUser } from "../../../_lib/auth.js";

export async function onRequest({ request, env, params }) {
  if (request.method !== "GET") return methodNotAllowed();
  const db = await getDb(env);
  if (!db) return json(503, { ok: false, erro: "BANCO_NAO_CONFIGURADO" });
  const user = await getSessionUser(db, request);
  if (!user) return json(401, { ok: false, erro: "NAO_AUTENTICADO" });
  const row = await db
    .prepare(
      `SELECT p.id, p.amount_cents FROM entitlements e JOIN purchases p ON p.id = e.purchase_id
        WHERE e.user_id = ? AND e.book_id = ? AND p.status = 'PAID'`
    )
    .bind(user.id, String(params.bookId || ""))
    .first();
  if (!row) return json(404, { ok: false, erro: "SEM_COMPRA_CONFIRMADA" });
  return json(200, { ok: true, eventId: row.id, value: row.amount_cents / 100, currency: "BRL" });
}
