"use client";

import { useState } from "react";
import {
  companyTheme as S,
  CompanyProfileDataForm,
  CompanyPasswordForm,
  CompanyTeamManagement,
  CompanyVerificationPanel,
  CompanyDeleteAccountModal,
} from "@/components/company";

export type Company = Record<string, string | null | boolean | number | undefined>;

/**
 * The dashboard's settings tab and its five sub-tabs: company data, team,
 * password, verification, and account deletion.
 *
 * `company` arrives as an open record rather than a named row type, which is why
 * every field is funnelled through `String(...)` before it reaches a form. That
 * is the shape the parent holds, so it is passed through whole instead of being
 * destructured into eighteen props.
 */
export function SettingsTab({ company }: { company: Company }) {
  const [subTab, setSubTab] = useState("dados");
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const subTabs = [
    { key: "dados", label: "Dados" },
    { key: "equipe", label: "Equipe" },
    { key: "senha", label: "Mudar senha" },
    { key: "verificar", label: "Verificar" },
    { key: "deletar", label: "Deletar conta" },
  ];

  return (
    <div>
      <div
        style={{
          display: "flex",
          gap: 8,
          marginBottom: 24,
          flexWrap: "wrap",
          borderBottom: `1px solid ${S.border}`,
          paddingBottom: 12,
        }}
      >
        {subTabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setSubTab(t.key)}
            style={{
              padding: "7px 18px",
              borderRadius: 20,
              border: "none",
              background: subTab === t.key ? S.purple + "18" : "transparent",
              color: subTab === t.key ? S.purple : S.muted,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
      {subTab === "dados" && (
        <CompanyProfileDataForm
          company={{
            name: company.name ? String(company.name) : undefined,
            corporateName: company.corporateName
              ? String(company.corporateName)
              : undefined,
            cnpj: company.cnpj ? String(company.cnpj) : undefined,
            phone: company.phone ? String(company.phone) : undefined,
            website: company.website ? String(company.website) : undefined,
            email: company.email ? String(company.email) : undefined,
            city: company.city ? String(company.city) : undefined,
            neighborhood: company.neighborhood
              ? String(company.neighborhood)
              : undefined,
            state: company.state ? String(company.state) : undefined,
            streetNumber: company.streetNumber
              ? String(company.streetNumber)
              : undefined,
            address: company.address ? String(company.address) : undefined,
            description: company.description
              ? String(company.description)
              : undefined,
            region: company.region ? String(company.region) : undefined,
            sector: company.sector ? String(company.sector) : undefined,
            responsibleName: company.responsibleName
              ? String(company.responsibleName)
              : undefined,
            responsibleEmail: company.responsibleEmail
              ? String(company.responsibleEmail)
              : undefined,
            contactPhone: company.contactPhone
              ? String(company.contactPhone)
              : undefined,
            foundationDate: company.foundationDate
              ? String(company.foundationDate)
              : undefined,
          }}
        />
      )}
      {subTab === "equipe" && <CompanyTeamManagement />}
      {subTab === "senha" && <CompanyPasswordForm />}
      {subTab === "verificar" && (
        <CompanyVerificationPanel
          verifiedAt={
            company.verifiedAt ? String(company.verifiedAt) : null
          }
        />
      )}
      {subTab === "deletar" && (
        <div style={{ maxWidth: 480 }}>
          <h3
            style={{
              fontSize: 16,
              fontWeight: 700,
              color: S.red,
              marginBottom: 16,
            }}
          >
            Excluir conta da empresa
          </h3>
          <div
            style={{
              background: "#FEE2E2",
              border: `1px solid ${S.red}22`,
              borderRadius: 12,
              padding: 20,
              marginBottom: 20,
            }}
          >
            <p
              style={{
                fontSize: 14,
                color: S.text,
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              Ao excluir, os dados serão ocultados e a conta será permanentemente
              excluída após <strong>90 dias</strong>. Até lá você pode reativar
              fazendo login.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setDeleteModalOpen(true)}
            style={{
              background: S.red,
              color: S.white,
              border: "none",
              borderRadius: 8,
              padding: "10px 20px",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Excluir minha conta
          </button>
        </div>
      )}
      {deleteModalOpen && (
        <CompanyDeleteAccountModal
          onClose={() => setDeleteModalOpen(false)}
          onSuccess={() => setDeleteModalOpen(false)}
        />
      )}
    </div>
  );
}
