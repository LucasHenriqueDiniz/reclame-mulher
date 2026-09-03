"use client";

import { useState, useMemo } from "react";
import { CompanyComplaintCtaCard, CompanyProjectList, SearchInput } from "@/components/company";
import { type Project } from "./types";

export function ProjectsTab({
  projects,
  companyId,
  isLoggedIn,
}: {
  projects: Project[];
  companyId: string;
  isLoggedIn: boolean;
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const filtered = useMemo(() => {
    let list = projects;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description?.toLowerCase().includes(q) ?? false) ||
          (p.location?.toLowerCase().includes(q) ?? false)
      );
    }
    if (statusFilter !== "ALL") {
      list = list.filter((p) => p.status === statusFilter);
    }
    return list;
  }, [projects, search, statusFilter]);

  const statusOpts = [
    { key: "ALL", label: "Todos" },
    { key: "PLANNING", label: "Planejamento" },
    { key: "IN_PROGRESS", label: "Em andamento" },
    { key: "COMPLETED", label: "Concluído" },
    { key: "CANCELLED", label: "Cancelado" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-3 flex-wrap items-center">
        <SearchInput value={search} onChange={setSearch} placeholder="Buscar projetos..." />
        <div className="flex gap-2 flex-wrap">
          {statusOpts.map((o) => (
            <button
              key={o.key}
              type="button"
              onClick={() => setStatusFilter(o.key)}
              className={`px-4 py-2 rounded-full text-[13px] font-medium cursor-pointer transition-all border ${
                statusFilter === o.key
                  ? "bg-[#1E88E5] text-white border-[#1E88E5] shadow-md"
                  : "bg-white text-[#2A3F54] border-gray-200 hover:bg-gray-50"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>
      <CompanyProjectList
        projects={filtered}
        companyId={companyId}
        isLoggedIn={isLoggedIn}
        onComplaintClick={(projectId) => {
          window.location.href = isLoggedIn
            ? `/app/complaints/new?company=${companyId}&project=${projectId}`
            : "/login";
        }}
      />
      <CompanyComplaintCtaCard companyId={companyId} isLoggedIn={isLoggedIn} />
    </div>
  );
}
