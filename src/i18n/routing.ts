import { createNavigation } from "next-intl/navigation";

export const locales = ["pt-BR", "en"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "pt-BR";
export const localePrefix = "always" as const;

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation({
    locales,
    defaultLocale,
    localePrefix,
  });

export const routing = {
  locales,
  defaultLocale,
  localePrefix,
};
