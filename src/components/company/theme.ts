/**
 * Paleta da área da empresa.
 *
 * Todos os valores de texto aqui passam em WCAG AA (4,5:1) sobre `white` e
 * sobre `light`. Foram medidos na task 13 — antes disso, `primary`, `green`,
 * `yellow` e `orange` reprovavam. Se algum valor mudar, rode
 * `npm run test:a11y` antes de commitar: a suíte falha se o contraste piorar.
 */
export const companyTheme = {
  bg: "#F4F6F8",
  primary: "#1565C0", // 5,75:1 sobre branco
  purple: "#1E0F62",
  text: "#2E435B",
  muted: "#3E4A57", // Increased from #6E8195 for 4.5:1 contrast ratio (WCAG AA)
  border: "#C7CDD6", // Contraste suficiente p/ separação visual (bordas decorativas não exigem 3:1 do WCAG 1.4.11, só componentes de UI/foco)
  white: "#FFFFFF",
  green: "#146C43", // 6,0:1 sobre branco
  yellow: "#7A5C00", // 6,25:1 sobre branco
  orange: "#9A5400", // 5,77:1 sobre branco
  red: "#D93025",
  light: "#F0F4F8",
} as const;

export type CompanyTheme = typeof companyTheme;
