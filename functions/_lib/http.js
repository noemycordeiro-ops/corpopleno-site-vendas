/*
  Utilitários HTTP compartilhados pelas Pages Functions (sem rota própria:
  arquivos em functions/_lib não exportam onRequest*, então o Cloudflare
  Pages não cria rota para eles).
*/

export function json(status, body, extraHeaders) {
  const headers = new Headers({
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  if (extraHeaders) {
    for (const [k, v] of Object.entries(extraHeaders)) {
      if (Array.isArray(v)) v.forEach((item) => headers.append(k, item));
      else headers.set(k, v);
    }
  }
  return new Response(JSON.stringify(body), { status, headers });
}

export function methodNotAllowed() {
  return json(405, { ok: false, erro: "METHOD_NOT_ALLOWED" });
}

export async function readJson(request) {
  try {
    const text = await request.text();
    if (text.length > 16384) return null;
    const data = JSON.parse(text || "{}");
    return data && typeof data === "object" && !Array.isArray(data) ? data : null;
  } catch (_) {
    return null;
  }
}

export function getCookie(request, name) {
  const header = request.headers.get("cookie") || "";
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    if (part.slice(0, idx).trim() === name) return part.slice(idx + 1).trim();
  }
  return null;
}

/*
  Proteção CSRF complementar ao SameSite=Lax: se o navegador mandar
  Origin (sempre manda em POST via fetch), ele precisa ser o mesmo host da
  requisição. Requisições sem Origin (curl, servidor-a-servidor) seguem.
*/
export function sameOriginOk(request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === new URL(request.url).host;
  } catch (_) {
    return false;
  }
}

export function clientIp(request) {
  return request.headers.get("cf-connecting-ip") || "local";
}
