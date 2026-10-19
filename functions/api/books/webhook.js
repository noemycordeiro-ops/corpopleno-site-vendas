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
  - PAYMENT_REFUNDED / PAYMENT_CHARGEBACK_REQUESTED / PAYMENT_CHARGEBACK_DISPUTE
    (e PAYMENT_DELETED de compra já paga): revogam o acesso, de forma
    idempotente; uma compra revogada nunca volta a liberar.
  - Eventos ignorados respondem 200 (o Asaas pausa a fila se receber erro).
*/
import { json, methodNotAllowed, readJson } from "../../_lib/http.js";
import { getDb, now } from "../../_lib/db.js";
import { timingSafeEqual } from "../../_lib/auth.js";
import { getProduct } from "../../_lib/catalog.js";
import { sendEmail } from "../../_lib/email.js";
import { purchaseReleasedEmail, deliveryIssueEmail, deliveryIssueAlert } from "../../_lib/purchase-email.js";

const PAID_EVENTS = new Set(["PAYMENT_RECEIVED", "PAYMENT_CONFIRMED"]);
const CLOSE_EVENTS = { PAYMENT_DELETED: "CANCELLED", PAYMENT_OVERDUE: "EXPIRED" };
// Eventos que REVOGAM o acesso de uma compra já paga (idempotente).
const REVOKE_EVENTS = {
  PAYMENT_REFUNDED: "REFUNDED",
  PAYMENT_CHARGEBACK_REQUESTED: "CHARGEBACK",
  PAYMENT_CHARGEBACK_DISPUTE: "CHARGEBACK",
  PAYMENT_DELETED: "CANCELLED",
};
const REVOKED_STATUSES = new Set(["REFUNDED", "CHARGEBACK", "REVOKED"]);

/*
  Revoga: muda o status (só se ainda estiver PAID), apaga os acessos que
  vieram DESTA compra e, para cada livro, devolve o acesso se outra compra
  PAGA da mesma cliente também cobrir esse livro (ex.: livro avulso +
  combo). Repetir o evento não muda nada.
*/
async function revokePurchase(db, purchase, newStatus, log) {
  const t = now();
  const product = getProduct(purchase.product_id);
  const items = product ? product.items : [];
  const results = await db.batch([
    db.prepare("UPDATE purchases SET status = ?, updated_at = ? WHERE id = ? AND status = 'PAID'").bind(newStatus, t, purchase.id),
    db.prepare("DELETE FROM entitlements WHERE purchase_id = ?").bind(purchase.id),
    log(purchase.id, "REVOKED_" + newStatus),
  ]);
  const { results: others } = await db
    .prepare("SELECT id, product_id FROM purchases WHERE user_id = ? AND status = 'PAID' AND id != ?")
    .bind(purchase.user_id, purchase.id)
    .all();
  const regrants = [];
  for (const bookId of items) {
    const cover = (others || []).find((o) => {
      const prod = getProduct(o.product_id);
      return prod && prod.items.includes(bookId);
    });
    if (cover) {
      regrants.push(
        db.prepare("INSERT OR IGNORE INTO entitlements (user_id, book_id, purchase_id, granted_at) VALUES (?, ?, ?, ?)")
          .bind(purchase.user_id, bookId, cover.id, t)
      );
    }
  }
  if (regrants.length) await db.batch(regrants);
  return { changed: results[0] && results[0].meta ? results[0].meta.changes : 0, kept: regrants.length };
}

export async function onRequest({ request, env, waitUntil }) {
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

  if (REVOKE_EVENTS[event.event] && (purchase.status === "PAID" || REVOKED_STATUSES.has(purchase.status))) {
    if (purchase.status !== "PAID") {
      await log(purchase.id, "ALREADY_REVOKED").run();
      return json(200, { ok: true, alreadyRevoked: true });
    }
    const r = await revokePurchase(db, purchase, REVOKE_EVENTS[event.event], log);
    return json(200, { ok: true, revoked: true, status: REVOKE_EVENTS[event.event], newlyRevoked: r.changed > 0, keptByOtherPurchase: r.kept });
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
  // Compra estornada/contestada nunca volta a liberar por reentrega antiga.
  if (REVOKED_STATUSES.has(purchase.status)) {
    await log(purchase.id, "IGNORED_REVOKED").run();
    return json(200, { ok: true, ignored: true });
  }

  // Cobrança à vista: o valor pago precisa bater com o preço do catálogo.
  if (!payment.installment && Math.round(Number(payment.value) * 100) !== purchase.amount_cents) {
    await log(purchase.id, "IGNORED_VALUE_MISMATCH").run();
    console.error("[webhook] valor divergente", purchase.id);
    const alerta = alertSupport(env, { purchaseCode: purchase.id, productId: purchase.product_id, motivo: "VALOR_DIVERGENTE", detalhe: `pago ${payment.value}` }).catch(() => {});
    if (typeof waitUntil === "function") waitUntil(alerta);
    return json(200, { ok: true, ignored: true });
  }

  const product = getProduct(purchase.product_id);
  if (!product) {
    await log(purchase.id, "IGNORED_UNKNOWN_PRODUCT").run();
    const alerta = alertSupport(env, { purchaseCode: purchase.id, productId: purchase.product_id, motivo: "PRODUTO_DESCONHECIDO" }).catch(() => {});
    if (typeof waitUntil === "function") waitUntil(alerta);
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
  // E-mail só na PRIMEIRA confirmação (reentregas não reenviam). Em segundo
  // plano: falha no envio nunca afeta a liberação nem a resposta ao Asaas.
  if (changed > 0) {
    const envio = notifyRelease(db, env, purchase, product, new URL(request.url).origin)
      .catch((e) => console.error("[webhook] e-mail da compra falhou", e && e.message));
    if (typeof waitUntil === "function") waitUntil(envio);
  }
  return json(200, { ok: true, paid: true, newlyPaid: changed > 0, granted: product.items });
}

/*
  Confere se cada livro liberado tem conteúdo carregado (book_pages). Com
  conteúdo: e-mail "pagamento aprovado + livros liberados". Sem conteúdo:
  aviso de pendência à cliente + alerta ao suporte (entrega digital falhou).
*/
async function notifyRelease(db, env, purchase, product, origin) {
  const user = await db.prepare("SELECT email, name FROM users WHERE id = ?").bind(purchase.user_id).first();
  if (!user || !user.email) return;
  const primeiroNome = String(user.name || "").split(" ")[0];
  const semConteudo = [];
  for (const bookId of product.items) {
    const r = await db.prepare("SELECT COUNT(*) AS n FROM book_pages WHERE book_id = ?").bind(bookId).first();
    if (!r || !r.n) semConteudo.push(bookId);
  }
  if (semConteudo.length) {
    await alertSupport(env, { purchaseCode: purchase.id, productId: purchase.product_id, motivo: "LIVRO_SEM_CONTEUDO", detalhe: semConteudo.join(", ") });
    const r = await sendEmail(env, { to: user.email, ...deliveryIssueEmail({ primeiroNome, purchaseCode: purchase.id, productTitle: product.title }) });
    if (!r.sent) console.error("[webhook] aviso de pendência não enviado:", r.reason);
    return;
  }
  const books = product.items.map((id) => ({ id, title: (getProduct(id) || {}).title || id }));
  const r = await sendEmail(env, {
    to: user.email,
    ...purchaseReleasedEmail({ primeiroNome, purchaseCode: purchase.id, productTitle: product.title, books, origin }),
  });
  if (!r.sent) {
    console.error("[webhook] confirmação não enviada:", r.reason);
    await alertSupport(env, { purchaseCode: purchase.id, productId: purchase.product_id, motivo: "EMAIL_CONFIRMACAO_FALHOU", detalhe: r.reason });
  }
}

async function alertSupport(env, dados) {
  const a = deliveryIssueAlert(dados);
  const r = await sendEmail(env, { to: a.to, subject: a.subject, text: a.text });
  if (!r.sent) console.error("[webhook] alerta ao suporte não enviado:", r.reason);
}
