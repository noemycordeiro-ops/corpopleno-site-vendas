/*
  Consulta administrativa SOMENTE LEITURA de compras (por código CP-… ou
  listagem). Protegida por um Secret; sem ele responde 503. Nunca devolve
  hash/salt de senha, tokens de sessão nem chaves; CPF/CNPJ sai mascarado.
*/
import { json, methodNotAllowed } from "../../_lib/http.js";
import { getDb } from "../../_lib/db.js";
import { timingSafeEqual } from "../../_lib/auth.js";

const STATUSES = new Set(["CREATING", "PENDING", "PAID", "CANCELLED", "EXPIRED", "FAILED"]);

const SELECT = `
  SELECT p.id, p.product_id, p.amount_cents, p.payment_method, p.installment_count, p.status,
         p.asaas_payment_id, p.asaas_installment_id, p.invoice_url, p.created_at, p.updated_at, p.paid_at,
         u.id AS user_id, u.name, u.email, u.phone, u.cpf_cnpj, u.asaas_customer_id
    FROM purchases p JOIN users u ON u.id = p.user_id`;

function maskDocument(doc) {
  if (!doc) return null;
  return doc.length === 11
    ? `***.${doc.slice(3, 6)}.${doc.slice(6, 9)}-**`
    : `**.***.${doc.slice(5, 8)}/${doc.slice(8, 12)}-**`;
}

function iso(ms) {
  return ms ? new Date(ms).toISOString() : null;
}

function shape(row, books) {
  return {
    purchaseCode: row.id,
    status: row.status,
    productId: row.product_id,
    amount: row.amount_cents / 100,
    currency: "BRL",
    paymentMethod: row.payment_method,
    installmentCount: row.installment_count,
    asaasPaymentId: row.asaas_payment_id,
    asaasInstallmentId: row.asaas_installment_id,
    invoiceUrl: row.invoice_url,
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at),
    paidAt: iso(row.paid_at),
    customer: {
      id: row.user_id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      document: maskDocument(row.cpf_cnpj),
      asaasCustomerId: row.asaas_customer_id,
    },
    grantedBooks: books,
  };
}

export async function onRequest({ request, env }) {
  if (request.method !== "GET") return methodNotAllowed();
  if (!env.ADMIN_API_TOKEN) return json(503, { ok: false, erro: "ADMIN_NAO_CONFIGURADO" });
  const auth = request.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (!token || !timingSafeEqual(token, env.ADMIN_API_TOKEN)) {
    return json(401, { ok: false, erro: "NAO_AUTORIZADO" });
  }

  const db = await getDb(env);
  if (!db) return json(503, { ok: false, erro: "BANCO_NAO_CONFIGURADO" });

  const url = new URL(request.url);
  const code = (url.searchParams.get("code") || "").trim().toUpperCase();

  if (code) {
    if (!/^CP-[0-9A-Z]{8}$/.test(code)) return json(400, { ok: false, erro: "CODIGO_INVALIDO" });
    const row = await db.prepare(`${SELECT} WHERE p.id = ?`).bind(code).first();
    if (!row) return json(404, { ok: false, erro: "COMPRA_NAO_ENCONTRADA" });
    const { results } = await db
      .prepare("SELECT book_id FROM entitlements WHERE purchase_id = ? ORDER BY book_id")
      .bind(code)
      .all();
    return json(200, { ok: true, purchase: shape(row, (results || []).map((r) => r.book_id)) });
  }

  const status = (url.searchParams.get("status") || "").toUpperCase();
  if (status && !STATUSES.has(status)) return json(400, { ok: false, erro: "STATUS_INVALIDO" });
  const limit = Math.min(Math.max(parseInt(url.searchParams.get("limit") || "50", 10) || 50, 1), 200);
  const before = parseInt(url.searchParams.get("before") || "", 10);

  const where = [];
  const binds = [];
  if (status) { where.push("p.status = ?"); binds.push(status); }
  if (Number.isFinite(before)) { where.push("p.created_at < ?"); binds.push(before); }
  const sql = `${SELECT}${where.length ? " WHERE " + where.join(" AND ") : ""} ORDER BY p.created_at DESC LIMIT ?`;
  const { results } = await db.prepare(sql).bind(...binds, limit).all();
  const rows = results || [];

  const booksByPurchase = {};
  if (rows.length) {
    const ids = rows.map((r) => r.id);
    const ent = await db
      .prepare(`SELECT purchase_id, book_id FROM entitlements WHERE purchase_id IN (${ids.map(() => "?").join(",")})`)
      .bind(...ids)
      .all();
    for (const e of ent.results || []) (booksByPurchase[e.purchase_id] ||= []).push(e.book_id);
  }

  const purchases = rows.map((r) => shape(r, booksByPurchase[r.id] || []));
  return json(200, {
    ok: true,
    count: purchases.length,
    purchases,
    nextBefore: rows.length === limit ? rows[rows.length - 1].created_at : null,
  });
}
