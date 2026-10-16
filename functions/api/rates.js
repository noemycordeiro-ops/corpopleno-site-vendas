/*
  GET /api/rates -- cotação BRL -> EUR, USD, KRW, CLP, só para EXIBIÇÃO.
  O preço oficial e o valor cobrado continuam sempre em BRL (o checkout
  nunca usa este endpoint).

  Fonte principal: open.er-api.com (pública, sem chave, cobre as 4
  moedas). Reserva: api.frankfurter.dev (BCE; cobre EUR/USD/KRW, sem CLP).
  Cache de 6 h na Cache API da Cloudflare; timeout de 4 s por fonte.
  Se tudo falhar: {ok:false} (o site mostra só o valor em R$), com cache
  curto de 10 min.
*/
import { json, methodNotAllowed } from "../_lib/http.js";

const MOEDAS = ["EUR", "USD", "KRW", "CLP"];
const CACHE_OK = 6 * 3600;
const CACHE_FALHA = 600;

async function buscar(url, ms) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    const r = await fetch(url, { signal: ctrl.signal, headers: { Accept: "application/json" } });
    return r.ok ? await r.json() : null;
  } catch (_) {
    return null;
  } finally {
    clearTimeout(t);
  }
}

function filtrar(rates) {
  const out = {};
  for (const m of MOEDAS) {
    const v = rates && Number(rates[m]);
    if (Number.isFinite(v) && v > 0) out[m] = v;
  }
  return out;
}

async function obterCotacao() {
  const a = await buscar("https://open.er-api.com/v6/latest/BRL", 4000);
  if (a && a.result === "success" && a.rates) {
    const rates = filtrar(a.rates);
    if (Object.keys(rates).length) {
      return { ok: true, base: "BRL", rates, fonte: "open.er-api.com", atualizadoEm: a.time_last_update_utc || null };
    }
  }
  const b = await buscar("https://api.frankfurter.dev/v1/latest?base=BRL&symbols=EUR,USD,KRW", 4000);
  if (b && b.rates) {
    const rates = filtrar(b.rates);
    if (Object.keys(rates).length) return { ok: true, base: "BRL", rates, fonte: "frankfurter (BCE)", atualizadoEm: b.date || null };
  }
  return { ok: false, base: "BRL", rates: {} };
}

export async function onRequest(context) {
  const { request } = context;
  if (request.method !== "GET") return methodNotAllowed();

  const cache = typeof caches !== "undefined" ? caches.default : null;
  const chave = new Request(new URL("/api/rates", request.url).toString(), { method: "GET" });
  if (cache) {
    const salvo = await cache.match(chave);
    if (salvo) return salvo;
  }

  const dados = await obterCotacao();
  const maxAge = dados.ok ? CACHE_OK : CACHE_FALHA;
  const resp = json(200, dados, { "Cache-Control": `public, max-age=${maxAge}` });
  if (cache) {
    const p = cache.put(chave, resp.clone());
    if (context.waitUntil) context.waitUntil(p); else await p;
  }
  return resp;
}
