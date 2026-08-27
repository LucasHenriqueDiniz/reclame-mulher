# [69] O schema diz que o CNPJ é opcional; o banco diz que não

| Campo | Valor |
|---|---|
| **ID** | `69` |
| **Fase** | `2 — Correções pontuais` |
| **Risco** | médio |
| **Depende de** | — |
| **Achado em** | task `65` (`/companies` em 375 px) |
| **Estimativa** | pequena |

## O que foi medido

Ao inserir uma empresa de teste sem CNPJ, o banco recusou:

```
NeonDbError: null value in column "cnpj" of relation "companies"
violates not-null constraint
```

As colunas obrigatórias de `companies`, direto do `information_schema`:

```
id: NOT NULL
name: NOT NULL
cnpj: NOT NULL
created_at: NOT NULL
```

E `src/db/schema.ts:113` declara:

```ts
cnpj: text("cnpj").unique(),   // sem .notNull()
```

**O schema do código e o banco discordam.** Não há pasta `drizzle/` com
migrações no repositório, então não dá para dizer pelo histórico quando as duas
versões se separaram — o `NOT NULL` provavelmente veio de um `db:push` antigo ou
de uma alteração feita à mão.

## Por que importa

Não é só divergência de documentação: **há um caminho do produto que bate nela.**

A task `56` corrigiu o `PATCH /api/company/profile` para aceitar limpeza
explícita de campo, e o CNPJ está entre eles:

```ts
// src/app/api/company/profile/route.ts:29
if (parsed.cnpj !== undefined) {
  alteracoes.cnpj = parsed.cnpj ? parsed.cnpj.replace(/\D/g, "") : null;
}
```

O DTO (`opcional()` em `src/server/dto/companies.ts`) deixa `null` explícito
passar de propósito — é a diferença entre "não mandei o campo" e "quero limpar".
Então uma empresa que envie `{"cnpj": null}` produz `UPDATE companies SET cnpj =
NULL`, que o banco recusa, e a rota devolve **500** onde deveria devolver 400 ou
simplesmente funcionar.

Isto foi verificado **lendo o caminho do código**, não executando — nenhum teste
atual manda `cnpj: null`, e é por isso que ninguém tropeçou nele ainda.

## O que fazer

Primeiro decidir qual dos dois está certo:

- **Se CNPJ é obrigatório** (o que faz sentido: é a identificação da empresa, e
  a coluna é `unique`), então `src/db/schema.ts` ganha `.notNull()`, o DTO para
  de aceitar `null` para este campo, e a rota devolve erro de validação em vez
  de 500.
- **Se é opcional**, o banco perde o `NOT NULL` por migração.

Depois, e independentemente da escolha: **conferir se há outras divergências**
entre `src/db/schema.ts` e o banco. Uma apareceu por acaso; o método para achar
o resto é comparar o `information_schema` com o schema do código, tabela por
tabela.

## Critérios de aceite

- [ ] `src/db/schema.ts` e o banco concordam sobre `companies.cnpj`.
- [ ] `PATCH /api/company/profile` com `{"cnpj": null}` devolve resposta
      tratada, nunca 500 — com teste que prove.
- [ ] As outras tabelas foram conferidas contra o `information_schema`, e o que
      divergir está corrigido ou registrado.

## Nota

Vale como aviso mais amplo: o projeto usa `db:push` (`drizzle-kit push`), que
sincroniza sem gerar arquivo de migração. É rápido e é exatamente assim que o
código e o banco se separam sem deixar rastro.
