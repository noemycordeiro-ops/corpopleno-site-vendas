/*
  Cliente mínimo da API Asaas (v3). Autenticação pelo header
  `access_token` (exigência do Asaas -- não é Bearer). A chave vem SÓ de
  env.ASAAS_API_KEY (Secret no Cloudflare); nunca é logada nem devolvida.
  Nenhum dado de cartão passa por aqui: o cliente paga na fatura
  hospedada do Asaas (invoiceUrl), tanto PIX quanto cartão.
*/

export const ASAAS_PRODUCTION_URL = "https://api.asaas.com/v3";

export class AsaasError extends Error {
  constructor(kind, status, detail) {
    super(`asaas_${kind}_${status}`);
    this.kind = kind; // "rejected" (4xx) | "unavailable" (rede/5xx)
    this.status = status;
    this.detail = detail;
  }
}

export function asaasConfig(env) {
  if (!env.ASAAS_API_KEY) return null;
  const baseUrl = (env.ASAAS_API_URL || ASAAS_PRODUCTION_URL).replace(/\/+$/, "");
  return { baseUrl, apiKey: env.ASAAS_API_KEY };
}

async function call(cfg, method, path, body) {
  let res;
  try {
    res = await fetch(cfg.baseUrl + path, {
      method,
      headers: {
        access_token: cfg.apiKey,
        "Content-Type": "application/json",
        "User-Agent": "CorpoPleno-Site/1.0",
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (e) {
    throw new AsaasError("unavailable", 0, "network");
  }
  let data = null;
  try { data = await res.json(); } catch (_) { data = null; }
  if (res.status >= 500 || res.status === 429) throw new AsaasError("unavailable", res.status, null);
  if (!res.ok) {
    // Só os códigos de erro do Asaas (nunca a chave) vão para o log.
    const codes = data && Array.isArray(data.errors) ? data.errors.map((e) => e.code).join(",") : "";
    throw new AsaasError("rejected", res.status, codes);
  }
  return data;
}

export async function findOrCreateCustomer(cfg, { userId, name, email, cpfCnpj }) {
  const found = await call(cfg, "GET", `/customers?externalReference=${encodeURIComponent(userId)}&limit=1`);
  if (found && Array.isArray(found.data) && found.data.length > 0 && found.data[0].id) {
    return found.data[0].id;
  }
  const created = await call(cfg, "POST", "/customers", {
    name,
    email,
    cpfCnpj,
    externalReference: userId,
  });
  return created.id;
}

export async function createPayment(cfg, p) {
  const payload = {
    customer: p.customerId,
    billingType: p.billingType,
    dueDate: p.dueDate,
    description: p.description,
    externalReference: p.externalReference,
  };
  if (p.installmentCount > 1) {
    payload.installmentCount = p.installmentCount;
    payload.totalValue = p.valueCents / 100;
  } else {
    payload.value = p.valueCents / 100;
  }
  return call(cfg, "POST", "/payments", payload);
}

export async function deletePayment(cfg, purchase) {
  if (purchase.asaas_installment_id) {
    return call(cfg, "DELETE", `/installments/${encodeURIComponent(purchase.asaas_installment_id)}`);
  }
  return call(cfg, "DELETE", `/payments/${encodeURIComponent(purchase.asaas_payment_id)}`);
}

// Data de vencimento em America/Sao_Paulo (UTC-3, sem horário de verão).
export function dueDateInDays(days) {
  return new Date(Date.now() - 3 * 3600 * 1000 + days * 86400 * 1000).toISOString().slice(0, 10);
}

/* ---- CPF/CNPJ -------------------------------------------------------- */

export function normalizeDocument(value) {
  return typeof value === "string" ? value.replace(/\D/g, "") : "";
}

function cpfValid(c) {
  if (!/^\d{11}$/.test(c) || /^(\d)\1{10}$/.test(c)) return false;
  for (const len of [9, 10]) {
    let sum = 0;
    for (let i = 0; i < len; i++) sum += Number(c[i]) * (len + 1 - i);
    const dv = ((sum * 10) % 11) % 10;
    if (dv !== Number(c[len])) return false;
  }
  return true;
}

function cnpjValid(c) {
  if (!/^\d{14}$/.test(c) || /^(\d)\1{13}$/.test(c)) return false;
  const calc = (len) => {
    const w = len === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let sum = 0;
    for (let i = 0; i < len; i++) sum += Number(c[i]) * w[i];
    const r = sum % 11;
    return r < 2 ? 0 : 11 - r;
  };
  return calc(12) === Number(c[12]) && calc(13) === Number(c[13]);
}

export function isValidDocument(doc) {
  return doc.length === 11 ? cpfValid(doc) : doc.length === 14 ? cnpjValid(doc) : false;
}
