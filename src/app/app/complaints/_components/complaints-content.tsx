"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  MessageCircle,
  Settings as SettingsIcon,
  PlusSquare,
  ChevronRight,
  Clock,
  Meh,
  Smile,
  Laugh,
  BarChart2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { protocolId } from "@/components/company/utils";
import { getComplaintStatusConfig, type ComplaintStatus } from "@/lib/constants/complaint-status";
import { AppPageShell } from "@/components/app/AppPageShell";
import { ProfileHero } from "@/components/app/ProfileHero";
import { ContentCard } from "@/components/app/ContentCard";
import { FilterTabs } from "@/components/app/FilterTabs";
import type { PageTabItem } from "@/components/app/PageTabs";
import type { StatItem } from "@/components/app/ProfileHero";
import type { FilterTabItem } from "@/components/app/FilterTabs";

interface Complaint {
  id: string;
  title: string;
  description: string;
  status: ComplaintStatus;
  createdAt: string;
  updatedAt: string;
  company: {
    id: string;
    name: string;
    logoUrl?: string | null;
  } | null;
  project: {
    id: string;
    name: string;
  } | null;
}

interface Props {
  complaints: Complaint[];
  profileName: string;
  profileCity: string | null;
  profileState: string | null;
  avatarUrl: string | null;
}

const PROFILE_TABS: PageTabItem[] = [
  { key: "reclamacoes", label: "Reclamações", icon: MessageCircle, href: "/app/complaints" },
  { key: "configuracoes", label: "Configurações", icon: SettingsIcon, href: "/app/settings" },
];

const FILTER_TABS: FilterTabItem[] = [
  { id: "ultimas", label: "Últimas", icon: Clock, color: "#1E88E5" },
  { id: "nao-respondidas", label: "Não Respondidas", icon: Meh, color: "#607D8B" },
  { id: "respondidas", label: "Respondidas", icon: Smile, color: "#26A69A" },
  { id: "concluidas", label: "Concluídas", icon: Laugh, color: "#26A69A" },
];

type FilterTabId = "ultimas" | "nao-respondidas" | "respondidas" | "concluidas";

export function ComplaintsContent({
  complaints,
  profileName,
  profileCity,
  profileState,
  avatarUrl,
}: Props) {
  const [activeFilterTab, setActiveFilterTab] = useState<FilterTabId>("ultimas");

  const stats: StatItem[] = [
    {
      icon: BarChart2,
      label: complaints.length === 1 ? "Reclamação" : "Reclamações",
      value: complaints.length,
    },
  ];

  const filteredComplaints = useMemo(() => {
    switch (activeFilterTab) {
      case "nao-respondidas":
        return complaints.filter((c) => c.status === "OPEN");
      case "respondidas":
        return complaints.filter((c) => c.status === "RESPONDED");
      case "concluidas":
        return complaints.filter((c) => c.status === "RESOLVED" || c.status === "CANCELLED");
      case "ultimas":
      default:
        return complaints;
    }
  }, [complaints, activeFilterTab]);

  return (
    <AppPageShell>
      <ProfileHero
        name={profileName}
        city={profileCity}
        state={profileState}
        avatarUrl={avatarUrl}
        tabs={PROFILE_TABS}
        activeTabKey="reclamacoes"
        stats={stats}
        actionButton={{
          label: "Começar uma nova reclamação",
          href: "/app/complaints/new",
        }}
      />

      {/* Complaints List */}
      <div className="mt-5">
        {complaints.length === 0 ? (
          <Card className="shadow-md border-0">
            <CardContent className="p-12 text-center">
              <MessageCircle size={48} className="text-[#607D8B] mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-[#2A3F54] mb-2">
                Nenhuma reclamação ainda
              </h3>
              <p className="text-sm text-[#607D8B] mb-6">
                Comece criando sua primeira reclamação
              </p>
              <Link href="/app/complaints/new">
                <Button className="h-auto px-6 py-3 rounded-xl bg-[#1E88E5] hover:bg-[#1976D2]">
                  Criar reclamação
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <ContentCard>
            <FilterTabs
              tabs={FILTER_TABS}
              activeTab={activeFilterTab}
              onChange={(id) => setActiveFilterTab(id as FilterTabId)}
            />

            <div className="p-0">
              {filteredComplaints.length === 0 ? (
                <div className="p-12 text-center">
                  <p className="font-['Poppins'] text-[#607D8B] text-sm">
                    Nenhuma reclamação encontrada nesta categoria
                  </p>
                </div>
              ) : (
                filteredComplaints.map((complaint: Complaint, index: number) => {
                  const statusConfig = getComplaintStatusConfig(complaint.status);
                  const date = new Date(complaint.createdAt);

                  return (
                    <Link
                      key={complaint.id}
                      href={`/app/complaints/${complaint.id}`}
                      className="block no-underline"
                    >
                      <div
                        className={`hover:bg-gray-50 transition-colors cursor-pointer p-6 ${
                          index < filteredComplaints.length - 1
                            ? "border-b border-[#E5E5ED]"
                            : ""
                        }`}
                      >
                        {/* Row 1: Title + Status Badge */}
                        <div className="flex justify-between items-start mb-3">
                          <p className="font-['Poppins'] font-medium text-base text-[#2A3F54] flex-1 mr-4">
                            {complaint.title}
                          </p>
                          <Badge
                            className="font-['Poppins'] font-bold text-xs flex items-center justify-center gap-2.5 px-3 py-2 rounded-[22px] border whitespace-nowrap"
                            style={{
                              backgroundColor: statusConfig.bgColor,
                              color: statusConfig.color,
                              borderColor: statusConfig.borderColor,
                            }}
                          >
                            {statusConfig.label}
                          </Badge>
                        </div>

                        {/* Row 2: Reference ID + Company + Date */}
                        <div className="flex items-center gap-3 mb-2">
                          <div className="inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-md bg-[#1E88E5]">
                            <span className="font-['Poppins'] font-medium text-white text-xs">
                              {protocolId(complaint.id)}
                            </span>
                          </div>
                          {complaint.company && (
                            <span className="font-['Poppins'] text-sm text-[#607D8B]">
                              {complaint.company.name}
                            </span>
                          )}
                          <span className="font-['Poppins'] text-sm text-[#607D8B]">
                            {date.toLocaleDateString("pt-BR")}
                          </span>
                        </div>

                        {/* Row 3: Project + Ver detalhes link */}
                        <div className="flex justify-between items-center">
                          <span className="font-['Poppins'] text-sm text-[#607D8B]">
                            {complaint.project?.name || "Sem projeto específico"}
                          </span>
                          <div className="flex items-center gap-1">
                            <span className="font-['Poppins'] font-medium text-xs text-[#AD92FF]">
                              Ver detalhes
                            </span>
                            <ChevronRight size={12} className="text-[#AD92FF]" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </ContentCard>
        )}
      </div>
    </AppPageShell>
  );
}
