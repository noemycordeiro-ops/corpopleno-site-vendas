/*
  POST /api/auth/password-reset/request  {email}
  Sempre responde 200 {ok:true} (mesmo se o e-mail não existir), para não
  revelar quem tem conta. Se existir: invalida pedidos anteriores, cria um
  token de uso único (no banco fica só o SHA-256), válido por 60 minutos,
  e envia o link por e-mail (functions/_lib/email.js).
  Limite: 3 pedidos por e-mail e 10 por IP a cada hora (429 MUITAS_TENTATIVAS).
*/
import { json, methodNotAllowed, readJson, sameOriginOk, clientIp } from "../../../_lib/http.js";
import { getDb, now } from "../../../_lib/db.js";
import { normalizeEmail, isValidEmail, isRateLimited, registerAttempt, randomToken, sha256Hex } from "../../../_lib/auth.js";
import { sendEmail, emailConfigured } from "../../../_lib/email.js";

const TTL_MS = 60 * 60 * 1000;
const WINDOW_MS = 60 * 60 * 1000;

export async function onRequest({ request, env }) {
  if (request.method !== "POST") return methodNotAllowed();
  if (!sameOriginOk(request)) return json(403, { ok: false, erro: "ORIGEM_INVALIDA" });
  const db = await getDb(env);
  if (!db) return json(503, { ok: false, erro: "BANCO_NAO_CONFIGURADO" });

  const body = await readJson(request);
  const email = normalizeEmail(body && body.email);
  if (!isValidEmail(email)) return json(400, { ok: false, erro: "EMAIL_INVALIDO" });

  const emailBucket = "reset:email:" + email;
  const ipBucket = "reset:ip:" + clientIp(request);
  if ((await isRateLimited(db, emailBucket, 3, WINDOW_MS)) || (await isRateLimited(db, ipBucket, 10, WINDOW_MS))) {
    return json(429, { ok: false, erro: "MUITAS_TENTATIVAS" });
  }
  await registerAttempt(db, emailBucket, WINDOW_MS);
  await registerAttempt(db, ipBucket, WINDOW_MS);

  const user = await db.prepare("SELECT id, name FROM users WHERE email = ?").bind(email).first();
  if (user) {
    const token = randomToken();
    const t = now();
    await db.batch([
      db.prepare("UPDATE password_resets SET used_at = ? WHERE user_id = ? AND used_at IS NULL").bind(t, user.id),
      db.prepare("INSERT INTO password_resets (token_hash, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)")
        .bind(await sha256Hex(token), user.id, t, t + TTL_MS),
    ]);
    const link = `${new URL(request.url).origin}/redefinir-senha.html#token=${token}`;
    const primeiroNome = (user.name || "").split(" ")[0] || "";
    const result = await sendEmail(env, {
      to: email,
      subject: "CorpoPleno — redefinição de senha",
      text:
        `Olá${primeiroNome ? " " + primeiroNome : ""},\n\n` +
        `Recebemos um pedido para redefinir a senha da sua conta CorpoPleno.\n` +
        `Para criar uma nova senha, abra o link abaixo (válido por 60 minutos, uso único):\n\n${link}\n\n` +
        `Se não foi você, ignore este e-mail: sua senha continua a mesma.\n`,
    });
    // Nunca loga o token nem o link.
    if (!result.sent) console.error("[password-reset] e-mail não enviado:", result.reason);
  }

  return json(200, { ok: true, emailConfigurado: emailConfigured(env) });
}
