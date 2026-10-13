# PROMPT MASTER — SITE PÚBLICO CORPOPLENO

Você é o Arquiteto Master responsável por construir uma primeira versão profissional,
funcional, leve, segura e organizada do site público CorpoPleno.

## 1. LIMITE ABSOLUTO DE SEGURANÇA

VOCÊ SÓ PODE CRIAR OU MODIFICAR ARQUIVOS DENTRO DA PASTA ATUAL.

NÃO acessar, modificar, apagar, copiar, mover ou reescrever nada fora desta pasta.

PROIBIDO tocar em:
- Cordex Especial CorpoPleno
- Terminal Especial
- Terminal Original
- PostgreSQL real
- Portão A
- Revisão 06 ou Revisão 07
- migrations
- backups CorpoPleno
- credenciais
- tokens
- chaves de API
- arquivos .env de outros projetos
- dados reais de clientes
- dados bancários
- outros projetos CorpoPleno

Antes de qualquer operação destrutiva, PARE.

Não execute deploy.
Não faça git push.
Não faça commit.
Não publique nada na internet.

## 2. OBJETIVO

Construir uma NOVA BASE LIMPA para o site público CorpoPleno.

Marca:
CorpoPleno

Slogan:
INTELIGENTE, RESULTADO REAL

O site deve parecer uma empresa profissional, moderna, acolhedora, organizada
e tecnologicamente avançada.

Não é um protótipo feio.
Não usar visual escuro.

## 3. IDENTIDADE VISUAL

Interface clara.

Visual:
- alegre
- profissional
- sofisticado
- colorido
- arco-íris usado com equilíbrio
- responsivo

Paleta conceitual:
- rosa vibrante: ofertas
- laranja: promoções
- amarelo: atenção
- verde: saúde
- turquesa: tecnologia/IA
- azul: confiança/cursos
- roxo: Master
- rosa-claro: fundos

Criar design consistente com:
- cartões
- ícones
- microanimações leves
- sombras suaves
- cantos arredondados
- bastante espaço visual
- ótima leitura em celular

## 4. ARQUITETURA

Priorizar:
HTML + CSS + JavaScript leve.

Evitar frameworks pesados se não forem necessários.

Estrutura organizada, por exemplo:

/
  index.html
  produtos.html
  cursos.html
  sobre.html
  atendimento.html
  termos.html
  privacidade.html
  assets/
    css/
    js/
    images/
  admin-preview/
  README.md

Pode melhorar a estrutura se houver justificativa.

## 5. PÁGINAS PÚBLICAS

Criar pelo menos:

### HOME

Hero profissional contendo:

CorpoPleno

INTELIGENTE, RESULTADO REAL

Apresentação curta da proposta.

Seções:
- Conheça a CorpoPleno
- Produtos
- Cursos
- Materiais digitais
- Soluções interativas
- Atendimento CorpoPleno
- Destaques
- Perguntas frequentes
- chamada para ação

Não inventar números de clientes, faturamento ou resultados.

### O QUE É A CORPOPLENO

Explicar:
- propósito
- metodologia
- compromisso com qualidade
- educação
- tecnologia
- organização
- revisão de conteúdo

NÃO revelar:
- 62 agentes internos
- Cordex
- arquitetura privada
- prompts internos
- ferramentas confidenciais

### PRODUTOS

Criar catálogo modular.

Categorias preparadas para:
- eBooks
- livros
- mini apps
- autocuidado
- CorpoPleno Natural
- materiais capilares
- nutrição
- futuros produtos

Itens ainda não lançados devem aparecer como:
"Em preparação"

Não apresentar como disponível algo que não estiver pronto.

### CURSOS

Área preparada para cursos CorpoPleno.

Categorias:
- idiomas
- empresarial
- técnicos
- cursos curtos
- Libras como bônus quando aplicável

Nunca inventar certificações profissionais.

### ATENDIMENTO

Apresentar:
- Equipe CorpoPleno
- e-mail
- WhatsApp
- suporte por produto

Usar placeholders claros enquanto os canais reais não forem configurados.

Não expor agentes internos.

## 6. QUATRO IDIOMAS

Preparar estrutura para:

- PT-BR
- EN-US
- KO-KR
- ES-CL

Português brasileiro é o idioma inicial.

Criar seletor visual de idioma.

Não utilizar tradução automática externa nesta primeira versão.

Organizar o código para permitir traduções locais posteriormente.

## 7. FUNIL DE VENDAS

Construir um funil profissional no site.

Fluxo:

Visitante
→ descoberta
→ interesse
→ página do produto
→ oferta
→ checkout Kiwify
→ confirmação/pós-compra

Criar componentes para:
- CTA
- produto em destaque
- benefícios
- FAQ
- oferta
- aviso de garantia quando aplicável
- botão de checkout

IMPORTANTE:

Nenhum link de checkout deve ser inventado.

Utilizar placeholders explícitos como:

KIWIFY_CHECKOUT_URL_PENDENTE

Nunca simular venda real.

## 8. PAINEL DE FUNIL — APENAS PREVIEW LOCAL

Criar uma área:

admin-preview/

Ela NÃO deve aparecer no menu público.

Esta área será somente uma demonstração local por enquanto.

Criar visual de funil com:
- visitantes
- interessados
- checkout
- vendas
- reembolsos

TODOS os dados devem ser identificados claramente:

"DADOS DEMONSTRATIVOS — NÃO SÃO VENDAS REAIS"

Nunca inventar faturamento real.

## 9. GRÁFICOS

Na área admin-preview criar gráficos leves para:

- vendas
- visitas
- conversão
- produtos
- entradas
- reembolsos

Preferir JavaScript/CSS leve.

Se usar biblioteca externa, justificar no README.

Não fazer dependência obrigatória de internet se puder evitar.

Dados inicialmente demonstrativos.

## 10. PLANILHAS / EXCEL

Criar módulo local de tabela profissional com:

- produto
- data
- categoria
- quantidade
- preço
- receita
- reembolso
- status

Permitir:

- ordenar
- pesquisar
- filtrar
- exportar CSV

O CSV deve abrir corretamente no:
- Excel
- LibreOffice Calc

Não usar dados bancários reais.

## 11. SEGURANÇA

Nenhuma senha no frontend.

Nenhum token no frontend.

Nenhuma chave de API.

Nenhuma conexão direta do navegador com PostgreSQL.

Nenhum dado sensível em localStorage.

Não implementar falsa autenticação que pareça segura.

A área admin-preview é somente demonstrativa/local.

Adicionar comentário/documentação dizendo:

ANTES DE PRODUÇÃO, ÁREAS ADMINISTRATIVAS DEVEM SER PROTEGIDAS PELO BACKEND/PORTÃO A.

Aplicar:
- escaping adequado
- validação de formulários
- links seguros
- rel="noopener noreferrer" quando necessário
- CSP razoável se compatível
- proteção básica contra injeção no conteúdo gerado pela própria interface

## 12. PRIVACIDADE E TERMOS

Criar páginas estruturais:

- Termos de Uso
- Política de Privacidade

Usar redação prudente e placeholders onde informações jurídicas definitivas
ainda precisarem de revisão.

Não inventar registro, licença ou certificação.

Incluir indicação:

"Documento sujeito à revisão jurídica e atualização antes da operação definitiva."

## 13. ACESSIBILIDADE

Implementar:
- HTML semântico
- labels
- aria quando necessário
- contraste adequado
- navegação por teclado
- foco visível
- textos alternativos
- responsividade

## 14. SEO

Adicionar:
- title adequado
- meta description
- Open Graph básico
- estrutura de headings
- canonical preparado para:
  https://corpoplenoresultadoreal.com.br/

Não inventar avaliações ou estrelas.

## 15. DESEMPENHO

Site deve ser leve.

Evitar:
- dependências enormes
- Java
- modelos IA locais
- processos pesados
- renderizações que sobrecarreguem o notebook

O notebook deve conseguir testar o site confortavelmente.

## 16. README

Criar README.md explicando:

- estrutura do projeto
- como abrir/testar
- quais páginas existem
- quais itens são placeholders
- onde colocar links Kiwify depois
- como funciona o seletor de idioma
- como funciona CSV
- como funcionam gráficos
- quais partes ainda exigem backend
- checklist antes da produção

## 17. TESTES

Antes de declarar concluído:

1. verificar links internos
2. verificar HTML
3. verificar erros JavaScript
4. testar navegação
5. testar mobile
6. testar exportação CSV
7. testar seletor de idioma
8. verificar que admin-preview não aparece na navegação pública
9. procurar por possíveis segredos
10. verificar que não houve alteração fora desta pasta

Criar arquivo:

RELATORIO_VALIDACAO.md

com:
- o que foi criado
- o que foi testado
- erros encontrados
- correções realizadas
- pendências reais

## 18. REGRA DE HONESTIDADE

Nunca afirmar que:
- checkout funciona se não houver URL real
- pagamentos estão conectados se não estiverem
- vendas são reais se forem demonstração
- WhatsApp está conectado se não estiver
- e-mail está conectado se não estiver
- segurança de produção está pronta se ainda depender do Portão A

Use placeholders claramente identificados.

## 19. RESULTADO ESPERADO

Entregar dentro desta pasta uma primeira versão grande e funcional do
SITE PÚBLICO CORPOPLENO, pronta para revisão humana.

Não parar apenas no planejamento.

Depois de analisar a tarefa:
1. crie os arquivos
2. implemente o site
3. teste localmente
4. corrija erros encontrados
5. gere README.md
6. gere RELATORIO_VALIDACAO.md
7. apresente resumo final

Não saia desta pasta.
