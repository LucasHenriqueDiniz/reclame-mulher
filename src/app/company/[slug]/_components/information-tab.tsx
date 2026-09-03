"use client";

import { formatDate } from "@/components/company";
import { Card, CardContent } from "@/components/ui/card";
import { InfoRow } from "./info-row";
import { type Company } from "./types";

export function InformationTab({ company }: { company: Company }) {
  const addr = [
    company.address,
    company.streetNumber && `nº ${company.streetNumber}`,
    company.neighborhood,
    company.city,
    company.state,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <Card className="border-0 shadow-md max-w-xl">
      <CardContent className="p-6">
        <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
          Informações cadastrais
        </h2>
        <InfoRow label="Nome fantasia" value={company.name ? String(company.name) : null} />
        <InfoRow label="Razão social" value={company.corporateName ? String(company.corporateName) : null} />
        <InfoRow label="CNPJ" value={company.cnpj ? String(company.cnpj) : null} />
        <InfoRow label="Setor" value={company.sector ? String(company.sector) : null} />
        <InfoRow label="Região" value={company.region ? String(company.region) : null} />
        <InfoRow label="Endereço" value={addr || undefined} />
        <InfoRow label="Site" value={company.website ? String(company.website) : null} />
        <InfoRow label="E-mail" value={company.email ? String(company.email) : null} />
        <InfoRow label="Telefone" value={company.phone ? String(company.phone) : null} />
        {company.foundationDate && (
          <InfoRow label="Fundação" value={formatDate(String(company.foundationDate))} />
        )}
        <InfoRow label="Cadastrada desde" value={company.createdAt ? formatDate(String(company.createdAt)) : null} />
      </CardContent>
    </Card>
  );
}
