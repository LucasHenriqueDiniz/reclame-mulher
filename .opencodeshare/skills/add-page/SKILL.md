# Skill: Adicionar uma nova página

## Quando usar
Quando precisar criar uma nova tela na área logada (user, company ou admin).

## Passos

### 1. Escolher o shell correto

**Área de usuária:**
```tsx
import { AppPageShell } from "@/components/app/AppPageShell";
import { ProfileHero } from "@/components/app/ProfileHero";
import { ContentCard } from "@/components/app/ContentCard";
```

**Área da empresa:**
```tsx
import { CompanyPageShell } from "@/components/app/CompanyPageShell";
import { CompanyPageHeader } from "@/components/app/CompanyPageHeader";
import { ContentCard } from "@/components/app/ContentCard";
```

### 2. Criar o arquivo

Caminho: `src/app/app/<area>/<nome-da-pagina>/page.tsx`

Exemplo mínimo (área da empresa):
```tsx
"use client";

import { MessageSquare } from "lucide-react";
import { CompanyPageShell } from "@/components/app/CompanyPageShell";
import { CompanyPageHeader } from "@/components/app/CompanyPageHeader";
import { ContentCard } from "@/components/app/ContentCard";
import type { CompanyNavTab } from "@/components/app/CompanyPageHeader";

const COMPANY_TABS: CompanyNavTab[] = [
  { key: "dashboard", label: "Painel", href: "/app/company/dashboard", icon: LayoutDashboard },
  { key: "reclamacoes", label: "Reclamações", href: "/app/company/complaints", icon: MessageSquare },
  // ... outras tabs
];

export default function MinhaPagina() {
  return (
    <CompanyPageShell>
      <CompanyPageHeader
        title="Título da Página"
        subtitle="Descrição opcional"
        icon={<MessageSquare className="w-8 h-8" />}
        tabs={COMPANY_TABS}
        activeTab="reclamacoes"
      />

      <ContentCard innerClassName="p-6">
        <p>Conteúdo aqui</p>
      </ContentCard>
    </CompanyPageShell>
  );
}
```

### 3. Adicionar às tabs de navegação

Se a página precisa aparecer nas tabs, adicione em **todos** os lugares que usam a mesma lista de tabs:
- `company/profile/page.tsx`
- `company/projects/page.tsx`
- `company/complaints/_components/company-complaints-content.tsx`
- etc.

### 4. Verificar build
```bash
cd E:\Repositories\reclame-mulher
npm run build
```

## Dicas
- Se a página precisa de dados do servidor, use Server Component (sem `"use client"`)
- Se precisa de interatividade (useState, onClick), use Client Component
- Sempre use `CompanyPageShell` ou `AppPageShell` para padding/margens consistentes
- Nunca crie páginas fora dos shells — a consistência visual quebra
