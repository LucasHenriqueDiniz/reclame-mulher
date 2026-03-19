"use client";

import { companyTheme as S } from "./theme";

export function SearchInput({
  value,
  onChange,
  placeholder = "Buscar...",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <input
      type="search"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      style={{
        width: "100%",
        maxWidth: 320,
        padding: "10px 14px 10px 40px",
        borderRadius: 10,
        border: `1px solid ${S.border}`,
        fontSize: 14,
        color: S.text,
        background: `${S.white} url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236E8195' stroke-width='2'%3E%3Ccircle cx='11' cy='11' r='8'/%3E%3Cpath d='m21 21-4.35-4.35'/%3E%3C/svg%3E") no-repeat 12px center`,
        outline: "none",
        boxSizing: "border-box",
      }}
    />
  );
}
