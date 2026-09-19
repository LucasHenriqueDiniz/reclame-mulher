import type { Page } from "@playwright/test";

/**
 * The screens that end up as figures in the end-user manual and in the
 * scholarship report's Results section.
 *
 * This list is the single source of truth for both halves of the delivery:
 * `screens/capture.spec.ts` drives a browser through it to write the PNGs, and
 * `scripts/generate-docx.ts` reads the same list to place each figure
 * under its caption. Adding a screen here is the only edit either one needs.
 *
 * `caption` is Portuguese on purpose. It is read by the advisor and by the
 * platform's users, so it is product text, not repository prose — the same
 * divergence `docs/architecture/ARCHITECTURE.md` records for the manuals.
 */

/**
 * Which context the screen is captured in. The four first values are the roles
 * the manual describes; the last two are accounts that are signed in but have
 * not finished onboarding, which is the only state in which step 2 of either
 * onboarding wizard can be reached. See `e2e/seed-credentials.ts`.
 */
export type ScreenRole =
  | "public"
  | "person"
  | "company"
  | "admin"
  | "personOnboarding"
  | "companyOnboarding";

export interface Screen {
  /** File name, without extension, under assets/telas/. Ordered by the prefix. */
  id: string;
  /** Which signed-in account sees this screen. */
  role: ScreenRole;
  /** Where it lives. Omit when `open` navigates by clicking instead. */
  path?: string;
  /** Section heading in the generated document. */
  section: string;
  /** Figure caption, in Portuguese. */
  caption: string;
  /** Whole scrollable page rather than the 1440x900 viewport. */
  fullPage?: boolean;
  /** Reaches screens with no fixed URL — a detail page, a wizard step. */
  open?: (page: Page) => Promise<void>;
}

/**
 * Opens one named report out of a list.
 *
 * Picking the first row instead would make the figure depend on how many
 * reports the seed happens to hold and on the one this capture run creates
 * itself in the wizard — the caption would stop describing the picture. These
 * two titles come from `scripts/seed.ts`.
 */
async function openFromList(page: Page, hrefPrefix: string, title: string): Promise<void> {
  await page
    .locator(`a[href^="${hrefPrefix}"]`)
    .filter({ hasText: title })
    .first()
    .click();
  await page.waitForURL((url) => url.pathname.startsWith(hrefPrefix) && url.pathname !== hrefPrefix);
}

/**
 * Walks the four-step wizard as far as `upTo`, so each step can be captured as
 * its own figure from a clean context.
 *
 * The steps repeat rather than sharing one session on purpose: a figure that
 * depends on the figure before it having been taken is a figure that breaks
 * the day someone captures a single screen. The selectors are the ones
 * `e2e/04-person-create-complaint.spec.ts` already exercises.
 */
async function openWizard(page: Page, upTo: 1 | 2 | 3 | 4 | 5): Promise<void> {
  await page.goto("/app/complaints/new");

  await page.getByRole("button", { name: "Buscar", exact: true }).click();
  await page.locator("#company-search").fill("Construtora");
  await page.getByRole("button", { name: "Selecionar Construtora X" }).click();
  await settleWizardStep(page, 1);
  if (upTo === 1) return;

  await page.locator("#previous-complaint-no").click();
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await settleWizardStep(page, 2);
  if (upTo === 2) return;

  await page.locator("#complaint-title").fill("Poeira da obra entrando em casa");
  await page
    .locator("#complaint-description")
    .fill(
      "A obra levanta poeira o dia inteiro e ela entra pelas janelas. " +
        "Minha filha tem asma e passou a semana com crise."
    );
  await page.locator("#complaint-location").fill("Rua das Flores, 123 - São Paulo");
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
  await settleWizardStep(page, 3);
  if (upTo === 3) return;

  await page.getByRole("button", { name: "Continuar sem foto" }).click();
  await settleWizardStep(page, 4);
  if (upTo === 4) return;

  await selectOption(page, "Qual tipo de problema?", "Saúde");
  await selectOption(page, "Quão urgente é?", "Alta — precisa de solução rápida");
  await selectOption(page, "Quem mais está sendo afetado?", "Minha família");
  await page.getByRole("button", { name: "Enviar relato" }).click();
  await page.getByRole("heading", { name: "Seu relato foi criado com sucesso!" }).waitFor();
}

/**
 * Opens one tab of the settings page.
 *
 * The tabs are client state, not routes: `/app/settings/account` and
 * `/app/settings/security` are both `redirect("/app/settings")`, so navigating
 * to them captured the same screen three times over. Clicking the tab also
 * makes each figure independent of whichever tab the page opens on by default.
 */
async function openSettingsTab(page: Page, tab: "Informações" | "Senha"): Promise<void> {
  await page.goto("/app/settings");
  await page.getByRole("button", { name: tab, exact: true }).click();
}

/**
 * Waits for the wizard to come to rest on `step`, squarely inside its frame.
 *
 * Two different things were cutting these figures in half, and both are here.
 *
 * The slide: the four steps sit side by side in one strip, and changing step
 * animates `transform: translateX(-(step - 1) * 100%)` on that strip for
 * 500ms. `networkidle` cannot see that — the data arrived long before the
 * pixels stopped — so the figures were taken mid-slide. `m41` is the
 * horizontal offset of the computed transform matrix, in pixels: the slide is
 * over when it reaches the resting offset, and `ease-out` never overshoots, so
 * reaching it once is enough.
 *
 * The second wait is a regression check, not a wait. Selecting a company in the
 * search dialog used to leave the clipping frame scrolled 41px to the right for
 * the rest of the wizard, and every step after it was drawn 41px too far left.
 * The wizard now undoes that scroll itself, so this asserts the step really does
 * line up with its frame instead of a capture-side fix-up making it line up.
 */
async function settleWizardStep(page: Page, step: 1 | 2 | 3 | 4): Promise<void> {
  const strip = page.locator('div[style*="translateX"]', {
    has: page.getByRole("heading", { name: "Conte o que aconteceu" }),
  });

  const element = await strip.elementHandle();
  if (!element) {
    throw new Error("The complaint wizard's step strip is not on the page.");
  }

  try {
    await page.waitForFunction(
      ([node, targetStep]) => {
        const frame = node.parentElement;
        if (!frame) return false;
        const transform = getComputedStyle(node).transform;
        const offset = transform === "none" ? 0 : new DOMMatrixReadOnly(transform).m41;
        const resting = -(targetStep - 1) * frame.getBoundingClientRect().width;
        return Math.abs(offset - resting) < 0.5;
      },
      [element, step] as const,
      { timeout: 15_000 }
    );

    await page.waitForFunction(
      ([node, targetStep]) => {
        const frame = node.parentElement;
        const current = node.children[targetStep - 1];
        if (!frame || !current) return false;
        return Math.abs(current.getBoundingClientRect().left - frame.getBoundingClientRect().left) < 0.5;
      },
      [element, step] as const,
      { timeout: 15_000 }
    );
  } finally {
    await element.dispose();
  }
}

/**
 * The classification fields are Radix selects: a label and a combobox trigger
 * rendered as siblings, so the label's parent is the field.
 */
async function selectOption(page: Page, label: string, option: string): Promise<void> {
  const field = page.locator("label", { hasText: label }).first().locator("xpath=..");
  await field.getByRole("combobox").click();
  await page.getByRole("option", { name: option }).click();
}

const SECTION_PUBLIC = "1. Acesso e cadastro";
const SECTION_CONTENT = "2. Conteúdo público";
const SECTION_PERSON = "3. Área da usuária";
const SECTION_COMPANY = "4. Área da empresa";
const SECTION_ADMIN = "5. Área administrativa";

export const SCREENS: Screen[] = [
  // 1. Acesso e cadastro
  {
    id: "01-home",
    role: "public",
    path: "/",
    section: SECTION_PUBLIC,
    caption: "Página inicial da plataforma, primeiro contato de quem ainda não tem cadastro.",
  },
  {
    id: "02-login",
    role: "public",
    path: "/login",
    section: SECTION_PUBLIC,
    caption: "Tela de login, comum aos três perfis de acesso.",
  },
  {
    id: "03-cadastro",
    role: "public",
    path: "/register",
    section: SECTION_PUBLIC,
    // /register is not a form: it asks which of the two accounts to create and
    // hands the visitor to the matching wizard. The form is step 1 of each.
    caption:
      "Início do cadastro: a plataforma pergunta como a conta será usada, como pessoa ou como empresa.",
  },
  {
    id: "04-onboarding-perfil",
    role: "public",
    path: "/onboarding/role",
    section: SECTION_PUBLIC,
    caption: "Escolha do perfil no primeiro acesso: pessoa ou empresa.",
  },
  {
    id: "05-onboarding-pessoa-etapa1",
    role: "public",
    path: "/onboarding/person/step1",
    section: SECTION_PUBLIC,
    caption: "Cadastro da usuária, etapa 1: dados pessoais.",
  },
  {
    id: "06-onboarding-pessoa-etapa2",
    // Step 2 sends a visitor with no session to /login, so this screen cannot
    // be captured as "public" — it came out as a byte-for-byte copy of the
    // login figure. The account is signed in and mid-onboarding, which is the
    // state a real user is in when she sees this page.
    role: "personOnboarding",
    path: "/onboarding/person/step2",
    section: SECTION_PUBLIC,
    caption:
      "Cadastro da usuária, etapa 2: endereço, contato e como conheceu a plataforma.",
  },
  {
    id: "07-onboarding-empresa-etapa1",
    role: "public",
    path: "/onboarding/company/step1",
    section: SECTION_PUBLIC,
    caption: "Cadastro da empresa, etapa 1: identificação.",
  },
  {
    id: "08-onboarding-empresa-etapa2",
    // Same guard as step 2 of the person's wizard, same fix.
    role: "companyOnboarding",
    path: "/onboarding/company/step2",
    section: SECTION_PUBLIC,
    caption:
      "Cadastro da empresa, etapa 2: responsável, contato e endereço da sede.",
  },

  // 2. Conteúdo público
  {
    id: "09-busca-empresas",
    role: "public",
    section: SECTION_CONTENT,
    caption: "Busca de empresas cadastradas na plataforma.",
    // /search with no query renders its empty state — "Digite algo para
    // buscar" — which is not the screen the caption promises. The term is a
    // seeded company name, so the figure shows the result list itself.
    open: async (page) => {
      await page.goto("/search?q=Construtora&scope=companies");
      await page.getByRole("heading", { name: /^Empresas \(/ }).waitFor();
    },
  },
  {
    id: "10-perfil-publico-empresa",
    role: "public",
    path: "/company/construtora-x",
    section: SECTION_CONTENT,
    caption: "Perfil público de uma empresa, com histórico de reclamações e indicadores.",
    fullPage: true,
  },
  {
    id: "11-blog",
    role: "public",
    path: "/blog",
    section: SECTION_CONTENT,
    caption: "Blog da plataforma, com materiais de orientação e casos.",
    fullPage: true,
  },
  {
    id: "12-blog-post",
    role: "public",
    path: "/blog/como-reclamar-com-seguranca",
    section: SECTION_CONTENT,
    caption: "Leitura de uma publicação do blog.",
    fullPage: true,
  },
  {
    id: "13-manuais",
    role: "public",
    path: "/manuais",
    section: SECTION_CONTENT,
    caption: "Índice dos manuais da plataforma, disponível sem necessidade de login.",
  },
  // /ajuda was dropped from this list on purpose and must not be added back:
  // it is the development page, and the figure taken of it showed four test
  // accounts and the password they share, printed on screen. These figures end
  // up in documents that circulate, which is no place for credentials.

  // 3. Área da usuária
  {
    id: "15-painel-usuaria",
    role: "person",
    path: "/app",
    section: SECTION_PERSON,
    caption: "Painel da usuária após o login, com suas reclamações e situação de cada uma.",
    fullPage: true,
  },
  {
    id: "16-lista-reclamacoes",
    role: "person",
    path: "/app/complaints",
    section: SECTION_PERSON,
    caption: "Lista completa das reclamações registradas pela usuária.",
  },
  {
    id: "17-nova-reclamacao-etapa1",
    role: "person",
    section: SECTION_PERSON,
    caption:
      "Registro de uma reclamação, etapa 1 de 4: escolha da empresa e histórico do problema.",
    open: (page) => openWizard(page, 1),
  },
  {
    id: "17b-nova-reclamacao-etapa2",
    role: "person",
    section: SECTION_PERSON,
    caption: "Registro de uma reclamação, etapa 2 de 4: descrição do que aconteceu e local.",
    open: (page) => openWizard(page, 2),
  },
  {
    id: "17c-nova-reclamacao-etapa3",
    role: "person",
    section: SECTION_PERSON,
    caption: "Registro de uma reclamação, etapa 3 de 4: envio de fotos, opcional.",
    open: (page) => openWizard(page, 3),
  },
  {
    id: "17d-nova-reclamacao-etapa4",
    role: "person",
    section: SECTION_PERSON,
    caption:
      "Registro de uma reclamação, etapa 4 de 4: classificação do tipo, da urgência e de quem é afetado.",
    fullPage: true,
    open: (page) => openWizard(page, 4),
  },
  {
    id: "17e-nova-reclamacao-protocolo",
    role: "person",
    section: SECTION_PERSON,
    caption:
      "Confirmação do envio, com o identificador que a usuária guarda para acompanhar o caso.",
    open: (page) => openWizard(page, 5),
  },
  {
    id: "18-detalhe-reclamacao",
    role: "person",
    section: SECTION_PERSON,
    caption:
      "Detalhe de uma reclamação ainda em aberto, com a descrição enviada e o campo de resposta.",
    fullPage: true,
    open: async (page) => {
      await page.goto("/app/complaints");
      await openFromList(page, "/app/complaints/", "Atraso na entrega de documentação da obra");
    },
  },
  // Settings is one page with three tabs — Informações, Senha, Deletar — and
  // /app/settings/account and /app/settings/security are both `redirect()` to
  // it. Three catalog entries pointing at those three URLs produced three
  // copies of the same picture. The two figures below are the two tabs the
  // manual actually describes, reached by clicking the tab rather than by a
  // URL that no longer exists; there is no third figure because there is no
  // separate screen for personal data — the Informações tab *is* it.
  {
    id: "19-configuracoes",
    role: "person",
    section: SECTION_PERSON,
    caption:
      "Configurações da conta, aba Informações: nome, e-mail, telefone e endereço da usuária.",
    // The address fields and the Salvar button sit below the fold at 1440x900,
    // and the caption names them.
    fullPage: true,
    open: (page) => openSettingsTab(page, "Informações"),
  },
  {
    id: "21-configuracoes-seguranca",
    role: "person",
    section: SECTION_PERSON,
    caption: "Configurações da conta, aba Senha: troca da senha de acesso.",
    open: (page) => openSettingsTab(page, "Senha"),
  },

  // 4. Área da empresa
  {
    id: "22-painel-empresa",
    role: "company",
    path: "/app/company/dashboard",
    section: SECTION_COMPANY,
    caption:
      "Painel da empresa: indicadores de atendimento e a lista das reclamações recebidas.",
    fullPage: true,
  },
  {
    id: "24-reclamacoes-empresa",
    role: "company",
    path: "/app/company/complaints",
    section: SECTION_COMPANY,
    caption: "Lista de reclamações sob responsabilidade da empresa.",
  },
  {
    id: "25-resposta-empresa",
    role: "company",
    section: SECTION_COMPANY,
    caption: "Tela de resposta da empresa a uma reclamação.",
    fullPage: true,
    open: async (page) => {
      await page.goto("/app/company/complaints");
      await openFromList(page, "/app/company/complaints/", "Barulho fora do horário permitido");
    },
  },
  {
    id: "26-perfil-empresa",
    role: "company",
    path: "/app/company/profile",
    section: SECTION_COMPANY,
    caption: "Edição do perfil público da empresa.",
    fullPage: true,
  },
  {
    id: "27-projetos-empresa",
    role: "company",
    path: "/app/company/projects",
    section: SECTION_COMPANY,
    caption: "Cadastro das obras e projetos da empresa.",
  },
  {
    id: "28-verificacao-empresa",
    role: "company",
    path: "/app/company/verification",
    section: SECTION_COMPANY,
    caption: "Processo de verificação da empresa na plataforma.",
  },

  // 5. Área administrativa
  {
    id: "29-painel-admin",
    role: "admin",
    path: "/app/admin",
    section: SECTION_ADMIN,
    caption: "Painel da administração da plataforma.",
    fullPage: true,
  },
  {
    id: "30-admin-empresas",
    role: "admin",
    path: "/app/admin/companies",
    section: SECTION_ADMIN,
    caption: "Gestão das empresas cadastradas e de suas verificações.",
  },
  {
    id: "31-admin-blog",
    role: "admin",
    path: "/app/admin/blog",
    section: SECTION_ADMIN,
    caption: "Gestão das publicações do blog.",
  },
  {
    id: "32-admin-auditoria",
    role: "admin",
    path: "/app/admin/audit",
    section: SECTION_ADMIN,
    caption: "Registro de auditoria das ações realizadas na plataforma.",
  },
];
