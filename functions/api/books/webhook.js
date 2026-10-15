/*
  POST /api/books/webhook -- webhook de cobranças do Asaas.

  - Autenticação: header `asaas-access-token` comparado (tempo constante)
    com o Secret ASAAS_WEBHOOK_TOKEN. Sem Secret configurado -> 503;
    token errado -> 401.
  - PAYMENT_RECEIVED / PAYMENT_CONFIRMED: localiza a compra pelo
    externalReference (= purchases.id), confere id da cobrança e valor,
    marca PAID uma única vez e libera os livros (1 livro ou os 2 do combo)
    numa transação (db.batch). Reentregas do mesmo evento são inofensivas
    (UPDATE condicional + INSERT OR IGNORE).
  - PAYMENT_DELETED / PAYMENT_OVERDUE: encerra a compra pendente para que
    a cliente possa gerar outra cobrança.
  - Eventos ignorados respondem 200 (o Asaas pausa a fila se receber erro).
*/
import { json, methodNotAllowed, readJson } from "../../_lib/http.js";
import { getDb, now } from "../../_lib/db.js";
import { timingSafeEqual } from "../../_lib/auth.js";
import { getProduct } from "../../_lib/catalog.js";

const PAID_EVENTS = new Set(["PAYMENT_RECEIVED", "PAYMENT_CONFIRMED"]);
const CLOSE_EVENTS = { PAYMENT_DELETED: "CANCELLED", PAYMENT_OVERDUE: "EXPIRED" };

export async function onRequest({ request, env }) {
  if (request.method !== "POST") return methodNotAllowed();

  if (!env.ASAAS_WEBHOOK_TOKEN) return json(503, { ok: false, erro: "WEBHOOK_NAO_CONFIGURADO" });
  const token = request.headers.get("asaas-access-token") || "";
  if (!timingSafeEqual(token, env.ASAAS_WEBHOOK_TOKEN)) {
    return json(401, { ok: false, erro: "TOKEN_INVALIDO" });
  }

  const db = await getDb(env);
  if (!db) return json(503, { ok: false, erro: "BANCO_NAO_CONFIGURADO" });

  const event = await readJson(request);
  if (!event || typeof event.event !== "string") return json(400, { ok: false, erro: "EVENTO_INVALIDO" });
  const payment = event.payment && typeof event.payment === "object" ? event.payment : null;
  const ref = payment && typeof payment.externalReference === "string" ? payment.externalReference : "";

  const log = (purchaseId, result) =>
    db
      .prepare("INSERT OR IGNORE INTO webhook_events (event_id, event_type, payment_id, purchase_id, result, received_at) VALUES (?, ?, ?, ?, ?, ?)")
      .bind(String(event.id || `${event.event}:${payment && payment.id}`), event.event, (payment && payment.id) || null, purchaseId, result, now());

  if (!payment || !ref) {
    await log(null, "IGNORED_NO_REFERENCE").run();
    return json(200, { ok: true, ignored: true });
  }

  const purchase = await db.prepare("SELECT * FROM purchases WHERE id = ?").bind(ref).first();
  if (!purchase) {
    await log(null, "IGNORED_UNKNOWN_PURCHASE").run();
    return json(200, { ok: true, ignored: true });
  }

  const samePayment =
    purchase.asaas_payment_id === payment.id ||
    (purchase.asaas_installment_id && purchase.asaas_installment_id === payment.installment);
  if (!samePayment) {
    await log(purchase.id, "IGNORED_PAYMENT_MISMATCH").run();
    return json(200, { ok: true, ignored: true });
  }

  if (CLOSE_EVENTS[event.event]) {
    await db.batch([
      db.prepare("UPDATE purchases SET status = ?, updated_at = ? WHERE id = ? AND status = 'PENDING'")
        .bind(CLOSE_EVENTS[event.event], now(), purchase.id),
      log(purchase.id, CLOSE_EVENTS[event.event]),
    ]);
    return json(200, { ok: true, status: CLOSE_EVENTS[event.event] });
  }

  if (!PAID_EVENTS.has(event.event)) {
    await log(purchase.id, "IGNORED_EVENT").run();
    return json(200, { ok: true, ignored: true });
  }

  if (purchase.status === "PAID") {
    await log(purchase.id, "ALREADY_PAID").run();
    return json(200, { ok: true, alreadyPaid: true });
  }

  // Cobrança à vista: o valor pago precisa bater com o preço do catálogo.
  if (!payment.installment && Math.round(Number(payment.value) * 100) !== purchase.amount_cents) {
    await log(purchase.id, "IGNORED_VALUE_MISMATCH").run();
    console.error("[webhook] valor divergente", purchase.id);
    return json(200, { ok: true, ignored: true });
  }

  const product = getProduct(purchase.product_id);
  if (!product) {
    await log(purchase.id, "IGNORED_UNKNOWN_PRODUCT").run();
    return json(200, { ok: true, ignored: true });
  }

  const t = now();
  const results = await db.batch([
    db.prepare("UPDATE purchases SET status = 'PAID', paid_at = ?, updated_at = ? WHERE id = ? AND status != 'PAID'")
      .bind(t, t, purchase.id),
    ...product.items.map((bookId) =>
      db.prepare("INSERT OR IGNORE INTO entitlements (user_id, book_id, purchase_id, granted_at) VALUES (?, ?, ?, ?)")
        .bind(purchase.user_id, bookId, purchase.id, t)
    ),
    log(purchase.id, "PAID"),
  ]);
  const changed = results[0] && results[0].meta ? results[0].meta.changes : 0;
  return json(200, { ok: true, paid: true, newlyPaid: changed > 0, granted: product.items });
}
