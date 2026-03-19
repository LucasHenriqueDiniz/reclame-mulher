"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { MapPin, BarChart2, MessageCircle, Settings as SettingsIcon, PlusSquare, ChevronRight, Clock, Meh, Smile, Laugh } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { protocolId } from "@/components/company/utils";
import { getComplaintStatusConfig, type ComplaintStatus } from "@/lib/constants/complaint-status";

const MUTED = "#607D8B";

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

type ProfileTab = "reclamacoes" | "configuracoes";
type FilterTab = "ultimas" | "nao-respondidas" | "respondidas" | "concluidas";

const PROFILE_TABS: { key: ProfileTab; label: string; icon: React.ComponentType<{ size?: number; className?: string }>; href: string }[] = [
  { key: "reclamacoes", label: "Reclamações", icon: MessageCircle, href: "/app/complaints" },
  { key: "configuracoes", label: "Configurações", icon: SettingsIcon, href: "/app/settings" },
];

const FILTER_TABS: { 
  id: FilterTab; 
  label: string; 
  icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>; 
  color: string;
}[] = [
  {
    id: "ultimas",
    label: "Últimas",
    icon: Clock,
    color: "#1E88E5",
  },
  {
    id: "nao-respondidas",
    label: "Não Respondidas",
    icon: Meh,
    color: "#607D8B",
  },
  {
    id: "respondidas",
    label: "Respondidas",
    icon: Smile,
    color: "#26A69A",
  },
  {
    id: "concluidas",
    label: "Concluídas",
    icon: Laugh,
    color: "#26A69A",
  },
];

export function ComplaintsContent({
  complaints,
  profileName,
  profileCity,
  profileState,
  avatarUrl,
}: Props) {
  const [activeProfileTab] = useState<ProfileTab>("reclamacoes");
  const [activeFilterTab, setActiveFilterTab] = useState<FilterTab>("ultimas");

  const location = [profileCity, profileState].filter(Boolean).join(", ");
  const complaintCount = complaints.length;

  // Filtrar reclamações baseado na tab ativa
  const filteredComplaints = useMemo(() => {
    switch (activeFilterTab) {
      case "nao-respondidas":
        return complaints.filter(c => c.status === "OPEN");
      case "respondidas":
        return complaints.filter(c => c.status === "RESPONDED");
      case "concluidas":
        return complaints.filter(c => c.status === "RESOLVED" || c.status === "CANCELLED");
      case "ultimas":
      default:
        return complaints;
    }
  }, [complaints, activeFilterTab]);

  return (
    <div className="min-h-screen bg-[#F5F7FA] pb-12">
      <div className="max-w-[1200px] mx-auto px-6 pt-8">

        {/* ── Profile Hero Card ── */}
        <Card className="relative overflow-hidden shadow-md border-0">
          {/* Blue Banner */}
          <div className="h-[126px] bg-[#1E88E5] rounded-t-xl" />

          {/* Avatar - overlapping banner */}
          <div className="absolute top-[58px] left-[43px] w-[137px] h-[137px] rounded-full border-4 border-white overflow-hidden flex items-center justify-center flex-shrink-0 shadow-sm bg-[#1E88E5]">
            {avatarUrl ? (
              <img 
                src={avatarUrl} 
                alt={profileName || "U"} 
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white text-5xl font-bold font-['Poppins']">
                {profileName
                  .split(" ")
                  .slice(0, 2)
                  .map((w) => w[0])
                  .join("")
                  .toUpperCase()}
              </span>
            )}
          </div>

          <div className="pt-[75px] pb-2.5 px-2.5">
            {/* User Name */}
            <div className="px-4 h-[30px] flex items-center">
              <h2 className="font-bold text-xl text-[#2A3F54] m-0">
                {profileName}
              </h2>
            </div>

            {/* Location, Stats, and Action Button */}
            <div className="py-2.5 px-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4 flex-wrap">
                {location && (
                  <div className="flex items-center gap-1.5">
                    <MapPin size={18} className="text-[#607D8B]" />
                    <span className="text-[13px] text-[#607D8B]">
                      {location}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <BarChart2 size={18} className="text-[#607D8B]" />
                  <span className="text-[13px] text-[#607D8B]">
                    {complaintCount} Reclamações
                  </span>
                </div>
              </div>

              <Link href="/app/complaints/new">
                <Button 
                  className="h-auto px-6 py-3 rounded-xl gap-3 bg-[#1E88E5] hover:bg-[#1976D2]"
                >
                  <span className="text-sm font-medium">Começar uma nova reclamação</span>
                  <PlusSquare size={18} />
                </Button>
              </Link>
            </div>

            {/* Profile Navigation Tabs */}
            <div className="flex items-center gap-4 px-4 border-t border-[#E5E5ED]">
              {PROFILE_TABS.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeProfileTab === tab.key;
                return (
                  <Link
                    key={tab.key}
                    href={tab.href}
                    className={`flex items-center gap-1.5 py-4 px-2 no-underline border-b-2 -mb-px transition-colors ${
                      isActive ? "border-[#1E88E5]" : "border-transparent"
                    }`}
                  >
                    <Icon 
                      size={24} 
                      className={isActive ? "text-[#1E88E5]" : "text-[#607D8B]"}
                    />
                    <span 
                      className={`text-sm font-medium ${
                        isActive ? "text-[#1E88E5]" : "text-[#607D8B]"
                      }`}
                    >
                      {tab.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </Card>

        {/* ── Complaints List ── */}
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
                  <Button 
                    className="h-auto px-6 py-3 rounded-xl bg-[#1E88E5] hover:bg-[#1976D2]"
                  >
                    Criar reclamação
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-md border-0 overflow-hidden">
              {/* Filter Tabs */}
              <nav className="flex h-14 items-center gap-4 bg-white border-b border-[#26a69a1a] px-4">
                {FILTER_TABS.map((tab) => {
                  const IconComponent = tab.icon;
                  const isActive = activeFilterTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveFilterTab(tab.id)}
                      className={`inline-flex items-center gap-1.5 px-2 py-4 self-stretch flex-[0_0_auto] border-b-2 cursor-pointer transition-colors -mb-px ${
                        isActive
                          ? "border-[#1E88E5]"
                          : "border-transparent hover:border-gray-300"
                      }`}
                    >
                      <IconComponent 
                        className="w-6 h-6" 
                        style={{ color: isActive ? tab.color : MUTED }}
                      />
                      <span
                        className="font-['Poppins'] font-medium text-sm"
                        style={{ color: isActive ? tab.color : MUTED }}
                      >
                        {tab.label}
                      </span>
                    </button>
                  );
                })}
              </nav>

              {/* Complaints List */}
              <CardContent className="p-0">
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
                            index < filteredComplaints.length - 1 ? "border-b border-[#E5E5ED]" : ""
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
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
