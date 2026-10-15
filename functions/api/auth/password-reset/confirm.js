/*
  POST /api/auth/password-reset/confirm  {token, password}
  Valida o token (hash no banco, não usado, não expirado) e o "gasta"
  ANTES de trocar a senha (UPDATE condicional), então duas requisições
  com o mesmo token nunca funcionam. Depois grava a nova senha (PBKDF2),
  encerra todas as sessões da conta e zera o limite de login do e-mail.
  Erros: 400 TOKEN_INVALIDO_OU_EXPIRADO | 400 SENHA_FORA_DO_TAMANHO_PERMITIDO.
*/
import { json, methodNotAllowed, readJson, sameOriginOk, clientIp } from "../../../_lib/http.js";
import { getDb, now } from "../../../_lib/db.js";
import { hashPassword, sha256Hex, clearAttempts, isRateLimited, registerAttempt } from "../../../_lib/auth.js";

const WINDOW_MS = 15 * 60 * 1000;

export async function onRequest({ request, env }) {
  if (request.method !== "POST") return methodNotAllowed();
  if (!sameOriginOk(request)) return json(403, { ok: false, erro: "ORIGEM_INVALIDA" });
  const db = await getDb(env);
  if (!db) return json(503, { ok: false, erro: "BANCO_NAO_CONFIGURADO" });

  const body = await readJson(request);
  const token = body && typeof body.token === "string" ? body.token : "";
  const password = body && typeof body.password === "string" ? body.password : "";
  if (password.length < 8 || password.length > 512) {
    return json(400, { ok: false, erro: "SENHA_FORA_DO_TAMANHO_PERMITIDO" });
  }

  const ipBucket = "reset-confirm:ip:" + clientIp(request);
  if (await isRateLimited(db, ipBucket, 20, WINDOW_MS)) return json(429, { ok: false, erro: "MUITAS_TENTATIVAS" });

  if (!/^[A-Za-z0-9_-]{40,60}$/.test(token)) {
    await registerAttempt(db, ipBucket, WINDOW_MS);
    return json(400, { ok: false, erro: "TOKEN_INVALIDO_OU_EXPIRADO" });
  }

  const tokenHash = await sha256Hex(token);
  const t = now();
  const gasto = await db
    .prepare("UPDATE password_resets SET used_at = ? WHERE token_hash = ? AND used_at IS NULL AND expires_at > ?")
    .bind(t, tokenHash, t)
    .run();
  if (!gasto.meta || gasto.meta.changes !== 1) {
    await registerAttempt(db, ipBucket, WINDOW_MS);
    return json(400, { ok: false, erro: "TOKEN_INVALIDO_OU_EXPIRADO" });
  }

  const row = await db
    .prepare("SELECT r.user_id, u.email FROM password_resets r JOIN users u ON u.id = r.user_id WHERE r.token_hash = ?")
    .bind(tokenHash)
    .first();
  const pw = await hashPassword(password);
  await db.batch([
    db.prepare("UPDATE users SET pw_hash = ?, pw_salt = ?, pw_iter = ? WHERE id = ?").bind(pw.hash, pw.salt, pw.iterations, row.user_id),
    db.prepare("DELETE FROM sessions WHERE user_id = ?").bind(row.user_id),
    db.prepare("UPDATE password_resets SET used_at = ? WHERE user_id = ? AND used_at IS NULL").bind(t, row.user_id),
  ]);
  await clearAttempts(db, "login:email:" + row.email);
  return json(200, { ok: true });
}
