# [12] Varredura automatizada de acessibilidade (axe) nas 42 páginas

| Campo | Valor |
|---|---|
| **ID** | `12` |
| **Fase** | `4 — Acessibilidade` |
| **Risco** | baixo (só mede) |
| **Depende de** | `07` |
| **Estimativa** | média |

## Objetivo

Substituir a afirmação "WCAG AA compliant" por um número medido e reproduzível,
página por página.

## Evidência

Os documentos do repo se contradizem sobre acessibilidade:

- `RELATORIO_CORRECOES_ACESSIBILIDADE.md`: 14 problemas corrigidos.
- `STATUS_FINAL_PRODUCAO.md`: acessibilidade em **87,5%**, com 6 pendências
  (aria-labels em links de ícone, revisão do form de login, teste com leitor de
  tela real).
- `TODO.md`: acessibilidade **VALIDADA**, "WCAG AAA" no contraste.

A auditoria original cobriu **6 páginas**. O projeto tem **42**.

Acessibilidade é tema central desta plataforma (público-alvo e
`docs/acessibilidade-inclusiva.md`) — aqui não dá para chutar.

## Escopo

**Toca:** `e2e/a11y.spec.ts`, `package.json`, `reports/`
**Não toca:** código de aplicação — corrigir é a task `13`

## Passos

1. ```bash
   npm i -D @axe-core/playwright
   ```

2. `e2e/a11y.spec.ts`: itere sobre a lista de rotas públicas e, com storage
   state, as autenticadas. Para cada uma, rode `AxeBuilder` com as tags
   `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`.

3. Rode nos dois viewports (desktop e mobile) — problema de acessibilidade em
   mobile costuma ser diferente (alvo de toque, ordem de foco no menu).

4. **Não** falhe o teste ainda. Nesta task, gere um relatório: grave a saída
   em `.claude/fixes/reports/12-a11y-baseline.json` e escreva o resumo em
   `12-varredura-acessibilidade.md` com uma tabela:

   | Rota | Violações críticas | Sérias | Moderadas | Regras |
   |---|---|---|---|---|

5. Ordene as violações por (severidade × número de páginas afetadas). Essa
   ordem vira o roteiro da task `13`.

## Critérios de aceite

- [ ] Todas as 42 rotas foram varridas (as com parâmetro dinâmico usando um id
      real do seed).
- [ ] O baseline JSON existe e o resumo em markdown está preenchido.
- [ ] Nenhum arquivo de `src/` foi modificado.

## Verificação

```bash
npx playwright test e2e/a11y.spec.ts
```

## Riscos e armadilhas

O axe não pega tudo — contraste dinâmico, ordem de leitura e clareza de
mensagem de erro escapam. O relatório deve dizer explicitamente que a varredura
automática cobre cerca de 30–40% dos critérios WCAG, para não repetir o erro dos
documentos antigos de declarar conformidade total a partir de teste parcial.
