import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter, Poppins, Playfair_Display } from "next/font/google";

import "./globals.css";

import { Providers } from "./providers";
import { LocaleProvider } from "@/components/providers/locale-provider";
import { HeaderDataProvider } from "@/lib/stores/header-data-store";
import { cn } from "@/lib/utils";
import { defaultLocale } from "@/i18n/config";
import { loadMessages } from "@/messages";

// Primary font for body text - clean, modern, highly legible
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

// Font for headings - friendly, approachable, modern
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

// Font for headings - elegant serif for main headings
const playfair = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Reclame Mulher",
  description: "Plataforma de denúncias e reclamações",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const messages = await loadMessages(defaultLocale);

  return (
    <html lang={defaultLocale} suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased", inter.variable, poppins.variable, playfair.variable)}>
        <LocaleProvider initialLocale={defaultLocale} initialMessages={messages}>
          <HeaderDataProvider>
            <Providers>{children}</Providers>
          </HeaderDataProvider>
        </LocaleProvider>
      </body>
    </html>
  );
}
