/**
 * Persistência de compras via Cloudflare KV
 * Chave: PURCHASE:{purchaseIntentId}
 * Valor: {customerId, bookId, status, paidAt, externalReference}
 */

export async function savePurchase(env, purchaseIntentId, data) {
  if (!env.PURCHASES) {
    console.warn("KV binding PURCHASES não configurado - usando mock");
    return { ok: true, mock: true };
  }

  await env.PURCHASES.put(
    `PURCHASE:${purchaseIntentId}`,
    JSON.stringify({ ...data, savedAt: new Date().toISOString() }),
    { expirationTtl: 86400 * 90 } // 90 dias
  );

  return { ok: true };
}

export async function getPurchase(env, purchaseIntentId) {
  if (!env.PURCHASES) {
    console.warn("KV binding PURCHASES não configurado - usando mock");
    return null;
  }

  const data = await env.PURCHASES.get(`PURCHASE:${purchaseIntentId}`);
  return data ? JSON.parse(data) : null;
}

export async function grantBookAccess(env, customerId, bookId) {
  // TODO: Chamar /api/books/:bookId/access para liberar leitura
  console.log(`[storage] Granted access: customer=${customerId} book=${bookId}`);
  return { ok: true };
}
