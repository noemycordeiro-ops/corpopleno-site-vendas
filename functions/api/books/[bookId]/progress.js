/*
  GET /api/books/:bookId/progress -> {ok, progress:{locale, pageIndex, blockMarker, prefs, updatedAt}|null}
  PUT /api/books/:bookId/progress  {locale, pageIndex, blockMarker?, prefs?}
  Progresso de leitura por cliente + livro, salvo no D1. Só para quem tem
  acesso ao livro. prefs aceita apenas chaves conhecidas do leitor.
  Limite de gravação: 120 por cliente a cada 10 min (o leitor espera ~1,5 s
  entre gravações).
*/
import { json, methodNotAllowed, readJson, sameOriginOk } from "../../../_lib/http.js";
import { getDb, now } from "../../../_lib/db.js";
import { getSessionUser, isRateLimited, registerAttempt } from "../../../_lib/auth.js";
import { hasAccess, READER_LOCALES } from "../../../_lib/reading.js";

const PREF_RULES = {
  fontIndex: (v) => Number.isInteger(v) && v >= 0 && v <= 10,
  theme: (v) => v === "light" || v === "dark",
  deviceMode: (v) => ["AUTO", "DESKTOP_TV", "TABLET", "MOBILE"].includes(v),
  pageLayoutMode: (v) => ["AUTO", "DOUBLE", "SINGLE"].includes(v),
};

function cleanPrefs(p) {
  if (!p || typeof p !== "object") return null;
  const out = {};
  for (const [k, rule] of Object.entries(PREF_RULES)) if (k in p && rule(p[k])) out[k] = p[k];
  return Object.keys(out).length ? out : null;
}

export async function onRequest({ request, env, params }) {
  const db = await getDb(env);
  if (!db) return json(503, { ok: false, erro: "BANCO_NAO_CONFIGURADO" });
  const user = await getSessionUser(db, request);
  if (!user) return json(401, { ok: false, erro: "NAO_AUTENTICADO" });
  const bookId = String(params.bookId || "");
  if (!(await hasAccess(db, user.id, bookId))) return json(403, { ok: false, erro: "ACESSO_NEGADO" });

  if (request.method === "GET") {
    const r = await db
      .prepare("SELECT locale, page_index, block_marker, prefs, updated_at FROM reading_progress WHERE user_id = ? AND book_id = ?")
      .bind(user.id, bookId)
      .first();
    return json(200, {
      ok: true,
      progress: r
        ? { locale: r.locale, pageIndex: r.page_index, blockMarker: r.block_marker, prefs: r.prefs ? JSON.parse(r.prefs) : null, updatedAt: new Date(r.updated_at).toISOString() }
        : null,
    });
  }

  if (request.method !== "PUT") return methodNotAllowed();
  if (!sameOriginOk(request)) return json(403, { ok: false, erro: "ORIGEM_INVALIDA" });

  const bucket = "progress:user:" + user.id;
  if (await isRateLimited(db, bucket, 120, 10 * 60 * 1000)) return json(429, { ok: false, erro: "MUITAS_REQUISICOES" });
  await registerAttempt(db, bucket, 10 * 60 * 1000);

  const body = await readJson(request);
  if (!body) return json(400, { ok: false, erro: "JSON_INVALIDO" });
  const locale = String(body.locale || "");
  const pageIndex = Number(body.pageIndex);
  const marker = typeof body.blockMarker === "string" && /^p\d{1,5}-b\d{1,4}$/.test(body.blockMarker) ? body.blockMarker : null;
  if (!READER_LOCALES.includes(locale) || !Number.isInteger(pageIndex) || pageIndex < 0 || pageIndex > 100000) {
    return json(400, { ok: false, erro: "PROGRESSO_INVALIDO" });
  }
  const prefs = cleanPrefs(body.prefs);
  await db
    .prepare(
      `INSERT INTO reading_progress (user_id, book_id, locale, page_index, block_marker, prefs, updated_at)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
       ON CONFLICT(user_id, book_id) DO UPDATE SET
         locale = ?3, page_index = ?4, block_marker = ?5,
         prefs = COALESCE(?6, prefs), updated_at = ?7`
    )
    .bind(user.id, bookId, locale, pageIndex, marker, prefs ? JSON.stringify(prefs) : null, now())
    .run();
  return json(200, { ok: true });
}
