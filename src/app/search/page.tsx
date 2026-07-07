"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Building2, MessageSquare, Loader2, CheckCircle2, MapPin, BarChart2, AlertTriangle, TrendingUp, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MainHeader } from "@/components/layout/MainHeader";
import { Footer } from "@/components/landing/Footer";
import { getComplaintStatusConfig } from "@/lib/constants/complaint-status";

interface SearchResults {
  companies: Array<{
    id: string;
    name: string;
    corporateName: string | null;
    sector: string | null;
    region: string | null;
    verifiedAt: Date | null;
    slug: string | null;
    stats: {
      totalProjects: number;
      activeProjects: number;
      totalComplaints: number;
      resolvedComplaints: number;
      resolutionRate: number;
    };
  }>;
  complaints: Array<{
    id: string;
    title: string;
    description: string;
    status: "OPEN" | "RESPONDED" | "RESOLVED" | "CANCELLED";
    createdAt: string;
    companyName: string | null;
    authorName: string | null;
  }>;
  total: number;
}

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [query, setQuery] = useState(searchParams.get("q") || "");
  const [scope, setScope] = useState<"all" | "companies" | "complaints">(
    (searchParams.get("scope") as "all" | "companies" | "complaints") || "all"
  );
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const q = searchParams.get("q");
    const s = searchParams.get("scope");
    
    if (q) {
      setQuery(q);
      setScope((s as "all" | "companies" | "complaints") || "all");
      performSearch(q, (s as "all" | "companies" | "complaints") || "all");
    }
  }, [searchParams]);

  const performSearch = async (searchQuery: string, searchScope: string) => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    setSearched(true);
    
    try {
      const response = await fetch(
        `/api/search?q=${encodeURIComponent(searchQuery)}&scope=${searchScope}&limit=20`
      );
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error("Search error:", error);
      setResults({ companies: [], complaints: [], total: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (!query.trim()) return;
    
    const params = new URLSearchParams();
    params.set("q", query);
    if (scope !== "all") params.set("scope", scope);
    router.push(`/search?${params.toString()}`);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <main className="min-h-screen bg-[#F5F7FA]">
      <MainHeader />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#1E88E5] to-[#1976D2] pt-20 pb-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-4">
            <Search className="w-6 h-6 text-white/90" />
            <p className="text-sm font-semibold uppercase tracking-wider text-white/90 font-['Poppins']">
              Busca
            </p>
          </div>
          
          <h1 className="font-['Poppins'] max-w-3xl text-4xl font-bold text-white sm:text-5xl leading-tight">
            Encontre empresas e relatos
          </h1>

          <p className="mt-4 text-lg text-white/90 font-['Poppins']">
            Busque por nome de empresa, título de relato ou palavras-chave
          </p>

          {/* Search Form */}
          <Card className="mt-8 border-0 shadow-xl">
            <CardContent className="p-4">
              <div className="flex flex-col gap-3">
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#607D8B]" />
                    <Input
                      placeholder="Digite sua busca..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      onKeyDown={handleKeyPress}
                      className="h-12 pl-10 rounded-lg border-[#E5E5ED] font-['Poppins'] text-base focus:border-[#1E88E5] focus:ring-2 focus:ring-[#1E88E5]/20"
                    />
                  </div>
                  <Button 
                    onClick={handleSearch}
                    disabled={!query.trim() || loading}
                    className="h-12 px-8 bg-[#1E88E5] hover:bg-[#1976D2] font-['Poppins'] font-semibold shadow-md"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      "Buscar"
                    )}
                  </Button>
                </div>

                {/* Scope Tabs */}
                <div className="flex gap-2">
                  {[
                    { value: "all", label: "Tudo", icon: Search },
                    { value: "companies", label: "Empresas", icon: Building2 },
                    { value: "complaints", label: "Reclamações", icon: MessageSquare },
                  ].map((tab) => {
                    const Icon = tab.icon;
                    const isActive = scope === tab.value;
                    return (
                      <button
                        key={tab.value}
                        onClick={() => setScope(tab.value as typeof scope)}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-lg font-['Poppins'] text-sm font-medium transition-all ${
                          isActive
                            ? "bg-[#1E88E5] text-white shadow-md"
                            : "bg-white text-[#607D8B] hover:bg-gray-50"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Results Section */}
      <section className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-12 h-12 text-[#1E88E5] animate-spin mb-4" />
            <p className="font-['Poppins'] text-[#607D8B]">Buscando...</p>
          </div>
        )}

        {!loading && searched && results && (
          <>
            {/* Results Header */}
            <div className="mb-8">
              <h2 className="font-['Poppins'] text-2xl font-semibold text-[#2A3F54]">
                Resultados para &quot;{query}&quot;
              </h2>
              <p className="mt-2 text-sm font-['Poppins'] text-[#607D8B]">
                {results.total} {results.total === 1 ? "resultado encontrado" : "resultados encontrados"}
                {scope !== "all" && ` em ${scope === "companies" ? "empresas" : "reclamações"}`}
              </p>
            </div>

            {results.total === 0 ? (
              <Card className="border-2 border-dashed border-[#E5E5ED] shadow-none">
                <CardContent className="px-6 py-16 text-center">
                  <Search className="w-16 h-16 text-[#607D8B] mx-auto mb-4 opacity-50" />
                  <h3 className="font-['Poppins'] text-xl font-semibold text-[#2A3F54] mb-2">
                    Nenhum resultado encontrado
                  </h3>
                  <p className="text-sm font-['Poppins'] text-[#607D8B]">
                    Tente usar outras palavras-chave ou verifique a ortografia.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-8">
                {/* Companies Results */}
                {results.companies.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <Building2 className="w-5 h-5 text-[#1E88E5]" />
                      <h3 className="font-['Poppins'] text-lg font-semibold text-[#2A3F54]">
                        Empresas ({results.companies.length})
                      </h3>
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-2">
                      {results.companies.map((company) => (
                        <Link
                          key={company.id}
                          href={`/company/${company.slug ?? company.id}`}
                          className="group block"
                        >
                          <Card className="border-0 shadow-md transition-all hover:shadow-xl hover:-translate-y-1 overflow-hidden">
                            <CardContent className="p-0">
                              {/* Header */}
                              <div className="flex items-center gap-3 px-4 py-4 border-b border-[#E5E5ED]">
                                <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-[#1E88E5] to-[#1976D2] flex items-center justify-center flex-shrink-0">
                                  <Building2 className="w-7 h-7 text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-['Poppins'] font-semibold text-lg text-[#2A3F54] truncate group-hover:text-[#1E88E5] transition-colors">
                                      {company.name}
                                    </h4>
                                    {company.verifiedAt && (
                                      <Badge className="bg-[#1E88E5] text-white hover:bg-[#1E88E5] px-2 py-0.5">
                                        <span className="text-[10px] font-bold uppercase">Verificada</span>
                                      </Badge>
                                    )}
                                  </div>
                                  {company.corporateName && (
                                    <p className="mt-0.5 text-xs font-['Poppins'] text-[#607D8B] truncate">
                                      {company.corporateName}
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Stats Grid */}
                              <div className="grid grid-cols-2 gap-px bg-[#E5E5ED]">
                                {/* Projetos */}
                                <div className="bg-white px-3 py-2.5 flex items-center gap-2">
                                  <BarChart2 className="w-4 h-4 text-[#607D8B] flex-shrink-0" />
                                  <span className="text-xs font-['Poppins'] text-[#607D8B] truncate">
                                    {company.stats.activeProjects} projeto{company.stats.activeProjects !== 1 ? 's' : ''} ativo{company.stats.activeProjects !== 1 ? 's' : ''}
                                  </span>
                                </div>

                                {/* Localização */}
                                <div className="bg-white px-3 py-2.5 flex items-center gap-2">
                                  <MapPin className="w-4 h-4 text-[#607D8B] flex-shrink-0" />
                                  <span className="text-xs font-['Poppins'] text-[#607D8B] truncate">
                                    {company.region || 'Não informado'}
                                  </span>
                                </div>

                                {/* Taxa de Resolução */}
                                <div className="bg-white px-3 py-2.5 flex items-center gap-2">
                                  <CheckCircle2 className="w-4 h-4 text-[#607D8B] flex-shrink-0" />
                                  <span className="text-xs font-['Poppins'] text-[#607D8B]">
                                    {company.stats.resolutionRate}% de resolução
                                  </span>
                                  {company.stats.resolutionRate < 50 && (
                                    <AlertTriangle className="w-4 h-4 text-orange-500 flex-shrink-0" />
                                  )}
                                </div>

                                {/* Setor */}
                                <div className="bg-white px-3 py-2.5 flex items-center gap-2">
                                  <TrendingUp className="w-4 h-4 text-[#607D8B] flex-shrink-0" />
                                  <span className="text-xs font-['Poppins'] text-[#607D8B] truncate">
                                    {company.sector || 'Não informado'}
                                  </span>
                                </div>
                              </div>

                              {/* Progress Bar */}
                              <div className="px-4 py-3 bg-gray-50">
                                <div className="flex items-center justify-between mb-1.5">
                                  <span className="text-xs font-['Poppins'] text-[#607D8B]">
                                    Taxa de resolução
                                  </span>
                                  <span className="text-xs font-['Poppins'] font-semibold text-[#2A3F54]">
                                    {company.stats.resolutionRate}%
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                  <div
                                    className="h-full rounded-full transition-all"
                                    style={{
                                      width: `${company.stats.resolutionRate}%`,
                                      backgroundColor: company.stats.resolutionRate >= 70 ? '#1E88E5' : company.stats.resolutionRate >= 40 ? '#F97316' : '#EF4444',
                                    }}
                                  />
                                </div>
                              </div>

                              {/* Footer Stats */}
                              <div className="flex items-center justify-center gap-4 px-4 py-3 border-t border-[#E5E5ED]">
                                <div className="flex items-center gap-1.5">
                                  <MessageSquare className="w-4 h-4 text-[#607D8B]" />
                                  <span className="text-xs font-['Poppins'] text-[#607D8B]">
                                    {company.stats.totalComplaints} reclamações
                                  </span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <CheckCircle2 className="w-4 h-4 text-[#607D8B]" />
                                  <span className="text-xs font-['Poppins'] text-[#607D8B]">
                                    {company.stats.resolvedComplaints} resolvidas
                                  </span>
                                </div>
                              </div>

                              {/* Action Button */}
                              <div className="border-t border-[#E5E5ED]">
                                <button className="w-full px-4 py-3 flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors">
                                  <span className="font-['Poppins'] font-semibold text-sm text-[#1E88E5]">
                                    Ver detalhes
                                  </span>
                                  <ChevronRight className="w-4 h-4 text-[#1E88E5]" />
                                </button>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Complaints Results */}
                {results.complaints.length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-4">
                      <MessageSquare className="w-5 h-5 text-[#1E88E5]" />
                      <h3 className="font-['Poppins'] text-lg font-semibold text-[#2A3F54]">
                        Reclamações ({results.complaints.length})
                      </h3>
                    </div>
                    
                    <div className="space-y-3">
                      {results.complaints.map((complaint) => {
                        const statusConfig = getComplaintStatusConfig(complaint.status);
                        const date = new Date(complaint.createdAt);
                        
                        return (
                          <Link
                            key={complaint.id}
                            href={`/app/complaints/${complaint.id}`}
                            className="group block"
                          >
                            <Card className="border-0 shadow-md transition-all hover:shadow-xl hover:-translate-y-0.5">
                              <CardContent className="p-5">
                                <div className="flex items-start justify-between gap-3 mb-2">
                                  <h4 className="font-['Poppins'] font-semibold text-base text-[#2A3F54] flex-1 group-hover:text-[#1E88E5] transition-colors">
                                    {complaint.title}
                                  </h4>
                                  <Badge 
                                    className="font-['Poppins'] font-bold text-xs flex items-center justify-center gap-2.5 px-3 py-1.5 rounded-full border whitespace-nowrap"
                                    style={{ 
                                      backgroundColor: statusConfig.bgColor,
                                      color: statusConfig.color,
                                      borderColor: statusConfig.borderColor,
                                    }}
                                  >
                                    {statusConfig.label}
                                  </Badge>
                                </div>

                                <p className="text-sm font-['Poppins'] text-[#607D8B] line-clamp-2 mb-3">
                                  {complaint.description}
                                </p>

                                <div className="flex items-center gap-3 text-xs font-['Poppins'] text-[#607D8B]">
                                  {complaint.companyName && (
                                    <span>{complaint.companyName}</span>
                                  )}
                                  <span>•</span>
                                  <span>{date.toLocaleDateString("pt-BR")}</span>
                                </div>
                              </CardContent>
                            </Card>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {!searched && !loading && (
          <Card className="border-2 border-dashed border-[#E5E5ED] shadow-none">
            <CardContent className="px-6 py-16 text-center">
              <Search className="w-16 h-16 text-[#607D8B] mx-auto mb-4 opacity-50" />
              <h3 className="font-['Poppins'] text-xl font-semibold text-[#2A3F54] mb-2">
                Digite algo para buscar
              </h3>
              <p className="text-sm font-['Poppins'] text-[#607D8B]">
                Busque por empresas, reclamações ou palavras-chave
              </p>
            </CardContent>
          </Card>
        )}
      </section>

      <Footer />
    </main>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F5F7FA] flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#1E88E5] animate-spin" />
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
