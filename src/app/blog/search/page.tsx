"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function BlogSearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  return (
    <div className="container mx-auto p-6">
      <h1 className="font-heading text-4xl mb-6">
        Busca no Blog: {query}
      </h1>

      <p className="text-gray-600 mb-4">
        [API: GET /api/blog/search?q={query}&page=1&limit=20]
      </p>

      <div className="space-y-4">
        <p className="text-sm text-gray-500">
          Resultados da busca aparecerão aqui...
        </p>
      </div>

      <div className="mt-6">
        <Link href="/blog">
          <Button variant="outline">Voltar para Blog</Button>
        </Link>
      </div>
    </div>
  );
}

export default function BlogSearchPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded w-1/2" />
          <div className="h-6 bg-gray-200 rounded w-3/4" />
        </div>
      </div>
    }>
      <BlogSearchContent />
    </Suspense>
  );
}

