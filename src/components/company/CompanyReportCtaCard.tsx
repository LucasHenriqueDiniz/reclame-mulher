"use client";

import { Flag } from "lucide-react";
import { companyTheme as S } from "./theme";

export function CompanyReportCtaCard({ onReport }: { onReport: () => void }) {
  return (
    <div
      style={{
        background: "#FEE2E2",
        border: `1px solid ${S.red}44`,
        borderRadius: 16,
        padding: "20px 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: 16,
        boxShadow: "0 1px 3px 0 rgba(0,0,0,0.05)",
      }}
    >
      <div>
        <div
          style={{
            fontWeight: 700,
            color: S.text,
            marginBottom: 4,
            fontSize: 15,
          }}
        >
          Algo errado?
        </div>
        <div style={{ fontSize: 13, color: S.muted }}>
          Denuncie se encontrar informações falsas ou comportamento inadequado.
        </div>
      </div>
      <button
        type="button"
        onClick={onReport}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          background: S.white,
          color: S.red,
          border: `1px solid ${S.red}`,
          borderRadius: 10,
          padding: "10px 20px",
          fontSize: 14,
          fontWeight: 600,
          cursor: "pointer",
          whiteSpace: "nowrap",
        }}
      >
        <Flag style={{ width: 16, height: 16 }} />
        Denunciar
      </button>
    </div>
  );
}
