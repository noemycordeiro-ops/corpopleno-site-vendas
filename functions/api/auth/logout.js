/* POST /api/auth/logout -- apaga a sessão no banco e expira o cookie. */
import { json, methodNotAllowed, sameOriginOk } from "../../_lib/http.js";
import { getDb } from "../../_lib/db.js";
import { destroySession, clearSessionCookie } from "../../_lib/auth.js";

export async function onRequest({ request, env }) {
  if (request.method !== "POST") return methodNotAllowed();
  if (!sameOriginOk(request)) return json(403, { ok: false, erro: "ORIGEM_INVALIDA" });
  const db = await getDb(env);
  if (db) await destroySession(db, request);
  return json(200, { ok: true }, { "Set-Cookie": clearSessionCookie() });
}
