# Relatório — [56] A conta de empresa da demonstração não pode administrar a própria empresa

- **Data:** 2026-08-27
- **Status:** done
- **Iterações de debug:** 1

## O que foi encontrado

Exatamente o que a task descrevia: `empresa@construtorax.com` era a única conta
de empresa do seed, com papel `MEMBER`, e `canManageCompany` exige `OWNER` ou
`ADMIN`. Cinco rotas de administração respondiam 403 para a única conta que
existia.

E uma coisa que a task **não** dizia, que só apareceu quando a primeira conta
`OWNER` existiu e chamou a rota. Está na seção "O defeito que estava escondido
atrás do 403", abaixo. É o achado principal desta task.

## O que foi feito

Escolhi a **opção 2** da task — duas contas, e não promover a existente. Custa
poucas linhas a mais e é a única que deixa a distinção entre `MEMBER` e `OWNER`
visível: promover o João resolveria a demonstração e apagaria do seed uma
funcionalidade real do produto.

E acrescentei uma terceira conta que a task não pedia, porque sem ela o critério
de aceite 4 é impossível: para provar que "OWNER de uma empresa não altera
projeto de outra" é preciso uma OWNER **na outra empresa**. A Transportes Sul
existia no seed sem nenhuma conta vinculada.

| Arquivo | Mudança |
|---|---|
| `scripts/seed.ts` | +2 contas: Helena Marques (`dona@construtorax.com`, OWNER da Construtora X) e Rita Alves (`dona@transportessul.com`, OWNER da Transportes Sul). João continua `MEMBER`. O resumo impresso no fim diz o papel de cada uma |
| `src/server/dto/companies.ts` | **O conserto do defeito escondido** — os três helpers de campo opcional preservam `undefined` em vez de virá-lo `null` |
| `src/app/api/company/profile/route.ts` | `PATCH` virou atualização parcial de verdade: `cnpj` e `foundationDate` só entram no `UPDATE` quando vieram no corpo |
| `e2e/fixtures/auth.ts` | Contas `empresaDona` e `empresaOutra` |
| `e2e/fixtures/db.ts` | `limparProjetosDeTeste()` — os testes de papel criam projeto de verdade, e o seed é o banco da demonstração |
| `e2e/ownership.spec.ts` | 4 testes novos (× 2 viewports) |
| `e2e/api-authorization.spec.ts` | Papel `empresaDona` na matriz; `PATCH /api/company/profile` passou a exercer os dois lados |
| `e2e/segredos.spec.ts` | A lista de e-mails passou a sair de `CONTAS` em vez de escrita à mão |
| `docs/autorizacao.md` | Coluna "dona da empresa (OWNER)" na matriz por rota, e a nota sobre rota inalcançável |
| `README.md`, `src/app/ajuda/_components/ajuda-content.tsx` | As contas novas, com o papel de cada uma |
| `scripts/seed-demonstracao.ts` | Comentário atualizado: o seed base deixou de ser o caso problemático |

## O defeito que estava escondido atrás do 403

O primeiro teste que escrevi para o critério 2 — `PATCH /api/company/profile`
responde 200 para a OWNER — **falhou com 500**.

O código estava assim:

```ts
const nullableTrimmedString = z.union([z.string(), z.null()]).optional()
  .transform((value) => {
    if (value == null) return null;   // <- `==` casa undefined também
    ...
```

O `transform` do Zod roda **também para chave ausente** quando o schema é
opcional. Medido:

```
UpdateCompanyProfileDto.parse({})  →  18 chaves, todas null, name = null
```

E `companies.name` é `NOT NULL`. Ou seja:

| Chamada | O que acontecia |
|---|---|
| `PATCH` com corpo vazio | **500** — violação de `NOT NULL` em `name` |
| `PATCH` só com `description` | **500** pelo mesmo motivo |
| `PATCH` com `name` + `description` | 200, e **apagava CNPJ, telefone, cidade, e-mail, site, razão social...** |

Isto é perda de dado, não inconveniência. E ninguém tinha visto **porque a rota
exige OWNER e nenhuma conta do seed era OWNER**. A task tratava o papel errado
como problema de demonstração; ele também estava escondendo um defeito.

> Rota que conta nenhuma alcança não está protegida. Está sem testar.

O conserto preserva as três respostas que um `PATCH` precisa distinguir: chave
ausente não mexe, `null` explícito limpa, texto vazio limpa. O teste novo cobre
as três — inclusive a de limpar, senão "nunca apague nada" passaria.

## Verificação

| Comando | Resultado |
|---|---|
| `npx tsc --noEmit` | ✅ 0 erros |
| `npx eslint src e2e scripts --max-warnings 9999` | ✅ 0 erros, 0 avisos |
| `npm run build` | ✅ limpo |
| `pnpm db:seed` | ✅ 6 contas, 3 vínculos de empresa |
| `ownership.spec.ts --grep "papel e posse"` | ✅ 3 de 3 |
| `ownership.spec.ts --grep "atualização parcial"` | ✅ 1 de 1 |
| `npx vitest run` | ✅ 18 de 18 |
| suíte inteira | ✅ **469 passando, 3 pulados** em 22,5 min — 461 antes desta task mais os 8 novos (4 testes × 2 viewports). Nada quebrou com o seed novo, que era o risco real |

O 500 do primeiro ciclo não foi ruído: foi o teste fazendo o trabalho dele antes
de qualquer linha de produção mudar.

## Critérios de aceite

- [x] **Existe conta de empresa com papel `OWNER` no seed** — duas, na verdade,
      em empresas diferentes.
- [x] **`PATCH /api/company/profile` responde 200 para ela** — asserido na
      matriz e em `ownership.spec.ts`. Não respondia: respondia 500, e foi
      preciso consertar o DTO para que o critério pudesse ser cumprido.
- [x] **`api-authorization.spec.ts` atualizado** — `PATCH /api/company/profile`
      agora nega `empresa` (MEMBER, 403) e permite `empresaDona` (OWNER, 200).
      As outras quatro rotas de gestão continuam só negando, com `nota` dizendo
      por quê: para OWNER elas são destrutivas (criam conta, mudam papel, apagam
      empresa) ou estão cobertas em `ownership.spec.ts` com corpo válido e
      limpeza.
- [x] **Teste de posse em `/api/company/projects/[id]`** — OWNER da Transportes
      Sul recebe 403 ao editar e ao apagar projeto da Construtora X, e o projeto
      fica intacto. Mais um terceiro caso que a task não pedia: o `company_id`
      mandado no corpo é ignorado, então uma empresa não cria projeto dentro de
      outra.
- [x] **`docs/autorizacao.md` atualizado** — coluna nova na matriz por rota.

## Pendências e achados fora de escopo

Nenhum achado novo aberto. Duas observações:

1. O padrão `if (value == null) return null` estava **só** em
   `src/server/dto/companies.ts`. Conferi os outros seis arquivos de
   `src/server/dto/` — nenhum tem `transform` desse tipo, então o conserto não
   tem irmãos escondidos.
2. `company_users.role` continua sendo texto livre e anulável, comparado com
   `===`. Já estava registrado como pendência no fim de `docs/autorizacao.md`;
   não mexi.

## Decisões que precisam de humano

Nenhuma. A task oferecia duas opções e recomendava a 2; segui a recomendação. A
terceira conta (OWNER da segunda empresa) é consequência direta do critério de
aceite 4, não escolha de desenho.
