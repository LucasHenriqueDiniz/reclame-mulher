"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminCompaniesPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const handleApprove = (companyId: string) => {
    // TODO: [API: PATCH /api/admin/companies/[id]/approve]
    alert(`Aprovar empresa ${companyId} será implementado`);
  };

  const handleReject = (companyId: string) => {
    // TODO: [API: PATCH /api/admin/companies/[id]/reject]
    alert(`Rejeitar empresa ${companyId} será implementado`);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-3xl mb-2">Verificação de Empresas</h1>
        <p className="text-gray-600">
          Gerencie as solicitações de verificação de empresas
        </p>
      </div>

      <div className="flex gap-4 mb-6">
        <Input
          placeholder="Buscar empresas..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
        <Button>Buscar</Button>
      </div>

      <div className="space-y-4">
        <p className="text-gray-600 mb-4">
          [API: GET /api/admin/companies?status=pending&page=1]
        </p>
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 border rounded">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-heading text-lg mb-1">Empresa {i}</h3>
                <p className="text-sm text-gray-600">
                  Status: <span className="font-semibold">Pendente</span>
                </p>
                <p className="text-sm text-gray-600">
                  Data: 01/01/2024
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleApprove(`company-${i}`)}
                >
                  Aprovar
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleReject(`company-${i}`)}
                >
                  Rejeitar
                </Button>
                <Button size="sm" variant="outline">
                  Ver Detalhes
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-sm text-gray-500 mt-6">
        [API: PATCH /api/admin/companies/[id]/approve - Aprovar]
        <br />
        [API: PATCH /api/admin/companies/[id]/reject - Rejeitar]
      </p>
    </div>
  );
}

