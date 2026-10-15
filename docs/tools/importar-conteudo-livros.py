#!/usr/bin/env python3
"""
Gera arquivos .sql para carregar o conteúdo PAGO dos livros na tabela
book_pages do D1 (uma linha por página).

O conteúdo pago NUNCA pode ir para o GitHub, porque o repositório é
público. Por isso este script se recusa a gravar a saída dentro do
repositório.

Uso:
  python3 docs/tools/importar-conteudo-livros.py \
      --origem ~/CorpoPleno-IA/workspace/cordex_unificado_preparacao_20260915/unificado/private_content/books \
      --saida /tmp/conteudo-livros-sql

Depois, para cada arquivo gerado (o script imprime os comandos):
  npx wrangler d1 execute corpopleno-livros --remote --file <arquivo.sql>

Cada par (livro, idioma) é apagado e recarregado (o DELETE fica na
parte01; rode as partes EM ORDEM). Rodar tudo de novo é seguro. Lê só <livro>/<idioma>/pages.json e ignora .bak, _build
e README.
"""
import argparse
import json
import os
import subprocess
import sys

LOCALES = ["pt-BR", "pt-PT", "en-US", "ko-KR", "es-CL"]
MAX_ROW_BYTES = 1_900_000  # limite do D1: 2 MB por linha
MAX_FILE_BYTES = 500_000


def sql_str(value: str) -> str:
    return "'" + value.replace("'", "''") + "'"


def repo_root():
    here = os.path.dirname(os.path.abspath(__file__))
    try:
        return subprocess.check_output(["git", "-C", here, "rev-parse", "--show-toplevel"], text=True).strip()
    except Exception:
        return None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--origem", required=True, help="pasta private_content/books do Cordex")
    ap.add_argument("--saida", required=True, help="pasta FORA do repositório para os .sql")
    ap.add_argument("--banco", default="corpopleno-livros", help="nome do D1 (para imprimir os comandos)")
    args = ap.parse_args()

    origem = os.path.realpath(os.path.expanduser(args.origem))
    saida = os.path.realpath(os.path.expanduser(args.saida))
    raiz = repo_root()
    if raiz and (saida == os.path.realpath(raiz) or saida.startswith(os.path.realpath(raiz) + os.sep)):
        sys.exit("ERRO: --saida está dentro do repositório (público). Use uma pasta fora dele, ex.: /tmp/conteudo-livros-sql")
    os.makedirs(saida, exist_ok=True)

    gerados = []
    for book_id in sorted(os.listdir(origem)):
        livro_dir = os.path.join(origem, book_id)
        if not os.path.isdir(livro_dir):
            continue
        for locale in LOCALES:
            arquivo = os.path.join(livro_dir, locale, "pages.json")
            if not os.path.isfile(arquivo):
                continue
            with open(arquivo, encoding="utf-8") as f:
                dados = json.load(f)
            pages = dados if isinstance(dados, list) else dados.get("pages")
            if not isinstance(pages, list) or not pages:
                print(f"AVISO: {book_id}/{locale} sem páginas, ignorado")
                continue
            linhas = [f"DELETE FROM book_pages WHERE book_id = {sql_str(book_id)} AND locale = {sql_str(locale)};"]
            for i, page in enumerate(pages):
                conteudo = json.dumps(page, ensure_ascii=False, separators=(",", ":"))
                if len(conteudo.encode("utf-8")) > MAX_ROW_BYTES:
                    sys.exit(f"ERRO: {book_id}/{locale} página {i} passa de 2 MB")
                linhas.append(
                    "INSERT INTO book_pages (book_id, locale, page_index, content) VALUES "
                    f"({sql_str(book_id)}, {sql_str(locale)}, {i}, {sql_str(conteudo)});"
                )
            # Partes de até ~500 KB (arquivos grandes demais travam o D1 local
            # e deixam o envio remoto mais frágil). A parte 01 começa com o DELETE.
            partes, atual, tamanho = [], [], 0
            for linha in linhas:
                n = len(linha.encode("utf-8"))
                if atual and tamanho + n > MAX_FILE_BYTES:
                    partes.append(atual)
                    atual, tamanho = [], 0
                atual.append(linha)
                tamanho += n
            partes.append(atual)
            for idx, parte in enumerate(partes, start=1):
                destino = os.path.join(saida, f"{book_id}__{locale}__parte{idx:02d}.sql")
                with open(destino, "w", encoding="utf-8") as f:
                    f.write(
                        "CREATE TABLE IF NOT EXISTS book_pages (book_id TEXT NOT NULL, locale TEXT NOT NULL, "
                        "page_index INTEGER NOT NULL, content TEXT NOT NULL, PRIMARY KEY (book_id, locale, page_index));\n"
                    )
                    f.write("\n".join(parte) + "\n")
                gerados.append(destino)
            print(f"ok  {book_id}/{locale}: {len(pages)} páginas em {len(partes)} arquivo(s)")

    print(f"\n{len(gerados)} arquivos gerados. Para carregar no D1 remoto:")
    for g in gerados:
        print(f"  npx wrangler d1 execute {args.banco} --remote --file {g}")


if __name__ == "__main__":
    main()
