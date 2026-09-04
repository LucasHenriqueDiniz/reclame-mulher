"use client";

import { useId, useState, useTransition } from "react";
import { companyTheme as S } from "./theme";
import { ModalShell } from "./ModalShell";

export type ProjectFormValues = {
  name: string;
  description: string;
  location: string;
  status: string;
  start_date: string;
  end_date: string;
};

/**
 * What leaves the form on save: the fields above with the untouched ones dropped
 * rather than sent as empty strings, which is what the update route needs to
 * tell "clear this" from "leave this alone".
 */
export type ProjectSubmitValues = {
  name: string;
  description?: string;
  location?: string;
  status: string;
  start_date?: string;
  end_date?: string;
};

const STATUS_OPTIONS = [
  { value: "PLANNING", label: "Planejamento" },
  { value: "IN_PROGRESS", label: "Em andamento" },
  { value: "COMPLETED", label: "Concluído" },
  { value: "CANCELLED", label: "Cancelado" },
];

const emptyForm: ProjectFormValues = {
  name: "",
  description: "",
  location: "",
  status: "PLANNING",
  start_date: "",
  end_date: "",
};

/**
 * The create-and-edit form. It owns the fields, the required-title check and the
 * pending and error state around the save, but not the save itself: `onSubmit`
 * is handed in, so the caller decides where a project is written and what is
 * refreshed afterwards. It used to `fetch` the route directly, which is why a
 * saved project could reach the server without reaching the caller's list.
 */
export function CompanyProjectFormModal({
  project,
  onClose,
  onSubmit,
}: {
  project?: {
    id: string;
    name: string;
    description?: string | null;
    location?: string | null;
    status: string;
    startDate?: string | null;
    endDate?: string | null;
  } | null;
  onClose: () => void;
  onSubmit: (values: ProjectSubmitValues) => Promise<unknown>;
}) {
  const [form, setForm] = useState<ProjectFormValues>(
    project
      ? {
          name: project.name,
          description: project.description ?? "",
          location: project.location ?? "",
          status: project.status,
          start_date: project.startDate?.toString().slice(0, 10) ?? "",
          end_date: project.endDate?.toString().slice(0, 10) ?? "",
        }
      : emptyForm
  );
  const [pending, startTransition] = useTransition();
  const [err, setErr] = useState("");
  const statusId = useId();

  function submit() {
    setErr("");
    if (!form.name.trim()) {
      setErr("Título do projeto é obrigatório");
      return;
    }
    startTransition(async () => {
      try {
        await onSubmit({
          name: form.name,
          description: form.description || undefined,
          location: form.location || undefined,
          status: form.status,
          start_date: form.start_date || undefined,
          end_date: form.end_date || undefined,
        });
      } catch (error) {
        setErr(error instanceof Error ? error.message : "Erro ao salvar");
        return;
      }
      onClose();
    });
  }

  const set = (k: keyof ProjectFormValues, v: string) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  return (
    <ModalShell onClose={onClose} maxWidth={520}>
      <h2
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: S.text,
          marginBottom: 20,
        }}
      >
        {project ? "Editar projeto" : "Novo projeto"}
      </h2>
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
      <Input
        label="Título do projeto"
        value={form.name}
        onChange={(v) => set("name", v)}
      />
      <Input
        label="Descrição do projeto"
        value={form.description}
        onChange={(v) => set("description", v)}
        textarea
      />
      <Input
        label="Localização do projeto"
        value={form.location}
        onChange={(v) => set("location", v)}
        placeholder="Ex: São Paulo, SP"
      />
      <div style={{ marginBottom: 16 }}>
        <label
          htmlFor={statusId}
          style={{
            display: "block",
            fontSize: 13,
            fontWeight: 600,
            color: S.text,
            marginBottom: 6,
          }}
        >
          Status do projeto
        </label>
        <select
          id={statusId}
          value={form.status}
          onChange={(e) => set("status", e.target.value)}
          style={{
            width: "100%",
            padding: "10px 14px",
            borderRadius: 8,
            border: `1px solid ${S.border}`,
            fontSize: 14,
            color: S.text,
            background: S.white,
            boxSizing: "border-box",
          }}
        >
          {STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <Input
          label="Data de início"
          type="date"
          value={form.start_date}
          onChange={(v) => set("start_date", v)}
        />
        <Input
          label="Estimativa de término"
          type="date"
          value={form.end_date}
          onChange={(v) => set("end_date", v)}
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
            background: S.primary,
            color: S.white,
            border: "none",
            borderRadius: 8,
            padding: "10px 20px",
            cursor: pending ? "not-allowed" : "pointer",
            fontWeight: 600,
            opacity: pending ? 0.6 : 1,
          }}
        >
          {pending ? "Salvando…" : project ? "Salvar" : "Criar"}
        </button>
      </div>
    </ModalShell>
  );
}

function Input({
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
  const id = useId();
  const style = {
    width: "100%" as const,
    padding: "10px 14px",
    borderRadius: 8,
    border: `1px solid ${S.border}`,
    fontSize: 14,
    color: S.text,
    outline: "none",
    background: S.white,
    resize: "vertical" as const,
    boxSizing: "border-box" as const,
  };
  return (
    <div style={{ marginBottom: 16 }}>
      <label
        htmlFor={id}
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
          id={id}
          rows={3}
          style={style}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      ) : (
        <input
          id={id}
          type={type}
          style={style}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
      )}
    </div>
  );
}
