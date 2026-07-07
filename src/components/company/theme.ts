export const companyTheme = {
  bg: "#F5F1ED",
  primary: "#5C4B73",
  purple: "#5C4B73",
  text: "#4A4A4A",
  muted: "#8B7B8B",
  border: "#D4A5A5",
  white: "#FFFFFF",
  green: "#6B8B6B",
  yellow: "#C9A876",
  orange: "#B8845D",
  red: "#A85C5C",
  light: "#F9F5F2",
} as const;

export type CompanyTheme = typeof companyTheme;
