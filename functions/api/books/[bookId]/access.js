/*
  GET /api/books/:bookId/access -- contrato de assets/js/reader.js:
    200 {allowReading: true|false, readerSubjectKey?}
  readerSubjectKey é uma chave opaca por cliente (nunca o id real).
*/
import { json, methodNotAllowed } from "../../../_lib/http.js";
import { getDb } from "../../../_lib/db.js";
import { getSessionUser, sha256Hex } from "../../../_lib/auth.js";

export async function onRequest({ request, env, params }) {
  if (request.method !== "GET") return methodNotAllowed();
  const db = await getDb(env);
  if (!db) return json(503, { allowReading: false, erro: "BANCO_NAO_CONFIGURADO" });
  const user = await getSessionUser(db, request);
  if (!user) return json(200, { allowReading: false, motivo: "NAO_AUTENTICADO" });
  const row = await db
    .prepare("SELECT 1 AS ok FROM entitlements WHERE user_id = ? AND book_id = ?")
    .bind(user.id, String(params.bookId || ""))
    .first();
  if (!row) return json(200, { allowReading: false, motivo: "SEM_ACESSO" });
  return json(200, {
    allowReading: true,
    readerSubjectKey: (await sha256Hex("reader:" + user.id)).slice(0, 32),
  });
}
