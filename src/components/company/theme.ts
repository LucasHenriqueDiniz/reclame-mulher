export const companyTheme = {
  bg: "#F4F6F8",
  primary: "#2189E5",
  purple: "#1E0F62",
  text: "#2E435B",
  muted: "#3E4A57", // Increased from #6E8195 for 4.5:1 contrast ratio (WCAG AA)
  border: "#C7CDD6", // Contraste suficiente p/ separação visual (bordas decorativas não exigem 3:1 do WCAG 1.4.11, só componentes de UI/foco)
  white: "#FFFFFF",
  green: "#1CA85B",
  yellow: "#E0A800",
  orange: "#E07B00",
  red: "#D93025",
  light: "#F0F4F8",
} as const;

export type CompanyTheme = typeof companyTheme;
