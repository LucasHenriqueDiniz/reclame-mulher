import { expect, test } from "@playwright/test";

import { SENHA } from "./fixtures/auth";

/**
 * Nenhuma rota pública entrega credencial.
 *
 * Nasceu da task `63`. Fotografando telas para o Manual de Uso, abri `/ajuda`
 * **sem estar logada** e encontrei uma página de depuração que listava as
 * contas do seed e imprimia a senha padrão com botão de copiar — a de
 * administração inclusive. Ela era pública no `src/middleware.ts`, não tinha
 * trava de ambiente, e não era linkada de lugar nenhum, então ninguém ia
 * esbarrar nela navegando.
 *
 * Este arquivo existe para que isso não volte em silêncio.
 *
 * **O que ele cobre e o que não cobre.** A suíte roda contra o servidor de
 * desenvolvimento, então não dá para verificar aqui que a rota some em
 * produção — a trava de `src/app/ajuda/page.tsx` só age quando
 * `NODE_ENV === "production"`. O que dá para verificar, e é o que importa mais,
 * é que **nenhuma senha aparece no HTML servido**, em nenhum ambiente. Se a
 * senha não está lá, a trava vira segunda linha de defesa em vez de única.
 */

/** Páginas que qualquer visitante alcança sem sessão. */
const ROTAS_PUBLICAS = [
  "/",
  "/ajuda",
  "/login",
  "/register",
  "/companies",
  "/company/construtora-x",
  "/blog",
  "/search",
  "/terms",
  "/privacy",
];

test.describe("rotas públicas não entregam credencial", () => {
  for (const rota of ROTAS_PUBLICAS) {
    test(`${rota} não contém a senha do seed`, async ({ request }) => {
      const resposta = await request.get(rota);
      expect(resposta.ok(), `${rota} respondeu ${resposta.status()}`).toBeTruthy();

      const html = await resposta.text();
      expect(
        html.includes(SENHA),
        `${rota} devolveu a senha do seed no HTML. Credencial não pode ser servida.`
      ).toBe(false);
    });
  }
});

test("a página de apoio não lista e-mail de conta", async ({ page }) => {
  await page.goto("/ajuda");
  const texto = await page.locator("body").innerText();

  // Os e-mails das contas do seed também saem: juntos com a senha eles são o
  // par completo, e sozinhos ainda dizem quem existe e como se chama o admin.
  for (const conta of [
    "maria@exemplo.com",
    "ana@exemplo.com",
    "empresa@construtorax.com",
    "admin@comunicamulher.com.br",
  ]) {
    expect(texto, `a página de apoio ainda mostra ${conta}`).not.toContain(conta);
  }
});
