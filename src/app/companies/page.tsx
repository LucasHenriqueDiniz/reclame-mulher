import Link from "next/link";
import { Building2, MapPin, CheckCircle2, TrendingUp } from "lucide-react";

import { MainHeader } from "@/components/layout/MainHeader";
import { Footer } from "@/components/landing/Footer";
import { CompaniesRepo } from "@/server/repos/companies";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

function formatLocation(region: string | null, city: string | null, state: string | null) {
  return region ?? ([city, state].filter(Boolean).join(", ") || null);
}

export default async function CompaniesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; verified?: string; category?: string }>;
}) {
  const { q, verified, category } = await searchParams;
  const query = q?.trim() || category?.trim() || "";
  const verifiedOnly = verified === "true";
  const companies = await CompaniesRepo.findPublic(query || undefined, verifiedOnly);

  // Verified first, then by name
  const sortedCompanies = [...companies].sort((a, b) => {
    if (a.verifiedAt && !b.verifiedAt) return -1;
    if (!a.verifiedAt && b.verifiedAt) return 1;
    return a.name.localeCompare(b.name);
  });

  const verifiedCount = companies.filter(c => c.verifiedAt).length;
  const totalCount = companies.length;

  return (
    <main className="min-h-screen bg-[#F5F7FA]">
      <MainHeader />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#1E88E5] to-[#1976D2] pt-28 pb-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-6 h-6 text-white/90" />
            <p className="text-sm font-semibold uppercase tracking-wider text-white/90">
              Empresas
            </p>
          </div>
          
          <h1 className="font-['Poppins'] max-w-3xl text-4xl font-bold text-white sm:text-5xl leading-tight">
            Encontre empresas e veja suas avaliações
          </h1>
          
          <p className="mt-4 max-w-2xl text-lg text-white/90">
            Pesquise por empresa, órgão ou categoria e acesse projetos, indicadores e reclamações públicas.
          </p>

          {/* Search Form */}
          <form action="/empresas" method="get" className="mt-8">
            <Card className="border-0 shadow-xl">
              <CardContent className="p-4">
                <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto]">
                  <label htmlFor="company-search" className="sr-only">Buscar empresa ou órgão</label>
                  <input
                    id="company-search"
                    type="search"
                    name="q"
                    defaultValue={query}
                    placeholder="Buscar empresa ou órgão..."
                    className="h-12 rounded-lg border border-[#E5E5ED] bg-white px-4 text-sm font-['Poppins'] outline-none transition focus:border-[#1E88E5] focus:ring-2 focus:ring-[#1E88E5]/20"
                    aria-label="Buscar empresa ou órgão"
                  />

                  <label className="flex h-12 items-center gap-2 rounded-lg border border-[#E5E5ED] bg-white px-4 text-sm font-['Poppins'] text-[#2A3F54] cursor-pointer hover:bg-gray-50 transition">
                    <input
                      type="checkbox"
                      name="verified"
                      value="true"
                      defaultChecked={verifiedOnly}
                      className="w-4 h-4 text-[#1E88E5] rounded focus:ring-[#1E88E5]"
                      aria-label="Filtrar apenas empresas verificadas"
                    />
                    Apenas verificadas
                  </label>
                  
                  <button
                    type="submit"
                    className="h-12 rounded-lg bg-[#1E88E5] px-8 text-sm font-semibold font-['Poppins'] text-white transition hover:bg-[#1976D2] shadow-md hover:shadow-lg"
                  >
                    Buscar
                  </button>
                </div>
              </CardContent>
            </Card>
          </form>

          {/* Stats */}
          <div className="mt-6 flex flex-wrap gap-4">
            <div className="flex items-center gap-2 text-white/90">
              <Building2 className="w-5 h-5" />
              <span className="text-sm font-['Poppins']">
                <strong className="font-semibold">{totalCount}</strong> empresas
              </span>
            </div>
            <div className="flex items-center gap-2 text-white/90">
              <CheckCircle2 className="w-5 h-5" />
              <span className="text-sm font-['Poppins']">
                <strong className="font-semibold">{verifiedCount}</strong> verificadas
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Results Section */}
      <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h2 className="font-['Poppins'] text-2xl font-semibold text-[#2A3F54]">
            {query ? `Resultados para "${query}"` : "Todas as empresas"}
          </h2>
          <p className="mt-2 text-sm font-['Poppins'] text-[#607D8B]">
            {totalCount} {totalCount === 1 ? "empresa encontrada" : "empresas encontradas"}
            {verifiedCount > 0 && ` • ${verifiedCount} verificada${verifiedCount > 1 ? 's' : ''}`}
          </p>
        </div>

        {sortedCompanies.length === 0 ? (
          <Card className="border-2 border-dashed border-[#E5E5ED] shadow-none">
            <CardContent className="px-6 py-16 text-center">
              <Building2 className="w-16 h-16 text-[#607D8B] mx-auto mb-4 opacity-50" />
              <h3 className="font-['Poppins'] text-xl font-semibold text-[#2A3F54] mb-2">
                Nenhuma empresa encontrada
              </h3>
              <p className="text-sm font-['Poppins'] text-[#607D8B]">
                Tente outro termo de busca ou remova o filtro de verificação.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {sortedCompanies.map((company) => {
              const href = `/company/${company.slug ?? company.id}`;
              const location = formatLocation(company.region, company.city, company.state);

              return (
                <Link
                  key={company.id}
                  href={href}
                  className="group block"
                >
                  <Card className="h-full border-0 shadow-md transition-all hover:shadow-xl hover:-translate-y-1">
                    <CardContent className="p-6">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-3 mb-4">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-['Poppins'] font-semibold text-lg text-[#2A3F54] truncate group-hover:text-[#1E88E5] transition-colors">
                            {company.name}
                          </h3>
                          {company.corporateName && (
                            <p className="mt-1 text-xs font-['Poppins'] text-[#607D8B] truncate">
                              {company.corporateName}
                            </p>
                          )}
                        </div>
                        
                        {company.verifiedAt && (
                          <Badge className="bg-[#E3F2FD] text-[#1E88E5] border-[#1E88E5]/20 hover:bg-[#E3F2FD] flex items-center gap-1 px-2 py-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span className="text-[10px] font-semibold uppercase">Verificada</span>
                          </Badge>
                        )}
                      </div>

                      {/* Info */}
                      <div className="space-y-2">
                        {company.sector && (
                          <div className="flex items-center gap-2 text-sm font-['Poppins'] text-[#607D8B]">
                            <TrendingUp className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{company.sector}</span>
                          </div>
                        )}
                        
                        {location && (
                          <div className="flex items-center gap-2 text-sm font-['Poppins'] text-[#607D8B]">
                            <MapPin className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{location}</span>
                          </div>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="mt-4 pt-4 border-t border-[#E5E5ED]">
                        <span className="inline-flex items-center gap-1.5 text-sm font-['Poppins'] font-medium text-[#1E88E5] group-hover:gap-2 transition-all">
                          Ver perfil
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <Footer />
    </main>
  );
}
