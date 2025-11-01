"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [scope, setScope] = useState<"all" | "companies" | "complaints">(
    (searchParams.get("scope") as "all" | "companies" | "complaints") || "all"
  );

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (scope !== "all") params.set("scope", scope);
    router.push(`/search?${params.toString()}`);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="font-heading text-3xl mb-6">Busca</h1>
      
      <div className="flex gap-4 mb-6">
        <Input
          placeholder="Digite sua busca..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          className="max-w-md"
        />
        <select
          value={scope}
          onChange={(e) => setScope(e.target.value as "all" | "companies" | "complaints")}
          className="px-4 py-2 border rounded"
        >
          <option value="all">Tudo</option>
          <option value="companies">Empresas</option>
          <option value="complaints">Reclamações</option>
        </select>
        <Button onClick={handleSearch}>Buscar</Button>
      </div>

      <div className="mt-8">
        <p className="text-gray-600">
          Resultados para: <strong>{query || "(vazio)"}</strong> em{" "}
          <strong>{scope}</strong>
        </p>
        <p className="text-sm text-gray-500 mt-4">
          [API: GET /api/search?scope={scope}&q={query}&page=1&limit=20]
        </p>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded w-1/3" />
          <div className="h-12 bg-gray-200 rounded w-full" />
          <div className="h-6 bg-gray-200 rounded w-1/2" />
        </div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}

