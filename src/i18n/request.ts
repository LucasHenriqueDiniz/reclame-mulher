import { getRequestConfig } from "next-intl/server";
import { routing, type Locale } from "@/i18n/routing";
import { loadMessages } from "@/messages";

export default getRequestConfig(async ({ locale }) => {
  const localeToUse = routing.locales.find((item) => item === locale);

  if (!localeToUse) {
    const error = new Error(`Unsupported locale: ${locale}`);
    error.name = "NotFound";
    throw error;
  }

  const messages = await loadMessages(localeToUse as Locale);

  return {
    locale: localeToUse,
    messages,
  };
});
