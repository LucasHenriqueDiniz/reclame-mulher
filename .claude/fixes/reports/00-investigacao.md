# Relatório — [00] Investigação: retrato real do projeto

- **Data:** 2026-08-26
- **Status:** done
- **Iterações de debug:** 0
- **Arquivos de produção modificados:** nenhum (conforme a regra da task)

---

## Veredito curto

O projeto está **melhor do que a documentação otimista sugere em segurança** e
**pior do que ela sugere em verificação**. A camada de autorização das APIs é
sólida e o build de produção passa por mérito. O que não existe é qualquer prova
automatizada disso: zero testes. Foram encontrados dois defeitos reais que
nenhum dos relatórios anteriores mencionava.

---

## 1. Estado do repositório

| Item | Medição |
|---|---|
| Branch | `master` |
| Último commit antes da fila | `18c75b2` |
| Arquivos modificados não commitados | 18 (+260 / −91) |
| Arquivos não rastreados | `dev-server.log`, `dev-server-err.log` |
| Worktrees em `.claude/worktrees/` | 5, todas com commits próprios fora do `master` |

As worktrees **não** foram removidas — a task `01` decide, e a regra é não
remover nenhuma que tenha commit exclusivo.

## 2. Saúde da build

| Verificação | Resultado |
|---|---|
| `tsc --noEmit` | ✅ **0 erros** |
| `eslint .` | 4 erros, 277 warnings |
| `eslint src` | ✅ **0 erros** |
| `npm run build` (do zero, `.next` apagado) | ✅ **passa**, exit 0 |
| `ignoreBuildErrors` / `ignoreDuringBuilds` | ❌ ausentes — o build passa por mérito |

Os 4 erros de lint estão **todos** em
`.claude/worktrees/agent-aacf5215958daeba6/`, nenhum em `src/`. Confirma a
premissa da task `01`.

Distribuição dos 277 warnings:

| Regra | Ocorrências |
|---|---|
| `@typescript-eslint/no-unused-vars` | 235 |
| `@next/next/no-img-element` | 42 |
| `react/no-unescaped-entities` | 2 |
| `@next/next/no-html-link-for-pages` | 2 |

**Impacto na fila:** a task `18` (build de produção) já está quase satisfeita —
ver seção 7.

## 3. Superfície da aplicação

42 páginas, 32 rotas de API, 95 componentes. Inventário de autorização das APIs:

| Guarda | Rotas |
|---|---|
| `getCurrentAdminContext` | 4 |
| `getCurrentCompanyContext` | 10 |
| `getSession` | 10 |
| Pública por design | 8 (`/api/auth/*`, `/api/blog/featured`, `/api/blog/tags`, `/api/companies*`, `/api/search`, `/api/uploadthing`) |

Rotas com verificação de **posse**, não só de papel: `/api/company/complaints/[id]`,
`/api/company/complaints/[id]/status`, `/api/company/complaints/[id]/messages`,
`/api/company/projects/[id]`, `/api/complaints`.

### A camada de autorização é melhor do que o `TODO.md` fazia parecer

Amostras lidas linha a linha:

- `/api/company/complaints/[id]/status` — checa contexto de empresa **e**
  `complaint.companyId !== context.companyId` → 403.
- `/api/complaints/[id]/messages` — resolve autoria e participação
  (`isAuthor`, `isCompanyMember`) e nega quem não é nenhum dos dois.
- `/api/blog/posts/[id]` PUT e DELETE — exigem `profile.role === "ADMIN"`.
- `/api/complaints` GET sem sessão é **público por design**: usa
  `findPublic()`. Verificado no dado real — 8 reclamações retornadas, **0** com
  `isPublic: false`, **0** anônimas com autor exposto.

## 4. A aplicação funciona?

Servidor de desenvolvimento sobe normalmente na porta 5000. Banco Neon conecta
(via `DIRECT_URL`; ver seção 8).

| Verificação | Resultado |
|---|---|
| Home e 14 páginas públicas | ✅ 200 (exceto `/empresas`, que redireciona — 307, aparentemente por design) |
| `/company/construtora-x` (slug real) | ✅ 200 |
| Login pessoa / empresa / admin | ✅ 200, cookie de sessão emitido nos três |
| Login com senha errada | ✅ 401, `{"error":"Email ou senha inválidos"}` |
| API sem sessão: `/api/me`, `/api/company/*` | ✅ 401 |
| API sem sessão: `/api/admin/*` | ✅ 403 |
| Rate limiting no login | ✅ existe (429) — mas ver achado 2 |

### Limitação desta investigação

O navegador embutido **recusou a navegação para `localhost:5000`**, então tudo
acima foi verificado por HTTP direto. Não foi possível medir nesta rodada:

- **responsividade em 375px** — não medido;
- **acessibilidade (axe)** — não medido;
- comportamento de JavaScript no cliente, hidratação e fluxos de UI.

Isso **não** bloqueia a fila: as tasks `12`, `14` e `15` montam Playwright, que
não depende do navegador embutido. A contradição "5% vs validada" sobre
responsividade **permanece em aberto** e será decidida pela task `14`.

---

## 5. Achado 1 — o middleware não protege `/app/*` · task [`50`](../tasks/50-middleware-nao-protege.md)

Requisições **sem cookie**, servidor aquecido:

| Rota | HTTP |
|---|---|
| `/app` | 307 → `/login` |
| `/app/complaints` | **200** |
| `/app/complaints/new` | **200** |
| `/app/settings` | **200** |
| `/app/company/dashboard` | 307 → `/login` |
| `/app/admin` | 307 → `/login` |

Causa-raiz identificada: os 307 vêm do `redirect("/login")` **dentro da
página**, não do middleware. Onde a página usa `if (!session) return null`, o
anônimo recebe HTTP 200 com uma página em branco.

**Não há vazamento de dados** — verificado: ~32 KB de shell, zero ocorrências de
dado do seed. O problema é que o middleware é uma falsa rede de segurança:
qualquer página nova que esquecer o `getSession()` fica exposta.

## 6. Achado 2 — rate limiter com balde compartilhado · task [`51`](../tasks/51-rate-limit-em-memoria.md)

`src/lib/rate-limit.ts`: `Map` em memória, 5 requisições / 15 min, e
`getClientIp` devolve a string `"unknown"` quando não há header de proxy —
colapsando **todas** essas requisições numa única cota.

Aconteceu de verdade durante esta investigação: cinco logins legítimos e o sexto
levou 429, invalidando uma bateria de testes. Conta login bem-sucedido como
tentativa, e o estado não sobrevive a restart nem se compartilha entre
instâncias serverless.

---

## 7. Ajustes na fila

| Task | Ação | Motivo |
|---|---|---|
| `04` | **Provável `skipped`** | `eslint src` já dá 0 erros; a task `01` deve zerar o total |
| `18` | **Escopo reduzido** | Build já passa e não há `ignoreBuildErrors`; sobra verificar `npm run start` e hidratação |
| `16` | **Risco reduzido** | A autorização é melhor do que o previsto; a matriz continua necessária |
| `14` | **Mantida, sem veredito** | Responsividade não medida — contradição em aberto |
| `50` | **Criada** | Middleware não protege `/app/*` |
| `51` | **Criada** | Rate limiter com balde compartilhado |

Ordem sugerida a partir daqui: `01` → `02` → `03` → `50` → `07`. A `50` sobe na
fila por ser defeito confirmado de segurança em profundidade, e cabe antes dos
testes para que a task `08` já asserte o comportamento correto.

## 8. Observações para tasks futuras

- **`.env` não tem `DATABASE_URL`.** Funciona por causa do fallback
  `process.env.DATABASE_URL ?? process.env.DIRECT_URL`. Mas `src/db/client.ts`
  cai silenciosamente para `postgresql://build:build@localhost/build` quando a
  URL contém `"build"` — em produção mal configurada, a aplicação conecta num
  banco inexistente em vez de falhar alto. Insumo da task `20`.
- **Status de reclamação: a documentação está errada.** O `TODO.md` descreve
  `OPEN → IN_PROGRESS → RESOLVED`. O código usa `OPEN`, `RESPONDED`,
  `RESOLVED`, `CANCELLED`, e a reabertura é `RESPONDED → OPEN`. As tasks `10` e
  `11` devem usar os valores do código.
- **`/api/user/profile` responde 405** sem sessão porque só existe `PATCH` —
  comportamento correto, mas a task `11` precisa saber para não marcar como
  falha.

## 9. Baseline registrado

Gravado em `STATE.json > baseline`, agora com medição confirmada:
`tsc` 0 erros · `eslint .` 4 erros / 277 warnings · `eslint src` 0 erros ·
build de produção ✅ · 0 testes · 42 páginas · 32 rotas · 18 arquivos não
commitados · 5 worktrees · responsividade **não medida** · acessibilidade
**não medida**.

## Decisões que precisam de humano

1. **Worktrees.** As 5 têm commits fora do `master`. A task `01` não vai remover
   nenhuma. Você precisa decidir se algum daquele trabalho ainda importa.
2. **Navegador embutido bloqueado.** Se você quiser verificação visual dentro do
   loop, precisa liberar a navegação para `localhost`. Sem isso, tudo que é
   visual depende do Playwright das tasks `12`/`14`.
