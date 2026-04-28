# Skill: Adicionar um componente compartilhado

## Quando usar
Quando precisar criar um componente reusável na área logada.

## Onde colocar

**Componentes usados em múltiplas páginas da área logada:**
```
src/components/app/
  NomeDoComponente.tsx
```

**Componentes específicos de uma página:**
```
src/app/app/<area>/<pagina>/_components/
  NomeDoComponente.tsx
```

## Estrutura mínima

```tsx
"use client"; // só se precisar de interatividade

import type { ReactNode } from "react";

interface NomeDoComponenteProps {
  children: ReactNode;
  titulo: string;
}

export function NomeDoComponente({ children, titulo }: NomeDoComponenteProps) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white shadow-sm p-5">
      <h3 className="font-['Poppins'] font-semibold text-[#2A3F54] mb-3">{titulo}</h3>
      {children}
    </div>
  );
}
```

## Regras
1. **Use TypeScript** — sempre defina as props como interface
2. **Nome em PascalCase** — `ProfileHero`, `ContentCard`
3. **Export nomeado** — `export function` (não default)
4. **Só "use client" se necessário** — se não usa hooks/events, deixe Server Component
5. **Reutilize os shells** — não crie padding/margin custom se puder usar AppPageShell/CompanyPageShell
6. **Cores do projeto** — use `#1E88E5`, `#2A3F54`, `#607D8B`, `#F5F7FA`

## Exemplos de componentes existentes para copiar
- `src/components/app/ContentCard.tsx` — Card simples com slot
- `src/components/app/PageTabs.tsx` — Tabs de navegação
- `src/components/app/ProfileHero.tsx` — Hero com avatar, stats, tabs
