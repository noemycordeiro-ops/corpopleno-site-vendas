# Site Público CorpoPleno — Primeira Versão

Marca: **CorpoPleno**
Slogan: **Inteligente, resultado real**

Esta é a primeira versão pública do site institucional/comercial da CorpoPleno.
Foi construída como uma base limpa, leve (HTML + CSS + JavaScript puro, sem
frameworks pesados) e organizada para receber conteúdo real, o checkout
oficial e as traduções completas nas próximas etapas.

Este README documenta exatamente o que existe hoje, o que é placeholder e o
que ainda depende de trabalho humano/backend antes de ir para produção.

---

## 1. Estrutura do projeto

```
/
├── index.html            → Home
├── produtos.html         → Catálogo de produtos (por categoria)
├── cursos.html           → Catálogo de cursos (por categoria)
├── sobre.html            → O que é a CorpoPleno
├── atendimento.html      → Formulário único de atendimento
├── termos.html           → Termos de Uso (estrutural)
├── privacidade.html      → Política de Privacidade (estrutural)
├── minha-area.html       → Área do cliente (em configuração, sem login real)
├── produto-modelo.html   → MODELO INTERNO de página de produto (noindex, não
│                            linkado em nenhum menu — ver seção 13 abaixo)
├── checkpoints/          → Cópias de segurança feitas antes de cada rodada de edição
├── assets/
│   ├── css/style.css     → Design system único do site público
│   ├── js/i18n.js        → Motor de tradução local (5 idiomas/mercados)
│   ├── js/markets.js     → Configuração central de mercado/moeda por locale
│   ├── js/funnel.js      → Arquitetura do funil de vendas (UTM, eventos,
│   │                        registro produto × mercado) — ver seção 13
│   ├── js/main.js        → Menu mobile, filtros de categoria, ano do rodapé,
│   │                        WhatsApp flutuante, botão "Minha área", formulário
│   │                        único de Atendimento
│   ├── img/marca/        → Logo 3D oficial da CorpoPleno
│   ├── img/icones-recebidos/ → Ícones 3D fornecidos pela proprietária
│   └── img/hero-universo-corpopleno.png → Imagem de referência do Hero
├── admin-preview/        → Painel de demonstração LOCAL (não é público)
│   ├── index.html
│   └── assets/
│       ├── css/admin.css
│       └── js/
│           ├── dados-demo.js   → dados fictícios do painel
│           ├── charts.js       → gráficos em SVG puro (sem lib externa)
│           └── tabela.js       → planilha: ordenar/buscar/filtrar/exportar CSV
├── README.md              → este arquivo
└── RELATORIO_VALIDACAO.md → relatório de testes e pendências
```

## 2. Como abrir e testar

Não há build, não há dependências para instalar. Basta servir os arquivos
estaticamente. Duas formas simples:

```bash
# opção 1 — servidor embutido do Python (recomendado para testar localmente)
cd site_publico_corpopleno_master_20260919
python3 -m http.server 8080
# depois abra http://localhost:8080/ no navegador
```

```bash
# opção 2 — abrir index.html diretamente no navegador
# (funciona para navegação básica; alguns navegadores restringem
# fetch/localStorage em file://, então a opção 1 é mais confiável)
```

O painel de demonstração fica em `admin-preview/index.html` (ou
`http://localhost:8080/admin-preview/` com o servidor rodando). Ele **não**
está linkado em nenhum menu público — é preciso acessar a URL diretamente.

## 3. Páginas existentes

| Página | Arquivo | Status |
|---|---|---|
| Home | `index.html` | Enxugada (19/09/2026): Hero + O que é a CorpoPleno + Explore + Atendimento + FAQ (4 perguntas). Identidade visual CorpoPleno com logo 3D, ícones reais e hero fotográfico — ver `RELATORIO_VALIDACAO.md`, seção 11 |
| Produtos | `produtos.html` | Catálogo completo por categoria, tudo "Em preparação" |
| Cursos | `cursos.html` | Estrutura por categoria (idiomas/empresarial/técnicos/curtos), Libras como bônus não-independente, nenhum curso nomeado ainda |
| Sobre / O que é a CorpoPleno | `sobre.html` | Completa (sem revelar arquitetura interna) |
| Atendimento | `atendimento.html` | Formulário único ("Dúvida sobre o produto" + campo de texto + botão ENVIAR), sem categorias públicas de assunto; classificação (reclamação/cancelamento/reembolso/sugestão/cliente) é só interna; botão ENVIAR não abre e-mail/app externo e não salva nada em localStorage — ver `RELATORIO_VALIDACAO.md`, seção 12 |
| Termos de Uso | `termos.html` | Estrutural, com aviso de revisão jurídica pendente |
| Política de Privacidade | `privacidade.html` | Estrutural, com aviso de revisão jurídica pendente |
| Minha área | `minha-area.html` | Documentação do login futuro, sem autenticação real |
| Painel (demonstração local) | `admin-preview/index.html` | Funcional, dados 100% fictícios |

## 4. O que é placeholder (não é real ainda)

- **Checkout**: todos os botões de compra em `produtos.html` estão
  desativados (`aria-disabled="true"`) com o texto `KIWIFY_CHECKOUT_URL_PENDENTE`
  no atributo `title`. Nenhum link de checkout foi inventado.
- **E-mail**: já é real — `corpoplenoresultadoreal@gmail.com`, usado no rodapé
  de todas as páginas e no cartão de contato de `atendimento.html`, sempre
  como link `mailto:` (abre o aplicativo de e-mail do usuário; não é
  automação de envio).
- **WhatsApp**: ainda é placeholder. Internamente usa-se
  `CORPOPLENO_WHATSAPP_PENDENTE` (nenhum número real ou pessoal foi
  inventado). Ver seção 5.
- **Minha área / login**: ainda é placeholder — ver seção 6. Não existe
  autenticação real nem falsa; a página apenas documenta o fluxo futuro.
- **Produtos e cursos**: o catálogo público não lista produtos nem cursos
  específicos ainda — apenas as 7 categorias reais de produto e as 4
  categorias reais de curso (idiomas, empresarial, técnicos, cursos
  curtos), cada uma com o estado honesto "nenhum produto/curso aprovado
  para exibição pública ainda nesta categoria". Isso é intencional: uma
  revisão do catálogo e outra da página de cursos confirmaram que nenhum
  produto ou curso CorpoPleno está aprovado para exibição pública nesta
  fase (ver `RELATORIO_VALIDACAO.md`, seções 6 e 8). Em `cursos.html`,
  Libras aparece à parte, como **conteúdo bônus** (badge "Bônus") — não é
  vendida como curso independente; será liberada apenas para quem comprar
  um curso CorpoPleno elegível, com liberação/revogação controladas por
  registro real de compra no backend (nunca simuladas só no frontend).
- **Termos e Privacidade**: ambos trazem o aviso "Documento sujeito à
  revisão jurídica e atualização antes da operação definitiva."
- **Painel administrativo**: todos os números (visitantes, vendas,
  reembolsos, planilha) são fictícios e claramente identificados como
  "DADOS DEMONSTRATIVOS — NÃO SÃO VENDAS REAIS".

### Onde colocar os links Kiwify depois

Quando o checkout oficial existir, procure por `KIWIFY_CHECKOUT_URL_PENDENTE`
em `produtos.html` (um `title` por botão de compra) e substitua o botão
desativado por um link real (`<a class="btn btn-primary" href="URL_REAL">`).
O mesmo padrão vale para o placeholder de WhatsApp (`CORPOPLENO_WHATSAPP_PENDENTE`)
em `atendimento.html`, no rodapé e no botão flutuante — ver seção 5. O e-mail já
é real (`corpoplenoresultadoreal@gmail.com`) e não precisa dessa troca.

## 5. WhatsApp flutuante (configuração única)

Todas as páginas públicas (incluindo `minha-area.html`) têm um botão flutuante
de WhatsApp no canto inferior direito (`#cp-whatsapp-float`).

- **Configuração única**: o número e a mensagem inicial ficam só em
  `assets/js/main.js`, no objeto `CP_WHATSAPP` (topo do arquivo). Hoje
  `numero` é `null` (internamente equivalente a `CORPOPLENO_WHATSAPP_PENDENTE`)
  — nenhum número real, pessoal ou inventado foi usado.
- **Sem número configurado** (estado atual): o botão flutuante, o cartão de
  WhatsApp em `atendimento.html` e a linha de WhatsApp do rodapé mostram
  claramente "em configuração"; clicar no botão flutuante mostra um aviso
  (toast) explicando isso, sem abrir nenhum link.
- **Quando o número for definido**: basta preencher `CP_WHATSAPP.numero`
  (formato E.164 sem símbolos, ex.: `"5511999999999"`) em `main.js`. A
  função `setupWhatsappFloat()` já está pronta para, a partir desse único
  valor, atualizar automaticamente: o clique do botão flutuante (abre
  `wa.me` com a mensagem inicial já preenchida), o cartão de WhatsApp em
  Atendimento (`data-whatsapp-display` / `data-whatsapp-badge`) e a linha
  de WhatsApp do rodapé de todas as páginas (`data-whatsapp-status`).
- **Mensagem inicial preparada**: "Olá! Vim pelo site da CorpoPleno e
  gostaria de atendimento." — também em `CP_WHATSAPP.mensagemInicial`.
- Não é WhatsApp Cloud API (não há envio automático, integração Meta ou
  token) — é apenas um link `wa.me`, que abre o WhatsApp do próprio
  visitante com a mensagem pronta.

## 6. Minha área (login futuro)

Botão discreto no cabeçalho de todas as páginas públicas (`#cp-minha-area`),
que leva a `minha-area.html`.

- Não existe autenticação real nem falsa. A página apenas documenta o fluxo
  planejado: `Site público → Backend seguro / Portão A → Autenticação →
  Área do cliente → Produtos adquiridos`.
- Contrato de login já documentado na própria página (não implementado):
  e-mail + senha, "Esqueci minha senha", 2FA quando exigido, e manutenção
  de sessão conforme política de segurança a ser definida junto ao backend.
- Nenhuma senha é solicitada ou armazenada em HTML/`localStorage`, e o
  frontend nunca se conecta diretamente ao PostgreSQL — isso é declarado
  explicitamente na própria página.
- `localhost:3210` (Cordex privado) **nunca** é referenciado ou exposto
  nesta página nem em nenhum lugar do site público.

## 7. Como funciona o seletor de idioma / mercado

O site foi normalizado para **5 idiomas/mercados** (atualizado em
20/09/2026): **PT-BR — Brasil** (idioma inicial e fonte autoritativa),
**PT-PT — Portugal**, **EN-US — Estados Unidos**, **KO-KR — Coreia do Sul**
e **ES-CL — Chile**.

- O seletor (`<select id="cp-lang-select">`) aparece no cabeçalho de toda
  página pública, com as 5 opções (bandeira + país + locale).
- A lógica de idioma fica em `assets/js/i18n.js`: um dicionário local por
  idioma (`dict["pt-BR"]`, `dict["pt-PT"]`, `dict["en-US"]`,
  `dict["ko-KR"]`, `dict["es-CL"]`), sem qualquer tradução automática
  externa (nenhuma chamada de API).
- A lógica de **mercado/moeda** é separada, em `assets/js/markets.js`
  (novo, 20/09/2026): mapeia cada locale a `market`, `currency`, `symbol`,
  `displayCurrency`, `checkoutCurrency`, `checkoutProvider`, `checkoutUrl`
  e `rateFromBRL`. BRL (Brasil) é sempre o valor de referência dos
  produtos; os demais mercados só convertem quando existir uma taxa real
  cadastrada (`rateFromBRL` numérico) — enquanto isso, o preço aparece
  como indisponível. Nenhuma taxa de câmbio é inventada em lugar nenhum
  do código.
- Elementos marcados com `data-i18n="chave"` recebem o texto traduzido via
  `textContent`; `data-i18n-placeholder` e `data-i18n-aria-label` cobrem
  atributos. Um preço futuro marcado com `data-price-brl="100.00"` seria
  formatado automaticamente por `markets.js` na moeda do mercado ativo.
- A preferência de idioma é salva em `localStorage` (`cp_lang`) — apenas a
  sigla do idioma, nunca dado sensível — e vale para toda a navegação no
  site (Home, Produtos, Cursos, Sobre, Atendimento, Minha área, rodapé).
  Se não houver preferência salva, o idioma do navegador é detectado
  (`pt-PT` é distinguido corretamente de `pt-BR`); caso não haja
  correspondência, o padrão é PT-BR.
- A troca de idioma é dinâmica (sem recarregar a página) e dispara o
  evento `corpopleno:lang-changed`, que `markets.js` escuta para
  reformatar preços quando existirem.
- **Cobertura desta versão**: navegação, rodapé, textos de interface
  (botões, badges, avisos) e a página Home estão 100% traduzidos nos 5
  idiomas (127 chaves, com paridade total confirmada por script de
  validação). Nas páginas internas mais longas (Produtos, Cursos, Sobre,
  Atendimento, Termos, Privacidade), cabeçalhos e rótulos já são
  traduzidos nos 5 idiomas, mas a prosa detalhada permanece em PT-BR
  nesta primeira versão — quando isso acontece, um aviso visível
  (`#cp-partial-translation-notice`) é mostrado automaticamente,
  traduzido, avisando que a tradução completa daquele conteúdo está em
  preparação (isso vale igualmente para PT-PT, já que o texto jurídico
  longo ainda não foi adaptado ao português europeu, só a interface).
- **Limitação conhecida do seletor**: é um `<select>` HTML nativo, então
  o rótulo mostrado fechado é o mesmo mostrado na lista aberta (ex.:
  "🇵🇹 Portugal — PT-PT" nos dois estados) — um `<select>` nativo não
  permite dois textos diferentes para o mesmo item. Um componente de
  menu personalizado resolveria isso, mas perderia parte da robustez de
  acessibilidade/teclado/mobile de um `<select>` nativo.
- **Próximo passo real**: preencher as chaves de prosa detalhada de cada
  página interna no mesmo arquivo `assets/js/i18n.js`, revisadas por um
  falante nativo de cada idioma antes da operação definitiva (recomendado
  especialmente para KO-KR e PT-PT, dado que a adaptação de PT-PT feita
  aqui cobriu apenas interface/textos curtos, não o conteúdo jurídico
  extenso de Termos/Privacidade).

## 8. Como funciona o CSV (planilha do admin-preview)

Na aba de planilha do painel (`admin-preview/index.html`):

- **Ordenar**: clique em qualquer cabeçalho de coluna (produto, data,
  categoria, quantidade, preço, receita, reembolso, status).
- **Pesquisar**: campo de busca filtra por nome de produto ou categoria.
- **Filtrar**: dois `<select>` filtram por categoria e por status.
- **Exportar CSV**: gera um arquivo `.csv` com:
  - **BOM UTF-8** no início do arquivo, para acentuação correta no Excel;
  - separador `;` (ponto e vírgula) — escolhido porque os valores numéricos
    usam vírgula como separador decimal (padrão brasileiro), e usar `,` como
    delimitador causaria ambiguidade na leitura pelo Excel/LibreOffice em
    configuração regional pt-BR;
  - escaping correto de aspas e campos que contenham `;`, `"` ou quebras de
    linha.
- Testado manualmente (fora do navegador, via Node.js) gerando uma amostra
  do CSV e confirmando BOM presente e formatação numérica correta — ver
  `RELATORIO_VALIDACAO.md`.

## 9. Como funcionam os gráficos

Todos os gráficos do `admin-preview` (`admin-preview/assets/js/charts.js`)
são gerados em **SVG puro via JavaScript nativo**, sem nenhuma biblioteca
externa e sem dependência de internet. Isso foi uma escolha deliberada para:

- manter o painel leve, compatível com o item 15 do prompt master
  (evitar dependências pesadas e não sobrecarregar o notebook);
- evitar carregar uma lib de terceiros só para 5 gráficos simples
  (barra, linha e funil horizontal cobrem todos os casos pedidos:
  vendas, visitas, conversão, produtos, entradas e reembolsos).

Não havendo dependência externa, não há necessidade de justificativa
adicional de licença/CDN — o código de renderização está totalmente em
`charts.js` e pode ser lido, revisado e substituído por uma biblioteca real
no futuro, se necessário.

## 10. Quais partes ainda exigem backend / Portão A

- **Checkout real**: precisa do link Kiwify oficial por produto.
- **WhatsApp real**: falta o número comercial oficial da CorpoPleno.
  Configurável em um único ponto quando existir (ver seção 5). O e-mail já
  está configurado e ativo (monitorado por Patrícia, seg-sex 9h-17h).
- **Login / Minha área**: autenticação real (e-mail+senha, recuperação,
  2FA) precisa do backend/Portão A — hoje é só documentação (ver seção 6).
- **URL de publicação da nova oficina**: `canonical`/`og:url` foram
  deixados intencionalmente sem valor (ver comentários no `<head>` de cada
  página) porque `corpoplenoresultadoreal.com.br` já está vinculado a outra
  estrutura (Atomicat/legado) e não deve ser usado até uma migração
  controlada e aprovada.
- **Autenticação do `admin-preview`**: esta área, hoje, é 100% estática e
  sem qualquer controle de acesso — está correta para uma demonstração
  local, mas **antes de qualquer uso em produção, precisa ser protegida por
  autenticação real no backend/Portão A**. Isso está documentado também
  dentro da própria página do painel e na Política de Privacidade.
- **Dados reais do funil**: os números do painel hoje são gerados por
  `dados-demo.js`. Para virar produção, esse módulo precisa ser substituído
  por uma chamada real a uma API autenticada (nunca uma conexão direta do
  navegador ao PostgreSQL).
- **Revisão jurídica**: Termos de Uso e Política de Privacidade precisam de
  revisão jurídica formal antes da operação definitiva (aviso já presente
  nas próprias páginas).
- **Tradução completa**: conforme item 5 acima, a prosa detalhada das
  páginas internas ainda precisa de tradução humana revisada para EN-US,
  KO-KR e ES-CL.
- **Imagens/fotografia própria**: esta versão usa apenas CSS (gradientes,
  cores, sombras) e emojis como elementos visuais, para manter o site leve
  sem depender de banco de imagens. Fotografia/ilustração de marca própria
  pode ser adicionada depois em `assets/images/`.

## 11. Segurança — o que foi aplicado

- Nenhuma senha, token ou chave de API no frontend.
- Nenhuma conexão direta do navegador com PostgreSQL.
- Nenhum dado sensível em `localStorage` (apenas a preferência de idioma).
- `minha-area.html` não implementa login falso: é só documentação do fluxo
  futuro, sem formulário de senha nem simulação de autenticação.
- Botão de WhatsApp flutuante nunca abre um número inexistente ou pessoal;
  sem número configurado, apenas mostra um aviso (toast).
- **Bloqueio de seleção/cópia (obstáculo, não segurança real)**: o conteúdo
  dentro de `<main>` tem seleção de texto, menu de botão direito, copiar,
  recortar e arrastar desativados via CSS (`user-select: none`) e JavaScript
  (`setupNoCopyMain()` em `main.js`). **Isto NÃO impede**: ver o código-fonte
  da página, desativar JavaScript, usar as ferramentas de desenvolvedor do
  navegador, nem — é tecnicamente impossível para qualquer site — capturas
  de tela. É só um obstáculo contra cópia casual de texto, não uma proteção
  de verdade. O rodapé (com e-mail/WhatsApp de contato) fica **fora** desse
  bloqueio de propósito, e qualquer elemento marcado com a classe
  `allow-select` (usada no e-mail/WhatsApp dentro do conteúdo, ex.:
  `atendimento.html` e `minha-area.html`) continua selecionável e copiável
  normalmente, para não impedir o visitante de copiar o contato.
- `rel="noopener noreferrer"` não foi necessário nesta versão porque não há
  links `target="_blank"` para domínios externos ainda (será adicionado
  junto com o link real do Kiwify e redes sociais, quando existirem).
- Todo conteúdo dinâmico inserido via JavaScript no `admin-preview`
  (nomes de produto/categoria/status da planilha demonstrativa) passa por
  uma função de escaping de HTML (`escapeHtml`) antes de ser inserido no
  DOM, prevenindo injeção mesmo que os dados de demonstração mudem no
  futuro.
- `admin-preview/index.html` está marcado com
  `<meta name="robots" content="noindex, nofollow" />` e as páginas legais
  com `noindex`, para não serem indexadas por buscadores antes da revisão
  final.

## 12. Checklist antes da produção

- [ ] Conectar link(s) real(is) de checkout Kiwify em `produtos.html`.
- [x] Configurar e-mail real em `atendimento.html` e no rodapé (concluído —
      `corpoplenoresultadoreal@gmail.com`).
- [ ] Configurar número real de WhatsApp em `CP_WHATSAPP.numero`
      (`assets/js/main.js`) quando existir.
- [ ] Conectar autenticação real (Portão A) para "Minha área".
- [ ] Definir a URL de publicação final da nova oficina e só então preencher
      `canonical`/`og:url` (nunca usar `corpoplenoresultadoreal.com.br`
      enquanto ele hospedar outra estrutura).
- [ ] Revisão jurídica de `termos.html` e `privacidade.html`.
- [ ] Publicar produtos reais no catálogo somente após aprovação formal
      (ver `RELATORIO_VALIDACAO.md`, seção sobre a revisão do catálogo).
- [ ] Publicar cursos reais em `cursos.html` somente após aprovação formal,
      com nome, carga horária, conteúdo e certificação definidos por curso
      (ver `RELATORIO_VALIDACAO.md`, seção 8).
- [ ] Implementar backend real de elegibilidade/liberação de Libras como
      bônus (vinculado a registro de compra e a possível revogação por
      reembolso) antes de tornar o card de Libras interativo.
- [ ] Conectar `atendimento.html` à Central Master de Atendimento real
      (backend seguro → agente/supervisor apropriado). Hoje, os botões dos
      painéis de "Já sou cliente", "Reclamação" e "Cancelamento/Reembolso"
      apenas abrem um e-mail real com o que foi digitado — nenhuma busca,
      protocolo ou validação acontece de fato (ver `RELATORIO_VALIDACAO.md`,
      seção 10).
- [ ] Implementar a geração real de protocolo e a regra da janela de 2 horas
      de intervenção humana após reclamação registrada (regra já definida
      pela proprietária, documentada em `RELATORIO_VALIDACAO.md` seção
      10.4, mas intencionalmente não exposta na página pública).
- [ ] Implementar a validação real de compra para cancelamento/reembolso
      (e-mail+telefone não são autenticação suficiente para ação financeira).
- [ ] Quando o atendimento IA e a moderação de linguagem forem conectados
      de verdade, decidir se/como comunicar isso na página pública — hoje
      essas regras existem apenas como documentação interna (seção 10.4).
- [ ] Quando o número real de WhatsApp existir, o botão flutuante volta a
      aparecer automaticamente (hoje fica oculto — `assets/js/main.js`,
      `setupWhatsappFloat`).
- [ ] Traduzir a prosa detalhada das páginas internas para EN-US, KO-KR e
      ES-CL (revisão humana nativa recomendada, especialmente para KO-KR).
- [ ] Proteger `admin-preview/` com autenticação real via backend/Portão A
      antes de expor qualquer versão publicamente acessível dele.
- [ ] Substituir `dados-demo.js` por integração real com dados de vendas
      (quando existirem), nunca por conexão direta do navegador ao banco.
- [ ] Revisar `sobre.html` com qualquer atualização de propósito/metodologia
      que a equipe decida tornar pública.
- [ ] Adicionar imagens/fotografia de marca própria, se desejado.
- [ ] Rodar novamente os testes descritos em `RELATORIO_VALIDACAO.md` após
      qualquer alteração de conteúdo.
- [ ] Comprimir `assets/img/hero-universo-corpopleno.png` (~2,3 MB) e os
      ícones em `assets/img/icones-recebidos/` (~1,3–1,8 MB cada) antes de
      qualquer publicação real — nenhuma ferramenta de compressão de
      imagem está disponível neste ambiente de trabalho.
- [ ] Propagar o sistema visual (ícones reais, cards glossy, logo 3D) para
      `produtos.html`, `cursos.html` e `atendimento.html` — aplicado por
      enquanto só na Home, conforme pedido. Ícones já recebidos e
      reservados: `gmail.png` (atendimento), `idiomas.png` e `libras.png`
      (cursos), `calculadora-bem-estar.png` (produtos — mini apps).
- [ ] Resolver a limitação do logo multilíngue: `logo-corpopleno-3d.png`
      tem o slogan desenhado em português nos próprios pixels; ao trocar
      de idioma, só o texto para leitor de tela muda, não a imagem (ver
      `RELATORIO_VALIDACAO.md`, seção 11.6).
- [ ] Testar visualmente em navegador real (Chrome/Firefox) antes de
      publicar — este ambiente não tem navegador headless disponível para
      capturar screenshots ou testar interações reais.
- [ ] Conectar o botão "ENVIAR" de `atendimento.html` a um backend seguro
      real (Central Master de Atendimento). Hoje ele só mostra um aviso
      honesto de que o canal está sendo preparado — nenhuma mensagem é
      enviada, salva ou classificada de fato ainda (ver
      `RELATORIO_VALIDACAO.md`, seção 12).
- [ ] Implementar, no backend, a classificação automática de mensagens
      (reclamação/cancelamento/reembolso/sugestão/suporte) documentada em
      `RELATORIO_VALIDACAO.md` seção 12.4 — hoje é só especificação, sem
      lógica funcional.
- [ ] Cadastrar uma taxa de câmbio real (`rateFromBRL`) em
      `assets/js/markets.js` para PT-PT/EN-US/KO-KR/ES-CL, ou conectar um
      serviço real de cotação — hoje os 4 mercados internacionais mostram
      preço como indisponível (nenhuma taxa foi inventada).
- [ ] Validar, mercado por mercado, qual processador de pagamento real
      aceita cada moeda antes de ativar qualquer checkout internacional
      (`checkoutProvider`/`checkoutUrl` em `assets/js/markets.js` estão
      `"PENDENTE"` para todos, exceto Kiwify/Brasil, cuja URL específica
      por produto também está pendente).
- [ ] Traduzir o conteúdo jurídico extenso de `termos.html` e
      `privacidade.html` para PT-PT (hoje só cabeçalhos/rótulos estão em
      português europeu; a prosa legal permanece em PT-BR com aviso).
- [ ] Decidir a estratégia de URL por mercado (subpasta ou subdomínio) e
      só então adicionar tags `hreflang` reais — ver
      `RELATORIO_VALIDACAO.md`, seção 13.7.
- [ ] Quando o primeiro produto for aprovado: copiar `produto-modelo.html`,
      preencher com conteúdo real e cadastrar em `assets/js/funnel.js`
      (objeto `PRODUCTS`) — ver seção 13 abaixo e
      `RELATORIO_VALIDACAO.md`, seção 14.3.
- [ ] Validar processador de pagamento e parte fiscal para EUR (Portugal)
      antes de mudar `checkoutEnabled` para `true` em `assets/js/markets.js`
      — hoje é `false` de propósito.
- [ ] Conectar um pixel de rastreamento real (Meta/Google/TikTok) e/ou o
      Cordex à função `sendEvent()` em `assets/js/funnel.js` quando
      decidido — hoje os eventos do funil ficam só neste navegador.

## 13. Funil de vendas (arquitetura pronta, nada publicado)

Preparado em 20/09/2026 (ver `RELATORIO_VALIDACAO.md`, seção 14) para que
um anúncio futuro possa apontar direto para um produto, com preço e
checkout corretos por mercado — sem reconstruir o site e sem publicar
nada agora.

- **`assets/js/markets.js`**: cada mercado (pt-BR/pt-PT/en-US/ko-KR/es-CL)
  tem `checkoutEnabled` (só `true` para o Brasil hoje), `checkoutCurrency`,
  `checkoutProvider` e `checkoutUrl` — usando `"PENDENTE"` como
  placeholder honesto quando não configurado (mesmo padrão de
  `KIWIFY_CHECKOUT_URL_PENDENTE`).
- **`assets/js/funnel.js`**: captura UTM da URL (`utm_source`, `utm_medium`,
  `utm_campaign`, `utm_content`, `utm_term`) em `sessionStorage`; registra
  eventos (`view_product`, `click_buy`, `begin_checkout`, `purchase`,
  `lead`, `contact_support`) só localmente, sem nenhuma chamada de rede;
  mantém o registro `PRODUCTS` (vazio hoje) com o schema produto × mercado.
- **`produto-modelo.html`**: template de página de produto, marcado como
  modelo interno (`noindex`, aviso visível), não linkado em nenhum menu.
  Copiar e preencher quando um produto real for aprovado.
- `CP_FUNNEL.canCheckout(productId, locale)` é o único lugar que decide se
  o botão de compra fica ativo — exige mercado habilitado E checkout real
  cadastrado para aquele produto. Hoje retorna `false` para todo mundo,
  em todo mercado, porque nenhum produto está cadastrado.
- Nenhuma conta de anúncio, pixel de rastreamento ou processador de
  pagamento internacional foi criado, acessado ou conectado — isso
  depende inteiramente de ações da proprietária fora deste ambiente.
