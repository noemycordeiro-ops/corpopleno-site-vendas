/*
  Envio de e-mail transacional pelo Resend (https://resend.com), via HTTP.
  Só funciona com os Secrets RESEND_API_KEY e EMAIL_FROM configurados
  (EMAIL_FROM precisa ser de um domínio verificado no Resend, ex.:
  "CorpoPleno <nao-responda@corpoplenoresultadoreal.com.br>").
  Sem eles, devolve {sent:false, reason:"EMAIL_NAO_CONFIGURADO"} e nada é enviado.
  RESEND_API_URL existe só para testes locais com um stub.
*/
export function emailConfigured(env) {
  return !!(env.RESEND_API_KEY && env.EMAIL_FROM);
}

export async function sendEmail(env, { to, subject, text, html }) {
  if (!emailConfigured(env)) return { sent: false, reason: "EMAIL_NAO_CONFIGURADO" };
  try {
    const res = await fetch(env.RESEND_API_URL || "https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: env.EMAIL_FROM, to: [to], subject, text, html }),
    });
    if (!res.ok) return { sent: false, reason: `PROVEDOR_${res.status}` };
    return { sent: true };
  } catch (_) {
    return { sent: false, reason: "PROVEDOR_INDISPONIVEL" };
  }
}
