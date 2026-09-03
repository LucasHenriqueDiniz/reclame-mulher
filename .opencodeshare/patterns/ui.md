# Padrões de UI — Reclame Mulher

## Shells de página

### Área de Usuária
```tsx
import { AppPageShell } from "@/components/app/AppPageShell";
import { ProfileHero } from "@/components/app/ProfileHero";
import { ContentCard } from "@/components/app/ContentCard";

// AppPageShell: bg-[#F5F7FA], max-w-[1200px], px-6 pt-8
// ProfileHero: banner azul, avatar, nome, stats, tabs
// ContentCard: Card com shadow-md border-0, usado para conteúdo
```

### Área da Empresa
```tsx
import { CompanyPageShell } from "@/components/app/CompanyPageShell";
import { CompanyPageHeader } from "@/components/app/CompanyPageHeader";

// CompanyPageShell: bg-[#F5F7FA], max-w-7xl, px-4 py-8
// CompanyPageHeader: ícone + título + subtítulo + tabs opcionais
```

## Tabs de navegação
Use `PageTabs` (componente compartilhado):
```tsx
import { PageTabs } from "@/components/app/PageTabs";

const tabs = [
  { key: "dashboard", label: "Painel", href: "/app/company/dashboard", icon: LayoutDashboard },
  { key: "reclamacoes", label: "Reclamações", href: "/app/company/complaints", icon: MessageSquare },
];

<PageTabs tabs={tabs} activeTab="reclamacoes" variant="underline" />
// variant: "underline" (empresa) | "pill" (ProfileHero user)
```

## Cards de métricas (dashboard)
Padrão usado em `/app/company/complaints`:
```tsx
// Card clicável com cor de fundo diferenciada
<button className="rounded-xl p-5 border transition-all hover:shadow-md" style={{ backgroundColor: bgColor }}>
  <div className="flex items-center justify-between mb-3">
    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: color + "20", color }}>
      <Icon />
    </div>
    <span className="text-3xl font-bold" style={{ color }}>{value}</span>
  </div>
  <p className="text-sm font-medium text-[#2A3F54]">{label}</p>
</button>
```

## Status badges
Use `getComplaintStatusConfig` do constants:
```tsx
import { getComplaintStatusConfig } from "@/lib/constants/complaint-status";

const config = getComplaintStatusConfig("OPEN");
// config: { label, color, bgColor, borderColor }
```

## Cores principais
- Primária: `#1E88E5` (azul)
- Hover: `#1976D2`
- Texto: `#2A3F54`
- Muted: `#607D8B`
- Borda: `#E5E5ED`
- Fundo: `#F5F7FA`

## Tipografia
- Fonte: `'Poppins'` (via Tailwind `font-['Poppins']`)
- Títulos: semibold/bold
- Body: text-sm, text-[#2A3F54]

## Regras de ouro
1. `<img>` is allowed here — `images.unoptimized` is on in `next.config.ts` and `eslint.config.mjs` disables `@next/next/no-img-element`. See `.opencodeshare/README.md`.
2. **Botões principais:** `bg-[#1E88E5] hover:bg-[#1976D2]`
3. **Cards:** `border-0 shadow-md` ou `shadow-sm`
4. **Inputs:** `rounded-xl border-gray-200 focus:border-[#1E88E5]`
5. **Mobile-first** — sempre testar responsividade
