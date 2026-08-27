# Relatório — [68] Falha intermitente no login da suíte

- **Data:** 2026-08-27
- **Status:** done
- **Iterações de debug:** 1

## O que se sabia

Duas falhas, em nove execuções completas da suíte, ambas no preparo da sessão:

| Task | Teste | Erro |
|---|---|---|
| `60` | `api-erros.spec.ts:152` | não registrado — a execução usava `--reporter=line` |
| `64` | `auth.spec.ts:115` | `apiRequestContext.post: read ECONNRESET` no `POST /api/auth/login` |

O primeiro critério desta task — *"uma execução completa deixa registrado o
motivo de cada falha"* — foi cumprido ainda na task `62`, trocando o reporter. E
foi essa troca que capturou o segundo caso, que é o que deu nome à causa
provável: **erro de transporte**, não de aplicação. A conexão morreu antes de
virar resposta HTTP.

Os dois casos passam por `entrarViaApi` (o `sessao()` de `api-erros.spec.ts`
chama a mesma função), então são o mesmo ponto do código.

## Tentei reproduzir. Não consegui — e o "não" tem tamanho

Três hipóteses, três experimentos, em
[`reports/68-perf/reproduzir.mts`](68-perf/reproduzir.mts):

| | Hipótese | Formato | Logins | `ECONNRESET` |
|---|---|---|---|---|
| **A** | conexão `keep-alive` fechada no meio | abre, espera, manda de novo na mesma conexão — esperas de 0 a 7 s, cobrindo os 5 s do padrão do Node | 144 | **0** |
| **B** | portas efêmeras / `TIME_WAIT` no Windows | rajadas de 40 conexões novas seguidas, 8 rodadas | 320 | **0** |
| **C** | pela pilha de rede do Chromium, como a suíte | contexto de navegador novo por iteração, login como primeira requisição | 200 | **0** |

**664 logins dirigidos, nenhum reset.** O experimento C importa mais do que os
outros dois: `entrarViaApi` recebe `page.request`, que sai pelo Chromium e não
pelo Node — A e B nem passavam por lá.

Descartei também o servidor ter caído e voltado: o log da execução que falhou
não tem nenhum marcador de reinício do Next, e o aviso de ambiente que o
servidor imprime aparece **183 vezes** nessa execução contra **184** numa
execução limpa. O servidor era o mesmo do começo ao fim.

**Não sei a causa.** Está escrito assim de propósito.

## O que dá para fazer sem saber a causa

Duas coisas, e a segunda é a que vale mais.

**Sobreviver ao tropeço.** `entrarViaApi` passou a tentar duas vezes quando a
falha é de **transporte** — e só nesse caso:

```ts
try {
  resposta = await request.post("/api/auth/login", { ... });
} catch (erro) {
  // Erro de transporte: a conexão morreu antes de virar resposta HTTP.
  // É outra categoria de falha, e por isso é a única que ganha nova tentativa —
  // resposta com status ruim continua estourando na hora.
  ...
}
```

**Contar quando acontecer.** Cada nova tentativa imprime
`[e2e] login de <papel>, tentativa N de 2: <erro>`. Sem isso a correção
esconderia exatamente o dado que falta para achar a causa: uma suíte que passa
não diria mais se o tropeço aconteceu ou não. Com o aviso, cada execução
responde essa pergunta.

### A linha que a correção não pode cruzar

O risco óbvio de "tentar de novo" é virar *repete até dar certo*, e aí um
defeito real do login passaria a se esconder atrás da segunda tentativa. Por
isso a distinção é categórica, não uma questão de grau:

- **exceção** (conexão) → nova tentativa;
- **resposta com status ruim** → estoura na hora, sem nova tentativa.

Isso está provado, não só afirmado. `reports/68-perf/nova-tentativa.mts` injeta
o erro — já que não dá para provocá-lo de verdade — e confere as três decisões:

```
1. reset na primeira, resposta na segunda
  ok   a sessão foi obtida
  ok   tentou duas vezes — 2 chamada(s)

2. reset nas duas
  ok   estourou
  ok   a mensagem cita ECONNRESET
  ok   a mensagem aponta a task 68
  ok   parou nas duas tentativas — 2 chamada(s)

3. status ruim — não pode ganhar nova tentativa
  ok   estourou
  ok   a mensagem cita o status — Login de empresa falhou com 403...
  ok   tentou UMA vez só — 1 chamada(s)
```

## Verificação

| Comando | Resultado |
|---|---|
| `reproduzir.mts` A, B e C | ✅ 664 logins, 0 resets — a não-reprodução está medida |
| `nova-tentativa.mts` | ✅ 9 de 9 conferências |
| `npx tsc --noEmit` | ✅ 0 erros |
| `npx eslint src e2e --max-warnings 9999` | ✅ 0 erros, 0 avisos |
| `npm run build` | ✅ limpo |
| `npx vitest run` | ✅ 31 de 31 |
| suíte inteira | ✅ **469 passando, 3 pulados**, e **nenhuma linha `[e2e] login de`** — nesta execução o tropeço não aconteceu |

## Critérios de aceite

- [x] **Uma execução completa da suíte deixa registrado o motivo de cada
      falha** — resolvido na task `62`, trocando `--reporter=line` por `list`.
- [x] **A causa do `ECONNRESET` está identificada, ou a suíte passa várias
      execuções seguidas sem ele** — pela segunda metade: **cinco execuções
      completas seguidas sem nenhuma ocorrência** (tasks `65`, `66`, `67` e as
      duas desta). A causa **não** foi identificada, e a tentativa de
      identificá-la está medida acima.

## O que fica em aberto, dito com todas as letras

A causa continua desconhecida. O que mudou:

1. a suíte não quebra por um tropeço de conexão;
2. **se ele acontecer, o log diz** — antes, ou o teste falhava sem explicação,
   ou nada aparecia;
3. se acontecer duas vezes seguidas no mesmo login, a suíte ainda falha, com
   uma mensagem que aponta para esta task.

Se as linhas `[e2e] login de` começarem a aparecer com frequência em execuções
que passam, aí sim haverá material para achar a causa — e essa é a diferença
entre o estado de antes e o de agora.

## Pendências e achados fora de escopo

Nenhuma task nova.
