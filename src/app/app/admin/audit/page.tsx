"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function AdminAuditPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-3xl mb-2">Auditoria</h1>
        <p className="text-gray-600">
          Registro de ações e eventos do sistema
        </p>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Input
          placeholder="Buscar..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Input
          type="date"
          placeholder="Data de"
          value={dateFrom}
          onChange={(e) => setDateFrom(e.target.value)}
        />
        <Input
          type="date"
          placeholder="Data até"
          value={dateTo}
          onChange={(e) => setDateTo(e.target.value)}
        />
        <Button>Filtrar</Button>
      </div>

      {/* Tabela de auditoria */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border">
          <thead>
            <tr className="bg-gray-50">
              <th className="border p-2 text-left">Data/Hora</th>
              <th className="border p-2 text-left">Usuário</th>
              <th className="border p-2 text-left">Ação</th>
              <th className="border p-2 text-left">Entidade</th>
              <th className="border p-2 text-left">Detalhes</th>
            </tr>
          </thead>
          <tbody>
            {[1, 2, 3, 4, 5].map((i) => (
              <tr key={i}>
                <td className="border p-2 text-sm">01/01/2024 10:00</td>
                <td className="border p-2 text-sm">user@{i}</td>
                <td className="border p-2 text-sm">CREATE</td>
                <td className="border p-2 text-sm">complaint</td>
                <td className="border p-2 text-sm">
                  <Button size="sm" variant="ghost">
                    Ver
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-sm text-gray-500 mt-6">
        [API: GET /api/admin/audit?q={searchQuery}&from={dateFrom}&to={dateTo}&page=1]
      </p>
    </div>
  );
}

