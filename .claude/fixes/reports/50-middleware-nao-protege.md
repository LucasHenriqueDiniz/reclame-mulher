# Relatório — [50] O middleware de autenticação não estava protegendo `/app/*`

- **Data:** 2026-08-26
- **Status:** done
- **Iterações de debug:** 1 (bug introduzido por mim e corrigido — ver abaixo)

## Causa-raiz

**O arquivo estava no lugar errado.** `middleware.ts` estava na raiz do
repositório. O projeto usa diretório `src/`, e nesse caso o Next só reconhece o
middleware em `src/middleware.ts`.

O detalhe que atrasou o diagnóstico: o log do dev server mostrava
`✓ Compiled middleware in 242ms`, o que dá a impressão de que ele está ativo.
Ele era compilado e nunca invocado.

### Como foi comprovado, em vez de deduzido

Minha primeira hipótese estava errada. `src/lib/auth/session.ts` começa com
`import "server-only"`, e o middleware roda no Edge — parecia explicação
suficiente. Em vez de assumir, inseri um `console.log` temporário dentro do
middleware:

```
(nenhuma saída para /app, /app/complaints ou /app/settings)
```

Nenhum log, nenhuma exceção. A função simplesmente não era chamada. Depois de
`git mv middleware.ts src/middleware.ts`:

```
[MW] /app             public= false session= nao
[MW] /app/complaints  public= false session= nao
[MW] /app/settings    public= false session= nao
```

O `server-only` nunca foi problema.

## Consequência do que estava acontecendo

O middleware era **código morto**. Toda a proteção de rota vinha da checagem
manual dentro de cada página. Os 307 que `/app` e `/app/admin` devolviam eram do
`redirect("/login")` da própria página — não do middleware. Onde a página usava
`if (!session) return null`, o visitante anônimo recebia 200 com página em
branco.

## O que foi feito

| Arquivo | Mudança |
|---|---|
| `middleware.ts` → `src/middleware.ts` | movido para onde o Next enxerga |
| `src/middleware.ts` | lista de rotas públicas reescrita, com helper `matches` |
| `src/app/app/complaints/page.tsx` | `if (!session) return null` → `redirect("/login")` |
| `src/app/app/settings/page.tsx` | idem |

Eram as duas únicas ocorrências do antipadrão — confirmado por
`grep -rn "return null" src/app --include=page.tsx`.

### A lista de rotas públicas estava errada, e ninguém percebia

Com o middleware morto, a lista nunca foi exercitada. Ao ativá-la, apareceram
rotas públicas legítimas que ela não cobria:

| Rota | O que acontecia ao ativar |
|---|---|
| `/companies` | redirecionava para `/login` |
| `/api/complaints` | redirecionava para `/login` |
| `/api/search` | redirecionava para `/login` |
| `/api/uploadthing` | redirecionava para `/login` |

O caso de `/companies` merece nota: a lista tinha `pathname.startsWith("/company")`,
e é fácil ler isso como se cobrisse `/companies`. Não cobre —
`"/companies".startsWith("/company")` é **`false`**, porque o prefixo comum é
`/compan`. As duas rotas precisam de entradas próprias.

A lista foi reescrita em dois arrays explícitos (`PUBLIC_PAGES` e
`PUBLIC_APIS`) com um helper que distingue prefixo de correspondência exata, e
um comentário no topo registrando por que o arquivo precisa ficar em `src/`.

### Erro que eu introduzi e corrigi

A primeira versão do helper era:

```ts
route.endsWith("/") ? pathname.startsWith(route) : ...
```

Como `"/"` termina em `/`, a entrada da home virava `pathname.startsWith("/")`
— verdadeiro para **todo** caminho, tornando o site inteiro público. Apanhado na
verificação, quando `/app/complaints/new` voltou 200. Corrigido com um caso
explícito para `"/"`, e a rodada seguinte passou 17/17.

## Verificação

| Verificação | Resultado |
|---|---|
| 17 rotas `/app/*` sem sessão | ✅ **17/17** respondem 307 → `/login` |
| 17 páginas públicas sem sessão | ✅ **17/17** respondem 200 |
| 6 APIs públicas sem sessão | ✅ todas 200 (`/api/me` 401, que se protege sozinho) |
| APIs protegidas sem sessão | ✅ 401 / 403, nenhuma 200 |
| Login dos 3 perfis | ✅ 200 nos três |
| `/app/complaints` e `/app/settings` com sessão | ✅ 200 nos três perfis |
| `npm run check` | ✅ 0 erros, 45 warnings (igual ao baseline) |
| `npm run build` | ✅ `Compiled successfully in 13.6s` |

Autorização por papel, conferida com sessão real:

| Rota | Pessoa | Empresa | Admin |
|---|---|---|---|
| `/app/complaints` | 200 | 200 | 200 |
| `/app/company/dashboard` | 307 | **200** | 307 |
| `/app/admin` | 307 | 307 | **200** |

E `/login` com sessão passou a redirecionar para `/app` — outro trecho do
middleware que nunca havia executado.

## Critérios de aceite

- [x] Toda rota sob `/app/` redireciona para `/login` sem sessão — 17/17.
- [x] Nenhum `if (!session) return null` restante em `src/app/app/`.
- [x] O redirecionamento vem do middleware — comprovado por log, não deduzido.
- [ ] **Teste de regressão automatizado** — pendente: depende da task `07`
      (infraestrutura de testes), que ainda não rodou. A task `08` já tem no
      escopo asserir a lista inteira de rotas `/app/*`.

## Nota para a task `08`

Além do redirect, vale asserir o inverso: que as 17 páginas públicas e as 6 APIs
públicas continuam abertas. A regressão perigosa aqui não é "esqueci de
proteger" — é "protegi demais e derrubei a parte pública do site", que foi
exatamente o que quase aconteceu nesta task.
