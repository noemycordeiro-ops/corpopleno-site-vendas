/*
  POST /api/auth/signup  {nomeCompleto, email, telefone, password, termsAccepted:true}
  Todos os campos obrigatórios e validados aqui no servidor.
  Contrato esperado por assets/js/auth-signup.js:
    sucesso -> 201 {ok:true} + cookie de sessão (já entra logado)
    erros   -> NOME_INVALIDO | EMAIL_INVALIDO | TELEFONE_INVALIDO |
               SENHA_FORA_DO_TAMANHO_PERMITIDO | TERMS_NOT_ACCEPTED | EMAIL_JA_CADASTRADO
  LGPD: só o mínimo para conta e compras (nome, e-mail, telefone); a
  senha existe apenas como hash PBKDF2 e nunca é logada nem devolvida;
  o momento do aceite dos Termos/Política fica registrado.
*/
import { json, methodNotAllowed, readJson, sameOriginOk, clientIp } from "../../_lib/http.js";
import { getDb, now } from "../../_lib/db.js";
import { sendEmail } from "../../_lib/email.js";
import { welcomeEmail } from "../../_lib/welcome-email.js";
import {
  hashPassword, createSession, sessionCookie, randomId, normalizeEmail, isValidEmail,
  isRateLimited, registerAttempt, normalizeName, isValidFullName, normalizePhone, isValidPhone,
} from "../../_lib/auth.js";

const SIGNUP_LIMIT = 10;
const SIGNUP_WINDOW_MS = 3600 * 1000;

export async function onRequest({ request, env, waitUntil }) {
  if (request.method !== "POST") return methodNotAllowed();
  if (!sameOriginOk(request)) return json(403, { ok: false, erro: "ORIGEM_INVALIDA" });
  const db = await getDb(env);
  if (!db) return json(503, { ok: false, erro: "BANCO_NAO_CONFIGURADO" });

  const body = await readJson(request);
  if (!body) return json(400, { ok: false, erro: "JSON_INVALIDO" });

  const email = normalizeEmail(body.email);
  const password = typeof body.password === "string" ? body.password : "";
  const name = normalizeName(body.nomeCompleto);
  const phone = normalizePhone(body.telefone);

  if (!isValidFullName(name)) return json(400, { ok: false, erro: "NOME_INVALIDO" });
  if (!isValidEmail(email)) return json(400, { ok: false, erro: "EMAIL_INVALIDO" });
  if (!isValidPhone(phone)) return json(400, { ok: false, erro: "TELEFONE_INVALIDO" });
  if (password.length < 8 || password.length > 512) {
    return json(400, { ok: false, erro: "SENHA_FORA_DO_TAMANHO_PERMITIDO" });
  }
  if (body.termsAccepted !== true) return json(400, { ok: false, erro: "TERMS_NOT_ACCEPTED" });

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
        `INSERT INTO users (id, email, name, phone, terms_accepted_at, pw_hash, pw_salt, pw_iter, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(userId, email, name, phone, now(), pw.hash, pw.salt, pw.iterations, now())
      .run();
  } catch (e) {
    if (String(e && e.message).includes("UNIQUE")) return json(409, { ok: false, erro: "EMAIL_JA_CADASTRADO" });
    throw e;
  }

  const token = await createSession(db, userId);
  // Boas-vindas em segundo plano: falha no envio nunca afeta o cadastro.
  const boasVindas = sendEmail(env, { to: email, ...welcomeEmail(name.split(" ")[0], new URL(request.url).origin) })
    .then((r) => { if (!r.sent) console.error("[signup] boas-vindas não enviado:", r.reason); })
    .catch(() => {});
  if (typeof waitUntil === "function") waitUntil(boasVindas);
  return json(201, { ok: true }, { "Set-Cookie": sessionCookie(token) });
}
