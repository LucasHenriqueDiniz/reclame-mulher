# Relatório — [07] Infraestrutura de testes automatizados

- **Data:** 2026-08-26
- **Status:** done
- **Iterações de debug:** 2

## O que existia antes

```bash
find . -name "*.spec.ts" -o -name "*.test.ts"   →  vazio
```

Nenhum teste automatizado, confirmado de novo antes de começar. O projeto tinha
42 páginas, 32 rotas de API e 95 componentes sem uma única asserção executável.

## O que existe agora

| Comando | O que roda |
|---|---|
| `npm run test` | Vitest — **18 testes**, 1 arquivo |
| `npm run test:watch` | Vitest em modo watch |
| `npm run test:e2e` | Playwright — **6 testes**, desktop e mobile |
| `npm run test:e2e:ui` | Playwright com interface |
| `npm run check` | typecheck → lint → test |

## Duas descobertas que mudaram o caminho

### 1. O projeto é pnpm, não npm

O `npm i -D vitest ...` falhou com:

```
EACCES: permission denied, lstat 'node_modules\.autoprefixer-AExcgEb0'
```

Parecia problema de permissão do Windows. Não era. Olhando de perto, aquelas
entradas em `node_modules/` são **symlinks**, e existe `node_modules/.pnpm/` —
a marca registrada do pnpm. O `npm` estava tentando manipular a árvore de
symlinks do pnpm e falhando.

O repositório tem **os dois lockfiles**:

| Arquivo | Data |
|---|---|
| `package-lock.json` | 5 de abril |
| `pnpm-lock.yaml` | 1 de julho |
| `pnpm-workspace.yaml` | 12 de março |

E o `package.json` **não declara `packageManager`**. Ou seja: nada no
repositório diz qual é o gerenciador certo, o `package-lock.json` está três
meses desatualizado, e qualquer pessoa que rode `npm install` vai reproduzir a
mesma falha que eu.

Instalei com `pnpm add -D` e funcionou. **A limpeza dos lockfiles está
registrada na task `20`** — não fiz aqui porque apagar lockfile é decisão de
projeto, não efeito colateral de uma task de testes.

### 2. `vite-tsconfig-paths` já não é necessário

Instalei o plugin conforme a task previa, e o próprio Vitest avisou que o Vite
resolve `tsconfig.paths` nativamente via `resolve.tsconfigPaths: true`.

Removi a dependência e usei a opção nativa. Seria incoerente adicionar
dependência morta logo depois de duas tasks removendo código morto.

Também renomeei `vitest.config.ts` → **`vitest.config.mts`**: o `package.json`
não declara `type: module`, então o `.ts` era carregado como CommonJS e o Vite
reclamava da sintaxe ESM.

## Os testes-canário

### Unidade — `src/lib/__tests__/masks.test.ts` (18 testes)

Não é `expect(true).toBe(true)`. Cobre as funções puras que aparecem direto nos
formulários brasileiros de cadastro: `maskCPF`, `maskCNPJ`, `maskPhone`,
`onlyDigits`, `slugify`, `formatCNPJ`, `formatCEP`.

Escrevi as expectativas a partir do **formato correto** (`123.456.789-01`,
`12.345.678/0001-99`, `(51) 99912-1296`), não a partir do que o código produz —
se houvesse divergência, o teste acusaria. Não houve: as 18 passaram de
primeira. Inclui os casos de digitação parcial, que é o momento em que a
máscara costuma quebrar.

`slugify` entrou porque gera o **slug público das empresas** — é o que aparece
na URL `/company/construtora-x`.

### E2E — `e2e/smoke.spec.ts` (3 testes × 2 viewports)

Carrega a home, confere que existe `h1`, que a resposta é 200 e que o console
não tem erro inesperado.

## O caso do console: por que o teste não é frouxo

O terceiro teste falhou na primeira execução:

```
"Failed to load resource: the server responded with a status of 401 (Unauthorized)"
```

Investiguei em vez de relaxar a asserção. `src/hooks/use-auth-state.tsx` chama
`GET /api/me` no carregamento para descobrir se existe sessão — e como o cookie
é `httpOnly`, o cliente não tem outro jeito de perguntar. Para visitante
anônimo a rota devolve 401, o que é correto, e o navegador registra o fetch
falho como erro de console.

Não é erro de aplicação. Mas **é ruído permanente no console de toda visita
anônima**, e ruído esconde erro de verdade — justamente o que as tasks `12` e
`19` vão precisar enxergar.

O teste passou a ignorar **só** esse padrão específico, com o motivo escrito no
código, e continua falhando para qualquer outro erro. A questão de fundo — se
"quem sou eu" deveria responder 200 com `{ user: null }` em vez de 401 — está
anotada na task `17`, junto do contrato de erro da API.

## Configuração escolhida

**Playwright** roda com `workers: 1` e `fullyParallel: false`. Não é descuido:
os testes compartilham o mesmo banco de seed, e paralelizar produziria falha
intermitente — uma spec apagando o que a outra acabou de criar. Está comentado
no arquivo.

Dois projetos: `chromium-desktop` (1280×800) e `chromium-mobile` (375×812, com
`hasTouch`). O viewport mobile é exatamente o alvo das tasks `14` e `15`.

`webServer` com `timeout: 120s` — a primeira compilação do Turbopack no Windows
é lenta e o padrão de 60s não bastava.

## Verificação

| Comando | Resultado |
|---|---|
| `npm run test` | ✅ 18/18 |
| `npx playwright test` | ✅ **6/6** — 3 desktop + 3 mobile, em 32,7s |
| `npm run check` | ✅ exit 0 (typecheck + lint + test) |
| `git status` | ✅ nenhum artefato de teste vazando |

## Critérios de aceite

- [x] `npm run test` executa e passa.
- [x] `npm run test:e2e` sobe o dev server, roda o smoke e passa.
- [x] `npm run check` inclui os testes.
- [x] Artefatos no `.gitignore` (`/test-results`, `/playwright-report`,
      `/blob-report`, `/.playwright`, `/coverage`).

## O que isto destrava

Três critérios que ficaram pendentes em tasks anteriores agora têm ferramenta:

| Task | Pendência |
|---|---|
| `50` | regressão das 17 rotas `/app/*` e das 17 públicas |
| `51` | os 6 cenários do limitador (use `__resetRateLimitStore()` para isolar) |
| `06` | prova visual das imagens migradas — o Playwright enxerga o DOM hidratado, coisa que o `curl` não fazia |

## Nota sobre o banco

Os E2E das tasks `08`–`11` dependem de `npm run db:seed`. O smoke atual não
depende, de propósito: se ele falhar, o problema é de infraestrutura, sem
ambiguidade com estado de banco.
