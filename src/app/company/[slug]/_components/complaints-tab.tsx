"use client";

import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { CompanyComplaintList, CompanyPerformanceCard, type CompanyStats } from "@/components/company";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { type Complaint } from "./types";

export function ComplaintsTab({
  complaints,
  stats,
  isLoggedIn,
  companyId,
}: {
  complaints: Complaint[];
  stats: CompanyStats;
  isLoggedIn: boolean;
  companyId: string;
}) {
  const [filter, setFilter] = useState("ALL");
  const filtered =
    filter === "ALL"
      ? complaints
      : complaints.filter((c) => c.status === filter);

  const filters = [
    { key: "ALL", label: "Todas", count: stats.totalComplaints },
    { key: "OPEN", label: "Abertas", count: complaints.filter((c) => c.status === "OPEN").length },
    { key: "RESPONDED", label: "Respondidas", count: complaints.filter((c) => c.status === "RESPONDED").length },
    { key: "RESOLVED", label: "Resolvidas", count: complaints.filter((c) => c.status === "RESOLVED").length },
    { key: "CANCELLED", label: "Canceladas", count: complaints.filter((c) => c.status === "CANCELLED").length },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-2 flex-wrap items-center">
        {filters.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-full text-[13px] font-medium cursor-pointer transition-all border ${
              filter === f.key
                ? "bg-[#1E88E5] text-white border-[#1E88E5] shadow-md"
                : "bg-white text-[#2A3F54] border-gray-200 hover:bg-gray-50"
            }`}
          >
            {f.label} ({f.count})
          </button>
        ))}
        {isLoggedIn && (
          <Link href={`/app/complaints/new?company=${companyId}`} className="ml-auto">
            <Button className="bg-[#1E88E5] hover:bg-[#1976D2] text-sm gap-1">
              <MessageCircle className="w-4 h-4" />
              Reclamar
            </Button>
          </Link>
        )}
      </div>
      <CompanyComplaintList
        complaints={filtered.map((c) => ({
          id: c.id,
          title: c.title,
          status: c.status,
          createdAt: c.createdAt,
          isAnonymous: c.isAnonymous,
          author: c.author,
          project: c.project,
        }))}
        detailBasePath="/app/complaints"
        showAuthor={true}
      />
      <CompanyPerformanceCard stats={stats} />
    </div>
  );
}
