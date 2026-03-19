"use client";

import { useEffect, useState } from "react";
import { companyTheme as S } from "./theme";

type Member = {
  userId: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
  name: string | null;
  email: string | null;
};

type MembersResponse = {
  currentUserRole: "OWNER" | "ADMIN" | "MEMBER";
  members: Member[];
};

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

function canManage(role: string | null | undefined) {
  return role === "OWNER" || role === "ADMIN";
}

export function CompanyTeamManagement() {
  const [members, setMembers] = useState<Member[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<"OWNER" | "ADMIN" | "MEMBER" | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"ADMIN" | "MEMBER">("MEMBER");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [tempPassword, setTempPassword] = useState("");

  async function loadMembers() {
    try {
      setLoading(true);
      setError("");
      const response = await fetch("/api/company/users", { cache: "no-store" });
      const data = (await response.json().catch(() => ({}))) as Partial<MembersResponse> & { error?: string };

      if (!response.ok) {
        throw new Error(data.error ?? "Não foi possível carregar a equipe.");
      }

      setMembers(data.members ?? []);
      setCurrentUserRole(data.currentUserRole ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível carregar a equipe.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadMembers();
  }, []);

  async function createMember() {
    try {
      setSubmitting(true);
      setError("");
      setMessage("");
      setTempPassword("");

      const response = await fetch("/api/company/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, role }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
        temporaryPassword?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "Não foi possível criar o usuário.");
      }

      setName("");
      setEmail("");
      setRole("MEMBER");
      setMessage("Usuário interno criado com sucesso.");
      setTempPassword(data.temporaryPassword ?? "");
      await loadMembers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível criar o usuário.");
    } finally {
      setSubmitting(false);
    }
  }

  async function updateRole(userId: string, nextRole: "ADMIN" | "MEMBER") {
    try {
      setError("");
      setMessage("");
      const response = await fetch(`/api/company/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: nextRole }),
      });

      const data = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "Não foi possível atualizar o papel.");
      }

      setMessage("Papel atualizado com sucesso.");
      await loadMembers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível atualizar o papel.");
    }
  }

  async function removeMember(userId: string) {
    try {
      setError("");
      setMessage("");
      const response = await fetch(`/api/company/users/${userId}`, {
        method: "DELETE",
      });

      const data = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "Não foi possível remover o membro.");
      }

      setMessage("Membro removido com sucesso.");
      await loadMembers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível remover o membro.");
    }
  }

  const canManageUsers = canManage(currentUserRole);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div
        style={{
          background: S.white,
          border: `1px solid ${S.border}`,
          borderRadius: 16,
          padding: 20,
        }}
      >
        <h3 style={{ fontSize: 16, fontWeight: 700, color: S.text, marginBottom: 8 }}>
          Equipe da empresa
        </h3>
        <p style={{ fontSize: 14, color: S.muted, margin: 0, lineHeight: 1.6 }}>
          Cada pessoa usa sua própria conta. O acesso da empresa é controlado pela tabela de vínculos internos.
        </p>
      </div>

      {message ? (
        <div style={{ background: "#D1FAE5", color: S.green, borderRadius: 8, padding: "10px 14px", fontSize: 13 }}>
          {message}
        </div>
      ) : null}
      {error ? (
        <div style={{ background: "#FEE2E2", color: S.red, borderRadius: 8, padding: "10px 14px", fontSize: 13 }}>
          {error}
        </div>
      ) : null}
      {tempPassword ? (
        <div style={{ background: "#FEF3C7", color: "#92400E", borderRadius: 8, padding: "12px 14px", fontSize: 13, lineHeight: 1.6 }}>
          Senha temporária gerada: <strong>{tempPassword}</strong>. Compartilhe com a pessoa e peça para trocar no primeiro login.
        </div>
      ) : null}

      {canManageUsers ? (
        <div
          style={{
            background: S.white,
            border: `1px solid ${S.border}`,
            borderRadius: 16,
            padding: 20,
          }}
        >
          <h4 style={{ fontSize: 15, fontWeight: 700, color: S.text, marginBottom: 16 }}>
            Criar usuário interno
          </h4>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome completo" style={inputStyle} />
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@empresa.com" style={inputStyle} />
            <select value={role} onChange={(e) => setRole(e.target.value as "ADMIN" | "MEMBER")} style={inputStyle}>
              <option value="MEMBER">Membro</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>
          <button
            type="button"
            onClick={() => void createMember()}
            disabled={submitting || !name.trim() || !email.trim()}
            style={{
              marginTop: 16,
              background: S.primary,
              color: S.white,
              border: "none",
              borderRadius: 8,
              padding: "11px 22px",
              fontSize: 14,
              fontWeight: 600,
              cursor: submitting ? "not-allowed" : "pointer",
              opacity: submitting ? 0.6 : 1,
            }}
          >
            {submitting ? "Criando..." : "Criar usuário"}
          </button>
        </div>
      ) : null}

      <div
        style={{
          background: S.white,
          border: `1px solid ${S.border}`,
          borderRadius: 16,
          padding: 20,
        }}
      >
        <h4 style={{ fontSize: 15, fontWeight: 700, color: S.text, marginBottom: 16 }}>
          Membros atuais
        </h4>
        {loading ? (
          <p style={{ color: S.muted, margin: 0 }}>Carregando equipe...</p>
        ) : members.length === 0 ? (
          <p style={{ color: S.muted, margin: 0 }}>Nenhum membro encontrado.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {members.map((member) => {
              const isOwner = member.role === "OWNER";
              const canEditMember = canManageUsers && !isOwner;

              return (
                <div
                  key={member.userId}
                  style={{
                    border: `1px solid ${S.border}`,
                    borderRadius: 12,
                    padding: 16,
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                    flexWrap: "wrap",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: S.text }}>
                      {member.name || "Sem nome"}
                    </div>
                    <div style={{ fontSize: 13, color: S.muted, marginTop: 4 }}>
                      {member.email || "Sem e-mail"}
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    {canEditMember ? (
                      <select
                        value={member.role}
                        onChange={(e) => void updateRole(member.userId, e.target.value as "ADMIN" | "MEMBER")}
                        style={{ ...inputStyle, minWidth: 140 }}
                      >
                        <option value="MEMBER">Membro</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    ) : (
                      <span
                        style={{
                          padding: "7px 12px",
                          borderRadius: 999,
                          background: S.light,
                          color: S.text,
                          fontSize: 12,
                          fontWeight: 700,
                        }}
                      >
                        {member.role}
                      </span>
                    )}

                    {canEditMember ? (
                      <button
                        type="button"
                        onClick={() => void removeMember(member.userId)}
                        style={{
                          background: "#FEE2E2",
                          color: S.red,
                          border: "none",
                          borderRadius: 8,
                          padding: "10px 14px",
                          fontSize: 13,
                          fontWeight: 600,
                          cursor: "pointer",
                        }}
                      >
                        Remover
                      </button>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
