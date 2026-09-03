import Link from "next/link";
import type { Metadata } from "next";
import { FileText, FileCode, ArrowRight } from "lucide-react";
import { MainHeader } from "@/components/layout/MainHeader";
import { Footer } from "@/components/landing/Footer";
import { MANUAIS, MANUAL_HTML } from "./manuais";

export const metadata: Metadata = {
  title: "Manuais | Comunica Mulher",
  description:
    "Manuais de uso da plataforma: por onde começar, guia rápido, fluxos e a referência completa.",
};

export default function ManuaisPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      <MainHeader />

      <main className="mx-auto max-w-4xl px-4 py-12">
        <h1 className="text-3xl font-bold text-[#2A3F54]">Manuais da plataforma</h1>
        <p className="mt-3 max-w-2xl text-[#5A6B7C]">
          Documentação de uso, escrita para quem usa a plataforma. Comece pelo{" "}
          <Link href="/manuais/leia-me-primeiro" className="font-medium text-[#C1666B] underline">
            Leia-me primeiro
          </Link>{" "}
          se esta é sua primeira vez.
        </p>

        <ul className="mt-10 space-y-4">
          {MANUAIS.map((m) => (
            <li key={m.slug}>
              <Link
                href={`/manuais/${m.slug}`}
                className="flex items-start gap-4 rounded-lg border border-[#E5E5E3] bg-white p-5 transition hover:border-[#C1666B]"
              >
                <FileText className="mt-1 h-5 w-5 shrink-0 text-[#C1666B]" aria-hidden />
                <span className="flex-1">
                  <span className="block font-semibold text-[#2A3F54]">{m.title}</span>
                  <span className="mt-1 block text-sm text-[#5A6B7C]">{m.summary}</span>
                  <span className="mt-2 block text-xs uppercase tracking-wide text-[#8A9AA9]">
                    {m.audience}
                  </span>
                </span>
                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-[#8A9AA9]" aria-hidden />
              </Link>
            </li>
          ))}

          {/* Served as a static file: it is a complete standalone document, so the browser
              renders it directly instead of this route parsing and re-rendering it. */}
          <li>
            <a
              href={MANUAL_HTML.href}
              className="flex items-start gap-4 rounded-lg border border-dashed border-[#E5E5E3] bg-white p-5 transition hover:border-[#C1666B]"
            >
              <FileCode className="mt-1 h-5 w-5 shrink-0 text-[#C1666B]" aria-hidden />
              <span className="flex-1">
                <span className="block font-semibold text-[#2A3F54]">{MANUAL_HTML.title}</span>
                <span className="mt-1 block text-sm text-[#5A6B7C]">{MANUAL_HTML.summary}</span>
              </span>
              <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-[#8A9AA9]" aria-hidden />
            </a>
          </li>
        </ul>
      </main>

      <Footer />
    </div>
  );
}
