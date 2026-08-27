# [50] O middleware de autenticação não está protegendo `/app/*`

| Campo | Valor |
|---|---|
| **ID** | `50` |
| **Fase** | `6 — Segurança e dados` |
| **Risco** | **alto** |
| **Depende de** | `03` |
| **Estimativa** | média |
| **Criada por** | task `00` (investigação), 2026-08-26 |

## Objetivo

Fazer o `middleware.ts` cumprir o papel que ele declara ter: barrar requisição
sem sessão antes de chegar na página. Hoje ele não barra, e a única proteção que
funciona é a checagem manual dentro de cada página.

## Evidência

Servidor de desenvolvimento aquecido, requisições **sem nenhum cookie**:

| Rota | HTTP | Destino |
|---|---|---|
| `/app` | 307 | `/login` |
| `/app/complaints` | **200** | — |
| `/app/complaints/new` | **200** | — |
| `/app/company/dashboard` | 307 | `/login` |
| `/app/company/inbox` | 307 | `/app/company/dashboard?tab=complaints` |
| `/app/admin` | 307 | `/login` |
| `/app/settings` | **200** | — |
| `/app/settings/security` | 307 | `/app/settings` |

O `middleware.ts` declara `/app/*` como rota não pública e deveria redirecionar
todas para `/login`. Ele redireciona apenas algumas — e os 307 que aparecem vêm
na verdade do `redirect("/login")` **dentro da própria página**, não do
middleware.

A diferença entre as rotas está no padrão usado em cada `page.tsx`:

```ts
// src/app/app/page.tsx  → redireciona
const session = await getSession();
if (!session) {
  redirect("/login");
```

```ts
// src/app/app/complaints/page.tsx  → devolve página em branco com HTTP 200
const session = await getSession();
if (!session) return null;
```

```ts
// src/app/app/settings/page.tsx  → mesmo padrão
if (!session) return null;
```

## Gravidade

**Não há vazamento de dados.** Confirmado: o corpo devolvido pelas rotas com 200
tem cerca de 32 KB de shell da aplicação, sem nenhum dado do seed — nenhuma
ocorrência de título de reclamação, nome ou e-mail de usuária. As rotas de API
por trás devolvem 401 corretamente.

O problema é outro, e é sério por dois motivos:

1. **O middleware é uma falsa sensação de segurança.** Toda página nova que
   esquecer o `getSession()` fica exposta, porque a camada que deveria pegar
   isso não está pegando.
2. **UX quebrada.** Quem abrir um link salvo de `/app/complaints` sem sessão vê
   uma página em branco, não a tela de login.

## Passos

1. Descubra por que o middleware não redireciona. Comece verificando se ele
   executa: coloque um log temporário e confirme se a função roda para
   `/app/complaints`. Suspeitos, em ordem:
   - `getSessionFromRequest` lançando exceção silenciosa e o Next seguindo com
     `NextResponse.next()`;
   - o `matcher` não casando com essas rotas;
   - divergência entre `getSession` (que lê `cookies()`) e
     `getSessionFromRequest` (que lê do `request`).

2. Corrigido o middleware, **padronize as páginas**. Escolha um padrão único —
   `redirect("/login")` — e elimine todo `if (!session) return null` das rotas
   sob `/app/`. Página em branco nunca é resposta correta para falta de sessão.

3. Varra o restante do projeto pelo mesmo antipadrão:

   ```bash
   grep -rn "if (!session) return null" src/app
   ```

4. Adicione o teste de regressão em `e2e/auth.spec.ts` (task `08`): toda rota
   sob `/app/` sem sessão **redireciona para `/login`**. Asserir o redirect, não
   apenas "não vazou dado".

## Critérios de aceite

- [ ] Toda rota sob `/app/` responde com redirect para `/login` quando não há
      sessão. Nenhuma responde 200.
- [ ] Nenhuma ocorrência de `if (!session) return null` sobrou em `src/app/app/`.
- [ ] O redirecionamento vem do middleware, comprovadamente, e não só da página.
- [ ] Teste de regressão cobrindo a lista inteira de rotas `/app/*`.

## Verificação

```bash
for p in /app /app/complaints /app/complaints/new /app/company/dashboard /app/company/inbox /app/admin /app/settings /app/settings/security; do printf "%-34s %s\n" "$p" "$(curl -s -o /dev/null -w '%{http_code}' http://localhost:5000$p)"; done
```

Todas devem responder 307.

## Riscos e armadilhas

Mexer no middleware afeta **todas** as rotas de uma vez, inclusive as públicas.
Depois de corrigir, confirme que `/`, `/blog`, `/company/[slug]`, `/login` e
`/register` continuam acessíveis sem sessão — um middleware "corrigido" que
passa a barrar página pública é um estrago maior que o problema original.
