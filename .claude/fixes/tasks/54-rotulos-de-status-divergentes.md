# [54] O mesmo status tem quatro nomes diferentes na interface

| Campo | Valor |
|---|---|
| **ID** | `54` |
| **Fase** | `2 — Qualidade` |
| **Risco** | baixo |
| **Depende de** | — |
| **Achado em** | task `10` (E2E de resposta da empresa) |
| **Estimativa** | pequena |

## O que foi encontrado

Existe um módulo de constantes feito exatamente para isso —
`src/lib/constants/complaint-status.ts`, cujo comentário diz *"Usado em toda a
aplicação para garantir consistência visual"*. Ele **não** é usado em toda a
aplicação. Há mais três mapas independentes, e eles discordam:

| Status | `lib/constants` (listagem) | Detalhe da usuária | Badge da empresa | Select da empresa |
|---|---|---|---|---|
| `OPEN` | Aberta | Em aberto | Em aberto | Em aberto |
| `RESPONDED` | **Em réplica** | Respondida | Respondida | Respondida |
| `RESOLVED` | Resolvida | **Concluído** | Resolvida | Resolvida |
| `CANCELLED` | Cancelada | Cancelada | Cancelada | Cancelada |

Onde cada um mora:

- `src/lib/constants/complaint-status.ts` → `COMPLAINT_STATUS`
- `src/app/app/complaints/[id]/_components/complaint-detail-content.tsx:26` → `STATUS_LABELS`
- `src/app/app/company/complaints/[id]/_components/company-complaint-detail-content.tsx:30` → `STATUS_CONFIG`
- o mesmo arquivo, `:61` → `STATUS_OPTIONS`

## O efeito para quem usa

O mesmo relato, na mesma sessão:

- na lista de "Minhas reclamações": **Em réplica**
- ao clicar nele: **Respondida**
- quando a empresa encerra, a usuária lê **Concluído** e a empresa lê
  **Resolvida**

"Em réplica" e "Concluído" não aparecem em mais lugar nenhum do produto. E
"Concluído" ainda quebra a concordância — os outros três rótulos daquele mesmo
mapa são femininos, porque concordam com *reclamação*.

Isso vai aparecer na demonstração da defesa, com as duas telas abertas lado a
lado.

## O que fazer

1. Manter só `src/lib/constants/complaint-status.ts` e decidir ali o rótulo
   único de cada status. Sugestão, seguindo a concordância com *reclamação*:
   **Aberta**, **Respondida**, **Resolvida**, **Cancelada**.
2. Apagar os três mapas locais e importar o compartilhado nos três lugares.
3. O `STATUS_CONFIG` da empresa carrega também ícone e cores — mover esses
   campos para o módulo compartilhado em vez de duplicar o mapa.

```bash
grep -rn "STATUS_LABELS\|STATUS_CONFIG\|STATUS_OPTIONS\|COMPLAINT_STATUS" src/
```

## Critérios de aceite

- [ ] Um único mapa de rótulos no repositório.
- [ ] Lista e detalhe mostram o mesmo texto para o mesmo status.
- [ ] Usuária e empresa leem o mesmo texto para o mesmo status.
- [ ] `npm run check` e a suíte E2E continuam verdes.

## Nota

`e2e/complaint-response.spec.ts` asserta status pela **API**, não pelo texto na
tela, justamente para não travar esta correção. Depois que os rótulos forem
unificados, vale acrescentar uma asserção de rótulo — aí ela protege a
unificação em vez de atrapalhar.
