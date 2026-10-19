/*
  Modelo do e-mail de redefinição de senha (assunto, texto e HTML), em pt-BR,
  com a linguagem da CorpoPleno. O link nunca é registrado em log.
*/
function escapeHtml(v) {
  return String(v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

export function resetEmail(primeiroNome, link) {
  const saudacao = primeiroNome ? `Olá, ${primeiroNome}!` : "Olá!";
  const subject = "Seu link para criar uma nova senha — CorpoPleno";
  const text =
    `${saudacao}\n\n` +
    `Recebemos um pedido para redefinir a senha da sua conta CorpoPleno. Está tudo bem: acontece com todo mundo, e cuidar do seu acesso também faz parte de cuidar de você.\n\n` +
    `Para criar uma nova senha, abra o link abaixo:\n\n${link}\n\n` +
    `Como funciona:\n` +
    `1. Abra o link (ele vale por 60 minutos e só pode ser usado uma vez).\n` +
    `2. Escolha uma nova senha com pelo menos 8 caracteres.\n` +
    `3. Pronto: entre de novo com o seu e-mail e a senha nova.\n\n` +
    `Se o link expirar, é só pedir outro na página "Esqueci minha senha".\n\n` +
    `Não foi você que pediu? Pode ignorar este e-mail com tranquilidade: sua senha continua a mesma e ninguém consegue alterá-la sem este link.\n\n` +
    `Por segurança, a CorpoPleno nunca pede sua senha por e-mail, WhatsApp ou telefone.\n\n` +
    `Com carinho,\nEquipe CorpoPleno\nInteligente, resultado real\nsuporte@corpoplenoresultadoreal.com.br\n`;
  const l = escapeHtml(link);
  const html = `<!doctype html><html lang="pt-BR"><body style="margin:0;padding:0;background:#faf7f5;font-family:Arial,Helvetica,sans-serif;color:#2b2b3a">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#faf7f5;padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden">
<tr><td style="height:6px;background:linear-gradient(90deg,#ec4899,#f59e0b,#10b981,#3b82f6,#8b5cf6)"></td></tr>
<tr><td style="padding:28px 28px 8px"><p style="margin:0;font-size:22px;font-weight:bold;color:#7c3aed">CorpoPleno</p>
<p style="margin:2px 0 0;font-size:12px;letter-spacing:1px;color:#6b7280">INTELIGENTE, RESULTADO REAL</p></td></tr>
<tr><td style="padding:16px 28px;font-size:16px;line-height:1.6">
<p style="margin:0 0 14px">${escapeHtml(saudacao)}</p>
<p style="margin:0 0 14px">Recebemos um pedido para redefinir a senha da sua conta CorpoPleno. Está tudo bem: acontece com todo mundo, e cuidar do seu acesso também faz parte de cuidar de você.</p>
<p style="margin:24px 0;text-align:center"><a href="${l}" style="display:inline-block;background:#db2777;color:#ffffff;text-decoration:none;font-weight:bold;padding:14px 28px;border-radius:999px">Criar minha nova senha</a></p>
<p style="margin:0 0 8px"><strong>Como funciona:</strong></p>
<ol style="margin:0 0 14px;padding-left:20px"><li>Toque no botão acima (ele vale por <strong>60 minutos</strong> e só pode ser usado uma vez).</li><li>Escolha uma nova senha com pelo menos 8 caracteres.</li><li>Pronto: entre de novo com o seu e-mail e a senha nova.</li></ol>
<p style="margin:0 0 14px">Se o link expirar, é só pedir outro na página “Esqueci minha senha”.</p>
<p style="margin:0 0 14px;padding:12px 14px;background:#f0fdf4;border-radius:10px;font-size:14px">Não foi você que pediu? Pode ignorar este e-mail com tranquilidade: sua senha continua a mesma e ninguém consegue alterá-la sem este link. A CorpoPleno nunca pede sua senha por e-mail, WhatsApp ou telefone.</p>
<p style="margin:0 0 6px;font-size:13px;color:#6b7280">Se o botão não abrir, copie e cole este endereço no navegador:<br><a href="${l}" style="color:#7c3aed;word-break:break-all">${l}</a></p>
</td></tr>
<tr><td style="padding:8px 28px 28px;font-size:15px;line-height:1.5">Com carinho,<br><strong>Equipe CorpoPleno</strong><br><a href="mailto:suporte@corpoplenoresultadoreal.com.br" style="color:#7c3aed">suporte@corpoplenoresultadoreal.com.br</a></td></tr>
</table></td></tr></table></body></html>`;
  return { subject, text, html };
}
