"use client";

import { BarChart3, MapPin, FileText, Shield } from "lucide-react";
import { type CompanyStats } from "@/components/company";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { type Company } from "./types";

export function CompanyHero({
  company,
  stats,
  isMember,
  isVerified,
  dashboardLink,
  complaintCtaHref,
  tabs,
  activeTab,
  onTabChange,
}: {
  company: Company;
  stats: CompanyStats;
  isMember: boolean;
  isVerified: boolean;
  dashboardLink?: string;
  complaintCtaHref?: string;
  tabs: { key: string; label: string; count?: number }[];
  activeTab: string;
  onTabChange: (key: string) => void;
}) {
  const region = company.region ?? ([company.city, company.state].filter(Boolean).join(", ") || null);
  const projectsCount = stats.activeProjectsCount ?? 0;

  return (
    <div className="bg-gradient-to-br from-[#1E88E5] to-[#1565C0]">
      <div className="max-w-[960px] mx-auto px-6 pt-8 pb-4">
        {/* Header row */}
        <div className="flex items-start gap-5 flex-wrap mb-6">
          {/* Avatar */}
          <div className="w-[72px] h-[72px] rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-white text-[28px] font-bold flex-shrink-0 overflow-hidden">
            {company.logoUrl ? (
              <img src={String(company.logoUrl)} alt="" className="w-full h-full object-cover" />
            ) : (
              String(company.name ?? "E").charAt(0).toUpperCase()
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="text-[22px] font-bold text-white m-0">
                {String(company.name ?? "")}
              </h1>
              {isVerified && (
                <Badge className="bg-white/25 text-white border-0 text-[11px] font-bold px-2 py-0.5 hover:bg-white/25">
                  <Shield className="w-3 h-3 mr-1" />
                  VERIFICADA
                </Badge>
              )}
              {isMember && (
                <Badge className="bg-white/25 text-white border-0 text-[11px] font-bold px-2 py-0.5 hover:bg-white/25">
                  MEMBRO
                </Badge>
              )}
            </div>

            {region && (
              <div className="flex items-center gap-1.5 text-[13px] text-white/90 mb-0.5">
                <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{region}</span>
              </div>
            )}

            <div className="flex items-center gap-1.5 text-[13px] text-white/85">
              <BarChart3 className="w-3.5 h-3.5 flex-shrink-0" />
              <span>
                {projectsCount} {projectsCount === 1 ? "projeto" : "projetos"} em andamento
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {dashboardLink && (
              <Link href={dashboardLink}>
                <Button
                  variant="outline"
                  className="bg-transparent border-white/50 text-white hover:bg-white/10 hover:text-white text-[13px] font-semibold"
                >
                  Painel da empresa →
                </Button>
              </Link>
            )}
            {complaintCtaHref && (
              <Link href={complaintCtaHref}>
                <Button className="bg-white text-[#1E88E5] hover:bg-gray-100 text-sm font-semibold gap-2">
                  <FileText className="w-4 h-4" />
                  Reclamar
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 flex-wrap items-center">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => onTabChange(t.key)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 text-[13px] font-semibold rounded-t-xl transition-all cursor-pointer border-none ${
                activeTab === t.key
                  ? "bg-white text-[#1E88E5]"
                  : "bg-transparent text-white/85 hover:text-white"
              }`}
            >
              {t.label}
              {t.count != null && (
                <span className={`text-[11px] px-1.5 py-0.5 rounded-full font-bold ${
                  activeTab === t.key ? "bg-[#1E88E5]/10 text-[#1E88E5]" : "bg-white/20 text-white"
                }`}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
