import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type ComplaintStatus = "OPEN" | "RESPONDED" | "RESOLVED" | "CANCELLED";

type LocaleOption = {
  locale?: string;
};

export function formatDate(
  value: string | number | Date,
  { locale = "pt-BR" }: LocaleOption = {}
) {
  const date = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat(locale).format(date);
}

export function formatDateTime(
  value: string | number | Date,
  { locale = "pt-BR" }: LocaleOption = {}
) {
  const date = value instanceof Date ? value : new Date(value);
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function formatNumber(value: number, { locale = "pt-BR" }: LocaleOption = {}) {
  return new Intl.NumberFormat(locale).format(value);
}

export function formatComplaintStatus(
  status: ComplaintStatus,
  { locale = "pt-BR" }: LocaleOption = {}
) {
  const dictionaries: Record<string, Record<ComplaintStatus, string>> = {
    "pt-BR": {
      OPEN: "Aberta",
      RESPONDED: "Respondida",
      RESOLVED: "Resolvida",
      CANCELLED: "Cancelada",
    },
    en: {
      OPEN: "Open",
      RESPONDED: "Responded",
      RESOLVED: "Resolved",
      CANCELLED: "Cancelled",
    },
  };

  const fallback = dictionaries["pt-BR"];
  return (dictionaries[locale] ?? fallback)[status] ?? fallback[status];
}

export function isNotNullable<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}
