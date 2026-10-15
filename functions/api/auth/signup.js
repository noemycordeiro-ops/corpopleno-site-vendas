/*
  POST /api/auth/signup  {email, password, nomeCompleto?}
  Contrato esperado por assets/js/auth-signup.js:
    sucesso -> {ok:true} + cookie de sessão (já entra logado)
    erros   -> EMAIL_INVALIDO | SENHA_FORA_DO_TAMANHO_PERMITIDO | EMAIL_JA_CADASTRADO
*/
import { json, methodNotAllowed, readJson, sameOriginOk, clientIp } from "../../_lib/http.js";
import { getDb, now } from "../../_lib/db.js";
import {
  hashPassword, createSession, sessionCookie, randomId, normalizeEmail, isValidEmail,
  isRateLimited, registerAttempt,
} from "../../_lib/auth.js";

const SIGNUP_LIMIT = 10;
const SIGNUP_WINDOW_MS = 3600 * 1000;

export async function onRequest({ request, env }) {
  if (request.method !== "POST") return methodNotAllowed();
  if (!sameOriginOk(request)) return json(403, { ok: false, erro: "ORIGEM_INVALIDA" });
  const db = await getDb(env);
  if (!db) return json(503, { ok: false, erro: "BANCO_NAO_CONFIGURADO" });

  const body = await readJson(request);
  if (!body) return json(400, { ok: false, erro: "JSON_INVALIDO" });

  const email = normalizeEmail(body.email);
  const password = typeof body.password === "string" ? body.password : "";
  const name = typeof body.nomeCompleto === "string" ? body.nomeCompleto.trim().slice(0, 120) : "";

  if (!isValidEmail(email)) return json(400, { ok: false, erro: "EMAIL_INVALIDO" });
  if (password.length < 8 || password.length > 512) {
    return json(400, { ok: false, erro: "SENHA_FORA_DO_TAMANHO_PERMITIDO" });
  }

  const ipBucket = "signup:ip:" + clientIp(request);
  if (await isRateLimited(db, ipBucket, SIGNUP_LIMIT, SIGNUP_WINDOW_MS)) {
    return json(429, { ok: false, erro: "MUITAS_TENTATIVAS" });
  }
  await registerAttempt(db, ipBucket, SIGNUP_WINDOW_MS);

  const existing = await db.prepare("SELECT id FROM users WHERE email = ?").bind(email).first();
  if (existing) return json(409, { ok: false, erro: "EMAIL_JA_CADASTRADO" });

  const pw = await hashPassword(password);
  const userId = randomId("usr");
  try {
    await db
      .prepare(
        "INSERT INTO users (id, email, name, pw_hash, pw_salt, pw_iter, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)"
      )
      .bind(userId, email, name || null, pw.hash, pw.salt, pw.iterations, now())
      .run();
  } catch (e) {
    if (String(e && e.message).includes("UNIQUE")) return json(409, { ok: false, erro: "EMAIL_JA_CADASTRADO" });
    throw e;
  }

  const token = await createSession(db, userId);
  return json(201, { ok: true }, { "Set-Cookie": sessionCookie(token) });
}
