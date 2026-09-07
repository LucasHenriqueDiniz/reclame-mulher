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

export type ScreenRole = "public" | "person" | "company" | "admin";

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
  if (upTo === 1) return;

  await page.locator("#previous-complaint-no").click();
  await page.getByRole("button", { name: "Continuar", exact: true }).click();
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
  if (upTo === 3) return;

  await page.getByRole("button", { name: "Continuar sem foto" }).click();
  if (upTo === 4) return;

  await selectOption(page, "Qual tipo de problema?", "Saúde");
  await selectOption(page, "Quão urgente é?", "Alta — precisa de solução rápida");
  await selectOption(page, "Quem mais está sendo afetado?", "Minha família");
  await page.getByRole("button", { name: "Enviar relato" }).click();
  await page.getByRole("heading", { name: "Seu relato foi criado com sucesso!" }).waitFor();
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
    caption: "Formulário de criação de conta.",
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
    role: "public",
    path: "/onboarding/person/step2",
    section: SECTION_PUBLIC,
    caption: "Cadastro da usuária, etapa 2: preferências e privacidade.",
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
    role: "public",
    path: "/onboarding/company/step2",
    section: SECTION_PUBLIC,
    caption: "Cadastro da empresa, etapa 2: dados complementares.",
  },

  // 2. Conteúdo público
  {
    id: "09-busca-empresas",
    role: "public",
    path: "/search",
    section: SECTION_CONTENT,
    caption: "Busca de empresas cadastradas na plataforma.",
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
  {
    id: "14-ajuda",
    role: "public",
    path: "/ajuda",
    section: SECTION_CONTENT,
    caption: "Página de ajuda, com acessos rápidos às principais áreas.",
  },

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
  {
    id: "19-configuracoes",
    role: "person",
    path: "/app/settings",
    section: SECTION_PERSON,
    caption: "Configurações da conta da usuária.",
  },
  {
    id: "20-configuracoes-dados",
    role: "person",
    path: "/app/settings/account",
    section: SECTION_PERSON,
    caption: "Edição dos dados pessoais e das opções de privacidade.",
  },
  {
    id: "21-configuracoes-seguranca",
    role: "person",
    path: "/app/settings/security",
    section: SECTION_PERSON,
    caption: "Troca de senha e configurações de segurança.",
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
