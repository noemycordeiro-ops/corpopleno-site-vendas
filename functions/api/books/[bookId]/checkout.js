/*
  POST /api/books/:bookId/checkout
  Corpo: {paymentMethod: "PIX"|"CREDIT_CARD", termsAccepted: true,
          cpfCnpj?, nomeCompleto?, installmentCount?}

  - Sessão obrigatória (cookie HttpOnly) -> 401 NAO_AUTENTICADO.
  - Preço SEMPRE do catálogo do servidor (functions/_lib/catalog.js).
  - Cliente Asaas criado/reutilizado (externalReference = id do usuário).
  - Idempotência: no máximo uma compra em aberto por (usuário, produto)
    (índice único parcial no D1). Repetir com o mesmo método devolve a
    mesma fatura; trocar de método cancela a cobrança anterior no Asaas.
  - Código de compra único CP-XXXXXXXX (= purchases.id = externalReference no Asaas).
  - Resposta 201 {ok:true, paymentMethod, invoiceUrl, purchaseCode, purchaseId}.
    O pagamento (PIX ou cartão) acontece na fatura hospedada do Asaas --
    nenhum dado de cartão passa pelo site.
*/
import { json, methodNotAllowed, readJson, sameOriginOk } from "../../../_lib/http.js";
import { getDb, now } from "../../../_lib/db.js";
import { getSessionUser, purchaseCode } from "../../../_lib/auth.js";
import { getProduct } from "../../../_lib/catalog.js";
import {
  asaasConfig, findOrCreateCustomer, createPayment, deletePayment, dueDateInDays,
  normalizeDocument, isValidDocument, AsaasError,
} from "../../../_lib/asaas.js";

const PENDING_MAX_AGE_MS = 3 * 24 * 3600 * 1000;

export async function onRequest({ request, env, params }) {
  if (request.method !== "POST") return methodNotAllowed();
  if (!sameOriginOk(request)) return json(403, { ok: false, erro: "ORIGEM_INVALIDA" });

  const db = await getDb(env);
  if (!db) return json(503, { ok: false, erro: "PAYMENT_PROVIDER_UNAVAILABLE" });

  const user = await getSessionUser(db, request);
  if (!user) return json(401, { ok: false, erro: "NAO_AUTENTICADO" });

  const body = await readJson(request);
  if (!body) return json(400, { ok: false, erro: "JSON_INVALIDO" });
  if (body.termsAccepted !== true) return json(400, { ok: false, erro: "TERMS_NOT_ACCEPTED" });

  const method = body.paymentMethod || "PIX";
  if (method !== "PIX" && method !== "CREDIT_CARD") {
    return json(400, { ok: false, erro: "PAYMENT_METHOD_NOT_ALLOWED" });
  }

  const productId = String(params.bookId || "");
  const product = getProduct(productId);
  if (!product) return json(409, { ok: false, erro: "BOOK_PRICE_NOT_CONFIGURED" });

  let installments = 1;
  if (method === "CREDIT_CARD" && body.installmentCount != null) {
    installments = Number(body.installmentCount);
    if (!Number.isInteger(installments) || installments < 1 || installments > product.maxInstallments) {
      return json(400, { ok: false, erro: "INSTALLMENTS_NOT_ALLOWED" });
    }
  }

  // Já possui todos os livros do produto? Não cobra de novo.
  const owned = await db
    .prepare(`SELECT COUNT(*) AS n FROM entitlements WHERE user_id = ? AND book_id IN (${product.items.map(() => "?").join(",")})`)
    .bind(user.id, ...product.items)
    .first();
  if (owned && owned.n >= product.items.length) return json(409, { ok: false, erro: "ALREADY_OWNED" });

  const cfg = asaasConfig(env);
  if (!cfg) return json(503, { ok: false, erro: "AMBIENTE_ASAAS_NAO_CONFIGURADO" });

  // ---- Compra em aberto já existente? ---------------------------------
  const open = await db
    .prepare("SELECT * FROM purchases WHERE user_id = ? AND product_id = ? AND status IN ('CREATING','PENDING')")
    .bind(user.id, productId)
    .first();
  if (open) {
    if (open.status === "CREATING") {
      if (open.updated_at + 60 * 1000 > now()) {
        return json(409, { ok: false, erro: "PAYMENT_ATTEMPT_ALREADY_DISPATCHING" });
      }
      await setStatus(db, open.id, "FAILED"); // reserva órfã (ex.: timeout)
    } else if (open.created_at + PENDING_MAX_AGE_MS < now()) {
      await setStatus(db, open.id, "EXPIRED");
    } else if (open.payment_method === method && open.installment_count === installments && open.invoice_url) {
      return json(201, { ok: true, reused: true, paymentMethod: method, invoiceUrl: open.invoice_url, purchaseCode: open.id, purchaseId: open.id });
    } else {
      // Troca de método/parcelas: cancela a cobrança anterior antes de criar outra,
      // para nunca existirem duas cobranças pagáveis do mesmo produto.
      try {
        await deletePayment(cfg, open);
      } catch (e) {
        console.error("[checkout] falha ao cancelar cobrança anterior", e.message);
        return json(409, { ok: false, erro: "PAYMENT_ATTEMPT_ALREADY_DISPATCHING" });
      }
      await setStatus(db, open.id, "CANCELLED");
    }
  }

  // ---- Dados do cliente para o Asaas -----------------------------------
  let cpfCnpj = user.cpf_cnpj;
  if (!user.asaas_customer_id && !cpfCnpj) {
    const doc = normalizeDocument(body.cpfCnpj);
    if (!doc) return json(400, { ok: false, erro: "CUSTOMER_DOCUMENT_REQUIRED" });
    if (!isValidDocument(doc)) return json(400, { ok: false, erro: "CUSTOMER_DOCUMENT_INVALID" });
    cpfCnpj = doc;
  }
  let name = user.name;
  if (!name) {
    name = typeof body.nomeCompleto === "string" ? body.nomeCompleto.trim().slice(0, 120) : "";
    if (name.length < 3) return json(400, { ok: false, erro: "CUSTOMER_NAME_REQUIRED" });
  }

  // ---- Reserva local (trava de idempotência) ----------------------------
  let purchaseId = null;
  for (let tentativa = 0; tentativa < 3 && !purchaseId; tentativa++) {
    const code = purchaseCode();
    const t = now();
    try {
      await db
        .prepare(
          `INSERT INTO purchases (id, user_id, product_id, amount_cents, payment_method, installment_count, status, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, 'CREATING', ?, ?)`
        )
        .bind(code, user.id, productId, product.priceCents, method, installments, t, t)
        .run();
      purchaseId = code;
    } catch (e) {
      const msg = String(e && e.message);
      if (msg.includes("purchases.id")) continue; // colisão (rara) do código: gera outro
      if (msg.includes("UNIQUE")) return json(409, { ok: false, erro: "PAYMENT_ATTEMPT_ALREADY_DISPATCHING" });
      throw e;
    }
  }
  if (!purchaseId) return json(500, { ok: false, erro: "ERRO_INTERNO_CHECKOUT" });

  try {
    let customerId = user.asaas_customer_id;
    if (!customerId) {
      customerId = await findOrCreateCustomer(cfg, { userId: user.id, name, email: user.email, cpfCnpj });
      await db
        .prepare("UPDATE users SET asaas_customer_id = ?, cpf_cnpj = COALESCE(cpf_cnpj, ?), name = COALESCE(name, ?) WHERE id = ?")
        .bind(customerId, cpfCnpj || null, name || null, user.id)
        .run();
    }

    const payment = await createPayment(cfg, {
      customerId,
      billingType: method,
      valueCents: product.priceCents,
      installmentCount: installments,
      dueDate: dueDateInDays(2),
      description: `CorpoPleno — ${product.title}`,
      externalReference: purchaseId,
    });

    if (!payment || !payment.id || !payment.invoiceUrl) throw new AsaasError("rejected", 200, "missing_fields");

    await db
      .prepare(
        `UPDATE purchases SET status = 'PENDING', asaas_payment_id = ?, asaas_installment_id = ?, invoice_url = ?, updated_at = ?
          WHERE id = ? AND status = 'CREATING'`
      )
      .bind(payment.id, payment.installment || null, payment.invoiceUrl, now(), purchaseId)
      .run();

    return json(201, { ok: true, paymentMethod: method, invoiceUrl: payment.invoiceUrl, purchaseCode: purchaseId, purchaseId });
  } catch (e) {
    await setStatus(db, purchaseId, "FAILED");
    if (e instanceof AsaasError) {
      console.error("[checkout] asaas", e.kind, e.status, e.detail || "");
      return json(e.kind === "unavailable" ? 503 : 502, {
        ok: false,
        erro: e.kind === "unavailable" ? "PAYMENT_PROVIDER_UNAVAILABLE" : "PAYMENT_PROVIDER_REJECTED",
      });
    }
    console.error("[checkout] erro interno", e && e.message);
    return json(500, { ok: false, erro: "ERRO_INTERNO_CHECKOUT" });
  }
}

function setStatus(db, id, status) {
  return db.prepare("UPDATE purchases SET status = ?, updated_at = ? WHERE id = ?").bind(status, now(), id).run();
}
