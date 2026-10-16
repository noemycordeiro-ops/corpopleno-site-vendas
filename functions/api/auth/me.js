/*
  GET /api/auth/me
  Contrato (main.js, account-home.js, books-account.js, book-detail.js):
    logado     -> 200 {autenticado:true, nome, email, temDocumento}
    não logado -> 200 {autenticado:false}
*/
import { json, methodNotAllowed } from "../../_lib/http.js";
import { getDb } from "../../_lib/db.js";
import { getSessionUser } from "../../_lib/auth.js";

export async function onRequest({ request, env }) {
  if (request.method !== "GET") return methodNotAllowed();
  const db = await getDb(env);
  if (!db) return json(503, { autenticado: false, erro: "BANCO_NAO_CONFIGURADO" });
  const user = await getSessionUser(db, request);
  // 200 (e não 401) para visitante sem login: é um estado normal, e um 401
  // aparece como erro no console do navegador em todas as páginas.
  if (!user) return json(200, { autenticado: false });
  return json(200, {
    autenticado: true,
    nome: user.name || "",
    email: user.email,
    temDocumento: !!user.cpf_cnpj,
  });
}
