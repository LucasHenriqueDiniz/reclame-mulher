"use client";

import { useState, useTransition } from "react";
import { companyTheme as S } from "./theme";

const inputStyle = {
  width: "100%" as const,
  padding: "10px 14px",
  borderRadius: 8,
  border: `1px solid ${S.border}`,
  fontSize: 14,
  color: S.text,
  outline: "none",
  background: S.white,
  boxSizing: "border-box" as const,
};

export function CompanyPasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  function change() {
    setMsg("");
    setErr("");
    if (newPassword !== confirmPassword) {
      setErr("As senhas não coincidem");
      return;
    }
    if (newPassword.length < 8) {
      setErr("Mínimo 8 caracteres");
      return;
    }
    if (!currentPassword) {
      setErr("Informe a senha atual");
      return;
    }
    startTransition(async () => {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(data.error ?? "Erro ao alterar senha");
        return;
      }
      setMsg("Senha alterada com sucesso!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    });
  }

  return (
    <div style={{ maxWidth: 400 }}>
      <h3
        style={{
          fontSize: 16,
          fontWeight: 700,
          color: S.text,
          marginBottom: 20,
        }}
      >
        Mudar senha
      </h3>
      {msg && (
        <div
          style={{
            background: "#D1FAE5",
            color: S.green,
            borderRadius: 8,
            padding: "10px 14px",
            marginBottom: 16,
            fontSize: 13,
          }}
        >
          {msg}
        </div>
      )}
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
            marginBottom: 6,
          }}
        >
          Senha atual
        </label>
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          style={inputStyle}
        />
      </div>
      <div style={{ marginBottom: 16 }}>
        <label
          style={{
            display: "block",
            fontSize: 13,
            fontWeight: 600,
            color: S.text,
            marginBottom: 6,
          }}
        >
          Nova senha
        </label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          style={inputStyle}
        />
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
          Confirmar nova senha
        </label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          style={inputStyle}
        />
      </div>
      <button
        type="button"
        onClick={change}
        disabled={pending}
        style={{
          background: S.primary,
          color: S.white,
          border: "none",
          borderRadius: 8,
          padding: "11px 22px",
          fontSize: 14,
          fontWeight: 600,
          cursor: pending ? "not-allowed" : "pointer",
          opacity: pending ? 0.6 : 1,
        }}
      >
        {pending ? "Alterando…" : "Alterar senha"}
      </button>
    </div>
  );
}
