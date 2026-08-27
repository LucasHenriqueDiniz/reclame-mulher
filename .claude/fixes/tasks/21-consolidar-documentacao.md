# [21] Consolidar a documentação contraditória da raiz

| Campo | Valor |
|---|---|
| **ID** | `21` |
| **Fase** | `8 — Documentação` |
| **Risco** | baixo |
| **Depende de** | `19` |
| **Estimativa** | média |

## Objetivo

Uma fonte de verdade por assunto. Hoje há 20 arquivos `.md` soltos na raiz que
se contradizem, e isso já causou retrabalho — foi o motivo de a task `00`
existir.

## Evidência

Arquivos `.md` na raiz do repositório:

```
AGENTS.md                           GUIA_RAPIDO.md
AUDITORIA_COMPLETA_PROBLEMAS.md     INDICE_DOCUMENTACAO.md
CHANGELOG.md                        LEIA_ME_PRIMEIRO.md
FLUXOS_VISUAIS.md                   MANUAL_PLATAFORMA.md
GITHUB_PUSH_SUMMARY.md              MAPEAMENTO_TELAS_COMPLETO.md
PLANO_IMPLEMENTACAO_SPRINT.md       README.md
README_DOCUMENTACAO.txt             RELATORIO_AUDITORIA_FINAL.md
RELATORIO_CORRECOES_ACESSIBILIDADE.md
RELATORIO_FINAL_SPRINT_COMPLETO.md  RELATORIO_TESTES_E2E_COMPLETO.md
RELATORIO_TESTES_REAIS.md           STATUS_FINAL_PRODUCAO.md
TODO.md                             VALIDACAO_APP_FUNCIONANDO.md
```

Mais 6 em `docs/`. Contradições concretas já identificadas: 70% vs 80% pronto;
responsividade 5% vs validada; "E2E testado" sem existir um único arquivo de
teste.

## Escopo

**Toca:** arquivos `.md` da raiz, `docs/`, `README.md`
**Não toca:** `MANUAL_PLATAFORMA.md` e `MANUAL_PLATAFORMA.html` — são insumo da
dissertação e têm task própria (`22`); `AGENTS.md`; `.claude/fixes/`

## Passos

1. Classifique cada arquivo em: **vivo** (precisa ficar atualizado),
   **histórico** (registro datado, não se atualiza) ou **descartável**
   (duplicata, rascunho, resumo de push).

2. Estrutura de destino:

   ```
   README.md              porta de entrada: o que é, como rodar, links
   TODO.md                único backlog vivo
   CHANGELOG.md           histórico de versões
   docs/
     arquitetura.md       stack, estrutura de pastas, decisões
     autorizacao.md       da task 16
     api-erros.md         da task 17
     acessibilidade.md    consolidando os relatórios de a11y
     testes.md            como rodar cada suíte
     historico/           relatórios datados, congelados
   ```

3. Mova os relatórios de auditoria de julho/2026 para `docs/historico/` **sem
   editar o conteúdo** — são registro do que se sabia na época — e coloque no
   topo de cada um um aviso de uma linha: documento histórico, ver `docs/` para
   o estado atual.

4. Apague com segurança: `GITHUB_PUSH_SUMMARY.md`, `README_DOCUMENTACAO.txt`,
   `LEIA_ME_PRIMEIRO.md` e `INDICE_DOCUMENTACAO.md` só depois de conferir que
   nada deles é único — o que for, migre antes.

5. **Corrija o `TODO.md`.** Hoje ele tem dezenas de itens com checkbox `[ ]`
   cujo corpo diz "Concluído". Reconcilie com o que a fila de correções
   descobriu: marque o que está feito, apague o que virou irrelevante, e deixe
   só o que é backlog de verdade.

## Critérios de aceite

- [ ] A raiz tem no máximo 5 arquivos `.md`.
- [ ] Nenhuma afirmação contraditória sobre estado do projeto sobrevive nos
      documentos vivos.
- [ ] Todo link interno entre documentos continua funcionando.
- [ ] O `TODO.md` reflete a realidade medida, não a de julho.

## Verificação

```bash
ls -1 *.md | wc -l
```

```bash
grep -rn "](\./" *.md docs/*.md | head -40
```

Confira manualmente que os caminhos citados existem.

## Riscos e armadilhas

Apagar documento que contém a única cópia de uma decisão de projeto é perda
real. Na dúvida, mova para `docs/historico/` em vez de apagar.
