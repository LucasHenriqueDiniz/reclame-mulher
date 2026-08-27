#!/usr/bin/env tsx
/**
 * Ensaio da demonstração da defesa.
 *
 * Percorre o roteiro de `docs/roteiro-demonstracao.md` inteiro, pela interface,
 * e cronometra cada passo. Não é teste automatizado: é o ensaio que se roda
 * **antes de subir no palco**, para saber que o caminho está de pé e quanto ele
 * demora hoje, nesta máquina, com este banco.
 *
 * Pré-requisitos:
 *
 *   pnpm build && pnpm start     # build de PRODUÇÃO, não `pnpm dev`
 *   pnpm db:seed                 # cenário base
 *   pnpm db:seed:demo            # cenário de demonstração
 *
 * Depois:
 *
 *   node --import tsx scripts/ensaio-da-demonstracao.ts
 *
 * Ele cria um relato de verdade — o mesmo que a demonstração cria ao vivo — e o
 * deixa lá. Rodar `pnpm db:seed:demo` de novo limpa.
 *
 * `--visivel` abre o navegador para você assistir ao ensaio.
 */
import { chromium, type Browser, type Page } from "@playwright/test";

const BASE = "http://localhost:5000";
const SENHA = process.env.E2E_SENHA ?? "senha123";
const VISIVEL = process.argv.includes("--visivel");

const USUARIA = "helena.demo@exemplo.com";
const EMPRESA = "atendimento.norte.demo@exemplo.com";
const ADMIN = "admin@comunicamulher.com.br";

const TITULO = "Máquina ligada antes das seis da manhã";
const DESCRICAO =
  "A obra liga as máquinas antes das seis da manhã, e a licença só permite a partir das sete. " +
  "Moro na casa da frente e acordo com o barulho todos os dias.";
const LOCAL = "Rua do Hospício, 380 — Boa Vista";
const RESPOSTA_DA_EMPRESA =
  "Bom dia. Verificamos com o encarregado e o início dos trabalhos foi corrigido para as sete horas, " +
  "conforme a licença. Vamos acompanhar durante esta semana.";

type Passo = { nome: string; segundos: number; observacao?: string };
const passos: Passo[] = [];
const tropecos: string[] = [];

async function cronometrar(nome: string, acao: () => Promise<string | void>) {
  const inicio = Date.now();
  let observacao: string | undefined;
  try {
    observacao = (await acao()) ?? undefined;
  } catch (erro) {
    const motivo = erro instanceof Error ? erro.message.split("\n")[0] : String(erro);
    tropecos.push(`${nome}: ${motivo}`);
    observacao = `FALHOU — ${motivo}`;
  }
  const segundos = (Date.now() - inicio) / 1000;
  passos.push({ nome, segundos, observacao });
  const marca = observacao?.startsWith("FALHOU") ? "x" : "ok";
  console.log(`  ${marca}  ${segundos.toFixed(1).padStart(5)}s  ${nome}${observacao && marca === "ok" ? ` — ${observacao}` : ""}`);
  if (marca === "x") console.log(`         ${observacao}`);
}

async function entrarPelaTela(page: Page, email: string) {
  await page.goto(BASE + "/login", { waitUntil: "domcontentloaded" });
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(SENHA);
  await page.getByRole("button", { name: /entrar/i }).click();
  await page.waitForURL((u) => !u.pathname.startsWith("/login"), { timeout: 20_000 });
}

async function sair(page: Page) {
  await page.request.post(BASE + "/api/auth/logout").catch(() => {});
  await page.context().clearCookies();
}

const continuar = (page: Page) => page.getByRole("button", { name: "Continuar", exact: true });

async function escolher(page: Page, rotulo: string, opcao: RegExp) {
  const gatilho = page.locator('label:has-text("' + rotulo + '") + button');
  await gatilho.click();
  await page.getByRole("option", { name: opcao }).click();
}

async function main() {
  console.log("Ensaio da demonstração — build de produção em " + BASE + "\n");

  const navegador: Browser = await chromium.launch({
    headless: !VISIVEL,
    slowMo: VISIVEL ? 250 : 0,
  });
  const contexto = await navegador.newContext({
    viewport: { width: 1280, height: 800 },
    locale: "pt-BR",
  });
  const page = await contexto.newPage();
  const abertura = Date.now();

  // ── Ato 1: a plataforma vista de fora ────────────────────────────────────
  await cronometrar("1. Home e os números do impacto", async () => {
    // Os três números da home são **pré-renderizados no build** (a rota `/` sai
    // como estática). Então a verdade da tela é o que veio no HTML servido, e
    // não o que está no banco agora — ver task `64`.
    const html = await (await page.request.get(BASE + "/")).text();
    const servido = {
      // A carga do React vem com as aspas escapadas: `womenHeard\":11`. Daí o
      // `\\?` — a contrabarra é opcional para o caso de a serialização mudar.
      mulheres: /womenHeard\\?":(\d+)/.exec(html)?.[1],
      taxa: /resolutionRate\\?":(\d+)/.exec(html)?.[1],
      empresas: /companiesEngaged\\?":(\d+)/.exec(html)?.[1],
    };
    if (!servido.mulheres || !servido.taxa || !servido.empresas) {
      throw new Error("não achei os números do impacto no HTML servido");
    }
    if (servido.mulheres === "0" || servido.empresas === "0") {
      throw new Error("a home foi construída com o banco vazio — refaça o build depois do seed");
    }

    await page.goto(BASE + "/", { waitUntil: "networkidle" });
    const secao = page.locator("section:has(h2:text('Nosso impacto em números'))");
    await secao.scrollIntoViewIfNeeded();

    // A contagem sobe animada a partir de zero, com mola bem amortecida. Ler
    // cedo demais devolve um valor do meio da subida — no primeiro ensaio isso
    // me fez achar por um momento que a home estava quebrada. Espera até a tela
    // bater com o que o servidor mandou.
    // Comparação por trecho, e não por expressão regular: o texto já vem com os
    // espaços normalizados, e três `includes` são mais fáceis de ler e de
    // depurar do que uma regular montada com interpolação.
    const esperado = [
      `${servido.mulheres} mulheres ouvidas`,
      `${servido.taxa}% taxa de resolução`,
      `${servido.empresas} empresas em diálogo`,
    ];
    let texto = "";
    let chegou = false;
    for (let tentativa = 0; tentativa < 25 && !chegou; tentativa += 1) {
      await page.waitForTimeout(400);
      texto = (await secao.innerText()).replace(/\s+/g, " ").trim();
      chegou = esperado.every((trecho) => texto.includes(trecho));
    }
    if (!chegou) {
      throw new Error(
        `a contagem não chegou ao valor servido em 10s. Tela: "${texto.slice(0, 70)}"`
      );
    }
    return `${servido.mulheres} mulheres · ${servido.taxa}% de resolução · ${servido.empresas} empresas`;
  });

  await cronometrar("2. Lista de empresas", async () => {
    await page.goto(BASE + "/companies", { waitUntil: "networkidle" });
    const cartoes = await page.locator("a[href^='/company/']").count();
    if (cartoes === 0) throw new Error("nenhuma empresa na listagem");
    return `${cartoes} empresas na tela`;
  });

  await cronometrar("3. Perfil público de uma empresa", async () => {
    await page.goto(BASE + "/company/norte-engenharia-demo", { waitUntil: "networkidle" });
    await page.getByRole("heading", { name: /Norte Engenharia/ }).first().waitFor({ timeout: 15_000 });
    const publicos = await page.locator("text=/#R-[A-Z0-9-]+/").count();
    return `${publicos} relatos públicos visíveis sem login`;
  });

  // ── Ato 2: a usuária registra ────────────────────────────────────────────
  await cronometrar("4. Entrar como usuária", async () => {
    await entrarPelaTela(page, USUARIA);
    return page.url().replace(BASE, "");
  });

  let enderecoDoRelato = "";
  await cronometrar("5. Registrar o relato (quatro etapas)", async () => {
    const empresas = (await (await page.request.get(BASE + "/api/companies")).json()) as Array<{
      id: string;
      name: string;
    }>;
    const norte = empresas.find((e) => e.name === "Norte Engenharia");
    if (!norte) throw new Error("Norte Engenharia não está na API. Rodou o db:seed:demo?");

    await page.goto(BASE + "/app/complaints/new?company=" + norte.id, { waitUntil: "networkidle" });

    await continuar(page).click(); // etapa 1: a resposta padrão serve
    await page.waitForTimeout(700);

    await page.locator("#complaint-title").fill(TITULO);
    await page.locator("#complaint-description").fill(DESCRICAO);
    await page.locator("#complaint-location").fill(LOCAL);
    await continuar(page).click();
    await page.waitForTimeout(700);

    await page.getByRole("button", { name: "Continuar sem foto" }).click();
    await page.waitForTimeout(700);

    await escolher(page, "Qual tipo de problema?", /Saúde/);
    await escolher(page, "Quão urgente é?", /Alta/);
    await escolher(page, "Quem mais está sendo afetado?", /Vizinhos e comunidade/);

    await page.getByRole("button", { name: "Enviar relato" }).click();
    await page
      .getByRole("heading", { name: /relato foi criado com sucesso/i })
      .waitFor({ timeout: 25_000 });
    return "relato criado";
  });

  await cronometrar("6. O relato aparece na lista da usuária", async () => {
    await page.goto(BASE + "/app/complaints", { waitUntil: "networkidle" });
    await page.getByText(TITULO).first().waitFor({ timeout: 15_000 });
    const relatos = (await (await page.request.get(BASE + "/api/complaints")).json()) as
      | Array<{ id: string; title: string }>
      | { complaints: Array<{ id: string; title: string }> };
    const lista = Array.isArray(relatos) ? relatos : relatos.complaints;
    const novo = lista.find((r) => r.title === TITULO);
    if (!novo) throw new Error("o relato não voltou na API da usuária");
    enderecoDoRelato = "/app/complaints/" + novo.id;
    return "visível na lista, com etiqueta Aberta";
  });

  // ── Ato 3: a empresa responde ────────────────────────────────────────────
  await sair(page);

  await cronometrar("7. Entrar como empresa", async () => {
    await entrarPelaTela(page, EMPRESA);
    return page.url().replace(BASE, "");
  });

  await cronometrar("8. Painel da empresa", async () => {
    await page.goto(BASE + "/app/company/dashboard", { waitUntil: "networkidle" });
    // `body`, e não `main`: o painel da empresa não tem marco `<main>`.
    await page.getByText("Reclamações recebidas").first().waitFor({ timeout: 20_000 });
    const texto = (await page.locator("body").innerText()).replace(/\s+/g, " ");
    const semResposta = /Sem\s*resposta\s*(\d+)/.exec(texto)?.[1];
    return semResposta ? `${semResposta} relatos sem resposta` : "painel carregado";
  });

  let enderecoDaEmpresa = "";
  await cronometrar("9. Abrir o relato novo na caixa da empresa", async () => {
    const resposta = await page.request.get(BASE + "/api/company/complaints");
    const corpo = (await resposta.json()) as
      | Array<{ id: string; title: string }>
      | { complaints: Array<{ id: string; title: string }> };
    const lista = Array.isArray(corpo) ? corpo : corpo.complaints;
    const alvo = lista.find((c) => c.title === TITULO);
    if (!alvo) throw new Error("o relato da usuária não chegou à empresa");
    enderecoDaEmpresa = "/app/company/complaints/" + alvo.id;
    await page.goto(BASE + enderecoDaEmpresa, { waitUntil: "networkidle" });
    await page.getByText(TITULO).first().waitFor({ timeout: 15_000 });
    return "aberto";
  });

  await cronometrar("10. Responder", async () => {
    await page.locator('textarea[placeholder="Escrever sua resposta..."]').fill(RESPOSTA_DA_EMPRESA);
    await page.getByRole("button", { name: "Enviar resposta" }).click();
    await page.getByText(RESPOSTA_DA_EMPRESA.slice(0, 40)).first().waitFor({ timeout: 20_000 });
    return "resposta publicada";
  });

  await cronometrar("11. Marcar como resolvido", async () => {
    const seletor = page.locator("#mudar-status");
    await seletor.selectOption("RESOLVED");
    await page.getByRole("button", { name: "Salvar" }).click();
    await page.waitForTimeout(2500);
    const situacao = await seletor.inputValue();
    if (situacao !== "RESOLVED") throw new Error("o status não mudou para RESOLVED");
    return "situação agora é Resolvida";
  });

  // ── Ato 4: a usuária vê a resposta ───────────────────────────────────────
  await sair(page);

  await cronometrar("12. Voltar como usuária e ver a resposta", async () => {
    await entrarPelaTela(page, USUARIA);
    await page.goto(BASE + enderecoDoRelato, { waitUntil: "networkidle" });
    await page.getByText(RESPOSTA_DA_EMPRESA.slice(0, 40)).first().waitFor({ timeout: 15_000 });
    return "a resposta da empresa está na conversa";
  });

  await cronometrar("13. Perfil público mostra o caso encerrado", async () => {
    await sair(page);
    await page.goto(BASE + "/company/norte-engenharia-demo", { waitUntil: "networkidle" });
    await page.getByText(TITULO).first().waitFor({ timeout: 15_000 });
    return "o relato aparece na página pública da empresa";
  });

  // ── Ato 5: administração ─────────────────────────────────────────────────
  await cronometrar("14. Área administrativa", async () => {
    await entrarPelaTela(page, ADMIN);
    await page.goto(BASE + "/app/admin", { waitUntil: "networkidle" });
    const titulo = await page.locator("h1, h2").first().innerText();
    return titulo.replace(/\s+/g, " ").slice(0, 50);
  });

  const total = (Date.now() - abertura) / 1000;
  await contexto.close();
  await navegador.close();

  // ── O relatório ──────────────────────────────────────────────────────────
  console.log("\n" + "─".repeat(66));
  const clique = passos.reduce((s, p) => s + p.segundos, 0);
  console.log(`Tempo de máquina: ${clique.toFixed(0)}s (${(clique / 60).toFixed(1)} min)`);
  console.log(`Tempo total do ensaio: ${total.toFixed(0)}s`);
  console.log(
    "\nA demonstração ao vivo é mais lenta: some o tempo de fala. A regra que usei\n" +
      "no roteiro é dobrar o tempo de máquina e arredondar para cima."
  );

  const maisLento = [...passos].sort((a, b) => b.segundos - a.segundos)[0];
  console.log(`\nPasso mais lento: ${maisLento.nome} (${maisLento.segundos.toFixed(1)}s)`);

  if (tropecos.length) {
    console.log(`\n${tropecos.length} tropeço(s):`);
    tropecos.forEach((t) => console.log("  - " + t));
    process.exitCode = 1;
  } else {
    console.log("\nNenhum tropeço. O roteiro inteiro está de pé.");
  }
}

main().catch((erro) => {
  console.error(erro);
  process.exit(1);
});
