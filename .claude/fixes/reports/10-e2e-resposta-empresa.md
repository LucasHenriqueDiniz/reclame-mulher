# Relatório — [10] E2E de resposta da empresa e transições de status

- **Data:** 2026-08-26
- **Status:** done
- **Iterações de debug:** 0 (os 9 testes passaram na primeira execução)

## Resultado

**18 testes novos** (9 por projeto). Suíte inteira: **130 passando, 2 pulados**,
6,9 min.

| Caso | O que prova |
|---|---|
| Inbox | relato novo aparece em `/app/company/complaints` |
| Empresa responde pela tela | `OPEN` → `RESPONDED`, resposta entra na conversa |
| Empresa muda status pela tela | grava `RESOLVED` |
| Usuária lê a resposta | a mensagem da empresa aparece no detalhe |
| Usuária responde em `RESPONDED` | reabre: volta para `OPEN` |
| Usuária responde em `RESOLVED` | **não reabre** — achado `55` |
| Relato privado de outra pessoa | 404 na tela, 403 na API de mensagem |
| Relato público para terceiros | abre, mas a **conversa não vaza** |
| Empresa e relato de outra empresa | 403 na API, 404 na tela |

## O `TODO.md` está errado sobre a máquina de estados

Ele declara implementado e testado: `OPEN` → `IN_PROGRESS` → `RESOLVED`, e
"resposta da usuária reabre a reclamação".

**`IN_PROGRESS` não existe no código.** Os status são `OPEN`, `RESPONDED`,
`RESOLVED`, `CANCELLED` — enum do banco, DTO e as quatro telas concordam nisso.

A máquina real, lida nos dois handlers e agora coberta por teste:

```
empresa responde   →  RESPONDED   (a menos que já esteja RESOLVED/CANCELLED)
usuária responde   →  OPEN        (só se estiver em RESPONDED)
usuária responde   →  sem efeito  (qualquer outro status, RESOLVED incluso)
```

O `TODO.md` também cita `GET /api/complaints/[id]/messages`. Esse handler não
existe — só há `POST`. Não é defeito: as duas telas carregam a conversa no
servidor, via `MessagesRepo.findByComplaint`. É a documentação que descreve uma
API que nunca foi escrita. Anotado na task `21`.

## Achado `55` — a usuária não consegue contestar um encerramento

Este é o achado que mais importa para a defesa.

```ts
// usuária responde
const nextStatus = complaint.status === "RESPONDED" ? "OPEN" : complaint.status;
```

Depois que a empresa marca **Resolvida**, a resposta da autora é gravada e
**some**: o status continua `RESOLVED`, o relato continua fora de qualquer
fila, e nada sinaliza que ela discordou.

O fluxo completo hoje:

1. empresa responde qualquer coisa;
2. empresa marca Resolvida;
3. a usuária escreve "não foi resolvido, o problema continua";
4. nada acontece.

Numa plataforma cujo propósito é dar voz a quem normalmente não é ouvida, a
última palavra ficar sempre com a empresa é falha de propósito, não de código.
Some-se que a taxa de resolução da empresa aparece no perfil público — encerrar
unilateralmente melhora esse número.

**Não corrigi.** A escolha entre "reabrir sempre", "criar status `REOPENED`" ou
"exigir confirmação da autora" é desenho de pesquisa, não de implementação —
é decisão da Paloma. As três opções estão descritas na task `55`, com custo.
O teste que documenta o comportamento atual fica como está: ele não aprova o
comportamento, registra que alguém olhou e entendeu.

## Achado `54` — o mesmo status tem quatro nomes

Existe `src/lib/constants/complaint-status.ts`, cujo comentário diz *"Usado em
toda a aplicação para garantir consistência visual"*. Não é. Há mais três mapas
independentes, e eles discordam:

| Status | `lib/constants` (listagem) | Detalhe da usuária | Badge da empresa | Select da empresa |
|---|---|---|---|---|
| `OPEN` | Aberta | Em aberto | Em aberto | Em aberto |
| `RESPONDED` | **Em réplica** | Respondida | Respondida | Respondida |
| `RESOLVED` | Resolvida | **Concluído** | Resolvida | Resolvida |
| `CANCELLED` | Cancelada | Cancelada | Cancelada | Cancelada |

O mesmo relato, na mesma sessão: **Em réplica** na lista, **Respondida** ao
clicar. E quando a empresa encerra, a usuária lê **Concluído** enquanto a
empresa lê **Resolvida**. "Concluído" ainda quebra a concordância — os outros
rótulos daquele mapa são femininos, porque concordam com *reclamação*.

Isso aparece na demonstração da defesa, com as duas telas lado a lado.

Por isso as asserções de status neste spec são **pela API**, não pelo texto na
tela: assim o teste não trava a correção. A task `54` pede para acrescentar a
asserção de rótulo *depois* da unificação, quando ela protege em vez de
atrapalhar.

## A parte de privacidade passou inteira

Nenhuma surpresa aqui, e isso é bom notar depois do que a task `50` encontrou:

- relato **privado** de outra pessoa: 404 na tela e 403 ao tentar mandar
  mensagem;
- relato **público** de outra pessoa: abre — mas a **conversa entre autora e
  empresa não aparece**, e não há caixa de resposta. A regra
  `canViewThread = isAuthor || isCompanyMember` está correta e agora tem teste;
- empresa tentando alcançar relato dirigido a **outra empresa**: 403 na API de
  leitura, 403 na API de mensagem, 404 na tela.

O seed tem duas empresas — Construtora X (com usuária vinculada) e Transportes
Sul (sem) — o que tornou o teste de acesso cruzado entre empresas possível sem
inventar dados.

## Nota de técnica: três papéis, duas jarras de cookie

Cada teste tem duas sessões independentes: a do navegador (`page.request`) e a
da API (`request`). Alguns cenários precisam de três papéis — autora, empresa e
uma segunda usuária. Nesses, o contexto de API troca de papel refazendo o
login: o cookie novo substitui o anterior. Está documentado no topo do spec,
porque parece truque quando não se sabe.

Os relatos são criados **pela API**, não pelo wizard. O wizard tem spec própria
(task `09`); repetir aquele caminho aqui só deixaria estes testes lentos e
frágeis por motivo alheio ao que eles testam.

## Verificação

| Comando | Resultado |
|---|---|
| `npx playwright test e2e/complaint-response.spec.ts` | ✅ 9/9 desktop, 9/9 mobile |
| `npx playwright test` (suíte inteira) | ✅ **130 passando, 2 pulados**, 6,9 min |
| `npm run check` | ✅ exit 0 |
| `npm run build` | ✅ `Compiled successfully in 18.3s` |
| Sobras no banco | ✅ 0 relatos e status do seed intactos |

## Critérios de aceite

- [x] O ciclo completo passa.
- [x] Cada transição é asserida pelo valor real retornado pela API, não por
      texto de tela.
- [x] O caso de privacidade passa — passaram três, cobrindo relato privado,
      relato público e acesso cruzado entre empresas.
- [x] A reabertura não funciona como o `TODO.md` afirma, e isso foi registrado
      como achado (`55`) em vez de ajustado no teste.
