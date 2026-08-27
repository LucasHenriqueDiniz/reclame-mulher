# Documentos históricos

Registro do que se sabia sobre o projeto em cada momento. **Nada aqui é
atualizado.** Vários destes documentos afirmam coisas que a fila de correções
depois mediu e desmentiu — eles ficam porque saber o que se acreditava, e
quando, é útil; não porque estejam certos.

Para o estado atual, veja o [`README.md`](../../README.md) e os documentos vivos
em [`docs/`](..).

## Março de 2026

| Arquivo | O que é |
|---|---|
| [`project-status.md`](project-status.md) | primeiro retrato técnico honesto do projeto. Deu origem a [`docs/arquitetura.md`](../arquitetura.md) |
| [`mvp-backlog.md`](mvp-backlog.md) | backlog técnico priorizado. Reconciliado no [`TODO.md`](../../TODO.md) |

## Julho de 2026 — a sprint de documentação

Onze documentos escritos no mesmo dia, 07/07/2026. É a origem das contradições
que a task `21` desfez: três números diferentes de "% pronto", testes E2E
descritos em detalhe sem que existisse um único arquivo de teste no repositório,
e acessibilidade declarada conforme enquanto a varredura automatizada de agosto
encontrou 523 ocorrências.

**Leia estes documentos como intenção, não como medição.**

| Arquivo | O que é |
|---|---|
| [`AUDITORIA_COMPLETA_PROBLEMAS.md`](AUDITORIA_COMPLETA_PROBLEMAS.md) | 8 problemas encontrados navegando na aplicação |
| [`RELATORIO_AUDITORIA_FINAL.md`](RELATORIO_AUDITORIA_FINAL.md) | consolidação da auditoria |
| [`STATUS_FINAL_PRODUCAO.md`](STATUS_FINAL_PRODUCAO.md) | o "80% pronto para produção" |
| [`VALIDACAO_APP_FUNCIONANDO.md`](VALIDACAO_APP_FUNCIONANDO.md) | conferência manual de que a aplicação subia |
| [`RELATORIO_TESTES_REAIS.md`](RELATORIO_TESTES_REAIS.md) | logins do seed conferidos à mão |
| [`RELATORIO_TESTES_E2E_COMPLETO.md`](RELATORIO_TESTES_E2E_COMPLETO.md) | fluxos E2E descritos — feitos à mão, não automatizados |
| [`RELATORIO_CORRECOES_ACESSIBILIDADE.md`](RELATORIO_CORRECOES_ACESSIBILIDADE.md) | 14 correções de acessibilidade, sem varredura automatizada |
| [`RELATORIO_FINAL_SPRINT_COMPLETO.md`](RELATORIO_FINAL_SPRINT_COMPLETO.md) | fechamento da sprint |
| [`PLANO_IMPLEMENTACAO_SPRINT.md`](PLANO_IMPLEMENTACAO_SPRINT.md) | o plano que a sprint seguiu |
| [`MAPEAMENTO_TELAS_COMPLETO.md`](MAPEAMENTO_TELAS_COMPLETO.md) | mapa de telas. Contagem de então: 43 |
| [`DOCUMENTACAO_FASE3.md`](DOCUMENTACAO_FASE3.md) | fechamento da fase 3 |
| [`FINAL_TEST_SUMMARY.md`](FINAL_TEST_SUMMARY.md) | "20/20 testes passando" |
| [`e2e-test-report.md`](e2e-test-report.md) | relatório E2E detalhado |
| [`test-validation-results.txt`](test-validation-results.txt) | saída bruta de conferência manual |

## Insumos do manual

Escritos em julho para o **Manual de Uso da Plataforma**, e é isso que são:
material de origem. A task `22` os revisa contra o que a aplicação faz hoje.

| Arquivo | O que é |
|---|---|
| [`GUIA_RAPIDO.md`](GUIA_RAPIDO.md) | referência rápida por perfil |
| [`FLUXOS_VISUAIS.md`](FLUXOS_VISUAIS.md) | diagramas de fluxo em ASCII |
| [`LEIA_ME_PRIMEIRO.md`](LEIA_ME_PRIMEIRO.md) | carta de apresentação do pacote, com um glossário de termos |

> Três arquivos do mesmo pacote foram apagados na task `21` por não conterem
> nada único: `INDICE_DOCUMENTACAO.md` e `README_DOCUMENTACAO.txt` (índices da
> própria estrutura que a task desfez) e `GITHUB_PUSH_SUMMARY.md` (resumo de um
> push, que o git já registra). Estão no histórico do git.
