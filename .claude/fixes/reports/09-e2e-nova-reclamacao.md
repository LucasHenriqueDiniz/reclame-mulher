# Relatório — [09] E2E do wizard de criação de relato

- **Data:** 2026-08-26
- **Status:** done
- **Iterações de debug:** 0 (os 8 testes passaram na primeira execução)

## Resultado

**16 testes novos** (8 por projeto, desktop e mobile) cobrindo o fluxo central
da plataforma — o que a dissertação vai demonstrar na defesa.

| Caso | O que prova |
|---|---|
| Caminho feliz | as 4 etapas → tela de sucesso → relato aparece em `/app/complaints` |
| Etapa 2 bloqueia | título < 3 e descrição < 10 não avançam |
| Etapa 4 bloqueia | sem categoria, urgência e alcance não envia |
| Etapa 1 condicional | responder "sim" abre o campo "onde você reclamou" |
| Voltar preserva | etapa 3 → 2 mantém título, descrição e local |
| Botão voltar | não aparece na etapa 1, aparece da 2 em diante |
| Anexo > 5 MB | recusado com mensagem, sem chegar no upload |
| Anexo `.txt` | recusado por formato |

Total da suíte: **112 passando, 2 pulados** (o upload real), em 4,3 min.

## O manual está errado sobre os anexos

`MANUAL_PLATAFORMA.md` documenta **10 MB por arquivo e 50 MB no total**. O
código diz outra coisa:

```ts
// steps/step-three.tsx
maxFiles={3}
maxBytesPerFile={5 * 1024 * 1024}

// upload-dropzone.tsx
const allowed = ["image/png", "image/jpg", "image/jpeg", "application/pdf"];
```

**3 arquivos, 5 MB cada, só PNG/JPG/JPEG/PDF.** Escrevi os testes contra o
código, que é o que a usuária encontra. A correção do manual fica na task `21`,
que já é a de consolidar documentação — anotado lá.

## Dois defeitos de acessibilidade encontrados no caminho

Não fui procurar; apareceram porque escrever o teste obrigou a entender o DOM.
Os dois estão medidos, não supostos.

### `52` — as quatro etapas ficam no DOM ao mesmo tempo

O wizard é um carrossel com `translateX`; o que esconde as etapas fora da vez é
só `overflow-hidden`. Medido, estando na etapa 1:

```
PAINEIS: [
  {"etapa":1,"focaveis":3,"ariaHidden":null,"inert":false},
  {"etapa":2,"focaveis":3,"ariaHidden":null,"inert":false},
  {"etapa":3,"focaveis":2,"ariaHidden":null,"inert":false},
  {"etapa":4,"focaveis":6,"ariaHidden":null,"inert":false}
]
FOCO: {"focado":"complaint-title","visivelParaPlaywright":true}
```

11 controles fora da tela continuam focáveis. Quem navega por Tab sai do
"Continuar" e cai em campos que não vê; leitor de tela anuncia as quatro etapas
de uma vez.

### `53` — os três selects da etapa 4 não têm rótulo associado

`ComplaintField` gera `<label for="urgency-level">`, mas o Radix `SelectTrigger`
nunca recebe esse id:

```
{"id":"impact-category","existeElementoComEsseId":false,"existeLabelApontando":true}
{"id":"urgency-level",  "existeElementoComEsseId":false,"existeLabelApontando":true}
{"id":"impact-scope",   "existeElementoComEsseId":false,"existeLabelApontando":true}
{"id":"complaint-title","existeElementoComEsseId":true, "existeLabelApontando":true}
```

Três rótulos órfãos e três combobox sem nome acessível. Os campos de texto estão
corretos — é específico do `ComplaintSelect`.

**Não corrigi nenhum dos dois aqui.** Esta task é de teste; mexer no wizard
enquanto escrevo o teste dele tira o valor do teste. Ficam registrados como
tasks `52` e `53`, na fase de acessibilidade, com evidência e critério de
aceite. A task `12` (varredura axe) vai reencontrá-los — e agora tem com o que
comparar.

## Duas decisões de escrita do teste

### Como saber em que etapa o wizard está

Como as quatro etapas coexistem no DOM, `toBeVisible()` não distingue etapa — o
campo da etapa 2 é preenchível já na etapa 1. O único sinal confiável é o
deslocamento do trilho:

```ts
async function etapaAtual(page: Page): Promise<number> {
  const estilo = await page.locator('[style*="translateX"]').first().getAttribute("style");
  const deslocamento = /translateX\(-(\d+(?:\.\d+)?)%\)/.exec(estilo ?? "");
  return deslocamento ? Math.round(Number(deslocamento[1]) / 100) + 1 : 1;
}
```

É acoplado à implementação, e isso está escrito no arquivo. Quando a task `52`
trocar o carrossel por renderização condicional, este helper some e o teste
fica mais simples.

### Como achar os selects sem rótulo

`getByLabel` não funciona (defeito `53`), então o helper procura por adjacência
real — o gatilho é irmão imediato do `<label>`:

```ts
const gatilho = page.locator(`label:has-text("${rotulo}") + button`);
```

A task `53` pede explicitamente que isso vire `getByLabel` depois da correção.

## Limpeza do banco: por que precisou de acesso direto

A plataforma **não tem rota de exclusão de relato**. Sem limpeza, cada execução
deixaria relatos permanentes — e `is_public` é `true` por padrão, então eles
apareceriam na home e no perfil da empresa. O banco de seed é o que vai ser
mostrado na defesa; teste não pode sujá-lo.

`e2e/fixtures/db.ts` apaga por prefixo de título:

```ts
export const MARCA_E2E = "[e2e]";
DELETE FROM complaints WHERE title LIKE '[e2e]%'
```

Roda no `beforeAll` **e** no `afterAll`: se uma execução morrer no meio, o lixo
dela sai na próxima em vez de ficar para sempre. Anexos e mensagens somem junto,
por `ON DELETE CASCADE`.

Não dá para reaproveitar `src/db/client.ts`: ele começa com `import
"server-only"`. E é bom que não dê — o Playwright roda no Node, não no servidor.

Verificado depois da suíte completa:

```
sobras [e2e]: 0
total de relatos: 3
mais recentes: Atraso na entrega de documentação da obra | Barulho fora do
horário permitido | Falta de sinalização na via
```

O banco voltou exatamente ao estado do seed. De quebra, isso mede uma coisa da
task `23`: **o seed tem 3 relatos**, o que é pouco para uma demonstração.

## O upload real ficou fora da suíte principal

O anexo válido sobe para o UploadThing, que é serviço externo. Teste que depende
de rede de terceiro vira falha intermitente, e suíte intermitente deixa de ser
levada a sério. Fica atrás de uma variável:

```bash
E2E_UPLOAD=1 npx playwright test e2e/complaint-create.spec.ts
```

Os dois casos de recusa (tamanho e formato) **não** dependem de rede: a
validação acontece antes do upload, então arquivo recusado nunca sai da máquina.
Esses ficam na suíte principal, onde importam.

## Um tropeço de ambiente, não de código

A primeira execução falhou com `EADDRINUSE` na porta 5000. Havia um dev server
de uma execução anterior ainda de pé, respondendo **500** em tudo — e o
`reuseExistingServer` do Playwright não reaproveita servidor quebrado.

É a armadilha já documentada no `LOOP.md`: `npm run build` e `npm run dev`
disputam o `.next`. Matei o processo, apaguei `.next` e subi de novo. Nenhuma
linha de código envolvida.

## Verificação

| Comando | Resultado |
|---|---|
| `npx playwright test e2e/complaint-create.spec.ts` | ✅ 8/8 desktop, 8/8 mobile |
| `npx playwright test` (suíte inteira) | ✅ **112 passando, 2 pulados**, 4,3 min |
| `npm run check` | ✅ exit 0 (typecheck + lint + 18 de unidade) |
| `npm run build` | ✅ passa |
| Sobras no banco | ✅ 0 |

## Critérios de aceite

- [x] Caminho feliz passa e o relato criado é encontrado na listagem.
- [x] Ao menos 2 casos de validação passam — passaram 3.
- [x] Nenhum teste depende de estado deixado por outro: cada um abre o wizard
      do zero, com título único, e a limpeza fecha o ciclo.
