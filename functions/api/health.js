/*
  GET /api/health -- diagnóstico de configuração. Mostra só se cada item
  está configurado (true/false), o ambiente Asaas efetivo e os NOMES do
  que falta; NUNCA mostra valores.
*/
import { json, methodNotAllowed } from "../_lib/http.js";
import { getDb } from "../_lib/db.js";
import { asaasEnvironment } from "../_lib/asaas.js";
import { emailConfigured } from "../_lib/email.js";

export async function onRequest({ request, env }) {
  if (request.method !== "GET") return methodNotAllowed();

  let banco = false;
  let tabelas = null;
  try {
    const db = await getDb(env);
    if (db) {
      const r = await db.prepare("SELECT COUNT(*) AS n FROM sqlite_master WHERE type = 'table' AND name NOT LIKE '\\_%' ESCAPE '\\' AND name NOT LIKE 'sqlite%'").first();
      banco = true;
      tabelas = r ? r.n : null;
    }
  } catch (_) {
    banco = false;
  }

  const faltando = [];
  if (!env.DB) faltando.push("DB (binding D1)");
  if (!env.ASAAS_API_KEY) faltando.push("ASAAS_API_KEY");
  if (!env.ASAAS_WEBHOOK_TOKEN) faltando.push("ASAAS_WEBHOOK_TOKEN");
  if (!env.ADMIN_API_TOKEN) faltando.push("ADMIN_API_TOKEN");
  if (!env.RESEND_API_KEY) faltando.push("RESEND_API_KEY");
  if (!env.EMAIL_FROM) faltando.push("EMAIL_FROM");

  return json(200, {
    ok: true,
    banco,
    tabelas,
    asaasAmbiente: asaasEnvironment(env), // "sandbox" | "production" | null
    webhookConfigurado: !!env.ASAAS_WEBHOOK_TOKEN,
    adminConfigurado: !!env.ADMIN_API_TOKEN,
    emailConfigurado: emailConfigured(env),
    faltando,
  });
}
