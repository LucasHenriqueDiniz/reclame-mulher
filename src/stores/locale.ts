"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

import { defaultLocale, isLocale, type Locale } from "@/i18n/config";

export interface LocaleState {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const useLocaleStore = create<LocaleState>()(
  persist(
    (set) => ({
      locale: defaultLocale,
      setLocale: (locale) => {
        set({ locale: isLocale(locale) ? locale : defaultLocale });
      },
    }),
    {
      name: "reclame-mulher.locale",
      storage: createJSONStorage(() => {
        if (typeof window !== "undefined") {
          return localStorage;
        }
        // Return a no-op storage for SSR
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
    }
  )
);

export const selectLocale = (state: LocaleState) => state.locale;
export const selectSetLocale = (state: LocaleState) => state.setLocale;
