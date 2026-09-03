"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import { companyTheme as S } from "@/components/company/theme";
import { Button } from "@/components/ui/button";

interface ComplaintReplyFormProps {
  complaintId: string;
}

/**
 * The author's reply box, lifted out of `complaint-detail-content.tsx`.
 *
 * The `useTransition` moved with it rather than being threaded through props, which is
 * what makes this a clean cut: both reads of `pending` — the textarea and the submit
 * button — were already inside the block being extracted, so the transition, the two
 * pieces of state it guards and the fetch that drives it all live on one side of the
 * boundary. Nothing crosses it but the complaint id.
 */
export function ComplaintReplyForm({ complaintId }: ComplaintReplyFormProps) {
  const [reply, setReply] = useState("");
  const [feedback, setFeedback] = useState<{ type: "error" | "success"; message: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function submitReply() {
    setFeedback(null);
    if (!reply.trim()) {
      setFeedback({ type: "error", message: "Digite uma resposta antes de enviar." });
      return;
    }

    startTransition(async () => {
      const res = await fetch(`/api/complaints/${complaintId}/messages`, {
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
  );
}
