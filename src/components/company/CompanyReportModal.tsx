"use client";

import { useState, useTransition } from "react";
import { companyTheme as S } from "./theme";
import { ModalShell } from "./ModalShell";

const REASONS = [
  "Informações falsas",
  "Empresa inexistente",
  "Comportamento abusivo",
  "Spam",
  "Outro",
];

export function CompanyReportModal({
  companyId,
  onClose,
  onSuccess,
}: {
  companyId: string;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);
  const [err, setErr] = useState("");

  function submit() {
    if (!reason.trim()) {
      setErr("Selecione um motivo");
      return;
    }
    setErr("");
    startTransition(async () => {
      const res = await fetch("/api/company/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId, reason, details }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(data.error ?? "Erro ao enviar denúncia");
        return;
      }
      setDone(true);
      onSuccess?.();
    });
  }

  return (
    <ModalShell onClose={onClose} maxWidth={480}>
      <h2
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: S.text,
          marginBottom: 20,
        }}
      >
        Denunciar empresa
      </h2>
      {done ? (
        <div>
          <div
            style={{
              background: "#D1FAE5",
              color: S.green,
              borderRadius: 8,
              padding: "12px 16px",
              marginBottom: 20,
              fontSize: 14,
            }}
          >
            Denúncia enviada com sucesso. Nossa equipe irá analisar.
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: S.primary,
              color: S.white,
              border: "none",
              borderRadius: 8,
              padding: "10px 20px",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Fechar
          </button>
        </div>
      ) : (
        <>
          {err && (
            <div
              style={{
                background: "#FEE2E2",
                color: S.red,
                borderRadius: 8,
                padding: "10px 14px",
                marginBottom: 16,
                fontSize: 13,
              }}
            >
              {err}
            </div>
          )}
          <div style={{ marginBottom: 16 }}>
            <label
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 600,
                color: S.text,
                marginBottom: 8,
              }}
            >
              Motivo da denúncia *
            </label>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {REASONS.map((r) => (
                <label
                  key={r}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="radio"
                    name="reason"
                    value={r}
                    checked={reason === r}
                    onChange={() => setReason(r)}
                  />
                  <span style={{ fontSize: 14, color: S.text }}>{r}</span>
                </label>
              ))}
            </div>
          </div>
          <div style={{ marginBottom: 20 }}>
            <label
              style={{
                display: "block",
                fontSize: 13,
                fontWeight: 600,
                color: S.text,
                marginBottom: 6,
              }}
            >
              Mais informações sobre a denúncia
            </label>
            <textarea
              rows={3}
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Descreva brevemente..."
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: 8,
                border: `1px solid ${S.border}`,
                fontSize: 14,
                color: S.text,
                resize: "vertical",
                boxSizing: "border-box",
              }}
            />
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: "none",
                border: `1px solid ${S.border}`,
                color: S.text,
                borderRadius: 8,
                padding: "10px 18px",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={submit}
              disabled={pending}
              style={{
                background: S.red,
                color: S.white,
                border: "none",
                borderRadius: 8,
                padding: "10px 20px",
                cursor: pending ? "not-allowed" : "pointer",
                fontWeight: 600,
                opacity: pending ? 0.6 : 1,
              }}
            >
              {pending ? "Enviando…" : "Enviar denúncia"}
            </button>
          </div>
        </>
      )}
    </ModalShell>
  );
}
