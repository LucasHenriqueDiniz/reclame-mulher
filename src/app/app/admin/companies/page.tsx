"use client";

import { useEffect, useMemo, useState } from "react";
import { Building2, CheckCircle2, Clock3 } from "lucide-react";

import { Button } from "@/components/ui/button";

type AdminCompany = {
  id: string;
  name: string;
  cnpj: string | null;
  city: string | null;
  state: string | null;
  contactName: string | null;
  responsibleName: string | null;
  responsibleEmail: string | null;
  verifiedAt: string | null;
  createdAt: string;
  updatedAt: string | null;
};

export default function AdminCompaniesPage() {
  const [companies, setCompanies] = useState<AdminCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "verified">("all");
  const [error, setError] = useState<string | null>(null);

  const filteredCompanies = useMemo(() => {
    if (statusFilter === "all") return companies;
    if (statusFilter === "pending") return companies.filter((company) => !company.verifiedAt);
    return companies.filter((company) => !!company.verifiedAt);
  }, [companies, statusFilter]);

  async function loadCompanies() {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/admin/companies?status=all", { cache: "no-store" });
      const data = (await response.json().catch(() => null)) as
        | { companies?: AdminCompany[]; error?: string }
        | null;

      if (!response.ok) {
        throw new Error(data?.error || "Nao foi possivel carregar as empresas.");
      }

      setCompanies(data?.companies ?? []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Erro ao carregar empresas.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVerification(companyId: string, verified: boolean) {
    try {
      setSavingId(companyId);
      setError(null);

      const response = await fetch(`/api/admin/companies/${companyId}/verification`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verified }),
      });

      const data = (await response.json().catch(() => null)) as
        | { company?: AdminCompany; error?: string }
        | null;

      if (!response.ok) {
        throw new Error(data?.error || "Nao foi possivel atualizar a verificacao.");
      }

      const updated = data?.company;
      if (updated) {
        setCompanies((current) =>
          current.map((company) => (company.id === companyId ? updated : company))
        );
      }
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Erro ao atualizar verificacao.");
    } finally {
      setSavingId(null);
    }
  }

  useEffect(() => {
    void loadCompanies();
  }, []);

  const pendingCount = companies.filter((company) => !company.verifiedAt).length;
  const verifiedCount = companies.filter((company) => !!company.verifiedAt).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 font-heading text-3xl">Verificação de Empresas</h1>
        <p className="text-gray-600">
          Revise empresas cadastradas e controle o selo de verificacao publicado no perfil.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <Clock3 className="mb-3 h-6 w-6 text-amber-600" />
          <h2 className="mb-1 font-semibold text-[#2A3F54]">Pendentes</h2>
          <p className="text-sm text-gray-600">
            {pendingCount} empresa(s) aguardando verificacao.
          </p>
        </div>
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <CheckCircle2 className="mb-3 h-6 w-6 text-emerald-600" />
          <h2 className="mb-1 font-semibold text-[#2A3F54]">Verificadas</h2>
          <p className="text-sm text-gray-600">
            {verifiedCount} empresa(s) com selo ativo.
          </p>
        </div>
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <Building2 className="mb-3 h-6 w-6 text-[#1E88E5]" />
          <h2 className="mb-1 font-semibold text-[#2A3F54]">Fonte de verdade</h2>
          <p className="text-sm text-gray-600">
            O status e controlado por `verifiedAt` no cadastro da empresa.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { key: "all", label: "Todas" },
          { key: "pending", label: "Pendentes" },
          { key: "verified", label: "Verificadas" },
        ].map((item) => (
          <Button
            key={item.key}
            type="button"
            variant={statusFilter === item.key ? "default" : "outline"}
            onClick={() => setStatusFilter(item.key as typeof statusFilter)}
          >
            {item.label}
          </Button>
        ))}
      </div>

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>
      ) : null}

      <div className="rounded-2xl border bg-white shadow-sm">
        {loading ? (
          <div className="p-8 text-sm text-gray-600">Carregando empresas...</div>
        ) : filteredCompanies.length === 0 ? (
          <div className="p-8 text-sm text-gray-600">Nenhuma empresa encontrada para esse filtro.</div>
        ) : (
          <div className="divide-y">
            {filteredCompanies.map((company) => {
              const location = [company.city, company.state].filter(Boolean).join(", ");
              const isVerified = !!company.verifiedAt;
              const isSaving = savingId === company.id;

              return (
                <div key={company.id} className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-[#2A3F54]">{company.name}</h3>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          isVerified
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-amber-100 text-amber-700"
                        }`}
                      >
                        {isVerified ? "Verificada" : "Pendente"}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">
                      {company.cnpj ? `CNPJ ${company.cnpj}` : "CNPJ nao informado"}
                      {location ? ` • ${location}` : ""}
                    </p>
                    <p className="text-sm text-gray-600">
                      Responsavel: {company.contactName || company.responsibleName || "Nao informado"}
                      {company.responsibleEmail ? ` • ${company.responsibleEmail}` : ""}
                    </p>
                    <p className="text-xs text-gray-500">
                      Criada em {new Date(company.createdAt).toLocaleDateString("pt-BR")}
                      {company.verifiedAt
                        ? ` • verificada em ${new Date(company.verifiedAt).toLocaleDateString("pt-BR")}`
                        : ""}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="button"
                      disabled={isSaving || isVerified}
                      onClick={() => void handleVerification(company.id, true)}
                    >
                      {isSaving && !isVerified ? "Salvando..." : "Aprovar"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isSaving || !isVerified}
                      onClick={() => void handleVerification(company.id, false)}
                    >
                      {isSaving && isVerified ? "Salvando..." : "Remover selo"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
