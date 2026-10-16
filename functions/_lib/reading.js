/*
  Utilitários do leitor: checagem de acesso (entitlement) e limite de
  requisições do conteúdo pago.
*/
import { isRateLimited, registerAttempt, sha256Hex } from "./auth.js";

export const READER_LOCALES = ["pt-BR", "pt-PT", "en-US", "ko-KR", "es-CL"];
export const BOOK_ID_REGEX = /^[a-z0-9-]{1,100}$/;

export async function hasAccess(db, userId, bookId) {
  if (!BOOK_ID_REGEX.test(bookId)) return false;
  const row = await db
    .prepare("SELECT 1 AS ok FROM entitlements WHERE user_id = ? AND book_id = ?")
    .bind(userId, bookId)
    .first();
  return !!row;
}

// Limite de leitura de conteúdo: 60 requisições por cliente a cada 10 min
// (uma troca de idioma = 1 requisição; uso normal fica muito abaixo).
const CONTENT_LIMIT = 60;
const CONTENT_WINDOW_MS = 10 * 60 * 1000;
export async function contentRateLimited(db, userId) {
  const bucket = "content:user:" + userId;
  if (await isRateLimited(db, bucket, CONTENT_LIMIT, CONTENT_WINDOW_MS)) return true;
  await registerAttempt(db, bucket, CONTENT_WINDOW_MS);
  return false;
}

// Código curto e estável do cliente para a marca d'água (nunca e-mail/id).
export async function customerCode(userId) {
  return "CL-" + (await sha256Hex("watermark:" + userId)).slice(0, 8).toUpperCase();
}
