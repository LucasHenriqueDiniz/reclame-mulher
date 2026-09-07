#!/usr/bin/env tsx
/**
 * Builds the Word deliverables out of two inputs:
 *
 *   documentos/*.md      the text, in Portuguese, written for the reader
 *   screens/catalog.ts   the figures, and the caption that belongs to each
 *
 * A `{{figura:01-home}}` line in the Markdown is replaced by the image that
 * `pnpm run telas` captured for that id, followed by its numbered caption. The
 * caption is never written twice: the catalog owns it, so a screen that gets
 * recaptured under a new description updates every document that shows it
 * without anyone editing the prose.
 *
 * Run: pnpm run telas && pnpm run manual:docx && pnpm run relatorio:docx
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import {
  AlignmentType,
  Document,
  Footer,
  HeadingLevel,
  ImageRun,
  PageBreak,
  PageNumber,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";
import { SCREENS } from "../screens/catalog";

const ROOT = join(__dirname, "..");
const FIGURES = join(ROOT, "assets", "telas");

interface DocumentSpec {
  source: string;
  out: string;
  /** Printed in the page footer, before the page number. */
  footer: string;
}

const DOCUMENTS: Record<string, DocumentSpec> = {
  manual: {
    source: join(ROOT, "documentos", "manual-usuaria.md"),
    out: join(ROOT, "assets", "Manual-de-Uso-ComunicaMulher.docx"),
    footer: "ComunicaMulher — Manual de Uso · ",
  },
  relatorio: {
    source: join(ROOT, "documentos", "relatorio-metodologia-resultados.md"),
    out: join(ROOT, "assets", "Relatorio-IC-Metodologia-e-Resultados.docx"),
    footer: "Relatório de bolsista IC — Metodologia e Resultados · ",
  },
};

/**
 * The box every figure is scaled into, in CSS pixels at 96 dpi — which is the
 * unit `docx` reads `transformation` in, not points. A4 with Word's default
 * one-inch margins leaves 6.27 x 9.69 inches, so 602 x 930 px; the height here
 * is well under that to leave room for the caption and the text around it.
 *
 * Wide screenshots hit the width first and tall ones hit the height, so
 * neither spills onto the next page.
 */
const MAX_WIDTH = 600;
const MAX_HEIGHT = 620;

const FIGURE_PATTERN = /^\{\{figura:([a-z0-9-]+)\}\}$/;

const CAPTIONS = new Map(SCREENS.map((s) => [s.id, s.caption]));

/**
 * Reads width and height out of a JPEG's frame header, so a figure can be
 * scaled to the page without being distorted. Walks the marker segments to the
 * first SOFn — the only one that carries the dimensions — skipping the
 * standalone markers that have no length field.
 */
function jpegDimensions(buf: Buffer): { w: number; h: number } {
  let offset = 2;
  while (offset + 9 < buf.length) {
    if (buf[offset] !== 0xff) {
      offset += 1;
      continue;
    }
    const marker = buf[offset + 1]!;
    const isFrameHeader =
      marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
    if (isFrameHeader) {
      return { h: buf.readUInt16BE(offset + 5), w: buf.readUInt16BE(offset + 7) };
    }
    offset += 2 + buf.readUInt16BE(offset + 2);
  }
  throw new Error("no JPEG frame header found");
}

/** Fits the image inside MAX_WIDTH x MAX_HEIGHT without distorting it. */
function fit(w: number, h: number): { width: number; height: number } {
  const scale = Math.min(MAX_WIDTH / w, MAX_HEIGHT / h);
  return { width: Math.round(w * scale), height: Math.round(h * scale) };
}

/** `**bold**` inside a line. Everything else is literal. */
function runs(text: string): TextRun[] {
  return text
    .split(/(\*\*[^*]+\*\*)/)
    .filter((piece) => piece !== "")
    .map((piece) =>
      piece.startsWith("**") && piece.endsWith("**")
        ? new TextRun({ text: piece.slice(2, -2), bold: true })
        : new TextRun(piece)
    );
}

function figure(id: string, index: number, source: string): Paragraph[] {
  const path = join(FIGURES, `${id}.jpg`);
  if (!existsSync(path)) {
    throw new Error(
      `Figure "${id}" is referenced by ${source} but ${path} does not exist. ` +
        "Run `pnpm run telas` first, or fix the id."
    );
  }

  const caption = CAPTIONS.get(id);
  if (caption === undefined) {
    throw new Error(`Figure "${id}" has no entry in screens/catalog.ts, so it has no caption.`);
  }

  const data = readFileSync(path);
  const { w, h } = jpegDimensions(data);

  return [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 240, after: 80 },
      children: [new ImageRun({ type: "jpg", data, transformation: fit(w, h) })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 240 },
      children: [
        new TextRun({ text: `Figura ${index} — `, bold: true, size: 18, color: "444444" }),
        new TextRun({ text: caption, size: 18, color: "444444" }),
      ],
    }),
  ];
}

/** Splits one Markdown table row into its cells. */
function cells(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

/**
 * A Markdown table as a Word table: header row shaded, the rest plain, the
 * whole thing stretched to the text width so it does not float at whatever
 * width the longest cell happens to need.
 */
function table(rows: string[][]): Table {
  const [header, ...body] = rows;

  const row = (values: string[], isHeader: boolean) =>
    new TableRow({
      tableHeader: isHeader,
      children: values.map(
        (value) =>
          new TableCell({
            shading: isHeader ? { fill: "EEF3F8" } : undefined,
            margins: { top: 60, bottom: 60, left: 100, right: 100 },
            children: [
              new Paragraph({
                spacing: { after: 0 },
                children: isHeader
                  ? [new TextRun({ text: value, bold: true, size: 20 })]
                  : runs(value).map((r) => r),
              }),
            ],
          })
      ),
    });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [row(header!, true), ...body.map((values) => row(values, false))],
  });
}

function build(markdown: string, source: string): (Paragraph | Table)[] {
  const out: (Paragraph | Table)[] = [];
  const lines = markdown.split("\n");
  let figureNumber = 0;

  for (let i = 0; i < lines.length; i += 1) {
    const text = lines[i]!.trimEnd();

    if (text === "") continue;

    // A Markdown table: a header row, the `|---|---|` separator, then the body.
    // Consumed here as a block because a row means nothing on its own.
    if (text.startsWith("|") && (lines[i + 1] ?? "").trim().startsWith("|-")) {
      const rows: string[][] = [cells(text)];
      i += 2;
      while (i < lines.length && lines[i]!.trim().startsWith("|")) {
        rows.push(cells(lines[i]!));
        i += 1;
      }
      i -= 1;
      out.push(table(rows));
      continue;
    }

    const isFigure = text.match(FIGURE_PATTERN);
    if (isFigure) {
      figureNumber += 1;
      out.push(...figure(isFigure[1]!, figureNumber, source));
      continue;
    }

    if (text === "---") {
      out.push(new Paragraph({ children: [new PageBreak()] }));
      continue;
    }

    if (text.startsWith("# ")) {
      out.push(new Paragraph({ text: text.slice(2), heading: HeadingLevel.TITLE }));
      continue;
    }
    if (text.startsWith("## ")) {
      out.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 360, after: 160 },
          children: runs(text.slice(3)),
        })
      );
      continue;
    }
    if (text.startsWith("### ")) {
      out.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 260, after: 120 },
          children: runs(text.slice(4)),
        })
      );
      continue;
    }

    if (text.startsWith("- ")) {
      out.push(
        new Paragraph({ bullet: { level: 0 }, spacing: { after: 80 }, children: runs(text.slice(2)) })
      );
      continue;
    }

    const numbered = text.match(/^(\d+)\.\s+(.*)$/);
    if (numbered) {
      // A real Word numbered list needs a numbering definition per list, and
      // these lists restart in every section. The step number is part of the
      // sentence instead, which survives copy-paste into the report.
      out.push(
        new Paragraph({
          spacing: { after: 80 },
          indent: { left: 360 },
          children: [
            new TextRun({ text: `${numbered[1]}. `, bold: true }),
            ...runs(numbered[2]!),
          ],
        })
      );
      continue;
    }

    out.push(new Paragraph({ spacing: { after: 120 }, children: runs(text) }));
  }

  return out;
}

async function main(): Promise<void> {
  const key = process.argv[2];
  const spec = key === undefined ? undefined : DOCUMENTS[key];
  if (spec === undefined) {
    throw new Error(
      `Pass one of: ${Object.keys(DOCUMENTS).join(", ")}. Received: ${key ?? "nothing"}`
    );
  }

  const markdown = readFileSync(spec.source, "utf8");
  const children = build(markdown, spec.source);

  const document = new Document({
    styles: {
      default: {
        document: { run: { font: "Calibri", size: 22 }, paragraph: { spacing: { line: 276 } } },
        title: { run: { font: "Calibri", size: 44, bold: true, color: "1E88E5" } },
        heading1: { run: { font: "Calibri", size: 30, bold: true, color: "2A3F54" } },
        heading2: { run: { font: "Calibri", size: 25, bold: true, color: "2A3F54" } },
      },
    },
    sections: [
      {
        properties: {},
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: spec.footer, size: 16, color: "888888" }),
                  new TextRun({ children: [PageNumber.CURRENT], size: 16, color: "888888" }),
                ],
              }),
            ],
          }),
        },
        children,
      },
    ],
  });

  writeFileSync(spec.out, await Packer.toBuffer(document));

  const figures = markdown.split("\n").filter((l) => FIGURE_PATTERN.test(l.trim())).length;
  console.log(`${spec.out}\n${children.length} blocos, ${figures} figuras.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
