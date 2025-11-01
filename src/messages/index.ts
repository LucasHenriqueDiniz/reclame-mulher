import type { AbstractIntlMessages } from "next-intl";

import type { Locale } from "@/i18n/config";

const namespaces = [
  "common",
  "auth",
  "complaints",
  "companies",
  "projects",
  "blog",
  "admin",
] as const;

export type Namespace = (typeof namespaces)[number];
export type Messages = Record<Namespace, AbstractIntlMessages>;

async function importNamespace(locale: Locale, namespace: Namespace) {
  switch (locale) {
    case "en":
      return (await import(`@/messages/en/${namespace}.json`)).default;
    case "pt-BR":
      return (await import(`@/messages/pt-BR/${namespace}.json`)).default;
    default:
      throw new Error(`Unsupported locale: ${locale}`);
  }
}

export async function loadMessages(locale: Locale): Promise<Messages> {
  const entries = await Promise.all(
    namespaces.map(async (namespace) => [
      namespace,
      await importNamespace(locale, namespace),
    ])
  );

  return Object.fromEntries(entries) as Messages;
}

export { namespaces };
