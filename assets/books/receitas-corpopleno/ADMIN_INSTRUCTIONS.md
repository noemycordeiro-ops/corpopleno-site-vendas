# Livro de Receitas CorpoPleno — Instruções de Atualização

## 📋 Para Adicionar Novas Receitas

### 1. Localizar Arquivo de Conteúdo
Os conteúdos em 5 idiomas estão em:
```
/home/noemi/CorpoPleno-IA/workspace/cordex_unificado_preparacao_20260915/unificado/private_content/books/receitas-corpopleno/
```

Idiomas disponíveis:
- `pt-BR/pages.json` — Português (Brasil) — PRINCIPAL
- `en-US/pages.json` — Inglês (EUA)
- `pt-PT/pages.json` — Português (Portugal)
- `es-CL/pages.json` — Espanhol (Chile) — PENDENTE
- `ko-KR/pages.json` — Coreano — PENDENTE

### 2. Estrutura de Página (pages.json)

Cada arquivo contém:
```json
{
  "pages": [
    {
      "id": "receita-1",
      "title": "Nome da Receita",
      "category": "Categoria",
      "ingredients": [...],
      "instructions": [...],
      "serves": 4,
      "prepTime": "30 min",
      "cookTime": "20 min"
    }
  ]
}
```

### 3. Processo de Atualização

1. **Editar arquivo JSON** (pt-BR é a fonte canônica)
2. **Validar sintaxe JSON** antes de salvar
3. **Traduzir para os outros idiomas** se necessário
4. **Atualizar metadata.json** com novo pageCount (número total de receitas)
5. **Testar leitura** no leitor inteligente
6. **Commit** com mensagem: `feat(receitas): adicionar N novas receitas — <descrição>`

### 4. Preço e Status

- **Preço atual:** R$ 100,00 (PIX) ou 4x R$ 25,00 (cartão)
- **Status:** READY (disponível para compra)
- **Disponibilidade:** pt-BR, en-US, pt-PT (es-CL e ko-KR pendentes)

**Para alterar preço:** Atualize `metadata.json` (campo `price.amount`) e sincronize em `ofertas.json` (Cordex).

### 5. Integração com Assas

O livro já está mapeado em `ofertas.json`:
```json
"receitas-corpopleno": {
  "productId": "receitas-corpopleno",
  "precoAtual": 100.00,
  ...
}
```

Qualquer mudança de preço é automática no checkout após deploy.

---

## 🔧 Ferramentas de Suporte

- **Leitor inteligente:** `leitor.html` (vê `receitas-corpopleno` automaticamente)
- **Painel admin:** `admin-preview/index.html` (análise de vendas)
- **Webhook Assas:** Rastreia pagamentos e concede entitlements automaticamente

---

**Última atualização:** 2026-10-12
**Responsável:** Noemi Cordeiro
**Próxima ação:** Implementar tradução para es-CL e ko-KR
