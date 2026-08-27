import { chromium } from "@playwright/test";

const BASE = "http://localhost:5001";
const navegador = await chromium.launch();
const ctx = await navegador.newContext({ viewport: { width: 375, height: 812 } });
const page = await ctx.newPage();

await page.addInitScript(`
  window.__shifts = [];
  new PerformanceObserver((l) => {
    for (const e of l.getEntries()) {
      if (e.hadRecentInput) continue;
      window.__shifts.push({
        valor: e.value,
        t: Math.round(e.startTime),
        fontes: (e.sources || []).map((s) => ({
          tag: s.node ? s.node.tagName : "?",
          cls: s.node ? String(s.node.className || "").slice(0, 60) : "",
          de: s.previousRect ? [Math.round(s.previousRect.y), Math.round(s.previousRect.height)] : null,
          para: s.currentRect ? [Math.round(s.currentRect.y), Math.round(s.currentRect.height)] : null,
        })),
      });
    }
  }).observe({ type: "layout-shift", buffered: true });
`);

const cdp = await ctx.newCDPSession(page);
await cdp.send("Network.enable");
await cdp.send("Network.emulateNetworkConditions", {
  offline: false,
  latency: 150,
  downloadThroughput: (1.6 * 1024 * 1024) / 8,
  uploadThroughput: (750 * 1024) / 8,
});
await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });

await page.goto(BASE + "/blog", { waitUntil: "load" });
await page.waitForTimeout(6000);

const shifts = await page.evaluate(() => window.__shifts);
let total = 0;
for (const s of shifts) {
  total += s.valor;
  console.log(`\n${s.valor.toFixed(4)} em ${s.t} ms`);
  for (const f of s.fontes) console.log(`   ${f.tag}.${f.cls}  y/h ${JSON.stringify(f.de)} -> ${JSON.stringify(f.para)}`);
}
console.log(`\nCLS total: ${total.toFixed(4)}`);

await navegador.close();
