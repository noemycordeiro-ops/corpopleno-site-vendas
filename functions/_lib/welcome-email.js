/*
  Modelo do e-mail de boas-vindas enviado logo após o cadastro (pt-BR, voz CorpoPleno).
*/
function escapeHtml(v) {
  return String(v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

export function welcomeEmail(primeiroNome, origin) {
  const saudacao = primeiroNome ? `Olá, ${primeiroNome}!` : "Olá!";
  const area = `${origin}/minha-area.html`;
  const produtos = `${origin}/produtos.html`;
  const subject = "Boas-vindas à CorpoPleno 💜";
  const text =
    `${saudacao}\n\n` +
    `Que alegria ter você com a gente! Sua conta CorpoPleno foi criada com sucesso.\n\n` +
    `A partir de agora você tem um espaço só seu para acompanhar seus materiais e avançar com clareza, no seu ritmo, cuidando da sua saúde e do seu bem-estar.\n\n` +
    `Por onde começar:\n` +
    `1. Acesse a Minha Área: ${area}\n` +
    `2. Conheça os produtos e livros: ${produtos}\n` +
    `3. Ficou com alguma dúvida? É só responder este e-mail.\n\n` +
    `Para entrar, use sempre o e-mail deste cadastro e a senha que você criou. Por segurança, a CorpoPleno nunca pede sua senha por e-mail, WhatsApp ou telefone.\n\n` +
    `Com carinho,\nPatrícia\nEquipe CorpoPleno\nInteligente, resultado real\nsuporte@corpoplenoresultadoreal.com.br\n`;
  const html = `<!doctype html><html lang="pt-BR"><body style="margin:0;padding:0;background:#faf7f5;font-family:Arial,Helvetica,sans-serif;color:#2b2b3a">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#faf7f5;padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden">
<tr><td style="height:6px;background:linear-gradient(90deg,#ec4899,#f59e0b,#10b981,#3b82f6,#8b5cf6)"></td></tr>
<tr><td style="padding:28px 28px 8px"><p style="margin:0;font-size:22px;font-weight:bold;color:#7c3aed">CorpoPleno</p>
<p style="margin:2px 0 0;font-size:12px;letter-spacing:1px;color:#6b7280">INTELIGENTE, RESULTADO REAL</p></td></tr>
<tr><td style="padding:16px 28px;font-size:16px;line-height:1.6">
<p style="margin:0 0 14px">${escapeHtml(saudacao)}</p>
<p style="margin:0 0 14px">Que alegria ter você com a gente! Sua conta CorpoPleno foi criada com sucesso. 🌱</p>
<p style="margin:0 0 14px">A partir de agora você tem um espaço só seu para acompanhar seus materiais e avançar com clareza, no seu ritmo, cuidando da sua saúde e do seu bem-estar.</p>
<p style="margin:24px 0;text-align:center"><a href="${escapeHtml(area)}" style="display:inline-block;background:#db2777;color:#ffffff;text-decoration:none;font-weight:bold;padding:14px 28px;border-radius:999px">Acessar a Minha Área</a></p>
<p style="margin:0 0 8px"><strong>Por onde começar:</strong></p>
<ol style="margin:0 0 14px;padding-left:20px"><li>Entre na <a href="${escapeHtml(area)}" style="color:#7c3aed">Minha Área</a>.</li><li>Conheça os <a href="${escapeHtml(produtos)}" style="color:#7c3aed">produtos e livros</a>.</li><li>Ficou com alguma dúvida? É só responder este e-mail.</li></ol>
<p style="margin:0 0 14px;padding:12px 14px;background:#f0fdf4;border-radius:10px;font-size:14px">Para entrar, use sempre o e-mail deste cadastro e a senha que você criou. Por segurança, a CorpoPleno nunca pede sua senha por e-mail, WhatsApp ou telefone.</p>
</td></tr>
<tr><td style="padding:8px 28px 28px;font-size:15px;line-height:1.5">Com carinho,<br><strong>Patrícia</strong><br>Equipe CorpoPleno<br><a href="mailto:suporte@corpoplenoresultadoreal.com.br" style="color:#7c3aed">suporte@corpoplenoresultadoreal.com.br</a></td></tr>
</table></td></tr></table></body></html>`;
  return { subject, text, html };
}
