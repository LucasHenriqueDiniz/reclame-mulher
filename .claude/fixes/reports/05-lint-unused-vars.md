# Relatório — [05] Remover código morto (`no-unused-vars`)

- **Data:** 2026-08-26
- **Status:** done
- **Iterações de debug:** 0

## Resultado

| Métrica | Antes | Depois |
|---|---|---|
| `npm run check` — warnings totais | 45 | **7** |
| `no-unused-vars` | 38 | **0** |
| `no-img-element` (escopo da task `06`) | 7 | 7 |
| Erros | 0 | 0 |

Os 7 que sobraram são todos `no-img-element`, que pertencem à próxima task.

## Remoção mecânica

18 imports mortos em 12 arquivos: `MapPin`, `Tag`, `Zap`, `Users`, `PlusSquare`
(×2), `Info` (×2), `Button`, `UserPlus`, `Link`, `Card`, `CardContent`, `Home`,
`S`, `ReactNode` (×3), `BarChart2`, `X`.

Duas constantes sem consumidor:

- `ACCEPT` em `upload-dropzone.tsx` — objeto de tipos aceitos que ficou órfão;
  quem é usado de verdade é o `ACCEPT_STR` logo abaixo.
- `encodedDesc` em `share-modal.tsx` — descrição codificada que nenhum dos
  quatro canais de compartilhamento consumia.

## Onde a task mandou pensar em vez de apagar

### `showMetrics` — feature pela metade, e o call site achava que funcionava

`CompanyProfileHero` declarava `showMetrics?: boolean`, e
`company-dashboard.tsx:470` passava `showMetrics={true}`. O componente **nunca
usava a prop**. O dashboard pedia métricas no hero e recebia nada,
silenciosamente.

Removi a prop e o call site em vez de implementar, porque o mesmo dashboard já
exibe essas métricas logo abaixo, em `MetricCard` dedicados — implementar
duplicaria a informação na mesma tela.

### `description` no `ShareModal` — órfã de ponta a ponta

Ao remover `encodedDesc`, a prop `description` ficou sem uso e o ESLint a
denunciou. Conferi o único call site (`complaint-detail-content.tsx:262`): ele
**não passa** `description`. A prop era declarada, nunca passada e nunca
consumida. Removida da interface e da assinatura.

### `_includeTags` e `_publicOnly` em `blog.ts` — investigados, não silenciados

A task alertava que esses parâmetros podiam ser **filtros nunca
implementados**, o que seria bug e não warning. Especificamente: `findAll` não
filtra por status, então rascunhos poderiam vazar numa listagem pública.

**Não vazam.** Rastreando os chamadores:

```
src/app/api/blog/posts/route.ts:38   BlogRepo.findAll(page, limit)
src/app/api/blog/tags/route.ts:14    BlogRepo.getAllTags()
```

`findAll` só é chamado no ramo `scope === "admin"`, que exige
`profile.role === "ADMIN"` e devolve 403 caso contrário. Listar rascunhos ali é
o comportamento correto. E as tags são buscadas em lote pelo próprio handler
(`getPostTagsBatch`), o que torna o `_includeTags` vestigial de verdade.

Os três parâmetros foram removidos das assinaturas — nenhum chamador os passava.

**Observação menor que fica registrada:** `getAllTags()` é servido pela rota
pública `/api/blog/tags` e devolve todas as tags, inclusive as que só existem em
rascunhos. O parâmetro `_publicOnly` mostra que alguém pretendia filtrar. Não é
vazamento de conteúdo — nome de tag não é sensível — mas é inconsistência de
produto.

## Convenção do prefixo `_`

`ProcessCarousel.tsx` tinha `(_e) => ...` em dois callbacks que ignoram o evento
de propósito. Em vez de apagar, configurei a convenção padrão do ESLint no
`eslint.config.mjs`:

```js
"@typescript-eslint/no-unused-vars": ["warn", {
  argsIgnorePattern: "^_",
  varsIgnorePattern: "^_",
  caughtErrorsIgnorePattern: "^_",
}]
```

Isso deu uso legítimo ao prefixo em `scripts/seed.ts`, onde
`const [proj1, proj2, proj3]` e `const [c1, c2, c3]` desestruturam arrays
aproveitando só parte dos elementos — renomeados para `_proj2`, `_proj3`,
`_c1`, `_c3`.

Também removi dois imports mortos em `scripts/` e adicionei `.opencodeshare/**`
aos `ignores` do ESLint: é diretório de ferramenta, como o `.claude/`, não
código do projeto.

## Verificação

| Comando | Resultado |
|---|---|
| `npm run typecheck` | ✅ 0 erros |
| `npm run check` | ✅ 0 erros, 7 warnings (todos `no-img-element`) |
| `npm run build` | ✅ `Compiled successfully in 41s` |
| 6 páginas públicas em runtime | ✅ todas 200 |
| 3 páginas autenticadas em runtime | ✅ todas 200 |

A verificação em runtime importava aqui: remover import que parece morto mas é
usado por *side effect* quebra em silêncio, e o typecheck não pega.

## Critérios de aceite

- [x] Menos de 5 warnings de `no-unused-vars` — **0**.
- [x] `npm run typecheck` limpo.
- [x] Nenhuma prop removida sem checar quem a passa — `showMetrics` e
      `description` foram ambas rastreadas até o call site.
- [x] `src/server/repos/blog.ts` verificado, não apenas silenciado.

## Achado para outras tasks

`upload-dropzone.tsx` define `MAX_FILES = 3` e `MAX_BYTES = 5 * 1024 * 1024`
(5 MB). O `MANUAL_PLATAFORMA.md` — e, por tabela, a task `09` — afirmam
**10 MB por arquivo e 50 MB no total**. Código e documentação discordam. Quem
manda é o código: a task `09` precisa usar 3 arquivos × 5 MB ao escrever o
teste, e a task `21` precisa corrigir o texto.
