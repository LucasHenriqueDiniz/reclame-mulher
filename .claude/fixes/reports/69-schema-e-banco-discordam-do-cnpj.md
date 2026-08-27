# Relatório — [69] O schema diz que o CNPJ é opcional; o banco diz que não

- **Data:** 2026-08-27
- **Status:** done
- **Iterações de debug:** 1

## A decisão que a task pedia

A task pedia para escolher entre dois caminhos: tornar o CNPJ obrigatório no
código, ou tirar o `NOT NULL` do banco. **O produto já tinha escolhido** — em
dois lugares, escritos antes desta task:

| Onde | O que diz |
|---|---|
| `CreateCompanyDto` | `cnpj: z.string().min(14, "CNPJ é obrigatório e deve ter 14 dígitos")` |
| `POST /api/auth/register-company:19` | `cnpj: z.string().min(14)` |
| banco (`information_schema`) | `NOT NULL` |

Nenhuma empresa consegue nascer sem CNPJ. Os únicos dois lugares que diziam o
contrário eram `src/db/schema.ts:113` e o `UpdateCompanyProfileDto` — ou seja,
**a declaração e a edição estavam atrás do resto**. Nada de migração para tirar
`NOT NULL`: o banco estava certo.

## O defeito era maior do que o CNPJ

Lendo o DTO para corrigir o campo, o mesmo problema aparecia logo acima:

```ts
export const UpdateCompanyProfileDto = z.object({
  name: nullableTrimmedString,   // <-- também NOT NULL no banco
  cnpj: nullableTrimmedString,
```

`{"name": null}` produzia exatamente o mesmo `UPDATE ... SET name = NULL` e
exatamente o mesmo **500**. O comentário do próprio arquivo já registrava que
`name` é `NOT NULL` — a informação estava escrita ali e não tinha sido usada.
Corrigir só o CNPJ deixaria a irmã gêmea de pé.

## O que foi feito

**1. O schema passou a dizer a verdade.** `cnpj: text("cnpj").notNull().unique()`.

**2. O DTO passou a distinguir três coisas, e não duas.** O `opcional()` que a
task `56` introduziu existe para separar "não mandei o campo" de "quero limpar".
Só que limpar não vale para toda coluna. O novo `obrigatorioSeEnviado` mantém a
primeira distinção e recusa a segunda:

| Entrada | Antes | Agora |
|---|---|---|
| chave ausente | não mexe | não mexe |
| `null` | `SET campo = NULL` → **500** | 400, com mensagem |
| `""` ou só espaço | `SET campo = NULL` → **500** | 400, com mensagem |
| valor | grava | grava |

O CNPJ ganhou o seu próprio: normaliza para dígitos **antes** de validar, senão
`12.345.678/0001-99` reprovaria por tamanho. Com isso a rota perdeu o
`.replace(/\D/g, "")` que fazia à mão — a normalização passou a ser do DTO, no
mesmo lugar da validação.

**3. Um terceiro caminho, que o `tsc` encontrou sozinho.** Pôr `.notNull()` no
schema quebrou a compilação em `src/app/onboarding/company/step2/actions.ts`,
que lia o CNPJ de um metadado e o repassava podendo ser `null`:

```ts
const cnpj = cnpjRaw ? cnpjRaw.replace(/\D/g, "") : null;
...
.insert(companies).values({ name: companyName, cnpj, ... })
```

Este era o mesmo defeito num lugar que ninguém tinha olhado: sem o metadado, a
inserção ia com `null` e morria no banco. O `UPDATE` ao lado era pior — escrevia
`cnpj: null` incondicionalmente, **apagando o CNPJ de uma empresa que já o
tinha**. Agora o `UPDATE` só toca no campo quando há valor, e o `INSERT` recusa
antes com uma frase que diz o que fazer.

Vale registrar como isso apareceu: **não foi por leitura, foi porque o tipo
passou a corresponder à realidade.** Enquanto o schema mentia, o compilador não
tinha como avisar.

**4. A recusa passou a dizer o motivo.** O envelope de erro já carregava a
explicação por campo em `fields`, mas a tela de perfil da empresa mostrava só o
`message` genérico. Quem apagasse o nome veria *"Dados inválidos"*. Agora vê
*"Nome da empresa não pode ficar em branco"*.

## Prova de que o teste testa

O teste novo está em `e2e/ownership.spec.ts`, junto do que já exercia esta rota.
Ele manda `null` em `cnpj` e em `name`, exige **400** com envelope de erro, e
confere depois que a empresa continua inteira — a recusa não pode ter escrito
nada.

Um teste que passa não prova nada sozinho, então o defeito foi recolocado no
lugar de propósito:

```
Error: limpar cnpj precisa ser recusado com 400, e nunca virar 500 — ver task 69
    Expected: 400
    Received: 500
[WebServer] [company/profile] Error: Failed query: update "companies" set "cnpj" = $1 ...
```

**Antes 500, depois 400.** O teste falha pelo motivo certo.

## O critério 3 não dava para cumprir a olho

*"As outras tabelas foram conferidas contra o `information_schema`"* — conferir
13 tabelas lendo não é resposta que se possa mostrar a alguém. Então virou
script: [`scripts/conferir-schema-vs-banco.ts`](../../../scripts/conferir-schema-vs-banco.ts),
que compara o `information_schema` com os metadados que o próprio Drizzle expõe
via `getTableConfig` — o que o TypeScript e as consultas realmente enxergam.

Três divergências checadas: obrigatória no banco e opcional no schema (a desta
task, a que vira 500), o inverso (mente no tipo da leitura), e coluna ou tabela
que existe de um lado só.

```
Conferidas 13 tabelas do schema contra 13 do banco (139 colunas).
✅ Nenhuma coluna obrigatória no banco está opcional no schema.
```

E o mesmo cuidado do teste: um script silencioso pode estar silencioso por estar
quebrado. Com o `.notNull()` removido de propósito:

```
❌ Divergências que podem virar 500 (1):
  · companies.cnpj — NOT NULL no banco, opcional no schema (SEM padrão no banco)
```

Ele enxerga. **`companies.cnpj` era a única.**

## Verificação

| Comando | Resultado |
|---|---|
| `conferir-schema-vs-banco.ts` | ✅ 13 tabelas, 139 colunas, 0 divergências — e prova de que detecta |
| teste com o defeito recolocado | ✅ 500 antes, 400 depois |
| `npx tsc --noEmit` | ✅ 0 erros |
| `npx eslint src e2e scripts --max-warnings 9999` | ✅ 0 erros, 0 avisos |
| `npm run build` | ✅ limpo |
| `npx vitest run` | ✅ 31 de 31 |
| suíte inteira | ✅ **469 passando, 3 pulados** — o total não muda porque as conferências novas entraram **dentro** do teste que já exercia esta rota |

## Critérios de aceite

- [x] **`src/db/schema.ts` e o banco concordam sobre `companies.cnpj`** — o
      banco estava certo; o schema ganhou `.notNull()`.
- [x] **`PATCH /api/company/profile` com `{"cnpj": null}` devolve resposta
      tratada, nunca 500 — com teste que prove** — 400 com envelope, testado nos
      dois sentidos. E o mesmo vale para `{"name": null}`, que tinha o mesmo
      defeito.
- [x] **As outras tabelas foram conferidas contra o `information_schema`** — por
      script, não a olho. Nenhuma outra divergência.

## Pendências e achados fora de escopo

Nenhuma task nova.

Fica o aviso que a própria task levantava: o projeto usa `drizzle-kit push`, que
sincroniza sem gerar arquivo de migração — é assim que código e banco se separam
sem deixar rastro, e foi assim que esta divergência nasceu. O script acima é o
que transforma isso de "descobre quando quebra" em "descobre quando rodar", e
pode entrar na verificação de qualquer task futura que mexa no schema.
