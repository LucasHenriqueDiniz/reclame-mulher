#!/usr/bin/env tsx
/**
 * Generates assets/evidencias-desenvolvimento-tcc.docx
 * — plain text, no tables; embeds the images found under assets/ (except the .docx itself).
 *
 * Drop PNG/JPG files in assets/figma, assets/dev, assets/testes or assets/wireframes, then run:
 *   npm run evidencias:docx
 */

import { readFileSync, readdirSync, statSync, writeFileSync } from "fs";
import { extname, join, relative } from "path";
import {
  Document,
  HeadingLevel,
  ImageRun,
  Packer,
  Paragraph,
  TextRun,
} from "docx";

const ASSETS = join(__dirname, "..", "assets");
const OUT = join(ASSETS, "evidencias-desenvolvimento-tcc.docx");

const IMAGE_EXT = new Set([".png", ".jpg", ".jpeg", ".gif", ".bmp"]);

function walkImages(dir: string): string[] {
  const out: string[] = [];
  let names: string[];
  try {
    names = readdirSync(dir);
  } catch {
    return out;
  }
  for (const name of names) {
    if (name.startsWith(".")) continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) {
      out.push(...walkImages(full));
    } else if (IMAGE_EXT.has(extname(name).toLowerCase())) {
      out.push(full);
    }
  }
  return out;
}

function sortPaths(paths: string[]) {
  const weight = (p: string) => {
    const s = p.replace(/\\/g, "/").toLowerCase();
    if (s.includes("/wireframes/")) return 0;
    if (s.includes("/figma/")) return 1;
    if (s.includes("/dev/")) return 2;
    if (s.includes("/testes/")) return 3;
    return 4;
  };
  return [...paths].sort((a, b) => {
    const d = weight(a) - weight(b);
    if (d !== 0) return d;
    return a.localeCompare(b, "pt-BR");
  });
}

/** Reads the PNG width/height (IHDR) so it can be resized without distortion. */
function pngDimensions(buf: Buffer): { w: number; h: number } | null {
  if (buf.length < 24 || buf[0] !== 0x89) return null;
  if (buf.toString("ascii", 1, 4) !== "PNG") return null;
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
}

const MAX_W = 520;

function layoutImage(path: string, buf: Buffer): { w: number; h: number } {
  const ext = extname(path).toLowerCase();
  if (ext === ".png") {
    const d = pngDimensions(buf);
    if (d && d.w > 0 && d.h > 0) {
      const scale = MAX_W / d.w;
      return { w: MAX_W, h: Math.max(1, Math.round(d.h * scale)) };
    }
  }
  return { w: MAX_W, h: 320 };
}

function imageType(path: string): "png" | "jpg" | "gif" | "bmp" {
  const e = extname(path).toLowerCase();
  if (e === ".png") return "png";
  if (e === ".gif") return "gif";
  if (e === ".bmp") return "bmp";
  return "jpg";
}

const GROUP_LABEL: Record<string, string> = {
  wireframes: "Wireframes",
  figma: "Protótipo (Figma)",
  dev: "Telas em desenvolvimento",
  testes: "Testes e verificações",
};

async function main() {
  const raw = walkImages(ASSETS);
  const images = sortPaths(raw);

  const children: Paragraph[] = [];

  children.push(
    new Paragraph({
      text: "Evidências do estágio de desenvolvimento",
      heading: HeadingLevel.TITLE,
    }),
  );
  children.push(
    new Paragraph(
      "Reclame Mulher — plataforma em desenvolvimento (Next.js, Postgres/Neon). " +
        "Este documento reúne capturas de tela e materiais visuais para anexo acadêmico (exportar PDF conforme a faculdade, até 5 MB).",
    ),
  );
  children.push(
    new Paragraph(
      "Ambiente local: npm run dev → http://localhost:5000. Logins de teste no README do repositório (senha senha123).",
    ),
  );
  children.push(
    new Paragraph({
      text: "Como usar",
      heading: HeadingLevel.HEADING_1,
    }),
  );
  children.push(
    new Paragraph(
      "Preencha nome da autora, curso e data na capa ou no cabeçalho que a instituição pedir. " +
        "Revise legendas abaixo de cada imagem se quiser texto mais acadêmico. " +
        "No Word: Arquivo → Salvar como → PDF. Comprima imagens se o PDF passar de 5 MB.",
    ),
  );

  if (images.length === 0) {
    children.push(
      new Paragraph({
        text: "Imagens",
        heading: HeadingLevel.HEADING_1,
      }),
    );
    children.push(
      new Paragraph(
        "Nenhuma imagem foi encontrada em assets/. Adicione arquivos .png ou .jpg em assets/figma, assets/dev, assets/testes ou assets/wireframes e execute de novo: npm run evidencias:docx",
      ),
    );
  } else {
    children.push(
      new Paragraph({
        text: "Imagens",
        heading: HeadingLevel.HEADING_1,
      }),
    );

    let lastGroup = "";
    for (const abs of images) {
      const rel = relative(ASSETS, abs).replace(/\\/g, "/");
      const group = rel.split("/")[0] ?? "outros";
      if (group !== lastGroup) {
        lastGroup = group;
        const label = GROUP_LABEL[group] ?? group;
        children.push(
          new Paragraph({
            text: label,
            heading: HeadingLevel.HEADING_2,
          }),
        );
      }

      const buf = readFileSync(abs);
      const { w, h } = layoutImage(abs, buf);
      const type = imageType(abs);

      children.push(
        new Paragraph({
          children: [
            new ImageRun({
              type,
              data: buf,
              transformation: { width: w, height: h },
            }),
          ],
        }),
      );
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: rel,
              italics: true,
              color: "444444",
            }),
          ],
        }),
      );
    }
  }

  children.push(
    new Paragraph({
      text: "Teste rápido no terminal (opcional)",
      heading: HeadingLevel.HEADING_1,
    }),
  );
  children.push(
    new Paragraph(
      "Para um print de ambiente e banco: npm run evidencias:check (com DATABASE_URL no .env).",
    ),
  );

  const doc = new Document({
    title: "Evidências — Reclame Mulher",
    creator: "Reclame Mulher",
    sections: [{ children }],
  });

  const buffer = await Packer.toBuffer(doc);
  writeFileSync(OUT, buffer);
  console.log("Gerado:", OUT);
  console.log(images.length ? `${images.length} imagem(ns) embutida(s).` : "Nenhuma imagem; doc mínimo.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
