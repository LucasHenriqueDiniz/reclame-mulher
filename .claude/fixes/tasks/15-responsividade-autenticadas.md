# [15] Responsividade — áreas autenticadas em 375px

| Campo | Valor |
|---|---|
| **ID** | `15` |
| **Fase** | `5 — Responsividade` |
| **Risco** | médio |
| **Depende de** | `14` |
| **Estimativa** | longa |

## Objetivo

Os fluxos que a usuária realmente usa — criar reclamação, acompanhar, responder
— funcionam no celular.

## Evidência

`AUDITORIA_COMPLETA_PROBLEMAS.md`, item 1: "Páginas Autenticadas Não Testadas".
As auditorias de julho testaram sobretudo as 12–15 páginas públicas. As rotas
sob `/app/` (dashboards, wizard, inbox, configurações) ficaram de fora, e são
justamente as mais densas — tabelas, filtros, threads de mensagem, upload.

## Escopo

**Toca:** `/app`, `/app/complaints`, `/app/complaints/[id]`,
`/app/complaints/new`, `/app/company/dashboard`, `/app/company/inbox`,
`/app/company/complaints`, `/app/company/complaints/[id]`,
`/app/company/projects`, `/app/company/profile`, `/app/company/verification`,
`/app/settings/*`, `/app/admin/*`
**Não toca:** rotas públicas — task `14`

## Passos

1. Autenticado (storage state da task `08`), percorra cada rota em 375x812.

2. Pontos de atenção específicos desta área:
   - **wizard de 4 etapas** (`/app/complaints/new`) — indicador de progresso,
     botões de avançar/voltar acessíveis sem zoom, upload de foto usável;
   - **tabelas e listas** — precisam virar cards em mobile, ou ganhar wrapper
     `overflow-x: auto`; nunca estourar a viewport;
   - **thread de mensagens** — composer fixo não pode cobrir o conteúdo quando
     o teclado virtual abre;
   - **filtros e tabs** (`FilterTabs`, `PageTabs`, `SubTabs`) — devem rolar
     horizontalmente dentro do próprio container, sem empurrar a página;
   - **dashboards** — cards em coluna única, gráficos com largura fluida.

3. Mesma detecção de overflow da task `14`.

4. Estenda `e2e/responsive.spec.ts` com as rotas autenticadas.

## Critérios de aceite

- [ ] Nenhuma rota autenticada tem scroll horizontal em 375px.
- [ ] O wizard completo é concluível em 375px — comprovado por E2E rodando no
      projeto `chromium-mobile`.
- [ ] A thread de mensagens é legível e o composer utilizável.
- [ ] Screenshots do wizard (4 etapas) e do inbox da empresa anexados ao
      relatório.

## Verificação

```bash
npx playwright test e2e/responsive.spec.ts --project=chromium-mobile
```

```bash
npx playwright test e2e/complaint-create.spec.ts --project=chromium-mobile
```

## Riscos e armadilhas

Teclado virtual e `100vh` no mobile são fonte crônica de bug — prefira `100dvh`
onde fizer sentido. O Playwright headless **não** simula teclado virtual: esse
caso específico exige conferência manual em um celular de verdade. Registre isso
como limitação, em vez de declarar coberto.
