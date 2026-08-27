# Relatório — [54] O mesmo status tem quatro nomes diferentes na interface

- **Data:** 2026-08-27
- **Status:** done
- **Iterações de debug:** 0

## O que foi encontrado

A task descrevia quatro mapas de rótulo. Eram **cinco**, e um sexto morto.

| Onde | O que era |
|---|---|
| `src/lib/constants/complaint-status.ts` | `COMPLAINT_STATUS` — o módulo que dizia ser "usado em toda a aplicação" |
| `src/app/app/complaints/[id]/.../complaint-detail-content.tsx:27` | `STATUS_LABELS` |
| `src/app/app/company/complaints/[id]/.../company-complaint-detail-content.tsx:31` | `STATUS_CONFIG` |
| o mesmo arquivo, `:62` | `STATUS_OPTIONS` |
| `src/components/company/StatusBadge.tsx:5` | `COMPLAINT_LABELS` — **não estava na task** |
| `src/lib/utils.ts:41` | `formatComplaintStatus` — **não estava na task, e ninguém a chamava** |

A divergência que a usuária via, confirmada tela a tela:

| Status | Lista | Detalhe dela | Painel da empresa |
|---|---|---|---|
| `OPEN` | Aberta | **Em aberto** | Em aberto |
| `RESPONDED` | **Em réplica** | Respondida | Respondida |
| `RESOLVED` | Resolvida | **Concluído** | Resolvida |

Fora dos mapas, mais duas sobras da mesma palavra: as duas telas de detalhe
escreviam **"Chamado Concluído"** na faixa de encerramento. "Chamado" não
aparece em nenhum outro lugar do produto — nem no Manual, a não ser descrevendo
esta faixa.

## O que foi feito

Um mapa só, em `src/lib/constants/complaint-status.ts`, com rótulo, cores,
borda e ícone. Os rótulos concordam com *reclamação*, que é o critério que a
maioria das telas já seguia: **Aberta, Respondida, Resolvida, Cancelada**.

| Arquivo | Mudança |
|---|---|
| `src/lib/constants/complaint-status.ts` | Passa a carregar `icon` (componente do lucide, não JSX, para o arquivo seguir `.ts` e servir a servidor e cliente), `borderColor` obrigatório, `COMPLAINT_STATUS_OPTIONS` derivado do mapa e `complaintStatusLabel()`. `RESPONDED` deixou de ser "Em réplica" |
| `.../complaints/[id]/_components/complaint-detail-content.tsx` | `STATUS_LABELS` apagado; usa `complaintStatusLabel`. O selo ganhou `role="status"` |
| `.../company/complaints/[id]/_components/company-complaint-detail-content.tsx` | `STATUS_CONFIG` e `STATUS_OPTIONS` apagados; o selo lê cor, borda e ícone do módulo, e o `select` de mudança de status usa as opções derivadas. Selo com `role="status"`; `XCircle` saiu dos imports |
| `src/components/company/StatusBadge.tsx` | `COMPLAINT_LABELS` apagado. As **cores ficaram**: o selo é o desenho do tema da empresa, mais suave, e só o texto era o problema. `PENDING` saiu — pertence a `reportStatus`, o enum das denúncias, e este componente nunca recebe um |
| `src/lib/utils.ts` | `formatComplaintStatus` apagada, com o `type ComplaintStatus` local. Ninguém a chamava, nem os testes. Religá-la ao módulo compartilhado faria `utils.ts` — que exporta o `cn` e por isso é importado em quase todo componente — arrastar o `lucide-react` junto |
| ambas as telas de detalhe | "Chamado Concluído" → **"Reclamação resolvida"** |

O `role="status"` com `aria-label` não é enfeite para teste: é a mesma marcação
que `src/components/company/StatusBadge.tsx` já usava, e é o que dá ao selo um
nome acessível em vez de um `span` mudo.

### Efeito colateral que vale registrar: contraste

O selo do painel da empresa desenhava `RESPONDED` com `#EAB308` sobre `#FEFCE8`
— amarelo sobre amarelo claro, ~1,7:1, longe do mínimo de 4,5:1. Não aparecia na
varredura de acessibilidade porque o relato que a varredura abre está `OPEN`.
Ao herdar a paleta do módulo compartilhado (`#1E0F62` sobre `#EBFF55`), o selo
passou a cumprir o contraste nos quatro status.

### O que **não** mudou, de propósito

As abas de filtro (`Últimas · Não Respondidas · Respondidas · Concluídas`) são
outro eixo: "Concluídas" agrupa `RESOLVED` **e** `CANCELLED`, então renomeá-la
para "Resolvidas" seria trocar uma inconsistência por um erro.

## O teste que trava isso

Novo bloco em `e2e/complaint-response.spec.ts` — o arquivo que, segundo a
própria task, assertava status pela API justamente para não travar esta
correção. Agora que os rótulos são um só, ele protege a unificação.

O teste percorre os quatro status e, em cada um, confere os três lugares: o
cartão na lista da autora (recortado pelo `href`, senão o texto de outro relato
entraria na conta), o detalhe dela e o painel da empresa. Em cada tela também
exige que **nenhuma palavra aposentada** — "Em aberto", "Em réplica",
"Concluído", "Chamado" — apareça em lugar nenhum do corpo da página. É a parte
que pega um mapa novo nascendo em algum componente.

**Verificado por mutação:** devolvendo `label: "Em réplica"` ao módulo
compartilhado, o teste falha em `conferirAposentados`. Restaurado em seguida.

## O Manual de Uso foi refeito

Isto não estava nos critérios de aceite e foi feito assim mesmo: o Manual é o
documento que o Prof. Marc pediu para setembro, e ele traz 16 telas
fotografadas. Deixá-lo mostrando "Em réplica" e "Concluído" ao lado de uma
aplicação que diz "Respondida" e "Resolvida" seria trocar um defeito no produto
por um defeito na entrega.

- `pnpm manual:capturas` contra o build de produção: **16 das 34 imagens
  mudaram** — exatamente as que têm selo de status. As outras 18 saíram
  idênticas, o que também serve de prova de que o banco estava no mesmo estado
  do dia em que a task `22` fotografou.
- A tabela "O que cada etiqueta quer dizer" perdeu a linha
  "**Resolvida** ou **Concluído**".
- A nota que avisava a leitora de que a plataforma usava palavras diferentes em
  telas diferentes **foi apagada**: deixou de ser verdade.
- A seção 5 virou "Quando o relato é resolvido", com a âncora do sumário
  acompanhando.
- `pnpm manual:html` refeito — 4,7 MB, arquivo único.

`docs/roteiro-demonstracao.md` perdeu a linha "Etiquetas divergem" da tabela de
limitações conhecidas, pela mesma razão.

## Verificação

| Comando | Resultado |
|---|---|
| `npx tsc --noEmit` | ✅ 0 erros |
| `npx eslint src e2e --max-warnings 9999` | ✅ 0 erros, 0 avisos |
| `npm run build` | ✅ limpo, sem aviso |
| `npx playwright test` (grep do teste novo) | ✅ passa; e **falha** quando o rótulo antigo volta |
| `npx vitest run` | ✅ 18 de 18 |
| `npx playwright test` (suíte inteira, projetos de UI + acessibilidade) | ✅ **461 passando, 3 pulados** em 21,6 min — 459 antes desta task mais os 2 do teste novo (um por viewport) |
| âncoras do `MANUAL_DE_USO.html` | ✅ 0 âncoras sem destino |

## Critérios de aceite

- [x] **Um único mapa de rótulos no repositório** — os cinco viraram um, mais a
      função morta em `utils.ts`. `grep` por `STATUS_LABELS|STATUS_CONFIG` em
      `src/` não devolve mais nada de reclamação.
- [x] **Lista e detalhe mostram o mesmo texto** — asserido nos quatro status.
- [x] **Usuária e empresa leem o mesmo texto** — idem, incluindo o painel.
- [x] **`npm run check` e a suíte E2E continuam verdes.**

## Pendências e achados fora de escopo

Nenhum achado novo. O contraste do selo da empresa era um defeito latente e foi
corrigido de carona, não registrado como task.

## Decisões que precisam de humano

Nenhuma. A escolha de vocabulário — feminino, concordando com *reclamação* — é
a que a própria task sugeria e a que a maioria das telas já usava.
