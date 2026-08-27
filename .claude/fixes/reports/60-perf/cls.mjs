/**
 * CLS de uma rota, nos dois viewports, com rede e CPU limitadas.
 *
 * Mesmo método da task `19` (`.claude/fixes/reports/19-perf/cls.mjs`), para que
 * os números sejam comparáveis: Slow 4G + CPU 4x. Sem isso a medição mede a
 * máquina, não o produto.
 *
 *   node cls60.mjs /blog /blog/all
 */
import { chromium } from "@playwright/test";

const BASE = process.env.BASE ?? "http://localhost:5001";
// Sem argumento por padrão: o Git Bash do Windows converte `/blog` em
// `C:/Git/blog` antes de o node ver. Passar `blog` sem barra também serve.
const ROTAS = (process.argv.slice(2).length ? process.argv.slice(2) : ["/blog", "/blog/all"]).map(
  (rota) => (rota.startsWith("/") ? rota : "/" + rota)
);
const VIEWPORTS = [
  { nome: "desktop", width: 1280, height: 800 },
  { nome: "celular", width: 375, height: 812 },
];

const OBSERVADOR = `
  window.__shifts = [];
  new PerformanceObserver((l) => {
    for (const e of l.getEntries()) {
      if (e.hadRecentInput) continue;
      window.__shifts.push({
        valor: e.value,
        t: Math.round(e.startTime),
        fontes: (e.sources || []).map((s) => ({
          tag: s.node ? s.node.tagName : "?",
          cls: s.node ? String(s.node.className || "").slice(0, 50) : "",
          de: s.previousRect ? [Math.round(s.previousRect.y), Math.round(s.previousRect.height)] : null,
          para: s.currentRect ? [Math.round(s.currentRect.y), Math.round(s.currentRect.height)] : null,
        })),
      });
    }
  }).observe({ type: "layout-shift", buffered: true });
`;

const navegador = await chromium.launch();

for (const rota of ROTAS) {
  for (const vp of VIEWPORTS) {
    const ctx = await navegador.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await ctx.newPage();
    await page.addInitScript(OBSERVADOR);

    const cdp = await ctx.newCDPSession(page);
    await cdp.send("Network.enable");
    await cdp.send("Network.emulateNetworkConditions", {
      offline: false,
      latency: 150,
      downloadThroughput: (1.6 * 1024 * 1024) / 8,
      uploadThroughput: (750 * 1024) / 8,
    });
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });

    await page.goto(BASE + rota, { waitUntil: "load" });
    await page.waitForTimeout(6000);

    const shifts = await page.evaluate(() => window.__shifts);
    const total = shifts.reduce((soma, s) => soma + s.valor, 0);
    console.log(`\n=== ${rota} · ${vp.nome} · CLS ${total.toFixed(4)} ${total < 0.1 ? "OK" : "ACIMA DO ALVO"}`);
    for (const s of shifts) {
      console.log(`   ${s.valor.toFixed(4)} em ${s.t} ms`);
      for (const f of s.fontes) {
        console.log(`      ${f.tag}.${f.cls}  ${JSON.stringify(f.de)} -> ${JSON.stringify(f.para)}`);
      }
    }
    await ctx.close();
  }
}

await navegador.close();
