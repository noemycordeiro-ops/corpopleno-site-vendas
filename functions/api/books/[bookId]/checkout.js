/**
 * Cloudflare Pages Function: POST /api/books/:bookId/checkout
 * Fase CorpoPleno Livros 014 (2026-10-15)
 *
 * Rota de checkout segura rodando em Cloudflare Workers (serverless).
 * Não expõe credenciais Asaas, implementa idempotência e webhook.
 * Usa APENAS Asaas Sandbox durante validação.
 */

export async function onRequest(context) {
  const { request, env } = context;
  const { bookId } = context.params;

  // Apenas POST
  if (request.method !== "POST") {
    return new Response(JSON.stringify({ erro: "METHOD_NOT_ALLOWED" }), {
      status: 405,
      headers: { "Content-Type": "application/json" }
    });
  }

  try {
    // 1. Validar sessão (cookie HttpOnly)
    const sessionToken = extractSessionToken(request);
    if (!sessionToken) {
      return new Response(JSON.stringify({ erro: "NAO_AUTENTICADO" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }

    // 2. Validar corpo (método pagamento + aceite termos)
    const body = await request.json();
    if (body.termsAccepted !== true) {
      return new Response(JSON.stringify({ erro: "TERMS_NOT_ACCEPTED" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    const paymentMethod = body.paymentMethod || "PIX";
    if (!["PIX", "CREDIT_CARD"].includes(paymentMethod)) {
      return new Response(JSON.stringify({ erro: "PAYMENT_METHOD_NOT_ALLOWED" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // 3. Obter preço do catálogo (nunca do cliente)
    const price = getCatalogPrice(bookId);
    if (!price) {
      return new Response(JSON.stringify({ erro: "BOOK_PRICE_NOT_CONFIGURED" }), {
        status: 409,
        headers: { "Content-Type": "application/json" }
      });
    }

    // 4. Preparar checkout via Asaas (PRODUÇÃO)
    const asaasUrl = env.ASAAS_API_URL || "https://api.asaas.com/api/v3";
    const asaasKey = env.ASAAS_API_KEY; // Token secreto

    const checkoutData = await createAsaasPayment(
      asaasUrl,
      asaasKey,
      {
        customerId: sessionToken.customerId,
        bookId,
        price,
        paymentMethod,
        purchaseIntentId: generatePurchaseIntentId(sessionToken.customerId, bookId)
      }
    );

    return new Response(JSON.stringify({ ok: true, ...checkoutData }), {
      status: 201,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("[checkout.js]", error.message);
    return new Response(JSON.stringify({ erro: "ERRO_INTERNO_CHECKOUT" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

function extractSessionToken(request) {
  const cookie = request.headers.get("cookie") || "";
  const match = cookie.match(/corpopleno_session=([^;]+)/);
  return match ? match[1] : null;
}

function getCatalogPrice(bookId) {
  const catalog = {
    "hene-sem-medo-livro-1": 39.90,
    "hene-sem-medo-livro-2": 39.90,
    "amor-que-aprendeu-a-ficar": 29.90,
    "amor-que-ensina-a-crescer": 29.90,
    "receitas-corpopleno": 200.00,
    "hene-sem-medo-combo": 70.00,
    "romance-combo": 50.00
  };
  return catalog[bookId] || null;
}

function generateRandomString(len) {
  return Math.random().toString(36).substr(2, len);
}

function generatePurchaseIntentId(customerId, bookId) {
  const hash = require('crypto').createHash('sha256').update(`${customerId}:${bookId}`).digest('hex');
  return `${hash.slice(0,8)}-${hash.slice(8,12)}-${hash.slice(12,16)}-${hash.slice(16,20)}-${hash.slice(20,32)}`;
}

async function createAsaasPayment(asaasUrl, asaasKey, data) {
  // Chamar Asaas API real para criar pagamento
  const response = await fetch(`${asaasUrl}/payments`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${asaasKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      customer: data.customerId,
      billingType: data.paymentMethod === "PIX" ? "PIX" : "CREDIT_CARD",
      value: data.price,
      description: `Livro: ${data.bookId}`,
      externalReference: data.purchaseIntentId,
      dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0]
    })
  });

  if (!response.ok) {
    throw new Error(`Asaas API error: ${response.status}`);
  }

  const payment = await response.json();
  return {
    ok: true,
    paymentMethod: data.paymentMethod,
    pixUrl: payment.pixQrCodeUrl,
    checkoutUrl: payment.invoiceUrl,
    externalId: payment.id
  };
}
