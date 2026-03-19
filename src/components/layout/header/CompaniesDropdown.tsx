"use client";

import Link from "next/link";
import { Building2, CheckCircle2, ArrowRight } from "lucide-react";
import { useHeaderData } from "@/lib/stores/header-data-store";

export function CompaniesDropdown() {
  const { companies, isLoading } = useHeaderData();

  if (isLoading) {
    return (
      <div className="w-[500px] p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-[500px] p-6">
      <div className="mb-4">
        <h3 className="font-['Poppins'] text-lg font-bold text-[#2A3F54] mb-2">
          Empresas em Destaque
        </h3>
        <p className="font-['Poppins'] text-sm text-[#607D8B]">
          Empresas verificadas com melhor taxa de resolução
        </p>
      </div>

      <div className="space-y-3 mb-4">
        {companies.map((company) => (
          <Link
            key={company.id}
            href={`/company/${company.slug}`}
            className="block p-4 rounded-lg hover:bg-gray-50 transition-colors border border-transparent hover:border-[#E5E5ED]"
          >
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#1E88E5] to-[#1976D2] flex items-center justify-center flex-shrink-0">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-['Poppins'] font-semibold text-sm text-[#2A3F54] truncate">
                    {company.name}
                  </h4>
                  <CheckCircle2 className="w-4 h-4 text-[#1E88E5] flex-shrink-0" />
                </div>
                <p className="font-['Poppins'] text-xs text-[#607D8B] mb-2">
                  {company.sector} • {company.region}
                </p>
                <div className="flex items-center gap-3 text-xs">
                  <span className="font-['Poppins'] text-green-600 font-medium">
                    {company.stats.resolutionRate}% resolvidas
                  </span>
                  <span className="text-[#607D8B]">•</span>
                  <span className="font-['Poppins'] text-[#607D8B]">
                    Responde em {company.stats.avgResponseTime}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <Link
        href="/companies"
        className="flex items-center justify-center gap-2 w-full py-3 px-4 bg-[#1E88E5] hover:bg-[#1976D2] text-white rounded-lg font-['Poppins'] font-semibold text-sm transition-colors"
      >
        Ver todas as empresas
        <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  );
}
