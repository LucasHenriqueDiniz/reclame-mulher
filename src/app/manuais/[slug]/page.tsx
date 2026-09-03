import { readFileSync } from "node:fs";
import { join } from "node:path";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ArrowLeft, Download } from "lucide-react";
import { MainHeader } from "@/components/layout/MainHeader";
import { Footer } from "@/components/landing/Footer";
import { MANUAIS, findManual } from "../manuais";

/**
 * Read at build time from `public/manuais/`, which `scripts/sync-manuais.ts` keeps
 * byte-identical to the copies at the repository root. Reading the served copy rather
 * than the root one means the page and the download link cannot disagree, and
 * `pnpm run manuais:check` fails in CI if either drifts.
 */
function readManual(file: string): string {
  return readFileSync(join(process.cwd(), "public", "manuais", file), "utf8");
}

export function generateStaticParams() {
  return MANUAIS.map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const manual = findManual(slug);
  if (!manual) return {};
  return {
    title: `${manual.title} | Manuais | Comunica Mulher`,
    description: manual.summary,
  };
}

export default async function ManualPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const manual = findManual(slug);
  if (!manual) notFound();

  const content = readManual(manual.file);

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      <MainHeader />

      <main className="mx-auto max-w-3xl px-4 py-12">
        <Link
          href="/manuais"
          className="inline-flex items-center gap-2 text-sm text-[#5A6B7C] hover:text-[#2A3F54]"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Todos os manuais
        </Link>

        <div className="mt-6 flex flex-wrap items-baseline justify-between gap-3">
          <h1 className="text-3xl font-bold text-[#2A3F54]">{manual.title}</h1>
          <a
            href={`/manuais/${manual.file}`}
            download
            className="inline-flex items-center gap-2 text-sm text-[#C1666B] hover:underline"
          >
            <Download className="h-4 w-4" aria-hidden />
            Baixar em Markdown
          </a>
        </div>

        {/* Styled with an explicit component map rather than `prose`: this repo does not
            have @tailwindcss/typography, so `prose` classes would be inert, and the slice
            that asked for this delivery rules out adding a dependency. Same approach the
            blog takes at src/app/blog/[slug]/page.tsx. */}
        <article className="mt-8">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children }) => (
                <h1 className="mb-4 mt-8 text-2xl font-bold text-[#2A3F54]">{children}</h1>
              ),
              h2: ({ children }) => (
                <h2 className="mb-3 mt-8 border-b border-[#E5E5E3] pb-2 text-xl font-bold text-[#2A3F54]">
                  {children}
                </h2>
              ),
              h3: ({ children }) => (
                <h3 className="mb-2 mt-6 text-lg font-semibold text-[#2A3F54]">{children}</h3>
              ),
              p: ({ children }) => (
                <p className="mb-4 leading-relaxed text-[#3B3C4A]">{children}</p>
              ),
              ul: ({ children }) => (
                <ul className="mb-4 list-inside list-disc space-y-1 text-[#3B3C4A]">{children}</ul>
              ),
              ol: ({ children }) => (
                <ol className="mb-4 list-inside list-decimal space-y-1 text-[#3B3C4A]">{children}</ol>
              ),
              li: ({ children }) => <li className="leading-relaxed">{children}</li>,
              a: ({ href, children }) => (
                <a href={href} className="text-[#C1666B] underline">
                  {children}
                </a>
              ),
              code: ({ children }) => (
                <code className="rounded bg-[#F1F1EF] px-1.5 py-0.5 font-mono text-sm text-[#2A3F54]">
                  {children}
                </code>
              ),
              pre: ({ children }) => (
                <pre className="mb-4 overflow-x-auto rounded-lg bg-[#2A3F54] p-4 text-sm text-white">
                  {children}
                </pre>
              ),
              blockquote: ({ children }) => (
                <blockquote className="my-6 rounded-r-lg border-l-4 border-[#C1666B] bg-[#F6F6F7] p-4 italic text-[#3B3C4A]">
                  {children}
                </blockquote>
              ),
              table: ({ children }) => (
                <div className="mb-6 overflow-x-auto">
                  <table className="w-full border-collapse text-sm">{children}</table>
                </div>
              ),
              th: ({ children }) => (
                <th className="border border-[#E5E5E3] bg-[#F6F6F7] px-3 py-2 text-left font-semibold text-[#2A3F54]">
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td className="border border-[#E5E5E3] px-3 py-2 text-[#3B3C4A]">{children}</td>
              ),
            }}
          >
            {content}
          </ReactMarkdown>
        </article>
      </main>

      <Footer />
    </div>
  );
}
