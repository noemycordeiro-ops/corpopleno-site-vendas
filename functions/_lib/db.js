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
     name TEXT,
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
