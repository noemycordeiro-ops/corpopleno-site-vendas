/*
  Autenticação de clientes: senha com PBKDF2-SHA256 (Web Crypto, salt
  aleatório por usuário), sessão = token aleatório em cookie HttpOnly
  Secure SameSite=Lax; no banco fica só o SHA-256 do token.
*/
import { getCookie } from "./http.js";
import { now } from "./db.js";

// 100000 é o máximo de iterações PBKDF2 aceito pelo runtime do Workers.
export const PBKDF2_ITERATIONS = 100000;
export const SESSION_COOKIE = "__Host-cp_session";
const SESSION_TTL_MS = 30 * 24 * 3600 * 1000;

const enc = new TextEncoder();

export function b64(bytes) {
  let s = "";
  for (const b of new Uint8Array(bytes)) s += String.fromCharCode(b);
  return btoa(s);
}

function b64url(bytes) {
  return b64(bytes).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromB64(str) {
  const bin = atob(str);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export function randomBytes(n) {
  return crypto.getRandomValues(new Uint8Array(n));
}

export function randomId(prefix) {
  return prefix + "_" + b64url(randomBytes(16));
}

// Código de compra: "CP-" + 8 caracteres aleatórios em base32 Crockford
// (sem I/L/O/U, que se confundem com 1/0/V) -> 32^8 ≈ 1,1e12
// combinações, sem viés (256 é múltiplo de 32) e não sequencial.
const CODE_ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
export function purchaseCode() {
  const bytes = randomBytes(8);
  let out = "CP-";
  for (const b of bytes) out += CODE_ALPHABET[b % CODE_ALPHABET.length];
  return out;
}

export async function sha256Hex(text) {
  const digest = await crypto.subtle.digest("SHA-256", enc.encode(text));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function timingSafeEqual(a, b) {
  const x = enc.encode(String(a));
  const y = enc.encode(String(b));
  let diff = x.length ^ y.length;
  const len = Math.max(x.length, y.length);
  for (let i = 0; i < len; i++) diff |= (x[i] || 0) ^ (y[i] || 0);
  return diff === 0;
}

async function pbkdf2(password, saltBytes, iterations) {
  const key = await crypto.subtle.importKey("raw", enc.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: saltBytes, iterations }, key, 256);
  return b64(bits);
}

export async function hashPassword(password) {
  const salt = randomBytes(16);
  const hash = await pbkdf2(password, salt, PBKDF2_ITERATIONS);
  return { hash, salt: b64(salt), iterations: PBKDF2_ITERATIONS };
}

export async function verifyPassword(password, user) {
  const hash = await pbkdf2(password, fromB64(user.pw_salt), user.pw_iter);
  return timingSafeEqual(hash, user.pw_hash);
}

// Executa o mesmo custo de PBKDF2 quando o e-mail não existe (evita
// descobrir e-mails cadastrados pelo tempo de resposta).
export async function dummyVerify(password) {
  await pbkdf2(password, randomBytes(16), PBKDF2_ITERATIONS);
  return false;
}

export function sessionCookie(token) {
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_TTL_MS / 1000}`;
}

export function clearSessionCookie() {
  return `${SESSION_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

export async function createSession(db, userId) {
  const token = b64url(randomBytes(32));
  const t = now();
  await db
    .prepare("INSERT INTO sessions (token_hash, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)")
    .bind(await sha256Hex(token), userId, t, t + SESSION_TTL_MS)
    .run();
  return token;
}

export async function destroySession(db, request) {
  const token = getCookie(request, SESSION_COOKIE);
  if (!token) return;
  await db.prepare("DELETE FROM sessions WHERE token_hash = ?").bind(await sha256Hex(token)).run();
}

export async function getSessionUser(db, request) {
  const token = getCookie(request, SESSION_COOKIE);
  if (!token || token.length > 100) return null;
  const row = await db
    .prepare(
      `SELECT u.id, u.email, u.name, u.cpf_cnpj, u.asaas_customer_id, s.expires_at
         FROM sessions s JOIN users u ON u.id = s.user_id
        WHERE s.token_hash = ?`
    )
    .bind(await sha256Hex(token))
    .first();
  if (!row || row.expires_at < now()) return null;
  return row;
}

/* ---- Limite de tentativas (força bruta) ------------------------------ */

export async function isRateLimited(db, bucket, limit, windowMs) {
  const row = await db.prepare("SELECT count, window_start FROM auth_attempts WHERE bucket = ?").bind(bucket).first();
  if (!row) return false;
  if (row.window_start + windowMs < now()) return false;
  return row.count >= limit;
}

export async function registerAttempt(db, bucket, windowMs) {
  const t = now();
  await db
    .prepare(
      `INSERT INTO auth_attempts (bucket, count, window_start) VALUES (?1, 1, ?2)
       ON CONFLICT(bucket) DO UPDATE SET
         count = CASE WHEN window_start + ?3 < ?2 THEN 1 ELSE count + 1 END,
         window_start = CASE WHEN window_start + ?3 < ?2 THEN ?2 ELSE window_start END`
    )
    .bind(bucket, t, windowMs)
    .run();
}

export async function clearAttempts(db, bucket) {
  await db.prepare("DELETE FROM auth_attempts WHERE bucket = ?").bind(bucket).run();
}

export function normalizeEmail(email) {
  return typeof email === "string" ? email.trim().toLowerCase() : "";
}

// Nome completo: 2+ palavras, 5-120 caracteres, só letras/espaços/'.-
export function normalizeName(value) {
  return typeof value === "string" ? value.trim().replace(/\s+/g, " ") : "";
}
export function isValidFullName(name) {
  return name.length >= 5 && name.length <= 120 && name.includes(" ") && /^[\p{L}' .-]+$/u.test(name);
}

// Telefone: só dígitos, 10-15 (DDD + número no Brasil, ou formato internacional).
export function normalizePhone(value) {
  return typeof value === "string" ? value.replace(/\D/g, "") : "";
}
export function isValidPhone(digits) {
  return digits.length >= 10 && digits.length <= 15;
}

export function isValidEmail(email) {
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
