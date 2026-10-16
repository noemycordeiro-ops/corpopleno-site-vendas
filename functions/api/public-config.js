/*
  GET /api/public-config -- configuração PÚBLICA do site (antes vinha do
  servidor local). Hoje só o id do Pixel da Meta, lido da variável
  META_PIXEL_ID (é um identificador público, não um segredo). Sem a
  variável, devolve null e o Pixel simplesmente não é carregado.
*/
import { json, methodNotAllowed } from "../_lib/http.js";

export async function onRequest({ request, env }) {
  if (request.method !== "GET") return methodNotAllowed();
  const id = typeof env.META_PIXEL_ID === "string" && /^\d{5,20}$/.test(env.META_PIXEL_ID.trim()) ? env.META_PIXEL_ID.trim() : null;
  return json(200, { ok: true, metaPixelId: id }, { "Cache-Control": "public, max-age=300" });
}
