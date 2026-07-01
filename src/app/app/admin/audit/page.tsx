"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface AuditLogItem {
  id: string;
  actorUserId: string | null;
  actorName: string | null;
  actorEmail: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  metadata: unknown;
  createdAt: string;
}

interface AuditResponse {
  logs: AuditLogItem[];
  total: number;
}

function formatAction(action: string) {
  return action.replace(/_/g, " ").toLowerCase();
}

function formatMetadata(metadata: unknown) {
  if (metadata == null) return "-";
  if (typeof metadata === "string") return metadata;
  return JSON.stringify(metadata);
}

export default function AdminAuditPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [entity, setEntity] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [appliedFilters, setAppliedFilters] = useState({ q: "", entity: "", from: "", to: "" });
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const queryString = useMemo(() => {
    const params = new URLSearchParams({ page: "1", limit: "50" });
    if (appliedFilters.q) params.set("q", appliedFilters.q);
    if (appliedFilters.entity) params.set("entity", appliedFilters.entity);
    if (appliedFilters.from) params.set("from", appliedFilters.from);
    if (appliedFilters.to) params.set("to", appliedFilters.to);
    return params.toString();
  }, [appliedFilters]);

  useEffect(() => {
    let cancelled = false;

    async function fetchLogs() {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch(`/api/admin/audit?${queryString}`);
        const data = (await response.json().catch(() => null)) as AuditResponse | { error?: string } | null;

        if (!response.ok) {
          throw new Error(data && "error" in data ? data.error : "Erro ao carregar auditoria");
        }

        if (!cancelled && data && "logs" in data) {
          setLogs(data.logs);
          setTotal(data.total);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Erro ao carregar auditoria");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void fetchLogs();
    return () => {
      cancelled = true;
    };
  }, [queryString]);

  function applyFilters() {
    setAppliedFilters({
      q: searchQuery.trim(),
      entity: entity.trim(),
      from: dateFrom,
      to: dateTo,
    });
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading text-3xl mb-2">Auditoria</h1>
        <p className="text-gray-600">Registro de ações e eventos do sistema</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Input
          placeholder="Usuário ou email"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
        />
        <Input
          placeholder="Entidade"
          value={entity}
          onChange={(event) => setEntity(event.target.value)}
        />
        <Input
          type="date"
          value={dateFrom}
          onChange={(event) => setDateFrom(event.target.value)}
        />
        <Input
          type="date"
          value={dateTo}
          onChange={(event) => setDateTo(event.target.value)}
        />
        <Button onClick={applyFilters}>Filtrar</Button>
      </div>

      {error ? <p className="mb-4 text-sm text-red-600">{error}</p> : null}
      <p className="mb-3 text-sm text-gray-500">{loading ? "Carregando..." : `${total} registro(s)`}</p>

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
            {!loading && logs.length === 0 ? (
              <tr>
                <td className="border p-4 text-center text-sm text-gray-500" colSpan={5}>
                  Nenhum registro encontrado.
                </td>
              </tr>
            ) : null}
            {logs.map((log) => (
              <tr key={log.id}>
                <td className="border p-2 text-sm">
                  {new Date(log.createdAt).toLocaleString("pt-BR")}
                </td>
                <td className="border p-2 text-sm">
                  {log.actorName ?? log.actorEmail ?? log.actorUserId ?? "Sistema"}
                </td>
                <td className="border p-2 text-sm capitalize">{formatAction(log.action)}</td>
                <td className="border p-2 text-sm">
                  {log.entityType}
                  {log.entityId ? `:${log.entityId.slice(0, 8)}` : ""}
                </td>
                <td className="border p-2 text-sm font-mono text-xs">{formatMetadata(log.metadata)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
