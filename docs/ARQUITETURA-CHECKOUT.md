# Arquitetura do checkout de livros (Opção A)

> Memória do projeto. Branch: `feature/catalogo-combos-checkout`.
> Projeto Cloudflare Pages: `cp-web-001` (www.corpoplenoresultadoreal.com.br).
> Última atualização: 2026-10-15 (Fase 2: D1 criados, leitura dos livros, recuperação de senha).
> Este arquivo **não** é publicado no site: `/docs/*` responde 404 por meio de `functions/docs/[[path]].js` e `_routes.json`.

## 1. Visão geral

Login, clientes, compras e liberação de livros rodam **inteiramente em Cloudflare Pages Functions**, com banco **Cloudflare D1**. Nada depende do Cordex local (porta 3210), que não é acessível pela internet.

```
Navegador ──> Pages (HTML/JS estático)
          └─> /api/*  ──> Pages Functions ──> D1 (binding DB)
                                   │
                                   └──> API Asaas v3 (header access_token)
Asaas ──webhook──> /api/books/webhook ──> D1 (PAID + livros liberados)
Cordex (local) ──GET──> /api/admin/purchases (Bearer ADMIN_API_TOKEN, somente leitura)
```

- **Armazenamento: D1, não KV.** Usuários, sessões, compras e acessos são dados relacionais. Também precisamos de idempotência transacional: índice único parcial e `db.batch` atômico. O binding KV `PURCHASES` do código antigo foi removido.
- **Esquema automático:** `functions/_lib/db.js` roda `CREATE TABLE/INDEX IF NOT EXISTS` na primeira requisição de cada isolate. Não existe passo manual de migração.
- **Pagamento:** PIX e cartão são pagos na **fatura hospedada do Asaas** (`invoiceUrl`). O site nunca recebe dados de cartão.
- **Preço:** definido sempre pelo servidor, em `functions/_lib/catalog.js`. Os campos `books-data.js` e `metadata.json` servem só para exibição.

### Arquivos

| Arquivo | Função |
|---|---|
| `functions/_lib/http.js` | resposta JSON, cookies, checagem de Origin (CSRF), IP |
| `functions/_lib/db.js` | esquema D1 + `getDb(env)` |
| `functions/_lib/auth.js` | PBKDF2, sessões, limite de tentativas, validação de nome/e-mail/telefone, código de compra |
| `functions/_lib/catalog.js` | preços e itens de cada produto (inclui combos) |
| `functions/_lib/asaas.js` | cliente Asaas (customers, payments, delete), validação de CPF/CNPJ |
| `functions/api/auth/signup.js` · `login.js` · `logout.js` · `me.js` | autenticação |
| `functions/api/me/books.js` | livros da cliente |
| `functions/api/books/[bookId]/checkout.js` | cria ou reutiliza a cobrança |
| `functions/api/books/[bookId]/access.js` | o leitor pergunta se a cliente pode ler |
| `functions/api/books/[bookId]/purchase-confirmation.js` | evento Purchase da Meta só após o pagamento |
| `functions/api/books/webhook.js` | webhook Asaas |
| `functions/api/admin/purchases.js` | consulta somente leitura para o Cordex |
| `functions/api/books/[bookId]/content/[locale].js` | conteúdo pago do livro, só para quem comprou |
| `functions/api/auth/password-reset/request.js` · `confirm.js` | recuperação de senha |
| `functions/_lib/email.js` | envio de e-mail pelo Resend |
| `functions/docs/[[path]].js` | bloqueia `/docs/*` no site público |
| `docs/tools/importar-conteudo-livros.py` | gera os .sql do conteúdo pago (fora do repositório) |

## 2. Autenticação

- **Cadastro** (`POST /api/auth/signup`): pede `nomeCompleto`, `email`, `telefone`, `password` e `termsAccepted:true`, todos **obrigatórios e validados no servidor**:
  - nome com 2 ou mais palavras e 5 a 120 caracteres;
  - e-mail válido;
  - telefone com 10 a 15 dígitos;
  - senha com 8 a 512 caracteres;
  - aceite dos Termos e da Política de Privacidade.
- **Senha:** guardada apenas como hash PBKDF2-SHA256, com 100.000 iterações (o máximo que o Workers aceita) e salt aleatório de 16 bytes por usuário. Nunca é guardada em texto, nunca aparece em log e nunca é devolvida.
- **Sessão:** token aleatório de 32 bytes no cookie `__Host-cp_session` (`HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=30 dias`). O banco guarda só o SHA-256 do token. O logout apaga a sessão no banco.
- **Força bruta:**
  - login: 5 falhas por e-mail ou 30 por IP a cada 15 minutos geram `429 MUITAS_TENTATIVAS`;
  - cadastro: 10 por IP por hora;
  - um PBKDF2 "falso" roda para e-mails que não existem, para o tempo de resposta não revelar se o e-mail está cadastrado.
- **CSRF:** além do SameSite=Lax, todo POST com `Origin` de outro host recebe `403 ORIGEM_INVALIDA`.

## 3. Checkout e código de compra

`POST /api/books/:bookId/checkout` com o corpo `{paymentMethod: "PIX"|"CREDIT_CARD", termsAccepted:true, cpfCnpj?, nomeCompleto?, installmentCount?}`. O servidor:

1. Exige sessão (`401 NAO_AUTENTICADO`), aceite dos termos (`TERMS_NOT_ACCEPTED`), método válido (`PAYMENT_METHOD_NOT_ALLOWED`) e produto no catálogo (`409 BOOK_PRICE_NOT_CONFIGURED`).
2. Aceita parcelamento só em **Receitas**, de 1 a 4 vezes no cartão (`INSTALLMENTS_NOT_ALLOWED`). Nesse caso envia `installmentCount` e `totalValue` ao Asaas.
3. Bloqueia a compra se a cliente já tem todos os livros do produto (`409 ALREADY_OWNED`).
4. Aplica idempotência por (usuário, produto), com no máximo uma compra em `CREATING`/`PENDING`:
   - mesmo método: devolve a mesma fatura (`reused:true`);
   - outro método ou outro número de parcelas: cancela a cobrança anterior no Asaas (DELETE) antes de criar a nova;
   - cliques simultâneos: apenas um cria a cobrança; os outros recebem `409 PAYMENT_ATTEMPT_ALREADY_DISPATCHING`;
   - uma compra pendente com mais de 3 dias vira `EXPIRED`.
5. Na primeira compra pede CPF/CNPJ (`CUSTOMER_DOCUMENT_REQUIRED` / `CUSTOMER_DOCUMENT_INVALID`, com verificação dos dígitos). Cria ou reutiliza o cliente Asaas `cus_...` (busca por `externalReference` = id do usuário; se não achar, `POST /customers` com nome, e-mail e CPF/CNPJ).
6. Gera o **código de compra** `CP-XXXXXXXX`: 8 caracteres aleatórios em base32 Crockford, sem I/L/O/U. São cerca de 1,1 trilhão de combinações e o código não é sequencial. Ele é a chave da compra no D1, o `externalReference` da cobrança no Asaas e a chave de consulta do Cordex.
7. Cria a cobrança (`POST /payments`, vencimento em D+2, horário de Brasília) e grava `PENDING` com `asaas_payment_id` e `invoiceUrl`.
8. Responde `201 {ok:true, paymentMethod, invoiceUrl, purchaseCode, purchaseId}`. A tela abre a fatura segura do Asaas.

Se o Asaas falhar, a resposta é `503 PAYMENT_PROVIDER_UNAVAILABLE` (rede/5xx) ou `502 PAYMENT_PROVIDER_REJECTED` (4xx). Sem chave configurada, a resposta é `503 AMBIENTE_ASAAS_NAO_CONFIGURADO`.

### Catálogo (preço no servidor)

| Produto | Preço | Libera |
|---|---|---|
| hene-sem-medo-livro-1 / -2 | R$ 39,90 | o próprio livro |
| amor-que-aprendeu-a-ficar / amor-que-ensina-a-crescer | R$ 29,90 | o próprio livro |
| receitas-corpopleno | R$ 200,00 (até 4x no cartão) | o próprio livro |
| hene-sem-medo-combo | R$ 70,00 | Henê livros 1 e 2 |
| romance-combo | R$ 50,00 | os 2 livros "Amor" |

## 4. Webhook Asaas

`POST /api/books/webhook`:

1. Valida o header `asaas-access-token` contra o Secret `ASAAS_WEBHOOK_TOKEN`, com comparação em tempo constante. Sem o Secret configurado responde 503; com token errado, 401.
2. Localiza a compra pelo `externalReference` (código CP-…) e confere se o id da cobrança (ou do parcelamento) é o mesmo. Em cobrança à vista, confere também o valor.
3. `PAYMENT_RECEIVED` / `PAYMENT_CONFIRMED`: numa única transação (`db.batch`), marca a compra como `PAID` **uma única vez** e libera o livro, ou os 2 livros do combo, com `INSERT OR IGNORE`. Reentregas do mesmo evento são inofensivas.
4. `PAYMENT_DELETED` encerra a compra pendente como `CANCELLED`; `PAYMENT_OVERDUE`, como `EXPIRED`.
5. Eventos desconhecidos ou que não se aplicam respondem 200, porque o Asaas pausa a fila quando recebe erro. Todo evento fica registrado em `webhook_events`.

## 5. Endpoint administrativo para o Cordex (somente leitura)

`GET /api/admin/purchases`, autenticado pelo header `Authorization: Bearer <ADMIN_API_TOKEN>`. Sem o Secret configurado responde 503; com token errado ou ausente, 401.

- `?code=CP-XXXXXXXX`: devolve uma compra (`404 COMPRA_NAO_ENCONTRADA` se não existir; `400 CODIGO_INVALIDO` se o formato estiver errado).
- `?status=PAID|PENDING|…&limit=1..200&before=<epoch ms>`: lista as compras, das mais recentes para as mais antigas. Para paginar, envie `nextBefore` como `before`.
- A resposta traz: código, status, produto, valor, método, parcelas, ids Asaas, `invoiceUrl`, datas, livros liberados e o cliente (id, nome, e-mail, telefone, CPF/CNPJ **mascarado**, id Asaas).
- A resposta **nunca** traz hash ou salt de senha, tokens de sessão nem a chave Asaas.

Como o Cordex deve chamar (o Cordex **não** foi alterado):

```bash
curl -s "https://www.corpoplenoresultadoreal.com.br/api/admin/purchases?code=CP-3KHXVMY4" \
  -H "Authorization: Bearer $ADMIN_API_TOKEN"
```

O token fica numa variável de ambiente do Cordex. Nunca deve ir para código, log ou HTML.

## 5a. Leitura dos livros comprados

`GET /api/books/:bookId/content/:locale` segue o mesmo contrato que o Cordex usava e que o `reader.js` espera:

- `401 NAO_AUTENTICADO` sem sessão;
- `403 ACESSO_NEGADO` sem compra (mesma resposta para livro inexistente);
- `404 CONTEUDO_NAO_ENCONTRADO` quando o idioma não tem conteúdo carregado;
- `200 {ok:true, pages:[...]}` com `Cache-Control: private, no-store`.

O conteúdo fica na tabela `book_pages` do D1, uma linha por página. O R2 não está habilitado na conta (a API respondeu 403 "Please enable R2"). O limite do D1 é 2 MB por linha e a maior página tem cerca de 23 KB. Os 23 pares (livro, idioma) somam cerca de 7 MB em SQL.

**Origem do conteúdo:** `cordex_unificado_preparacao_20260915/unificado/private_content/books/<livro>/<idioma>/pages.json` no notebook. Idiomas disponíveis:

- livros Henê e "O Amor que Ensina": 5 idiomas cada;
- "O Amor que Aprendeu a Ficar": 5 idiomas, mas o ko-KR tem só 9 páginas e os arquivos en-US e es-CL têm exatamente o mesmo tamanho do pt-BR, então parecem não traduzidos (conferir);
- Receitas: pt-BR, pt-PT e en-US (ko-KR e es-CL só têm arquivos de trabalho em `_build/`, sem `pages.json`).

**O repositório no GitHub é PÚBLICO.** O conteúdo pago nunca entra no git. O script `docs/tools/importar-conteudo-livros.py` gera os .sql numa pasta fora do repositório e se recusa a gravar dentro dele. Os arquivos saem em partes de até ~500 KB (um arquivo de 3 MB travou o D1 local). A parte 01 de cada (livro, idioma) apaga e recarrega, então rodar de novo é seguro.

## 5b. Recuperação de senha

- `POST /api/auth/password-reset/request {email}` responde **sempre 200** para não revelar quais e-mails têm conta. Se a conta existir:
  - invalida os pedidos anteriores;
  - cria um token aleatório de 32 bytes, de **uso único**, válido por **60 minutos**; no banco fica só o **SHA-256** (tabela `password_resets`);
  - envia o link `https://<site>/redefinir-senha.html#token=...`.
- Limite: 3 pedidos por e-mail e 10 por IP a cada hora (429).
- `POST /api/auth/password-reset/confirm {token, password}`:
  - "gasta" o token com um UPDATE condicional **antes** de trocar a senha, então nem duas requisições simultâneas conseguem usá-lo duas vezes;
  - grava a nova senha com PBKDF2;
  - **encerra todas as sessões** da conta;
  - erros: `400 TOKEN_INVALIDO_OU_EXPIRADO` e `400 SENHA_FORA_DO_TAMANHO_PERMITIDO`.
- O token vai no **fragmento** da URL (`#`), que o navegador não envia ao servidor. O `auth-reset.js` é carregado antes de todos os outros scripts, lê o token e o apaga da barra de endereço. As páginas `esqueci-senha.html` e `redefinir-senha.html` não carregam o pixel da Meta e usam `referrer: no-referrer`.
- **E-mail:** o envio usa o Resend (`RESEND_API_KEY` + `EMAIL_FROM`). Sem esses Secrets, nada é enviado e o motivo vai para o log (nunca o token). Nesse caso a cliente vê a mesma mensagem, mas **não recebe o e-mail**.

## 6. Banco D1 (binding `DB`)

| Tabela | Colunas principais |
|---|---|
| `users` | id, email (único), name, phone, terms_accepted_at, pw_hash, pw_salt, pw_iter, cpf_cnpj, asaas_customer_id, created_at |
| `sessions` | token_hash (SHA-256), user_id, created_at, expires_at |
| `auth_attempts` | bucket (login:email / login:ip / signup:ip), count, window_start |
| `purchases` | **id = código CP-XXXXXXXX**, user_id, product_id, amount_cents, payment_method, installment_count, status, asaas_payment_id, asaas_installment_id, invoice_url, created_at, updated_at, paid_at |
| `entitlements` | (user_id, book_id) PK, purchase_id, granted_at |
| `webhook_events` | event_id, event_type, payment_id, purchase_id, result, received_at |
| `book_pages` | (book_id, locale, page_index) PK, content (JSON da página) |
| `password_resets` | token_hash (SHA-256), user_id, created_at, expires_at, used_at |

Índice único parcial `purchases_open (user_id, product_id) WHERE status IN ('CREATING','PENDING')`.
Status de compra: `CREATING → PENDING → PAID`, ou `CANCELLED` / `EXPIRED` / `FAILED`.

## 7. Fluxo da cliente

1. Clica em "Entrar" e depois em "Criar conta" (`cadastro.html`). Preenche nome completo, e-mail, telefone e senha, aceita os Termos e a Política de Privacidade e já entra logada.
2. Em Produtos, escolhe um livro ou combo (o card do combo mostra as 2 capas originais sobrepostas) e clica em "Comprar" (`livro.html`). Se não estiver logada, vai para o login e volta ao livro depois.
3. No painel de compra, escolhe PIX ou cartão. Na primeira compra informa o CPF/CNPJ. Em Receitas, escolhe de 1x a 4x. Aceita os termos e confirma.
4. O servidor cria a cobrança e devolve o código CP-…; a cliente abre a fatura segura do Asaas e paga.
5. O Asaas chama o webhook, a compra vira `PAID` e o livro (ou os 2 do combo) aparece em "Meus Livros".

## 8. Secrets, variáveis e bindings (só nomes)

| Nome | Tipo | Production | Preview |
|---|---|---|---|
| `DB` | binding D1 | banco de produção | **banco separado** de preview (recomendado) |
| `ASAAS_API_KEY` | Secret | chave de produção (já existe) | **chave Sandbox**; ainda precisa ser cadastrada |
| `ASAAS_API_URL` | variável | `https://api.asaas.com/v3` (padrão do código, opcional) | `https://api-sandbox.asaas.com/v3` (**obrigatória**: sem ela o código usa a URL de produção) |
| `ASAAS_WEBHOOK_TOKEN` | Secret | criar | criar (pode ser diferente) |
| `ADMIN_API_TOKEN` | Secret | criar (token longo e aleatório) | opcional |
| `RESEND_API_KEY` | Secret | criar (conta Resend) | opcional |
| `EMAIL_FROM` | variável | ex.: `CorpoPleno <nao-responda@corpoplenoresultadoreal.com.br>` (domínio verificado no Resend) | igual |

Não existe `wrangler.toml`. Bindings, variáveis e Secrets ficam no painel do Cloudflare, separados para Production e Preview. Motivos:

- na Fase 1 não havia credencial Cloudflare disponível (MCP 401, wrangler sem login); na Fase 2 o MCP passou a funcionar, mas ele não tem ferramentas de Pages, então não consegue ligar bindings nem gravar Secrets;
- um `database_id` fictício quebraria o build;
- o Pages publica a raiz `.`, então `/wrangler.toml` era servido publicamente (confirmado: HTTP 200 no Preview antigo).

O arquivo antigo era de Workers (`type`, `routes`, `[triggers]`, `cache_on_cookie`), inválido para Pages. Por isso foi removido.

## 9. Passos manuais

### Cloudflare: D1 (já criados na Fase 2)

Os bancos foram criados pelo conector MCP Cloudflare em 2026-10-15, na região ENAM:

| Banco | UUID | Uso |
|---|---|---|
| `corpopleno-livros` | `1bb6ea26-b951-4ba8-b4da-079ccf49ca74` | Production (vazio; o esquema é criado na primeira requisição) |
| `corpopleno-livros-preview` | `d1aed434-bbb6-4031-b4fe-ce64990889c1` | Preview (esquema aplicado e conferido: 8 tabelas) |

O MCP não mostra o id da conta. **Confirme no painel** que os dois bancos aparecem na mesma conta do `cp-web-001` (id `4fc3a975…`). Se não aparecerem, crie-os nessa conta com os mesmos nomes.

### Cloudflare: o que o assistente NÃO conseguiu fazer (precisa da Noemi)

O MCP Cloudflare não tem ferramentas de Pages. O `npx wrangler whoami` responde "You are not authenticated" e não há `CLOUDFLARE_API_TOKEN` no ambiente. Duas opções:

- **A)** Rodar `npx wrangler login` no notebook (exige Node 22 ou mais, porque o Node 18 instalado não roda o wrangler 4; o wrangler 3 funciona). Depois disso o assistente consegue fazer os passos abaixo.
- **B)** Fazer pelo painel:

1. **Pages `cp-web-001` → Settings → Bindings → Add → D1 database**, nome de variável `DB`: em Production, `corpopleno-livros`; em Preview, `corpopleno-livros-preview`.
2. **Settings → Variables and Secrets:**
   - Production: confira `ASAAS_API_KEY` (já existe) e crie os Secrets `ASAAS_WEBHOOK_TOKEN` e `ADMIN_API_TOKEN` (valores aleatórios, por exemplo `openssl rand -hex 32`).
   - Preview: crie `ASAAS_API_KEY` com a **chave Sandbox**, a variável `ASAAS_API_URL = https://api-sandbox.asaas.com/v3` e `ASAAS_WEBHOOK_TOKEN`.
   - Recuperação de senha (opcional): `RESEND_API_KEY` e `EMAIL_FROM`.
3. Faça um novo deploy (um push na branch ou "Retry deployment").
4. **Carregar o conteúdo dos livros** (depois do login do wrangler):
   ```bash
   python3 docs/tools/importar-conteudo-livros.py \
     --origem ~/CorpoPleno-IA/workspace/cordex_unificado_preparacao_20260915/unificado/private_content/books \
     --saida /tmp/conteudo-livros-sql --banco corpopleno-livros
   # rode os comandos impressos (32 arquivos), em ordem; repita com --banco corpopleno-livros-preview
   ```

Se for criar um token de API em vez de usar o login: My Profile → API Tokens → Create Token, com as permissões **Account → Cloudflare Pages: Edit** e **Account → D1: Edit**, restrito à conta da CorpoPleno.

### Resend (recuperação de senha)

Crie uma conta em resend.com e verifique o domínio `corpoplenoresultadoreal.com.br` (registros DNS que o Resend indicar). Depois gere uma API key e grave `RESEND_API_KEY` e `EMAIL_FROM` no Pages. Se preferir outro provedor, só `functions/_lib/email.js` muda.

### Asaas (painel → Integrações → Webhooks)

1. Crie o webhook de **Cobranças** com a URL `https://www.corpoplenoresultadoreal.com.br/api/books/webhook` (no Sandbox, use a URL do Preview da branch).
2. No campo "Token de autenticação", coloque o **mesmo valor** de `ASAAS_WEBHOOK_TOKEN`.
3. Marque pelo menos os eventos `PAYMENT_RECEIVED`, `PAYMENT_CONFIRMED`, `PAYMENT_OVERDUE` e `PAYMENT_DELETED`. Use a versão de API v3 e o envio sequencial.
4. Confirme na conta que **cartão de crédito** e **parcelamento até 4x** estão habilitados (para Receitas).

### Cordex

Guarde `ADMIN_API_TOKEN` numa variável de ambiente local e chame o endpoint da seção 5.

## 10. Estado atual

### Pronto e testado localmente

Testes feitos em 2026-10-15 com `wrangler pages dev` (wrangler 3.114, D1 local) e um **stub local do Asaas**. Nenhuma chamada foi feita ao Asaas real e nenhuma cobrança real foi criada.

| Teste | HTTP |
|---|---|
| `GET /api/auth/me` sem sessão | 401 |
| cadastro com nome de 1 palavra / telefone inválido / sem aceite / e-mail inválido / senha curta | 400 (NOME_INVALIDO / TELEFONE_INVALIDO / TERMS_NOT_ACCEPTED / EMAIL_INVALIDO / SENHA_FORA_DO_TAMANHO_PERMITIDO) |
| cadastro válido (cookie `__Host-cp_session` com HttpOnly, Secure, SameSite=Lax) | 201 |
| cadastro com e-mail repetido | 409 |
| login com senha errada / senha certa | 401 / 200 |
| `GET /api/auth/me` com sessão | 200 |
| login com Origin de outro site | 403 |
| checkout sem sessão | **401** |
| checkout sem aceite / produto inexistente / método inválido | 400 / 409 / 400 |
| checkout sem CPF / CPF inválido | 400 / 400 |
| checkout combo PIX (gera CP-…, envia `access_token`, externalReference = CP-…) | 201 |
| repetir o mesmo checkout (mesma fatura, `reused`) | 201 |
| 3 cliques simultâneos | 1×201 + 2×409 (uma única cobrança criada) |
| troca de PIX para cartão (DELETE da anterior + nova) | 201 |
| Receitas 5x / 4x; livro avulso 2x | 400 / 201 / 400 |
| webhook sem token / token errado | **401** / **401** |
| webhook com valor divergente | 200 (ignorado, nada liberado) |
| webhook válido no combo | 200, **2 livros liberados** |
| mesmo evento repetido + PAYMENT_CONFIRMED | 200 `alreadyPaid` (idempotente) |
| `GET /api/me/books` (2 livros com purchaseCode) | 200 |
| access do livro comprado / não comprado | 200 true / 200 false |
| purchase-confirmation | 200 |
| comprar de novo o combo já pago | 409 ALREADY_OWNED |
| admin sem token / token errado / código inexistente / código válido / listagem | 401 / 401 / 404 / 200 / 200 (sem hash, salt nem token; CPF mascarado) |
| `/docs/ARQUITETURA-CHECKOUT.md` | 404 |
| logout, depois `me` | 200 / 401 |
| 6.ª tentativa de login errada | 429 |

Verificação visual (Chromium headless): em Produtos, os cards dos 2 combos aparecem com as 2 capas originais sobrepostas e preços de R$ 70,00 e R$ 50,00.

### Preview no Cloudflare (commit `19184ae`)

- O build do Pages passou ("Deploy successful"): https://feature-catalogo-combos-chec.cp-web-001.pages.dev
- Sem o D1 e os Secrets cadastrados (comportamento esperado), as rotas responderam assim:
  - `GET /api/auth/me`: 503 `BANCO_NAO_CONFIGURADO`;
  - checkout: 503;
  - webhook: 503 `WEBHOOK_NAO_CONFIGURADO`;
  - admin: 503 `ADMIN_NAO_CONFIGURADO`;
  - `/docs/*`: 404.
- `/wrangler.toml` deixou de ser servido.

### Fase 2 (2026-10-15)

**Verificado:**

- Credenciais: o conector MCP Cloudflare respondeu (antes dava 401); `wrangler whoami` continua sem login; não há `CLOUDFLARE_API_TOKEN` no ambiente.
- D1 `corpopleno-livros` e `corpopleno-livros-preview` criados. No banco de Preview, o esquema completo foi aplicado e conferido no D1 real (8 tabelas e os índices, incluindo o índice único parcial).
- Origem dos 503 no Preview `0412b75e` (commit `df36a4b`, build ok):
  - `me`, checkout, conteúdo, access e recuperação de senha → `BANCO_NAO_CONFIGURADO` (falta o binding `DB`);
  - webhook → `WEBHOOK_NAO_CONFIGURADO`;
  - admin → `ADMIN_NAO_CONFIGURADO`.

  Todos dependem de configuração, não de código. O único erro de código encontrado foi corrigido: o checkout dizia `PAYMENT_PROVIDER_UNAVAILABLE` quando, na verdade, faltava o banco.
- **Leitura (local, D1 local, conteúdo real importado pelo script):**

| Teste | HTTP |
|---|---|
| conteúdo sem sessão | 401 |
| conteúdo com sessão, antes de pagar | 403 ACESSO_NEGADO |
| combo pago → os 2 livros pt-BR | 200 (31 e 29 páginas, **idênticas ao pages.json original**) |
| Receitas pt-BR paga | 200, 439 páginas, 1,78 MB, idênticas ao original |
| idioma sem conteúdo / idioma inválido | 404 / 404 |
| livro não comprado / tentativa de path traversal | 403 / 403 |
| cabeçalho | `Cache-Control: private, no-store` |

- **Recuperação de senha** (local, com um stub do Resend):

| Teste | HTTP |
|---|---|
| e-mail inválido | 400 |
| e-mail inexistente | 200 (nenhum e-mail enviado) |
| e-mail existente (link com `#token=`) | 200 |
| token antigo depois de um novo pedido | 400 |
| senha curta | 400 |
| token malformado | 400 |
| token válido | 200 |
| mesmo token de novo | 400 (uso único) |
| token vencido (gravado vencido no banco) | 400 |
| sessão antiga depois da troca | 401 |
| login com a senha antiga / nova | 401 / 200 |
| 4.º pedido na hora | 429 |
| Origin de outro site | 403 |

  No banco ficam só hashes de 64 caracteres com validade de 60 minutos. Sem o provedor configurado, `sendEmail` devolve `EMAIL_NAO_CONFIGURADO` (testado isoladamente).
- Página `redefinir-senha.html` no Chromium headless: sem token mostra "Link inválido"; com token, o aviso fica oculto e o formulário aparece.

**Não verificado:** carga do conteúdo no D1 **remoto** (precisa de login no wrangler); envio real de e-mail; qualquer coisa com Asaas real ou Sandbox; troca de senha pela interface até o fim (só a API foi testada de ponta a ponta).

### Também corrigido nesta branch

O commit `5eec59a` ("Deploy CorpoPleno") tinha:

- removido `auth-login.js`, `auth-signup.js` e `account-home.js` das páginas;
- apagado cerca de 600 chaves de i18n;
- trocado as capas e os preços dos 5 livros (capas em `assets/img/book-covers/`, que não existe, e R$ 39,90 em todos).

Tudo foi restaurado a partir da versão em produção (`c482e69`). "Livros" saiu do menu superior de todas as páginas.

### Não verificado / pendente

- **Nenhum teste ponta a ponta com o Asaas real ou Sandbox** (cliente, cobrança, fatura, webhook de verdade). Fazer no Preview com a chave Sandbox antes de vender.
- Ligar o binding `DB` (Production e Preview) e gravar os Secrets: precisa da Noemi (seção 9). Até lá, o Preview responde 503.
- Confirmar que os D1 criados estão na conta do `cp-web-001`.
- Carregar o conteúdo pago no D1 remoto (script da seção 5a, depois do `wrangler login`). Até lá, a leitura responde 404 CONTEUDO_NAO_ENCONTRADO.
- Conferir as traduções de "O Amor que Aprendeu a Ficar" (en-US e es-CL parecem cópias do pt-BR; ko-KR tem só 9 páginas) e o conteúdo ko-KR/es-CL de Receitas (só existe `_build/`).
- E-mail de recuperação: falta configurar o provedor (Resend + domínio verificado). Sem ele, a interface funciona mas a cliente não recebe o link.
- Estorno e chargeback (`PAYMENT_REFUNDED`, `PAYMENT_CHARGEBACK_*`) ainda não revogam o acesso.
- Os novos textos (checkout, cadastro, recuperação de senha) estão só em pt-BR.
- Outros arquivos da raiz continuam públicos porque o Pages publica `.` (por exemplo `README.md`, `PROMPT_MASTER_SITE_CORPOPLENO.md`, `RELATORIO_VALIDACAO.md`, `tools/`). Vale revisar.
- Não fazer merge em `master` antes do teste no Sandbox.
