# [57] O botão "Criar um relato" da tela da empresa aponta para um link quebrado

| Campo | Valor |
|---|---|
| **ID** | `57` |
| **Fase** | `5 — Regras de negócio` |
| **Risco** | baixo (link quebrado, não falha de segurança) |
| **Depende de** | — |
| **Achado em** | task `15` (responsividade das áreas autenticadas) |
| **Estimativa** | pequena |

## O que foi encontrado

Em `src/app/app/company/complaints/[id]/_components/company-complaint-detail-content.tsx:515`:

```tsx
<Link href={`/app/complaints/new?company=${complaint.company.name}`}>
```

O wizard espera o **id** da empresa nesse parâmetro. Todos os outros cinco
lugares que montam esse link passam id:

| Arquivo | O que passa |
|---|---|
| `complaint-detail-content.tsx:558` | `complaint.companyId` |
| `company-profile-content.tsx:438` | `companyId` |
| `company-profile-content.tsx:491` | `companyId` |
| `company-profile-content.tsx:568` | `company.id` |
| `CompanyComplaintCtaCard.tsx:16` | `companyId` |
| **`company-complaint-detail-content.tsx:515`** | **`complaint.company.name`** |

É o único fora do padrão. O wizard abre sem empresa pré-selecionada.

## O segundo problema, no mesmo card

O card aparece **sem condição** na tela da empresa. Ou seja: a empresa, olhando
um relato feito contra ela, lê "Está querendo fazer um relato sobre
Construtora X?" com um botão para reclamar de si mesma.

A regra certa já existe no repositório — `company-profile-content.tsx:568` só
monta o CTA quando `!isMember`. A tela da empresa simplesmente não aplicou.

Está visível na captura [`15-celular/conversa-empresa.png`](../reports/15-celular/conversa-empresa.png).

## O que fazer

1. Trocar `complaint.company.name` por `complaint.company.id` (ou o campo de id
   equivalente disponível no componente).
2. Não renderizar o card na visão da empresa — é a mesma decisão do `!isMember`
   do perfil público.

## Critérios de aceite

- [ ] Nenhum `complaints/new?company=` no repositório passa nome em vez de id.
- [ ] A tela `/app/company/complaints/[id]` não oferece "criar relato" sobre a
      própria empresa.
- [ ] Teste E2E que abre a tela como empresa e verifica a ausência do card.
