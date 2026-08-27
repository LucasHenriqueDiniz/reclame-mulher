# Relatório — [57] O botão "Criar um relato" da tela da empresa aponta para um link quebrado

- **Data:** 2026-08-27
- **Status:** done
- **Iterações de debug:** 0

## O que foi encontrado

Os dois problemas descritos na task, intactos, e uma conclusão que muda o
conserto: **eles são o mesmo problema visto de dois ângulos.**

A task pedia duas coisas: trocar o nome pelo id no link, e não mostrar o cartão
para a empresa. Ao conferir quem alcança a tela, o primeiro pedido deixa de
fazer sentido.

`src/app/app/company/complaints/[id]/page.tsx:31`:

```ts
if (complaint.companyId !== companyContext.companyId) {
  notFound();
}
```

Esta página **só abre para a empresa dona do relato**. Não há visitante, não há
autora, não há admin — o admin da plataforma nem enxerga a área da empresa
(`docs/autorizacao.md`). Logo, o cartão "Está querendo fazer um relato sobre
Construtora X?" era, em 100% dos carregamentos, um convite para a empresa
reclamar de si mesma.

Consertar o link seria consertar o destino de um botão que ninguém deveria ver.

## O que foi feito

O cartão saiu, e no lugar dele ficou o registro do porquê — os dois motivos, para
que ninguém o traga de volta achando que só faltava trocar o parâmetro.

| Arquivo | Mudança |
|---|---|
| `src/app/app/company/complaints/[id]/_components/company-complaint-detail-content.tsx` | Cartão removido, com comentário explicando o público da tela e o link errado |
| `e2e/convite-de-relato.spec.ts` (novo) | 2 testes × 2 viewports |

A regra que a task citava — o `!isMember` de `company-profile-content.tsx:568` —
**não foi copiada para cá**, de propósito: nesta tela não existe `isMember`
porque aqui todo mundo é membro. Uma condição sempre verdadeira é pior do que
não ter condição nenhuma: parece que alguém pensou no caso.

## Os testes

`e2e/convite-de-relato.spec.ts`:

1. **A empresa não é convidada a reclamar de si mesma.** Abre
   `/app/company/complaints/[id]` como a empresa e exige zero links para
   `/app/complaints/new`. Antes de afirmar a ausência, confere que a tela certa
   carregou pelo título do relato — uma página em branco também passaria numa
   asserção de ausência.
2. **No perfil público, o convite leva o id.** Sem sessão, colhe todo
   `a[href*="complaints/new?company="]` de `/company/construtora-x` e exige que
   o parâmetro case com o formato de UUID. Cobre o critério 1 pelo
   comportamento, e não por `grep`: se alguém voltar a passar nome em qualquer
   convite daquela tela, o teste vermelha.

**Verificado por mutação:** repondo um `Link` para
`complaints/new?company=${complaint.company.name}` na tela da empresa, o
primeiro teste falha. Restaurado em seguida.

## O Manual de Uso foi refeito

O cartão removido aparecia na **figura 62** do Manual — dá para ver o botão
"Criar um relato" na coluna da direita, logo acima de "Ações da empresa". Como
na task `54`, refiz as capturas e o HTML.

Mudaram **23 das 34 imagens**, e não as 2 que eu esperava. A razão não é esta
task: o `pnpm db:seed` da task `56` gerou UUIDs novos, então **todo número de
relato mudou** (`#R-5B81-2961` → `#R-A5DB-FD82`, e assim por diante). O conteúdo
das telas é o mesmo; o que mudou foi o identificador impresso nelas.

A legenda da figura 62 não citava o cartão, então não precisou de ajuste.

## Verificação

| Comando | Resultado |
|---|---|
| `npx tsc --noEmit` | ✅ 0 erros |
| `npx eslint src e2e --max-warnings 9999` | ✅ 0 erros, 0 avisos |
| `npm run build` | ✅ limpo |
| `convite-de-relato.spec.ts` | ✅ 2 de 2; e **1 falha** quando o cartão volta |
| `npx vitest run` | ✅ 18 de 18 |
| suíte inteira | ✅ **473 passando, 3 pulados** em 23,1 min — 469 antes desta task mais os 4 novos (2 testes × 2 viewports) |
| âncoras do `MANUAL_DE_USO.html` | ✅ 0 sem destino |

## Critérios de aceite

- [x] **Nenhum `complaints/new?company=` passa nome em vez de id** — a única
      ocorrência fora do padrão era o cartão, que deixou de existir. Os outros
      cinco lugares já passavam id, e agora há teste exigindo isso do perfil
      público.
- [x] **A tela `/app/company/complaints/[id]` não oferece "criar relato" sobre a
      própria empresa** — zero links para `/app/complaints/new` na página.
- [x] **Teste E2E que abre a tela como empresa e verifica a ausência do card.**

## Pendências e achados fora de escopo

Nenhum.

## Decisões que precisam de humano

Nenhuma. Vale só registrar a escolha, caso alguém discorde depois: **removi o
cartão em vez de escondê-lo por condição**. Se um dia esta tela passar a ser
vista por alguém que não é da empresa — não é o caso hoje, e a página inteira
teria de mudar para isso —, o cartão volta com a condição certa e com id no
link.
