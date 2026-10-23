/*
  Banco Cloudflare D1 (binding "DB"). O esquema é criado de forma
  idempotente (CREATE ... IF NOT EXISTS) na primeira requisição de cada
  isolate -- não há passo manual de migração.

  Status de purchases:
    CREATING  -> reservado localmente, chamando o Asaas (trava contra duplo clique)
    PENDING   -> cobrança criada no Asaas, aguardando pagamento
    PAID      -> pagamento confirmado pelo webhook (acesso liberado)
    CANCELLED -> cobrança removida (troca de método / PAYMENT_DELETED)
    EXPIRED   -> vencida (PAYMENT_OVERDUE ou pendência antiga)
    FAILED    -> o Asaas recusou/indisponível ao criar
*/

const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS users (
     id TEXT PRIMARY KEY,
     email TEXT NOT NULL UNIQUE,
     name TEXT NOT NULL,
     phone TEXT NOT NULL,
     terms_accepted_at INTEGER NOT NULL,
     pw_hash TEXT NOT NULL,
     pw_salt TEXT NOT NULL,
     pw_iter INTEGER NOT NULL,
     cpf_cnpj TEXT,
     asaas_customer_id TEXT,
     created_at INTEGER NOT NULL
   )`,
  `CREATE TABLE IF NOT EXISTS sessions (
     token_hash TEXT PRIMARY KEY,
     user_id TEXT NOT NULL,
     created_at INTEGER NOT NULL,
     expires_at INTEGER NOT NULL
   )`,
  `CREATE INDEX IF NOT EXISTS sessions_user ON sessions(user_id)`,
  `CREATE TABLE IF NOT EXISTS auth_attempts (
     bucket TEXT PRIMARY KEY,
     count INTEGER NOT NULL,
     window_start INTEGER NOT NULL
   )`,
  // id = código de compra legível e não sequencial (CP-XXXXXXXX), usado
  // também como externalReference no Asaas e na consulta administrativa.
  `CREATE TABLE IF NOT EXISTS purchases (
     id TEXT PRIMARY KEY,
     user_id TEXT NOT NULL,
     product_id TEXT NOT NULL,
     amount_cents INTEGER NOT NULL,
     payment_method TEXT NOT NULL,
     installment_count INTEGER NOT NULL DEFAULT 1,
     status TEXT NOT NULL,
     asaas_payment_id TEXT,
     asaas_installment_id TEXT,
     invoice_url TEXT,
     created_at INTEGER NOT NULL,
     updated_at INTEGER NOT NULL,
     paid_at INTEGER
   )`,
  // Idempotência: no máximo UMA compra em aberto por (usuário, produto).
  `CREATE UNIQUE INDEX IF NOT EXISTS purchases_open
     ON purchases(user_id, product_id) WHERE status IN ('CREATING','PENDING')`,
  `CREATE INDEX IF NOT EXISTS purchases_user ON purchases(user_id)`,
  `CREATE TABLE IF NOT EXISTS entitlements (
     user_id TEXT NOT NULL,
     book_id TEXT NOT NULL,
     purchase_id TEXT NOT NULL,
     granted_at INTEGER NOT NULL,
     PRIMARY KEY (user_id, book_id)
   )`,
  // Conteúdo PAGO dos livros, uma linha por página (limite do D1: 2 MB por
  // linha; a maior página tem ~23 KB). Carregado por
  // docs/tools/importar-conteudo-livros.py -- nunca vai para o GitHub.
  `CREATE TABLE IF NOT EXISTS book_pages (
     book_id TEXT NOT NULL,
     locale TEXT NOT NULL,
     page_index INTEGER NOT NULL,
     content TEXT NOT NULL,
     PRIMARY KEY (book_id, locale, page_index)
   )`,
  // Recuperação de senha: só o SHA-256 do token; uso único (used_at) e expiração.
  `CREATE TABLE IF NOT EXISTS password_resets (
     token_hash TEXT PRIMARY KEY,
     user_id TEXT NOT NULL,
     created_at INTEGER NOT NULL,
     expires_at INTEGER NOT NULL,
     used_at INTEGER
   )`,
  `CREATE INDEX IF NOT EXISTS password_resets_user ON password_resets(user_id)`,
  // Troca de e-mail em dois passos: um pedido pendente por cliente, com o
  // SHA-256 do código de 6 dígitos (salgado com o id da cliente).
  `CREATE TABLE IF NOT EXISTS email_change_requests (
     user_id TEXT PRIMARY KEY,
     new_email TEXT NOT NULL,
     code_hash TEXT NOT NULL,
     attempts INTEGER NOT NULL DEFAULT 0,
     created_at INTEGER NOT NULL,
     expires_at INTEGER NOT NULL
   )`,
  // Progresso de leitura por cliente + livro (último ponto lido, idioma e
  // preferências de leitura). block_marker = "p<página>-b<bloco>".
  `CREATE TABLE IF NOT EXISTS reading_progress (
     user_id TEXT NOT NULL,
     book_id TEXT NOT NULL,
     locale TEXT NOT NULL,
     page_index INTEGER NOT NULL,
     block_marker TEXT,
     prefs TEXT,
     updated_at INTEGER NOT NULL,
     PRIMARY KEY (user_id, book_id)
   )`,
  // Versão interativa de um livro (HTML completo, gzip+base64 em partes).
  // Servida só a quem tem acesso por functions/api/books/[bookId]/app.js.
  `CREATE TABLE IF NOT EXISTS book_apps (
     book_id TEXT NOT NULL,
     locale TEXT NOT NULL,
     chunk INTEGER NOT NULL,
     data TEXT NOT NULL,
     PRIMARY KEY (book_id, locale, chunk)
   )`,
  `CREATE TABLE IF NOT EXISTS webhook_events (
     event_id TEXT PRIMARY KEY,
     event_type TEXT,
     payment_id TEXT,
     purchase_id TEXT,
     result TEXT,
     received_at INTEGER NOT NULL
   )`,
];

let schemaReady = false;

export async function getDb(env) {
  if (!env.DB) return null;
  if (!schemaReady) {
    await env.DB.batch(SCHEMA.map((sql) => env.DB.prepare(sql)));
    schemaReady = true;
  }
  return env.DB;
}

export function now() {
  return Date.now();
}
