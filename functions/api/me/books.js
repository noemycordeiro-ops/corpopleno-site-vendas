/*
  GET /api/me/books -- livros liberados para a cliente logada.
  Contrato de books-account.js: 200 {ok:true, livros:[{bookId, grantedAt, purchaseCode, progress}]} | 401.

  Verificação direta (rede de segurança do webhook): antes de listar, as
  compras PENDING recentes da cliente são consultadas no próprio Asaas
  (GET /payments/{id}). Se a cobrança estiver paga, com o mesmo
  externalReference e o valor exato do catálogo, os livros são liberados
  pela mesma rotina do webhook (_lib/delivery.js). Assim a entrega não
  depende de o webhook chegar. Limite: 20 verificações por cliente a cada
  10 min; falha na consulta nunca impede a listagem.
*/
import { json, methodNotAllowed } from "../../_lib/http.js";
import { getDb, now } from "../../_lib/db.js";
import { getSessionUser, isRateLimited, registerAttempt } from "../../_lib/auth.js";
import { getProduct } from "../../_lib/catalog.js";
import { asaasConfig, getPayment } from "../../_lib/asaas.js";
import { grantPurchase, notifyRelease } from "../../_lib/delivery.js";

const PAGO = new Set(["RECEIVED", "CONFIRMED", "RECEIVED_IN_CASH"]);
const JANELA_PENDENTE_MS = 7 * 24 * 3600 * 1000;

async function verificarPendentes(db, env, user, origin, waitUntil) {
  const cfg = asaasConfig(env);
  if (!cfg) return;
  const bucket = "sync:user:" + user.id;
  if (await isRateLimited(db, bucket, 20, 10 * 60 * 1000)) return;
  const { results } = await db
    .prepare("SELECT * FROM purchases WHERE user_id = ? AND status = 'PENDING' AND asaas_payment_id IS NOT NULL AND created_at > ?")
    .bind(user.id, now() - JANELA_PENDENTE_MS)
    .all();
  if (!results || !results.length) return;
  await registerAttempt(db, bucket, 10 * 60 * 1000);
  for (const purchase of results) {
    try {
      const product = getProduct(purchase.product_id);
      if (!product) continue;
      const pay = await getPayment(cfg, purchase.asaas_payment_id);
      if (!pay || !PAGO.has(pay.status) || pay.externalReference !== purchase.id) continue;
      if (!pay.installment && Math.round(Number(pay.value) * 100) !== purchase.amount_cents) continue;
      const novo = await grantPurchase(db, purchase, product, `sync:${pay.id}`, "SYNC_" + pay.status, pay.id, "PAID_VIA_SYNC");
      if (novo) {
        const envio = notifyRelease(db, env, purchase, product, origin)
          .catch((e) => console.error("[me/books] e-mail da compra falhou", e && e.message));
        if (typeof waitUntil === "function") waitUntil(envio);
      }
    } catch (e) {
      console.error("[me/books] verificação no Asaas falhou", purchase.id, e && e.message);
    }
  }
}

export async function onRequest({ request, env, waitUntil }) {
  if (request.method !== "GET") return methodNotAllowed();
  const db = await getDb(env);
  if (!db) return json(503, { ok: false, erro: "BANCO_NAO_CONFIGURADO" });
  const user = await getSessionUser(db, request);
  if (!user) return json(401, { ok: false, erro: "NAO_AUTENTICADO" });
  await verificarPendentes(db, env, user, new URL(request.url).origin, waitUntil);
  const { results } = await db
    .prepare(
      `SELECT e.book_id, e.granted_at, e.purchase_id, r.locale, r.page_index, r.updated_at AS progress_at
         FROM entitlements e
         LEFT JOIN reading_progress r ON r.user_id = e.user_id AND r.book_id = e.book_id
        WHERE e.user_id = ? ORDER BY e.granted_at`
    )
    .bind(user.id)
    .all();
  return json(200, {
    ok: true,
    livros: (results || []).map((r) => ({ bookId: r.book_id, grantedAt: new Date(r.granted_at).toISOString(), purchaseCode: r.purchase_id,
      progress: r.locale ? { locale: r.locale, page: r.page_index + 1, updatedAt: new Date(r.progress_at).toISOString() } : null,
    })),
  });
}
