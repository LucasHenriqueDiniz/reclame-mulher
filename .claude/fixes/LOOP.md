# LOOP.md — Protocolo do Agente

Este arquivo é a instrução completa de uma iteração. Leia-o inteiro antes de agir.
Você executa **uma task por iteração**. Não tente adiantar a fila.

---

## 0. Regras invioláveis

- **Nunca** rode `git push`, `git reset --hard`, `git clean -fdx` ou apague
  worktrees/branches sem que a task peça explicitamente.
- **Nunca** edite `.env` (só `.env.example`).
- **Nunca** marque uma task como `done` sem os comandos de verificação passando.
- **Nunca** amplie o escopo da task. Achado fora de escopo → cria task nova.
- Se `STATE.json` e `INDEX.md` divergirem, **`STATE.json` vence**.
- Trabalhe sempre em `E:/Repositories/reclame-mulher`, na branch `master`,
  salvo instrução diferente na task.

## 1. Escolher a task

1. Leia `.claude/fixes/STATE.json`.
2. Se existir alguma task com `status: "in_progress"`, retome **essa** (uma
   iteração anterior foi interrompida). Não comece outra.
3. Caso contrário, pegue a primeira task com `status: "pending"` cujas
   `depends_on` estejam todas em `done` ou `skipped`.
4. Se não houver nenhuma elegível e existirem tasks `blocked`, tente
   **desbloquear uma** (releia o motivo, tente outra abordagem). Se não der,
   vá para o passo 7 (encerramento).
5. Se todas estiverem `done`/`skipped`/`blocked` e nenhuma for desbloqueável,
   vá para o passo 7.

Marque a task escolhida como `in_progress` em `STATE.json` **antes** de mexer em
qualquer arquivo, com `started_at` preenchido.

## 2. Aplicar

1. Leia `.claude/fixes/tasks/<id>-<slug>.md` inteiro.
2. Confira a seção **Pré-condições**. Se alguma falhar, marque `blocked` com o
   motivo e volte ao passo 1.
3. Antes de editar, confirme que o problema descrito **ainda existe**. Muita
   coisa neste repo está documentada como pendente mas já foi feita. Se já
   estiver resolvido → `status: "skipped"`, `skip_reason` preenchido, relatório
   curto, e segue.
4. Execute os **Passos** da task. Faça o mínimo necessário para atender aos
   **Critérios de aceite**.

## 3. Verificar

Rode, nesta ordem, os comandos da seção **Verificação** da task, e depois a
verificação global:

```bash
npx tsc --noEmit
```

```bash
npx eslint src --max-warnings 9999
```

A partir da task `18`, a verificação global também inclui:

```bash
npm run build
```

Regra: o número de erros de lint **nunca pode subir** em relação ao registrado em
`STATE.json > baseline`. Warnings podem subir apenas se a task disser que é
esperado.

> **Não rode `npm run build` com o dev server de pé.** Os dois escrevem em
> `.next`, e o build sobrescreve o que o dev está usando — a aplicação passa a
> devolver 500 com `ENOENT ... _buildManifest.js.tmp`, que parece regressão do
> seu código e não é. Pare o preview antes, ou rode o build e só então suba o
> servidor. Se já aconteceu: `rm -rf .next` e suba de novo.

Se a task envolve UI, verifique no navegador com as ferramentas de preview
(`preview_start` com a config `dev-server` de `.claude/launch.json`, depois
`read_page` / `read_console_messages`). Não peça para o usuário conferir.

## 4. Debugar

Se a verificação falhar:

1. Leia o erro de verdade — não chute. Use `read_console_messages` e
   `preview_logs` para erros de runtime.
2. Corrija e verifique de novo.
3. Máximo de **3 ciclos** de correção. Se ainda falhar:
   - Reverta o que você mudou (`git checkout -- <arquivos>` **apenas** dos
     arquivos que você tocou nesta task; nunca um reset global).
   - Marque a task como `blocked`, com `blocked_reason` descrevendo o erro
     exato e o que você já tentou.
   - Escreva o relatório mesmo assim e siga.

## 5. Registrar

1. Escreva `.claude/fixes/reports/<id>-<slug>.md` usando
   `.claude/fixes/templates/report-template.md`.
2. Atualize `STATE.json`: `status`, `finished_at`, `commit`, `files_changed`,
   `notes`.
3. Atualize o checkbox e o status da linha correspondente em `INDEX.md`.

## 6. Commitar

Um commit por task, só com os arquivos daquela task mais os arquivos de estado:

```bash
git add <arquivos da task> .claude/fixes/STATE.json .claude/fixes/INDEX.md .claude/fixes/reports
```

Mensagem, em português, seguindo o padrão do repo:

```
fix(<area>): <o que mudou>

Task .claude/fixes/tasks/<id>-<slug>.md
Verificação: <comandos que passaram>

Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
```

Use `fix:`, `test:`, `chore:`, `docs:`, `refactor:` conforme o caso.
**Não faça push.**

## 7. Encerramento

Quando não sobrar task elegível:

1. Execute `.claude/fixes/tasks/99-relatorio-final.md`.
2. Commite o relatório final.
3. Encerre o loop chamando `ScheduleWakeup` com `stop: true`.
4. Na resposta final ao usuário, entregue um resumo curto: quantas tasks
   fecharam, quantas ficaram bloqueadas e por quê, e o que exige decisão humana.

## 8. Pacing (modo dinâmico do /loop)

- Se você acabou uma task e há mais na fila, agende a próxima iteração com
  `delaySeconds: 60` e `noop: false`.
- Se você ficou esperando algo externo (build longo, servidor subindo), use
  `delaySeconds` proporcional ao que está esperando.
- Se nada mudou nesta iteração, `noop: true`.

## 9. Formato do relatório de iteração (resposta ao usuário)

Curto. Sempre nesta forma:

```
[<id>] <título> → <done|skipped|blocked>
O que foi feito: <1-2 linhas>
Verificação: <comandos e resultado>
Commit: <hash curto ou "nenhum">
Próxima: <id da próxima task ou "fila vazia">
```
