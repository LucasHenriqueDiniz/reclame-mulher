# [10] E2E — resposta da empresa e transições de status

| Campo | Valor |
|---|---|
| **ID** | `10` |
| **Fase** | `3 — Testes` |
| **Risco** | baixo |
| **Depende de** | `09` |
| **Estimativa** | média |

## Objetivo

O outro lado do fluxo — empresa recebe, responde e muda status; usuária vê e
pode reabrir — fica coberto.

## Evidência

`TODO.md` (P1, Sprint 3) declara implementado e testado:

- thread de mensagens entre usuária e empresa;
- `POST` e `GET` em `/api/complaints/[id]/messages`;
- `PATCH /api/company/complaints/[id]/status`;
- transições `OPEN` → `IN_PROGRESS` → `RESOLVED`;
- resposta da usuária **reabre** a reclamação;
- leitura restrita a autora, empresa envolvida e admin.

Nenhum desses itens tem teste automatizado. Os arquivos
`company-complaint-detail-content.tsx` e `complaint-detail-content.tsx` estão
entre os modificados não commitados — ou seja, o comportamento pode ter mudado
depois desses relatórios.

## Passos

1. `e2e/complaint-response.spec.ts`.

2. Cenário completo, encadeado:
   - pessoa cria reclamação (reuse o helper da task `09`);
   - empresa faz login e encontra a reclamação no inbox;
   - empresa responde → status vai para `IN_PROGRESS`;
   - empresa marca `RESOLVED`;
   - pessoa vê a resposta no detalhe da reclamação;
   - pessoa responde → reclamação **reabre** (confirme qual status o código usa
     de fato ao reabrir, lendo o handler; não presuma).

3. Teste de privacidade: uma segunda empresa (ou uma segunda pessoa) **não**
   consegue abrir o detalhe daquela reclamação — nem pela UI, nem chamando a
   API direto.

## Critérios de aceite

- [ ] O ciclo completo passa.
- [ ] Cada transição de status é asserida pelo valor real exibido/retornado.
- [ ] O caso de privacidade passa.

## Verificação

```bash
npx playwright test e2e/complaint-response.spec.ts
```

## Riscos e armadilhas

Se a reabertura não funcionar como o `TODO.md` afirma, isso é bug de produto e
apareceria na demonstração da defesa. Registre como achado; não ajuste o teste
para passar.
