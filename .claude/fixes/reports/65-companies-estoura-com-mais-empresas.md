# Relatório — [65] `/companies` volta a rolar para o lado quando há mais empresas

- **Data:** 2026-08-27
- **Status:** done
- **Iterações de debug:** 1

## Reproduzido antes de mexer

`npm run db:seed && npm run db:seed:demo`, depois a spec de responsividade em
375 px:

```
/companies rola para o lado: 399px de conteúdo em 375px de tela.
  a.group block passa 24px — "Águas do CerradoÁguas do Cerrado Saneamento S.A.Ve"
  a.group block passa 24px — "Construtora XConstrutora X LtdaVerificadaConstruçã"
  a.group block passa 24px — "Norte EngenhariaNorte Engenharia e Infraestrutura "
```

O detalhe que a mensagem entrega é o diagnóstico inteiro: **todos os cartões
estouram os mesmos 24 px**, inclusive `Construtora X`, que é do seed base e é
curta. Não é um cartão largo demais — é a faixa da grade inteira ficando larga
demais e levando todo mundo junto.

## A causa

`src/app/companies/page.tsx` monta a lista com
`grid gap-5 md:grid-cols-2 xl:grid-cols-3`. Em 375 px é uma coluna só, e **item
de grade nasce com `min-width: auto`**: a faixa fica com
`max(largura disponível, min-content do item mais largo)`.

O que torna o min-content enorme é o `truncate`, que traz
`white-space: nowrap` — com isso o min-content de um `<span className="truncate">`
é o texto inteiro, não a primeira palavra. O `truncate` estava lá para cortar o
texto, mas sem `min-width: 0` ele nunca chega a cortar: ele estica.

## A correção, em três lugares

| Onde | Mudança |
|---|---|
| `<Link className="group block">` — o item da grade | `min-w-0` |
| `<span className="truncate">{company.sector}</span>` | `min-w-0` |
| `<span className="truncate">{location}</span>` | `min-w-0` |

Os dois `<span>` são itens de flex, e valem pelo mesmo motivo: sem
`min-width: 0` eles não encolhem abaixo do próprio conteúdo. O cabeçalho do
cartão já tinha `min-w-0 flex-1` e por isso não aparecia entre os culpados.

Nenhum texto foi encurtado — a correção é a do critério 3.

## O teste que faltava, e por que ele faltava

A task `14` corrigiu esta página e a travou com teste. O teste estava certo; o
dado é que não era. Enquanto `responsive.spec.ts` medisse `/companies` com as
**duas empresas de nome curto do seed base**, ele passaria com a página
quebrada — foi exatamente o que aconteceu entre a `14` e a `23`.

Podia ter resolvido pedindo o cenário de demonstração, mas isso amarraria a
suíte a qual seed está carregado. Em vez disso o teste **cria a empresa larga**:

- `criarEmpresaDeNomeLongo()` em `e2e/fixtures/db.ts` insere uma empresa com
  nome, razão social e setor longos, marcada com `[e2e]`;
- `limparEmpresasDeTeste()` apaga no começo e no fim, como as outras limpezas;
- o teste confere que a empresa **apareceu na listagem** antes de medir — senão
  passaria por não ter medido nada.

**Verificado por mutação, no seed base:** tirando o `min-w-0` do item da grade,
o teste falha com

```
/companies (nome longo) rola para o lado: 654px de conteúdo em 375px de tela.
```

654 px contra os 399 px do cenário de demonstração: o teste é mais severo do que
o caso que originou a task, o que é o que se quer de uma trava. Restaurado em
seguida, e volta a passar.

## Um achado no caminho: o banco e o schema discordam

A primeira versão da empresa de teste não tinha CNPJ, e o banco recusou:

```
NeonDbError: null value in column "cnpj" of relation "companies"
violates not-null constraint
```

Mas `src/db/schema.ts:113` declara `cnpj: text("cnpj").unique()`, **sem**
`.notNull()`. Conferi no `information_schema`: as obrigatórias de `companies`
são `id`, `name`, `cnpj` e `created_at`.

Isso não é só documentação desencontrada. A task `56` fez o
`PATCH /api/company/profile` aceitar limpeza explícita de campo, e o CNPJ está
entre eles — `{"cnpj": null}` vira `UPDATE companies SET cnpj = NULL`, que o
banco recusa, e a rota devolve **500**. Verificado lendo o caminho do código;
nenhum teste manda `cnpj: null` hoje, e é por isso que ninguém tropeçou.

Fora do escopo desta task, então virou a **task `69`**, com a nota de que o
projeto usa `db:push` — que sincroniza sem gerar arquivo de migração, e é
exatamente assim que código e banco se separam sem deixar rastro.

## Verificação

| Comando | Resultado |
|---|---|
| `npx tsc --noEmit` | ✅ 0 erros |
| `npx eslint src e2e --max-warnings 9999` | ✅ 0 erros, 0 avisos |
| `npm run build` | ✅ limpo |
| responsividade **com o cenário de demonstração** | ✅ 87 passando, 1 pulado — inclusive `/companies` nos dois viewports |
| trava por mutação, **no seed base** | ✅ falha com 654 px sem o `min-w-0`; passa com ele |
| `npx vitest run` | ✅ 31 de 31 |
| suíte inteira | ✅ **469 passando, 3 pulados** — 467 mais os 2 do teste novo |

## Critérios de aceite

- [x] **`/companies` não rola para o lado em 375 px com o cenário de
      demonstração carregado** — medido nesse cenário, antes e depois.
- [x] **O teste cobre um nome longo** — por registro criado dentro da própria
      spec, que é mais forte do que depender do seed.
- [x] **A causa está corrigida no CSS, não encurtando o texto** — `min-w-0` no
      item de grade e nos dois `span` que truncam.
- [x] **As outras páginas continuam passando** — a suíte inteira, nos quatro
      projetos.

## Pendências e achados fora de escopo

Task `69`: `companies.cnpj` é `NOT NULL` no banco e opcional no
`src/db/schema.ts`, com um caminho de produto que bate na divergência.
