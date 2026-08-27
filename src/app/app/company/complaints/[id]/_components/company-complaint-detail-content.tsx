"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  MessageCircle,
  Clock,
  CheckCircle2,
  AlertCircle,
  Send,
  Shield,
  Building2,
  ThumbsUp,
  Share2,
  Flag,
  Paperclip,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { formatDateTime } from "@/lib/utils";
import { protocolId } from "@/components/company/utils";
import { CompanyPageShell } from "@/components/app/CompanyPageShell";
import { mensagemDeErro } from "@/lib/http/erro";
import {
  COMPLAINT_STATUS_OPTIONS,
  getComplaintStatusConfig,
} from "@/lib/constants/complaint-status";

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
  attachments?: { id: string; filePath: string; fileName: string; contentType?: string | null }[];
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
  const config = getComplaintStatusConfig(status);
  const Icone = config.icon;
  return (
    <span
      role="status"
      aria-label={`Status: ${config.label}`}
      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
      style={{
        backgroundColor: config.bgColor,
        color: config.color,
        border: `1px solid ${config.borderColor}`,
      }}
    >
      <Icone className="w-4 h-4" />
      {config.label}
    </span>
  );
}

type CompanyProfile = {
  slug: string | null;
  verified: boolean;
};

type CompanyStats = {
  resolutionRate: number;
  activeDialogsCount: number;
  resolvedCases: number;
  activeProjectsCount: number;
  avgResponseHours: number | null;
};

export function CompanyComplaintDetailContent({
  complaint,
  messages,
  companyProfile,
  companyStats,
}: {
  complaint: ComplaintDetail;
  messages: MessageItem[];
  companyProfile: CompanyProfile;
  companyStats: CompanyStats;
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
        setFeedback({ type: "error", message: mensagemDeErro(data, "Não foi possível enviar a resposta.") });
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
        setFeedback({ type: "error", message: mensagemDeErro(data, "Não foi possível mudar o status.") });
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
      {/* Header azul */}
      <div className="bg-gradient-to-br from-[#1565C0] to-[#1565C0] -mx-6 -mt-8 px-6 py-8 mb-6">
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
              <h1 className="font-heading text-2xl font-bold text-white mb-1">
                {complaint.title}
              </h1>
              <p className="text-sm text-white/80 font-['Poppins']">
                Relato <span className="font-mono font-semibold">{protocolId(complaint.id)}</span>
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

      {/* Layout 2 colunas */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
        {/* Coluna principal */}
        <div className="space-y-4">
          {/* Card de detalhes */}
          <Card className="border-0 shadow-md overflow-hidden">
            <CardContent className="p-0">
              {/* Info grid */}
              <div className="grid grid-cols-2 gap-4 p-5 border-b border-gray-100">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Empresa</p>
                  <p className="text-sm font-semibold text-[#2A3F54]">{complaint.company.name ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Localização</p>
                  <p className="text-sm font-semibold text-[#2A3F54]">{complaint.problemLocation ?? "—"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Data de abertura</p>
                  <p className="text-sm font-semibold text-[#2A3F54]">{formatDateTime(complaint.createdAt)}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Categorias</p>
                  <div className="flex gap-1 flex-wrap">
                    {complaint.impactCategory && (
                      <Badge className="bg-[#1565C0] text-white hover:bg-[#1565C0] text-xs">
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

              {/* Ações */}
              <div className="flex items-center gap-4 px-5 py-3 border-b border-gray-100">
                <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1565C0] transition-colors">
                  <ThumbsUp className="w-4 h-4" />
                  Apoiar
                </button>
                <button className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#1565C0] transition-colors">
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
                      {/* Linha do tempo */}
                      <div className="flex flex-col items-center">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                            isCompany
                              ? "bg-[#1565C0]"
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

                      {/* Conteúdo */}
                      <div className={`flex-1 pb-6 ${isCompany ? "border-l-4 border-[#1565C0] pl-4 -ml-0.5" : ""}`}>
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-semibold text-sm text-[#2A3F54]">
                              {message.author?.name ?? (isCompany ? "Sua empresa" : "Reclamante")}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatDateTime(message.createdAt)}
                            </span>
                          </div>
                          <p className="text-[#2A3F54] whitespace-pre-wrap leading-relaxed text-sm">
                            {message.content}
                          </p>
                          {isFirst && complaint.attachments != null && complaint.attachments.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {complaint.attachments.map((a) =>
                                a.contentType?.startsWith("image/") ? (
                                  <a
                                    key={a.id}
                                    href={a.filePath}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block rounded-lg overflow-hidden border border-gray-200"
                                  >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                      src={a.filePath}
                                      alt={a.fileName}
                                      className="w-[120px] h-[120px] object-cover block"
                                    />
                                  </a>
                                ) : (
                                  <a
                                    key={a.id}
                                    href={a.filePath}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs text-[#1565C0] font-medium"
                                  >
                                    📎 {a.fileName}
                                  </a>
                                )
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Card de conclusão (se resolvida) */}
                {complaint.status === "RESOLVED" && (
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 rounded-full bg-[#1565C0] flex items-center justify-center flex-shrink-0">
                        <CheckCircle2 className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 border-l-4 border-[#1565C0] pl-4 -ml-0.5">
                      <div className="bg-gradient-to-r from-[#1565C0] to-[#1565C0] rounded-xl p-6 text-center text-white">
                        <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-3">
                          <CheckCircle2 className="w-8 h-8 text-white" />
                        </div>
                        <p className="font-['Poppins'] text-lg font-semibold">Reclamação resolvida</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Área de resposta */}
              <div className="p-5 border-t border-gray-100">
                <h3 className="font-['Poppins'] font-semibold text-[#2A3F54] mb-3">Enviar resposta</h3>
                <Textarea
                  placeholder="Escrever sua resposta..."
                  rows={4}
                  disabled={pending}
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  className="rounded-xl border-gray-200 focus:border-[#1565C0] focus:ring-[#1565C0]/20 resize-none mb-3"
                />
                <div className="flex items-center justify-between">
                  <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-[#1565C0] transition-colors">
                    <Paperclip className="w-4 h-4" />
                    Anexar arquivo
                  </button>
                  <Button
                    onClick={submitResponse}
                    disabled={pending || !response.trim()}
                    className="bg-[#1565C0] hover:bg-[#0D47A1] gap-2"
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
          {/* Card da empresa */}
          <Card className="border-0 shadow-md">
            <CardContent className="p-6 text-center">
              {/* Avatar */}
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#1565C0] to-[#1565C0] flex items-center justify-center text-white text-2xl font-bold mx-auto mb-3">
                {complaint.company.name?.charAt(0).toUpperCase() ?? "E"}
              </div>
              <h3 className="font-['Poppins'] font-semibold text-[#2A3F54] text-lg mb-1">
                {complaint.company.name ?? "Empresa"}
              </h3>
              {companyProfile.verified && (
                <Badge className="bg-[#1565C0]/10 text-[#1565C0] hover:bg-[#1565C0]/10 mb-4">
                  <Shield className="w-3 h-3 mr-1" />
                  VERIFICADA
                </Badge>
              )}

              {/* Stats */}
              <div className="space-y-3 text-left">
                <div>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-500">Taxa de resolução</span>
                    <span className="font-semibold text-[#2A3F54]">{companyStats.resolutionRate}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: `${companyStats.resolutionRate}%` }} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="flex items-center gap-2">
                    <MessageCircle className="w-4 h-4 text-[#1565C0]" />
                    <span className="text-xs text-gray-600">
                      <strong className="text-[#2A3F54]">{companyStats.activeDialogsCount}</strong> diálogos ativos
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                    <span className="text-xs text-gray-600">
                      <strong className="text-[#2A3F54]">{companyStats.resolvedCases}</strong> casos resolvidos
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-[#1565C0]" />
                    <span className="text-xs text-gray-600">{companyStats.activeProjectsCount} projetos em andamento</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#1565C0]" />
                    <span className="text-xs text-gray-600">
                      {companyStats.avgResponseHours != null ? `Resposta em ${companyStats.avgResponseHours}h` : "Sem histórico de resposta"}
                    </span>
                  </div>
                </div>
              </div>

              {companyProfile.slug && (
                <Link href={`/company/${companyProfile.slug}`}>
                  <Button variant="link" className="mt-4 text-[#1565C0]">
                    Ver página da empresa →
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>

          {/* Card Criar relato */}
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <p className="text-sm text-[#2A3F54] mb-4">
                Está querendo fazer um relato sobre <strong>{complaint.company.name ?? "esta empresa"}</strong>?
              </p>
              <Link href={`/app/complaints/new?company=${complaint.company.name}`}>
                <Button className="w-full bg-[#1565C0] hover:bg-[#0D47A1] gap-2">
                  <MessageCircle className="w-4 h-4" />
                  Criar um relato
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Ações da empresa */}
          <Card className="border-0 shadow-md">
            <CardContent className="p-6">
              <h4 className="font-semibold text-sm text-gray-500 uppercase tracking-wider mb-4">
                Ações da empresa
              </h4>
              <div className="space-y-3">
                <div>
                  <label htmlFor="mudar-status" className="text-sm text-gray-500 mb-1.5 block">
                    Mudar status
                  </label>
                  <div className="flex gap-2">
                    <select
                      id="mudar-status"
                      className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white focus:border-[#1565C0] focus:ring-2 focus:ring-[#1565C0]/20 outline-none"
                      value={status}
                      disabled={pending}
                      onChange={(e) => setStatus(e.target.value)}
                    >
                      {COMPLAINT_STATUS_OPTIONS.map((option) => (
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
