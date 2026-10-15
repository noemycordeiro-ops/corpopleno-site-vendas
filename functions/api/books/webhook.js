/**
 * Webhook Asaas: validar pagamento → liberar livro
 */
export async function onRequest(context) {
  const { request } = context;

  if (request.method !== "POST") {
    return new Response("METHOD_NOT_ALLOWED", { status: 405 });
  }

  try {
    const event = await request.json();

    // Validar evento Asaas
    if (!event.event || !["PAYMENT_RECEIVED", "PAYMENT_CONFIRMED"].includes(event.event)) {
      return new Response(JSON.stringify({ ok: false }), { status: 400 });
    }

    // Dados do pagamento
    const { payment } = event;
    if (!payment || !payment.externalReference) {
      return new Response(JSON.stringify({ ok: false }), { status: 400 });
    }

    // TODO: Gravar em banco (now usando mock)
    console.log(`✅ Pagamento confirmado: ${payment.externalReference} - R$ ${payment.value}`);

    // TODO: Liberar acesso ao livro baseado em externalReference
    // externalReference = "BOOK_PURCHASE_INTENT:customerId:bookId"

    return new Response(JSON.stringify({ ok: true, event: event.event }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("[webhook]", error.message);
    return new Response(JSON.stringify({ erro: "WEBHOOK_ERRO" }), { status: 500 });
  }
}
