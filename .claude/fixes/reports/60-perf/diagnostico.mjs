/**
 * Por que o deslocamento medido na task `19` não reaparece.
 *
 * Segue o rodapé e a altura da página ao longo do carregamento, com a mesma
 * limitação de rede e CPU. A pergunta é simples: durante o esqueleto, o rodapé
 * está **dentro** da janela? Deslocamento fora da janela não conta para o CLS,
 * então o mesmo defeito pode medir 0,198 ou 0,005 dependendo de onde o rodapé
 * cai na hora da troca.
 */
import { chromium } from "@playwright/test";

const BASE = process.env.BASE ?? "http://localhost:5001";
const navegador = await chromium.launch();

for (const vp of [
  { nome: "desktop", width: 1280, height: 800 },
  { nome: "celular", width: 375, height: 812 },
]) {
  const ctx = await navegador.newContext({ viewport: { width: vp.width, height: vp.height } });
  const page = await ctx.newPage();

  const cdp = await ctx.newCDPSession(page);
  await cdp.send("Network.enable");
  await cdp.send("Network.emulateNetworkConditions", {
    offline: false,
    latency: 150,
    downloadThroughput: (1.6 * 1024 * 1024) / 8,
    uploadThroughput: (750 * 1024) / 8,
  });
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });

  await page.goto(BASE + "/blog", { waitUntil: "commit" });

  console.log(`\n=== ${vp.nome} (janela de ${vp.height} px)`);
  for (let i = 0; i < 14; i++) {
    const estado = await page
      .evaluate(() => {
        const rodape = document.querySelector("footer");
        const esqueleto = document.querySelectorAll(".animate-pulse").length;
        return {
          altura: document.body.scrollHeight,
          topoDoRodape: rodape ? Math.round(rodape.getBoundingClientRect().top) : null,
          esqueleto,
        };
      })
      .catch(() => null);
    if (estado) {
      const dentro =
        estado.topoDoRodape !== null && estado.topoDoRodape >= 0 && estado.topoDoRodape < vp.height;
      console.log(
        `  ${String(i * 400).padStart(5)} ms  altura ${String(estado.altura).padStart(5)}  ` +
          `rodapé em ${String(estado.topoDoRodape).padStart(6)}  ${dentro ? "<- DENTRO da janela" : ""}` +
          `${estado.esqueleto ? `  esqueleto:${estado.esqueleto}` : ""}`
      );
    }
    await page.waitForTimeout(400);
  }

  await ctx.close();
}

await navegador.close();
