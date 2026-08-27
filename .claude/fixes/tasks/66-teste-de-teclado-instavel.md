# [66] O teste de teclado do assistente falha de vez em quando

| Campo | Valor |
|---|---|
| **ID** | `66` |
| **Fase** | `3 — Testes` |
| **Risco** | baixo (teste, não produto) |
| **Depende de** | — |
| **Achado em** | task `58` (`/api/me` devolvia 401) |
| **Estimativa** | pequena |

## O que foi encontrado

Numa execução da suíte completa, `e2e/keyboard.spec.ts:85` —
*"fluxo 2: criar um relato só com teclado"* — falhou **só no
`chromium-mobile`**, no terceiro dos três `select` da etapa 4:

```
Error: expect(locator).not.toContainText(expected) failed
Locator: locator('#impact-scope')
Expected substring: not "Escolha uma opção"
Received string: "Escolha uma opção"
```

Os dois primeiros `select` da mesma repetição passaram. Rodado de novo em
isolamento, com `--repeat-each=2`, passou nas duas.

## O que provavelmente é

O trecho não espera nada entre abrir a lista e escolher:

```ts
await page.keyboard.press("Enter");      // abre a lista do Radix
await page.keyboard.press("ArrowDown");  // move para a primeira opção
await page.keyboard.press("Enter");      // escolhe
```

O `Select` do Radix monta a lista num portal e só então move o foco para dentro
dela. Se as teclas chegarem antes disso, elas caem no gatilho — que já está
aberto — e a escolha não acontece. É corrida, não regra de negócio: nada no
produto depende de tempo aqui.

Por que só no celular: o viewport de 375 px rola a página para trazer o `select`
à vista antes de abrir, e é essa rolagem que às vezes atrasa a montagem o
suficiente.

## O que fazer

Esperar o estado aberto antes de mandar as setas. O próprio Radix expõe isso no
gatilho:

```ts
await page.keyboard.press("Enter");
await expect(page.locator(id)).toHaveAttribute("data-state", "open");
await page.keyboard.press("ArrowDown");
await page.keyboard.press("Enter");
```

Vale conferir se `e2e/complaint-create.spec.ts` tem o mesmo padrão — ela também
mexe nesses três campos, mas por clique, que não tem a mesma corrida.

## Por que não foi corrigido na hora

Apareceu durante a task `58`, que mexia em `/api/me` e no contrato de erro —
nada a ver com o assistente. O `LOOP.md` manda abrir task nova em vez de ampliar
o escopo, e uma correção de teste instável merece a sua própria verificação:
`--repeat-each` alto o bastante para a correção significar alguma coisa.

**Não é regressão da `58`.** O caminho é o mesmo antes e depois: no assistente a
usuária está logada, e para quem está logada `/api/me` já respondia 200.

## Critérios de aceite

- [ ] O teste espera o estado aberto do `select` antes de navegar por teclado.
- [ ] `npx playwright test e2e/keyboard.spec.ts --repeat-each=5` passa nos dois
      viewports.
- [ ] Se o mesmo padrão existir em outra spec, ou é corrigido junto, ou fica
      registrado por que não precisa.

## Nota

Instabilidade de teste é dívida cara: uma falha que "às vezes acontece" ensina
quem lê a suíte a reexecutar em vez de investigar, e a próxima falha de verdade
vai ser tratada do mesmo jeito.
