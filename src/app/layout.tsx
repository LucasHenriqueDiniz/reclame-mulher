import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Reclame Mulher",
  description: "Plataforma de denúncias e reclamações",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
