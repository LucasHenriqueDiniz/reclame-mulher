# INDEX — Catálogo de Tasks

Visão humana da fila. A fonte de verdade da execução é [`STATE.json`](STATE.json);
se os dois divergirem, o JSON vence. Protocolo de execução em [`LOOP.md`](LOOP.md).

**Legenda de status:** ⬜ pendente · 🔵 em execução · ✅ feita · ⏭️ pulada (não se
aplicava) · 🔴 bloqueada

---

## Fase 0 — Investigação

Existe porque a documentação do repo se contradiz e **nenhum documento existente
pode ser usado como fonte de verdade**. Nada de código muda aqui.

| | ID | Task | Risco | Depende de |
|---|---|---|---|---|
| ✅ | `00` | [Investigação — retrato real do projeto](tasks/00-investigacao.md) | baixo | — |

---

## Fase 1 — Base

Deixar o terreno limpo antes de mexer em código. Sem isso, nenhum commit
posterior fica atômico.

| | ID | Task | Risco | Depende de |
|---|---|---|---|---|
| ✅ | `01` | [Higiene do repositório — worktrees stale e arquivos não ignorados](tasks/01-higiene-repositorio.md) | médio | `00` |
| ✅ | `02` | [Criar scripts de verificação (typecheck, lint:fix, check)](tasks/02-scripts-de-verificacao.md) | baixo | `01` |
| ✅ | `03` | [Triagem do trabalho não commitado](tasks/03-triagem-trabalho-nao-commitado.md) | **alto** | `02` |

---

## Fase 2 — Qualidade de código

**Fase concluída.** O número inicial (281 problemas) estava inflado porque o
ESLint varria as worktrees. Depois de corrigir o escopo e limpar o que restava:
**`npx eslint .` reporta 0 problemas no repositório inteiro.**

| Momento | Erros | Warnings |
|---|---|---|
| Início | 4 | 277 |
| Após `01` | 0 | 45 |
| Após `05` | 0 | 7 |
| Após `06` | **0** | **0** |

| | ID | Task | Risco | Depende de |
|---|---|---|---|---|
| ⏭️ | `04` | [Zerar os erros de ESLint em `src/`](tasks/04-lint-erros.md) — *sem objeto: os 4 erros eram de um arquivo que só existia na worktree removida* | baixo | `03` |
| ✅ | `05` | [Remover código morto — 38 warnings de `no-unused-vars`](tasks/05-lint-unused-vars.md) | baixo | `04` |
| ✅ | `06` | [Migrar `<img>` para `next/image` (7 ocorrências)](tasks/06-next-image.md) | médio | `05` |

---

## Fase 3 — Testes

~~**A maior lacuna real do projeto.** Zero testes automatizados.~~
**Infraestrutura montada pela task `07`:** Vitest (18 testes) e Playwright
(desktop + mobile 375×812), com `npm run check` rodando typecheck + lint + test.

| | ID | Task | Risco | Depende de |
|---|---|---|---|---|
| ✅ | `07` | [Montar infraestrutura de testes automatizados](tasks/07-infra-de-testes.md) | médio | `03` |
| ✅ | `08` | [E2E — autenticação nos três perfis](tasks/08-e2e-autenticacao.md) | baixo | `07` |
| ✅ | `09` | [E2E — criação de reclamação (wizard de 4 etapas)](tasks/09-e2e-nova-reclamacao.md) | baixo | `08` |
| ✅ | `10` | [E2E — resposta da empresa e transições de status](tasks/10-e2e-resposta-empresa.md) | baixo | `09` |
| ✅ | `11` | [Testes de autorização das 32 rotas de API](tasks/11-testes-api-autorizacao.md) | baixo | `10` |

---

## Fase 4 — Acessibilidade

Tema central desta plataforma. Auditoria original cobriu 6 páginas de 42, e os
documentos discordam entre 87,5% e "validada".

| | ID | Task | Risco | Depende de |
|---|---|---|---|---|
| ⬜ | `12` | [Varredura automatizada (axe) nas 42 páginas](tasks/12-varredura-acessibilidade.md) | baixo | `07` |
| ⬜ | `13` | [Corrigir as violações encontradas](tasks/13-corrigir-acessibilidade.md) | médio | `12` |

---

## Fase 5 — Responsividade

Contradição direta entre documentos: 5% versus validada. Público majoritariamente
mobile.

| | ID | Task | Risco | Depende de |
|---|---|---|---|---|
| ⬜ | `14` | [Páginas públicas em 375px](tasks/14-responsividade-publicas.md) | médio | `12` |
| ⬜ | `15` | [Áreas autenticadas em 375px](tasks/15-responsividade-autenticadas.md) | médio | `14` |

---

## Fase 6 — Segurança e dados

Auth própria **sem RLS**: toda proteção é código de aplicação, sem rede de
segurança no banco. Plataforma que armazena denúncias identificadas.

| | ID | Task | Risco | Depende de |
|---|---|---|---|---|
| ⬜ | `16` | [Documentar e endurecer o modelo de autorização](tasks/16-modelo-autorizacao.md) | **alto** | `11` |
| ⬜ | `17` | [Padronizar validação de entrada e retorno de erro](tasks/17-validacao-e-erros.md) | médio | `16` |

---

## Fase 7 — Build e produção

| | ID | Task | Risco | Depende de |
|---|---|---|---|---|
| ⬜ | `18` | [Build de produção limpo e reprodutível](tasks/18-build-producao.md) | médio | `17` |
| ⬜ | `19` | [Core Web Vitals das rotas principais](tasks/19-performance.md) | baixo | `18` |
| ⬜ | `20` | [Ambiente, variáveis e prontidão para deploy](tasks/20-ambiente-e-deploy.md) | médio | `18` |

---

## Fase 8 — Documentação e dissertação

| | ID | Task | Risco | Depende de |
|---|---|---|---|---|
| ⬜ | `21` | [Consolidar a documentação contraditória da raiz](tasks/21-consolidar-documentacao.md) | baixo | `19` |
| ⬜ | `22` | [**Manual de Uso** — produto da dissertação](tasks/22-manual-de-uso.md) | baixo | `15`, `21` |
| ⬜ | `23` | [Checklist de prontidão para a demonstração da defesa](tasks/23-checklist-defesa.md) | baixo | `22` |

---

## Fase 9 — Fechamento

| | ID | Task | Risco | Depende de |
|---|---|---|---|---|
| ⬜ | `99` | [Relatório final](tasks/99-relatorio-final.md) | nenhum | todas |

---

## Tasks criadas durante a execução

A faixa `50`–`98` é reservada para problemas descobertos em execução. Quem
criar deve registrar aqui e em `STATE.json`.

| | ID | Task | Risco | Criada por | Motivo |
|---|---|---|---|---|---|
| ✅ | `50` | [Middleware não protege `/app/*`](tasks/50-middleware-nao-protege.md) | **alto** | `00` | ~~200 sem sessão~~ **resolvido:** o arquivo estava na raiz, mas com `src/` o Next só lê `src/middleware.ts` — era código morto |
| ✅ | `51` | [Rate limiter em memória com bucket compartilhado](tasks/51-rate-limit-em-memoria.md) | médio | `00` | `getClientIp` colapsa em `"unknown"`; conta login bem-sucedido |
| ⬜ | `52` | [Etapas do wizard fora de tela continuam focáveis](tasks/52-etapas-fora-de-tela-focaveis.md) | médio | `09` | achado na `09`: 11 controles das etapas 2–4 focáveis estando na etapa 1, sem `aria-hidden` nem `inert` |
| ⬜ | `53` | [Selects do wizard sem rótulo associado](tasks/53-selects-sem-rotulo-associado.md) | baixo | `09` | achado na `09`: `<label for>` aponta para id que o Radix nunca aplica — 3 combobox sem nome acessível |
| ⬜ | `54` | [Rótulos de status divergentes](tasks/54-rotulos-de-status-divergentes.md) | baixo | `10` | achado na `10`: quatro mapas de rótulo que discordam — "Em réplica" na lista vs "Respondida" no detalhe, "Concluído" para a usuária vs "Resolvida" para a empresa |
| ⬜ | `55` | [Resolvida não reabre](tasks/55-resolvido-nao-reabre.md) | **alto** | `10` | achado na `10`: depois de `RESOLVED` a resposta da autora é gravada mas o status não muda — ela não consegue contestar o encerramento |
| ⬜ | `56` | [Conta de empresa do seed é MEMBER](tasks/56-conta-empresa-do-seed-e-member.md) | médio | `11` | achado na `11`: a conta da demonstração recebe 403 ao editar perfil, criar projeto ou convidar usuária — conserto de seed |

**Ordem revisada pela task `00`:** `01` → `02` → `03` → **`50`** → `07` → …
A `50` sobe na fila por ser defeito confirmado, e cabe antes dos testes para que
a task `08` já asserte o comportamento correto.

**Resultado da investigação:** [`reports/00-investigacao.md`](reports/00-investigacao.md).
Build de produção passa por mérito, `eslint src` já está em 0 erros, e a camada
de autorização das APIs é sólida. Responsividade e acessibilidade **não foram
medidas** — o navegador embutido recusou `localhost`, então o veredito fica com
as tasks `12` e `14`, que montam Playwright.

---

## Caminho crítico até a defesa

Se o tempo apertar, esta é a ordem que protege a demonstração de novembro:

```
00 → 03 → 07 → 08 → 09 → 10 → 11 → 16 → 14 → 15 → 18 → 22 → 23
```

O que fica de fora nesse corte — `04`, `05`, `06`, `19`, `20`, `21` — é higiene
e polimento: importa para o projeto, não para a banca.
