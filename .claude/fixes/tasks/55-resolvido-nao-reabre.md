# [55] Depois de RESOLVED, a usuária não consegue reabrir o relato

| Campo | Valor |
|---|---|
| **ID** | `55` |
| **Fase** | `6 — Segurança e regras` |
| **Risco** | **alto** (produto, não código) |
| **Depende de** | — |
| **Achado em** | task `10` (E2E de resposta da empresa) |
| **Estimativa** | pequena no código, decisão de produto antes |

## O que foi encontrado

A máquina de estados vive em dois handlers,
`src/app/api/complaints/[id]/messages/route.ts` e
`src/app/api/company/complaints/[id]/messages/route.ts`:

```ts
// usuária responde
const nextStatus = complaint.status === "RESPONDED" ? "OPEN" : complaint.status;
```

Ou seja, a resposta da usuária só reabre o relato se ele estiver em
`RESPONDED`. Se a empresa já marcou `RESOLVED`, a mensagem dela é **gravada e
some**: o status continua `RESOLVED`, o relato continua fora de qualquer fila,
e nada avisa que a autora discordou do encerramento.

Coberto por teste, que asserta o comportamento atual:

```
e2e/complaint-response.spec.ts
  › depois de RESOLVED, a resposta da usuária não reabre nada
```

O `TODO.md` afirma que "resposta da usuária reabre a reclamação", sem ressalva.
A afirmação está errada para o caso que mais importa.

## Por que é grave

A empresa é quem decide o que está resolvido, e é ela quem tem o botão. Do
outro lado está a mulher que abriu o relato. Hoje o fluxo é:

1. empresa responde qualquer coisa;
2. empresa marca **Resolvida**;
3. a usuária escreve "não foi resolvido, o problema continua";
4. **nada acontece.**

Numa plataforma cujo propósito é dar voz a quem normalmente não é ouvida, a
última palavra ficar sempre com a empresa é uma falha de propósito, não só de
código. E é o tipo de cenário que uma banca de mestrado pergunta.

Some-se a isso: a taxa de resolução da empresa (`CompaniesRepo.getStats`)
aparece no perfil público. Encerrar unilateralmente melhora esse número.

## Decisão necessária antes de codificar

Três caminhos, do mais simples ao mais completo:

1. **Reabrir sempre**: resposta da autora leva `RESOLVED` → `OPEN`. Uma linha.
   Risco: empresa e usuária ficam num vaivém sem fim.
2. **Status novo `REOPENED`**: distingue "nunca resolvido" de "resolvido e
   contestado", e a empresa vê a diferença na fila. Exige migração do enum.
3. **Confirmação da autora**: `RESOLVED` só vale quando ela confirma; até lá
   fica `PENDING_CONFIRMATION`. É o mais justo e o mais caro.

**Quem decide é a Paloma** — é escolha de desenho da pesquisa, não de
implementação. A opção 1 é a única que cabe com folga antes da defesa.

## Critérios de aceite

- [ ] Decisão registrada aqui, com data e quem decidiu.
- [ ] Comportamento implementado nos **dois** handlers de mensagem.
- [ ] `e2e/complaint-response.spec.ts` atualizado: o teste "não reabre nada"
      passa a asserir o comportamento novo (e o nome dele muda junto).
- [ ] `TODO.md` corrigido — hoje ele descreve algo que o código não faz.

## Nota

Enquanto a decisão não sai, o teste que documenta o comportamento atual **fica
como está**. Ele não é uma aprovação do comportamento; é o registro de que
alguém olhou, entendeu e escolheu conscientemente.
