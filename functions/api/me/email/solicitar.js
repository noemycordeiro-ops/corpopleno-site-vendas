/*
  POST /api/me/email/solicitar  {novoEmail, senha}
  Passo 1 da troca de e-mail: confere a senha atual, garante que o novo
  endereço está livre e envia um código de 6 dígitos para o NOVO endereço
  (válido por 15 minutos). Um pedido pendente por cliente; o código fica no
  banco só como hash. Limites: 5 senhas erradas a cada 15 min e 5 códigos
  enviados a cada hora (429 MUITAS_TENTATIVAS).
  Erros: 400 EMAIL_INVALIDO | 400 MESMO_EMAIL | 401 SENHA_INCORRETA |
  409 EMAIL_EM_USO | 429 MUITAS_TENTATIVAS | 503 EMAIL_NAO_CONFIGURADO |
  502 EMAIL_NAO_ENVIADO.
*/
import { json, methodNotAllowed, readJson, sameOriginOk } from "../../../_lib/http.js";
import { getDb, now } from "../../../_lib/db.js";
import {
  getSessionUser, normalizeEmail, isValidEmail, verifyPassword, dummyVerify,
  isRateLimited, registerAttempt, clearAttempts,
} from "../../../_lib/auth.js";
import { sendEmail, emailConfigured } from "../../../_lib/email.js";
import { emailChangeCodeEmail } from "../../../_lib/email-change-email.js";
import { codigoAleatorio, hashCodigo, CODIGO_TTL_MS } from "../../../_lib/account.js";

const SENHA_WINDOW_MS = 15 * 60 * 1000;
const SENHA_LIMIT = 5;
const ENVIO_WINDOW_MS = 60 * 60 * 1000;
const ENVIO_LIMIT = 5;

export async function onRequest({ request, env }) {
  if (request.method !== "POST") return methodNotAllowed();
  if (!sameOriginOk(request)) return json(403, { ok: false, erro: "ORIGEM_INVALIDA" });
  const db = await getDb(env);
  if (!db) return json(503, { ok: false, erro: "BANCO_NAO_CONFIGURADO" });
  const user = await getSessionUser(db, request);
  if (!user) return json(401, { ok: false, erro: "NAO_AUTENTICADO" });

  const body = await readJson(request);
  const novoEmail = normalizeEmail(body && body.novoEmail);
  const senha = body && typeof body.senha === "string" ? body.senha : "";
  if (!isValidEmail(novoEmail)) return json(400, { ok: false, erro: "EMAIL_INVALIDO" });
  if (novoEmail === user.email) return json(400, { ok: false, erro: "MESMO_EMAIL" });
  if (!senha || senha.length > 512) return json(401, { ok: false, erro: "SENHA_INCORRETA" });
  if (!emailConfigured(env)) return json(503, { ok: false, erro: "EMAIL_NAO_CONFIGURADO" });

  const senhaBucket = "email-change-senha:user:" + user.id;
  const envioBucket = "email-change-envio:user:" + user.id;
  if (
    (await isRateLimited(db, senhaBucket, SENHA_LIMIT, SENHA_WINDOW_MS)) ||
    (await isRateLimited(db, envioBucket, ENVIO_LIMIT, ENVIO_WINDOW_MS))
  ) {
    return json(429, { ok: false, erro: "MUITAS_TENTATIVAS" });
  }

  const conta = await db.prepare("SELECT pw_hash, pw_salt, pw_iter FROM users WHERE id = ?").bind(user.id).first();
  const senhaOk = conta ? await verifyPassword(senha, conta) : await dummyVerify(senha);
  if (!senhaOk) {
    await registerAttempt(db, senhaBucket, SENHA_WINDOW_MS);
    return json(401, { ok: false, erro: "SENHA_INCORRETA" });
  }
  await clearAttempts(db, senhaBucket);

  const emEuso = await db.prepare("SELECT id FROM users WHERE email = ?").bind(novoEmail).first();
  if (emEuso) return json(409, { ok: false, erro: "EMAIL_EM_USO" });

  const codigo = codigoAleatorio();
  const t = now();
  await db
    .prepare(
      `INSERT INTO email_change_requests (user_id, new_email, code_hash, attempts, created_at, expires_at)
       VALUES (?, ?, ?, 0, ?, ?)
       ON CONFLICT(user_id) DO UPDATE SET
         new_email = excluded.new_email, code_hash = excluded.code_hash,
         attempts = 0, created_at = excluded.created_at, expires_at = excluded.expires_at`
    )
    .bind(user.id, novoEmail, await hashCodigo(user.id, codigo), t, t + CODIGO_TTL_MS)
    .run();

  const primeiroNome = (user.name || "").split(" ")[0] || "";
  const result = await sendEmail(env, { to: novoEmail, ...emailChangeCodeEmail(primeiroNome, codigo) });
  // Nunca loga o código.
  if (!result.sent) {
    console.error("[email-change] e-mail não enviado:", result.reason);
    await db.prepare("DELETE FROM email_change_requests WHERE user_id = ?").bind(user.id).run();
    return json(502, { ok: false, erro: "EMAIL_NAO_ENVIADO" });
  }
  await registerAttempt(db, envioBucket, ENVIO_WINDOW_MS);
  return json(200, { ok: true, novoEmail, expiraEm: t + CODIGO_TTL_MS });
}
