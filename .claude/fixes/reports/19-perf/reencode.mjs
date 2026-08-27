import fs from "node:fs";
import path from "node:path";
import { chromium } from "@playwright/test";

/**
 * Recomprime as imagens de `public/` usando o encoder de WebP do próprio
 * Chromium, via canvas. Sem dependência nova: `sharp` não está instalado, e
 * acrescentá-lo só para isto mexeria no lockfile — que já é assunto da task 20.
 */

const ALVOS = [
  { arquivo: "hero.webp", larguraMax: 1600, qualidade: 0.75 },
  { arquivo: "blog-image.webp", larguraMax: 1000, qualidade: 0.75 },
  { arquivo: "blog-image-2.webp", larguraMax: 1000, qualidade: 0.75 },
  { arquivo: "blog-image-3.webp", larguraMax: 1000, qualidade: 0.75 },
  { arquivo: "logo.webp", larguraMax: 256, qualidade: 0.85 },
];

const navegador = await chromium.launch();
const page = await navegador.newPage();

for (const alvo of ALVOS) {
  const caminho = path.join("public", alvo.arquivo);
  const antes = fs.statSync(caminho).size;
  const base64 = fs.readFileSync(caminho).toString("base64");

  const saida = await page.evaluate(
    async ({ base64, larguraMax, qualidade }) => {
      const img = new Image();
      img.src = `data:image/webp;base64,${base64}`;
      await img.decode();

      const escala = Math.min(1, larguraMax / img.naturalWidth);
      const w = Math.round(img.naturalWidth * escala);
      const h = Math.round(img.naturalHeight * escala);

      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, w, h);

      return {
        original: `${img.naturalWidth}x${img.naturalHeight}`,
        novo: `${w}x${h}`,
        dataUrl: canvas.toDataURL("image/webp", qualidade),
      };
    },
    { base64, larguraMax: alvo.larguraMax, qualidade: alvo.qualidade }
  );

  const bytes = Buffer.from(saida.dataUrl.split(",")[1], "base64");
  if (bytes.length >= antes) {
    console.log(`  ${alvo.arquivo}: já está bom (${Math.round(antes / 1024)} kB) — mantido`);
    continue;
  }
  fs.writeFileSync(caminho, bytes);
  console.log(
    `  ${alvo.arquivo}: ${saida.original} ${Math.round(antes / 1024)} kB  ->  ` +
      `${saida.novo} ${Math.round(bytes.length / 1024)} kB  ` +
      `(-${Math.round((1 - bytes.length / antes) * 100)}%)`
  );
}

await navegador.close();
