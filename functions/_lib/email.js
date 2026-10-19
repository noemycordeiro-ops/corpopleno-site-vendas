/*
  Envio de e-mail transacional por HTTP. Provedor escolhido pelo Secret presente:
    - BREVO_API_KEY  -> Brevo  (https://api.brevo.com/v3/smtp/email)
    - RESEND_API_KEY -> Resend (https://api.resend.com/emails)
  Se os dois existirem, usa o Brevo.
  Remetente: EMAIL_FROM (opcional). Padrão: "CorpoPleno <suporte@corpoplenoresultadoreal.com.br>".
  O domínio do remetente precisa estar autenticado no provedor (SPF/DKIM/DMARC).
  Respostas da cliente vão para EMAIL_REPLY_TO (opcional; padrão = endereço do remetente).
  Sem chave de provedor, devolve {sent:false, reason:"EMAIL_NAO_CONFIGURADO"} e nada é enviado.
  BREVO_API_URL / RESEND_API_URL existem só para testes locais com um stub.
*/
const DEFAULT_FROM = "CorpoPleno <suporte@corpoplenoresultadoreal.com.br>";

export function emailProvider(env) {
  if (env.BREVO_API_KEY) return "brevo";
  if (env.RESEND_API_KEY) return "resend";
  return null;
}

export function emailConfigured(env) {
  return !!emailProvider(env);
}

export function parseAddress(value) {
  const s = String(value || "").trim();
  const m = s.match(/^\s*"?([^"<]*?)"?\s*<([^>]+)>\s*$/);
  if (m) return { name: m[1].trim() || undefined, email: m[2].trim() };
  return { email: s };
}

export async function sendEmail(env, { to, subject, text, html }) {
  const provider = emailProvider(env);
  if (!provider) return { sent: false, reason: "EMAIL_NAO_CONFIGURADO" };
  const fromRaw = env.EMAIL_FROM || DEFAULT_FROM;
  const from = parseAddress(fromRaw);
  const replyTo = parseAddress(env.EMAIL_REPLY_TO || from.email);

  let url, headers, body;
  if (provider === "brevo") {
    url = env.BREVO_API_URL || "https://api.brevo.com/v3/smtp/email";
    headers = { "api-key": env.BREVO_API_KEY, "Content-Type": "application/json", Accept: "application/json" };
    body = {
      sender: { name: from.name || "CorpoPleno", email: from.email },
      to: [{ email: to }],
      replyTo: { email: replyTo.email },
      subject,
      textContent: text,
      ...(html ? { htmlContent: html } : {}),
    };
  } else {
    url = env.RESEND_API_URL || "https://api.resend.com/emails";
    headers = { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" };
    body = { from: fromRaw, to: [to], reply_to: replyTo.email, subject, text, ...(html ? { html } : {}) };
  }

  try {
    const res = await fetch(url, { method: "POST", headers, body: JSON.stringify(body) });
    if (!res.ok) return { sent: false, reason: `PROVEDOR_${provider.toUpperCase()}_${res.status}` };
    return { sent: true };
  } catch (_) {
    return { sent: false, reason: "PROVEDOR_INDISPONIVEL" };
  }
}
