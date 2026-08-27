# [53] Os selects do wizard não têm rótulo associado

| Campo | Valor |
|---|---|
| **ID** | `53` |
| **Fase** | `4 — Acessibilidade` |
| **Risco** | baixo |
| **Depende de** | — |
| **Achado em** | task `09` (E2E do wizard) |
| **Estimativa** | pequena |

## O que foi encontrado

`ComplaintField` recebe `htmlFor` e gera `<label for="...">`. O `ComplaintSelect`
por baixo é um Radix `SelectTrigger`, que **não recebe esse id**. Resultado:
label apontando para elemento que não existe.

Medido no navegador, na etapa 4 do wizard:

```
ROTULOS: [
  {"id":"impact-category","existeElementoComEsseId":false,"existeLabelApontando":true},
  {"id":"urgency-level",  "existeElementoComEsseId":false,"existeLabelApontando":true},
  {"id":"impact-scope",   "existeElementoComEsseId":false,"existeLabelApontando":true},
  {"id":"complaint-title","existeElementoComEsseId":true, "existeLabelApontando":true}
]
```

Os campos de texto (`complaint-title`, `complaint-description`,
`complaint-location`) estão certos. Os três selects, não: três `<label for>`
órfãos e três combobox sem nome acessível.

## Por que isso importa

- Leitor de tela anuncia "caixa de combinação, Escolha uma opção" — sem dizer
  de que campo se trata. Três seguidos, todos iguais.
- Clicar no rótulo não abre o select, que é comportamento esperado de
  formulário.
- Falha de WCAG 1.3.1 (informação e relações) e 4.1.2 (nome, função, valor).
- É o mesmo defeito em `ComplaintSelect`, então provavelmente aparece em todo
  lugar que usa esse componente — verificar antes de fechar.

## O que fazer

Em `src/app/app/complaints/new/_components/fields/complaint-select.tsx`, aceitar
um `id` e repassá-lo ao `SelectTrigger`:

```tsx
export interface ComplaintSelectProps {
  id?: string;
  // ...
}

<SelectTrigger id={id} className={...}>
```

E passar o id nos três usos da etapa 4 (`impact-category`, `urgency-level`,
`impact-scope`), casando com o `htmlFor` que já está lá.

Conferir depois se `ComplaintSelect` é usado em outras telas com o mesmo
problema:

```bash
grep -rn "ComplaintSelect" src/
```

## Critérios de aceite

- [ ] `document.getElementById("urgency-level")` devolve o gatilho do select.
- [ ] O nome acessível de cada combobox é o texto do rótulo.
- [ ] Clicar no rótulo abre o select.
- [ ] `e2e/complaint-create.spec.ts` continua verde. O helper `escolher`
      procura o gatilho por adjacência (`label + button`) justamente porque
      `getByLabel` não funciona hoje — **depois desta correção, trocar o helper
      por `page.getByLabel(...)`**, que é mais legível e testa o rótulo de
      verdade.

## Nota

Este é um caso em que o teste E2E documenta o defeito: o comentário no topo de
`e2e/complaint-create.spec.ts` explica por que a busca é por adjacência. Quando
esta task fechar, aquele comentário sai junto.
