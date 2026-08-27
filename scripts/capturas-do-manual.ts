/**
 * Capturas de tela do Manual de Uso.
 *
 * Rode com o servidor de PRODUÇÃO de pé (`npm run build && npm run start`) e o
 * banco populado (`npm run db:seed`):
 *
 *   node --import tsx scripts/capturas-do-manual.ts
 *
 * Por que produção e não `npm run dev`: o servidor de desenvolvimento desenha
 * um indicador do Next no canto da tela, e ele apareceria em toda captura do
 * manual.
 *
 * Todas as imagens saem de contas do seed. Nenhum dado pessoal real entra aqui
 * — é requisito da task `22`, não preferência.
 */
// De `@playwright/test`, e não de `playwright`: o pacote avulso não é
// dependência declarada deste projeto, e com pnpm isso não resolve.
import { chromium, type Browser, type Page } from "@playwright/test";
import { mkdir } from "node:fs/promises";

const BASE = "http://localhost:5000";
const SAIDA = "docs/manual/img";
const SENHA = process.env.E2E_SENHA ?? "senha123";

const DESKTOP = { width: 1280, height: 800 };
const CELULAR = { width: 375, height: 812 };

type Conta = "maria" | "ana" | "empresa" | null;
const EMAIL: Record<Exclude<Conta, null>, string> = {
  maria: "maria@exemplo.com",
  ana: "ana@exemplo.com",
  empresa: "empresa@construtorax.com",
};

let salvas = 0;

/** Desenha um anel em volta do elemento que o texto manda clicar. */
async function destacar(page: Page, seletor: string) {
  await page.addStyleTag({
    content:
      ".manual-destaque { outline: 3px solid #D81B60 !important; outline-offset: 3px !important; border-radius: 6px !important; }",
  });
  const alvo = page.locator(seletor).first();
  if ((await alvo.count()) === 0) {
    console.warn("  ! destaque não encontrado: " + seletor);
    return;
  }
  await alvo.evaluate((el) => el.classList.add("manual-destaque"));
  await alvo.scrollIntoViewIfNeeded();
}

async function capturar(
  page: Page,
  nome: string,
  opcoes: { paginaInteira?: boolean; destaque?: string; recorte?: string } = {}
) {
  if (opcoes.destaque) await destacar(page, opcoes.destaque);
  // Deixa animação e carregamento preguiçoso terminarem antes do obturador.
  await page.waitForTimeout(700);
  const caminho = SAIDA + "/" + nome + ".png";

  // `recorte` fotografa só um elemento. Serve para as etapas do assistente: a
  // página inteira tem 1280 px de largura para um cartão de 800, e o texto sai
  // pequeno demais no manual impresso.
  if (opcoes.recorte) {
    const alvo = page.locator(opcoes.recorte).first();
    if ((await alvo.count()) > 0) {
      await alvo.screenshot({ path: caminho });
      salvas += 1;
      console.log("  ok " + nome + ".png (recortado)");
      return;
    }
    console.warn("  ! recorte não encontrado, fotografando a página: " + opcoes.recorte);
  }

  if (!opcoes.paginaInteira) await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({
    path: caminho,
    fullPage: opcoes.paginaInteira ?? false,
  });
  salvas += 1;
  console.log("  ok " + nome + ".png");
}

/** O cartão branco que envolve o assistente de relato. */
const CARTAO_DO_ASSISTENTE = ".rounded-2xl.shadow-lg";

async function entrar(page: Page, conta: Exclude<Conta, null>) {
  const resposta = await page.request.post(BASE + "/api/auth/login", {
    data: { email: EMAIL[conta], password: SENHA },
  });
  if (!resposta.ok()) {
    throw new Error(
      "Login de " +
        conta +
        " falhou (" +
        resposta.status() +
        "). O banco foi populado? Rode: npm run db:seed"
    );
  }
}

async function novaAba(navegador: Browser, tela: typeof DESKTOP, conta: Conta) {
  const contexto = await navegador.newContext({
    viewport: tela,
    // 1, e não 2. A 2x o conjunto passava de 12 MB, e o manual precisa ser
    // distribuível por e-mail. A 1280 px de largura o texto já sai nítido na
    // tela e no papel.
    deviceScaleFactor: 1,
    locale: "pt-BR",
    hasTouch: tela.width < 768,
  });
  const page = await contexto.newPage();
  if (conta) await entrar(page, conta);
  return { contexto, page };
}

type Relato = { id: string; title: string; status: string };

/** Relatos da conta logada, para não depender de id fixo. */
async function relatosDe(page: Page): Promise<Relato[]> {
  const resposta = await page.request.get(BASE + "/api/complaints");
  if (!resposta.ok()) throw new Error("GET /api/complaints deu " + resposta.status());
  const corpo = (await resposta.json()) as Relato[] | { complaints: Relato[] };
  return Array.isArray(corpo) ? corpo : corpo.complaints;
}

const continuar = (page: Page) => page.getByRole("button", { name: "Continuar", exact: true });

async function escolher(page: Page, rotulo: string, opcao: RegExp) {
  const gatilho = page.locator('label:has-text("' + rotulo + '") + button');
  await gatilho.click();
  await page.getByRole("option", { name: opcao }).click();
}

// ─────────────────────────────────────────────────────────────────────────────

async function telasPublicas(navegador: Browser, tela: typeof DESKTOP, sufixo: string) {
  const { contexto, page } = await novaAba(navegador, tela, null);

  await page.goto(BASE + "/", { waitUntil: "networkidle" });
  await capturar(page, "01-home" + sufixo);

  await page.goto(BASE + "/companies", { waitUntil: "networkidle" });
  await capturar(page, "02-empresas" + sufixo);

  await page.goto(BASE + "/company/construtora-x", { waitUntil: "networkidle" });
  await capturar(page, "03-perfil-da-empresa" + sufixo);

  await page.goto(BASE + "/register", { waitUntil: "networkidle" });
  await capturar(page, "10-criar-conta" + sufixo);

  // O cartão "Continuar como pessoa" leva ao formulário de cadastro.
  await page.goto(BASE + "/onboarding/person/step1", { waitUntil: "networkidle" });
  await capturar(page, "11-dados-da-conta" + sufixo, { paginaInteira: true });

  await page.goto(BASE + "/login", { waitUntil: "networkidle" });
  await capturar(page, "12-entrar" + sufixo);

  // `/ajuda` NÃO entra no manual. Apesar do nome, é uma página de depuração que
  // imprime as contas do seed e a senha padrão — ver task `63`. Fotografá-la
  // colocaria credencial dentro de um documento feito para distribuir.

  await contexto.close();
}

async function telasDaUsuaria(navegador: Browser, tela: typeof DESKTOP, sufixo: string) {
  const { contexto, page } = await novaAba(navegador, tela, "maria");

  await page.goto(BASE + "/app/complaints", { waitUntil: "networkidle" });
  await capturar(page, "40-meus-relatos" + sufixo);

  const meus = await relatosDe(page);
  const aberto = meus.find((r) => r.status === "OPEN") ?? meus[0];
  const resolvido = meus.find((r) => r.status === "RESOLVED");

  if (aberto) {
    await page.goto(BASE + "/app/complaints/" + aberto.id, { waitUntil: "networkidle" });
    await capturar(page, "41-relato-aberto" + sufixo, { paginaInteira: true });
  }
  if (resolvido) {
    await page.goto(BASE + "/app/complaints/" + resolvido.id, { waitUntil: "networkidle" });
    await capturar(page, "50-relato-resolvido" + sufixo, { paginaInteira: true });
  }

  await contexto.close();
}

async function conversa(navegador: Browser, tela: typeof DESKTOP, sufixo: string) {
  // A Ana tem o relato que já recebeu resposta da empresa — é o que ilustra a
  // conversa. E ele é anônimo, o que de quebra mostra o recurso.
  const { contexto, page } = await novaAba(navegador, tela, "ana");
  const seus = await relatosDe(page);
  const respondido = seus.find((r) => r.status === "RESPONDED") ?? seus[0];
  if (respondido) {
    await page.goto(BASE + "/app/complaints/" + respondido.id, { waitUntil: "networkidle" });
    await capturar(page, "42-conversa-com-a-empresa" + sufixo, { paginaInteira: true });
  }
  await contexto.close();
}

async function assistenteDeRelato(navegador: Browser, tela: typeof DESKTOP, sufixo: string) {
  const { contexto, page } = await novaAba(navegador, tela, "maria");

  const empresas = (await (await page.request.get(BASE + "/api/companies")).json()) as Array<{
    id: string;
    name: string;
  }>;
  const empresa = empresas[0];

  await page.goto(BASE + "/app/complaints/new?company=" + empresa.id, {
    waitUntil: "networkidle",
  });
  await capturar(page, "30-etapa-1" + sufixo, { recorte: CARTAO_DO_ASSISTENTE });

  await continuar(page).click();
  await page.waitForTimeout(600);
  await page.locator("#complaint-title").fill("Barulho de obra depois das dez da noite");
  await page
    .locator("#complaint-description")
    .fill(
      "A obra começou há duas semanas e as máquinas trabalham até as duas da manhã. " +
        "Minha filha de seis anos não consegue dormir e eu preciso acordar às cinco para trabalhar."
    );
  await page.locator("#complaint-location").fill("Rua das Flores, 123 — Centro");
  await capturar(page, "31-etapa-2" + sufixo, { recorte: CARTAO_DO_ASSISTENTE });

  await continuar(page).click();
  await page.waitForTimeout(600);
  await capturar(page, "32-etapa-3" + sufixo, { recorte: CARTAO_DO_ASSISTENTE });

  await page.getByRole("button", { name: "Continuar sem foto" }).click();
  await page.waitForTimeout(600);
  await escolher(page, "Qual tipo de problema?", /Infraestrutura/);
  await escolher(page, "Quão urgente é?", /Média/);
  await escolher(page, "Quem mais está sendo afetado?", /Vizinhos e comunidade/);
  await capturar(page, "33-etapa-4" + sufixo, { recorte: CARTAO_DO_ASSISTENTE });

  // Não envia: o manual não precisa poluir o banco de demonstração.
  await contexto.close();
}

async function telasDaEmpresa(navegador: Browser, tela: typeof DESKTOP, sufixo: string) {
  const { contexto, page } = await novaAba(navegador, tela, "empresa");

  await page.goto(BASE + "/app/company/dashboard", { waitUntil: "networkidle" });
  await capturar(page, "60-painel-da-empresa" + sufixo, { paginaInteira: true });

  await page.goto(BASE + "/app/company/complaints", { waitUntil: "networkidle" });
  await capturar(page, "61-relatos-recebidos" + sufixo);

  const resposta = await page.request.get(BASE + "/api/company/complaints");
  if (resposta.ok()) {
    const corpo = (await resposta.json()) as Relato[] | { complaints: Relato[] };
    const lista = Array.isArray(corpo) ? corpo : corpo.complaints;
    const alvo = lista?.find((c) => c.status === "OPEN") ?? lista?.[0];
    if (alvo) {
      await page.goto(BASE + "/app/company/complaints/" + alvo.id, { waitUntil: "networkidle" });
      await capturar(page, "62-responder-relato" + sufixo, { paginaInteira: true });
    }
  } else {
    console.warn("  ! GET /api/company/complaints deu " + resposta.status());
  }

  await contexto.close();
}

async function main() {
  await mkdir(SAIDA, { recursive: true });
  const navegador = await chromium.launch();

  const alvos = [
    { tela: DESKTOP, sufixo: "", rotulo: "computador" },
    { tela: CELULAR, sufixo: "-celular", rotulo: "celular" },
  ];

  for (const { tela, sufixo, rotulo } of alvos) {
    console.log("\n== " + rotulo + " ==");
    await telasPublicas(navegador, tela, sufixo);
    await telasDaUsuaria(navegador, tela, sufixo);
    await conversa(navegador, tela, sufixo);
    await assistenteDeRelato(navegador, tela, sufixo);
    await telasDaEmpresa(navegador, tela, sufixo);
  }

  await navegador.close();
  console.log("\n" + salvas + " capturas em " + SAIDA + "/");
}

main().catch((erro) => {
  console.error(erro);
  process.exit(1);
});
