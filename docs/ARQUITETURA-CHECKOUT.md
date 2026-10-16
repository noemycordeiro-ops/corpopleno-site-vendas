# Arquitetura do checkout de livros

> Memória do projeto. Branch: `feature/catalogo-combos-checkout`.
> Última atualização: 2026-10-16 (Fase 4: resumos oficiais em "Conhecer o livro").
> Este arquivo **não** é publicado no site (`/docs/*` responde 404 por meio de `functions/docs/[[path]].js` e `_routes.json`). Mas **o repositório no GitHub é público**: aqui não entram IDs de banco ou de conta, caminhos de máquinas locais nem instruções de acesso administrativo.

## 1. Visão geral

Cadastro, login, compras e liberação de livros rodam **inteiramente em Cloudflare Pages Functions**, com banco **Cloudflare D1**. Nada depende de servidor local.

```
Navegador ──> Pages (HTML/JS estático)
          └─> /api/*  ──> Pages Functions ──> D1 (binding DB)
                                   └──> API Asaas v3 (header access_token)
Asaas ──webhook──> /api/books/webhook ──> D1 (PAID + livros liberados)
```

- **D1 em vez de KV:** os dados são relacionais e precisamos de idempotência transacional (índice único parcial e `db.batch` atômico).
- **Esquema automático:** `functions/_lib/db.js` cria as tabelas e índices (`IF NOT EXISTS`) na primeira requisição. Não há migração manual.
- **Pagamento:** PIX e cartão são pagos na fatura hospedada do Asaas (`invoiceUrl`). O site nunca recebe dados de cartão.
- **Preço:** definido sempre pelo servidor (`functions/_lib/catalog.js`).
- **Sem `wrangler.toml`:** bindings, variáveis e Secrets ficam no painel do Pages, separados por ambiente. O arquivo antigo era de Workers, inválido para Pages, e era servido publicamente.

### Arquivos

| Arquivo | Função |
|---|---|
| `functions/_lib/http.js` | JSON, cookies, checagem de Origin, IP |
| `functions/_lib/db.js` | esquema D1 e `getDb(env)` |
| `functions/_lib/auth.js` | PBKDF2, sessões, limite de tentativas, validações, código de compra |
| `functions/_lib/catalog.js` | preços e itens de cada produto (inclui combos) |
| `functions/_lib/asaas.js` | cliente Asaas, escolha segura do ambiente, validação de CPF/CNPJ |
| `functions/_lib/email.js` | envio de e-mail pelo Resend |
| `functions/api/health.js` | diagnóstico (só true/false; em produção responde apenas `ok`) |
| `functions/api/auth/*` | cadastro, login, logout, `me`, recuperação de senha |
| `functions/api/me/books.js` | livros da cliente |
| `functions/api/books/[bookId]/checkout.js` | cria ou reutiliza a cobrança |
| `functions/api/books/[bookId]/access.js` · `content/[locale].js` | permissão de leitura e conteúdo pago |
| `functions/api/books/[bookId]/purchase-confirmation.js` | evento Purchase da Meta só após o pagamento |
| `functions/api/books/webhook.js` | webhook Asaas |
| `functions/api/admin/*` | consulta administrativa somente leitura (uso documentado fora do repositório) |
| `docs/tools/importar-conteudo-livros.py` | gera os .sql do conteúdo pago, sempre fora do repositório |

## 2. Autenticação

- **Cadastro:** nome completo, e-mail, telefone, senha e aceite dos Termos e da Política de Privacidade, todos obrigatórios e validados no servidor. O aceite fica registrado com data e hora.
- **Senha:** só o hash PBKDF2-SHA256, com 100.000 iterações e salt aleatório por usuário. Nunca é guardada em texto, logada ou devolvida.
- **Sessão:** token aleatório no cookie `__Host-cp_session` (`HttpOnly; Secure; SameSite=Lax`, 30 dias). O banco guarda só o SHA-256 do token.
- **Força bruta:** login com 5 falhas por e-mail ou 30 por IP em 15 minutos gera 429; o tempo de resposta não revela se o e-mail existe.
- **CSRF:** POST com Origin de outro site recebe 403.

## 3. Checkout e código de compra

`POST /api/books/:bookId/checkout` com `{paymentMethod, termsAccepted, cpfCnpj?, installmentCount?}`:

1. Exige sessão, aceite dos termos, método válido e produto do catálogo.
2. Receitas aceita de 1 a 4 parcelas no cartão; os outros produtos, só 1.
3. Recusa a compra se a cliente já tem os livros (409 `ALREADY_OWNED`).
4. Idempotência: no máximo uma compra em aberto por (cliente, produto).
   - Mesmo método: devolve a mesma fatura.
   - Outro método: cancela a cobrança anterior antes de criar a nova.
   - Cliques simultâneos: só um cria a cobrança.
5. Na primeira compra pede CPF/CNPJ (com verificação dos dígitos). Cria ou reutiliza o cliente Asaas.
6. Gera o **código de compra** `CP-XXXXXXXX` (aleatório, não sequencial), que também é o `externalReference` no Asaas.
7. Responde 201 com `invoiceUrl` e `purchaseCode`.

### Ambiente Asaas (seguro por padrão)

- **Produção** só quando a variável `ASAAS_ENVIRONMENT=production` existir (cadastrar **somente** em Production).
- **Fora disso, o padrão é a Sandbox.** Uma `ASAAS_API_URL` só é aceita se apontar para a Sandbox (ou localhost em testes). Apontar para a produção fora de produção é recusado com 503.
- Assim, esquecer uma variável nunca faz um Preview cobrar de verdade.

### Catálogo

| Produto | Preço | Libera |
|---|---|---|
| Henê Sem Medo, livros 1 e 2 | R$ 39,90 cada | o próprio livro |
| Os 2 livros "O Amor…" | R$ 29,90 cada | o próprio livro |
| Receitas | R$ 200,00 (até 4x no cartão) | o próprio livro |
| Combo Henê | R$ 70,00 | Henê livros 1 e 2 |
| Combo Romance | R$ 50,00 | os 2 livros "O Amor…" |

## 4. Webhook Asaas

1. Valida o header `asaas-access-token` contra o Secret `ASAAS_WEBHOOK_TOKEN` (comparação em tempo constante).
2. Localiza a compra pelo código e confere o id da cobrança e, à vista, o valor.
3. `PAYMENT_RECEIVED` / `PAYMENT_CONFIRMED`: numa única transação, marca `PAID` uma única vez e libera 1 livro ou os 2 do combo. Reentregas do evento são inofensivas.
4. `PAYMENT_DELETED` → `CANCELLED`; `PAYMENT_OVERDUE` → `EXPIRED`.
5. Eventos que não se aplicam respondem 200, para o Asaas não pausar a fila.

## 5. Leitura dos livros comprados

`GET /api/books/:bookId/content/:locale`:

- 401 sem sessão;
- 403 sem compra (mesma resposta para livro inexistente);
- 404 se o idioma não tiver conteúdo carregado;
- 200 `{ok, pages}` com `Cache-Control: private, no-store`.

O conteúdo fica na tabela `book_pages`, uma linha por página. O R2 não está habilitado na conta, o limite do D1 é 2 MB por linha e a maior página tem cerca de 23 KB. Ele é carregado com `docs/tools/importar-conteudo-livros.py` a partir da cópia privada dos livros. O script grava os .sql fora do repositório e se recusa a gravar dentro dele.

## 6. Recuperação de senha

- O pedido responde **sempre 200**, para não revelar quais e-mails têm conta.
- O token é de uso único, vale 60 minutos e fica no banco só como SHA-256. Um pedido novo invalida os anteriores. O limite é de 3 pedidos por e-mail e 10 por IP a cada hora.
- A confirmação "gasta" o token antes de trocar a senha e encerra todas as sessões da conta.
- O link usa o fragmento da URL (`#token=`), que o navegador não envia ao servidor. O script da página lê o token e o apaga da barra de endereço antes de qualquer outro script. Essas páginas não carregam o pixel da Meta.
- **E-mail:** o envio usa o Resend. Sem `RESEND_API_KEY` e `EMAIL_FROM`, nada é enviado e a cliente não recebe o link.

## 6a. Página "Conhecer o livro" (resumos oficiais)

- Uma única página, `livro.html?id=<produto>`, renderizada por `assets/js/book-detail.js`. Não há páginas duplicadas.
- **Fonte:** o campo `summary["pt-BR"]` do `metadata.json` de cada livro. São os 5 resumos comerciais oficiais, copiados **literalmente** por script, sem redigitação; o teste compara com o texto original.
- **Combos:** o metadata do combo tem `combo_items` e `combo_item_labels`.
  - `hene-sem-medo-combo` mostra "Livro 1 — …" e "Livro 2 — …".
  - `romance-combo` mostra "Volume 1 — …" e "Volume 2 — …".
  - Cada página tem um único botão Comprar.
- **Renderização segura:** um markdown simples (parágrafos, listas `- `, `**negrito**`, `*itálico*`) é convertido para DOM com `createElement`/`textContent`, nunca `innerHTML`. Parágrafos inteiros em itálico (avisos de segurança) ganham destaque próprio.
- **"← Voltar aos livros":** leva a `produtos.html#livros`, que abre a aba Livros (`main.js`).
- Nenhum conteúdo integral dos livros é exposto; só o resumo comercial.
- Correção de layout no celular (abaixo de 900 px): a capa sobreposta do combo encolhia para 0 px na página do livro. Foi corrigida só a largura do contêiner da capa; as imagens não mudaram.

## 7. Banco D1 (binding `DB`)

| Tabela | Conteúdo |
|---|---|
| `users` | dados da conta (nome, e-mail, telefone, aceite, hash da senha, CPF/CNPJ, cliente Asaas) |
| `sessions` | hash do token, usuário, validade |
| `auth_attempts` | contadores de tentativas |
| `purchases` | código CP-… (chave), cliente, produto, valor, método, parcelas, status, ids Asaas, fatura, datas |
| `entitlements` | (cliente, livro), compra de origem, data |
| `webhook_events` | registro dos eventos recebidos |
| `book_pages` | (livro, idioma, página), conteúdo |
| `password_resets` | hash do token, usuário, validade, uso |

## 8. Variáveis, Secrets e bindings (só nomes)

| Nome | Tipo | Production | Preview |
|---|---|---|---|
| `DB` | binding D1 | banco de produção | banco de preview — **ligado** |
| `ASAAS_API_KEY` | Secret | chave de produção (já existia) | chave Sandbox — **cadastrada** |
| `ASAAS_ENVIRONMENT` | variável | **`production` (falta cadastrar)** | não cadastrar |
| `ASAAS_API_URL` | variável | desnecessária | desnecessária (o padrão é a Sandbox) |
| `ASAAS_WEBHOOK_TOKEN` | Secret | falta | **falta** |
| `ADMIN_API_TOKEN` | Secret | falta | **falta** (opcional) |
| `RESEND_API_KEY` | Secret | falta | **falta** |
| `EMAIL_FROM` | variável | falta | **falta** |

O diagnóstico `GET /api/health` (só no Preview) lista o que falta, mostrando apenas nomes e true/false.

## 9. Passos manuais

**Cloudflare (painel do projeto Pages):**

1. **Production:**
   - ligar `DB` ao banco de produção;
   - criar a variável `ASAAS_ENVIRONMENT=production`;
   - criar os Secrets `ASAAS_WEBHOOK_TOKEN` e `ADMIN_API_TOKEN` (valores aleatórios longos);
   - criar `RESEND_API_KEY` e `EMAIL_FROM`.
2. **Preview:** criar `ASAAS_WEBHOOK_TOKEN` (pode ser diferente do de produção), `RESEND_API_KEY` e `EMAIL_FROM`.
3. Carregar o conteúdo dos livros nos dois bancos com o script da seção 5. Isso exige `npx wrangler login` (Node 22 ou mais) ou um token com as permissões "Cloudflare Pages: Edit" e "D1: Edit".
4. Bindings e Secrets só valem a partir do deploy seguinte (faça um push na branch ou "Retry deployment").

**Asaas:** criar o webhook de Cobranças apontando para `/api/books/webhook` do site (no Sandbox, para a URL do Preview), com o mesmo token de `ASAAS_WEBHOOK_TOKEN` e os eventos `PAYMENT_RECEIVED`, `PAYMENT_CONFIRMED`, `PAYMENT_OVERDUE` e `PAYMENT_DELETED`. Conferir se cartão e parcelamento até 4x estão habilitados.

**Resend:** verificar o domínio do site e gerar a API key.

## 10. Estado atual

### Fase 3 — testado no Preview real (alias da branch, commit `c8650e2`, build ok)

`/api/health` respondeu: banco ligado, 8 tabelas, ambiente Asaas **sandbox**.

| Teste no Preview | HTTP |
|---|---|
| `me` sem sessão | 401 |
| cadastro com nome inválido | 400 |
| cadastro válido (cookie `__Host-`, HttpOnly, Secure, SameSite=Lax) | 201 |
| cadastro com e-mail repetido | 409 |
| login com senha errada / certa | 401 / 200 |
| `me` com sessão | 200 |
| pedido de recuperação de senha (`emailConfigurado:false`) | 200 |
| confirmação com token inventado | 400 |
| conteúdo sem sessão / com sessão sem compra | 401 / 403 |
| `access` sem compra | 200 `allowReading:false` |
| `pages.json` por caminho estático (assets, pasta privada) | só a página inicial (fallback); nenhum conteúdo exposto |
| checkout sem sessão / sem CPF | 401 / 400 |
| checkout combo PIX (fatura em `sandbox.asaas.com`, código CP-…) | 201 |
| repetir o checkout (mesma fatura) | 201 `reused` |
| webhook sem token / token errado | 503 `WEBHOOK_NAO_CONFIGURADO` (falta o Secret) |
| consulta administrativa | 503 (falta o Secret) |
| logout, depois `me` | 200 / 401 |

Os 7 cards aparecem em Produtos: 5 livros e 2 combos, com as capas sobrepostas e os preços R$ 39,90 · 39,90 · 70,00 · 29,90 · 29,90 · 50,00 · 200,00.

**Causa de cada 503:** só a falta de `ASAAS_WEBHOOK_TOKEN` (webhook) e de `ADMIN_API_TOKEN` (consulta administrativa). Nenhum 500.

### Fase 4 — resumos oficiais (2026-10-16)

Checkpoint antes da fase: tag `checkpoint-pre-resumos-20261016`. Verificado no Chromium headless, local e no Preview, para os 7 produtos:

- o texto literal do resumo certo (ou os 2 do combo, com subtítulos);
- o título;
- a capa original;
- o preço;
- um único botão Comprar;
- o link "Voltar aos livros";
- **nenhuma mensagem no console**.

Os preços continuam R$ 39,90 · 39,90 · 70,00 · 29,90 · 29,90 · 50,00 · 200,00. `produtos.html#livros` abre com a aba Livros selecionada.

### Fases anteriores (testes locais com D1 local e stub do Asaas)

Todos passaram:

- validações de cadastro;
- idempotência do checkout (3 cliques simultâneos geram uma única cobrança);
- troca de método;
- parcelas;
- webhook (token, valor divergente, combo libera 2 livros, repetição inofensiva);
- leitura: conteúdo idêntico ao original, inclusive Receitas com 439 páginas;
- recuperação de senha: uso único, vencimento, sessões encerradas, 429.

### Não verificado / pendente

- Pagamento Sandbox concluído → webhook → livro liberado no Preview (falta `ASAAS_WEBHOOK_TOKEN` e o webhook no Asaas).
- Leitura com 200 no Preview (o conteúdo ainda não foi carregado no banco remoto).
- Envio real do e-mail de recuperação (falta o Resend).
- Production: nada foi ligado nem testado.
- Conteúdo: algumas traduções de um dos livros "O Amor…" parecem cópias do pt-BR, e Receitas não tem ko-KR nem es-CL prontos.
- Estorno e chargeback ainda não revogam o acesso.
- Textos novos só em pt-BR.
- Arquivos antigos da raiz continuam públicos (Pages publica `.`); vale revisar.
- Não fazer merge em `master` antes do teste ponta a ponta no Sandbox.
