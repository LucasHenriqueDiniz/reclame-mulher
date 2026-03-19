"use client";

import { useTransition } from "react";
import { companyTheme as S } from "./theme";
import { ModalShell } from "./ModalShell";

export type ProjectItem = {
  id: string;
  name: string;
};

export function CompanyDeleteProjectModal({
  project,
  onClose,
  onSuccess,
}: {
  project: ProjectItem;
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const [pending, startTransition] = useTransition();

  function confirm() {
    startTransition(async () => {
      const res = await fetch(`/api/company/projects/${project.id}`, {
        method: "DELETE",
      });
      if (!res.ok) return;
      onSuccess?.();
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
