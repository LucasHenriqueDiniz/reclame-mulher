# Convenções de Nomenclatura

## Arquivos

- **Components:** PascalCase (`AppShell.tsx`)
- **Utilities:** camelCase (`normalize.ts`, `masks.ts`)
- **Types/DTOs:** camelCase com sufixo (`CreateComplaintInput`)
- **Constants:** UPPER_SNAKE_CASE

## Funções/Variáveis

- **camelCase** para funções e variáveis
- **PascalCase** para componentes React
- **UPPER_CASE** para constantes

## Database

- **snake_case** para colunas/tabelas (PostgreSQL padrão)
- **camelCase** no Drizzle schema (conversão automática)

## Componentes React

### Server Components (padrão)

```typescript
export default function PageName() {
  // Server Component
}
```

### Client Components

```typescript
"use client";

export default function InteractiveComponent() {
  // Client Component
}
```

## Server Actions

```typescript
"use server";

export async function actionName(input: InputType) {
  // Server Action
}
```

## Repositórios

```typescript
export class EntityRepo {
  static async methodName(params: Type): Promise<ReturnType> {
    // Método estático
  }
}
```

## DTOs

```typescript
export const CreateEntityDto = z.object({
  field: z.string().min(1),
});

export type CreateEntityInput = z.infer<typeof CreateEntityDto>;
```

## Mensagens de Tradução

- Usar namespaces por feature
- Keys em camelCase
- Estrutura aninhada para organização

```json
{
  "complaints": {
    "create": {
      "title": "Criar Reclamação",
      "success": "Reclamação criada com sucesso"
    }
  }
}
```
