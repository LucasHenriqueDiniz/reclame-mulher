# Relatório — [04] Zerar os erros de ESLint em `src/`

- **Data:** 2026-08-26
- **Status:** **skipped** — sem objeto
- **Iterações de debug:** 0

## Motivo do skip

O protocolo manda confirmar que o problema ainda existe antes de editar
qualquer coisa. Não existe:

```
npx eslint src  →  36 problems (0 errors, 36 warnings)
erros em src/: 0
por regra: {}
```

## Por que a task foi criada

A evidência original vinha de `npx eslint .`, que reportava
`281 problems (4 errors, 277 warnings)`. Os 4 erros eram:

```
react/no-unescaped-entities        ×2   ajuda/recursos/page.tsx:135
@next/next/no-html-link-for-pages  ×2   ajuda/recursos/page.tsx:170,176
```

A task já registrava a suspeita de que estavam todos em
`.claude/worktrees/agent-aacf5215958daeba6/`, mas pedia para confirmar se
`src/app/ajuda/recursos/page.tsx` tinha os mesmos problemas — já que a worktree
é uma cópia do projeto.

**Não tinha, porque o arquivo não existe:**

```
ls src/app/ajuda/recursos/page.tsx  →  não existe
```

Essa página só existia dentro da worktree, que era um experimento de agente
nunca integrado ao `master`. A task `01` ignorou `.claude/**` no ESLint e
removeu a worktree sem commits exclusivos, o que zerou os 4 erros.

## Verificação

```bash
npx eslint src
```

→ 0 erros. Nada a fazer.

## Nada foi modificado

Nenhum arquivo de produção foi tocado por esta task.
