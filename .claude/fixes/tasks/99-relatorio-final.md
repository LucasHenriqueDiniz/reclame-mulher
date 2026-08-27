# [99] Relatório final

| Campo | Valor |
|---|---|
| **ID** | `99` |
| **Fase** | `9 — Fechamento` |
| **Risco** | nenhum |
| **Depende de** | todas as demais |
| **Estimativa** | curta |

## Objetivo

Consolidar tudo o que a fila produziu num documento que sirva a três leitores
diferentes: você, o Prof. Marc e a Paloma.

## Quando executar

Só quando não houver mais nenhuma task elegível em `STATE.json` — nem
`pending` com dependências satisfeitas, nem `blocked` que ainda dê para
destravar.

## Passos

1. Leia **todos** os arquivos de `.claude/fixes/reports/`.

2. Escreva `.claude/fixes/reports/RELATORIO-FINAL.md` com esta estrutura:

   ### Resumo executivo
   Três parágrafos, sem jargão: o que o projeto era no início da fila, o que é
   agora, e o que falta. Escrito para ser lido por alguém que não programa.

   ### Antes e depois

   | Métrica | Antes (2026-08-26) | Depois |
   |---|---|---|
   | Erros de TypeScript | 0 | |
   | Erros de ESLint | 4 | |
   | Warnings de ESLint | 277 | |
   | Testes automatizados | 0 | |
   | Cobertura E2E dos fluxos principais | nenhuma | |
   | Violações de acessibilidade (críticas/sérias) | não medido | |
   | Rotas com scroll horizontal em 375px | não medido | |
   | Build de produção | não verificado | |
   | Arquivos não commitados | 18 | |

   ### Tasks executadas
   Tabela: id, título, status, commit, uma linha de resultado.

   ### O que ficou bloqueado
   Para cada uma: por quê, o que já foi tentado, e o que destravaria.

   ### Achados novos
   Problemas descobertos durante a execução que não estavam previstos. Ligue com
   as tasks da faixa `50+` que foram criadas.

   ### Decisões que dependem de você
   Lista objetiva, cada item com a pergunta formulada de forma que dê para
   responder com sim ou não.

   ### Prontidão para a defesa
   Veredito honesto sobre novembro/2026: o que dá para demonstrar com
   segurança, o que é melhor não mostrar, e qual o risco remanescente.

3. Atualize `INDEX.md` com o status final de cada linha.

4. Commite tudo.

5. Encerre o loop: `ScheduleWakeup` com `stop: true`.

## Critérios de aceite

- [ ] `RELATORIO-FINAL.md` existe com todas as seções preenchidas.
- [ ] A tabela antes/depois tem números medidos, nenhum campo em branco e
      nenhuma estimativa apresentada como medição.
- [ ] Toda task bloqueada aparece com motivo e caminho de destravamento.
- [ ] O loop foi encerrado.

## Regra

Este relatório é o antídoto contra o problema que gerou este plano: documentos
otimistas que não correspondiam ao código. **Se algo não foi medido, escreva
"não medido".** Não estime, não arredonde para cima, não repita afirmação de
relatório antigo sem reverificar.
