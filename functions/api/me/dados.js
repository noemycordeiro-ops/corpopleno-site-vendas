/*
  GET /api/me/dados -- e-mail e telefone da cliente logada.
  Logado -> 200 {ok:true, email, telefone} | não logado -> 401 NAO_AUTENTICADO.
*/
import { json, methodNotAllowed } from "../../_lib/http.js";
import { getDb } from "../../_lib/db.js";
import { getSessionUser } from "../../_lib/auth.js";

export async function onRequest({ request, env }) {
  if (request.method !== "GET") return methodNotAllowed();
  const db = await getDb(env);
  if (!db) return json(503, { ok: false, erro: "BANCO_NAO_CONFIGURADO" });
  const session = await getSessionUser(db, request);
  if (!session) return json(401, { ok: false, erro: "NAO_AUTENTICADO" });
  const user = await db.prepare("SELECT email, phone FROM users WHERE id = ?").bind(session.id).first();
  return json(200, { ok: true, email: user.email, telefone: user.phone });
}
