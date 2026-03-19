"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { MessageSquare, Search, Filter, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { getComplaintStatusConfig } from "@/lib/constants/complaint-status";

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

    // Filtro de busca
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.title.toLowerCase().includes(query) ||
          c.description.toLowerCase().includes(query) ||
          c.problemLocation?.toLowerCase().includes(query)
      );
    }

    // Filtro de status
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

  const statusFilters = [
    { key: "ALL", label: "Todas", count: stats.total },
    { key: "OPEN", label: "Abertas", count: stats.open },
    { key: "RESPONDED", label: "Respondidas", count: stats.responded },
    { key: "RESOLVED", label: "Resolvidas", count: stats.resolved },
    { key: "CANCELLED", label: "Canceladas", count: stats.cancelled },
  ];

  return (
    <div className="min-h-screen bg-[#F5F7FA]">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <MessageSquare className="w-8 h-8 text-[#1E88E5]" />
            <h1 className="font-['Poppins'] text-3xl font-bold text-[#2A3F54]">
              Reclamações
            </h1>
          </div>
          <p className="font-['Poppins'] text-[#607D8B]">
            Gerencie as reclamações recebidas por {companyName}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-[#1E88E5]/10 flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-[#1E88E5]" />
                </div>
                <div>
                  <p className="font-['Poppins'] text-sm text-[#607D8B]">Total</p>
                  <p className="font-['Poppins'] text-2xl font-bold text-[#2A3F54]">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <p className="font-['Poppins'] text-sm text-[#607D8B]">Abertas</p>
                  <p className="font-['Poppins'] text-2xl font-bold text-[#2A3F54]">{stats.open}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                  <AlertCircle className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="font-['Poppins'] text-sm text-[#607D8B]">Respondidas</p>
                  <p className="font-['Poppins'] text-2xl font-bold text-[#2A3F54]">{stats.responded}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="font-['Poppins'] text-sm text-[#607D8B]">Resolvidas</p>
                  <p className="font-['Poppins'] text-2xl font-bold text-[#2A3F54]">{stats.resolved}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="border-0 shadow-md mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#607D8B]" />
                <Input
                  placeholder="Buscar por título, descrição ou localização..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 rounded-lg border-[#E5E5ED] font-['Poppins'] focus:border-[#1E88E5] focus:ring-2 focus:ring-[#1E88E5]/20"
                />
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2 flex-wrap">
                <Filter className="w-5 h-5 text-[#607D8B]" />
                {statusFilters.map((filter) => (
                  <button
                    key={filter.key}
                    onClick={() => setStatusFilter(filter.key)}
                    className={`px-4 py-2 rounded-lg font-['Poppins'] text-sm font-medium transition-all ${
                      statusFilter === filter.key
                        ? "bg-[#1E88E5] text-white shadow-md"
                        : "bg-white text-[#607D8B] hover:bg-gray-50 border border-[#E5E5ED]"
                    }`}
                  >
                    {filter.label} ({filter.count})
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Complaints List */}
        {filteredComplaints.length === 0 ? (
          <Card className="border-2 border-dashed border-[#E5E5ED] shadow-none">
            <CardContent className="px-6 py-16 text-center">
              <MessageSquare className="w-16 h-16 text-[#607D8B] mx-auto mb-4 opacity-50" />
              <h3 className="font-['Poppins'] text-xl font-semibold text-[#2A3F54] mb-2">
                Nenhuma reclamação encontrada
              </h3>
              <p className="text-sm font-['Poppins'] text-[#607D8B]">
                {searchQuery || statusFilter !== "ALL"
                  ? "Tente ajustar os filtros de busca."
                  : "Ainda não há reclamações registradas."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredComplaints.map((complaint) => {
              const statusConfig = getComplaintStatusConfig(complaint.status);
              const date = new Date(complaint.createdAt);

              return (
                <Link
                  key={complaint.id}
                  href={`/app/company/complaints/${complaint.id}`}
                  className="block group"
                >
                  <Card className="border-0 shadow-md transition-all hover:shadow-xl hover:-translate-y-1">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-['Poppins'] font-semibold text-lg text-[#2A3F54] mb-2 group-hover:text-[#1E88E5] transition-colors">
                            {complaint.title}
                          </h3>
                          <p className="font-['Poppins'] text-sm text-[#607D8B] line-clamp-2 mb-3">
                            {complaint.description}
                          </p>
                        </div>
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

                      <div className="flex items-center gap-4 text-xs font-['Poppins'] text-[#607D8B] flex-wrap">
                        {complaint.problemLocation && (
                          <>
                            <span className="flex items-center gap-1">
                              📍 {complaint.problemLocation}
                            </span>
                            <span>•</span>
                          </>
                        )}
                        {complaint.project && (
                          <>
                            <span>Projeto: {complaint.project.name}</span>
                            <span>•</span>
                          </>
                        )}
                        {!complaint.isAnonymous && complaint.author?.name && (
                          <>
                            <span>Por: {complaint.author.name}</span>
                            <span>•</span>
                          </>
                        )}
                        {complaint.isAnonymous && (
                          <>
                            <span>Anônima</span>
                            <span>•</span>
                          </>
                        )}
                        <span>{date.toLocaleDateString("pt-BR")}</span>
                        {complaint.isPublic && (
                          <>
                            <span>•</span>
                            <Badge className="bg-[#1E88E5]/10 text-[#1E88E5] hover:bg-[#1E88E5]/10 text-[10px] px-2 py-0">
                              Pública
                            </Badge>
                          </>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
