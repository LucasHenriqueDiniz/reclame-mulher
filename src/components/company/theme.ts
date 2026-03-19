export const companyTheme = {
  bg: "#F4F6F8",
  primary: "#2189E5",
  purple: "#1E0F62",
  text: "#2E435B",
  muted: "#6E8195",
  border: "#D9E3EC",
  white: "#FFFFFF",
  green: "#1CA85B",
  yellow: "#E0A800",
  orange: "#E07B00",
  red: "#D93025",
  light: "#F0F4F8",
} as const;

export type CompanyTheme = typeof companyTheme;
