# Brand Guidelines

## Cores

- **Primary:** `#3BA5FF` (azul)
- **Secondary:** `#2A1B55` (roxo escuro)
- **Success:** Verde padrão do sistema
- **Error:** Vermelho padrão do sistema
- **Neutral:** Tons de cinza (#666, #999, etc)

## Tipografia

### Famílias de Fontes

- **Headings (Títulos):** `font-heading` - Poppins (400, 500, 600, 700, 800)

  - Usado para: H1, H2, H3, H4, H5, H6, labels, badges, buttons
  - Características: Friendly, approachable, modern, amigável

- **Body (Corpo):** `font-sans` - Inter (default)
  - Usado para: Parágrafos, textos, descrições, inputs
  - Características: Clean, modern, highly legible, acessível

### Hierarquia de Tamanhos

- H1: `text-3xl sm:text-4xl md:text-5xl lg:text-6xl` (Hero titles)
- H2: `text-3xl md:text-4xl lg:text-5xl` (Section titles)
- H3: `text-2xl md:text-3xl` (Subsection titles)
- H4: `text-xl md:text-2xl` (Card titles)
- Body Large: `text-lg md:text-xl` (Subtitles, emphasis)
- Body: `text-base` (default paragraph)
- Body Small: `text-sm` (labels, meta info)

### Uso

```tsx
// Headings sempre usam font-heading
<h1 className="font-heading">Título</h1>
<h2 className="font-heading">Subtítulo</h2>

// Textos usam font-sans (padrão, não precisa especificar)
<p>Texto comum</p>
```

## Espaçamento

- Seguir escala do Tailwind (4px base)
- Padding padrão: `p-6` (24px) em cards
- Gaps: `gap-4` (16px) entre elementos relacionados

## Componentes UI

- Usar shadcn/ui como base
- Customizações mantendo acessibilidade
- Loading states sempre visíveis
- Error states com mensagens claras

## Ícones

- Usar Lucide React (`lucide-react`)
- Tamanhos padrão:
  - Small: `w-4 h-4`
  - Medium: `w-5 h-5` ou `w-6 h-6`
  - Large: `w-8 h-8` ou `w-10 h-10`

## Imagens

- Formato preferencial: WebP
- Usar `next/image` para otimização
- Lazy loading quando apropriado
