# `.claude/fixes` — Plano de Correções ReclameMulher

Fila de trabalho executável para fechar as pendências do projeto antes da defesa
(novembro/2026). Foi desenhada para ser consumida por um agente em loop, mas cada
task também funciona sozinha, executada à mão.

## Como rodar

Loop autopilotado (recomendado):

```bash
/loop Leia .claude/fixes/LOOP.md e execute a próxima task pendente seguindo o protocolo descrito lá.
```

Uma task específica, sem loop:

```bash
Leia .claude/fixes/tasks/07-infra-de-testes.md e execute conforme o protocolo de .claude/fixes/LOOP.md
```

Só a investigação (obrigatória antes de tudo):

```bash
Leia .claude/fixes/tasks/00-investigacao.md e execute.
```

## Estrutura

```
.claude/fixes/
├── README.md          você está aqui — visão geral e como rodar
├── LOOP.md            protocolo do agente: como aplicar, verificar, debugar, reportar
├── INDEX.md           catálogo humano de todas as tasks (fases, dependências, risco)
├── STATE.json         fonte de verdade da execução — o loop lê e escreve aqui
├── tasks/             uma task por arquivo, atômica e autocontida
├── reports/           saída: um relatório por task + RELATORIO-FINAL.md
└── templates/         modelos usados para criar novas tasks e relatórios
```

## Princípios

1. **Investigar antes de consertar.** A documentação da raiz do repo se contradiz
   (`STATUS_FINAL_PRODUCAO.md` diz responsividade em 5%, `TODO.md` diz
   "✅ VALIDADO"). A task `00` existe para produzir um retrato confiável e
   invalidar as tasks que já não fazem sentido.
2. **Uma task = um commit.** Nada de mudança gigante. Se uma task crescer demais,
   ela deve ser quebrada, não expandida.
3. **Verificação declarada na própria task.** Toda task diz como se prova que
   funcionou. Sem prova, a task não fecha.
4. **Bloquear é permitido, mentir não.** Se algo não pode ser resolvido, a task
   vira `blocked` com o motivo escrito, e o loop segue para a próxima.
5. **Escopo trancado.** O agente não conserta o que não está na task. Achados
   fora de escopo viram uma task nova em `tasks/`, com nota no `INDEX.md`.

## Contexto do projeto (medido em 2026-08-26)

| Item | Estado |
|---|---|
| Páginas (`page.tsx`) | 42 |
| Rotas de API (`route.ts`) | 32 |
| Componentes | 95 |
| `tsc --noEmit` | limpo (0 erros) |
| ESLint | 4 erros (todos em worktrees stale), 277 warnings |
| Testes automatizados | **nenhum** |
| Script de typecheck | **não existe** |
| Trabalho não commitado | 18 arquivos, +260/-91 |
| Worktrees stale em `.claude/worktrees` | 5, não ignorados pelo git |
