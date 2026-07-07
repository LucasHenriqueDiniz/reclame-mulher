"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Share2,
  ThumbsUp,
  Flag,
  MessageCircle,
  Check,
  BarChart3,
  Clock,
  FileText,
  ExternalLink,
  Send,
} from "lucide-react";
import { ShareModal } from "@/components/share-modal";
import { formatDateTime } from "@/lib/utils";
import { protocolId } from "@/components/company/utils";
import { companyTheme as S } from "@/components/company/theme";
import { Button } from "@/components/ui/button";

const STATUS_LABELS: Record<string, string> = {
  OPEN: "Em aberto",
  RESPONDED: "Respondida",
  RESOLVED: "Concluído",
  CANCELLED: "Cancelada",
};

const CATEGORY_LABELS: Record<string, string> = {
  meio_ambiente: "Meio Ambiente",
  seguranca: "Segurança",
  infraestrutura: "Infraestrutura",
  social: "Social",
  economico: "Econômico",
  outro: "Outro",
  poluicao_sonora: "Poluição Sonora",
  horario_obras: "Horário de obras",
  individual: "Individual",
  comunitario: "Comunitário",
  regional: "Regional",
  nacional: "Nacional",
  baixa: "Baixa",
  media: "Média",
  alta: "Alta",
  emergencial: "Emergencial",
};

interface ComplaintDetail {
  id: string;
  title: string;
  description: string;
  status: "OPEN" | "RESPONDED" | "RESOLVED" | "CANCELLED";
  problemLocation: string | null;
  impactCategory: string | null;
  urgencyLevel: string | null;
  impactScope: string | null;
  isAnonymous: boolean;
  createdAt: string;
  updatedAt: string;
  author: { name: string | null };
  company: { name: string | null };
  companyId?: string;
  companySlug?: string | null;
  companyLogo?: string | null;
  companyVerified?: boolean;
  companyStats?: {
    resolutionRate: number;
    activeDialogsCount: number;
    resolvedCases: number;
    activeProjectsCount: number;
    avgResponseHours: number | null;
  } | null;
  project: { name: string } | null;
}

interface MessageItem {
  id: string;
  content: string;
  senderType: string;
  author: { name: string | null };
  createdAt: string;
  attachmentPath?: string | null;
}

interface ComplaintDetailContentProps {
  complaint: ComplaintDetail;
  messages: MessageItem[];
  isAuthor?: boolean;
  isLoggedIn?: boolean;
}

export function ComplaintDetailContent({
  complaint,
  messages,
  isAuthor = false,
  isLoggedIn = false,
}: ComplaintDetailContentProps) {
  const [reply, setReply] = useState("");
  const [feedback, setFeedback] = useState<{ type: "error" | "success"; message: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const statusLabel = STATUS_LABELS[complaint.status] ?? complaint.status;
  const isResolved = complaint.status === "RESOLVED";
  const categories = [
    complaint.impactCategory ? (CATEGORY_LABELS[complaint.impactCategory] ?? complaint.impactCategory) : null,
    complaint.urgencyLevel ? (CATEGORY_LABELS[complaint.urgencyLevel] ?? complaint.urgencyLevel) : null,
    complaint.impactScope ? (CATEGORY_LABELS[complaint.impactScope] ?? complaint.impactScope) : null,
  ].filter(Boolean) as string[];

  function submitReply() {
    setFeedback(null);
    if (!reply.trim()) {
      setFeedback({ type: "error", message: "Digite uma resposta antes de enviar." });
      return;
    }

    startTransition(async () => {
      const res = await fetch(`/api/complaints/${complaint.id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: reply.trim() }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFeedback({ type: "error", message: data.error ?? "Erro ao enviar resposta." });
        return;
      }

      setReply("");
      setFeedback({ type: "success", message: "Resposta enviada com sucesso." });
      router.refresh();
    });
  }

  return (
    <main style={{ minHeight: "100vh", background: S.bg }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 20px 48px" }}>
        <div style={{ marginBottom: 20 }}>
          <Link href="/app/complaints">
            <Button variant="ghost" size="sm" className="gap-1.5 -ml-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
          </Link>
        </div>

        {/* Banner azul: título + protocolo + status */}
        <div
          style={{
            background: S.primary,
            borderRadius: 12,
            padding: "20px 24px",
            marginBottom: 16,
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <h1
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: S.white,
                margin: "0 0 4px 0",
                lineHeight: 1.3,
              }}
            >
              {complaint.title}
            </h1>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.9)", margin: 0 }}>
              Relato {protocolId(complaint.id)}
            </p>
          </div>
          <span
            style={{
              background: isResolved ? S.green : "rgba(255,255,255,0.2)",
              color: S.white,
              fontSize: 12,
              fontWeight: 700,
              borderRadius: 8,
              padding: "6px 14px",
              whiteSpace: "nowrap",
            }}
          >
            {statusLabel}
          </span>
        </div>

        <div className="complaint-detail-grid" style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, alignItems: "start" }}>
          {/* Coluna principal */}
          <div>
            {/* Painel detalhes */}
            <div
              style={{
                background: S.white,
                border: `1px solid ${S.border}`,
                borderRadius: 16,
                padding: "20px 24px",
                marginBottom: 20,
                boxShadow: "0 1px 3px 0 rgba(0,0,0,0.05)",
              }}
            >
              <div style={{ display: "grid", gap: 14, marginBottom: 18 }}>
                {complaint.company?.name && (
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: S.muted, textTransform: "uppercase", marginBottom: 2 }}>Empresa</div>
                    {complaint.companySlug ? (
                      <Link href={`/company/${complaint.companySlug}`} style={{ fontSize: 14, fontWeight: 600, color: S.primary, textDecoration: "none" }}>
                        {complaint.company.name}
                      </Link>
                    ) : (
                      <span style={{ fontSize: 14, fontWeight: 600, color: S.text }}>{complaint.company.name}</span>
                    )}
                  </div>
                )}
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: S.muted, textTransform: "uppercase", marginBottom: 2 }}>Data de abertura</div>
                  <span style={{ fontSize: 14, color: S.text }}>{formatDateTime(complaint.createdAt)}</span>
                </div>
                {complaint.problemLocation && (
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: S.muted, textTransform: "uppercase", marginBottom: 2 }}>Localização</div>
                    <span style={{ fontSize: 14, color: S.text }}>{complaint.problemLocation}</span>
                  </div>
                )}
                {categories.length > 0 && (
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: S.muted, textTransform: "uppercase", marginBottom: 6 }}>Categorias</div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {categories.map((c) => (
                        <span
                          key={c}
                          style={{
                            background: `${S.primary}18`,
                            color: S.primary,
                            fontSize: 12,
                            fontWeight: 600,
                            borderRadius: 20,
                            padding: "4px 12px",
                          }}
                        >
                          #{c.replace(/\s/g, "")}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div style={{ display: "flex", gap: 16, paddingTop: 14, borderTop: `1px solid ${S.border}` }}>
                <button type="button" style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", fontSize: 13, color: S.primary, fontWeight: 600 }}>
                  <ThumbsUp style={{ width: 16, height: 16 }} /> Apoiar
                </button>
                <ShareModal
                  url={`${typeof window !== "undefined" ? window.location.origin : ""}/app/complaints/${complaint.id}`}
                  title={complaint.title}
                  trigger={
                    <button type="button" style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", fontSize: 13, color: S.primary, fontWeight: 600 }}>
                      <Share2 style={{ width: 16, height: 16 }} /> Compartilhar
                    </button>
                  }
                />
                <button type="button" style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", fontSize: 13, color: S.red, fontWeight: 600 }}>
                  <Flag style={{ width: 16, height: 16 }} /> Reportar
                </button>
              </div>
            </div>

            {/* Thread: relato inicial + mensagens */}
            <div style={{ marginBottom: 20 }}>
              {/* Bloco inicial: autor do relato + descrição */}
              <div
                style={{
                  background: S.white,
                  border: `1px solid ${S.border}`,
                  borderRadius: 12,
                  padding: "16px 20px",
                  marginBottom: 12,
                  boxShadow: "0 1px 2px 0 rgba(0,0,0,0.04)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
                  <span style={{ fontWeight: 600, fontSize: 14, color: S.text }}>
                    {complaint.isAnonymous ? "Autor (anônimo)" : (complaint.author?.name ?? "Autor")}
                  </span>
                  <span style={{ fontSize: 12, color: S.muted }}>{formatDateTime(complaint.createdAt)}</span>
                </div>
                <p style={{ fontSize: 14, color: S.text, lineHeight: 1.6, margin: 0, whiteSpace: "pre-wrap" }}>
                  {complaint.description}
                </p>
              </div>

              {messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    background: msg.senderType === "COMPANY" ? `${S.primary}0D` : S.white,
                    border: `1px solid ${S.border}`,
                    borderRadius: 12,
                    padding: "16px 20px",
                    marginBottom: 12,
                    boxShadow: "0 1px 2px 0 rgba(0,0,0,0.04)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, flexWrap: "wrap", gap: 8 }}>
                    <span style={{ fontWeight: 600, fontSize: 14, color: S.text }}>
                      {msg.author?.name ?? (msg.senderType === "COMPANY" ? "Empresa" : "Usuário")}
                      {msg.senderType === "COMPANY" && complaint.company?.name && ` - ${complaint.company.name}`}
                    </span>
                    <span style={{ fontSize: 12, color: S.muted }}>{formatDateTime(msg.createdAt)}</span>
                  </div>
                  <p style={{ fontSize: 14, color: S.text, lineHeight: 1.6, margin: 0, whiteSpace: "pre-wrap" }}>
                    {msg.content}
                  </p>
                  {msg.attachmentPath && (
                    <div style={{ marginTop: 10 }}>
                      <a href={msg.attachmentPath} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: S.primary, fontWeight: 500 }}>
                        Anexos: arquivo
                      </a>
                    </div>
                  )}
                </div>
              ))}

              {isResolved && (
                <div
                  style={{
                    background: S.primary,
                    borderRadius: 12,
                    padding: "16px 20px",
                    marginBottom: 12,
                    color: S.white,
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <span style={{ fontSize: 24 }}>✓</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>Chamado Concluído</div>
                    <div style={{ fontSize: 12, opacity: 0.9 }}>
                      Equipe {complaint.company?.name ?? "empresa"} · {formatDateTime(complaint.updatedAt)}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Enviar resposta */}
            {isAuthor && (
              <div
                style={{
                  background: S.white,
                  border: `1px solid ${S.border}`,
                  borderRadius: 16,
                  padding: "20px 24px",
                  boxShadow: "0 1px 3px 0 rgba(0,0,0,0.05)",
                }}
              >
                <h3 style={{ fontSize: 15, fontWeight: 700, color: S.text, margin: "0 0 12px 0" }}>Enviar resposta</h3>
                {feedback ? (
                  <div
                    style={{
                      borderRadius: 8,
                      padding: "10px 12px",
                      marginBottom: 12,
                      fontSize: 13,
                      background: feedback.type === "error" ? "#fef2f2" : "#f0fdf4",
                      color: feedback.type === "error" ? "#b91c1c" : "#166534",
                      border: `1px solid ${feedback.type === "error" ? "#fecaca" : "#bbf7d0"}`,
                    }}
                  >
                    {feedback.message}
                  </div>
                ) : null}
                <textarea
                  placeholder="Escrever sua resposta..."
                  rows={4}
                  value={reply}
                  disabled={pending}
                  onChange={(event) => setReply(event.target.value)}
                  style={{
                    width: "100%",
                    padding: 12,
                    borderRadius: 8,
                    border: `1px solid ${S.border}`,
                    fontSize: 14,
                    resize: "vertical",
                    marginBottom: 12,
                  }}
                />
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <Button
                    type="button"
                    disabled={pending}
                    onClick={submitReply}
                    style={{ background: S.primary, color: S.white }}
                    className="gap-2"
                  >
                    <Send style={{ width: 16, height: 16 }} /> Enviar resposta
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar: empresa + CTA */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {complaint.companyId && (
              <>
                <div
                  style={{
                    background: S.white,
                    border: `1px solid ${S.border}`,
                    borderRadius: 16,
                    padding: "20px 24px",
                    boxShadow: "0 1px 3px 0 rgba(0,0,0,0.05)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: "50%",
                        background: S.light,
                        overflow: "hidden",
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 18,
                        fontWeight: 700,
                        color: S.muted,
                      }}
                    >
                      {complaint.companyLogo ? (
                        <Image src={complaint.companyLogo} alt="" width={48} height={48} style={{ objectFit: "cover" }} />
                      ) : (
                        (complaint.company?.name ?? "E").charAt(0).toUpperCase()
                      )}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 15, color: S.text }}>{complaint.company?.name}</div>
                      {complaint.companyVerified && (
                        <span style={{ fontSize: 10, fontWeight: 700, color: S.green }}>VERIFICADA</span>
                      )}
                    </div>
                  </div>
                  {complaint.companyStats != null && (
                    <>
                      <div style={{ marginBottom: 12 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: S.muted, marginBottom: 4 }}>
                          <span>Taxa de resolução</span>
                          <span>{complaint.companyStats.resolutionRate}%</span>
                        </div>
                        <div style={{ height: 6, background: S.light, borderRadius: 3, overflow: "hidden" }}>
                          <div
                            style={{
                              height: "100%",
                              width: `${complaint.companyStats.resolutionRate}%`,
                              background: S.green,
                              borderRadius: 3,
                            }}
                          />
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: S.text }}>
                          <MessageCircle style={{ width: 16, height: 16, color: S.muted }} />
                          {complaint.companyStats.activeDialogsCount} diálogos ativos
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: S.text }}>
                          <Check style={{ width: 16, height: 16, color: S.green }} />
                          {complaint.companyStats.resolvedCases} casos resolvidos
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: S.text }}>
                          <BarChart3 style={{ width: 16, height: 16, color: S.muted }} />
                          {complaint.companyStats.activeProjectsCount} projetos em andamento
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: S.text }}>
                          <Clock style={{ width: 16, height: 16, color: S.muted }} />
                          Resposta em {complaint.companyStats.avgResponseHours != null ? `${complaint.companyStats.avgResponseHours}h` : "-"}
                        </div>
                      </div>
                    </>
                  )}
                  {complaint.companySlug && (
                    <Link
                      href={`/company/${complaint.companySlug}`}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                        fontSize: 13,
                        fontWeight: 600,
                        color: S.primary,
                        textDecoration: "none",
                      }}
                    >
                      Ver página da empresa <ExternalLink style={{ width: 14, height: 14 }} />
                    </Link>
                  )}
                </div>

                <div
                  style={{
                    background: S.white,
                    border: `1px solid ${S.border}`,
                    borderRadius: 16,
                    padding: "20px 24px",
                    boxShadow: "0 1px 3px 0 rgba(0,0,0,0.05)",
                  }}
                >
                  <p style={{ fontSize: 14, color: S.text, margin: "0 0 14px 0", lineHeight: 1.5 }}>
                    Está querendo fazer um relato sobre {complaint.company?.name}?
                  </p>
                  <Link href={isLoggedIn ? `/app/complaints/new?company=${complaint.companyId}` : "/login"}>
                    <Button style={{ width: "100%", background: S.primary, color: S.white }} className="gap-2">
                      <FileText style={{ width: 18, height: 18 }} /> Criar um relato
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
