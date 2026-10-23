/*
  Modelo do e-mail com o código de troca de endereço (pt-BR), enviado ao
  NOVO endereço. O código nunca é registrado em log.
*/
function escapeHtml(v) {
  return String(v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

export function emailChangeCodeEmail(primeiroNome, codigo) {
  const saudacao = primeiroNome ? `Olá, ${primeiroNome}!` : "Olá!";
  const subject = "Seu código para confirmar o novo e-mail — CorpoPleno";
  const text =
    `${saudacao}\n\n` +
    `Você pediu para trocar o e-mail da sua conta CorpoPleno por este endereço.\n\n` +
    `Seu código de confirmação é:\n\n${codigo}\n\n` +
    `Digite esse código na página "Minha área" para concluir a troca. Ele vale por 15 minutos.\n\n` +
    `Não foi você que pediu? Pode ignorar este e-mail: sua conta continua como estava.\n\n` +
    `Por segurança, a CorpoPleno nunca pede sua senha nem códigos por e-mail, WhatsApp ou telefone.\n\n` +
    `Com carinho,\nPatrícia\nEquipe CorpoPleno\nInteligente, resultado real\nsuporte@corpoplenoresultadoreal.com.br\n`;
  const html = `<!doctype html><html lang="pt-BR"><body style="margin:0;padding:0;background:#faf7f5;font-family:Arial,Helvetica,sans-serif;color:#2b2b3a">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#faf7f5;padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden">
<tr><td style="height:6px;background:linear-gradient(90deg,#ec4899,#f59e0b,#10b981,#3b82f6,#8b5cf6)"></td></tr>
<tr><td style="padding:28px 28px 8px"><p style="margin:0;font-size:22px;font-weight:bold;color:#7c3aed">CorpoPleno</p>
<p style="margin:2px 0 0;font-size:12px;letter-spacing:1px;color:#6b7280">INTELIGENTE, RESULTADO REAL</p></td></tr>
<tr><td style="padding:16px 28px;font-size:16px;line-height:1.6">
<p style="margin:0 0 14px">${escapeHtml(saudacao)}</p>
<p style="margin:0 0 14px">Você pediu para trocar o e-mail da sua conta CorpoPleno por este endereço. Seu código de confirmação é:</p>
<p style="margin:20px 0;text-align:center;font-size:32px;font-weight:bold;letter-spacing:8px;color:#7c3aed">${escapeHtml(codigo)}</p>
<p style="margin:0 0 14px">Digite esse código na página “Minha área” para concluir a troca. Ele vale por <strong>15 minutos</strong>.</p>
<p style="margin:0 0 14px;padding:12px 14px;background:#f0fdf4;border-radius:10px;font-size:14px">Não foi você que pediu? Pode ignorar este e-mail: sua conta continua como estava. A CorpoPleno nunca pede sua senha nem códigos por e-mail, WhatsApp ou telefone.</p>
</td></tr>
<tr><td style="padding:8px 28px 28px;font-size:15px;line-height:1.5">Com carinho,<br><strong>Patrícia</strong><br>Equipe CorpoPleno<br><a href="mailto:suporte@corpoplenoresultadoreal.com.br" style="color:#7c3aed">suporte@corpoplenoresultadoreal.com.br</a></td></tr>
</table></td></tr></table></body></html>`;
  return { subject, text, html };
}
