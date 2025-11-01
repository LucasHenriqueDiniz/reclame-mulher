/**
 * Opções pré-definidas de "Como ficou sabendo da plataforma"
 * Valores do enum how_heard_type no banco
 */

export const HOW_HEARD_OPTIONS = [
  { value: "LINKEDIN" as const, label: "LinkedIn" },
  { value: "INSTAGRAM" as const, label: "Instagram" },
  { value: "FACEBOOK" as const, label: "Facebook" },
  { value: "TWITTER" as const, label: "Twitter/X" },
  { value: "AMIGOS" as const, label: "Amigos/Conhecidos" },
  { value: "GOOGLE" as const, label: "Google/Busca" },
  { value: "YOUTUBE" as const, label: "YouTube" },
  { value: "EVENTO" as const, label: "Evento" },
  { value: "OUTRO" as const, label: "Outro" },
] as const;

export type HowHeardType =
  | "LINKEDIN"
  | "INSTAGRAM"
  | "FACEBOOK"
  | "TWITTER"
  | "AMIGOS"
  | "GOOGLE"
  | "YOUTUBE"
  | "EVENTO"
  | "OUTRO";

// Array de valores para uso no Zod (como tupla)
export const HOW_HEARD_VALUES: [string, ...string[]] = [
  "LINKEDIN",
  "INSTAGRAM",
  "FACEBOOK",
  "TWITTER",
  "AMIGOS",
  "GOOGLE",
  "YOUTUBE",
  "EVENTO",
  "OUTRO",
];

