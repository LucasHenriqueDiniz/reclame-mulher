"use client";

import { useState, useTransition } from "react";
import { companyTheme as S } from "./theme";
import { ModalShell } from "./ModalShell";

export function CompanyDeleteAccountModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess?: () => void;
}) {
  const [confirm, setConfirm] = useState(false);
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);

  function submit() {
    startTransition(async () => {
      const res = await fetch("/api/company/profile", { method: "DELETE" });
      if (!res.ok) return;
      setDone(true);
      onSuccess?.();
    });
  }

  if (done) {
    return (
      <ModalShell onClose={onClose} maxWidth={480}>
        <div
          style={{
            background: "#FEF3C7",
            border: `1px solid ${S.yellow}`,
            borderRadius: 12,
            padding: 20,
          }}
        >
          <div
            style={{
              fontWeight: 700,
              color: S.orange,
              marginBottom: 8,
            }}
          >
            Exclusão agendada
          </div>
          <p style={{ fontSize: 14, color: S.text, margin: 0 }}>
            Sua conta será excluída definitivamente em 90 dias. Até lá, você
            pode reativar fazendo login.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          style={{
            marginTop: 20,
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
      </ModalShell>
    );
  }

  return (
    <ModalShell onClose={onClose} maxWidth={480}>
      <h2
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: S.red,
          marginBottom: 16,
        }}
      >
        Excluir conta da empresa
      </h2>
      <div
        style={{
          background: "#FEE2E2",
          border: `1px solid ${S.red}22`,
          borderRadius: 12,
          padding: 20,
          marginBottom: 20,
        }}
      >
        <p style={{ fontSize: 14, color: S.text, lineHeight: 1.6, margin: 0 }}>
          A conta será ocultada do perfil público e agendada para exclusão
          permanente em <strong>90 dias</strong>. Até lá você pode reativar
          fazendo login.
        </p>
      </div>
      {!confirm ? (
        <button
          type="button"
          onClick={() => setConfirm(true)}
          style={{
            background: S.red,
            color: S.white,
            border: "none",
            borderRadius: 8,
            padding: "10px 20px",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Quero excluir minha conta
        </button>
      ) : (
        <div>
          <p
            style={{
              fontSize: 14,
              color: S.text,
              marginBottom: 16,
            }}
          >
            Tem certeza? Esta ação agendará a exclusão definitiva.
          </p>
          <div style={{ display: "flex", gap: 12 }}>
            <button
              type="button"
              onClick={() => setConfirm(false)}
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
              {pending ? "Processando…" : "Confirmar exclusão"}
            </button>
          </div>
        </div>
      )}
    </ModalShell>
  );
}
