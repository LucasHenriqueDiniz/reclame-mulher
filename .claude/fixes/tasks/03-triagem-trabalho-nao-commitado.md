# [03] Triagem do trabalho não commitado

| Campo | Valor |
|---|---|
| **ID** | `03` |
| **Fase** | `1 — Base` |
| **Risco** | alto (pode descartar trabalho) |
| **Depende de** | `02` |
| **Estimativa** | média |

## Objetivo

O working tree fica limpo: tudo que presta está commitado com mensagem
descritiva, e o que era experimento foi descartado conscientemente.

## Evidência

18 arquivos modificados, +260/-91, sem commit. Entre eles mudanças
significativas em:

| Arquivo | Delta |
|---|---|
| `company-complaint-detail-content.tsx` | +93/-… |
| `company-profile-content.tsx` | 55 linhas |
| `PartnersSection.tsx` | 48 linhas |
| `src/server/repos/complaints.ts` | 34 linhas |
| `ImpactStats.tsx` | 18 linhas |

Enquanto isso não for resolvido, **toda task seguinte mistura mudança nova com
mudança órfã**, e nenhum commit fica atômico. Por isso esta task vem antes de
qualquer correção de código.

## Pré-condições

- [ ] `npm run typecheck` passa com as mudanças atuais aplicadas.

## Escopo

**Toca:** os 18 arquivos já modificados
**Não toca:** arquivos que não estão no `git status` atual

## Passos

1. Rode `git diff` arquivo por arquivo. Para cada um, classifique:
   - **manter** — mudança coerente e funcional;
   - **descartar** — debug, comentário solto, código morto;
   - **incerto** — precisa de decisão do usuário.
2. Agrupe os "manter" por assunto e faça **commits temáticos** (ex.: um para
   landing page, um para detalhe de reclamação da empresa, um para o repo de
   complaints). Não faça um commit único de 18 arquivos.
3. Para os "descartar", use `git checkout -- <arquivo>` **individualmente**.
   Nunca `git checkout -- .`.
4. Para os "incerto", **não commite e não descarte**: liste no relatório com o
   diff resumido e pare aí.

## Critérios de aceite

- [ ] `git status --porcelain` limpo, exceto arquivos explicitamente marcados
      como "incerto" no relatório.
- [ ] Cada commit criado tem mensagem que descreve o que mudou.
- [ ] `npm run check` passa depois dos commits.

## Verificação

```bash
git status --porcelain=v1
```

```bash
npm run check
```

## Riscos e armadilhas

Este é o único ponto do plano onde trabalho pode ser perdido de forma
irreversível. Na dúvida, **commite** — reverter um commit é fácil, recuperar
`git checkout --` não é.

## Se ficar bloqueado

Se mais de 3 arquivos ficarem "incerto", marque a task como `blocked` e peça ao
usuário para revisar. As tasks seguintes ainda podem rodar, mas o relatório
final deve registrar que o working tree não ficou limpo.
