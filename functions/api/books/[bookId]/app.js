/*
  GET /api/books/:bookId/app -- versão interativa do livro (ex.: Livro de
  Receitas com questionário de restrições). O HTML completo contém o livro
  inteiro, por isso NUNCA fica em arquivo público nem no repositório:
  vive compactado (gzip + base64) na tabela book_apps do D1 e só é
  entregue a quem tem acesso registrado (entitlements), como o conteúdo
  do leitor.
    200 text/html            -> cliente com acesso
    302 /login.html          -> sem sessão
    403 text/html            -> sem compra / livro sem versão interativa
  CSP bloqueia qualquer conexão externa a partir da página.
*/
import { getDb } from "../../../_lib/db.js";
import { getSessionUser } from "../../../_lib/auth.js";
import { hasAccess } from "../../../_lib/reading.js";

const SEGURANCA = {
  "Cache-Control": "private, no-store",
  "X-Robots-Tag": "noindex, nofollow",
  "X-Frame-Options": "SAMEORIGIN",
  "Referrer-Policy": "same-origin",
  "Content-Security-Policy":
    "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; connect-src 'none'; form-action 'none'; base-uri 'none'; frame-ancestors 'self'",
};

function pagina(status, titulo, texto) {
  const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${titulo} — CorpoPleno</title></head>
<body style="font-family:Arial,Helvetica,sans-serif;background:#faf7f5;color:#2b2b3a;margin:0;padding:40px 16px;text-align:center">
<div style="max-width:520px;margin:0 auto;background:#fff;border-radius:16px;padding:28px;box-shadow:0 8px 28px rgba(80,40,120,.08)">
<p style="font-size:22px;font-weight:bold;color:#7c3aed;margin:0 0 12px">CorpoPleno</p><p style="margin:0 0 20px">${texto}</p>
<a href="/meus-livros.html" style="display:inline-block;background:#db2777;color:#fff;text-decoration:none;font-weight:bold;padding:12px 24px;border-radius:999px">Meus Livros</a></div></body></html>`;
  return new Response(html, { status, headers: { "Content-Type": "text/html; charset=utf-8", ...SEGURANCA } });
}

async function descompactar(base64) {
  const bin = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  const stream = new Blob([bin]).stream().pipeThrough(new DecompressionStream("gzip"));
  return await new Response(stream).text();
}

// Faixa discreta para voltar à biblioteca do site (o app original não tem).
const VOLTAR = `<div style="background:#fff;border-bottom:1px solid #f1e6f3;padding:8px 16px;font:600 14px Arial,Helvetica,sans-serif">
<a href="/meus-livros.html" style="color:#7c3aed;text-decoration:none">← Meus Livros</a></div>`;

export async function onRequest({ request, env, params }) {
  if (request.method !== "GET") return new Response("Method Not Allowed", { status: 405 });
  const db = await getDb(env);
  if (!db) return pagina(503, "Indisponível", "O livro está temporariamente indisponível. Tente novamente em alguns minutos.");
  const user = await getSessionUser(db, request);
  if (!user) return Response.redirect(new URL("/login.html", request.url).toString(), 302);

  const bookId = String(params.bookId || "");
  if (!(await hasAccess(db, user.id, bookId))) {
    return pagina(403, "Acesso não liberado", "Este livro ainda não está liberado na sua conta. Se você já pagou, abra Meus Livros para atualizar.");
  }
  const { results } = await db
    .prepare("SELECT data FROM book_apps WHERE book_id = ? AND locale = 'pt-BR' ORDER BY chunk")
    .bind(bookId)
    .all();
  if (!results || !results.length) {
    return pagina(403, "Versão interativa indisponível", "Este livro não tem versão interativa. Use o leitor em Meus Livros.");
  }
  let html = await descompactar(results.map((r) => r.data).join(""));
  html = html.replace(/<body([^>]*)>/i, (m) => m + VOLTAR);
  return new Response(html, { status: 200, headers: { "Content-Type": "text/html; charset=utf-8", ...SEGURANCA } });
}
