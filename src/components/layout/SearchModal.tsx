"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Building2, TrendingUp, Clock } from "lucide-react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@/components/ui/visually-hidden";
import { usePreventScrollShift } from "@/hooks/use-prevent-scroll-shift";

interface SearchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SearchModal({ open, onOpenChange }: SearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{
    companies: Array<{
      id: string;
      name: string;
      slug: string;
      sector: string | null;
      verifiedAt: string | null;
    }>;
    recentSearches: string[];
  }>({
    companies: [],
    recentSearches: [],
  });

  // Prevenir layout shift quando o modal abre
  usePreventScrollShift(open);

  // Carregar buscas recentes do localStorage
  useEffect(() => {
    if (open) {
      const recent = localStorage.getItem("recentSearches");
      if (recent) {
        setResults((prev) => ({ ...prev, recentSearches: JSON.parse(recent) }));
      }
    }
  }, [open]);

  // Buscar empresas quando o usuário digita
  useEffect(() => {
    if (query.length < 2) {
      setResults((prev) => ({ ...prev, companies: [] }));
      return;
    }

    const timer = setTimeout(() => {
      fetch(`/api/companies?q=${encodeURIComponent(query)}&limit=5`)
        .then((r) => r.json())
        .then((data) => {
          setResults((prev) => ({ ...prev, companies: data }));
        })
        .catch(() => {});
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const saveRecentSearch = useCallback((searchQuery: string) => {
    const recent = localStorage.getItem("recentSearches");
    let searches: string[] = recent ? JSON.parse(recent) : [];
    
    // Adicionar no início e remover duplicatas
    searches = [searchQuery, ...searches.filter((s) => s !== searchQuery)].slice(0, 5);
    
    localStorage.setItem("recentSearches", JSON.stringify(searches));
  }, []);

  const handleSelect = useCallback(
    (value: string, type: "company" | "search") => {
      if (type === "company") {
        const company = results.companies.find((c) => c.slug === value || c.id === value);
        if (company) {
          router.push(`/company/${company.slug || company.id}`);
          saveRecentSearch(company.name);
        }
      } else {
        router.push(`/search?q=${encodeURIComponent(value)}`);
        saveRecentSearch(value);
      }
      onOpenChange(false);
      setQuery("");
    },
    [results.companies, router, onOpenChange, saveRecentSearch]
  );

  const handleSearchAll = useCallback(() => {
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      saveRecentSearch(query.trim());
      onOpenChange(false);
      setQuery("");
    }
  }, [query, router, onOpenChange, saveRecentSearch]);

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <VisuallyHidden>
        <DialogTitle>Buscar</DialogTitle>
      </VisuallyHidden>
      <CommandInput
        placeholder="Buscar empresas, reclamações..."
        value={query}
        onValueChange={setQuery}
        className="font-['Poppins']"
      />
      <CommandList>
        <CommandEmpty className="py-6 text-center text-sm font-['Poppins'] text-[#607D8B]">
          {query.length < 2 ? (
            "Digite pelo menos 2 caracteres para buscar"
          ) : (
            <div className="space-y-2">
              <p>Nenhum resultado encontrado</p>
              <button
                onClick={handleSearchAll}
                className="text-[#1E88E5] hover:underline font-medium"
              >
                Buscar &quot;{query}&quot; em tudo
              </button>
            </div>
          )}
        </CommandEmpty>

        {query.length >= 2 && results.companies.length > 0 && (
          <>
            <CommandGroup heading="Empresas" className="font-['Poppins']">
              {results.companies.map((company) => (
                <CommandItem
                  key={company.id}
                  value={company.slug || company.id}
                  onSelect={(value) => handleSelect(value, "company")}
                  className="font-['Poppins'] cursor-pointer"
                >
                  <div className="flex items-center gap-3 w-full">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1E88E5] to-[#1976D2] flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[#2A3F54] truncate">
                          {company.name}
                        </span>
                        {company.verifiedAt && (
                          <Badge className="bg-[#1E88E5] text-white hover:bg-[#1E88E5] px-1.5 py-0 text-[9px]">
                            VERIFICADA
                          </Badge>
                        )}
                      </div>
                      {company.sector && (
                        <span className="text-xs text-[#607D8B]">{company.sector}</span>
                      )}
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {query.length >= 2 && (
          <CommandGroup heading="Ações" className="font-['Poppins']">
            <CommandItem
              onSelect={handleSearchAll}
              className="font-['Poppins'] cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Search className="w-4 h-4 text-[#607D8B]" />
                <span>Buscar &quot;{query}&quot; em tudo</span>
              </div>
            </CommandItem>
          </CommandGroup>
        )}

        {query.length < 2 && results.recentSearches.length > 0 && (
          <CommandGroup heading="Buscas recentes" className="font-['Poppins']">
            {results.recentSearches.map((search, index) => (
              <CommandItem
                key={index}
                value={search}
                onSelect={(value) => handleSelect(value, "search")}
                className="font-['Poppins'] cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-[#607D8B]" />
                  <span>{search}</span>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {query.length < 2 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Atalhos" className="font-['Poppins']">
              <CommandItem
                onSelect={() => {
                  router.push("/companies");
                  onOpenChange(false);
                }}
                className="font-['Poppins'] cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Building2 className="w-4 h-4 text-[#607D8B]" />
                  <span>Ver todas as empresas</span>
                </div>
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  router.push("/search");
                  onOpenChange(false);
                }}
                className="font-['Poppins'] cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-4 h-4 text-[#607D8B]" />
                  <span>Busca avançada</span>
                </div>
              </CommandItem>
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  );
}
