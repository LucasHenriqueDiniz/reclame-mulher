import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";

import { Providers } from "./providers";
import { LocaleProvider } from "@/components/providers/locale-provider";
import { cn } from "@/lib/utils";
import { defaultLocale } from "@/i18n/config";
import { loadMessages } from "@/messages";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Reclame Mulher",
  description: "Plataforma de denúncias e reclamações",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const messages = await loadMessages(defaultLocale);

  return (
    <html lang={defaultLocale} suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background font-sans antialiased", geistSans.variable, geistMono.variable)}>
        <LocaleProvider initialLocale={defaultLocale} initialMessages={messages}>
          <Providers>{children}</Providers>
        </LocaleProvider>
      </body>
    </html>
  );
}
