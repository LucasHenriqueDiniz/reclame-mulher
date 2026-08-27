# Relatório — [51] Rate limiter em memória com bucket compartilhado

- **Data:** 2026-08-26
- **Status:** done
- **Iterações de debug:** 1 (falso positivo meu — ver "Erro de método")

## O que foi encontrado

Os três problemas descritos na task se confirmaram no código, e o principal
tinha sido observado na prática: durante a task `00`, cinco logins legítimos
esgotaram a cota e o sexto levou 429, invalidando uma bateria de testes.

## O que foi feito

`src/lib/rate-limit.ts` foi reescrito. A API deixou de ser um `rateLimit(request)`
que fazia tudo, e passou a separar as três coisas que estavam misturadas:

```ts
enforceRateLimit(target)   // consulta a cota, não incrementa
registerFailure(target)    // só em tentativa que falhou de verdade
clearFailures(target)      // sucesso zera o contador
```

O `target` carrega escopo, identidade e IP — e a identidade é a chave
principal.

### As três correções

**1. A chave passou a ser a identidade tentada.** `getClientIp` agora devolve
`null` em vez da string `"unknown"`, e a chave principal é o e-mail (ou o
`userId`, na troca de senha). O IP é uma segunda camada, com teto próprio, e só
entra quando existe de verdade. Sem identidade **e** sem IP, deixa passar — o
que é melhor que a alternativa anterior de juntar todo mundo num balde só, já
que a credencial válida continua sendo exigida.

**2. Só falha conta.** O incremento saiu do topo do handler e foi para o ramo de
erro. Tentativa bem-sucedida chama `clearFailures`.

**3. Duas camadas com tetos diferentes.** 5 falhas por e-mail (protege a conta)
e 20 por IP (contém quem varre vários e-mails da mesma origem). Assim rede
compartilhada não é punida por uso normal, mas enumeração ainda esbarra em algo.

| Escopo | Chave principal | Cota | Teto por IP |
|---|---|---|---|
| `login` | e-mail | 5 / 15 min | 20 / 15 min |
| `register` | e-mail | 5 / 15 min | 20 / 15 min |
| `register-company` | e-mail | 5 / 15 min | 20 / 15 min |
| `change-password` | `userId` | 5 / 15 min | 20 / 15 min |

Os quatro handlers foram religados. No `login`, o corpo passou a ser lido antes
da trava — necessário para saber qual identidade está sendo tentada — mas nada
caro (consulta ao banco, verificação de hash) acontece antes dela.

### `Retry-After` e mensagem na tela

A resposta 429 agora traz o header `Retry-After` e o tempo restante no corpo:

```json
{"error":"Muitas tentativas. Tente novamente em 15 minutos.","retryAfterSeconds":897}
```

A tela de login já fazia `setErr(body.error || ...)`, então passou a exibir o
tempo **sem precisar de alteração no front**.

### Persistência: documentada, não resolvida

Criado `docs/autorizacao.md` com a decisão registrada de forma explícita: o
`Map` em memória é aceitável **enquanto o deploy for de instância única**, e
precisa ir para Postgres ou KV **antes** de qualquer migração para serverless —
onde o limite efetivo viraria (nº de instâncias × a cota).

O documento também recebeu a descrição das camadas de autorização e a nota de
que o middleware precisa ficar em `src/middleware.ts` (task `50`). As tasks `11`
e `16` vão completá-lo.

## Verificação

Seis comportamentos, todos verificados com o servidor rodando:

| # | Cenário | Esperado | Resultado |
|---|---|---|---|
| 1 | 6 senhas erradas para `maria@` | 5×401, depois 429 | ✅ `401 401 401 401 401 429` |
| 2 | Header `Retry-After` no 429 | presente | ✅ `retry-after: 896` |
| 3 | Outro e-mail (`ana@`) após `maria@` travada | 401, não 429 | ✅ 401 — **a correção principal** |
| 4 | `maria@` com senha certa estando travada | 429 | ✅ 429 |
| 5 | 3 falhas → sucesso → 4 falhas | todas 401 (contador zerou) | ✅ `401 401 401 401` |
| 6 | 22 e-mails distintos do mesmo IP | 2 bloqueios (teto 20) | ✅ exatamente 2 |

| Comando | Resultado |
|---|---|
| `npm run typecheck` | ✅ 0 erros |
| `npm run check` | ✅ 0 erros, 45 warnings (baseline) |
| `npm run build` | ✅ `Compiled successfully in 14.2s` |
| Login dos 3 perfis | ✅ 200 nos três |
| Middleware da task `50` | ✅ segue correto (`/app/complaints` 307, `/` 200, `/api/complaints` 200) |

## Erro de método

A meio caminho o login começou a devolver 500 e pareceu regressão minha. Não
era: eu tinha rodado `npm run build` com o dev server de pé, e os dois escrevem
em `.next`. O log mostrava `ENOENT ... _buildManifest.js.tmp`, não erro de
código. Resolvido com `rm -rf .next` e restart.

Registrei a armadilha no `LOOP.md`, na seção de verificação, para não custar
tempo de novo.

## Critérios de aceite

- [x] Requisição sem header de proxy não cai mais numa chave compartilhada.
- [x] Login bem-sucedido não consome cota.
- [x] 429 inclui `Retry-After` e a UI informa o tempo de espera.
- [x] Decisão sobre persistência documentada em `docs/autorizacao.md`.
- [ ] **Testes automatizados** — pendente da task `07`. Os seis cenários acima
      foram verificados à mão e estão descritos aqui para virarem specs.

## Nota para a task `07`

`__resetRateLimitStore()` foi exportado justamente para o teste conseguir isolar
cada caso. Sem isso, um teste contamina o seguinte, porque o estado é de módulo.
