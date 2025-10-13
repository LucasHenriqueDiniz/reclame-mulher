"use client";

import { useTranslations } from "next-intl";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { locales, type Locale } from "@/i18n/config";
import { selectLocale, selectSetLocale, useLocaleStore } from "@/stores/locale";

interface LocaleSwitcherProps {
  showLabel?: boolean;
}

export function LocaleSwitcher({ showLabel = false }: LocaleSwitcherProps) {
  const t = useTranslations("common");
  const locale = useLocaleStore(selectLocale);
  const setLocale = useLocaleStore(selectSetLocale);

  return (
    <div className="flex items-center gap-2">
      {showLabel ? <span className="text-sm text-muted-foreground">{t("language")}</span> : null}
      <Select value={locale} onValueChange={(value) => setLocale(value as Locale)}>
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder={t("language")} />
        </SelectTrigger>
        <SelectContent>
          {locales.map((value) => (
            <SelectItem key={value} value={value}>
              {t(`languages.${value}` as const)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
