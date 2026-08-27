# Testes

> Escrito na task `21` a partir da configuração real. As contagens abaixo saem
> de `playwright test --list` e `vitest list`, não de memória.

Em março de 2026 este projeto tinha **zero** arquivos de teste, enquanto a
documentação descrevia fluxos E2E em detalhe. Hoje tem 458 testes automatizados,
e é isso que sustenta as afirmações dos outros documentos: quando o texto e o
código divergem, a suíte quebra.

## Pré-requisito

**Todos** os testes de navegador dependem do banco populado:

```bash
pnpm db:seed
```

Eles usam as contas, empresas e relatos que o seed cria. Sem isso, falham em
massa e a causa não é óbvia.

## As três suítes

| Comando | O que roda | Quantos | Quanto leva |
|---|---|---|---|
| `pnpm test` | unidade (Vitest) | 18 | segundos |
| `pnpm test:e2e` | ponta a ponta, 9 arquivos × 2 viewports | 362 | ~15 min |
| `pnpm test:a11y` | varredura WCAG, 39 páginas × 2 viewports | 78 | ~6 min |

`pnpm check` roda typecheck + lint + os testes de unidade. É o portão rápido.

> ⚠️ **`npx playwright test` sem `--project` roda tudo** — E2E e varredura de
> acessibilidade juntos, mais de 20 minutos. Use os scripts, que já filtram.

## O que cada arquivo trava

| Arquivo | O que quebra se alguém regredir |
|---|---|
| `e2e/smoke.spec.ts` | a home responde, sem erro de servidor nem de console |
| `e2e/auth.spec.ts` | login, logout e registro nos três perfis |
| `e2e/complaint-create.spec.ts` | o assistente de 4 etapas do relato |
| `e2e/complaint-response.spec.ts` | resposta da empresa e transição de status |
| `e2e/api-authorization.spec.ts` | quem pode chamar cada uma das 32 rotas, por papel |
| `e2e/ownership.spec.ts` | papel certo com id errado dá 403; anonimato não vaza nome |
| `e2e/api-erros.spec.ts` | o contrato de [`api-erros.md`](api-erros.md) |
| `e2e/keyboard.spec.ts` | os três fluxos principais só com teclado |
| `e2e/responsive.spec.ts` | nenhuma página rola para o lado em 375px; alvos de toque ≥ 24px |
| `e2e/a11y.spec.ts` | zero violações WCAG 2.1 A/AA em 39 páginas |
| `src/lib/__tests__/masks.test.ts` | as máscaras de CPF, CNPJ, telefone e CEP |

## Por que serial

`fullyParallel: false` e `workers: 1`, de propósito. As specs compartilham o
mesmo banco: em paralelo, uma apaga o que a outra acabou de criar e a falha vira
intermitente. Enquanto não houver um banco por worker, serial é o correto —
lento e confiável em vez de rápido e mentiroso.

## Viewports

`1280×800` e `375×812`. O segundo não é arbitrário: é a tela de celular mais
comum entre as usuárias da plataforma, e foi o alvo das tasks `14` e `15`.

## Variáveis de ambiente

Nenhuma é necessária para rodar. Três mudam o comportamento:

| Variável | Efeito |
|---|---|
| `E2E_SENHA` | senha das contas do seed. Padrão `senha123` |
| `E2E_UPLOAD=1` | liga o teste de upload real, que consome cota do UploadThing. Sem ela, o teste é pulado |
| `A11Y_BASELINE=1` | **regrava** o baseline da varredura em vez de comparar com ele |

Os 3 testes pulados numa execução limpa são os de upload real.

## Quando um teste de acessibilidade quebra

O baseline vive em `.claude/fixes/reports/12-a11y-baseline.json`. A varredura
compara contra ele e falha se aparecer violação nova. Se a violação for real,
**corrija o código** — regravar o baseline com `A11Y_BASELINE=1` só é legítimo
depois de corrigir, para registrar o novo zero.

## A armadilha do `.next`

`pnpm build` e o dev server escrevem no mesmo `.next`. Rodar os dois ao mesmo
tempo produz HTTP 500 com `ENOENT ... _buildManifest.js.tmp`, ou erros de tipo
fantasma em `.next/types/`. Não é bug do código:

```bash
rm -rf .next
```

Como o Playwright sobe o dev server sozinho (`webServer`), isso acontece na
prática quando se roda um build durante uma execução de teste.
