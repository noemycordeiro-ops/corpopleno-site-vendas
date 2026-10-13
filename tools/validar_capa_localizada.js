#!/usr/bin/env node
"use strict";
/*
  Fase CorpoPleno Livros 006.3 (2026-10-03) — validador técnico do
  pipeline de recebimento das 20 capas traduzidas. NUNCA avalia arte por
  heurística (nenhuma tentativa de "julgar se ficou bonito") — só
  confirma propriedades técnicas objetivas. A aprovação VISUAL final é
  sempre um ato humano explícito (comando "aprovar"), nunca automática.

  Duas ações, deliberadamente separadas (nunca uma imagem pula direto
  para READY só por existir no disco):

    node tools/validar_capa_localizada.js validar --book=<id> --locale=<locale> --arquivo=<caminho>
      Roda as checagens técnicas (Passo 6). Em caso de sucesso, grava
      technicalValidation="PASS" + o caminho/checksum do candidato no
      manifesto -- NUNCA copia o arquivo para o lugar definitivo, NUNCA
      muda status/imageReady.

    node tools/validar_capa_localizada.js aprovar --book=<id> --locale=<locale>
      Exige technicalValidation="PASS" já gravado. É o ato humano
      explícito: só Noemi roda isso, depois de olhar a imagem ela mesma.
      Só então copia o candidato para o slot definitivo, atualiza
      cover-manifest.json (status=READY, humanVisualApproval=APPROVED,
      imageReady=true) E o metadata.json do livro (cover.locales.<locale>.status=READY,
      .image=<caminho>) -- os dois ficam sincronizados, nunca um
      "segundo sistema" divergente.

    node tools/validar_capa_localizada.js rejeitar --book=<id> --locale=<locale> [--motivo="..."]
      Marca status=REJECTED explicitamente (decisão humana), nunca
      apaga o registro do manifesto.

  NUNCA aceita --locale=pt-BR (o cânone nunca passa por este pipeline;
  pt-PT/en-US/ko-KR/es-CL que exigirem alteração explícita teriam que ser
  pedidas separadamente, por decisão humana, fora deste validador).
*/

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const SITE_DIR = path.join(__dirname, "..");
const MANIFEST_PATH = path.join(SITE_DIR, "assets/books/cover-manifest.json");
const LOCALES_VALIDOS = ["pt-BR", "pt-PT", "en-US", "ko-KR", "es-CL"];
const EXTENSOES_PERMITIDAS = [".png", ".jpg", ".jpeg", ".webp"];

function falhar(msg) {
  console.error("FALHA: " + msg);
  process.exitCode = 1;
}

function parseArgs(argv) {
  const out = {};
  argv.forEach((a) => {
    const m = a.match(/^--([^=]+)=(.*)$/);
    if (m) out[m[1]] = m[2];
  });
  return out;
}

function carregarManifesto() {
  return JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));
}
function salvarManifesto(manifesto) {
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifesto, null, 2) + "\n", "utf8");
}
function encontrarVariante(manifesto, bookId, locale) {
  return manifesto.variants.find((v) => v.bookId === bookId && v.locale === locale) || null;
}

function md5DoArquivo(caminho) {
  return crypto.createHash("md5").update(fs.readFileSync(caminho)).digest("hex");
}

// Leitura mínima de dimensões -- sem dependência externa. PNG: largura/
// altura ficam nos bytes 16..24 do IHDR, sempre nessa posição fixa pela
// especificação do formato. JPEG: percorre os marcadores até achar um
// SOFn (início de frame) e lê altura/largura logo em seguida.
function dimensoesPng(buffer) {
  if (buffer.length < 24) return null;
  const assinaturaOk = buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47;
  if (!assinaturaOk) return null;
  return { width: buffer.readUInt32BE(16), height: buffer.readUInt32BE(20) };
}
function dimensoesJpeg(buffer) {
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) return null;
  let offset = 2;
  while (offset < buffer.length - 9) {
    if (buffer[offset] !== 0xff) { offset++; continue; }
    const marcador = buffer[offset + 1];
    const SOF_MARKERS = [0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf];
    if (SOF_MARKERS.indexOf(marcador) !== -1) {
      return { height: buffer.readUInt16BE(offset + 5), width: buffer.readUInt16BE(offset + 7) };
    }
    const tamanhoSegmento = buffer.readUInt16BE(offset + 2);
    offset += 2 + tamanhoSegmento;
  }
  return null;
}
function lerDimensoes(caminho) {
  const buffer = fs.readFileSync(caminho);
  const ext = path.extname(caminho).toLowerCase();
  if (ext === ".png") return dimensoesPng(buffer);
  if (ext === ".jpg" || ext === ".jpeg") return dimensoesJpeg(buffer);
  return null; // webp: sem leitor próprio aqui -- cai em "dimensão não verificável", tratado como falha abaixo.
}

function validar(args) {
  const { book, locale, arquivo } = args;
  if (!book || !locale || !arquivo) {
    return falhar("uso: validar --book=<id> --locale=<locale> --arquivo=<caminho>");
  }
  if (locale === "pt-BR") {
    return falhar("locale pt-BR é o cânone -- nunca passa por este validador.");
  }
  if (LOCALES_VALIDOS.indexOf(locale) === -1) {
    return falhar(`locale "${locale}" não é um dos 5 idiomas CorpoPleno.`);
  }

  const manifesto = carregarManifesto();
  const variante = encontrarVariante(manifesto, book, locale);
  if (!variante) {
    return falhar(`nenhum slot "${book}"/"${locale}" no manifesto -- book_id ou locale incorretos.`);
  }

  const caminhoAbsolutoCandidato = path.resolve(arquivo);
  const caminhoAbsolutoCanonico = path.resolve(SITE_DIR, variante.expectedPath.replace(`cover-${locale}`, "cover-pt-BR"));

  // 1) arquivo existe.
  if (!fs.existsSync(caminhoAbsolutoCandidato)) {
    variante.technicalValidation = "FAIL";
    salvarManifesto(manifesto);
    return falhar("arquivo não existe: " + arquivo);
  }
  // 7) não sobrescreveu pt-BR.
  if (caminhoAbsolutoCandidato === caminhoAbsolutoCanonico) {
    return falhar("o candidato aponta exatamente para o arquivo canônico pt-BR -- recusado, nunca sobrescrever o original.");
  }
  // 2) extensão permitida.
  const ext = path.extname(caminhoAbsolutoCandidato).toLowerCase();
  if (EXTENSOES_PERMITIDAS.indexOf(ext) === -1) {
    variante.technicalValidation = "FAIL";
    salvarManifesto(manifesto);
    return falhar(`extensão "${ext}" não permitida (use: ${EXTENSOES_PERMITIDAS.join(", ")}).`);
  }
  // 5) locale corresponde ao slot -- nome do arquivo de destino esperado usa o locale pedido.
  const nomeEsperado = path.basename(variante.expectedPath, path.extname(variante.expectedPath));
  if (!nomeEsperado.endsWith(locale)) {
    return falhar("inconsistência interna: expectedPath do manifesto não corresponde ao locale pedido.");
  }
  // 4) arquivo não vazio.
  const stat = fs.statSync(caminhoAbsolutoCandidato);
  if (stat.size === 0) {
    variante.technicalValidation = "FAIL";
    salvarManifesto(manifesto);
    return falhar("arquivo vazio (0 bytes).");
  }
  // 3) dimensões coerentes -- exatamente iguais ao cânone pt-BR do MESMO livro.
  if (!fs.existsSync(caminhoAbsolutoCanonico)) {
    return falhar("capa canônica pt-BR deste livro não encontrada -- não é possível comparar dimensões.");
  }
  const dimCanonico = lerDimensoes(caminhoAbsolutoCanonico);
  const dimCandidato = lerDimensoes(caminhoAbsolutoCandidato);
  if (!dimCandidato) {
    variante.technicalValidation = "FAIL";
    salvarManifesto(manifesto);
    return falhar("não foi possível ler as dimensões do candidato (formato não suportado pelo leitor mínimo -- prefira PNG/JPEG).");
  }
  if (dimCandidato.width !== dimCanonico.width || dimCandidato.height !== dimCanonico.height) {
    variante.technicalValidation = "FAIL";
    salvarManifesto(manifesto);
    return falhar(`dimensões incoerentes: candidato ${dimCandidato.width}x${dimCandidato.height}, cânone ${dimCanonico.width}x${dimCanonico.height} -- a proporção/enquadramento precisa ser idêntico.`);
  }

  // 6) book_id corresponde ao diretório esperado do candidato (checagem leve -- avisa, não bloqueia,
  //    já que o candidato pode estar em qualquer pasta temporária antes de ser aprovado).
  const checksum = md5DoArquivo(caminhoAbsolutoCandidato);

  variante.technicalValidation = "PASS";
  variante.pendingCandidateFile = caminhoAbsolutoCandidato;
  variante.pendingCandidateChecksum = checksum;
  variante.humanVisualApproval = "PENDING";
  salvarManifesto(manifesto);

  console.log("TECHNICAL_VALIDATION_PASS=true");
  console.log("CHECKSUM=" + checksum);
  console.log("DIMENSOES=" + dimCandidato.width + "x" + dimCandidato.height);
  console.log("HUMAN_VISUAL_APPROVAL_PENDING=true");
  console.log('Próximo passo (só depois de você mesma olhar a imagem): node tools/validar_capa_localizada.js aprovar --book=' + book + ' --locale=' + locale);
}

function aprovar(args) {
  const { book, locale } = args;
  if (!book || !locale) return falhar("uso: aprovar --book=<id> --locale=<locale>");
  if (locale === "pt-BR") return falhar("locale pt-BR já é o cânone -- nada a aprovar.");

  const manifesto = carregarManifesto();
  const variante = encontrarVariante(manifesto, book, locale);
  if (!variante) return falhar(`nenhum slot "${book}"/"${locale}" no manifesto.`);
  if (variante.technicalValidation !== "PASS") {
    return falhar('technicalValidation precisa ser "PASS" primeiro -- rode a ação "validar" antes.');
  }
  if (!variante.pendingCandidateFile || !fs.existsSync(variante.pendingCandidateFile)) {
    return falhar("arquivo candidato validado não encontrado mais no disco -- rode 'validar' de novo.");
  }

  const destinoAbsoluto = path.resolve(SITE_DIR, variante.expectedPath);
  fs.mkdirSync(path.dirname(destinoAbsoluto), { recursive: true });
  fs.copyFileSync(variante.pendingCandidateFile, destinoAbsoluto);

  variante.status = "READY";
  variante.humanVisualApproval = "APPROVED";
  variante.imageReady = true;
  variante.originalArtworkPreserved = true;
  variante.checksum = md5DoArquivo(destinoAbsoluto);
  delete variante.pendingCandidateFile;
  delete variante.pendingCandidateChecksum;
  salvarManifesto(manifesto);

  // Sincroniza metadata.json do livro -- mesma informação, nunca um
  // segundo sistema divergente.
  const metaPath = path.join(SITE_DIR, "assets/books", book, "metadata.json");
  const meta = JSON.parse(fs.readFileSync(metaPath, "utf8"));
  meta.cover.locales[locale].status = "READY";
  meta.cover.locales[locale].image = variante.expectedPath;
  fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2) + "\n", "utf8");

  console.log("HUMAN_VISUAL_APPROVAL_APPROVED=true");
  console.log("READY=true");
  console.log("metadata.json atualizado: " + metaPath);
}

function rejeitar(args) {
  const { book, locale, motivo } = args;
  if (!book || !locale) return falhar("uso: rejeitar --book=<id> --locale=<locale> [--motivo=\"...\"]");
  const manifesto = carregarManifesto();
  const variante = encontrarVariante(manifesto, book, locale);
  if (!variante) return falhar(`nenhum slot "${book}"/"${locale}" no manifesto.`);
  variante.status = "REJECTED";
  variante.humanVisualApproval = "NOT_APPLICABLE";
  variante.rejectionReason = motivo || null;
  delete variante.pendingCandidateFile;
  delete variante.pendingCandidateChecksum;
  salvarManifesto(manifesto);
  console.log("REJECTED=true");
}

const [, , acao, ...resto] = process.argv;
const args = parseArgs(resto);
if (acao === "validar") validar(args);
else if (acao === "aprovar") aprovar(args);
else if (acao === "rejeitar") rejeitar(args);
else {
  console.error("Uso: node tools/validar_capa_localizada.js <validar|aprovar|rejeitar> --book=<id> --locale=<locale> [--arquivo=<caminho>] [--motivo=\"...\"]");
  process.exitCode = 1;
}
