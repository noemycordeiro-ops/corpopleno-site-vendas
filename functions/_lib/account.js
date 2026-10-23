/*
  Dados pessoais da cliente (telefone e e-mail) e espelhamento no Asaas.
*/
import { json } from "./http.js";
import { asaasConfig, updateCustomer, AsaasError } from "./asaas.js";
import { sha256Hex } from "./auth.js";

export const CODIGO_TTL_MS = 15 * 60 * 1000;
export const CODIGO_MAX_TENTATIVAS = 5;

export function codigoAleatorio() {
  const n = crypto.getRandomValues(new Uint32Array(1))[0] % 1000000;
  return String(n).padStart(6, "0");
}

export function hashCodigo(userId, codigo) {
  return sha256Hex(`${userId}:${codigo}`);
}

// Atualiza o cliente no Asaas, se a cliente já tiver um. Devolve null se
// tudo certo (ou se ainda não há cliente Asaas), ou a Response de erro.
export async function syncAsaasCustomer(env, user, fields) {
  if (!user.asaas_customer_id) return null;
  const cfg = asaasConfig(env);
  if (!cfg) return json(503, { ok: false, erro: "SINCRONIZACAO_INDISPONIVEL" });
  try {
    await updateCustomer(cfg, user.asaas_customer_id, fields);
    return null;
  } catch (e) {
    if (!(e instanceof AsaasError)) throw e;
    console.error("[conta] asaas", e.kind, e.status, e.detail || "");
    return json(503, { ok: false, erro: "SINCRONIZACAO_INDISPONIVEL" });
  }
}
