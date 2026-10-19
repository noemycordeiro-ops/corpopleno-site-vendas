/*
  Entrega dos livros comprados -- compartilhado pelo webhook do Asaas e
  pela verificação direta (functions/api/me/books.js), para que as duas
  vias liberem e comuniquem exatamente do mesmo jeito.
*/
import { now } from "./db.js";
import { getProduct } from "./catalog.js";
import { sendEmail } from "./email.js";
import { purchaseReleasedEmail, deliveryIssueEmail, deliveryIssueAlert } from "./purchase-email.js";

/*
  Marca a compra como PAID uma única vez e libera os livros do produto numa
  transação. `resultado` vai para webhook_events (auditoria). Devolve true
  só na primeira liberação (reentregas/verificações repetidas: false).
*/
export async function grantPurchase(db, purchase, product, eventId, eventType, paymentId, resultado) {
  const t = now();
  const results = await db.batch([
    db.prepare("UPDATE purchases SET status = 'PAID', paid_at = ?, updated_at = ? WHERE id = ? AND status != 'PAID'")
      .bind(t, t, purchase.id),
    ...product.items.map((bookId) =>
      db.prepare("INSERT OR IGNORE INTO entitlements (user_id, book_id, purchase_id, granted_at) VALUES (?, ?, ?, ?)")
        .bind(purchase.user_id, bookId, purchase.id, t)
    ),
    db.prepare("INSERT OR IGNORE INTO webhook_events (event_id, event_type, payment_id, purchase_id, result, received_at) VALUES (?, ?, ?, ?, ?, ?)")
      .bind(eventId, eventType, paymentId, purchase.id, resultado, t),
  ]);
  return !!(results[0] && results[0].meta && results[0].meta.changes > 0);
}

/*
  Confere se cada livro liberado tem conteúdo carregado (book_pages). Com
  conteúdo: e-mail "pagamento aprovado + livros liberados". Sem conteúdo:
  aviso de pendência à cliente + alerta ao suporte (entrega digital falhou).
*/
export async function notifyRelease(db, env, purchase, product, origin) {
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

export async function alertSupport(env, dados) {
  const a = deliveryIssueAlert(dados);
  const r = await sendEmail(env, { to: a.to, subject: a.subject, text: a.text });
  if (!r.sent) console.error("[webhook] alerta ao suporte não enviado:", r.reason);
}
