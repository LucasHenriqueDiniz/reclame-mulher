"use client";

import { companyTheme as S } from "./theme";

export function TagChip({ label }: { label: string }) {
  return (
    <span
      style={{
        display: "inline-block",
        background: S.light,
        color: S.primary,
        borderRadius: 8,
        padding: "4px 12px",
        fontSize: 12,
        fontWeight: 500,
      }}
    >
      #{label}
    </span>
  );
}
