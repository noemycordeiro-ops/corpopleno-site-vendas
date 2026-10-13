/*
  Fase CorpoPleno Livros 003 (2026-10-03) — endereço do backend real
  (Cordex) que agora atende /api/auth/*, /api/me/books e
  /api/books/:bookId/access (ver server/auth/customer_auth_routes.js no
  repositório do Cordex).

  "" (string vazia) = caminho relativo ao PRÓPRIO domínio do site --
  assume que, em produção, /api/* deste domínio é roteado para o Cordex
  (mesma origem, nenhum problema de cookie cross-site com
  SameSite=Lax). Essa decisão de roteamento/proxy é de infraestrutura
  (Cloudflare/DNS) e está FORA do escopo desta fase (instrução explícita:
  não tocar Cloudflare/DNS, não fazer deploy) -- continua pendente de uma
  fase própria de implantação.

  Para teste manual LOCAL (site servido por "python3 -m http.server" numa
  porta e o Cordex rodando com "node server.js" na 3210), troque
  temporariamente para "http://127.0.0.1:3210" nesta única linha -- nunca
  comitar essa troca.
*/
window.CP_API_BASE = "";
