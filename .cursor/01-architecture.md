# Arquitetura do Projeto

## Stack Tecnológica

- **Framework:** Next.js 15 (App Router, RSC)
- **Linguagem:** TypeScript (strict mode)
- **Styling:** Tailwind CSS 3.4 + shadcn/ui
- **Database:** Supabase (PostgreSQL) + Drizzle ORM
- **Auth:** Supabase Auth (email + OAuth Google)
- **Forms:** react-hook-form + Zod
- **i18n:** next-intl
- **State Management:** Zustand (client) + React Query (quando necessário)

## Estrutura de Pastas

```
src/
  app/                    # App Router (Next.js)
    (auth)/              # Route group para páginas de autenticação
    onboarding/          # Fluxo de onboarding
    app/                 # Área autenticada
    api/                 # API Routes (quando necessário)
    auth/                # Callbacks OAuth
  components/
    ui/                  # shadcn/ui components
    layout/              # Layout components (AppShell, Sidebar, etc)
  db/
    schema.ts            # Drizzle schema (fonte de verdade)
    client.ts            # Drizzle client (server-only)
    migrations/          # Migrations geradas pelo drizzle-kit
  lib/
    supabase/            # Supabase clients (client.ts, server.ts)
    env.ts               # Validação de env vars (Zod)
    masks.ts             # Máscaras (CPF, CNPJ, etc)
    normalize.ts         # Normalização de strings
  server/
    dto/                 # Zod schemas por domínio
    repos/               # Repositórios (Drizzle/Supabase)
  messages/              # Traduções (next-intl)
    en/
    pt-BR/
  hooks/                 # React hooks customizados
  stores/                # Zustand stores
```

## Padrões de Código

### 1. Server Actions

- Sempre usar `"use server"` no topo do arquivo
- Validar inputs com Zod DTOs
- Retornar objetos simples (não classes/instâncias)
- Tratar erros adequadamente

```typescript
"use server";
import { CreateComplaintDto } from "@/server/dto/complaints";

export async function createComplaint(input: unknown) {
  const validated = CreateComplaintDto.parse(input);
  // ... lógica
}
```

### 2. Repositórios

- Usar classes estáticas (padrão atual)
- Para operações com RLS: usar Supabase JS
- Para operações admin/públicas: usar Drizzle
- Sempre tipar retornos

```typescript
export class ComplaintsRepo {
  static async create(data: CreateComplaintInput, userId: string) {
    const supabase = await supabaseServer();
    // ... implementação
  }
}
```

### 3. DTOs (Data Transfer Objects)

- Todos os DTOs em `src/server/dto/`
- Usar Zod para validação
- Exportar type inference

```typescript
export const CreateComplaintDto = z.object({
  title: z.string().min(3),
  // ...
});
export type CreateComplaintInput = z.infer<typeof CreateComplaintDto>;
```

### 4. Componentes React

- Server Components por padrão
- Client Components apenas quando necessário (use "use client")
- Usar shadcn/ui para UI
- Seguir padrão de composição do shadcn

### 5. i18n

- Todas as strings traduzíveis em `src/messages/{locale}/`
- Namespaces por feature: `auth`, `common`, `complaints`, etc
- Usar `useTranslations("namespace")` nos componentes

### 6. Database Access Patterns

- **RLS (Row Level Security):** Supabase JS sempre (respeita contexto do usuário)
- **Admin/Public:** Drizzle ORM (quando precisa bypass RLS)
- **Migrations:** Apenas via Drizzle Kit (`pnpm db:generate`, `pnpm db:migrate`)

### 7. Environment Variables

- Validar todas as env vars em `src/lib/env.ts`
- Usar `NEXT_PUBLIC_*` apenas para variáveis que precisam estar no bundle
- Nunca expor `SUPABASE_SERVICE_ROLE_KEY` no client
