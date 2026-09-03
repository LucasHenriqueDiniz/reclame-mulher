"use client";

import { useState } from "react";
import {
  companyTheme as S,
  CompanyComplaintList,
  SearchInput,
} from "@/components/company";

export type Complaint = {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
  author?: { name: string | null } | null;
  project?: { name: string } | null;
};

/**
 * The dashboard's complaints tab: a status filter and a title search over the
 * list the page already fetched.
 *
 * Both are display-only — `filter` and `search` narrow the array in place and
 * never round-trip to the server, so the tab shows exactly what the parent was
 * given and nothing newer.
 */
export function ComplaintsTab({
  complaints,
  detailBasePath,
}: {
  complaints: Complaint[];
  detailBasePath: string;
}) {
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const filtered = complaints.filter((c) => {
    const matchFilter = filter === "ALL" || c.status === filter;
    const matchSearch =
      !search.trim() ||
      c.title.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const filters = [
    { key: "ALL", label: "Todas" },
    { key: "OPEN", label: "Abertas" },
    { key: "RESPONDED", label: "Respondidas" },
    { key: "RESOLVED", label: "Resolvidas" },
  ];

  return (
    <div>
      <div
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 20,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Buscar reclamações..."
        />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {filters.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              style={{
                padding: "7px 16px",
                borderRadius: 20,
                border: `1px solid ${filter === f.key ? S.primary : S.border}`,
                background: filter === f.key ? S.primary : S.white,
                color: filter === f.key ? S.white : S.text,
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>
      <CompanyComplaintList
        complaints={filtered.map((c) => ({
          id: c.id,
          title: c.title,
          status: c.status,
          createdAt: c.createdAt,
          author: c.author,
          project: c.project,
        }))}
        detailBasePath={detailBasePath}
        showAuthor={true}
      />
    </div>
  );
}
