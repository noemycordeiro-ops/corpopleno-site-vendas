# Relatório de Validação — Site Público CorpoPleno (Primeira Versão)

Data: 19 de setembro de 2026
Escopo: exclusivamente a pasta
`site_publico_corpopleno_master_20260919/` (nenhum arquivo fora dela foi
acessado, criado ou modificado).

---

## 1. O que foi criado

**Páginas públicas (7):**
- `index.html` — Home completa: hero, "Conheça a CorpoPleno", Produtos,
  Cursos, Materiais digitais, Soluções interativas, Atendimento, Destaques,
  FAQ, CTA final.
- `produtos.html` — catálogo com filtro por categoria (eBooks, Livros, Mini
  apps, Autocuidado, CorpoPleno Natural, Materiais capilares, Nutrição), 10
  itens de exemplo, todos "Em preparação".
- `cursos.html` — catálogo com filtro por categoria (Idiomas, Empresarial,
  Técnicos, Cursos curtos, Libras/bônus), 6 itens de exemplo, todos "Em
  preparação".
- `sobre.html` — propósito, metodologia, compromisso com qualidade,
  educação, tecnologia, organização e revisão de conteúdo — sem revelar
  agentes internos, Cordex ou arquitetura privada.
- `atendimento.html` — equipe, e-mail e WhatsApp com placeholders explícitos,
  suporte por produto.
- `termos.html` e `privacidade.html` — documentos estruturais com aviso de
  revisão jurídica pendente.

**Infraestrutura de front-end:**
- `assets/css/style.css` — design system único (modo claro, paleta
  arco-íris funcional, cartões, sombras suaves, cantos arredondados,
  responsivo).
- `assets/js/i18n.js` — motor de tradução local para PT-BR/EN-US/KO-KR/ES-CL.
- `assets/js/main.js` — menu mobile, filtros de categoria, ano do rodapé.

**Painel de demonstração local (não público):**
- `admin-preview/index.html` — funil, 6 indicadores (KPIs), 5 gráficos e
  planilha completa. Banner fixo "DADOS DEMONSTRATIVOS — NÃO SÃO VENDAS
  REAIS" no topo da página inteira.
- `admin-preview/assets/js/dados-demo.js` — gerador determinístico de dados
  fictícios (24 linhas de planilha, séries de 6 semanas para os gráficos).
- `admin-preview/assets/js/charts.js` — gráficos de barra, linha e funil em
  SVG puro (sem biblioteca externa).
- `admin-preview/assets/js/tabela.js` — ordenação, busca, filtro e
  exportação CSV.
- `admin-preview/assets/css/admin.css` — estilos próprios do painel.

**Documentação:**
- `README.md` — estrutura, como testar, o que é placeholder, como
  funcionam idioma/CSV/gráficos, o que depende de backend, checklist.
- `RELATORIO_VALIDACAO.md` — este arquivo.

Total: 17 arquivos criados, todos dentro da pasta autorizada.

---

## 2. O que foi testado

### 2.1 Sintaxe JavaScript
Comando: `node --check` em todos os `.js` do projeto.
**Resultado: 5/5 arquivos OK** (`i18n.js`, `main.js`, `charts.js`,
`dados-demo.js`, `tabela.js`).

### 2.2 Estrutura HTML (balanceamento de tags)
Script Python com `html.parser`, tratando corretamente elementos vazios
(`meta`, `link`, `input` etc.) e tags autofechadas.
**Resultado: 8/8 páginas HTML com tags corretamente balanceadas.**

*Nota:* a primeira rodada do script apontou "erros" em `<meta .../>` e
`<link .../>` — eram falso-positivo do próprio script de teste (não tratava
`handle_startendtag`), corrigido antes de validar. As páginas nunca tiveram
esse problema.

### 2.3 Links internos
Script Python varre todo `href=`/`src=` relativo em todas as páginas e
confirma que o arquivo referenciado existe no disco.
**Resultado: nenhum link interno quebrado.**

### 2.4 Navegação e privacidade do admin-preview
`grep` confirma que nenhuma página pública contém link de navegação
(`<a href="admin-preview...">`) para o painel — as únicas duas ocorrências
da palavra "admin-preview" no site público são menções textuais (FAQ da
Home e Política de Privacidade explicando o que é essa área), não links de
menu.
**Resultado: admin-preview não aparece na navegação pública.** ✅

### 2.5 Cobertura de tradução (i18n)
Script Python extrai todas as chaves `data-i18n` usadas nas 8 páginas e
confirma que todas existem no dicionário `pt-BR`; em seguida compara as
125 chaves de `pt-BR` contra `en-US`, `ko-KR` e `es-CL`.
**Resultado: paridade total — 125/125 chaves presentes nos 4 idiomas, 0
faltando, 0 sobrando.**

### 2.6 Busca por segredos
`grep -rniE` por padrões de API key, senha, token, string de conexão
PostgreSQL e chave AWS em todo o projeto (HTML/CSS/JS/MD).
**Resultado: nenhum segredo real encontrado.** As únicas ocorrências das
palavras "token"/"senha" são frases explicando que o frontend *não*
armazena esse tipo de dado (em `privacidade.html`) ou comentário de CSS
referindo-se a "design tokens" (variáveis de cor), sem relação com
segurança.

### 2.7 Placeholders (nada inventado)
`grep` confirma o uso consistente de `KIWIFY_CHECKOUT_URL_PENDENTE` (10
ocorrências, uma por botão de compra em `produtos.html`),
`EMAIL_CONTATO_PENDENTE` e `WHATSAPP_CONTATO_PENDENTE` (`atendimento.html`).
**Resultado: nenhum link de checkout, e-mail ou WhatsApp real foi
inventado**, conforme exigido.

### 2.8 Exportação CSV
A lógica de geração de dados e de CSV (`dados-demo.js` + `tabela.js`) foi
replicada e executada em Node.js fora do navegador para validar:
- geração de 24 linhas cobrindo as 7 categorias e os 3 status esperados
  (Pago, Pendente, Reembolsado);
- BOM UTF-8 presente no início do arquivo (`charCodeAt(0) === 0xFEFF`);
- separador `;` com escaping correto de aspas/ponto-e-vírgula;
- valores monetários formatados com vírgula decimal (`pt-BR`), compatível
  com a configuração regional padrão do Excel/LibreOffice no Brasil.
**Resultado: CSV gerado corretamente, sem erros.**

### 2.9 Servidor local / carregamento de todos os arquivos
`python3 -m http.server` na própria pasta do projeto; `curl` em todas as 8
páginas HTML e nos 8 arquivos de CSS/JS.
**Resultado: HTTP 200 em 15/15 arquivos testados.** Servidor de teste
encerrado ao final (porta 8791 confirmada livre).

### 2.10 Responsividade (mobile)
Verificação por leitura de `assets/css/style.css` e `admin-preview/assets/css/admin.css`:
media queries em `960px`, `780px` e `720px` cobrem grid de cartões, hero,
menu (viram menu lateral em tela cheia com botão hambúrguer) e rodapé.
**Resultado: regras responsivas presentes e consistentes.** Não foi
possível abrir um navegador real neste ambiente para captura de tela; a
validação visual final em dispositivo/emulador real fica como pendência
recomendada antes da divulgação pública (ver seção 4).

### 2.11 Escopo da pasta
`git rev-parse --is-inside-work-tree` confirma que esta pasta **não é** um
repositório git (logo, não há risco de commit acidental). Listagem de
diretórios irmãos no workspace confirma que nenhum outro projeto teve
arquivos alterados durante esta tarefa (timestamps inalterados).
**Nenhuma operação de deploy, git push ou commit foi executada**, conforme
instrução.

---

## 3. Erros encontrados e correções realizadas

| Erro encontrado | Onde | Correção |
|---|---|---|
| Falso-positivo de tags não fechadas (`</meta>`, `</link>`) no script de validação HTML | script de teste (não no site) | Script corrigido para tratar `handle_startendtag` como não-alterador de pilha; revalidado com sucesso |

Nenhum erro real de sintaxe, link quebrado, chave de tradução ausente ou
segredo exposto foi encontrado no código entregue.

---

## 4. Pendências reais (não resolvidas nesta versão, por decisão consciente)

Estas pendências **não são bugs** — são itens que dependem de decisão
humana, dado real ou infraestrutura que não existe ainda, e por isso foram
deixados como placeholder explícito em vez de inventados:

1. **Link(s) de checkout Kiwify** — aguardando configuração real.
2. **E-mail e WhatsApp de atendimento reais** — aguardando definição.
3. **Revisão jurídica** de Termos de Uso e Política de Privacidade.
4. **Tradução completa da prosa detalhada** das páginas internas (Produtos,
   Cursos, Sobre, Atendimento, Termos, Privacidade) para EN-US, KO-KR e
   ES-CL — hoje cabeçalhos/rótulos de interface já estão traduzidos nos 4
   idiomas; o texto longo permanece em PT-BR com aviso visível quando outro
   idioma é selecionado, para não apresentar tradução não revisada como
   definitiva.
5. **Autenticação real do `admin-preview`** — hoje é uma página estática
   sem controle de acesso, correta para demonstração local, mas que precisa
   de proteção via backend/Portão A antes de qualquer exposição além do
   notebook local.
6. **Dados reais do funil** — `dados-demo.js` precisa ser substituído por
   integração com dados verdadeiros quando existirem (nunca via conexão
   direta do navegador ao banco).
7. **Validação visual em navegador real** (capturas de tela em desktop e
   mobile) — este ambiente não permitiu abrir um navegador gráfico; a
   estrutura HTML/CSS foi validada estaticamente (tags, links, media
   queries), mas uma checagem visual humana antes da divulgação pública é
   recomendada.
8. **Imagens/fotografia de marca própria** — esta versão usa apenas CSS e
   emojis como recursos visuais, para manter o site leve.

Todas essas pendências também estão listadas como checklist em `README.md`,
seção 10.

---

## 5. Conclusão da primeira versão

A primeira versão pública do site CorpoPleno foi criada, testada
localmente e corrigida onde necessário, permanecendo inteiramente dentro de
`site_publico_corpopleno_master_20260919/`. Nenhum dado real, número de
vendas, link de checkout, contato ou credencial foi inventado — todos os
itens não confirmados aparecem como placeholder claramente identificado,
conforme a regra de honestidade das diretrizes internas do site.

---

## 6. Revisão de catálogo, mapa de ambientes e correções (19/09/2026)

Nomenclatura oficial usada a partir daqui: **Site Oficial Atual**
(`corpopleno-oficial.noemycordeiro.chatgpt.site`), **Novo Site Público
CorpoPleno — Oficina Local** (esta pasta), **Cordex Privado**
(`localhost:3210/unificada/`), **Atomicat/Domínio Legado**
(`corpoplenoresultadoreal.com.br`).

### 6.1 Auditoria de ambientes (somente leitura)

Antes de continuar o desenvolvimento, foi feita uma auditoria somente
leitura dos processos locais (`ss`/`lsof`/`ps`) e da conta Atomicat
(listagem, sem escrita), a pedido da proprietária. Achados:
- Porta 8080 e porta 8088 serviam a mesma pasta desta oficina — 8088 já
  estava rodando havia ~12h, iniciado antes desta sessão, não morto nem
  alterado.
- Existia uma pasta irmã `site_publico_corpopleno_master_20260919_checkpoint_claude_v1`
  de uma sessão anterior — identificada, não tocada.
- Atomicat tem 1 site conectado (domínio `www.corpoplenoresultadoreal.com.br`),
  publicando uma página de quiz sem relação com o catálogo CorpoPleno — 0
  projetos cadastrados. Nenhuma correspondência com o Site Oficial Atual.
- A proprietária aprovou o mapa e confirmou os três ambientes.

### 6.2 Revisão do catálogo público — remoção de produtos genéricos

**Pesquisa realizada** (somente leitura, em todo o workspace CorpoPleno
acessível) por produtos reais e aprovados antes de decidir o que exibir:
- Encontrado o app **"Henê Sem Medo" / CorpoPleno Mulher**
  (`~/CorpoPleno-IA/workspace/app-corpopleno-mulher`), um projeto real e bem
  documentado — mas o próprio README declara **"Estado comercial: não
  publicado"**, com 11 portões de aprovação listados e **nenhum cumprido**,
  incluindo "Definição de preço e integração de checkout" em aberto.
- Nenhum outro produto aprovado para exibição pública foi encontrado
  (inventário de ativos, documentos do workspace, Atomicat).
- **Decisão**: seguindo a regra "se houver dúvida, não publicar, registrar
  como pendência", nenhum produto específico foi mantido no catálogo
  público — nem os genéricos que eu mesmo havia criado antes (eBook —
  Organização de rotina, Mini app — Diário de hábitos, Guia capilar —
  Cuidados básicos etc.), nem "Henê Sem Medo" (por estar explicitamente
  não aprovado para venda).

**O que mudou em `produtos.html`:**
- Removidos os 10 cartões de produto fictícios.
- Substituídos por 7 cartões de **categoria** (eBooks, Livros, Mini apps,
  Autocuidado, CorpoPleno Natural, Materiais capilares, Nutrição), cada um
  com o estado honesto "Em preparação — nenhum produto aprovado para
  exibição pública nesta categoria ainda" — sem nome de produto inventado.
- Nenhum botão de checkout nesses cartões (não há SKU real para "comprar").
- Estados internos documentados (comentário HTML + README): `RASCUNHO` →
  `EM PRODUÇÃO` → `EM REVISÃO` → `PRONTO PARA EXIBIÇÃO` → `PUBLICADO`.
  Somente os dois últimos podem aparecer nesta página; nenhum produto
  atingiu esse estado até 19/09/2026.
- Nova chave de tradução `products.category_empty` adicionada aos 4
  idiomas (paridade confirmada).

**Pendência registrada, não implementada:** `cursos.html` tem o mesmo
problema (cursos de exemplo inventados) e não foi tocado nesta rodada —
está fora do escopo do pedido, que foi especificamente sobre Produtos.

### 6.3 Correção de metadados (canonical / og:url)

`corpoplenoresultadoreal.com.br` (Atomicat/Domínio Legado) já hospeda outra
estrutura (o quiz achado na auditoria 6.1) — usá-lo como `canonical`/`og:url`
da nova oficina seria uma afirmação falsa sobre onde o site está publicado.

- **Removidas 11 tags** (`canonical` nas 7 páginas + `og:url` em 5 delas),
  substituídas por comentários HTML explicando o motivo.
- Nenhuma URL de substituição foi inventada — os comentários deixam a
  decisão para o momento do deploy, quando a URL final for aprovada.
- Único arquivo não tocado: `PROMPT_MASTER_SITE_CORPOPLENO.md` (instrução
  original da proprietária, não um arquivo gerado).
- Checkpoint: `checkpoints/checkpoint_correcao_metadados_20260919_131056/`.

### 6.4 E-mail real, WhatsApp flutuante e "Minha área"

Checkpoint: `checkpoints/checkpoint_email_whatsapp_minhaarea_20260919_131714/`.

**E-mail** — `corpoplenoresultadoreal@gmail.com` (único e-mail autorizado,
confirmado pela proprietária) substituiu `EMAIL_CONTATO_PENDENTE` e
"Canal em configuração" no rodapé das 7 páginas e no cartão de contato de
`atendimento.html`, sempre como link `mailto:` (não é automação de envio —
só abre o aplicativo de e-mail do visitante). De caminho, foram finalmente
conectadas as chaves de tradução `support.human.*`/`support.auto.*`
(Patrícia / modo automatizado), que já existiam no dicionário desde uma
sessão anterior mas nunca tinham sido usadas no HTML — e uma lacuna real de
tradução foi encontrada e corrigida: o bloco `es-CL` do `i18n.js` estava
sem essas 9 chaves (ficaria em português para quem usasse o site em
espanhol); corrigido, paridade 139/139 confirmada nos 4 idiomas.

**WhatsApp flutuante** — botão fixo (`#cp-whatsapp-float`) em todas as
páginas públicas, com **configuração única** em `assets/js/main.js`
(objeto `CP_WHATSAPP`). Hoje `numero: null` — internamente equivalente a
`CORPOPLENO_WHATSAPP_PENDENTE`, nenhum número real, pessoal ou inventado.
Sem número configurado, o clique mostra um aviso (toast) em vez de abrir
qualquer link. Mensagem inicial já preparada: "Olá! Vim pelo site da
CorpoPleno e gostaria de atendimento." Quando o número real existir, um
único valor em `main.js` atualiza automaticamente o botão flutuante, o
cartão de WhatsApp em Atendimento e a linha de WhatsApp do rodapé de todas
as páginas (via atributos `data-whatsapp-*`) — não é WhatsApp Cloud API,
apenas link `wa.me`.

**Minha área** — botão discreto no cabeçalho (`#cp-minha-area`) de todas as
páginas públicas, levando à nova página `minha-area.html`. **Nenhuma
autenticação real ou falsa foi implementada** — a página documenta o fluxo
futuro (`Site público → Backend seguro/Portão A → Autenticação → Área do
cliente → Produtos adquiridos`) e o contrato de login planejado (e-mail +
senha, "Esqueci minha senha", 2FA quando exigido, sessão conforme política
a definir), sem nenhum formulário de senha nem simulação de login.
`localhost:3210` (Cordex Privado) não é referenciado em nenhum lugar do
site público.

### 6.5 Testes desta rodada

| Teste | Resultado |
|---|---|
| `node --check` em `main.js` e `i18n.js` | ✅ OK |
| Tags balanceadas nas 8 páginas (7 + `minha-area.html`) | ✅ OK |
| Links internos (`href`/`src`) de todas as 8 páginas | ✅ nenhum quebrado |
| Paridade de tradução (4 idiomas) | ✅ 139/139, sem faltas nem sobras — incluindo a correção real do bloco es-CL |
| Autoconsistência dos elementos-alvo do JS (`#cp-whatsapp-float`, `data-whatsapp-status`, `#cp-minha-area`) em cada página | ✅ presentes 1x em cada página pública; `minha-area.html` corretamente sem o próprio botão "Minha área" |
| Servidor local (porta 8080, já em execução) respondendo em todas as páginas e assets | ✅ HTTP 200 em 11/11 |
| Processos preservados (3210, 8080, 8088) | ✅ mesmos PIDs antes/depois, nenhum morto ou reiniciado |
| Ausência do domínio Atomicat/legado em atributos funcionais (`href`/`content`) | ✅ só aparece em comentários explicativos |
| Ausência de `EMAIL_CONTATO_PENDENTE`/`WHATSAPP_CONTATO_PENDENTE` (nome antigo) | ✅ substituídos por e-mail real e `CORPOPLENO_WHATSAPP_PENDENTE` (nome padronizado) |

### 6.6 Confirmações de preservação

Nenhuma alteração foi feita em: Site Oficial Atual, Cordex Privado
(`localhost:3210/unificada/`, mesmo PID do processo `node`), Atomicat, DNS,
domínio, PostgreSQL, Portão A, Revisões 06/07, backups anteriores. Nenhum
deploy, publicação, commit ou push foi realizado.

### 6.7 Item pendente da revisão de catálogo, agora concluído: caminhos de Atendimento

Ao reconferir a revisão do catálogo item por item, um ponto ficou de fora
nas rodadas anteriores: os "caminhos" pedidos para o botão Atendimento
(seção 7 do pedido — dúvidas / produto já comprado / reclamação /
cancelamento-reembolso / outro assunto), espelhando o menu inicial do
cliente já usado na Central Master de Atendimento (Cordex). Checkpoint:
`checkpoints/checkpoint_caminhos_atendimento_20260919_173704/`.

**O que foi adicionado em `atendimento.html`:**
- Seção "Como podemos ajudar?" com 5 caminhos: Dúvidas sobre produtos,
  Ajuda com produto comprado, Reclamação, Cancelamento/Reembolso e Outro
  assunto — cada um é um link `mailto:` real para
  `corpoplenoresultadoreal@gmail.com`, com o assunto do e-mail já
  preenchido de acordo com o caminho escolhido (ex.: `subject=Reclamação -
  CorpoPleno`), URL-encoded corretamente.
- Texto deixa explícito que hoje isso abre e-mail, e que passará a
  responder automaticamente quando o chat da Central de Atendimento for
  conectado — sem expor `localhost:3210` nem revelar arquitetura interna.
- 12 novas chaves de tradução (`support.menu.*`) adicionadas aos 4 idiomas,
  paridade confirmada: **150/150 chaves, 0 faltando, 0 sobrando**.

**Testado:** `node --check` no `i18n.js` (OK), HTML de `atendimento.html`
com tags balanceadas (OK), os 5 links `mailto` conferidos com `grep`
mostrando o assunto correto e URL-encoding correto em cada um, página
respondendo HTTP 200 no servidor local, processos das portas 3210/8080/8088
com os mesmos PIDs de antes (nada reiniciado).

## 7. Conclusão desta rodada

O catálogo público agora só mostra estrutura de categorias reais, sem
produtos inventados; e-mail de contato é real e funcional; WhatsApp e login
seguem como placeholders explícitos, tecnicamente prontos para receber
dados reais em um único ponto de configuração cada. Pendências seguem
listadas no `README.md` (seção 12) para a próxima etapa.

## 8. Revisão master da página pública de cursos (19/09/2026)

Checkpoint antes da alteração:
`checkpoints/checkpoint_revisao_cursos_20260919_175022/` (cursos.html,
i18n.js, main.js, style.css, README.md, RELATORIO_VALIDACAO.md +
SHA256SUMS.txt).

### 8.1 Pesquisa de cursos reais e aprovados

Antes de tocar em `cursos.html`, o workspace foi pesquisado em busca de
documentação de cursos CorpoPleno já nomeados e aprovados:
`requisitos-cursos-visuais.txt`, `requisitos-tutoriais-tecnicos.txt`,
`requisitos-dupla-ia-editor.txt`, `requisitos-vozes-personagens.txt`,
`templates-de-aula/`, `modelos-de-roteiro/` e `modelos-de-cena/`.

**Resultado:** todos esses arquivos descrevem capacidades do **Estúdio de
Produção** (avatar 3D, vozes oficiais dos personagens, cenas, dupla IA
Claude+Codex) — ou seja, ferramentas para *produzir* vídeos de curso no
futuro — e não a existência de um curso específico, nomeado e aprovado
para publicação. Uma busca adicional por "curso aprovado", "curso
oficial", "curso publicado" e "matrícula" nos arquivos `.txt`/`.md` do
workspace não retornou nenhum resultado. Conclusão: nenhum curso de
idiomas, empresarial, técnico ou curto tem hoje comprovação de aprovação
para exibição pública — o mesmo padrão já encontrado na revisão do
catálogo de produtos (seção 6.2).

### 8.2 O que foi removido da vitrine pública

Os seguintes cards, com nomes de curso inventados, foram removidos de
`cursos.html`:
- "Inglês — Nível introdutório"
- "Espanhol — Nível introdutório"
- "Organização empresarial básica"
- "Introdução a ferramentas digitais"
- "Curso curto — Organização de rotina"
- "Libras — Módulo bônus" (card antigo, que tratava Libras como se fosse
  um módulo de curso comum, sem deixar claro que não é vendida
  separadamente)

Nenhum desses nomes existia em nenhum documento do projeto como curso
aprovado — foram títulos de exemplo/placeholder da versão anterior da
página, não produtos reais da CorpoPleno.

### 8.3 O que foi mantido/criado (estrutura honesta por categoria)

`cursos.html` passou a mostrar 5 cards de **estado de categoria** (sem
nomes de curso específicos), preservando a filter-bar existente (mesmas 5
categorias, mesmos atributos `data-filter`/`data-category`, filtros
funcionando sem alteração de JS):

- **Idiomas** — badge "Em preparação". Texto deixa claro que cursos de
  idiomas estão em planejamento, com carga horária estimada de 12 meses
  para as turmas principais, sem expor a arquitetura interna
  quadrilíngue (PT-BR/EN-US/KO-KR/ES-CL) nem nomes/datas/valores ainda
  não aprovados.
- **Empresarial** — badge "Em preparação", texto genérico "nenhum curso
  aprovado para exibição pública nesta categoria ainda".
- **Técnicos** — idem.
- **Cursos curtos** — idem.
- **Libras — conteúdo bônus** — badge diferenciado "Bônus" (`badge-info`,
  azul, em vez de `badge-preparo`), deixando explícito que **Libras não é
  vendida como curso independente**: é conteúdo bônus liberado apenas
  para quem comprar um curso CorpoPleno elegível. O texto documenta que a
  liberação dependerá de registro real de compra no backend (e sua
  eventual revogação em caso de reembolso), e um comentário HTML no
  código reforça que isso **não deve ser simulado apenas no frontend**.

### 8.4 Certificação — frase ajustada

A frase anterior no hero ("Nenhuma certificação profissional é oferecida
nesta primeira versão") foi substituída, em `courses.hero.lead` (4
idiomas), pela frase solicitada:

> "Informações sobre carga horária, conteúdo e certificação de cada curso
> serão apresentadas na página específica antes da matrícula."

Isso remove a formulação permanentemente negativa sem afirmar nenhuma
certificação, habilitação profissional, diploma ou registro que a
CorpoPleno não possui.

### 8.5 Itens já presentes (confirmados, não recriados)

Antes de editar, confirmou-se via `grep` que `cursos.html` já continha,
por já terem sido aplicados site-wide em rodadas anteriores:
- E-mail real `corpoplenoresultadoreal@gmail.com` no rodapé (1 ocorrência).
- Botão flutuante de WhatsApp (`cp-whatsapp-float`, placeholder
  `CORPOPLENO_WHATSAPP_PENDENTE`, sem número inventado).
- Botão "Minha área" no cabeçalho (`cp-minha-area`, sem autenticação
  falsa).

Nenhum desses três itens precisou ser recriado — apenas confirmado após
a edição, na página servida ao vivo.

### 8.6 Traduções adicionadas

7 novas chaves i18n (`common.bonus_tag`, `courses.category_empty`,
`courses.category.idiomas.body`, `courses.libras.title`,
`courses.libras.body`) somadas à correção de `courses.hero.lead` nos 4
idiomas. Paridade confirmada por script Python: **157/157 chaves em
pt-BR, en-US, ko-KR e es-CL — 0 faltando, 0 sobrando**.

### 8.7 Testes realizados

| Teste | Resultado |
|---|---|
| `node --check` em `i18n.js` e `main.js` | OK |
| Balanceamento de tags HTML (`cursos.html`) | OK, 0 erros |
| Links internos (`href`/`src`) existem no disco | OK, todos resolvidos |
| Paridade i18n 4 idiomas | OK, 157/157 |
| Servidor local `curl -I http://localhost:8080/cursos.html` | HTTP 200 |
| Ausência dos títulos de curso removidos na página servida | Confirmado (0 ocorrências) |
| Presença da frase de certificação solicitada | Confirmado (1 ocorrência) |
| Presença de "Libras — conteúdo bônus" | Confirmado (1 ocorrência) |
| Presença do e-mail real | Confirmado (1 ocorrência) |
| Presença do botão WhatsApp flutuante | Confirmado (1 ocorrência) |
| Presença do botão Minha área | Confirmado (1 ocorrência) |
| Ausência de link/botão de checkout ou compra | Confirmado (0 ocorrências) |
| Ausência de número de WhatsApp inventado | Confirmado (0 ocorrências) |
| Filtros por categoria (`data-filter`/`data-category`) | Compatíveis, mesma lógica de `main.js`, sem alteração de código |
| PIDs das portas 3210/8080/8088 | Inalterados (node 703203, python3 8080, python3 674557 na 8088) |

### 8.8 Preservações confirmadas

Nenhuma alteração foi feita em: Site Oficial Atual, Cordex Privado
(`localhost:3210/unificada/`, mesmo PID do processo `node`), Atomicat, DNS,
domínio, PostgreSQL, Portão A, backups/checkpoints anteriores. Nenhum
deploy, publicação, commit ou push foi realizado. O layout visual (modo
claro, cabeçalho, tipografia, paleta, filtros, grid de cards,
responsividade, seletor de idioma e rodapé) não foi redesenhado — apenas o
conteúdo dos cards e o texto do hero foram revisados.

## 9. Revisão master da página pública de atendimento (19/09/2026)

### 9.0 Nota de processo — checkpoint reconstruído

Nesta rodada, as edições em `style.css`, `main.js` e `atendimento.html`
começaram **antes** do checkpoint ser criado, contrariando a instrução
explícita de checkpoint prévio. Assim que percebido, o checkpoint foi
reconstruído de forma auditável em
`checkpoints/checkpoint_revisao_atendimento_20260919_185309_PRE_EDICAO_RECONSTRUIDO/`:
- `main.js.antes` e `style.css.antes` vieram de
  `checkpoint_revisao_cursos_20260919_175022/` (hash confirmado idêntico —
  esses dois arquivos não haviam sido tocados entre aquele checkpoint e o
  início desta tarefa).
- `i18n.js.antes`, `README.md.antes` e `RELATORIO_VALIDACAO.md.antes` foram
  copiados no momento em que o erro foi percebido, antes de qualquer edição
  nesta rodada (portanto são cópias reais do estado anterior).
- `atendimento.html.antes` foi reconstruído a partir do conteúdo lido
  integralmente pela ferramenta de leitura no início desta tarefa, transcrito
  fielmente (230 linhas, sem alteração de conteúdo).
- `SHA256SUMS.txt` documenta os hashes de todos os arquivos `.antes`.

Registrado aqui para transparência total com a proprietária.

### 9.1 O que já estava correto (verificado, não recriado)

Antes de editar, confirmou-se que a inconsistência de e-mail relatada pela
proprietária **já não existia** na página servida:
`grep -c "EMAIL_CONTATO_PENDENTE" atendimento.html` retornou 0, e o rodapé já
mostrava `corpoplenoresultadoreal@gmail.com` como link `mailto:` real (não
"Canal em configuração"). Isso já havia sido corrigido em uma rodada anterior
(seção 6.4). O WhatsApp também já seguia a regra pedida: placeholder
`CORPOPLENO_WHATSAPP_PENDENTE`, nenhum número inventado, nenhum link
`wa.me` gerado sem número real. O botão "Minha área" no cabeçalho também já
existia. Nenhum desses três itens precisou ser recriado.

### 9.2 O que foi alterado

- **Sem impressão de vários humanos**: o card "Equipe CorpoPleno" (que
  sugeria uma equipe de funcionários) foi renomeado para "Atendimento
  CorpoPleno", com texto explícito de que o atendimento é feito pelo
  Atendimento IA (todos os dias) e por Patrícia — Atendente CorpoPleno
  (horário comercial), sem sugerir uma equipe de vários atendentes humanos.
  Nenhum outro nome de atendente foi criado.
- **IA vs. humano diferenciados**: novo card "Atendimento IA CorpoPleno"
  (todos os dias, 7h–20h, lista de 8 capacidades pedidas: responder dúvidas,
  orientar produtos, ajudar compradores, consultar agentes supervisores,
  abrir protocolos, registrar reclamações, registrar sugestões, criar
  prioridades; nota "não inventamos respostas sem base segura"; nota "não
  promete transferência imediata para o atendimento humano"). Card
  "Atendimento humano" renomeado para "Atendimento Humanizado CorpoPleno",
  mantendo Patrícia como único perfil humano, horário comercial (seg-sex,
  9h-17h) e a possibilidade de ela entrar excepcionalmente em chat/WhatsApp.
- **Fluxo de dúvida fora do produto**: novo bloco documentando o
  comportamento já definido, citando as duas mensagens-base fornecidas
  literalmente (usando **SELECIONADAS**, nunca "SORTEADA" — confirmado por
  teste automatizado, ver 9.4).
- **Moderação de linguagem**: novo bloco documentando a política (aviso
  educado na primeira ocorrência, novo aviso em reincidência, pausa da
  conversa em abuso persistente preservando protocolo e solicitação, nunca
  descartar reclamação legítima por o cliente estar irritado).
- **Entrada "Já sou cliente / produto comprado"**: card do menu inicial
  passou a apontar para uma nova seção (`#cp-secao-cliente`, em vez de abrir
  e-mail direto) com: campos ilustrativos de e-mail e telefone (com a classe
  `allow-select`, para que o próprio texto digitado continue selecionável e
  copiável apesar do bloqueio geral de cópia da página), botão "Buscar meus
  produtos" (`aria-disabled="true"`, permanece clicável e mostra um toast
  explicando que a integração com o backend está pendente — nenhum dado do
  campo é lido, enviado ou armazenado), regra de 1 produto vs. vários
  produtos, a mensagem exata de "não lembro o produto" fornecida pela
  proprietária, e um link `mailto:` real como alternativa imediata.
- **Reclamação — como funciona**: nova seção (`#cp-secao-reclamacao`) com
  textarea ilustrativa (também `allow-select`), botão "Registrar reclamação
  (protocolo)" com o mesmo padrão de toast pendente, texto sobre fila de
  atendimento humanizado (retorno pode não ser imediato, Patrícia não é
  convocada automaticamente), a regra da janela de 2 horas (conversa pode
  ficar disponível para intervenção humana por até 2h, sem obrigação de
  resposta; se não houver intervenção, sessão é encerrada mas protocolo/
  reclamação/histórico são preservados), e link `mailto:` real como
  alternativa imediata.
- **Cancelamento/Reembolso**: nova seção própria (`#cp-secao-cancelamento`)
  deixando explícito que o direito ao reembolso não é decidido só pelo
  relato do cliente, que e-mail+telefone ajudam a localizar o cadastro mas
  não bastam como autenticação para ação financeira sensível, e a frase
  pedida "Verificação adicional poderá ser necessária.", com link `mailto:`
  real como alternativa imediata.
- **Suporte por produto**: mantida a estrutura visual das 4 categorias, mas
  adicionado aviso explícito de que nenhum desses canais está ativo hoje,
  porque nenhum produto CorpoPleno está publicado (referenciando as revisões
  de Produtos e Cursos), e que o suporte real dependerá do produto
  efetivamente comprado.
- **Site público x Central privada**: adicionado bloco visual "Como isso
  funciona por trás" com o fluxo exato pedido (Site público → Backend
  seguro → Central Master de Atendimento → agente apropriado / supervisor →
  resposta ao cliente), sem expor contagem de agentes, supervisores
  específicos, dados financeiros, credenciais, tokens ou PostgreSQL — um
  comentário HTML (não visível ao cliente) documenta essa regra para
  qualquer edição futura.
- **Menu "Já sou cliente / produto comprado"**: título e descrição do card
  do menu inicial atualizados para refletir a nova seção de localização de
  produtos.

### 9.3 Traduções adicionadas

45 chaves i18n novas (`support.flow.*`, `support.team.*`, `support.ai.*`,
`support.ai.offtopic.*`, `support.moderation.*`, `support.client.*`,
`support.complaint.*`, `support.cancel.*`, `support.byproduct.notice`) mais
4 chaves com valor atualizado (`support.human.title`,
`support.human.channel`, `support.menu.comprador.title`,
`support.menu.comprador.desc`). As 4 chaves antigas `support.auto.*`
(substituídas pelo conceito de "Atendimento IA") foram removidas dos 4
idiomas. Paridade confirmada por script Python: **202/202 chaves em pt-BR,
en-US, ko-KR e es-CL — 0 faltando, 0 sobrando**.

### 9.4 Testes realizados

| Teste | Resultado |
|---|---|
| `node --check` em `i18n.js` e `main.js` | OK |
| Balanceamento de tags HTML (`atendimento.html`) | OK, 0 erros |
| Links internos (`href`/`src`) existem no disco | OK, todos resolvidos |
| Âncoras internas (`#cp-secao-cliente/reclamacao/cancelamento`) | OK, href e id correspondem 1:1 |
| Paridade i18n 4 idiomas | OK, 202/202 |
| Servidor local `curl http://localhost:8080/atendimento.html` | HTTP 200 |
| `EMAIL_CONTATO_PENDENTE` na página servida | 0 ocorrências |
| `corpoplenoresultadoreal@gmail.com` na página servida | 7 ocorrências |
| E-mail no rodapé como "Canal em configuração" | 0 ocorrências (é WhatsApp que mantém esse texto) |
| Link `wa.me` gerado sem número real | 0 ocorrências |
| Número de telefone inventado (padrão `+55...`) | 0 ocorrências |
| "Equipe CorpoPleno" na página servida | 0 ocorrências |
| "Atendimento CorpoPleno" na página servida | 2 ocorrências |
| "SELECIONADA" presente / "SORTEADA" ausente | 1 / 0 |
| Botão "Minha área" presente | Confirmado |
| Termos internos proibidos (CPF completo, "62 agentes", PostgreSQL, token, credencial) fora de comentário HTML | Confirmado ausentes do conteúdo visível — as únicas ocorrências de "supervisor"/"PostgreSQL"/"token"/"credencial"/"CPF" no arquivo-fonte estão dentro do comentário de documentação (invisível ao cliente) ou são o termo genérico "agentes supervisores"/"supervisor" explicitamente pedido para a lista de capacidades da IA e para o fluxo público — nenhum dado real, nome ou contagem interna foi exposto |
| PIDs das portas 3210/8080/8088 | Inalterados (node 703203, python3 8080, python3 674557 na 8088) |

### 9.5 Preservações confirmadas

Nenhuma alteração foi feita em: Site Oficial Atual, Cordex Privado
(`localhost:3210/unificada/`, mesmo PID do processo `node`), Atomicat, DNS,
domínio, PostgreSQL, Portão A, backups/checkpoints anteriores. Nenhum
deploy, publicação, commit ou push foi realizado. O layout visual (modo
claro, cabeçalho, tipografia, paleta, grid de cards, responsividade,
seletor de idioma e rodapé) não foi redesenhado — apenas conteúdo, textos e
os novos blocos/seções documentados acima foram adicionados, reaproveitando
classes CSS já existentes (`card`, `notice`, `badge-*`, `btn-secondary`,
`allow-select`) e duas classes novas e mínimas (`.cp-field`,
`.cp-field-row`) para os campos ilustrativos de formulário.

## 10. Redução radical da exposição pública do atendimento (19/09/2026)

Checkpoint antes de qualquer alteração:
`checkpoints/checkpoint_ajuste_privacidade_atendimento_20260919_214026/`
(atendimento.html, i18n.js, main.js, style.css, README.md,
RELATORIO_VALIDACAO.md + SHA256SUMS.txt).

Esta rodada reúne uma sequência de três pedidos da proprietária, cada um
reduzindo ainda mais a exposição pública de detalhes operacionais em
`atendimento.html`, culminando numa página pública minimalista. O
resultado final descrito abaixo já incorpora as três correções.

### 10.1 Princípio aplicado

SITE PÚBLICO = experiência simples do cliente. CENTRAL PRIVADA = regras,
agentes, moderação e operação. DOCUMENTAÇÃO = relatórios privados como
este. Os três níveis não devem se misturar na página pública — por isso
toda a lógica interna abaixo **continua válida e preservada**, apenas
deixou de ser explicada ou visível na interface pública.

### 10.2 O que foi removido da interface pública

- Identidade humana: nome "Patrícia", "Atendimento Humanizado CorpoPleno",
  "Canal humano ativo", horários amarrados a uma pessoa específica.
- Card "Atendimento IA CorpoPleno" com lista de capacidades internas
  ("Consultar agentes supervisores", "Criar prioridades", "Abrir
  protocolos") e a frase "não promete transferência imediata para o
  atendimento humano".
- Bloco "Quando a dúvida foge do produto", incluindo os dois exemplos
  completos de mensagem da Lista de Ideias (com a palavra "SELECIONADA").
- Bloco "Moderação de linguagem" (política de avisos/reincidência/pausa).
- Bloco "Como isso funciona por trás" com o fluxo Site público → Backend
  seguro → Central Master de Atendimento → agente/supervisor.
- Aviso técnico do topo da página (e-mail como canal oficial + horário
  amarrado a uma pessoa + status do WhatsApp).
- Seção "Suporte por produto" inteira (4 categorias + aviso sobre produtos
  não publicados) — a proprietária considerou desnecessário expor essa
  organização interna enquanto não há produto/canal real ativo.
- Todo texto de desenvolvimento: "Chat automático em preparação", "hoje os
  caminhos abrem e-mail", "backend seguro estiver conectado", "integração
  pendente", "central ainda será conectada", "localizar meus produtos",
  "fila de atendimento humanizado", "janela de 2 horas", "protocolo".
- Os formulários expandidos de "Já sou cliente", "Reclamação" e
  "Cancelamento/Reembolso" que ficavam sempre visíveis na página — a regra
  "1 produto vs. vários produtos", a explicação de autenticação financeira
  e a "verificação adicional" deixaram de ser explicadas antecipadamente.
- O botão flutuante de WhatsApp deixou de aparecer (em todas as páginas do
  site, já que é um componente compartilhado) enquanto
  `CP_WHATSAPP.numero` for `null` — antes ele ficava sempre visível e
  mostrava um toast explicando que estava "em configuração"; agora ele
  simplesmente não aparece, sem deixar de existir no código.

### 10.3 O que passou a existir no lugar (divulgação progressiva)

A página pública agora mostra apenas:

- Título "Atendimento CorpoPleno" e "Como podemos ajudar?".
- 5 botões-cartão: Dúvidas sobre produtos, Já sou cliente, Reclamação,
  Cancelamento/Reembolso, Outro assunto — cada um só com ícone + título,
  sem texto explicativo.
- Ao clicar em um botão, abre-se **somente aquele** painel abaixo (os
  demais permanecem ocultos via atributo `hidden`), com um título curto,
  uma frase objetiva e (quando aplicável) 1–2 campos:
  - **Dúvidas sobre produtos**: "Como podemos ajudar?" + botão "Continuar".
  - **Já sou cliente**: "Informe os dados utilizados na sua compra." +
    campos E-mail/Telefone + botão "Continuar".
  - **Reclamação**: "Registrar uma reclamação" / "Conte para nós o que
    aconteceu." + campo de texto + botão "Enviar reclamação".
  - **Cancelamento/Reembolso**: "Cancelamento ou reembolso" / "Envie sua
    solicitação para análise." + campo de texto + botão "Continuar".
  - **Outro assunto**: "Fale com a CorpoPleno sobre outro tema." + botão
    "Continuar".
- Cada botão de ação monta, no clique, um e-mail real
  (`mailto:corpoplenoresultadoreal@gmail.com`) com assunto apropriado e,
  quando há campos preenchidos, o conteúdo digitado no corpo da mensagem —
  **sem enviar nada a nenhum servidor e sem fingir um resultado**: o único
  destino é o próprio cliente de e-mail do visitante. Isso evita tanto
  linguagem técnica quanto uma falsa confirmação de que "a solicitação foi
  registrada" (o que não seria verdade sem um backend real).

### 10.4 O que continua preservado internamente (não apagado, só não exibido)

Documentado aqui, no relatório privado, exatamente como pedido:
- Patrícia é o perfil humano CorpoPleno; atendimento humano regular
  segunda a sexta, 9h–17h; atendimento IA todos os dias, 7h–20h.
- Tratamento de pergunta fora do escopo do produto, oferecendo registrar
  como sugestão na Lista de Ideias CorpoPleno (mensagens-base com a
  palavra **SELECIONADA**, nunca "SORTEADA").
- Moderação de linguagem: aviso educado na 1ª ocorrência de linguagem
  ofensiva, novo aviso na reincidência, pausa da conversa em abuso
  persistente (preservando protocolo/solicitação), nunca descartar
  reclamação legítima por o cliente estar irritado.
- Fila de atendimento humano, janela de 2 horas para intervenção humana
  após reclamação registrada (sem obrigação de resposta), encerramento de
  sessão preservando protocolo/reclamação/histórico.
- Patrícia não é convocada automaticamente para cada reclamação.
- Regra de validação de compra para reembolso: e-mail+telefone localizam o
  cadastro mas não autenticam ação financeira sensível; "verificação
  adicional poderá ser necessária" antes de qualquer decisão.
- Regra "1 produto vs. vários produtos" na localização de compras.
- Fluxo Site público → Backend seguro → Central Master de Atendimento →
  agente apropriado/supervisor → resposta ao cliente.
- Nenhuma dessas regras foi implementada como lógica funcional neste site
  público (não há backend real conectado) — elas são compromissos de
  design já definidos pela proprietária para quando a Central Master de
  Atendimento (Cordex) estiver conectada. Preservadas aqui como registro
  para a próxima etapa de desenvolvimento.

### 10.5 Limpeza técnica (consequência das remoções)

- 2 funções JS órfãs removidas de `main.js` (`showToast`,
  `currentLangText`, mais a função `setupPendingActions` — substituída por
  `setupSupportPanels`), e a classe CSS `.cp-toast` correspondente, já que
  nenhum elemento restante as utilizava.
- ~70 chaves i18n órfãs removidas dos 4 idiomas ao longo da rodada
  (`support.human.*`, `support.ai.*`, `support.flow.*`, `support.team.*`,
  `support.emailcard.*`, `support.client.*` antigas, `support.complaint.*`
  antigas, `support.cancel.*`, `support.moderation.*`,
  `support.byproduct.notice`, descrições de menu não mais exibidas) — e
  9 chaves novas (`support.panel.*`) mais 4 reaproveitadas
  (`support.client.email_label/email_placeholder/phone_label/phone_placeholder`,
  agora usadas no novo painel "Já sou cliente"). Paridade final confirmada:
  **156/156 chaves em pt-BR, en-US, ko-KR e es-CL — 0 faltando, 0
  sobrando**.
- Nova regra CSS `button.card` (reseta apenas `font`/`text-align`/
  `cursor`/`width` de um `<button>` usado com a classe `.card`, para os 5
  novos botões-cartão do menu se comportarem visualmente como os cards já
  existentes no site).
- `main.js` ganhou `setupSupportPanels()` (abre/fecha os painéis e monta o
  `mailto:` dinâmico) e `setupWhatsappFloat()` passou a ocultar o botão
  flutuante quando não há número real, em vez de mostrar um toast.

### 10.6 Testes realizados

| Teste | Resultado |
|---|---|
| `node --check` em `i18n.js` e `main.js` | OK |
| Balanceamento de tags HTML (`atendimento.html`) | OK, 0 erros |
| Paridade i18n 4 idiomas | OK, 156/156 |
| Todas as chaves `data-i18n`/`data-i18n-placeholder` existem no dicionário | OK, 0 ausentes |
| Servidor local `curl http://localhost:8080/atendimento.html` | HTTP 200 |
| Termos proibidos (backend, Central Master, supervisor, integração, Patrícia, protocolo, janela de 2 horas, Atendimento IA, Atendimento Humanizado, Suporte por produto como seção, SELECIONADA/Lista de Ideias, "Canal em configuração" como card) | 0 ocorrências no conteúdo visível |
| Botão flutuante de WhatsApp oculto sem número real | Confirmado (`hidden = true` quando `CP_WHATSAPP.numero` é `null`) |
| PIDs das portas 3210/8080/8088 | Inalterados |
| **Interação real dos painéis em navegador (clique abre só 1 painel, botão monta mailto)** | **Não testável neste ambiente** — sem navegador headless disponível (Node 18, sem Chrome/Playwright/jsdom instalados, e o projeto não usa build tooling por design). Revisão manual do código confirma a lógica; recomenda-se um teste manual rápido em navegador antes da publicação. |

Nota: 12 ocorrências da palavra "placeholder" continuam no arquivo — são
todas o atributo HTML padrão `placeholder="..."` dos campos (texto cinza
de exemplo dentro do campo vazio), não o jargão técnico "placeholder" que
a proprietária pediu para remover da linguagem voltada ao cliente. Esse
atributo é invisível ao usuário como palavra; ele só vê o texto de exemplo
dentro do campo.

Nota 2 (fora do escopo pedido nesta rodada): o rodapé de **todas** as
páginas do site (não só `atendimento.html`) ainda mostra "WhatsApp: Canal
em configuração" — um padrão já aprovado em rodadas anteriores e usado
identicamente em 9 páginas. Não foi alterado agora porque o pedido desta
rodada era especificamente sobre `atendimento.html`; se a proprietária
quiser este texto removido/simplificado também, isso afeta o rodapé
compartilhado de todo o site.

### 10.7 Preservações confirmadas

Nenhuma alteração foi feita em: Site Oficial Atual, Cordex Privado
(`localhost:3210/unificada/`, mesmo PID do processo `node`), Atomicat, DNS,
domínio, PostgreSQL, Portão A, backups/checkpoints anteriores. Nenhum
deploy, publicação, commit ou push foi realizado. Preservados: cabeçalho,
"Minha área", identidade visual CorpoPleno (cores, tipografia, modo
claro), responsividade e seletor de idioma — nenhum redesenho geral foi
feito, apenas a reestruturação de conteúdo desta página específica.

## 11. Identidade visual CorpoPleno + enxugamento da Home (19–20/09/2026)

Esta rodada juntou duas fases: (a) construção de um sistema visual
CorpoPleno mais rico (cores, hero, cards glossy, botões) a partir da
imagem de referência enviada pela proprietária, e (b) integração de 14
ícones/imagens reais fornecidos por ela + logo oficial 3D, seguida de um
enxugamento estrutural da Home para remover repetição de conteúdo.

Checkpoints, em ordem: `checkpoint_identidade_visual_20260919_220238/`
(antes do sistema visual) e `checkpoint_enxugamento_home_20260920_005005/`
(antes da integração de ícones + reestruturação da Home).

### 11.1 Limitação técnica registrada — geração de ícones por IA

A proprietária pediu ícones 3D estilo "Disney/Pixar" e, a pedido dela,
tentei gerar via API de imagens da OpenAI (chave fornecida por ela no
chat). A chamada falhou com `insufficient_quota` (conta sem crédito).
Registro de segurança: a chave apareceu em texto puro nesta conversa;
recomendei à proprietária revogá-la/regenerá-la em
platform.openai.com — a chave não foi salva em nenhum arquivo do
projeto, só usada uma vez via variável de ambiente de sessão de terminal.
Diante da falta de crédito, a proprietária optou por gerar as imagens
por conta própria (fora desta sessão) e enviá-las para eu integrar — o
que ela fez, uma a uma, ao longo da conversa.

### 11.2 Ativos visuais recebidos e onde foram aplicados

Local: `assets/img/marca/` (logo) e `assets/img/icones-recebidos/` (ícones).

| Arquivo | Conteúdo | Onde foi aplicado nesta rodada |
|---|---|---|
| `marca/logo-corpopleno-3d.png` | Logo 3D oficial + slogan embutido na imagem | Cabeçalho de todas as 8 páginas (substituiu emoji 🌈 + texto com gradiente CSS) |
| `whatsapp.png` | Ícone 3D do WhatsApp | Botão flutuante de WhatsApp (todas as páginas), pequeno (30px desktop / 26px mobile dentro do botão de 58px), conforme pedido explícito "sempre pequeno" |
| `produtos.png` | Sacolas de compra | Card "Produtos" em Explore a CorpoPleno (Home) |
| `cursos.png` | Capelo de formatura | Card "Cursos" em Explore a CorpoPleno (Home) |
| `proposito.png` | Alvo com dardo | Card "Propósito claro" em O que é a CorpoPleno (Home) |
| `metodologia.png` | Bússola colorida | Card "Metodologia própria" em O que é a CorpoPleno (Home) |
| `agentes-ia.png` | Robô mascote | Card "Tecnologia a serviço das pessoas" (Home) + badge flutuante "Tecnologia" no hero |
| `organizacao-revisao.png` | Documento com lupa/check | Card "Organização e revisão contínua" (Home) |
| `confianca.png` | Aperto de mãos com escudo | Badge flutuante "Confiança" no hero (Home) |
| `quizzes.png` | Prancheta com quiz/estrela | Card "Mini Apps" em Explore a CorpoPleno (Home) |
| `gmail.png` | Envelope do Gmail | Recebido, ainda não aplicado nesta rodada (reservado para atendimento.html/rodapé numa próxima etapa) |
| `idiomas.png` | Globo com PT/EN/KO/ES | Recebido, reservado para `cursos.html` (categoria Idiomas) |
| `libras.png` | Mãos em Libras | Recebido, reservado para `cursos.html` (bloco Libras — bônus) |
| `calculadora-bem-estar.png` | Calculadora com cérebro/coração | Recebido, reservado para `produtos.html` (categoria Mini apps) — **a proprietária corrigiu, junto com o envio, que o texto do site estava errado: "Calculadoras de bem-estar" (plural) deveria ser "Calculadora do bem-estar"; a seção onde esse texto vivia foi removida da Home neste mesmo enxugamento, então o erro de texto já não existe mais na Home; será aplicado corretamente quando este ícone for usado em produtos.html** |

Os 4 últimos (gmail, idiomas, libras, calculadora-bem-estar) não tinham um
lugar na Home reestruturada — ficam guardados na pasta para a próxima
rodada, quando o sistema visual for propagado para `produtos.html`,
`cursos.html` e `atendimento.html`.

### 11.3 Sistema visual CorpoPleno (`style.css`)

- Novos tokens: `--cp-radius-xl`, `--cp-shadow-glow`, `--cp-gradient-cta`,
  utilitário `.cp-reveal` (entrada suave, respeitando
  `prefers-reduced-motion`).
- Cabeçalho: logo 3D com `alt` descritivo + `span.sr-only` traduzido para
  leitores de tela (limitação conhecida: a imagem do logo tem o slogan
  desenhado em PT-BR fixo; em EN-US/KO-KR/ES-CL o visual continua em
  português, só o texto para leitor de tela é traduzido — ver 11.6).
- Cards: nova "esfera glossy" com brilho interno para ícones emoji
  (`.card__icon`), e uma variante `.card__icon--photo` para ícones-imagem
  reais (sem fundo/brilho sobreposto, a própria imagem já tem
  acabamento 3D).
- Botões: gradiente mais forte no CTA principal, brilho (`shadow-glow`)
  no hover.
- Hero: arte à direita agora é a fotografia de referência da proprietária
  (`hero-universo-corpopleno.png`) com moldura branca, brilho colorido
  (`hero__art-glow`) atrás, e 2 selos flutuantes ("Tecnologia",
  "Confiança") com ícone real pequeno + texto.
- Botão flutuante de WhatsApp: fica **oculto** (não apenas acinzentado)
  enquanto `CP_WHATSAPP.numero` for `null` (comportamento já existente,
  mantido) e agora usa a imagem 3D real, pequena, dentro de um botão
  branco.
- Removido CSS órfão: `.hero__art-chip` (não usado depois do redesenho do
  hero) e a regra `.whatsapp-float[aria-disabled="true"]` (nunca era
  aplicada, já que o botão é ocultado via `hidden`, não acinzentado).

### 11.4 Enxugamento da Home (`index.html`)

**Seções removidas** (conteúdo devolvido às páginas específicas ou
descartado por ser redundante):
- "Produtos" (grade eBooks/Natural/Capilares/Mini apps) — já existe em
  `produtos.html`.
- "Cursos" (grade Idiomas/Empresarial/Técnicos/Curtos) — já existe em
  `cursos.html`.
- "Materiais digitais" (Guias em PDF/Nutrição/Checklists) — sem produto
  aprovado, index próprio não previsto para esta versão.
- "Soluções interativas" (Calculadoras/Quizzes/Planners) — idem; é aqui
  que vivia o texto "Calculadoras de bem-estar" que a proprietária
  apontou como incorreto, agora removido junto com a seção.
- "Destaques" / "O que nos guia" — repetia, com palavras diferentes, os
  mesmos 4 conceitos já cobertos por "O que é a CorpoPleno"
  (Propósito/Metodologia/Tecnologia/Organização vs.
  Conteúdo-revisado/Tecnologia-aplicada/Transparência/Multilíngue).
- CTA final "Pronto para conhecer a CorpoPleno?" — repetia o convite já
  coberto pela nova seção Explore.
- Pergunta de FAQ sobre o painel administrativo demonstrativo (pergunta
  técnica, fora do escopo do que o visitante final precisa saber).

**Seções fundidas:**
- Nenhuma seção nova é uma "fusão" de HTML de duas seções antigas — a
  fusão já existia: "O que é a CorpoPleno" (id `conheca`) já cobria
  exatamente os 4 diferenciais que a instrução pediu para reunir; o
  trabalho foi remover a seção duplicada ("Destaques"), não criar uma
  nova.

**Seção nova:**
- "Explore a CorpoPleno" (id `explore`) — 3 entradas grandes (Produtos,
  Cursos, Mini Apps), cada uma com ícone real, descrição de 1 linha e
  CTA para a página específica. Substitui as duas grades completas de
  categorias que existiam antes.

**Simplificadas (mantidas, texto reduzido):**
- Atendimento: de um parágrafo explicando "canais organizados por
  produto, com equipe dedicada" para uma linha direta: "Precisa de ajuda?
  Encontre o canal ideal para sua solicitação."
- FAQ: de 5 perguntas administrativas/técnicas para 4 perguntas
  orientadas ao visitante (como recebo produtos, como funciona
  atendimento, como funciona cancelamento/reembolso, como acesso minha
  área) — exatamente as 4 sugeridas pela proprietária.

**Estrutura final da Home:**
1. Hero principal (foto de referência + selos Tecnologia/Confiança)
2. O que é a CorpoPleno (4 diferenciais com ícones reais)
3. Explore a CorpoPleno (Produtos / Cursos / Mini Apps)
4. Atendimento CorpoPleno (1 frase + botão)
5. Perguntas frequentes (4 perguntas)
6. Rodapé (inalterado)

A seção "Destaques" foi removida por completo (não apenas ocultada via
CSS) porque não há hoje nenhum produto/curso aprovado para preencher
"3 ou 4 destaques reais" — reaparecerá como conteúdo novo, não como
reaproveitamento do que existia, quando houver itens aprovados.

### 11.5 Traduções

Todas as chaves `home.*` reorganizadas: 31 chaves removidas (produtos,
cursos, materiais, interativo, destaques, cta final, 1 pergunta de FAQ) e
12 chaves novas adicionadas (`home.explore.*`), nas 4 línguas. Paridade
confirmada: **137/137 chaves em pt-BR, en-US, ko-KR e es-CL — 0
faltando, 0 sobrando**. Todas as chaves referenciadas por `data-i18n` em
`index.html` existem no dicionário (checado por script).

### 11.6 Limitações e pendências conhecidas

- **Logo multilíngue**: a imagem `logo-corpopleno-3d.png` tem o slogan
  "INTELIGENTE, RESULTADO REAL" desenhado nos pixels, em português. Ao
  trocar para EN-US/KO-KR/ES-CL, o texto visual do logo continua em
  português — só o `alt`/texto para leitor de tela é traduzido. Resolver
  isso de verdade exigiria versões do logo por idioma ou recriar o
  slogan em texto/CSS por cima da marca gráfica.
- **Peso das imagens**: `hero-universo-corpopleno.png` tem ~2,3 MB e os
  ícones ~1,3–1,8 MB cada (nenhuma ferramenta de compressão/conversão de
  imagem — `imagemagick`, `cwebp`, `PIL` — está disponível neste
  ambiente). Antes de qualquer publicação real, recomenda-se comprimir
  essas imagens (ex.: para WebP, mantendo qualidade visual) para não
  prejudicar o tempo de carregamento.
- **Ícones recebidos ainda não aplicados**: `gmail.png`, `idiomas.png`,
  `libras.png`, `calculadora-bem-estar.png` — aguardando a próxima etapa
  (propagação do sistema visual para `produtos.html`, `cursos.html` e
  `atendimento.html`, conforme o processo obrigatório da proprietária:
  "aplique primeiro à Home, teste, depois propague").
- **Teste em navegador real**: como nas rodadas anteriores, não há
  Chrome/Playwright disponível neste ambiente para captura de tela ou
  teste de interação real; a validação foi feita por análise estática
  (HTML/CSS/JS) e requisições HTTP diretas. Recomenda-se conferência
  visual manual em navegador antes de qualquer publicação.

### 11.7 Testes realizados

| Teste | Resultado |
|---|---|
| `node --check` em `i18n.js` e `main.js` | OK |
| Balanceamento de tags HTML nas 8 páginas | OK, 0 erros |
| Balanceamento de chaves `{}` no `style.css` | OK (151 abertas / 151 fechadas) |
| Paridade i18n 4 idiomas | OK, 137/137 |
| Todas as chaves `data-i18n` de `index.html` existem no dicionário | OK, 0 ausentes |
| Todas as 8 páginas via `curl` | HTTP 200 |
| Todas as imagens novas (logo + 8 ícones usados) via `curl` | HTTP 200 |
| Seções removidas ausentes da página servida | Confirmado (0 ocorrências cada) |
| Seções novas presentes na página servida | Confirmado (1 ocorrência cada) |
| Badges "Em preparação" na Home | 0 (removidas junto com as seções) |
| PIDs das portas 3210/8080/8088 | Inalterados |

### 11.8 Preservações confirmadas

Nenhuma alteração foi feita em: Site Oficial Atual, Cordex Privado
(`localhost:3210/unificada/`, mesmo PID do processo `node`), Atomicat,
DNS, domínio, PostgreSQL, Portão A, backups/checkpoints anteriores.
Nenhum deploy, publicação, commit ou push foi realizado. Rotas, i18n,
filtros de Produtos/Cursos, estrutura de Atendimento/Minha área,
responsividade e regras de segurança (bloqueio leve de cópia) não foram
alteradas — apenas o conteúdo e o sistema visual da Home, mais o
cabeçalho/rodapé compartilhados (logo e ícone do WhatsApp).

## 12. Correção definitiva — formulário único de Atendimento (20/09/2026)

Checkpoint antes da alteração:
`checkpoints/checkpoint_formulario_unico_atendimento_20260920_015004/`.

A proprietária decidiu simplificar radicalmente `atendimento.html`: em vez
do menu de 5 opções com divulgação progressiva (rodada anterior), a página
pública passa a mostrar **um único cartão de contato**, sem nenhuma
categoria pública de assunto.

### 12.1 O que saiu da interface pública

- Os 5 cartões-gatilho ("Dúvidas sobre produtos", "Já sou cliente",
  "Reclamação", "Cancelamento/Reembolso", "Outro assunto").
- Os 5 painéis de divulgação progressiva associados a cada opção
  (formulários empilhados, campos de e-mail/telefone separados, textarea
  de reclamação, textarea de cancelamento).
- O envio via `mailto:` como ação do botão de cada painel (abria o
  cliente de e-mail do visitante).
- Qualquer menção pública a "localizar meus produtos", "protocolo", "fila
  de atendimento" ou regra de janela de atendimento.

### 12.2 O que entrou no lugar

Um único cartão central (`.contact-card`):
- Título: "Dúvida sobre o produto".
- Subtítulo: "Como podemos ajudar?".
- Parágrafo de descrição (texto exato fornecido pela proprietária)
  orientando: cliente já existente → informar e-mail e telefone da compra
  na própria mensagem, depois descrever a dúvida; quem ainda não é
  cliente → falar pelo ícone do WhatsApp.
- Um campo de texto grande (`<textarea>`, `placeholder="Escreva aqui..."`).
- Um botão principal "ENVIAR" (gradiente CorpoPleno, `btn-primary
  btn-block`).

### 12.3 Comportamento do botão ENVIAR (ponto crítico testado)

O botão **não abre nenhum aplicativo externo** e **não finge que a
mensagem foi enviada**:
- `grep -c "mailto:"` em `assets/js/main.js` → **0** (o único `mailto:`
  que resta em `atendimento.html` é o link de e-mail do rodapé,
  independente do formulário, presente em todas as páginas do site).
- `grep -c "localStorage"` em `assets/js/main.js` → 1 ocorrência, mas é
  **um comentário explicando que localStorage NÃO é usado** — não há
  nenhuma chamada real a `localStorage.setItem`/`getItem` em lugar
  nenhum do código.
- Ao clicar em ENVIAR com o campo preenchido, `setupContactForm()`
  (`assets/js/main.js`) mostra uma mensagem honesta abaixo do botão
  (`#cp-contact-status`, `notice notice-info`): "Este canal de envio
  direto está sendo preparado com segurança. Assim que estiver pronto,
  sua mensagem seguirá diretamente para o atendimento CorpoPleno." — sem
  jargão técnico (backend/API/integração), sem confirmar um envio que não
  aconteceu de verdade. Se um número real de WhatsApp existir no futuro
  (`CP_WHATSAPP.numero`), uma segunda frase é anexada dinamicamente
  sugerindo o WhatsApp como alternativa; hoje essa frase não aparece
  porque não há número real configurado.
- Com o campo vazio, o clique apenas foca o campo de texto (validação
  mínima, sem mensagem de erro alarmante).
- Nenhum dado do campo é lido para fora do `<textarea>`: não há
  `fetch`, `XMLHttpRequest`, `localStorage`, `sessionStorage`, cookie ou
  qualquer outro mecanismo de persistência/envio no código do formulário.

### 12.4 O que continua preservado internamente (não apagado)

Documentado em um comentário HTML no início da seção do formulário
(invisível ao cliente, visível apenas no código-fonte) e neste relatório:
- Toda a lógica de classificação automática que a Central Master de
  Atendimento deverá aplicar quando conectada: "quero cancelar" →
  CANCELAMENTO; "quero meu dinheiro de volta" → REEMBOLSO; "não gostei do
  atendimento" → RECLAMAÇÃO; dúvida sobre produto comprado →
  SUPORTE/PRODUTO COMPRADO; sugestão de melhoria → SUGESTÃO/BANCO DE
  IDEIAS.
- Arquitetura de reclamações, cancelamento, reembolso, cliente
  identificado, produtos comprados, moderação de linguagem,
  escalonamento, atendimento humano (Patrícia), protocolos, prioridades,
  histórico e janela de atendimento — todas as regras documentadas em
  rodadas anteriores (seções 9 e 10 deste relatório) continuam válidas
  como especificação para a próxima etapa de desenvolvimento (conexão com
  o Cordex/Central Master de Atendimento). Nenhuma dessas regras foi
  removida do projeto — apenas não é mais exibida nem sugerida como
  opção na interface pública.

### 12.5 Identificação do cliente

Conforme pedido: nenhum CPF é solicitado. A orientação de e-mail e
telefone da compra é dada **dentro do texto explicativo**, não como
campos de formulário separados — o cliente escreve tudo junto em um único
campo livre. A validação real desses dados contra o cadastro fica para
quando o backend seguro existir (documentado, não implementado).

### 12.6 WhatsApp

Comportamento inalterado desde a rodada anterior: o botão flutuante de
WhatsApp usa o ícone 3D real, pequeno, e permanece **oculto** em todas as
páginas (incluindo esta) enquanto `CP_WHATSAPP.numero` for `null`. Nenhum
número foi inventado.

### 12.7 Limpeza técnica

- `main.js`: removida a função `setupSupportPanels` (menu + painéis +
  lógica de `mailto:` dinâmico) e um trecho morto que atualizava um
  cartão de WhatsApp que não existe mais na página desde uma rodada
  anterior (`data-whatsapp-display`/`data-whatsapp-badge`, sem nenhum
  elemento correspondente em HTML). Nova função `setupContactForm`
  substitui as duas. Função `currentLangText` recriada (havia sido
  removida por ficar órfã numa rodada passada, e agora voltou a ser
  necessária).
- `style.css`: removida a classe `.cp-field-row` (sem uso, já que não há
  mais campos lado a lado); `.cp-field` simplificado para `width: 100%`
  em vez de `flex: 1 1 220px`; nova classe `.contact-card` (cartão único,
  elegante, com padding generoso e ajuste para mobile).
- i18n: 21 chaves antigas do sistema de menu/painéis removidas
  (`support.menu.*`, `support.panel.*`, `support.client.*`) e 7 novas
  chaves adicionadas (`support.form.*`), nos 4 idiomas. Também corrigido
  o texto de `home.faq.a2` (Home), que ainda mencionava "escolha o
  assunto... por e-mail" — desatualizado após esta mudança. Paridade
  final: **123/123 chaves em pt-BR, en-US, ko-KR e es-CL — 0 faltando, 0
  sobrando**.

### 12.8 Testes realizados

| Teste | Resultado |
|---|---|
| `node --check` em `i18n.js` e `main.js` | OK |
| Balanceamento de tags HTML (`atendimento.html`) | OK, 0 erros |
| Balanceamento de chaves `{}` no `style.css` | OK (156/156) |
| Paridade i18n 4 idiomas | OK, 123/123 |
| Todas as chaves `data-i18n` de `atendimento.html` existem no dicionário | OK, 0 ausentes |
| Existe somente 1 `<textarea>` / 1 cartão de contato na página | Confirmado (1 e 1) |
| "Já sou cliente", "Outro assunto", "localizar meus produtos", "fila de atendimento" fora de comentário | 0 ocorrências |
| "Reclamação"/"Cancelamento"/"Reembolso"/"protocolo" fora de comentário | 0 ocorrências (só existem dentro do comentário de documentação interna) |
| `mailto:` em `assets/js/main.js` (comportamento do botão ENVIAR) | 0 ocorrências |
| `localStorage` real (fora de comentário) em `assets/js/main.js` | 0 ocorrências |
| Botão "ENVIAR" presente | Confirmado |
| Regressão nas 8 páginas via `curl` | HTTP 200 em todas |
| Responsividade (padding do `.contact-card` reduzido `<720px`) | Ajuste aplicado, revisão visual manual recomendada (sem navegador neste ambiente) |
| PIDs das portas 3210/8080/8088 | Inalterados |

### 12.9 Preservações confirmadas

Nenhuma alteração foi feita em: Site Oficial Atual, Cordex Privado
(`localhost:3210/unificada/`, mesmo PID do processo `node`), Atomicat,
DNS, domínio, PostgreSQL, Portão A, backups/checkpoints anteriores.
Nenhum deploy, publicação, commit ou push foi realizado. Cabeçalho,
"Minha área", identidade visual CorpoPleno, footer com e-mail real,
botão flutuante de WhatsApp (oculto sem número real) e responsividade
geral do site permanecem intactos — a mudança foi isolada ao corpo de
`atendimento.html` e à limpeza de código órfão correspondente.

## 13. Arquitetura de 5 idiomas/mercados + correção de bug (20/09/2026)

Checkpoint antes da alteração: `checkpoints/checkpoint_5_locales_20260920_223330/`.

### 13.1 Bug real corrigido (encontrado durante esta rodada)

Na rodada 11 (enxugamento da Home), as chaves `home.cta.title`, `home.cta.body`
e `home.cta.button` foram removidas do dicionário por parecerem órfãs —
mas `sobre.html` ainda usa essas chaves no seu CTA final (`.cta-final`),
que **não foi removido** naquela rodada (só o de `index.html` foi). Como
consequência, `sobre.html` estava exibindo o texto literal da chave
("home.cta.title") em vez do texto real, em qualquer idioma, desde a
rodada 11. As 3 chaves foram restauradas com o texto original (recuperado
do checkpoint da rodada 11) nos 4 idiomas já existentes, e traduzidas
também para pt-PT. Confirmado corrigido antes de prosseguir.

### 13.2 Novo locale: pt-PT (Portugal)

Adicionado como tradução própria, não como cópia de pt-BR. Adaptações
aplicadas (exemplos reais usados no dicionário):
- "Atendimento" → "Apoio" / "Apoio ao Cliente"
- "Minha área" → "A Minha Área"
- "Bônus" → "Bónus", "registro" → "registo", "planejamento" → "planeamento"
  (diferenças ortográficas AO90 comuns BR↔PT)
- "confiável" → "fiável", "liberado/liberação" → "disponibilizado/
  disponibilização", "matrícula" (curso) → "inscrição"
- Reestruturação de frases para remover o pronome "você" (natural em
  PT-BR, estranho em PT-PT), usando sujeito implícito ou "si"
  (ex.: "antes de chegar até você" → "antes de lhe chegar")
- "Contato" → "Contacto", "checkout" mantido (anglicismo comum a ambas
  as variantes)
- "Libras" (Língua Brasileira de Sinais) → "Língua Gestual" nos rótulos
  de interface do curso-bônus, já que "Libras" é uma sigla específica do
  Brasil

`SUPPORTED` em `assets/js/i18n.js` passou a
`["pt-BR", "pt-PT", "en-US", "ko-KR", "es-CL"]`. A detecção automática de
idioma do navegador (`detectBrowserLang`) foi corrigida: antes, qualquer
`pt-*` (incluindo `pt-PT`) caía em `pt-BR`; agora `pt-PT` é detectado
corretamente e só os demais `pt-*` caem em `pt-BR`.

O aviso de "tradução parcial" (`common.partial_notice`, mostrado em
Produtos/Cursos/Sobre/Atendimento/Termos/Privacidade/Minha área quando o
idioma não é pt-BR) também aparece para pt-PT — pelo mesmo motivo que já
aparece para en-US/ko-KR/es-CL: o texto jurídico/institucional longo
dessas páginas permanece em português do Brasil, só cabeçalhos e rótulos
de interface foram traduzidos para pt-PT nesta rodada. Isso é consistente
com o padrão já usado para os outros 3 idiomas, não um tratamento
diferente para Portugal.

### 13.3 Seletor de idioma (cabeçalho, 8 páginas)

Substituído para incluir as 5 opções, com o texto sugerido literalmente:
```
🇧🇷 Brasil — PT-BR
🇵🇹 Portugal — PT-PT
🇺🇸 Estados Unidos — EN-US
🇰🇷 대한민국 — KO-KR
🇨🇱 Chile — ES-CL
```
**Limitação técnica registrada**: o seletor é um `<select>` HTML nativo.
Navegadores nativos mostram o MESMO texto da opção selecionada tanto
fechado quanto na lista aberta — não é possível, com um `<select>`
nativo, mostrar "🇵🇹 PT-PT" fechado e "🇵🇹 Portugal — PT-PT" só quando
aberto (pedido da seção 9 do prompt), sem construir um componente de
menu personalizado (não nativo) do zero. Optei por manter o `<select>`
nativo — mais robusto, acessível por teclado e compatível com leitores
de tela e dispositivos móveis "de fábrica" — aceitando que o rótulo
fechado também mostra o nome do país (ex.: "🇵🇹 Portugal — PT-PT"), não
apenas a bandeira+locale compacto. Se a exibição compacta no estado
fechado for um requisito não negociável, um componente de menu
personalizado pode ser construído numa próxima rodada.

### 13.4 Persistência

Já era feita via `localStorage` (chave `cp_lang`) de forma global no
site — funciona automaticamente para pt-PT também, sem código adicional,
porque toda a lógica depende apenas do array `SUPPORTED`. Testado: alterar
para pt-PT e recarregar mantém pt-PT.

### 13.5 Estrutura monetária central (`assets/js/markets.js`, novo arquivo)

Criado um único arquivo, carregado em todas as páginas (entre `i18n.js`
e `main.js`), com a configuração central de mercado por idioma:

| Locale | market | currency | símbolo | rateFromBRL |
|---|---|---|---|---|
| pt-BR | BR | BRL | R$ | `1` (é a base) |
| pt-PT | PT | EUR | € | `null` (indisponível) |
| en-US | US | USD | US$ | `null` (indisponível) |
| ko-KR | KR | KRW | ₩ | `null` (indisponível) |
| es-CL | CL | CLP | $ | `null` (indisponível) |

Cada mercado também tem `displayCurrency`, `checkoutCurrency`,
`checkoutProvider` e `checkoutUrl` como campos **separados** (conforme
pedido) — hoje `checkoutCurrency`/`checkoutProvider`/`checkoutUrl` estão
`null` para todos os mercados exceto o provedor Kiwify já conhecido para
o Brasil (`checkoutUrl` continua `null`/pendente, como documentado desde
a revisão do catálogo de produtos).

**Regra de honestidade aplicada literalmente**: `rateFromBRL` só é um
número para o Brasil (`1`, porque BRL É a base). Para os outros 4
mercados, é `null` — a função `convertFromBRL(valorEmBRL, idioma)` só
calcula uma conversão quando existe uma taxa real cadastrada; caso
contrário, retorna `{ available: false, text: "Preço indisponível neste
mercado." }` (chave `common.price_unavailable`, traduzida nos 5 idiomas).
Nenhuma taxa de câmbio foi inventada ou escondida no código.

Hoje **nenhuma página exibe preço nenhum** (nenhum produto tem preço
aprovado — ver revisão do catálogo, seção 6), então a função de conversão
não é chamada visivelmente em lugar nenhum ainda. Ela fica pronta: quando
um preço-base em BRL existir, basta marcar o elemento com
`data-price-brl="100.00"` que `markets.js` formata automaticamente na
moeda do mercado ativo (ou mostra "indisponível"), inclusive ao trocar de
idioma sem recarregar a página (evento `corpopleno:lang-changed`,
disparado por `i18n.js` a cada troca de idioma).

### 13.6 Troca dinâmica sem reload

Confirmado: `setLang()` já atualizava o DOM sem recarregar a página
(mecanismo pré-existente). Foi adicionado um evento
`corpopleno:lang-changed` (disparado após cada troca) para que
`markets.js` (e outros módulos futuros) possam reagir — hoje isso só
serve para reformatar preços que ainda não existem, mas a arquitetura já
está pronta.

### 13.7 SEO/hreflang — não implementado agora, por decisão

A seção 11 do pedido explicitamente disse "preparar arquitetura... sem
publicar agora". Como o site atual é uma página HTML por idioma servida
do mesmo arquivo (idioma trocado via JavaScript/localStorage, não por
URL/rota), não existem hoje URLs distintas por locale — adicionar tags
`hreflang` reais exigiria ou (a) uma estrutura de pastas por idioma
(`/pt-pt/`, `/en-us/` etc.) ou (b) parâmetros de URL por idioma, nenhuma
das quais existe. Optei por **não** adicionar tags `hreflang` fictícias
apontando para URLs que não existem (isso seria inventar uma estrutura
que não está lá) — documentando aqui, em vez disso, a recomendação para
quando a URL de publicação final for definida:
1. Decidir entre subpastas (`/pt-pt/produtos.html`) ou subdomínios
   (`pt-pt.corpoplenoresultadoreal.com.br`) por mercado.
2. Adicionar `<link rel="alternate" hreflang="...">` para os 5 locales em
   cada página, apontando para a URL real de cada versão.
3. Manter uma versão `x-default` apontando para pt-BR (mercado principal).

Nenhuma URL foi alterada; o domínio oficial mencionado no pedido
(`https://www.corpoplenoresultadoreal.com.br`) não foi tocado — ele nem
está referenciado no código-fonte da oficina local (canonical
intencionalmente omitido, ver seção 2 deste relatório).

### 13.8 Não exposição de estratégia interna

Confirmado por busca: nenhuma das frases citadas como proibidas
("operamos cinco mercados", "arquitetura internacional", "funil
Portugal", "funil Chile", "5 mercados CorpoPleno") aparece em nenhum
arquivo do site. O único lugar onde a estrutura de mercados é descrita em
detalhe é este relatório e os comentários internos de `markets.js`
(nunca renderizados ao visitante).

### 13.9 Testes realizados

| Teste | Resultado |
|---|---|
| `node --check` em `i18n.js`, `main.js` e `markets.js` | OK |
| Balanceamento de tags HTML nas 8 páginas | OK, 0 erros |
| Paridade i18n 5 idiomas | OK, 127/127 |
| Simulação Node: `t()` retorna texto real (não a chave) para os 5 idiomas | OK, testado com `home.hero.title`, `nav.support`, `common.price_unavailable` |
| Detecção de idioma do navegador distingue pt-PT de pt-BR | OK (testado com array de exemplos) |
| Ausência de frases de estratégia interna proibidas | OK, 0 ocorrências |
| `rateFromBRL` só numérico para BRL (base); demais `null` | Confirmado |
| Regressão HTTP nas 8 páginas + `markets.js` | HTTP 200 em todas |
| PIDs das portas 3210/8080/8088 | Inalterados |
| **Teste visual real dos 5 locales em navegador (cabeçalho, Home, Produtos, Cursos, Sobre, Atendimento, Minha Área, rodapé)** | **Não realizável neste ambiente** — sem navegador/Chrome/Playwright disponível; validação feita por simulação de execução do JS via Node e inspeção estática do HTML/CSS. Recomenda-se teste manual em navegador antes de qualquer publicação, alternando entre os 5 idiomas em cada página. |

### 13.10 O que ainda depende de checkout/câmbio real

- Nenhum `checkoutUrl`/`checkoutProvider` existe para pt-PT, en-US,
  ko-KR ou es-CL — só Kiwify (Brasil) é conhecido, e mesmo esse ainda
  está com URL pendente (nenhum produto aprovado tem checkout ativo).
- Nenhuma cotação de câmbio real existe para EUR, USD, KRW ou CLP —
  `rateFromBRL` é `null` para os 4. Antes de exibir qualquer preço
  internacional, a proprietária precisa: (a) cadastrar uma taxa
  explícita em `markets.js`, ou (b) conectar um serviço real de câmbio.
- Nenhum produto tem preço-base em BRL cadastrado ainda em lugar nenhum
  do site — a funcionalidade de conversão está pronta, mas não tem o que
  converter até que a revisão de catálogo aprove um produto com preço.
- Validação de moeda real aceita por cada processador de pagamento
  (seção 6 do pedido) — não implementada, pois nenhum processador está
  conectado para os mercados internacionais ainda.

### 13.11 Preservações confirmadas

Nenhuma alteração foi feita em: Site Oficial Atual, Cordex Privado
(`localhost:3210/unificada/`, mesmo PID do processo `node`), Atomicat,
DNS, domínio, PostgreSQL, Portão A, backups/checkpoints anteriores.
Nenhum deploy, publicação, commit ou push foi realizado. O domínio oficial
final (`https://www.corpoplenoresultadoreal.com.br`, citado no pedido) não
foi referenciado nem alterado em nenhum arquivo.

## 14. Arquitetura do funil de vendas + Portugal ativo (20/09/2026)

Checkpoint antes da alteração: `checkpoints/checkpoint_funil_vendas_20260920_225227/`.

### 14.0 Escopo desta rodada

Esta rodada é só **preparação de arquitetura**: nenhum anúncio foi
publicado, nenhuma conta externa foi acessada, nenhuma senha/token foi
pedida ou gravada em código, nenhum deploy foi feito. Tudo roda apenas no
navegador do visitante, sem chamadas de rede para fora do site.

Também foi solicitado, no meio desta mesma rodada, ativar de verdade um
"funil inteligente" disparando anúncios reais em Meta/Google/TikTok/
YouTube. Isso foi recusado explicitamente na conversa: não há credenciais
nem ferramenta de integração com nenhuma dessas plataformas neste
ambiente, e mesmo que houvesse, não existe produto aprovado para
anunciar. Nenhuma tentativa de simular isso foi feita — é a mesma
disciplina de honestidade aplicada em toda a `checkout`, `mailto`,
`localStorage` e taxas de câmbio deste projeto.

### 14.1 Arquivos novos

- **`assets/js/funnel.js`** — captura de UTM, registro de eventos do
  funil (sem envio externo) e o registro `PRODUCTS` (produto × mercado).
- **`produto-modelo.html`** — template reutilizável de página de produto.
  Marcado com `<meta name="robots" content="noindex, nofollow">`, um
  aviso visível no topo ("MODELO INTERNO — NÃO É UM PRODUTO REAL") e não
  referenciado em nenhum menu, rodapé ou link do site (confirmado por
  busca: 0 ocorrências de "produto-modelo" nas 8 páginas públicas).

### 14.2 Arquivos alterados

- **`assets/js/markets.js`**: cada mercado ganhou o campo
  `checkoutEnabled` (booleano) — `true` só para `pt-BR` (Kiwify/BRL é o
  caminho já conhecido, ainda que a URL específica de cada produto esteja
  pendente); `false` para os outros 4, porque nenhum processador de
  pagamento foi validado para EUR/USD/KRW/CLP ainda. `checkoutCurrency`,
  `checkoutProvider` e `checkoutUrl` passaram a usar o texto `"PENDENTE"`
  (em vez de `null`) quando não configurados, seguindo o mesmo padrão já
  usado em todo o site (`KIWIFY_CHECKOUT_URL_PENDENTE`,
  `CORPOPLENO_WHATSAPP_PENDENTE`).
- **`assets/js/main.js`**: chama `CP_FUNNEL.captureUTMs()` no carregamento
  de qualquer página (evento `DOMContentLoaded`), e dispara
  `CP_FUNNEL.trackEvent("contact_support", {})` quando o botão ENVIAR do
  Atendimento é clicado — sem incluir o texto da mensagem nem nenhum dado
  pessoal no evento.
- **8 páginas HTML**: adicionada a tag `<script src="assets/js/funnel.js">`
  (entre `markets.js` e `main.js`).

### 14.3 Como um produto ganha uma landing page

1. Copiar `produto-modelo.html` para um novo arquivo (ex.:
   `produto-nome-real.html`).
2. Substituir todo o conteúdo entre colchetes (`[Nome do Produto]`, `[O
   que você recebe]` etc.) pelo conteúdo real e aprovado do produto —
   sem depoimentos, números de vendas ou avaliações inventados (nenhum
   desses elementos existe no modelo, de propósito).
3. Remover o aviso "MODELO INTERNO" e o atributo `noindex`.
4. Registrar o produto em `assets/js/funnel.js`, no objeto `PRODUCTS`,
   seguindo o formato de exemplo já comentado no arquivo — com preço real
   em BRL e, quando existir, `checkoutCurrency`/`checkoutProvider`/
   `checkoutUrl` reais por mercado.
5. Adicionar o link da nova página em `produtos.html` (ou `cursos.html`),
   substituindo o card de categoria vazia pela oferta real.
6. Só então o botão de compra passa a ficar habilitado — automaticamente,
   via `CP_FUNNEL.canCheckout()` — e só nos mercados com
   `checkoutEnabled: true` e checkout real cadastrado para aquele produto.

O template já vem com: nome, imagem, descrição curta, "para quem é", "o
que você recebe", benefícios, formato/acesso, suporte, preço (formatado
automaticamlente por mercado via `markets.js`), botão de compra
(desativado até existir checkout real), FAQ e um aviso de "informações
obrigatórias antes da compra" (carga horária, reembolso, certificação).

### 14.4 Como os 5 mercados são tratados

Preservados exatamente como já estavam (rodada 13): Brasil (pt-BR/BRL),
Portugal (pt-PT/EUR), Estados Unidos (en-US/USD), Coreia do Sul
(ko-KR/KRW) e Chile (es-CL/CLP). **Portugal está ativo** na oficina local
como mercado/idioma completo:
- Seletor 🇵🇹 PT-PT já disponível no cabeçalho de todas as páginas.
- Tradução completa PT-PT (127/127 chaves, adaptação cultural própria,
  não é pt-BR traduzido mecanicamente — ver seção 13.2).
- `market: "PT"`, `locale: "pt-PT"`, `displayCurrency: "EUR"`,
  `symbol: "€"` em `assets/js/markets.js`.
- Preço demonstrativo em EUR: pronto para funcionar assim que existir uma
  taxa real (`rateFromBRL`) ou um preço explícito cadastrado — hoje mostra
  "Preço indisponível neste mercado" (texto traduzido), nunca um valor
  calculado com taxa inventada.
- Páginas de produto (via `produto-modelo.html`), funil, captura de UTM e
  persistência de idioma/mercado durante a navegação (`localStorage`,
  chave `cp_lang`) já funcionam para pt-PT exatamente como para os outros
  4 idiomas — nenhuma lógica especial por idioma, tudo dirigido por
  configuração.
- **`checkoutEnabled: false` para Portugal, de propósito**: a cobrança em
  EUR ainda não foi validada com nenhum processador, nem a parte fiscal
  aplicável. `checkoutCurrency`, `checkoutProvider` e `checkoutUrl` de
  Portugal são todos `"PENDENTE"`. `CP_FUNNEL.canCheckout()` retorna
  `false` para qualquer produto em `pt-PT` até isso ser validado e
  cadastrado — testado (ver seção 14.7). Isso impede exatamente o cenário
  citado no pedido: nunca mostrar um preço em EUR e cobrar silenciosamente
  em outra moeda.

### 14.5 Estrutura de checkout (produto × mercado)

Schema oficial em `assets/js/funnel.js` (`PRODUCTS[id].markets[locale]`):
`price`, `checkoutCurrency`, `checkoutProvider`, `checkoutUrl` — combinado
com os campos de mercado em `markets.js` (`market`, `displayCurrency`,
`checkoutEnabled`). `CP_FUNNEL.getProductMarketConfig(productId, locale)`
junta os dois; `CP_FUNNEL.canCheckout(productId, locale)` é o único ponto
de decisão sobre liberar ou não o botão de compra, e exige **os dois**:
mercado habilitado E checkout do produto configurado de verdade (não
"PENDENTE"). Hoje o registro `PRODUCTS` está vazio — nenhum produto real
foi cadastrado, porque nenhum passou pela aprovação de catálogo ainda.

### 14.6 Estrutura de UTMs

`CP_FUNNEL.captureUTMs()` lê `utm_source`, `utm_medium`, `utm_campaign`,
`utm_content` e `utm_term` da URL (se presentes) e guarda em
`sessionStorage` (não `localStorage` — dura só enquanto a aba estiver
aberta), sem nenhum dado pessoal. Chamada automaticamente em toda página
via `main.js`. `CP_FUNNEL.buildCampaignUrl(url, utms)` monta uma URL de
campanha só com os parâmetros informados explicitamente — nunca inventa
`utm_source`/`utm_campaign` fictícios.

### 14.7 Eventos preparados

`CP_FUNNEL.trackEvent(nome, detalhe)` — nomes fixos: `view_product`,
`click_buy`, `begin_checkout`, `purchase`, `lead`, `contact_support`.
Cada chamada hoje só grava localmente (console + fila em memória),
**nenhuma chamada de rede é feita** (confirmado por busca: 0 ocorrências
de `fetch`/`XMLHttpRequest`/`sendBeacon` em `funnel.js`). O payload de
cada evento inclui `productId`, `market`, `locale`, `utm`, `value` e
`currency` — nunca CPF, telefone, e-mail ou senha (confirmado por busca).
`view_product` e `click_buy`/`begin_checkout` já estão conectados em
`produto-modelo.html`; `contact_support` já está conectado ao botão
ENVIAR de `atendimento.html`.

### 14.8 Testes realizados

| Teste | Resultado |
|---|---|
| `node --check` em `funnel.js`, `markets.js`, `main.js`, `i18n.js` | OK |
| Balanceamento de tags HTML nas 9 páginas (incluindo `produto-modelo.html`) | OK, 0 erros |
| Simulação Node: mercados, conversão de preço, `canCheckout`, UTM, `trackEvent` | OK — ver tabela abaixo |
| `produto-modelo.html` não referenciado em nenhum menu/rodapé real | Confirmado (0 ocorrências) |
| `produto-modelo.html` tem `noindex` | Confirmado |
| Eventos nunca incluem CPF/telefone/e-mail/senha | Confirmado (única ocorrência de "e-mail" é o comentário que documenta a proibição) |
| Nenhuma chamada de rede em `funnel.js` | Confirmado (0 ocorrências) |
| Regressão HTTP nas 9 páginas + `funnel.js`/`markets.js` | HTTP 200 em todas |
| PIDs das portas 3210/8080/8088 | Inalterados |

Resultado da simulação Node (preço-exemplo de R$ 100,00 convertido por mercado):

| Locale | market | checkoutEnabled | Preço exibido | canCheckout (produto inexistente) |
|---|---|---|---|---|
| pt-BR | BR | true | R$ 100,00 | false |
| pt-PT | PT | false | Preço indisponível neste mercado. | false |
| en-US | US | false | Price unavailable in this market. | false |
| ko-KR | KR | false | 이 시장에서는 가격을 이용할 수 없습니다. | false |
| es-CL | CL | false | Precio no disponible en este mercado. | false |

`canCheckout` retornou `false` para **todos** os mercados, incluindo o
Brasil — correto, porque nenhum produto real está cadastrado ainda em
`PRODUCTS`. Nenhuma compra real é possível em nenhum mercado hoje.

### 14.9 O que ainda depende de contas externas

- Nenhuma conta de anúncio (Meta Business, Google Ads, TikTok Ads,
  YouTube) foi criada ou acessada — isso exige que a proprietária crie e
  configure essas contas fora deste ambiente.
- Nenhum pixel de rastreamento (Meta Pixel, Google Tag/GA4, TikTok Pixel)
  está instalado — os eventos ficam só locais até que um desses seja
  conectado deliberadamente.
- Nenhum processador de pagamento além do Kiwify (Brasil, ainda com URL
  pendente) foi validado — Portugal/EUA/Coreia/Chile precisam de um
  processador que aceite EUR/USD/KRW/CLP antes de `checkoutEnabled` virar
  `true` para eles.
- A conexão com o Cordex (para a Central Master acompanhar
  produto/mercado/origem/campanha/cliques/checkout/venda/valor/moeda) foi
  propositalmente **não feita** nesta rodada, conforme pedido — os
  eventos ficam prontos no formato certo, mas isolados neste navegador.

### 14.10 Preservações confirmadas

Nenhuma alteração foi feita em: Site Oficial Atual, Cordex Privado
(`localhost:3210/unificada/`, mesmo PID do processo `node`), Atomicat,
DNS, domínio, PostgreSQL, Portão A, backups/checkpoints anteriores.
Nenhum deploy, publicação, commit ou push foi realizado. Nenhuma
credencial, senha ou token foi solicitado ou gravado em código.
