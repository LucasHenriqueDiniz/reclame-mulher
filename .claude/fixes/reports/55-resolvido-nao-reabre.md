# Relatório — [55] Depois de RESOLVED, a usuária não consegue reabrir o relato

- **Data:** 2026-08-27
- **Status:** **blocked**
- **Commit:** nenhum (código não foi tocado)
- **Iterações de debug:** 0

## Por que está bloqueada

O primeiro critério de aceite da própria task é:

> - [ ] Decisão registrada aqui, com data e quem decidiu.

e o corpo dela diz, em negrito, **"Quem decide é a Paloma"** — porque escolher
entre reabrir sempre, criar `REOPENED` ou exigir confirmação da autora é desenho
da pesquisa, não implementação. Não é uma decisão que eu possa tomar por ela, e
tomá-la sozinho seria contrariar a instrução escrita na task.

As outras três linhas de aceite dependem todas da primeira: o que implementar
nos dois handlers, o que o teste deve asserir, e o que escrever no `TODO.md`
mudam conforme a escolha.

Então: não escrevi código, e não escolhi por ninguém. O que fiz foi **medir o
que a decisão custa**, para que ela seja tomada com número na mão em vez de
impressão.

## Confirmado: o defeito continua exatamente como descrito

`src/app/api/complaints/[id]/messages/route.ts:44` — resposta da autora:

```ts
complaint.status === "RESOLVED" || complaint.status === "CANCELLED"
  ? complaint.status            // não mexe
  : complaint.status === "RESPONDED"
    ? "OPEN"                    // reabre
    : complaint.status;
```

E o teste `e2e/complaint-response.spec.ts › depois de RESOLVED, a resposta da
usuária não reabre nada` passa hoje — ele documenta o comportamento, não o
aprova. Conforme a Nota da task, **fica como está** até a decisão sair.

## O que medi, e que a task não dizia

### 1. A usuária não tem nenhuma alavanca de status. Nenhuma.

`src/app/api/complaints/[id]/` tem **um único subdiretório**: `messages/`. Não
existe rota pela qual a autora mude o status do próprio relato. A única rota de
status é `src/app/api/company/complaints/[id]/status/route.ts`, atrás de
`exigirEmpresa`.

### 2. A empresa pode reencerrar quantas vezes quiser

Essa rota não valida transição: aceita qualquer status do enum, vindo de
qualquer status, sem limite. Isso muda o cálculo das opções da task:

> **Reabrir sempre (opção 1) não devolve a última palavra à usuária.** Devolve
> um vaivém que a empresa sempre vence, porque ela reencerra e a autora só pode
> escrever de novo. Das três opções, só a 3 (confirmação da autora) tira o
> encerramento unilateral.

Isto não é argumento contra a opção 1 — ela continua sendo a única que cabe com
folga antes da defesa, e um relato que volta para a fila já é melhor do que uma
mensagem que some. É para que ninguém escolha a 1 achando que resolveu o
problema de fundo.

### 3. A taxa de resolução se move junto, e é pública

`src/server/repos/companies.ts:202`:

```ts
resolutionRate: total > 0 ? Math.round((resolved / total) * 100) : 0
```

`resolved` conta linhas em `RESOLVED` **agora** — não há histórico. Consequência
por opção:

| Opção | Efeito no número público |
|---|---|
| 1 — reabrir sempre | cai a cada contestação e sobe a cada reencerramento; oscila |
| 2 — `REOPENED` | cai igual (sai de `RESOLVED`), mas a empresa passa a distinguir na fila |
| 3 — confirmação | passa a contar **só resolução confirmada pela autora**. É o número honesto, e o mais caro: exige decidir o que fazer com as linhas `RESOLVED` que já existem |

### 4. Ninguém é avisado, em nenhuma das opções

Não há envio de e-mail no projeto (achado `61`). Reabrir o relato o devolve à
lista da empresa e nada mais: se a empresa não entrar e olhar, a contestação
continua invisível. Vale considerar isso ao escolher — a opção 2 é a única em
que a fila da empresa **mostra** que aquilo é uma contestação, e não um relato
novo qualquer.

## Verificação

Nenhuma: não houve mudança de código. `git status` limpo fora dos arquivos de
estado do loop.

## Critérios de aceite

- [ ] Decisão registrada — **pendente, e é o bloqueio**.
- [ ] Comportamento implementado nos dois handlers — depende da decisão.
- [ ] Teste atualizado — depende da decisão.
- [x] `TODO.md` corrigido — **já estava**, desde a task `21`. Ele hoje lista o
      `55` como achado aberto e descreve o comportamento real. A afirmação falsa
      que a task citava era do `TODO.md` de julho.

## Pendências e achados fora de escopo

`CHANGELOG.md:111` e `:194` ainda afirmam "resposta com reabertura automática" e
"resposta da usuária com reabertura" como entregues. **Não editei**: são registro
histórico do que se afirmou em julho, e reescrevê-lo apagaria a evidência de que
a afirmação existiu — mesmo critério que a task `21` usou ao mover 18 arquivos
para `docs/historico/` sem tocar no conteúdo. Quando a `55` for implementada, a
entrada nova do CHANGELOG corrige o registro pela frente, que é como changelog
se corrige.

## Decisões que precisam de humano

**Uma, e é para a Paloma.** As três opções estão na task, com o custo de cada
uma. O que este relatório acrescenta para a conversa:

1. Só a **opção 3** tira da empresa o poder de encerrar sozinha. A opção 1 não
   faz isso — ela dá voz, não decisão.
2. A **opção 2** é a única em que a fila da empresa distingue "contestado" de
   "novo", e sem e-mail no projeto essa distinção é o único aviso que existe.
3. Qualquer opção mexe na **taxa de resolução pública**. Se isso for número de
   pesquisa, a mudança precisa entrar na análise, não só no código.
