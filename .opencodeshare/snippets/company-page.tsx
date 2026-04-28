"use client";

import { CompanyPageShell } from "@/components/app/CompanyPageShell";
import { CompanyPageHeader } from "@/components/app/CompanyPageHeader";
import { ContentCard } from "@/components/app/ContentCard";
import type { CompanyNavTab } from "@/components/app/CompanyPageHeader";
import { LayoutDashboard, MessageSquare, FolderKanban, Building2 } from "lucide-react";

const COMPANY_TABS: CompanyNavTab[] = [
  { key: "dashboard", label: "Painel", href: "/app/company/dashboard", icon: LayoutDashboard },
  { key: "reclamacoes", label: "Reclamações", href: "/app/company/complaints", icon: MessageSquare },
  { key: "projetos", label: "Projetos", href: "/app/company/projects", icon: FolderKanban },
  { key: "perfil", label: "Perfil", href: "/app/company/profile", icon: Building2 },
];

export default function NovaPagina() {
  return (
    <CompanyPageShell>
      <CompanyPageHeader
        title="Título"
        subtitle="Subtítulo"
        icon={<MessageSquare className="w-8 h-8" />}
        tabs={COMPANY_TABS}
        activeTab="reclamacoes"
      />

      <ContentCard innerClassName="p-6">
        <p>Conteúdo aqui</p>
      </ContentCard>
    </CompanyPageShell>
  );
}
