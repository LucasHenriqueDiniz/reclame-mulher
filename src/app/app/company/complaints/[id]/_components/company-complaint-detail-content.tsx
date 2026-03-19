"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { companyTheme as S } from "@/components/company/theme";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatDateTime } from "@/lib/utils";

const STATUS_LABELS: Record<string, string> = {
  OPEN: "Em aberto",
  RESPONDED: "Respondida",
  RESOLVED: "Resolvida",
  CANCELLED: "Cancelada",
};

const STATUS_OPTIONS = [
  { value: "OPEN", label: "Em aberto" },
  { value: "RESPONDED", label: "Respondida" },
  { value: "RESOLVED", label: "Resolvida" },
  { value: "CANCELLED", label: "Cancelada" },
];

type ComplaintDetail = {
  id: string;
  title: string;
  description: string;
  status: string;
  problemLocation: string | null;
  occurredAt: string | null;
  expectedSolution: string | null;
  impactCategory: string | null;
  urgencyLevel: string | null;
  impactScope: string | null;
  isAnonymous: boolean;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string | null;
  author: { name: string | null } | null;
  company: { name: string | null };
  project: { name: string } | null;
};

type MessageItem = {
  id: string;
  content: string;
  senderType: string;
  createdAt: string;
  attachmentPath?: string | null;
  author: { name: string | null } | null;
};

export function CompanyComplaintDetailContent({
  complaint,
  messages,
}: {
  complaint: ComplaintDetail;
  messages: MessageItem[];
}) {
  const [response, setResponse] = useState("");
  const [status, setStatus] = useState(complaint.status);
  const [feedback, setFeedback] = useState<{ type: "error" | "success"; message: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function submitResponse() {
    setFeedback(null);
    if (!response.trim()) {
      setFeedback({ type: "error", message: "Digite uma resposta antes de enviar." });
      return;
    }

    startTransition(async () => {
      const res = await fetch(`/api/company/complaints/${complaint.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: response.trim() }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFeedback({ type: "error", message: data.error ?? "Erro ao enviar resposta." });
        return;
      }

      setResponse("");
      setFeedback({ type: "success", message: "Resposta enviada com sucesso." });
      router.refresh();
    });
  }

  function updateStatus() {
    setFeedback(null);

    startTransition(async () => {
      const res = await fetch(`/api/company/complaints/${complaint.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFeedback({ type: "error", message: data.error ?? "Erro ao atualizar status." });
        return;
      }

      setFeedback({ type: "success", message: "Status atualizado com sucesso." });
      router.refresh();
    });
  }

  return (
    <div className="container mx-auto max-w-5xl p-6">
      <div className="mb-6">
        <Link href="/app/company/dashboard?tab=complaints">
          <Button variant="ghost" size="sm">
            ← Voltar
          </Button>
        </Link>
        <h1 className="font-heading mt-4 mb-2 text-3xl">{complaint.title}</h1>
        <p className="text-gray-600">
          Protocolo #{complaint.id.slice(0, 8).toUpperCase()} · {STATUS_LABELS[complaint.status] ?? complaint.status}
        </p>
      </div>

      {feedback ? (
        <div
          className="mb-6 rounded-lg border px-4 py-3 text-sm"
          style={{
            borderColor: feedback.type === "error" ? "#fecaca" : "#bbf7d0",
            background: feedback.type === "error" ? "#fef2f2" : "#f0fdf4",
            color: feedback.type === "error" ? "#b91c1c" : "#166534",
          }}
        >
          {feedback.message}
        </div>
      ) : null}

      <div className="space-y-6">
        <section className="rounded-xl border bg-white p-6">
          <h2 className="font-heading mb-4 text-xl">Detalhes</h2>
          <div className="grid gap-3 md:grid-cols-2">
            <p><strong>Status:</strong> {STATUS_LABELS[complaint.status] ?? complaint.status}</p>
            <p><strong>Data de abertura:</strong> {formatDateTime(complaint.createdAt)}</p>
            <p><strong>Autora:</strong> {complaint.isAnonymous ? "Anônima" : complaint.author?.name ?? "Usuária"}</p>
            <p><strong>Empresa:</strong> {complaint.company.name ?? "—"}</p>
            {complaint.project ? <p><strong>Projeto:</strong> {complaint.project.name}</p> : null}
            {complaint.problemLocation ? <p><strong>Local:</strong> {complaint.problemLocation}</p> : null}
            {complaint.occurredAt ? <p><strong>Ocorrido em:</strong> {formatDateTime(complaint.occurredAt)}</p> : null}
            {complaint.expectedSolution ? <p><strong>Solução esperada:</strong> {complaint.expectedSolution}</p> : null}
          </div>
        </section>

        <section className="rounded-xl border bg-white p-6">
          <h2 className="font-heading mb-4 text-xl">Conversa</h2>
          <div className="space-y-4">
            <div className="rounded-lg border bg-slate-50 p-4">
              <p className="mb-1 text-sm font-semibold">
                {complaint.isAnonymous ? "Reclamante anônima" : complaint.author?.name ?? "Reclamante"}
              </p>
              <p className="whitespace-pre-wrap">{complaint.description}</p>
              <p className="mt-2 text-xs text-gray-500">{formatDateTime(complaint.createdAt)}</p>
            </div>

            {messages.map((message) => (
              <div
                key={message.id}
                className="rounded-lg border p-4"
                style={{
                  background: message.senderType === "COMPANY" ? `${S.primary}12` : "#fff",
                }}
              >
                <p className="mb-1 text-sm font-semibold">
                  {message.author?.name ?? (message.senderType === "COMPANY" ? "Empresa" : "Usuária")}
                </p>
                <p className="whitespace-pre-wrap">{message.content}</p>
                <p className="mt-2 text-xs text-gray-500">{formatDateTime(message.createdAt)}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 border-t pt-6">
            <h3 className="mb-4 font-semibold">Responder</h3>
            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                submitResponse();
              }}
            >
              <div>
                <Label htmlFor="response">Sua resposta</Label>
                <Textarea
                  id="response"
                  placeholder="Digite sua resposta..."
                  rows={4}
                  disabled={pending}
                  value={response}
                  onChange={(event) => setResponse(event.target.value)}
                />
              </div>
              <Button type="submit" disabled={pending}>
                {pending ? "Enviando..." : "Enviar resposta"}
              </Button>
            </form>
          </div>
        </section>

        <section className="rounded-xl border bg-white p-6">
          <h2 className="font-heading mb-4 text-xl">Ações</h2>
          <div className="flex flex-wrap gap-2">
            <select
              className="rounded border px-4 py-2"
              value={status}
              disabled={pending}
              onChange={(event) => setStatus(event.target.value)}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <Button type="button" onClick={updateStatus} disabled={pending}>
              {pending ? "Salvando..." : "Alterar status"}
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
