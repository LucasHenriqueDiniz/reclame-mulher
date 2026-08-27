import { expect, test } from "@playwright/test";

import { entrarViaApi } from "./fixtures/auth";
import { limparRelatosDeTeste } from "./fixtures/db";
import { criarRelato, empresaDaConta } from "./fixtures/complaints";

/**
 * O convite para relatar aparece para quem pode relatar, e leva ao lugar certo.
 *
 * Pré-requisito: `npm run db:seed`.
 *
 * Nasceu da task `57`, que encontrou duas coisas no mesmo cartão da tela
 * `/app/company/complaints/[id]`:
 *
 * 1. ele aparecia **para a empresa**, perguntando "está querendo fazer um
 *    relato sobre Construtora X?" — e essa página só abre para a própria
 *    empresa dona do relato, então o convite era sempre para reclamar de si
 *    mesma;
 * 2. o link montava `complaints/new?company=` com o **nome** da empresa, e o
 *    assistente espera o **id**. Era o único dos seis lugares fora do padrão.
 *
 * O cartão foi removido dali. O que este arquivo trava são as duas metades: que
 * ele não volte naquela tela, e que o parâmetro continue sendo id em todo lugar
 * onde o convite existe de verdade.
 */

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

test.beforeAll(async () => {
  await limparRelatosDeTeste();
});

test.afterAll(async () => {
  await limparRelatosDeTeste();
});

test("a empresa não é convidada a reclamar de si mesma", async ({ page, request }) => {
  await entrarViaApi(request, "empresa");
  const empresaId = await empresaDaConta(request);

  await entrarViaApi(request, "pessoa");
  const { id, titulo } = await criarRelato(request, {
    empresaId,
    assunto: "convite na tela da empresa",
  });

  await entrarViaApi(page.request, "empresa");
  await page.goto(`/app/company/complaints/${id}`);

  // A tela é a certa antes de afirmar o que não está nela: uma página em branco
  // também passaria na asserção de ausência.
  await expect(page.getByRole("heading", { name: titulo })).toBeVisible();

  await expect(
    page.locator('a[href*="/app/complaints/new"]'),
    "a tela da empresa voltou a convidar a empresa a relatar contra si mesma"
  ).toHaveCount(0);
});

test("no perfil público, o convite leva o id da empresa e não o nome", async ({ page }) => {
  // Sem sessão: é a visitante que o convite serve. O `!isMember` do perfil
  // público continua valendo — quem é da empresa não vê o cartão.
  await page.goto("/company/construtora-x");

  const convites = page.locator('a[href*="/app/complaints/new?company="]');
  const quantos = await convites.count();
  expect(quantos, "o perfil público deixou de convidar quem visita a relatar").toBeGreaterThan(0);

  for (let i = 0; i < quantos; i++) {
    const href = (await convites.nth(i).getAttribute("href")) ?? "";
    const empresa = new URL(href, "http://localhost").searchParams.get("company") ?? "";
    expect(
      empresa,
      `o convite passou "${empresa}" em company=. O assistente espera o id da empresa — ` +
        "passar o nome faz ele abrir sem empresa escolhida, que é o defeito da task 57"
    ).toMatch(UUID);
  }
});
