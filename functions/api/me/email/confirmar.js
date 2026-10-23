/*
  POST /api/me/email/confirmar  {codigo}
  Passo 2 da troca de e-mail. Cada tentativa é contada ANTES de comparar
  (UPDATE condicional), então o limite de 5 não pode ser furado com
  requisições paralelas. Código certo -> troca o e-mail no site (UNIQUE
  garante que ninguém tomou o endereço nesse meio tempo) e espelha no
  Asaas; se o Asaas falhar, o e-mail do site volta ao anterior.
  Erros: 400 CODIGO_INVALIDO (errado, expirado, esgotado ou sem pedido) |
  409 EMAIL_EM_USO | 401 NAO_AUTENTICADO | 503 SINCRONIZACAO_INDISPONIVEL.
*/
import { json, methodNotAllowed, readJson, sameOriginOk } from "../../../_lib/http.js";
import { getDb, now } from "../../../_lib/db.js";
import { getSessionUser, timingSafeEqual } from "../../../_lib/auth.js";
import { syncAsaasCustomer, hashCodigo, CODIGO_MAX_TENTATIVAS } from "../../../_lib/account.js";

export async function onRequest({ request, env }) {
  if (request.method !== "POST") return methodNotAllowed();
  if (!sameOriginOk(request)) return json(403, { ok: false, erro: "ORIGEM_INVALIDA" });
  const db = await getDb(env);
  if (!db) return json(503, { ok: false, erro: "BANCO_NAO_CONFIGURADO" });
  const user = await getSessionUser(db, request);
  if (!user) return json(401, { ok: false, erro: "NAO_AUTENTICADO" });

  const body = await readJson(request);
  const codigo = body && typeof body.codigo === "string" ? body.codigo.trim() : "";
  if (!/^\d{6}$/.test(codigo)) return json(400, { ok: false, erro: "CODIGO_INVALIDO" });

  const t = now();
  const tentativa = await db
    .prepare(
      `UPDATE email_change_requests SET attempts = attempts + 1
        WHERE user_id = ? AND expires_at > ? AND attempts < ?`
    )
    .bind(user.id, t, CODIGO_MAX_TENTATIVAS)
    .run();
  if (!tentativa.meta || tentativa.meta.changes !== 1) return json(400, { ok: false, erro: "CODIGO_INVALIDO" });

  const pedido = await db
    .prepare("SELECT new_email, code_hash, attempts FROM email_change_requests WHERE user_id = ?")
    .bind(user.id)
    .first();
  if (!pedido) return json(400, { ok: false, erro: "CODIGO_INVALIDO" });

  const correto = timingSafeEqual(await hashCodigo(user.id, codigo), pedido.code_hash);
  if (!correto) {
    if (pedido.attempts >= CODIGO_MAX_TENTATIVAS) {
      await db.prepare("DELETE FROM email_change_requests WHERE user_id = ?").bind(user.id).run();
    }
    return json(400, { ok: false, erro: "CODIGO_INVALIDO" });
  }

  const emEuso = await db.prepare("SELECT id FROM users WHERE email = ? AND id != ?").bind(pedido.new_email, user.id).first();
  if (emEuso) return json(409, { ok: false, erro: "EMAIL_EM_USO" });

  try {
    await db.prepare("UPDATE users SET email = ? WHERE id = ?").bind(pedido.new_email, user.id).run();
  } catch (e) {
    if (String(e && e.message).includes("UNIQUE")) return json(409, { ok: false, erro: "EMAIL_EM_USO" });
    throw e;
  }

  const falha = await syncAsaasCustomer(env, user, { email: pedido.new_email });
  if (falha) {
    await db.prepare("UPDATE users SET email = ? WHERE id = ?").bind(user.email, user.id).run();
    return falha;
  }
  await db.prepare("DELETE FROM email_change_requests WHERE user_id = ?").bind(user.id).run();
  return json(200, { ok: true, email: pedido.new_email });
}
