# [68] Um teste de formato de erro falhou uma vez, e a falha não ficou registrada

| Campo | Valor |
|---|---|
| **ID** | `68` |
| **Fase** | `2 — Correções pontuais` |
| **Risco** | baixo |
| **Depende de** | — |
| **Achado em** | task `60` (CLS do blog) |
| **Estimativa** | pequena |

## O que foi observado

Numa execução completa da suíte, durante a verificação da task `60`:

```
1 failed
  [chromium-mobile] › e2e\api-erros.spec.ts:152:5 › id inexistente devolve NOT_FOUND, e não 500
3 skipped
476 passed (28.0m)
```

O teste manda `GET /api/company/complaints/00000000-0000-4000-8000-000000000000`
com sessão de empresa e exige `error.code === "NOT_FOUND"`.

**Não se reproduz:**

- isolado, `--repeat-each=3` no mesmo projeto: 3 de 3 passando;
- suíte completa rodada de novo, sem mudar uma linha: **477 passando, 3
  pulados** — o total de sempre.

## Por que não dá para dizer mais do que isso

A execução usava `--reporter=line`, que reescreve a mesma linha do terminal e
**não guardou o detalhe da falha**. Não sei se veio 500, se veio 403, nem qual
era o corpo. Sem isso, qualquer diagnóstico seria chute.

O caminho do código é determinístico e não explica falha intermitente:
`ComplaintsRepo.findById` lança `"Complaint not found"` quando não acha, e o
`catch` da rota traduz exatamente essa mensagem em `naoEncontrado()`. O que
sobra como suspeita é o **preparo da sessão** (`sessao(browser, "empresa")`
faz login de verdade) ou uma falha de banco no momento — a suíte roda sem
`DATABASE_URL`, pela conexão direta, e o próprio servidor avisa em toda
execução que isso não passa pelo pooler.

## A falha voltou, e desta vez deixou rastro

Na verificação da task `64`, com `--reporter=list` — que é justamente o que esta
task recomenda:

```
1) [chromium-desktop] › e2e/auth.spec.ts:115:7 › acesso cruzado entre papéis ›
   empresa não entra na administração

   Error: apiRequestContext.post: read ECONNRESET
   Call log:
     - → POST http://localhost:5000/api/auth/login
   at entrarViaApi (e2e/fixtures/auth.ts:41)
```

Não é asserção falhando: é a **conexão sendo derrubada** no `POST /api/auth/login`
do preparo da sessão. E isso muda o diagnóstico do caso original: a suspeita
registrada abaixo era exatamente essa — *"o que sobra como suspeita é o preparo
da sessão"* —, e agora há evidência de que o preparo da sessão morre no
transporte, sem chegar a virar resposta HTTP.

Os dois casos têm a mesma forma: teste que começa com login por API, falhando
sozinho no meio de uma suíte de ~470 testes que passa inteira na execução
seguinte. O servidor de desenvolvimento avisa, em toda execução, que está usando
`DIRECT_URL` em vez do pooler do Neon.

Isto reduz a task a uma pergunta mais concreta: **por que o servidor derruba
uma conexão de login sob a carga da suíte?**

## Por que importa

Duas coisas, e a segunda é a que pega mais:

1. A suíte não é determinística. Este é o segundo caso registrado, depois do
   `66` (teste de teclado). Suíte que falha de vez em quando ensina quem a roda
   a ignorar falha — e aí a falha de verdade passa.
2. **A primeira falha não deixou rastro.** Rodar 480 testes por 28 minutos e
   não guardar o motivo da única falha era o defeito mais barato de corrigir
   aqui — e já foi: o reporter mudou, e a segunda falha veio com o erro
   completo.

## O que fazer

- [x] Usar um reporter que preserve o detalhe da falha nas execuções longas
      (`--reporter=list`, ou `html`/`json` gravado em arquivo). O `line` serve
      para rodar olhando; não serve para rodar em segundo plano. **Feito a
      partir da task `62`** — e foi o que capturou o `ECONNRESET`.
- [ ] Descobrir por que o servidor derruba a conexão do login sob a carga da
      suíte. Duas pistas para começar: a suíte roda sem `DATABASE_URL`, pela
      conexão direta ao Neon, e o servidor de desenvolvimento é o único
      atendendo ~470 testes em sequência.

## Critérios de aceite

- [x] **Uma execução completa da suíte deixa registrado o motivo de cada
      falha** — resolvido trocando o reporter; foi assim que o `ECONNRESET`
      acima apareceu.
- [ ] A causa do `ECONNRESET` no login está identificada, ou a suíte passa
      várias execuções seguidas sem ele.

## Nota

Não é regressão da task `60`: aquela mudança mexeu em `/blog` e `/blog/all`, não
em rota de API nenhuma, e a suíte seguinte passou inteira com a mudança no
lugar.
