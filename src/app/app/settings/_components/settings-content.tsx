"use client";

import { useState } from "react";
import Link from "next/link";
import { MapPin, FileText, Eye, EyeOff, Trash2, X, Mail, Phone } from "lucide-react";

const PRIMARY = "#2189E5";
const PURPLE = "#1E0F62";
const TEXT = "#2E435B";
const MUTED = "#6E8195";
const BORDER = "#D9E3EC";
const BG = "#F4F6F8";

interface Props {
  email: string;
  profileName: string;
  profileCity: string | null;
  profileState: string | null;
  profilePhone: string | null;
  profileAddress: string | null;
  avatarUrl: string | null;
}

type SettingsTab = "info" | "password" | "delete";

const SETTINGS_TABS: { key: SettingsTab; label: string }[] = [
  { key: "info", label: "Informações" },
  { key: "password", label: "Senha" },
  { key: "delete", label: "Deletar" },
];

function Avatar({ name, avatarUrl }: { name: string; avatarUrl: string | null }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div
      style={{
        width: 88,
        height: 88,
        borderRadius: "50%",
        border: "4px solid #fff",
        overflow: "hidden",
        background: PRIMARY,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: 28,
        fontWeight: 700,
        color: "#fff",
        flexShrink: 0,
      }}
    >
      {avatarUrl ? (
        <img src={avatarUrl} alt={name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      ) : (
        initials
      )}
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label style={{ fontSize: 13, fontWeight: 600, color: TEXT, marginBottom: 6, display: "block" }}>
      {children}
    </label>
  );
}

function InputField({
  value,
  onChange,
  placeholder,
  type = "text",
  disabled,
  icon,
}: {
  value: string;
  onChange?: (v: string) => void;
  placeholder?: string;
  type?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}) {
  return (
    <div style={{ position: "relative" }}>
      {icon && (
        <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: MUTED, display: "flex" }}>
          {icon}
        </span>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        style={{
          width: "100%",
          height: 48,
          border: `1px solid ${BORDER}`,
          borderRadius: 10,
          padding: icon ? "0 14px 0 40px" : "0 14px",
          fontSize: 14,
          color: disabled ? MUTED : TEXT,
          background: disabled ? "#F8FAFC" : "#fff",
          outline: "none",
          boxSizing: "border-box",
          cursor: disabled ? "not-allowed" : "text",
        }}
      />
    </div>
  );
}

function PasswordInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? "••••••••"}
        style={{
          width: "100%",
          height: 48,
          border: `1px solid ${BORDER}`,
          borderRadius: 10,
          padding: "0 44px 0 14px",
          fontSize: 14,
          color: TEXT,
          background: "#fff",
          outline: "none",
          boxSizing: "border-box",
        }}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        style={{
          position: "absolute",
          right: 14,
          top: "50%",
          transform: "translateY(-50%)",
          background: "none",
          border: "none",
          cursor: "pointer",
          color: MUTED,
          display: "flex",
        }}
      >
        {show ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}

function DeleteModal({ onClose }: { onClose: () => void }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.45)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 24,
          padding: "40px 36px 32px",
          maxWidth: 440,
          width: "100%",
          position: "relative",
          textAlign: "center",
        }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            background: "none",
            border: "none",
            cursor: "pointer",
            color: MUTED,
            display: "flex",
          }}
        >
          <X size={20} />
        </button>

        {/* Icon */}
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: "#FFF3EC",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 20px",
          }}
        >
          <Trash2 size={32} color="#E8721D" />
        </div>

        <h3 style={{ fontSize: 22, fontWeight: 700, color: TEXT, margin: "0 0 10px" }}>
          Você tem certeza?
        </h3>
        <p style={{ fontSize: 14, color: MUTED, lineHeight: 1.6, margin: "0 0 10px" }}>
          Ao deletar sua conta iremos remover todos os seus dados do nosso banco de dados.
        </p>
        <p style={{ fontSize: 14, fontWeight: 600, color: "#E8721D", margin: "0 0 24px" }}>
          Esta é uma ação irreversível!
        </p>

        <hr style={{ border: "none", borderTop: `1px solid ${BORDER}`, margin: "0 0 24px" }} />

        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              height: 48,
              border: `1px solid ${BORDER}`,
              borderRadius: 10,
              background: "#fff",
              color: TEXT,
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              // TODO: [API: DELETE /api/user/account]
            }}
            style={{
              flex: 1,
              height: 48,
              border: "none",
              borderRadius: 10,
              background: "#E8721D",
              color: "#fff",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Deletar
          </button>
        </div>
      </div>
    </div>
  );
}

export function SettingsContent({
  email,
  profileName,
  profileCity,
  profileState,
  profilePhone,
  profileAddress,
  avatarUrl,
}: Props) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("info");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [name, setName] = useState(profileName);
  const [phone, setPhone] = useState(profilePhone ?? "");
  const [city, setCity] = useState(profileCity ?? "");
  const [state, setState] = useState(profileState ?? "");
  const [address, setAddress] = useState(profileAddress ?? "");
  const [bairro, setBairro] = useState("");
  const [numero, setNumero] = useState("");

  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");

  const location = [profileCity, profileState].filter(Boolean).join(", ");

  return (
    <>
      {showDeleteModal && <DeleteModal onClose={() => setShowDeleteModal(false)} />}

      <div style={{ background: BG, minHeight: "100vh", paddingBottom: 48 }}>
        <div style={{ maxWidth: 1140, margin: "0 auto", padding: "32px 24px 0" }}>

          {/* ── Profile Hero Card ── */}
          <div style={{ background: "#fff", borderRadius: 16, border: `1px solid ${BORDER}`, overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <div style={{ height: 96, background: `linear-gradient(135deg, ${PRIMARY} 0%, #1a6fc9 100%)` }} />

            <div style={{ padding: "0 28px 0" }}>
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginTop: -44 }}>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 16 }}>
                  <Avatar name={profileName || "U"} avatarUrl={avatarUrl} />
                  <div style={{ paddingBottom: 12 }}>
                    <h2 style={{ fontSize: 20, fontWeight: 700, color: PURPLE, margin: 0 }}>{profileName}</h2>
                    <div style={{ display: "flex", gap: 16, marginTop: 4 }}>
                      {location && (
                        <span style={{ fontSize: 13, color: MUTED, display: "flex", alignItems: "center", gap: 4 }}>
                          <MapPin size={13} />
                          {location}
                        </span>
                      )}
                      <span style={{ fontSize: 13, color: MUTED, display: "flex", alignItems: "center", gap: 4 }}>
                        <FileText size={13} />
                        Configurações da conta
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Profile-level tabs (Reclamações / Configurações) */}
              <div style={{ display: "flex", gap: 0, marginTop: 16, borderTop: `1px solid ${BORDER}` }}>
                {[
                  { label: "Reclamações", href: "/app/complaints", active: false },
                  { label: "Configurações", href: "/app/settings", active: true },
                ].map((tab) => (
                  <Link
                    key={tab.label}
                    href={tab.href}
                    style={{
                      textDecoration: "none",
                      padding: "14px 20px",
                      fontSize: 14,
                      fontWeight: 600,
                      color: tab.active ? PRIMARY : MUTED,
                      borderBottom: tab.active ? `2px solid ${PRIMARY}` : "2px solid transparent",
                      marginBottom: -1,
                    }}
                  >
                    {tab.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* ── Settings Card ── */}
          <div style={{ background: "#fff", borderRadius: 16, border: `1px solid ${BORDER}`, marginTop: 20, boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" }}>
            {/* Sub-tabs */}
            <div style={{ display: "flex", padding: "0 24px", borderBottom: `1px solid ${BORDER}` }}>
              {SETTINGS_TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setActiveTab(t.key)}
                  style={{
                    background: "none",
                    border: "none",
                    padding: "16px 20px",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                    color: activeTab === t.key ? PRIMARY : MUTED,
                    borderBottom: activeTab === t.key ? `2px solid ${PRIMARY}` : "2px solid transparent",
                    marginBottom: -1,
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div style={{ padding: 28 }}>
              {/* ── Informações ── */}
              {activeTab === "info" && (
                <div>
                  <div style={{ marginBottom: 20 }}>
                    <FieldLabel>Nome completo</FieldLabel>
                    <InputField value={name} onChange={setName} placeholder="Seu nome completo" />
                  </div>

                  <div style={{ marginBottom: 20 }}>
                    <FieldLabel>Email</FieldLabel>
                    <InputField
                      value={email}
                      disabled
                      placeholder="email@exemplo.com"
                      icon={<Mail size={15} />}
                    />
                    <p style={{ fontSize: 12, color: MUTED, marginTop: 4 }}>O e-mail não pode ser alterado.</p>
                  </div>

                  <div style={{ marginBottom: 20 }}>
                    <FieldLabel>Telefone</FieldLabel>
                    <InputField value={phone} onChange={setPhone} placeholder="(xx) 1234-56789" icon={<Phone size={15} />} />
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                    <div>
                      <FieldLabel>Cidade</FieldLabel>
                      <InputField value={city} onChange={setCity} placeholder="Sua cidade" />
                    </div>
                    <div>
                      <FieldLabel>Bairro</FieldLabel>
                      <InputField value={bairro} onChange={setBairro} placeholder="Seu bairro" />
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                    <div>
                      <FieldLabel>Estado</FieldLabel>
                      <InputField value={state} onChange={setState} placeholder="UF" />
                    </div>
                    <div>
                      <FieldLabel>Número</FieldLabel>
                      <InputField value={numero} onChange={setNumero} placeholder="Nº" />
                    </div>
                  </div>

                  <div style={{ marginBottom: 28 }}>
                    <FieldLabel>Endereço</FieldLabel>
                    <InputField value={address} onChange={setAddress} placeholder="Rua, número, bairro" />
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, paddingTop: 20, borderTop: `1px solid ${BORDER}` }}>
                    <button
                      style={{
                        height: 44,
                        padding: "0 24px",
                        border: `1px solid ${BORDER}`,
                        borderRadius: 10,
                        background: "#fff",
                        color: TEXT,
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => {
                        // TODO: [API: PATCH /api/user/profile]
                      }}
                      style={{
                        height: 44,
                        padding: "0 24px",
                        border: "none",
                        borderRadius: 10,
                        background: PRIMARY,
                        color: "#fff",
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Salvar
                    </button>
                  </div>
                </div>
              )}

              {/* ── Senha ── */}
              {activeTab === "password" && (
                <div style={{ maxWidth: 480 }}>
                  <div style={{ marginBottom: 20 }}>
                    <FieldLabel>Senha Atual</FieldLabel>
                    <PasswordInput value={currentPwd} onChange={setCurrentPwd} />
                  </div>
                  <div style={{ marginBottom: 20 }}>
                    <FieldLabel>Nova Senha</FieldLabel>
                    <PasswordInput value={newPwd} onChange={setNewPwd} placeholder="Mínimo 8 caracteres" />
                  </div>
                  <div style={{ marginBottom: 28 }}>
                    <FieldLabel>Confirmar Nova Senha</FieldLabel>
                    <PasswordInput value={confirmPwd} onChange={setConfirmPwd} placeholder="Repita a nova senha" />
                  </div>

                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, paddingTop: 20, borderTop: `1px solid ${BORDER}` }}>
                    <button
                      style={{
                        height: 44,
                        padding: "0 24px",
                        border: `1px solid ${BORDER}`,
                        borderRadius: 10,
                        background: "#fff",
                        color: TEXT,
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={() => {
                        // TODO: [API: PATCH /api/auth/password]
                      }}
                      style={{
                        height: 44,
                        padding: "0 24px",
                        border: "none",
                        borderRadius: 10,
                        background: PRIMARY,
                        color: "#fff",
                        fontSize: 14,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Alterar Senha
                    </button>
                  </div>
                </div>
              )}

              {/* ── Deletar ── */}
              {activeTab === "delete" && (
                <div style={{ maxWidth: 560 }}>
                  <div
                    style={{
                      border: "1px solid #FED7AA",
                      borderRadius: 12,
                      padding: 20,
                      background: "#FFF7ED",
                      marginBottom: 24,
                    }}
                  >
                    <p style={{ fontSize: 14, color: TEXT, margin: 0, lineHeight: 1.6 }}>
                      Ao deletar sua conta, todos os seus dados serão permanentemente removidos — reclamações, mensagens e informações pessoais.{" "}
                      <strong style={{ color: "#E8721D" }}>Esta ação não pode ser desfeita.</strong>
                    </p>
                  </div>

                  <button
                    onClick={() => setShowDeleteModal(true)}
                    style={{
                      height: 46,
                      padding: "0 24px",
                      border: "none",
                      borderRadius: 10,
                      background: "#E8721D",
                      color: "#fff",
                      fontSize: 14,
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <Trash2 size={16} />
                    Deletar minha conta
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
