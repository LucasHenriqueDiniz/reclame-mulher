"use client";

import { useEffect, useState, type ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";

import { defaultLocale, locales, type Locale } from "@/i18n/config";
import { loadMessages, type Messages } from "@/messages";
import { selectLocale, selectSetLocale, useLocaleStore } from "@/stores/locale";

interface LocaleProviderProps {
  children: ReactNode;
  initialLocale?: Locale;
  initialMessages: Messages;
}

export function LocaleProvider({
  children,
  initialLocale = defaultLocale,
  initialMessages,
}: LocaleProviderProps) {
  const locale = useLocaleStore(selectLocale);
  const setLocale = useLocaleStore(selectSetLocale);
  const [activeLocale, setActiveLocale] = useState<Locale>(initialLocale);
  const [messages, setMessages] = useState<Messages>(initialMessages);

  useEffect(() => {
    document.documentElement.lang = activeLocale;
  }, [activeLocale]);

  useEffect(() => {
    if (!locales.includes(locale)) {
      setLocale(defaultLocale);
      return;
    }

    if (locale === activeLocale) {
      return;
    }

    let isMounted = true;

    loadMessages(locale)
      .then((loadedMessages) => {
        if (!isMounted) {
          return;
        }

        setMessages(loadedMessages);
        setActiveLocale(locale);
      })
      .catch((error) => {
        console.error("Failed to load locale messages", error);
      });

    return () => {
      isMounted = false;
    };
  }, [locale, activeLocale, setLocale]);

  return (
    <NextIntlClientProvider locale={activeLocale} messages={messages} timeZone="UTC">
      {children}
    </NextIntlClientProvider>
  );
}
