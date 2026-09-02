"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, MessageCircle, Clock, CheckCircle2, AlertCircle, XCircle, Send, Shield, Building2, ThumbsUp, Share2, Flag, Paperclip, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { formatDateTime } from "@/lib/utils";
import { protocolId } from "@/components/company/utils";
import { CompanyPageShell } from "@/components/app/CompanyPageShell";

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
  OPEN: {
    label: "Em aberto",
    color: "#F97316",
    bg: "#FFF7ED",
    border: "#FDBA74",
    icon: <AlertCircle className="w-4 h-4" />,
  },
  RESPONDED: {
    label: "Respondida",
    color: "#EAB308",
    bg: "#FEFCE8",
    border: "#FDE047",
    icon: <MessageCircle className="w-4 h-4" />,
  },
  RESOLVED: {
    label: "Resolvida",
    color: "#22C55E",
    bg: "#F0FDF4",
    border: "#86EFAC",
    icon: <CheckCircle2 className="w-4 h-4" />,
  },
  CANCELLED: {
    label: "Cancelada",
    color: "#94A3B8",
    bg: "#F8FAFC",
    border: "#CBD5E1",
    icon: <XCircle className="w-4 h-4" />,
  },
};

const STATUS_OPTIONS = [
  { value: "OPEN", label: "Em aberto" },
  { value: "RESPONDED", label: "Respondida" },
  { value: "RESOLVED", label: "Resolvida" },
  { value: "CANCELLED", label: "Cancelada" },
];

const CATEGORY_LABELS: Record<string, string> = {
  meio_ambiente: "Meio Ambiente",
  seguranca: "Segurança",
  infraestrutura: "Infraestrutura",
  social: "Social",
  saude: "Saúde",
  outro: "Outro",
};

const URGENCY_LABELS: Record<string, string> = {
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
  emergencial: "Emergencial",
};

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

function StatusBadge({ status }: { status: string }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.OPEN;
  return (
    <span
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
      style={{ backgroundColor: config.bg, color: config.color, border: `1px solid ${config.border}` }}
    >
      {config.icon}
      {config.label}
    </span>
  );
}

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
      setFeedback({ type: "error", message: "Escreva uma resposta antes de enviar." });
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
        setFeedback({ type: "error", message: data.error ?? "Não foi possível enviar a resposta." });
        return;
      }

      setResponse("");
      setFeedback({ type: "success", message: "Resposta enviada com sucesso!" });
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
        setFeedback({ type: "error", message: data.error ?? "Não foi possível mudar o status." });
        return;
      }

      setFeedback({ type: "success", message: "Status atualizado com sucesso." });
      router.refresh();
    });
  }

  const allMessages: MessageItem[] = [
    {
      id: "original",
      content: complaint.description,
      senderType: "USER",
      createdAt: complaint.createdAt,
      author: complaint.author,
    },
    ...messages,
  ];

  return (
    <CompanyPageShell>
      {/* Blue header */}
      <div className="bg-gradient-to-br from-[#1E88E5] to-[#1565C0] -mx-6 -mt-8 px-6 py-8 mb-6">
        <div className="max-w-[960px] mx-auto">
          <Link
            href="/app/company/complaints"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Voltar</span>
          </Link>

          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="font-['Poppins'] text-2xl font-bold text-white mb-1">
                {complaint.title}
              </h1>
              <p className="text-sm text-white/80 font-['Poppins']">
                Relato <span className="font-mono font-semibold">#{protocolId(complaint.id)}</span>
              </p>
            </div>
            <StatusBadge status={complaint.status} />
          </div>
        </div>
      </div>

      {/* Feedback */}
      {feedback && (
        <div
          className={`mb-6 rounded-xl px-4 py-3 text-sm font-medium ${
            feedback.type === "error"
              ? "bg-red-50 text-red-700 border border-red-200"
              : "bg-green-50 text-green-700 border border-green-200"
          }`}
        >
          {feedback.message}
        </div>
      )}

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
        {/* Main column */}
        <div className="space-y-4">
          {/* Details card */}
          <Card className="border-0 shadow-md overflow-hidden">
            <CardContent className="p-0">
              {/* Info grid */}
              <div className="grid grid-cols-2 gap-4 p-5 border-b border-gray-100">
                <div>
                  <p className="text-xs text-gray-400 mb-1">Empresa</p>
                  <p className="text-sm font-semibold text-[#2A3F54]">{complaint.company.name ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Localização</p>
                  <p className="text-sm font-semibold text-[#2A3F54]">{complaint.problemLocation ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Data de abertura</p>
                  <p className="text-sm font-semibold text-[#2A3F54]">{formatDateTime(complaint.createdAt)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Categorias</p>
                  <div className="flex gap-1 flex-wrap">
                    {complaint.impactCategory && (
                      <Badge className="bg-[#1E88E5] text-white hover:bg-[#1E88E5] text-xs">
                        {CATEGORY_LABELS[complaint.impactCategory] ?? complaint.impactCategory}
                      </Badge>
                    )}
                    {complaint.urgencyLevel && (
                      <Badge variant="outline" className="text-xs">
                        {URGENCY_LABELS[complaint.urgencyLevel] ?? complaint.urgencyLevel}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-4 px-5 py-3 border-b border-gray-100">
                <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1E88E5] transition-colors">
                  <ThumbsUp className="w-4 h-4" />
                  Apoiar
                </button>
                <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1E88E5] transition-colors">
                  <Share2 className="w-4 h-4" />
                  Compartilhar
                </button>
                <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-500 transition-colors">
                  <Flag className="w-4 h-4" />
                  Reportar
                </button>
              </div>

              {/* Timeline */}
              <div className="p-5 space-y-0">
                {allMessages.map((message, index) => {
                  const isCompany = message.senderType === "COMPANY";
                  const isFirst = index === 0;

                  return (
                    <div key={message.id} className="flex gap-4">
                      {/* Timeline rail */}
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                            isCompany
                              ? "bg-[#1E88E5]"
                              : isFirst
                              ? "bg-orange-100"
                              : "bg-gray-100"
                          }`}
                        >
                          {isCompany ? (
                            <Building2 className="w-5 h-5 text-white" />
                          ) : isFirst ? (
                            <AlertCircle className="w-5 h-5 text-orange-600" />
                          ) : (
                            <MessageCircle className="w-5 h-5 text-gray-500" />
                          )}
                        </div>
                        {index < allMessages.length - 1 && (
                          <div className="w-0.5 flex-1 bg-gray-200 mt-2" />
                        )}
                      </div>

                      {/* Entry content */}
                      <div className={`flex-1 pb-6 ${isCompany ? "border-l-4 border-[#1E88E5] pl-4 -ml-0.5" : ""}`}>
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-sm text-[#2A3F54]">
                              {message.author?.name ?? (isCompany ? "Sua empresa" : "Reclamante")}
                              {isCompany && (
                                <span className="font-normal text-gray-400 ml-1">— Coordenador de Relações Comunitárias</span>
                              )}
                            </span>
                            <span className="text-xs text-gray-400">
                              {formatDateTime(message.createdAt)}
                            </span>
                          </div>
                          <p className="text-[#2A3F54] whitespace-pre-wrap leading-relaxed text-sm">
                            {message.content}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Closing card, only once the complaint is resolved */}
                {complaint.status === "RESOLVED" && (
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-[#1E88E5] flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 border-l-4 border-[#1E88E5] pl-4 -ml-0.5">
                      <div className="bg-gradient-to-r from-[#1E88E5] to-[#1565C0] rounded-xl p-6 text-center text-white">
                        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
                          <CheckCircle2 className="w-8 h-8 text-white" />
                        </div>
                        <p className="font-['Poppins'] text-lg font-semibold">Chamado Concluído</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Reply area */}
              <div className="p-5 border-t border-gray-100">
                <h3 className="font-['Poppins'] font-semibold text-[#2A3F54] mb-3">Enviar resposta</h3>
                <Textarea
                  placeholder="Escrever sua resposta..."
                  rows={4}
                  disabled={pending}
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  className="rounded-xl border-gray-200 focus:border-[#1E88E5] focus:ring-[#1E88E5]/20 resize-none mb-3"
                />
                <div className="flex items-center justify-between">
                  <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#1E88E5] transition-colors">
                    <Paperclip className="w-4 h-4" />
                    Anexar arquivo
                  </button>
                  <Button
                    onClick={submitResponse}
                    disabled={pending || !response.trim()}
                    className="bg-[#1E88E5] hover:bg-[#1976D2] gap-2"
                  >
                    <Send className="w-4 h-4" />
                    {pending ? "Enviando..." : "Enviar resposta"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Company card */}
          <Card className="border-0 shadow-md">
            <CardContent className="p-6 text-center">
              {/* Avatar */}
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#1E88E5] to-[#1565C0] flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3">
                {complaint.company.name?.charAt(0).toUpperCase() ?? "E"}
              </div>
              <h3 className="font-['Poppins'] font-semibold text-[#2A3F54] text-lg mb-1">
                {complaint.company.name ?? "Empresa"}
              </h3>
              <Badge className="bg-[#1E88E5]/10 text-[#1E88E5] hover:bg-[#1E88E5]/10 mb-4">
                <Shield className="w-3 h-3 mr-1" />
                VERIFICADA
              </Badge>

              {/* Stats */}
              <div className="space-y-3 text-left">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-500">Taxa de resolução</span>
                    <span className="font-semibold text-[#2A3F54]">92%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: "92%" }} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-[#1E88E5]" />
                    <span className="text-xs text-gray-600">
                      <strong className="text-[#2A3F54]">27</strong> diálogos ativos
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-xs text-gray-600">
                      <strong className="text-[#2A3F54]">143</strong> casos resolvidos
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-[#1E88E5]" />
                    <span className="text-xs text-gray-600">3 projetos em andamento</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#1E88E5]" />
                    <span className="text-xs text-gray-600">Resposta em 43h</span>
                  </div>
                </div>
              </div>

              <Link href={`/company/${complaint.company.name?.toLowerCase().replace(/\s+/g, "-") ?? ""}`}>
                <Button variant="link" className="mt-4 text-[#1E88E5]">
                  Ver página da empresa →
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* "Criar um relato" (start a report) card */}
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <p className="text-sm text-[#2A3F54] mb-4">
                Está querendo fazer um relato sobre <strong>{complaint.company.name ?? "esta empresa"}</strong>?
              </p>
              <Link href={`/app/complaints/new?company=${complaint.company.name}`}>
                <Button className="w-full bg-[#1E88E5] hover:bg-[#1976D2] gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Criar um relato
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Company actions */}
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <h4 className="font-semibold text-sm text-gray-400 uppercase tracking-wider mb-4">
                Ações da empresa
              </h4>
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-500 mb-1.5 block">Mudar status</label>
                  <div className="flex gap-2">
                    <select
                      className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white focus:border-[#1E88E5] focus:ring-2 focus:ring-[#1E88E5]/20 outline-none"
                      value={status}
                      disabled={pending}
                      onChange={(e) => setStatus(e.target.value)}
                    >
                      {STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <Button
                      type="button"
                      onClick={updateStatus}
                      disabled={pending || status === complaint.status}
                      variant="outline"
                      className="px-3"
                    >
                      {pending ? "..." : "Salvar"}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </CompanyPageShell>
  );
}
