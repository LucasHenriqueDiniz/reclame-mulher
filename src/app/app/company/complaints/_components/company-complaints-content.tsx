"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  MessageSquare,
  Search,
  Clock,
  CheckCircle2,
  AlertCircle,
  XCircle,
  LayoutDashboard,
  FolderKanban,
  Building2,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { getComplaintStatusConfig } from "@/lib/constants/complaint-status";
import { CompanyPageShell } from "@/components/app/CompanyPageShell";
import { CompanyPageHeader } from "@/components/app/CompanyPageHeader";
import type { CompanyNavTab } from "@/components/app/CompanyPageHeader";

const COMPANY_TABS: CompanyNavTab[] = [
  { key: "dashboard", label: "Painel", href: "/app/company/dashboard", icon: LayoutDashboard },
  { key: "reclamacoes", label: "Reclamações", href: "/app/company/complaints", icon: MessageSquare },
  { key: "projetos", label: "Projetos", href: "/app/company/projects", icon: FolderKanban },
  { key: "perfil", label: "Perfil", href: "/app/company/profile", icon: Building2 },
];

interface Complaint {
  id: string;
  title: string;
  description: string;
  status: "OPEN" | "RESPONDED" | "RESOLVED" | "CANCELLED";
  createdAt: string;
  updatedAt: string | null;
  isPublic: boolean;
  isAnonymous: boolean;
  problemLocation: string | null;
  author: { name: string | null } | null;
  project: { name: string } | null;
}

interface MetricCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  active?: boolean;
  onClick?: () => void;
}

function MetricCard({ label, value, icon, color, bgColor, active, onClick }: MetricCardProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-xl p-5 transition-all border ${
        active
          ? "border-[#1E88E5] shadow-md ring-1 ring-[#1E88E5]/20"
          : "border-transparent shadow-sm hover:shadow-md hover:scale-[1.02]"
      }`}
      style={{ backgroundColor: bgColor }}
    >
      <div className="flex items-center justify-between mb-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: color + "20" }}
        >
          <span style={{ color }}>{icon}</span>
        </div>
        <span className="text-3xl font-bold font-['Poppins']" style={{ color }}>
          {value}
        </span>
      </div>
      <p className="font-['Poppins'] text-sm font-medium text-[#2A3F54]">{label}</p>
    </button>
  );
}

export function CompanyComplaintsContent({
  companyName,
  complaints,
}: {
  companyId: string;
  companyName: string;
  complaints: Complaint[];
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const filteredComplaints = useMemo(() => {
    let filtered = complaints;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.title.toLowerCase().includes(query) ||
          c.description.toLowerCase().includes(query) ||
          c.problemLocation?.toLowerCase().includes(query)
      );
    }
    if (statusFilter !== "ALL") {
      filtered = filtered.filter((c) => c.status === statusFilter);
    }
    return filtered;
  }, [complaints, searchQuery, statusFilter]);

  const stats = useMemo(() => {
    const total = complaints.length;
    const open = complaints.filter((c) => c.status === "OPEN").length;
    const responded = complaints.filter((c) => c.status === "RESPONDED").length;
    const resolved = complaints.filter((c) => c.status === "RESOLVED").length;
    const cancelled = complaints.filter((c) => c.status === "CANCELLED").length;
    return { total, open, responded, resolved, cancelled };
  }, [complaints]);

  const metricCards = [
    {
      key: "ALL",
      label: "Total",
      value: stats.total,
      icon: <MessageSquare className="w-5 h-5" />,
      color: "#1E88E5",
      bgColor: "#FFFFFF",
    },
    {
      key: "OPEN",
      label: "Sem resposta",
      value: stats.open,
      icon: <Clock className="w-5 h-5" />,
      color: "#F97316",
      bgColor: "#FFF7ED",
    },
    {
      key: "RESPONDED",
      label: "Respondidas",
      value: stats.responded,
      icon: <AlertCircle className="w-5 h-5" />,
      color: "#EAB308",
      bgColor: "#FEFCE8",
    },
    {
      key: "RESOLVED",
      label: "Resolvidas",
      value: stats.resolved,
      icon: <CheckCircle2 className="w-5 h-5" />,
      color: "#22C55E",
      bgColor: "#F0FDF4",
    },
    {
      key: "CANCELLED",
      label: "Canceladas",
      value: stats.cancelled,
      icon: <XCircle className="w-5 h-5" />,
      color: "#94A3B8",
      bgColor: "#F8FAFC",
    },
  ];

  return (
    <CompanyPageShell>
      <CompanyPageHeader
        title="Reclamações"
        subtitle={`Gerencie as reclamações recebidas por ${companyName}`}
        icon={<MessageSquare className="w-8 h-8" />}
        tabs={COMPANY_TABS}
        activeTab="reclamacoes"
      />

      {/* Dashboard Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
        {metricCards.map((card) => (
          <MetricCard
            key={card.key}
            label={card.label}
            value={card.value}
            icon={card.icon}
            color={card.color}
            bgColor={card.bgColor}
            active={statusFilter === card.key}
            onClick={() => setStatusFilter(card.key)}
          />
        ))}
      </div>

      {/* Alerta de reclamações pendentes */}
      {stats.open > 0 && (
        <Card className="border-0 shadow-md mb-6 bg-gradient-to-r from-orange-50 to-amber-50">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-orange-600" />
            </div>
            <div className="flex-1">
              <p className="font-['Poppins'] font-semibold text-[#2A3F54] text-sm">
                {stats.open} {stats.open === 1 ? "relato aguardando resposta" : "relatos aguardando resposta"}
              </p>
              <p className="font-['Poppins'] text-xs text-[#607D8B]">
                Responda rapidamente para melhorar sua avaliação
              </p>
            </div>
            <button
              onClick={() => setStatusFilter("OPEN")}
              className="flex items-center gap-1 text-sm font-medium text-orange-600 hover:text-orange-700 transition-colors"
            >
              Ver
              <ArrowRight className="w-4 h-4" />
            </button>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#607D8B]" />
          <Input
            placeholder="Buscar relato..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12 rounded-xl border-[#E5E5ED] font-['Poppins'] focus:border-[#1E88E5] focus:ring-2 focus:ring-[#1E88E5]/20 bg-white"
          />
        </div>
      </div>

      {/* Complaints List */}
      {filteredComplaints.length === 0 ? (
        <Card className="border-2 border-dashed border-[#E5E5ED] shadow-none">
          <CardContent className="px-6 py-16 text-center">
            <MessageSquare className="w-16 h-16 text-[#607D8B] mx-auto mb-4 opacity-50" />
            <h3 className="font-['Poppins'] text-xl font-semibold text-[#2A3F54] mb-2">
              Nenhum relato encontrado
            </h3>
            <p className="text-sm font-['Poppins'] text-[#607D8B]">
              {searchQuery || statusFilter !== "ALL"
                ? "Tente ajustar os filtros de busca."
                : "Ainda não há relatos registrados."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredComplaints.map((complaint) => {
            const statusConfig = getComplaintStatusConfig(complaint.status);
            const date = new Date(complaint.createdAt);

            return (
              <Link
                key={complaint.id}
                href={`/app/company/complaints/${complaint.id}`}
                className="block group"
              >
                <Card className="border border-gray-100 shadow-sm transition-all hover:shadow-lg hover:border-[#1E88E5]/30">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-['Poppins'] font-semibold text-base text-[#2A3F54] group-hover:text-[#1E88E5] transition-colors truncate">
                            {complaint.title}
                          </h3>
                          {complaint.isPublic && (
                            <Badge className="bg-[#1E88E5]/10 text-[#1E88E5] hover:bg-[#1E88E5]/10 text-[10px] px-2 py-0 flex-shrink-0">
                              Pública
                            </Badge>
                          )}
                        </div>
                        <p className="font-['Poppins'] text-sm text-[#607D8B] line-clamp-1 mb-3">
                          {complaint.description}
                        </p>
                        <div className="flex items-center gap-3 text-xs font-['Poppins'] text-[#607D8B] flex-wrap">
                          {complaint.problemLocation && (
                            <span className="flex items-center gap-1">
                              📍 {complaint.problemLocation}
                            </span>
                          )}
                          {complaint.project && (
                            <span>Projeto: {complaint.project.name}</span>
                          )}
                          {!complaint.isAnonymous && complaint.author?.name ? (
                            <span>Por: {complaint.author.name}</span>
                          ) : (
                            <span className="text-gray-400">Anônima</span>
                          )}
                          <span>{date.toLocaleDateString("pt-BR")}</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <Badge
                          className="font-['Poppins'] font-bold text-xs flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full border whitespace-nowrap"
                          style={{
                            backgroundColor: statusConfig.bgColor,
                            color: statusConfig.color,
                            borderColor: statusConfig.borderColor,
                          }}
                        >
                          {statusConfig.label}
                        </Badge>
                        <span className="text-xs text-[#AD92FF] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                          Ver detalhes →
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </CompanyPageShell>
  );
}
