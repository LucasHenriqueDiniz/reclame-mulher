"use client";

import type { ReactNode } from "react";
import { companyTheme as S } from "./theme";

export function MetricCard({
  label,
  value,
  sub,
  color,
  icon,
}: {
  label: string;
  value: string | number;
  sub?: string;
  color?: string;
  icon?: ReactNode;
}) {
  return (
    <div
      style={{
        background: S.white,
        border: `1px solid ${S.border}`,
        borderRadius: 16,
        padding: "20px 24px",
        flex: "1 1 160px",
        minWidth: 0,
        boxShadow: "0 2px 8px 0 rgba(0,0,0,0.08)",
        transition: "all 0.3s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 8px 20px 0 rgba(0,0,0,0.12)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 2px 8px 0 rgba(0,0,0,0.08)";
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontSize: 13,
          color: S.muted,
          marginBottom: 10,
          fontFamily: "Poppins, sans-serif",
          fontWeight: 500,
        }}
      >
        {icon != null && (
          <span 
            style={{ 
              display: "flex", 
              color: color ?? S.primary,
              background: color ? `${color}15` : `${S.primary}15`,
              padding: 8,
              borderRadius: 8,
            }}
          >
            {icon}
          </span>
        )}
        <span>{label}</span>
      </div>
      <div 
        style={{ 
          fontSize: 32, 
          fontWeight: 700, 
          color: color ?? S.text,
          fontFamily: "Poppins, sans-serif",
          lineHeight: 1,
        }}
      >
        {value}
      </div>
      {sub != null && sub !== "" && (
        <div 
          style={{ 
            fontSize: 12, 
            color: S.muted, 
            marginTop: 6,
            fontFamily: "Poppins, sans-serif",
          }}
        >
          {sub}
        </div>
      )}
    </div>
  );
}
