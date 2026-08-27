# [00] Investigação — retrato real do projeto

| Campo | Valor |
|---|---|
| **ID** | `00` |
| **Fase** | `0 — Investigação` |
| **Risco** | baixo (não altera código de produção) |
| **Depende de** | — |
| **Estimativa** | longa |

## Objetivo

Produzir um retrato confiável e datado do estado real do projeto, e usar esse
retrato para **validar, corrigir ou invalidar** as tasks `01`–`23` antes que
qualquer uma delas seja executada.

## Por que esta task existe

A documentação da raiz do repositório se contradiz. Exemplos reais:

- `STATUS_FINAL_PRODUCAO.md` marca **Responsividade: 5%** e "não validada".
- `TODO.md`, seção "UX Padrões", marca `UX mobile: revisar telas críticas em
  viewport pequeno — Status: ✅ VALIDADO EM FASE 3`.
- `TODO.md` tem dezenas de itens com checkbox `[ ]` (pendente) cujo corpo diz
  "Status: Concluído".
- `RELATORIO_AUDITORIA_FINAL.md` diz 70% pronto; `STATUS_FINAL_PRODUCAO.md` diz
  80%. Ambos são de julho/2026 e há trabalho não commitado depois disso.
- Vários relatórios afirmam "E2E testado", mas **não existe nenhum arquivo de
  teste automatizado no repositório**.

Conclusão: nenhum documento existente pode ser usado como fonte de verdade.
Só o código e a execução valem.

## Regra de ouro desta task

> Não conserte nada. Só meça, registre e ajuste a fila.
> A única exceção permitida é criar/editar arquivos dentro de `.claude/fixes/`.

## Passos

### 1. Estado do repositório

```bash
git status --porcelain=v1
```

```bash
git log --oneline -20
```

```bash
git worktree list
```

Registre: quantos arquivos modificados não commitados, o que os últimos commits
fizeram, e quais worktrees existem em `.claude/worktrees/` (havia 5 em
2026-08-26, todas com commits próprios não integrados ao `master`).

Para cada worktree, verifique se contém trabalho que não está no `master`:

```bash
git log master..<branch-da-worktree> --oneline
```

### 2. Saúde da build

```bash
npx tsc --noEmit
```

```bash
npx eslint . -f json > "$TMP/eslint.json"; npx eslint src 2>&1 | tail -5
```

```bash
npm run build
```

Registre o número exato de erros e warnings, e se o build de produção passa.
Se o build falhar, **isso vira a task de maior prioridade** — anote e ajuste a
ordem em `STATE.json`.

### 3. Superfície da aplicação

Levante e registre em tabela:

- páginas: `find src/app -name page.tsx`
- rotas de API: `find src/app/api -name route.ts`
- para cada rota de API: método(s), se exige autenticação, e qual role.

Este inventário alimenta as tasks `11` (testes de autorização) e `16`
(modelo de autorização).

### 4. A aplicação sobe e funciona?

Suba o dev server pela config `dev-server` de `.claude/launch.json` (ferramentas
de preview, **não** `npm run dev` via Bash).

Percorra e registre para cada uma:

| Fluxo | Como testar |
|---|---|
| Home pública | carrega sem erro de console |
| Login pessoa | `maria@exemplo.com` (senha no `scripts/seed.ts`) |
| Login empresa | `empresa@construtorax.com` |
| Login admin | `admin@comunicamulher.com.br` |
| Criar reclamação | wizard de 4 etapas, até a tela de sucesso |
| Empresa responde | inbox → detalhe → resposta → mudança de status |
| Blog público | listagem e detalhe |

Para cada uma: ✅ funciona / ⚠️ funciona com problema / ❌ quebrado — com a
evidência (mensagem de console, screenshot, status HTTP).

Se o banco não estiver populado, rode `npm run db:seed` antes.

### 5. Responsividade — resolver a contradição

Com `resize_window` em 375×812, abra no mínimo: home, login, `/app/complaints`,
`/app/complaints/new`, `/app/company/inbox`, `/company/[slug]`.

Registre objetivamente: há overflow horizontal? menu funciona? formulários são
usáveis? Isto decide se as tasks `14` e `15` são reais ou devem ser `skipped`.

### 6. Acessibilidade — medir, não confiar

Rode uma varredura axe-core real (a task `12` monta a ferramenta; aqui basta uma
amostra manual via `javascript_tool` injetando axe pelo CDN **não** é possível —
o CSP/rede pode bloquear). Alternativa nesta fase: inspeção via `read_page` de 5
páginas, checando `<h1>` único, labels associados, `alt` em imagens e links de
ícone sem texto acessível.

### 7. Ajustar a fila

Para **cada** task de `01` a `23`:

- Se a evidência não se reproduz → `status: "skipped"` + `skip_reason`.
- Se o problema é maior do que a task descreve → edite o arquivo da task.
- Se você encontrou um problema que não tem task → **crie** o arquivo em
  `tasks/` usando `templates/task-template.md`, com id na faixa `50`+, e
  registre em `STATE.json` e `INDEX.md`.
- Se a ordem/dependências estão erradas → corrija `depends_on` e `order`.

Preencha também `STATE.json > baseline` com os números medidos (erros de lint,
warnings, resultado do build), porque o protocolo do loop usa esse baseline como
trava de regressão.

## Critérios de aceite

- [ ] `reports/00-investigacao.md` existe e contém: estado do git, saúde da
      build com números exatos, inventário de páginas e rotas de API, tabela de
      fluxos testados com evidência, veredito sobre responsividade e sobre
      acessibilidade.
- [ ] `STATE.json > baseline` preenchido com números medidos, não estimados.
- [ ] Toda task de `01` a `23` foi revisada: mantida, editada ou marcada como
      `skipped` com motivo.
- [ ] Nenhum arquivo fora de `.claude/fixes/` foi modificado.

## Verificação

```bash
git status --porcelain=v1 -- ":!.claude/fixes"
```

Deve mostrar apenas as 18 modificações pré-existentes (as mesmas de antes da
task), nenhuma nova.

## Se ficar bloqueado

Se o banco de dados não conectar (`.env` com `DATABASE_URL` do Neon), registre e
marque como bloqueio **humano**: sem banco, as tasks `08`–`11` não podem rodar.
Não invente credenciais.
