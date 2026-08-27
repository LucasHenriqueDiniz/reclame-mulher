import { chromium } from "@playwright/test";

const BASE = process.env.ALVO ?? "http://localhost:5001";
const VIEWPORTS = { desktop: { width: 1280, height: 800 }, mobile: { width: 375, height: 812 } };

const COLETOR = `
  window.__m = { lcp: 0, cls: 0, fcp: 0, lcpEl: "" };
  new PerformanceObserver((l) => {
    for (const e of l.getEntries()) {
      window.__m.lcp = e.startTime;
      window.__m.lcpEl = (e.element && (e.element.tagName + "." + String(e.element.className || "").slice(0, 45))) || e.url || "";
    }
  }).observe({ type: "largest-contentful-paint", buffered: true });
  new PerformanceObserver((l) => {
    for (const e of l.getEntries()) if (!e.hadRecentInput) window.__m.cls += e.value;
  }).observe({ type: "layout-shift", buffered: true });
  new PerformanceObserver((l) => {
    for (const e of l.getEntries()) if (e.name === "first-contentful-paint") window.__m.fcp = e.startTime;
  }).observe({ type: "paint", buffered: true });
`;

async function entrar(contexto, email) {
  const r = await contexto.request.post(BASE + "/api/auth/login", {
    data: { email, password: process.env.E2E_SENHA ?? "senha123" },
  });
  if (!r.ok()) throw new Error(`login de ${email} falhou: ${r.status()}`);
}

const THROTTLE = process.env.THROTTLE === "1";

async function medir(contexto, caminho) {
  const page = await contexto.newPage();
  await page.addInitScript(COLETOR);

  if (THROTTLE) {
    // Medir em localhost com desktop rápido não diz nada sobre quem acessa de
    // um celular mediano em 4G. Estes são os presets de "Slow 4G" e 4x de CPU
    // do DevTools — o cenário do público desta plataforma.
    const cdp = await contexto.newCDPSession(page);
    await cdp.send("Network.enable");
    await cdp.send("Network.emulateNetworkConditions", {
      offline: false,
      latency: 150,
      downloadThroughput: (1.6 * 1024 * 1024) / 8,
      uploadThroughput: (750 * 1024) / 8,
    });
    await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  }
  await page.goto(BASE + caminho, { waitUntil: "load" });
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.waitForTimeout(THROTTLE ? 5000 : 2500);
  const m = await page.evaluate(() => {
    const nav = performance.getEntriesByType("navigation")[0];
    const recursos = performance.getEntriesByType("resource");
    const imagens = recursos.filter((r) => r.initiatorType === "img");
    const ordenadas = imagens.slice().sort((a, b) => (b.transferSize || 0) - (a.transferSize || 0));
    return {
      lcp: window.__m.lcp,
      cls: window.__m.cls,
      fcp: window.__m.fcp,
      lcpEl: window.__m.lcpEl,
      ttfb: nav ? nav.responseStart - nav.requestStart : 0,
      bytes: recursos.reduce((s, r) => s + (r.transferSize || 0), 0),
      bytesImagem: imagens.reduce((s, r) => s + (r.transferSize || 0), 0),
      nImagens: imagens.length,
      maiorImagem: ordenadas[0]
        ? { url: ordenadas[0].name.split("/").pop().slice(0, 40), kb: Math.round((ordenadas[0].transferSize || 0) / 1024) }
        : null,
    };
  });
  await page.close();
  return m;
}

const navegador = await chromium.launch();
const resultados = [];

for (const [nomeVp, viewport] of Object.entries(VIEWPORTS)) {
  const publico = await navegador.newContext({ viewport });
  for (const rota of ["/", "/companies", "/blog", "/company/construtora-x"]) {
    resultados.push({ viewport: nomeVp, rota, ...(await medir(publico, rota)) });
  }
  await publico.close();

  const pessoa = await navegador.newContext({ viewport });
  await entrar(pessoa, "maria@exemplo.com");
  resultados.push({ viewport: nomeVp, rota: "/app/complaints", ...(await medir(pessoa, "/app/complaints")) });
  await pessoa.close();

  const empresa = await navegador.newContext({ viewport });
  await entrar(empresa, "empresa@construtorax.com");
  resultados.push({
    viewport: nomeVp,
    rota: "/app/company/dashboard",
    ...(await medir(empresa, "/app/company/dashboard")),
  });
  await empresa.close();
}

await navegador.close();

const n = (v) => Math.round(v);
console.log("| viewport | rota | LCP | CLS | FCP | TTFB | total | imagens | maior imagem |");
console.log("|---|---|---|---|---|---|---|---|---|");
for (const r of resultados) {
  console.log(
    `| ${r.viewport} | \`${r.rota}\` | ${n(r.lcp)} ms | ${r.cls.toFixed(3)} | ${n(r.fcp)} ms | ${n(r.ttfb)} ms | ` +
      `${n(r.bytes / 1024)} kB | ${r.nImagens} (${n(r.bytesImagem / 1024)} kB) | ` +
      `${r.maiorImagem ? `${r.maiorImagem.url} ${r.maiorImagem.kb} kB` : "—"} |`
  );
}
console.log("\nELEMENTO DO LCP:");
for (const r of resultados) console.log(`  ${r.viewport} ${r.rota}: ${r.lcpEl}`);
console.log("\nJSON:" + JSON.stringify(resultados));
