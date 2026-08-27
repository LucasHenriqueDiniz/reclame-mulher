# [19] Performance — Core Web Vitals das rotas principais

| Campo | Valor |
|---|---|
| **ID** | `19` |
| **Fase** | `7 — Build e produção` |
| **Risco** | baixo |
| **Depende de** | `18` |
| **Estimativa** | média |

## Objetivo

Números medidos de LCP, CLS e INP sobre o build de produção, e as correções
óbvias aplicadas.

## Evidência

`AUDITORIA_COMPLETA_PROBLEMAS.md`, item 7: "Performance em Produção
Desconhecida". O único número existente — "0,73s de média" — foi medido em
dev server, o que não diz nada sobre produção: em dev não há minificação, o
Turbopack compila sob demanda e o React roda em modo desenvolvimento.

A task `06` (migração para `next/image`) deve melhorar LCP e CLS; esta task
mede se melhorou de fato.

## Pré-condições

- [ ] A task `18` fechou e `npm run start` sobe o build de produção.

## Passos

1. Meça **sobre o build de produção**, nunca sobre o dev.

2. Rotas a medir: `/`, `/companies`, `/company/[slug]`, `/blog`,
   `/blog/[slug]`, `/app/complaints`, `/app/company/dashboard`.

3. Meça nos dois viewports. Mobile é o caso que importa para o público desta
   plataforma, e é onde os números costumam ser piores.

4. Alvos (limiar "bom" do Google):

   | Métrica | Alvo |
   |---|---|
   | LCP | < 2,5 s |
   | CLS | < 0,1 |
   | INP | < 200 ms |
   | TTFB | < 800 ms |

5. Correções mais prováveis, pelo que já se sabe do código:
   - imagens não otimizadas (deve estar resolvido pela task `06` — confirme);
   - fonte `Playfair Display` sem `next/font` → FOUT e CLS;
   - componente client pesado que poderia ser server component;
   - query sem índice inflando o TTFB das listagens.

6. Se for preciso escolher, priorize CLS e LCP da home e da página de empresa —
   são as telas que aparecem na demonstração.

## Critérios de aceite

- [ ] Tabela de métricas por rota e por viewport, medida em produção, no
      relatório.
- [ ] Home e página de empresa dentro dos alvos, ou com o motivo documentado.
- [ ] Toda otimização aplicada tem antes/depois medido, não só a afirmação de
      que melhorou.

## Verificação

```bash
npm run build
```

```bash
npm run start
```

Depois, medição via ferramentas de preview sobre `http://localhost:5000`.

## Riscos e armadilhas

Medição local com banco remoto (Neon) mistura latência de rede no TTFB.
Registre isso ao interpretar o número, em vez de sair otimizando query à toa.
