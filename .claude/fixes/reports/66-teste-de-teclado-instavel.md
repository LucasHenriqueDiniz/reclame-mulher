# Relatório — [66] O teste de teclado do assistente falha de vez em quando

- **Data:** 2026-08-27
- **Status:** done
- **Iterações de debug:** 0

## A corrida, e a medida dela

O trecho da etapa 4 mandava as três teclas em sequência direta:

```ts
await page.keyboard.press("Enter");      // abre a lista do Radix
await page.keyboard.press("ArrowDown");  // move para a primeira opção
await page.keyboard.press("Enter");      // escolhe
```

O Radix monta a lista num portal e só então move o foco para dentro dela. Seta
que chega antes disso cai no gatilho, que já está aberto, e a escolha não
acontece.

Em vez de aceitar a explicação, **medi a janela**. Instrumentei o teste para
cronometrar, a cada abertura, quanto tempo passa entre o `Enter` e a lista
existir de fato — 30 aberturas, nos dois viewports:

| | |
|---|---|
| mínimo | 27 ms |
| mediana | 35 ms |
| máximo | 46 ms |

São de 27 a 46 milissegundos em que o `ArrowDown` do código antigo era disparado
**às cegas**. Numa máquina ociosa ele quase sempre chegava tarde o bastante para
dar certo; sob a carga de uma suíte de 470 testes, às vezes não. É exatamente o
formato de uma falha que "acontece de vez em quando".

A instrumentação foi removida depois de medir — ela existiu para produzir este
número, não para ficar.

## A correção

```ts
async function escolherPrimeiraOpcao(page: Page, id: string) {
  await page.keyboard.press("Enter");
  await expect(page.locator(id), `${id} não abriu`).toHaveAttribute("data-state", "open");
  await expect(page.getByRole("listbox"), `a lista de ${id} não montou`).toBeVisible();

  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");

  await expect(page.locator(id)).not.toContainText("Escolha uma opção");
}
```

Os dois sinais são de camadas diferentes **de propósito**, e vale dizer por quê:
`data-state="open"` é o gatilho declarando que abriu — que é o que a task
sugeria — e a `listbox` visível é a lista existindo no portal. É a segunda que
importa para o teclado: é ela que precisa estar montada para a seta ter onde
cair. Esperar só o atributo seria confiar em que os dois acontecem no mesmo
quadro.

O laço dos três campos ficou de três linhas de tecla para uma chamada, e a
mensagem de falha agora diz **qual** dos dois passos não aconteceu.

## A outra spec: conferida, e não precisa

Critério 3. `e2e/complaint-create.spec.ts` mexe nos mesmos três campos:

```ts
async function escolher(page: Page, rotulo: string, opcao: RegExp) {
  const gatilho = page.locator(`label:has-text("${rotulo}") + button`);
  await gatilho.click();
  await page.getByRole("option", { name: opcao }).click();
```

Não tem a mesma corrida, e a razão é do Playwright, não do teste: `click()`
espera o elemento existir e ficar acionável antes de clicar. O segundo `click`
**é** a espera pela montagem da lista. Tecla, ao contrário, é enviada para onde
o foco estiver agora — sem esperar por nada.

Uma varredura por `ArrowDown` e por `data-state` no resto de `e2e/` não achou
outro caso.

## Verificação

| Comando | Resultado |
|---|---|
| `npx tsc --noEmit` | ✅ 0 erros |
| `npx eslint src e2e --max-warnings 9999` | ✅ 0 erros, 0 avisos |
| `keyboard.spec.ts --repeat-each=5`, nos dois viewports | ✅ **30 de 30**, em 3,1 min |
| `npx vitest run` | ✅ 31 de 31 |
| suíte inteira | ✅ **469 passando, 3 pulados** — sem mudança |

## Critérios de aceite

- [x] **O teste espera o estado aberto do `select` antes de navegar por
      teclado** — e espera também a lista existir, que é o sinal que a tecla
      precisa.
- [x] **`--repeat-each=5` passa nos dois viewports** — 30 execuções, todas
      passando.
- [x] **Se o mesmo padrão existir em outra spec, é corrigido junto ou fica
      registrado por que não precisa** — `complaint-create.spec.ts` usa clique,
      e clique do Playwright já espera; está escrito acima e no comentário do
      helper.

## Uma ressalva honesta sobre o que foi provado

`--repeat-each=5` passando **não prova** que a instabilidade acabou: ela
aparecia sob a carga da suíte inteira, não em execução isolada — foi por isso
que a task `58` a viu uma vez e não conseguiu reproduzi-la depois.

O que sustenta a correção não é a contagem de repetições: é a **causa ter sido
medida e removida**. Havia uma janela de até 46 ms em que a tecla ia para o
lugar errado; agora não há janela, porque o teste espera a lista existir. Se
esta falha voltar, não será por este motivo.

## Pendências e achados fora de escopo

Nenhum achado novo. Fica a nota de que a task `68` — a outra instabilidade
registrada, um `ECONNRESET` no login sob carga — **continua aberta e não tem
relação com esta**: aquela é de transporte, esta era de sincronização de
interface.
