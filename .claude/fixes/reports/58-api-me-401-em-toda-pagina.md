# Relatório — [58] `/api/me` devolve 401 e suja o console de toda página anônima

- **Data:** 2026-08-27
- **Status:** done
- **Iterações de debug:** 0

## O que foi encontrado

Tudo como a task descrevia. `src/app/api/me/route.ts` chamava `naoAutenticada()`
em dois lugares — sem sessão, e sessão apontando para conta que não existe mais —
e o `AuthStateProvider` (`src/hooks/use-auth-state.tsx`) pergunta em **todo**
carregamento, porque o cookie é `httpOnly` e o cliente não tem outro jeito de
saber se há alguém logado.

O tamanho do incômodo estava registrado no próprio repositório: o canário
`e2e/smoke.spec.ts` tinha uma lista de exceções com uma entrada só, e a entrada
era esta:

```ts
const RUIDO_ESPERADO = [/Failed to load resource.*401/i];
```

Uma lista de ruído esperado com um item é o começo de uma lista com dez.

## O que foi feito

| Arquivo | Mudança |
|---|---|
| `src/app/api/me/route.ts` | Uma função `semSessao()` devolve `200 { user: null, profile: null, companyMembership: null }`. Usada nos dois pontos que respondiam 401 |
| `src/hooks/use-auth-state.tsx` | Simplificado: era `response.ok ? await response.json() : null`, virou `await response.json()`. O `catch` que já existia continua cobrindo rede fora do ar e 500 |
| `e2e/smoke.spec.ts` | A lista de exceções **deixou de existir**, e o teste virou "o console da home não tem erro nenhum" |
| `e2e/ownership.spec.ts` | `/api/me` saiu da lista de rotas que exigem 401 e ganhou teste próprio |
| `e2e/api-authorization.spec.ts` | `GET /api/me` passou de `permite: LOGADOS, nega: ["anonimo"]` para `permite: TODOS` |
| `docs/autorizacao.md` | Linha da matriz corrigida, mais uma nota explicando por que esta rota é a exceção da tabela, e o inventário de rotas atualizado |
| `docs/api-erros.md` | `/api/me` entrou em "Exceções conhecidas": não usa `UNAUTHENTICATED` |

### O caso que a task não citava

Havia um **segundo** `naoAutenticada()`, para sessão válida cujo `user` ou
`profile` sumiu do banco. Ele também virou 200 com tudo nulo, e continua
apagando o cookie morto: a resposta certa para "essa conta não existe mais" é a
mesma de quem nunca entrou, e deixar esse caminho em 401 manteria o erro
vermelho para exatamente quem já está numa situação estranha.

### Por que o 200 sozinho seria uma piora

Uma rota que negava passou a responder. Isso, isolado, é o tipo de mudança que
merece desconfiança — e por isso o teste novo em `ownership.spec.ts` não confere
o status: confere o **corpo**, campo a campo, com `toEqual`. Chave a mais no
objeto reprova. É o que garante que "responde a todo mundo" não vire "conta
alguma coisa para todo mundo".

## Medido no build de produção

O critério 2 fala do build de produção, então foi lá que medi — não no servidor
de desenvolvimento, onde a suíte roda.

| Verificação | Antes | Agora |
|---|---|---|
| `curl /api/me` sem sessão | 401 | **200** |
| corpo devolvido | envelope de erro | `{"user":null,"profile":null,"companyMembership":null}` |
| erros no console da home anônima | 1 por carregamento | **nenhuma mensagem, de nenhum tipo** |
| `GET /api/me` na aba de rede | 401 | 200 |

## Verificação

| Comando | Resultado |
|---|---|
| `npx tsc --noEmit` | ✅ 0 erros |
| `npx eslint src e2e --max-warnings 9999` | ✅ 0 erros, 0 avisos |
| `npm run build` | ✅ limpo |
| `smoke` + `ownership` (portão e `/api/me`) | ✅ 3 de 3 |
| `npx vitest run` | ✅ 18 de 18 |
| suíte inteira | ✅ **475 passando, 3 pulados** em 22,8 min — 473 antes desta task mais os 2 do teste novo. O teste instável da task `66` **não reapareceu** nesta execução |

## Critérios de aceite

- [x] **`GET /api/me` sem sessão devolve 200 com `{ user: null }`** — medido com
      `curl` no build de produção e asserido campo a campo no E2E.
- [x] **O console da home anônima, no build de produção, fica sem nenhum erro** —
      conferido no navegador contra o servidor de produção: *nenhuma* mensagem
      de console, não só nenhum erro.
- [x] **Os documentos e os testes acompanham a mudança** — quatro arquivos de
      teste e dois documentos.

## Duas coisas que a primeira execução da suíte inteira mostrou

**1. Uma lista que eu não tinha atualizado.** `e2e/auth.spec.ts:138` também
mantinha `/api/me` numa lista de rotas que devem negar visitante anônimo — a
terceira lista, além da matriz e do portão de `ownership.spec.ts`. Corrigida.
Vale a observação: a mesma asserção aparecia em três arquivos, e eu só tinha
achado dois lendo o código. Foi a suíte que achou o terceiro.

**2. Um teste instável, que não é regressão desta task.**
`e2e/keyboard.spec.ts:85` falhou **só no `chromium-mobile`**, no terceiro dos
três `select` da etapa 4 do assistente. Rodado em isolamento com
`--repeat-each=2`, passou duas vezes.

Não é efeito da mudança, e dá para afirmar isso pelo código e não por intuição:
no assistente a usuária **está logada**, e para quem está logada `/api/me` já
respondia 200 antes desta task. O caminho é idêntico antes e depois.

A causa provável é corrida do teste com o `Select` do Radix — ele manda
`ArrowDown` sem esperar a lista montar no portal. Registrado como task `66` em
vez de corrigido aqui: o `LOOP.md` manda abrir task nova em vez de ampliar o
escopo, e correção de teste instável precisa da própria verificação, com
`--repeat-each` alto o bastante para significar alguma coisa.

## Pendências e achados fora de escopo

Task `66` aberta — teste de teclado instável, achado na execução da suíte.

## Decisões que precisam de humano

Nenhuma.
