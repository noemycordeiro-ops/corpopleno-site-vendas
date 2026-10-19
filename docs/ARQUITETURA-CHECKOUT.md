# Arquitetura do checkout de livros

> Memória do projeto. Branch: `feature/catalogo-combos-checkout`.
> Última atualização: 2026-10-16 (Fases 8 e 9: modo de tela, traduções dos produtos, preço por cotação e seletor de idiomas).
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
| `functions/_lib/email.js` | envio de e-mail pelo Brevo (ou Resend), remetente `suporte@corpoplenoresultadoreal.com.br` |
| `functions/_lib/reset-email.js` | texto e HTML do e-mail de redefinição de senha |
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
7. Responde 201 com `invoiceUrl` e `purchaseCode`. No **PIX**, também devolve `pix: {encodedImage, payload}` reais do Asaas (`GET /payments/{id}/pixQrCode`): o site mostra o QR Code e o copia-e-cola e, a cada 5 s, consulta Meus Livros para avisar quando o livro é liberado. O **cartão** usa sempre a fatura hospedada do Asaas (até 4x só em Receitas).

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
4. `PAYMENT_DELETED` → `CANCELLED`; `PAYMENT_OVERDUE` → `EXPIRED` (compra pendente).
5. **Revogação de acesso** (idempotente):
   - `PAYMENT_REFUNDED` → `REFUNDED`;
   - `PAYMENT_CHARGEBACK_REQUESTED` / `PAYMENT_CHARGEBACK_DISPUTE` → `CHARGEBACK`;
   - `PAYMENT_DELETED` de compra já paga → `CANCELLED`.

   Em todos os casos a cliente perde os livros liberados por aquela compra. Se outra compra paga cobrir o mesmo livro (ex.: avulso + combo), o acesso continua. Uma compra revogada nunca volta a liberar por reentrega antiga do evento.
6. Eventos que não se aplicam respondem 200, para o Asaas não pausar a fila.

## 5. Leitura dos livros comprados

`GET /api/books/:bookId/content/:locale`:

- 401 sem sessão;
- 403 sem compra (mesma resposta para livro inexistente);
- 404 se o idioma não tiver conteúdo carregado;
- 200 `{ok, pages}` com `Cache-Control: private, no-store`.

O conteúdo fica na tabela `book_pages`, uma linha por página. O R2 não está habilitado na conta, o limite do D1 é 2 MB por linha e a maior página tem cerca de 23 KB. Ele é carregado com `docs/tools/importar-conteudo-livros.py` a partir da cópia privada dos livros. O script grava os .sql fora do repositório e se recusa a gravar dentro dele.

## 5b. Leitor (`leitor.html` + `assets/js/reader.js`)

**Já existia:**
- A−/A/A+;
- modos de tela e duas páginas;
- setas na tela e no teclado;
- "Página X de Y";
- tela cheia;
- busca e favoritos de receitas;
- bloqueio de impressão;
- conteúdo desfocado quando a aba perde o foco;
- "Ler agora" em Meus Livros.

**Criado na Fase 6:**
- **Sumário** gerado dos títulos das páginas, **modo claro/escuro** e **swipe** no celular.
- **Idiomas reais:** `GET /api/books/:id/content` lista só os idiomas que têm conteúdo no banco. Sem tradução automática. Idiomas que não estão em `REVIEWED_LOCALES` (`functions/_lib/catalog.js`; hoje só pt-BR) mostram o selo **"Tradução não revisada"**.
- **Progresso no D1** (`GET/PUT /api/books/:id/progress`, tabela `reading_progress`), por cliente + livro: idioma, página, **marcador estável** `p<página>-b<bloco>` e preferências (fonte, tema, modo, disposição). Ao abrir, o leitor volta ao ponto salvo; Meus Livros mostra **"Continuar leitura (pág. N)"**.
- **Proteções só na área de leitura:** sem menu de contexto, cópia, recorte, seleção e arrastar; Ctrl/Cmd+C, X e A bloqueados fora de campos de digitação.
- **Marca d'água** discreta com o **código curto do cliente** (`CL-XXXXXXXX`, derivado do id; nunca o e-mail).
- **Limites:** 60 leituras de conteúdo e 120 gravações de progresso por cliente a cada 10 minutos (429).
- **Captura de tela não pode ser impedida por um site.** A marca d'água e o desfoque são só dissuasão.

**Corrigido:** a capa em Meus Livros ficava quebrada (usava um campo inexistente); agora usa o `book-cover.js`.

## 5c. Lupa mágica de tradução nas capas

- **Dados:** um arquivo por livro, `assets/data/image-hotspots/<book_id>.json`.
  - Cada área de texto da capa tem coordenadas em % da imagem original (1024×1536) e o texto em pt-BR, pt-PT, en-US, ko-KR e es-CL, cada um com `revisado`.
  - Os textos que já tinham sido **aprovados** para as capas vieram do histórico com `revisado: true`. As composições e os textos novos estão com `revisado: false`.
- **Componente:** `assets/js/image-lens.js` + estilos `.cp-lens` em `books.css`, carregado em `produtos.html`, `livro.html` e `livros.html`.
  - Passar o mouse (ou tocar e arrastar) sobre uma área marcada abre uma lupa circular que **amplia** a capa e, fora do pt-BR, mostra a tradução no idioma do seletor do site.
  - Funciona nas capas giradas dos combos.
  - Sem `innerHTML` e sem `preventDefault`, então clique e rolagem continuam iguais; um toque simples no card continua abrindo o livro.
  - Cada capa ganha uma legenda oculta (`sr-only`) com o texto no idioma atual.
  - Nenhuma imagem foi alterada.
- **Para revisar:** procure `"revisado": false` nos arquivos. Depois de revisar, troque para `true`. Hoje são as lombadas do Henê 1 e 2 e de Receitas em en-US, ko-KR e es-CL.

## 5d. Modo de tela (`assets/js/view-mode.js`)

- **Opções:** Automático (padrão), Celular, Tablet e Computador/TV. O botão fica ao lado do seletor de idiomas; em larguras efetivas de até 560 px, vai para dentro do menu do celular.
- **Como funciona:** o script é carregado no `<head>`, depois do CSS, e restaura o modo salvo (`localStorage` `cp_view_mode`) antes da primeira pintura.
  - Marca `<html data-view>` e reavalia as `@media` de largura já existentes com a largura do modo: 390 px, 820 px ou no mínimo 1280 px.
  - Celular e Tablet numa tela larga aparecem centralizados na largura do aparelho.
  - Computador/TV usa largura mínima de 1280 px e fonte maior a partir de 1920 px.
  - No celular, a viewport assume a largura do modo.
- **Acessibilidade:** menu com `menuitemradio`, setas, Home, End, Esc e Tab; ícones em SVG inline; rótulos `view.*` nos 5 idiomas. O leitor mantém o próprio "Ajustar leitura".

## 5e. Idiomas, traduções dos produtos e preço

- **Seletor:** só "Português", "English", "한국어" e "Español", sem país nem código.
  - "Português" usa pt-PT se o navegador preferir pt-PT (`navigator.languages`); senão, pt-BR.
  - A escolha manual fica salva (`cp_lang`). Internamente continuam os 5 locales. O leitor usa a mesma regra.
- **Traduções:** os 7 `metadata.json` têm título, subtítulo, descrição e resumo em pt-PT, en-US, ko-KR e es-CL.
  - São traduções fiéis dos resumos oficiais, com `revisado: false` (`locales[l].revisado` e `summary_revisado`), **a revisar pela Noemi**.
  - Também foram traduzidos: nomes das coleções, rótulos dos combos, "Voltar aos livros", campos e mensagens do checkout e a legenda da lupa.
  - O aviso de tradução parcial diz só "português" e não aparece em pt-PT nem quando o produto tem tradução.
- **Preço:** o oficial é sempre em BRL, e o Asaas cobra em BRL.
  - Nos cards e na página do livro aparece só símbolo + valor no formato do idioma (`Intl.NumberFormat`, `narrowSymbol`): R$ em pt-BR, € em pt-PT, US$ em en-US, ₩ em ko-KR e CLP em es-CL.
  - A cotação vem de `GET /api/rates`: open.er-api.com, com reserva no BCE (sem CLP), cache de 6 h e timeout de 4 s. Sem cotação, o site mostra R$.
  - **O checkout mostra "Valor cobrado: R$ X (em reais, BRL)" antes de confirmar**; o valor convertido nunca é usado na cobrança.
  - O selo de idioma saiu dos cards.

## 6. Recuperação de senha

- O pedido responde **sempre 200**, para não revelar quais e-mails têm conta.
- O token é de uso único, vale 60 minutos e fica no banco só como SHA-256. Um pedido novo invalida os anteriores. O limite é de 3 pedidos por e-mail e 10 por IP a cada hora.
- A confirmação "gasta" o token antes de trocar a senha e encerra todas as sessões da conta.
- O link usa o fragmento da URL (`#token=`), que o navegador não envia ao servidor. O script da página lê o token e o apaga da barra de endereço antes de qualquer outro script. Essas páginas não carregam o pixel da Meta.
- **E-mail:** o envio usa o Brevo (`BREVO_API_KEY`) ou, como alternativa, o Resend (`RESEND_API_KEY`). Sem nenhuma das chaves, nada é enviado e a cliente não recebe o link. Remetente padrão: `CorpoPleno <suporte@corpoplenoresultadoreal.com.br>` (`EMAIL_FROM` opcional).

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
| `reading_progress` | (cliente, livro), idioma, página, marcador do bloco, preferências, data |

## 8. Variáveis, Secrets e bindings (só nomes)

Estado conferido em 2026-10-16 pelo `GET /api/health`, que mostra só true/false e nomes.

| Nome | Tipo | Production | Preview |
|---|---|---|---|
| `DB` | binding D1 | **ligado** (banco de produção) | **ligado** (banco de preview) |
| `ASAAS_API_KEY` | Secret | **não detectado** — cadastrar a chave de produção | chave Sandbox — ok |
| `ASAAS_ENVIRONMENT` | variável | **falta** (`production`) | não cadastrar |
| `ASAAS_API_URL` | variável | desnecessária | desnecessária (o padrão é a Sandbox) |
| `ASAAS_WEBHOOK_TOKEN` | Secret | **falta** | **falta** |
| `ADMIN_API_TOKEN` | Secret | **falta** | **falta** (opcional) |
| `BREVO_API_KEY` (ou `RESEND_API_KEY`) | Secret | **falta** | **falta** |
| `EMAIL_FROM` | variável | opcional (padrão `CorpoPleno <suporte@corpoplenoresultadoreal.com.br>`) | opcional |
| `META_PIXEL_ID` | variável (id público) | opcional | opcional |

`GET /api/health` lista o que falta (apenas nomes e true/false), em Preview e em Production.

## 9. Passos manuais

**Cloudflare (painel do projeto Pages):**

1. **Production** (o `DB` já está ligado):
   - criar a variável `ASAAS_ENVIRONMENT=production`;
   - criar o Secret `ASAAS_API_KEY` com a chave de produção (ela **não aparece** no ambiente Production hoje);
   - criar os Secrets `ASAAS_WEBHOOK_TOKEN` e `ADMIN_API_TOKEN` (valores aleatórios longos);
   - criar `RESEND_API_KEY` e `EMAIL_FROM`;
   - opcional: `META_PIXEL_ID`.
2. **Preview:** criar `ASAAS_WEBHOOK_TOKEN`, `RESEND_API_KEY` e `EMAIL_FROM`.
3. Carregar o conteúdo dos livros nos dois bancos com o script da seção 5. Isso exige `npx wrangler login` (Node 22 ou mais) ou um token com as permissões "Cloudflare Pages: Edit" e "D1: Edit".
4. Bindings e Secrets só valem a partir do deploy seguinte ("Retry deployment" ou um push).
5. Depois de configurar, abrir `/api/health`: deve mostrar `asaasAmbiente: "production"` e `faltando: []`.

**Asaas (produção):** criar o webhook de Cobranças com:

- URL `https://www.corpoplenoresultadoreal.com.br/api/books/webhook`;
- o mesmo token de `ASAAS_WEBHOOK_TOKEN`;
- os eventos `PAYMENT_RECEIVED`, `PAYMENT_CONFIRMED`, `PAYMENT_OVERDUE`, `PAYMENT_DELETED`, `PAYMENT_REFUNDED`, `PAYMENT_CHARGEBACK_REQUESTED` e `PAYMENT_CHARGEBACK_DISPUTE`.

No Sandbox, o mesmo vale apontando para a URL do Preview. Conferir também se o PIX (chave cadastrada), o cartão e o parcelamento até 4x estão habilitados.

**Brevo:** autenticar o domínio `corpoplenoresultadoreal.com.br` (registros DKIM/DMARC no DNS da Cloudflare, SPF unificado com o do Email Routing), cadastrar o remetente `suporte@corpoplenoresultadoreal.com.br` e gerar a chave em SMTP & API → API Keys. Gravar como Secret `BREVO_API_KEY` em Production e fazer novo deploy.

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

### Fase 5 — produção (2026-10-16)

**Checkpoints de restauração:**
- `checkpoint-pre-producao-20261016`: a master antiga, com build falho;
- `checkpoint-producao-no-ar-c482e69`: a versão que estava no ar.

Para voltar: um commit de revert na master até o conteúdo de `c482e69`.

**Merge:** fast-forward da branch na master (`d55f277`), build de Production ok.

**Verificado no domínio oficial:**
- as páginas públicas respondem 200;
- 7 cards com capas e preços corretos;
- os 7 "Conhecer o livro" com o resumo literal;
- menu sem "Livros";
- sem erros de console;
- `.md` internos com 404;
- o documento interno de diretrizes saiu do repositório: antes estava público com HTTP 200; o histórico do git ainda o contém.

**Produção (D1):** cadastro 201, login 401/200, `me` 200, Meus Livros vazio, conteúdo 403 sem compra, pedido de recuperação de senha 200.
- Usuário de teste criado: `qa.producao.20261016@exemplo.com`. **Remover** quando quiser (tabelas `users` e `sessions`).
- Checkout: 503 `AMBIENTE_ASAAS_NAO_CONFIGURADO`, porque falta a chave em Production. Nenhuma chamada ao Asaas, nenhuma cobrança.
- Webhook: 503 (falta o token).

**Antes do merge**, testado localmente e no Preview Sandbox:
- PIX real da Sandbox: QR em PNG, copia-e-cola EMV `000201…` e fatura `sandbox.asaas.com`;
- revogação: estorno, chargeback e PAYMENT_DELETED de compra paga, com idempotência e livro coberto por outra compra preservado.

### Fase 7 — lupa mágica (2026-10-16)

Verificado com Chromium headless (puppeteer), no local e no Preview, em desktop e celular, nos 5 idiomas: **49 de 49 casos ok**.

Casos testados:
- título do Henê 1;
- capa girada do combo Romance;
- lombada de Receitas;
- área fora do texto (a lupa some);
- legenda acessível no idioma certo;
- página do combo Henê;
- clique e toque no card continuam abrindo o livro.

Resultados:
- zero erros de console;
- os 7 resumos intactos;
- 0 imagens alteradas.

### Fase 6 — leitor (2026-10-16)

Verificado com Chromium headless:
- **localmente**, com conteúdo real;
- **no Preview**, com um usuário de teste cujo acesso foi concedido direto no D1 de Preview, e páginas fixture `QA-PREVIEW` — **removidas** depois, junto com o usuário.

Resultados:
- leitor abre e mostra a página atual/total;
- só os idiomas existentes aparecem;
- selo "Tradução não revisada" no idioma não revisado;
- marca d'água `CorpoPleno · CL-…`;
- sumário;
- A+ (1 → 1,15);
- tema escuro;
- teclado, botão e swipe;
- contextmenu, copy, selectstart e Ctrl+C bloqueados (`user-select: none`);
- progresso no D1 (`p2-b0` + prefs) e reabertura na mesma página e tema;
- troca de idioma mantém a página;
- Meus Livros com "Continuar leitura (pág. 2)" e a capa correta;
- conteúdo 401 / 403 / 200;
- 61.ª leitura → 429;
- **zero erros de console**, incluindo os antigos 404 `/api/public-config` e 401 `/api/auth/me`, que agora responde 200 para visitante.

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

- **Produção sem pagamento ativo:** faltam `ASAAS_API_KEY`, `ASAAS_ENVIRONMENT` e `ASAAS_WEBHOOK_TOKEN` em Production e o webhook no painel do Asaas. Nenhuma compra real foi testada.
- Pagamento Sandbox concluído → webhook → liberação no Preview: falta `ASAAS_WEBHOOK_TOKEN` no Preview.
- O conteúdo real dos livros ainda não está nos bancos remotos (script da seção 5 + login do wrangler). Até lá, quem comprar vê "conteúdo não encontrado".
- Envio real do e-mail de recuperação (Resend).
- Revisão humana das traduções (hoje só pt-BR conta como revisado), e Receitas sem ko-KR/es-CL.
- Textos novos só em pt-BR.
- Remover o usuário de teste de produção quando quiser.
- O histórico do git ainda contém o documento interno e versões antigas deste arquivo; só reescrevendo o histórico (decisão da Noemi).
