/*
  POST /api/auth/login  {email, password}
  Contrato de assets/js/auth-login.js: {ok:true} + cookie | erro CREDENCIAIS_INVALIDAS.
  Força bruta: 5 falhas por e-mail / 30 por IP a cada 15 min -> 429 MUITAS_TENTATIVAS.
*/
import { json, methodNotAllowed, readJson, sameOriginOk, clientIp } from "../../_lib/http.js";
import { getDb } from "../../_lib/db.js";
import {
  verifyPassword, dummyVerify, createSession, sessionCookie, normalizeEmail,
  isRateLimited, registerAttempt, clearAttempts,
} from "../../_lib/auth.js";

const WINDOW_MS = 15 * 60 * 1000;
const EMAIL_LIMIT = 5;
const IP_LIMIT = 30;

export async function onRequest({ request, env }) {
  if (request.method !== "POST") return methodNotAllowed();
  if (!sameOriginOk(request)) return json(403, { ok: false, erro: "ORIGEM_INVALIDA" });
  const db = await getDb(env);
  if (!db) return json(503, { ok: false, erro: "BANCO_NAO_CONFIGURADO" });

  const body = await readJson(request);
  const email = normalizeEmail(body && body.email);
  const password = body && typeof body.password === "string" ? body.password : "";
  if (!email || !password || password.length > 512) {
    return json(401, { ok: false, erro: "CREDENCIAIS_INVALIDAS" });
  }

  const emailBucket = "login:email:" + email;
  const ipBucket = "login:ip:" + clientIp(request);
  if (
    (await isRateLimited(db, emailBucket, EMAIL_LIMIT, WINDOW_MS)) ||
    (await isRateLimited(db, ipBucket, IP_LIMIT, WINDOW_MS))
  ) {
    return json(429, { ok: false, erro: "MUITAS_TENTATIVAS" });
  }

  const user = await db
    .prepare("SELECT id, pw_hash, pw_salt, pw_iter FROM users WHERE email = ?")
    .bind(email)
    .first();
  const valid = user ? await verifyPassword(password, user) : await dummyVerify(password);

  if (!valid) {
    await registerAttempt(db, emailBucket, WINDOW_MS);
    await registerAttempt(db, ipBucket, WINDOW_MS);
    return json(401, { ok: false, erro: "CREDENCIAIS_INVALIDAS" });
  }

  await clearAttempts(db, emailBucket);
  const token = await createSession(db, user.id);
  return json(200, { ok: true }, { "Set-Cookie": sessionCookie(token) });
}
