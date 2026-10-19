/*
  E-mails da compra (pt-BR, voz CorpoPleno), enviados pelo webhook:
    - purchaseReleasedEmail: pagamento aprovado + livros liberados + como acessar.
    - deliveryIssueEmail: pagamento recebido, mas a entrega digital precisa de
      verificação (vai para a cliente e uma cópia para o suporte).
    - deliveryIssueAlert: aviso interno ao suporte, com o código da compra.
  Nunca incluem dados de pagamento, CPF ou tokens.
*/
const SUPORTE = "suporte@corpoplenoresultadoreal.com.br";

function escapeHtml(v) {
  return String(v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

function layout(blocos) {
  return `<!doctype html><html lang="pt-BR"><body style="margin:0;padding:0;background:#faf7f5;font-family:Arial,Helvetica,sans-serif;color:#2b2b3a">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#faf7f5;padding:24px 12px"><tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden">
<tr><td style="height:6px;background:linear-gradient(90deg,#ec4899,#f59e0b,#10b981,#3b82f6,#8b5cf6)"></td></tr>
<tr><td style="padding:28px 28px 8px"><p style="margin:0;font-size:22px;font-weight:bold;color:#7c3aed">CorpoPleno</p>
<p style="margin:2px 0 0;font-size:12px;letter-spacing:1px;color:#6b7280">INTELIGENTE, RESULTADO REAL</p></td></tr>
<tr><td style="padding:16px 28px;font-size:16px;line-height:1.6">${blocos}</td></tr>
<tr><td style="padding:8px 28px 28px;font-size:15px;line-height:1.5">Com carinho,<br><strong>Patrícia</strong><br>Equipe CorpoPleno<br><a href="mailto:${SUPORTE}" style="color:#7c3aed">${SUPORTE}</a></td></tr>
</table></td></tr></table></body></html>`;
}

const ASSINATURA = `Com carinho,\nPatrícia\nEquipe CorpoPleno\nInteligente, resultado real\n${SUPORTE}\n`;

/* books: [{id, title}] */
export function purchaseReleasedEmail({ primeiroNome, purchaseCode, productTitle, books, origin }) {
  const saudacao = primeiroNome ? `Olá, ${primeiroNome}!` : "Olá!";
  const meusLivros = `${origin}/meus-livros.html`;
  const plural = books.length > 1;
  const subject = `Pagamento aprovado: ${plural ? "seus livros estão liberados" : "seu livro está liberado"} 📚`;
  const lista = books.map((b) => `- ${b.title}: ${origin}/leitor.html?id=${encodeURIComponent(b.id)}`).join("\n");
  const text =
    `${saudacao}\n\n` +
    `Recebemos a confirmação do seu pagamento. Obrigada pela confiança!\n\n` +
    `Compra: ${productTitle}\nCódigo da compra: ${purchaseCode}\n\n` +
    `${plural ? "Estes livros já estão liberados" : "Este livro já está liberado"} na sua biblioteca CorpoPleno:\n${lista}\n\n` +
    `Como acessar:\n` +
    `1. Entre no site com o e-mail deste cadastro e a sua senha.\n` +
    `2. Abra Minha Área > Meus Livros: ${meusLivros}\n` +
    `3. Clique em "Ler agora". Você pode escolher o idioma disponível dentro do leitor.\n\n` +
    `Se algo não abrir como esperado, responda este e-mail informando o código ${purchaseCode} que resolvemos com você.\n\n` +
    ASSINATURA;
  const itens = books
    .map((b) => `<li><a href="${escapeHtml(`${origin}/leitor.html?id=${encodeURIComponent(b.id)}`)}" style="color:#7c3aed">${escapeHtml(b.title)}</a></li>`)
    .join("");
  const html = layout(
    `<p style="margin:0 0 14px">${escapeHtml(saudacao)}</p>
<p style="margin:0 0 14px">Recebemos a confirmação do seu pagamento. Obrigada pela confiança! 💜</p>
<p style="margin:0 0 14px;padding:12px 14px;background:#f5f3ff;border-radius:10px;font-size:14px">Compra: <strong>${escapeHtml(productTitle)}</strong><br>Código da compra: <strong>${escapeHtml(purchaseCode)}</strong></p>
<p style="margin:0 0 8px">${plural ? "Estes livros já estão liberados" : "Este livro já está liberado"} na sua biblioteca:</p>
<ul style="margin:0 0 14px;padding-left:20px">${itens}</ul>
<p style="margin:24px 0;text-align:center"><a href="${escapeHtml(meusLivros)}" style="display:inline-block;background:#db2777;color:#ffffff;text-decoration:none;font-weight:bold;padding:14px 28px;border-radius:999px">Abrir Meus Livros</a></p>
<p style="margin:0 0 8px"><strong>Como acessar:</strong></p>
<ol style="margin:0 0 14px;padding-left:20px"><li>Entre no site com o e-mail deste cadastro e a sua senha.</li><li>Abra <strong>Minha Área › Meus Livros</strong>.</li><li>Clique em <strong>Ler agora</strong>. O idioma pode ser escolhido dentro do leitor.</li></ol>
<p style="margin:0 0 14px;padding:12px 14px;background:#f0fdf4;border-radius:10px;font-size:14px">Se algo não abrir como esperado, responda este e-mail informando o código <strong>${escapeHtml(purchaseCode)}</strong> que resolvemos com você.</p>`
  );
  return { subject, text, html };
}

export function deliveryIssueEmail({ primeiroNome, purchaseCode, productTitle }) {
  const saudacao = primeiroNome ? `Olá, ${primeiroNome}!` : "Olá!";
  const subject = `Recebemos seu pagamento — estamos finalizando a entrega (${purchaseCode})`;
  const text =
    `${saudacao}\n\n` +
    `Recebemos o seu pagamento referente a: ${productTitle} (código ${purchaseCode}).\n\n` +
    `Identificamos uma pendência na entrega digital e a nossa equipe já foi avisada automaticamente. ` +
    `Vamos concluir a liberação e te avisar por este e-mail. Você não precisa pagar de novo.\n\n` +
    `Se preferir, responda esta mensagem informando o código ${purchaseCode}.\n\n` +
    ASSINATURA;
  const html = layout(
    `<p style="margin:0 0 14px">${escapeHtml(saudacao)}</p>
<p style="margin:0 0 14px">Recebemos o seu pagamento referente a <strong>${escapeHtml(productTitle)}</strong> (código <strong>${escapeHtml(purchaseCode)}</strong>).</p>
<p style="margin:0 0 14px">Identificamos uma pendência na entrega digital e a nossa equipe já foi avisada automaticamente. Vamos concluir a liberação e te avisar por este e-mail. <strong>Você não precisa pagar de novo.</strong></p>
<p style="margin:0 0 14px">Se preferir, responda esta mensagem informando o código <strong>${escapeHtml(purchaseCode)}</strong>.</p>`
  );
  return { subject, text, html };
}

export function deliveryIssueAlert({ purchaseCode, productId, motivo, detalhe }) {
  const subject = `[ALERTA ENTREGA] ${purchaseCode} — ${motivo}`;
  const text =
    `Falha na entrega digital detectada pelo webhook.\n\n` +
    `Compra: ${purchaseCode}\nProduto: ${productId}\nMotivo: ${motivo}\n${detalhe ? `Detalhe: ${detalhe}\n` : ""}\n` +
    `Verifique a compra e o conteúdo no banco antes de responder à cliente.\n`;
  return { subject, text, to: SUPORTE };
}
