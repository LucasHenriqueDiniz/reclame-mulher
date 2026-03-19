"use client";

import { useState, useTransition } from "react";
import { companyTheme as S } from "./theme";
import { formatCnpj } from "./utils";

type CompanyData = {
  name?: string | null;
  corporateName?: string | null;
  cnpj?: string | null;
  phone?: string | null;
  website?: string | null;
  email?: string | null;
  city?: string | null;
  neighborhood?: string | null;
  state?: string | null;
  streetNumber?: string | null;
  address?: string | null;
  description?: string | null;
  region?: string | null;
  sector?: string | null;
  responsibleName?: string | null;
  responsibleEmail?: string | null;
  contactPhone?: string | null;
  foundationDate?: string | null;
};

function inputStyle() {
  return {
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
}

export function CompanyProfileDataForm({
  company,
  onSuccess,
}: {
  company: CompanyData;
  onSuccess?: () => void;
}) {
  const [form, setForm] = useState({
    name: String(company.name ?? ""),
    corporateName: String(company.corporateName ?? ""),
    cnpj: company.cnpj ? formatCnpj(company.cnpj) : "",
    phone: String(company.phone ?? ""),
    website: String(company.website ?? ""),
    email: String(company.email ?? ""),
    city: String(company.city ?? ""),
    neighborhood: String(company.neighborhood ?? ""),
    state: String(company.state ?? ""),
    streetNumber: String(company.streetNumber ?? ""),
    address: String(company.address ?? ""),
    description: String(company.description ?? ""),
    region: String(company.region ?? ""),
    sector: String(company.sector ?? ""),
    responsibleName: String(company.responsibleName ?? ""),
    responsibleEmail: String(company.responsibleEmail ?? ""),
    contactPhone: String(company.contactPhone ?? ""),
    foundationDate: company.foundationDate
      ? String(company.foundationDate).slice(0, 10)
      : "",
  });
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  const set = (k: keyof typeof form, v: string) =>
    setForm((p) => ({ ...p, [k]: v }));

  function save() {
    setMsg("");
    setErr("");
    const payload = {
      ...form,
      cnpj: form.cnpj.replace(/\D/g, "") || null,
      foundationDate: form.foundationDate || null,
    };
    startTransition(async () => {
      const res = await fetch("/api/company/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErr(data.error ?? "Erro ao salvar");
        return;
      }
      setMsg("Dados atualizados com sucesso!");
      onSuccess?.();
    });
  }

  return (
    <div style={{ maxWidth: 560 }}>
      <h3
        style={{
          fontSize: 16,
          fontWeight: 700,
          color: S.text,
          marginBottom: 20,
        }}
      >
        Dados da empresa
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
      <Field label="Nome da empresa" value={form.name} onChange={(v) => set("name", v)} />
      <Field label="Razão social" value={form.corporateName} onChange={(v) => set("corporateName", v)} />
      <Field label="CNPJ" value={form.cnpj} onChange={(v) => set("cnpj", v)} placeholder="00.000.000/0000-00" />
      <Field label="Telefone" value={form.phone} onChange={(v) => set("phone", v)} />
      <Field label="Website" value={form.website} onChange={(v) => set("website", v)} placeholder="https://..." />
      <Field label="E-mail" value={form.email} onChange={(v) => set("email", v)} type="email" />
      <h3
        style={{
          fontSize: 16,
          fontWeight: 700,
          color: S.text,
          margin: "24px 0 16px",
        }}
      >
        Endereço
      </h3>
      <Field label="Endereço" value={form.address} onChange={(v) => set("address", v)} />
      <Field label="Número" value={form.streetNumber} onChange={(v) => set("streetNumber", v)} />
      <Field label="Bairro" value={form.neighborhood} onChange={(v) => set("neighborhood", v)} />
      <Field label="Cidade" value={form.city} onChange={(v) => set("city", v)} />
      <Field label="Estado" value={form.state} onChange={(v) => set("state", v)} placeholder="UF" />
      <Field label="Região" value={form.region} onChange={(v) => set("region", v)} placeholder="Ex: Sudeste" />
      <Field label="Descrição" value={form.description} onChange={(v) => set("description", v)} textarea />
      <h3 style={{ fontSize: 16, fontWeight: 700, color: S.text, margin: "24px 0 16px" }}>Contato responsável</h3>
      <Field label="Nome do responsável" value={form.responsibleName} onChange={(v) => set("responsibleName", v)} />
      <Field label="E-mail do responsável" value={form.responsibleEmail} onChange={(v) => set("responsibleEmail", v)} type="email" />
      <Field label="Telefone de contato" value={form.contactPhone} onChange={(v) => set("contactPhone", v)} />
      <Field label="Setor de atuação" value={form.sector} onChange={(v) => set("sector", v)} placeholder="Ex: Varejo, Saúde" />
      <Field label="Data de fundação" value={form.foundationDate} onChange={(v) => set("foundationDate", v)} type="date" />
      <div style={{ marginTop: 24 }}>
        <button
          type="button"
          onClick={save}
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
          {pending ? "Salvando…" : "Salvar alterações"}
        </button>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  textarea,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
  textarea?: boolean;
}) {
  const style = inputStyle();
  return (
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
        {label}
      </label>
      {textarea ? (
        <textarea
          rows={3}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{ ...style, resize: "vertical" }}
        />
      ) : (
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={style}
        />
      )}
    </div>
  );
}
