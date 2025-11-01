"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CompanyInboxPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="font-heading text-3xl mb-2">Caixa de Entrada</h1>
        <p className="text-gray-600">
          Todas as reclamações endereçadas à sua empresa
        </p>
      </div>

      {/* Filtros */}
      <div className="flex gap-4 mb-6">
        <Input
          placeholder="Buscar reclamações..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border rounded"
        >
          <option value="all">Todos os Status</option>
          <option value="pending">Pendente</option>
          <option value="in_progress">Em Andamento</option>
          <option value="resolved">Resolvida</option>
          <option value="closed">Fechada</option>
        </select>
        <Button>Filtrar</Button>
      </div>

      {/* Lista de reclamações */}
      <div className="space-y-4">
        <p className="text-gray-600 mb-4">
          [API: GET /api/company/inbox?status={statusFilter}&q={searchQuery}&page=1]
        </p>
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 border rounded">
            <div className="flex justify-between items-start">
              <div>
                <Link
                  href={`/app/company/complaints/complaint-${i}`}
                  className="hover:underline"
                >
                  <h3 className="font-heading text-lg mb-1">
                    Reclamação #{i}
                  </h3>
                </Link>
                <p className="text-sm text-gray-600">
                  Status: Pendente • Data: 01/01/2024
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="sm">Responder</Button>
                <Button size="sm" variant="outline">
                  Ver Detalhes
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bulk Actions */}
      <div className="mt-6 p-4 bg-gray-50 rounded">
        <h3 className="font-semibold mb-2">Ações em Massa</h3>
        <div className="flex gap-2">
          <Button size="sm" variant="outline">
            Marcar Selecionadas
          </Button>
          <Button size="sm" variant="outline">
            Alterar Status
          </Button>
        </div>
      </div>
    </div>
  );
}

