"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

interface CompanyProfileContentProps {
  slug: string;
  tab: string;
  isCompanyMember: boolean;
  isCompanyAdmin: boolean;
}

const TABS = [
  { id: "overview", label: "Início" },
  { id: "complaints", label: "Reclamações" },
  { id: "projects", label: "Projetos" },
  { id: "about", label: "Sobre" },
] as const;

export function CompanyProfileContent({
  slug,
  tab,
  isCompanyMember,
  isCompanyAdmin,
}: CompanyProfileContentProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleTabChange = (newTab: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("tab", newTab);
    router.push(`/company/${slug}?${params.toString()}`);
  };

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-heading text-4xl mb-2">Empresa: {slug}</h1>
        <p className="text-gray-600">
          [API: GET /api/companies/by-slug/{slug}]
        </p>
        {isCompanyMember && (
          <div className="mt-4 p-3 bg-blue-50 rounded">
            <p className="text-sm text-blue-800">
              Você é membro desta empresa • Ações extras habilitadas
            </p>
          </div>
        )}
        {isCompanyAdmin && (
          <div className="mt-2 p-3 bg-purple-50 rounded">
            <p className="text-sm text-purple-800">Você é admin • Controles de verificação habilitados</p>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b mb-6">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => handleTabChange(t.id)}
            className={`px-4 py-2 font-medium ${
              tab === t.id
                ? "border-b-2 border-primary text-primary"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[400px]">
        {tab === "overview" && (
          <div>
            <h2 className="font-heading text-2xl mb-4">Visão Geral</h2>
            <p className="mb-4">[API: KPIs públicos, estatísticas]</p>
            {isCompanyMember && (
              <div className="mt-4 p-4 bg-gray-50 rounded">
                <h3 className="font-semibold mb-2">KPIs Privados (apenas membros)</h3>
                <p className="text-sm text-gray-600">
                  [API: GET /api/companies/[id]/stats]
                </p>
              </div>
            )}
          </div>
        )}

        {tab === "complaints" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-heading text-2xl">Reclamações Públicas</h2>
              <Button>Reclamar</Button>
            </div>
            <p className="mb-4">
              [API: GET /api/companies/[id]/complaints/public?page=1&status=]
            </p>
            {isCompanyMember && (
              <div className="mt-4 p-4 bg-blue-50 rounded">
                <h3 className="font-semibold mb-2">Filtros Internos (apenas membros)</h3>
                <div className="flex gap-2 mb-4">
                  <Button size="sm">Filtro Status</Button>
                  <Button size="sm">Filtro Data</Button>
                </div>
                <p className="text-sm text-gray-600">
                  [Mostrar filtros extras + CTA &quot;Responder&quot; inline nas reclamações]
                </p>
              </div>
            )}
          </div>
        )}

        {tab === "projects" && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-heading text-2xl">Projetos</h2>
              {isCompanyMember && <Button>Criar Projeto</Button>}
            </div>
            <p className="mb-4">
              [API: GET /api/companies/[id]/projects/public]
            </p>
            {isCompanyMember && (
              <p className="text-sm text-gray-600">
                [Mostrar projetos internos também]
              </p>
            )}
          </div>
        )}

        {tab === "about" && (
          <div>
            <h2 className="font-heading text-2xl mb-4">Sobre a Empresa</h2>
            <p className="mb-4">
              [API: Informações institucionais, setor, website, etc.]
            </p>
            {isCompanyMember && (
              <div className="mt-4">
                <Button variant="outline">Editar Perfil</Button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

