/**
 * Predefined options for "Como ficou sabendo da plataforma"
 * (how did you hear about the platform) — the label is what the form shows.
 * (how the user heard about the platform).
 * Values of the how_heard_type enum in the database.
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

// The values as a tuple, for Zod
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

