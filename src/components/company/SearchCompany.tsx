"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type SearchCompanyItem = {
  id: string;
  name: string;
  logoUrl?: string | null;
  region?: string | null;
  verifiedAt?: string | null;
};

type SearchCompanyProps = {
  onSelect: (company: SearchCompanyItem) => void;
  placeholder?: string;
  className?: string;
  /** Debounce ms for search input */
  debounceMs?: number;
};

export function SearchCompany({
  onSelect,
  placeholder = "Buscar por nome da empresa...",
  className,
  debounceMs = 300,
}: SearchCompanyProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchCompanyItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCompanies = useCallback(async (search: string) => {
    if (!search.trim()) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const params = new URLSearchParams({ search: search.trim() });
      const res = await fetch(`/api/companies?${params}`);
      if (!res.ok) throw new Error("Falha ao buscar");
      const data = await res.json();
      setResults(
        (Array.isArray(data) ? data : []).map((c: Record<string, unknown>) => ({
          id: String(c.id),
          name: String(c.name ?? ""),
          logoUrl: c.logoUrl != null ? String(c.logoUrl) : null,
          region: c.region != null ? String(c.region) : null,
          verifiedAt: c.verifiedAt != null ? String(c.verifiedAt) : null,
        }))
      );
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => fetchCompanies(query), debounceMs);
    return () => clearTimeout(t);
  }, [query, debounceMs, fetchCompanies]);

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <label htmlFor="company-search" className="sr-only">
        {placeholder}
      </label>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
        <Input
          id="company-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={placeholder}
          className="pl-9"
          autoFocus
          aria-label={placeholder}
        />
      </div>

      {loading && (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {!loading && query.trim() && results.length === 0 && (
        <p className="py-4 text-center text-sm text-muted-foreground">
          Nenhuma empresa encontrada.
        </p>
      )}

      {!loading && results.length > 0 && (
        <ul className="max-h-[280px] overflow-y-auto rounded-lg border bg-card">
          {results.map((company) => (
            <li key={company.id}>
              <button
                type="button"
                onClick={() => onSelect(company)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/60 focus:bg-muted/60 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-inset focus:outline-none"
                aria-label={`Selecionar ${company.name}`}
              >
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full bg-muted">
                  {company.logoUrl ? (
                    <Image
                      src={company.logoUrl}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-sm font-semibold text-muted-foreground">
                      {company.name.slice(0, 1).toUpperCase()}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-foreground">{company.name}</span>
                    {company.verifiedAt != null && (
                      <Badge className="shrink-0 border-0 bg-blue-100 text-blue-800 text-xs">
                        VERIFICADA
                      </Badge>
                    )}
                  </div>
                  {company.region && (
                    <p className="text-sm text-muted-foreground">{company.region}</p>
                  )}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
