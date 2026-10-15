/*
  A pasta docs/ fica no repositório (memória do projeto no GitHub), mas o
  Cloudflare Pages publica a raiz "." inteira. Esta função (incluída em
  _routes.json) faz /docs/* responder 404 em vez de servir os arquivos.
*/
export function onRequest() {
  return new Response("Not found", { status: 404, headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
