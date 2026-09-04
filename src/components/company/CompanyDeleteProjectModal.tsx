"use client";

import { useState, useTransition } from "react";
import { companyTheme as S } from "./theme";
import { ModalShell } from "./ModalShell";

export type ProjectItem = {
  id: string;
  name: string;
};

/**
 * The delete confirmation. Like the form modal it no longer calls the route
 * itself — `onConfirm` does, so the caller can refresh its list off the same
 * promise this modal closes on.
 */
export function CompanyDeleteProjectModal({
  project,
  onClose,
  onConfirm,
}: {
  project: ProjectItem;
  onClose: () => void;
  onConfirm: () => Promise<unknown>;
}) {
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState("");

  function confirm() {
    setErr("");
    startTransition(async () => {
      try {
        await onConfirm();
      } catch (error) {
        // The old version returned on a failed response without saying so, which
        // left the modal open and the user with no way to tell a refused delete
        // from a slow one.
        setErr(error instanceof Error ? error.message : "Erro ao excluir");
        return;
      }
      onClose();
    });
  }

  return (
    <ModalShell onClose={onClose} maxWidth={440}>
      <h2
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: S.text,
          marginBottom: 12,
        }}
      >
        Excluir projeto?
      </h2>
      <p
        style={{
          color: S.muted,
          marginBottom: 24,
          fontSize: 14,
          lineHeight: 1.5,
        }}
      >
        O projeto <strong>{project.name}</strong> será excluído. Esta ação não
        pode ser desfeita.
      </p>
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
          onClick={confirm}
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
          {pending ? "Excluindo…" : "Excluir"}
        </button>
      </div>
    </ModalShell>
  );
}
