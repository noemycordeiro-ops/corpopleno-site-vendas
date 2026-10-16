/*
  Bloqueio de arquivos internos. O Cloudflare Pages publica a raiz "."
  inteira; esta função só é chamada para os caminhos listados em
  _routes.json (documentos internos) e responde 404.
*/
export function onRequest() {
  return new Response("Not found", { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
