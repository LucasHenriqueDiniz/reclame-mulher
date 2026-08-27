# [01] Higiene do repositório — worktrees stale e arquivos não ignorados

| Campo | Valor |
|---|---|
| **ID** | `01` | 
| **Fase** | `1 — Base` |
| **Risco** | médio (envolve remoção de worktrees) |
| **Depende de** | `00` |
| **Estimativa** | curta |

## Objetivo

O `git status` volta limpo de ruído: sem worktrees de agente aparecendo como
untracked, sem logs de dev server versionados, e o ESLint deixa de varrer código
que não é do projeto.

## Evidência

```
? .claude/worktrees/agent-a849f96e18754338a
?? dev-server-err.log
?? dev-server.log
```

`git worktree list` mostra 5 worktrees em `.claude/worktrees/`, cada uma com
commits próprios não integrados ao `master`. O ESLint varre essas pastas: os
**4 únicos erros** de lint do projeto vêm de
`.claude/worktrees/agent-aacf5215958daeba6/src/app/ajuda/recursos/page.tsx`.
Ou seja: `src/` está com 0 erros e o número real está mascarado.

## Pré-condições

- [ ] A task `00` verificou, para cada worktree, se há commits que não estão no
      `master` (`git log master..<branch> --oneline`).

## Escopo

**Toca:** `.gitignore`, `eslint.config.mjs`, worktrees em `.claude/worktrees/`
**Não toca:** qualquer arquivo em `src/`

## Passos

1. Adicione ao `.gitignore`:
   ```
   # agentes / worktrees temporárias
   .claude/worktrees/

   # logs de dev server
   dev-server*.log
   ```
2. Adicione `.claude/**` ao `ignores` do `eslint.config.mjs` (o flat config do
   ESLint 9 usa `{ ignores: [...] }` como primeiro item do array).
3. Para cada worktree, **antes de remover**:
   - se `git log master..<branch>` estiver vazio → remova com
     `git worktree remove <path>`;
   - se tiver commits → **não remova**. Registre no relatório o branch, os
     commits e o que eles mudam, e deixe a decisão para o usuário.
4. `git worktree prune`.
5. Apague `dev-server.log` e `dev-server-err.log` do working tree.

## Critérios de aceite

- [ ] `git status --porcelain` não lista mais `.claude/worktrees/` nem os logs.
- [ ] `npx eslint .` reporta **0 erros** (os 4 vinham só das worktrees).
- [ ] Nenhuma worktree com commits exclusivos foi removida.

## Verificação

```bash
git status --porcelain=v1
```

```bash
npx eslint . 2>&1 | tail -3
```

## Riscos e armadilhas

Remover worktree com trabalho dentro é perda irreversível de commits que só
existem ali. Na dúvida, **não remova** — apenas ignore no git e no ESLint.
