/*
  POST /api/me/telefone  {telefone}
  Atualiza o telefone da cliente logada e, se ela já tiver cliente no
  Asaas, espelha o mesmo número lá (mobilePhone). Se o Asaas falhar, nada
  muda no site: o cadastro nunca fica diferente entre os dois.
  Erros: 400 TELEFONE_INVALIDO | 401 NAO_AUTENTICADO | 503 SINCRONIZACAO_INDISPONIVEL.
*/
import { json, methodNotAllowed, readJson, sameOriginOk } from "../../_lib/http.js";
import { getDb } from "../../_lib/db.js";
import { getSessionUser, normalizePhone, isValidPhone } from "../../_lib/auth.js";
import { syncAsaasCustomer } from "../../_lib/account.js";

export async function onRequest({ request, env }) {
  if (request.method !== "POST") return methodNotAllowed();
  if (!sameOriginOk(request)) return json(403, { ok: false, erro: "ORIGEM_INVALIDA" });
  const db = await getDb(env);
  if (!db) return json(503, { ok: false, erro: "BANCO_NAO_CONFIGURADO" });
  const user = await getSessionUser(db, request);
  if (!user) return json(401, { ok: false, erro: "NAO_AUTENTICADO" });

  const body = await readJson(request);
  const telefone = normalizePhone(body && body.telefone);
  if (!isValidPhone(telefone)) return json(400, { ok: false, erro: "TELEFONE_INVALIDO" });

  const falha = await syncAsaasCustomer(env, user, { mobilePhone: telefone });
  if (falha) return falha;
  await db.prepare("UPDATE users SET phone = ? WHERE id = ?").bind(telefone, user.id).run();
  return json(200, { ok: true, telefone });
}
