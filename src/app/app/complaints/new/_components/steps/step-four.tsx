"use client";

import { ComplaintField } from "../fields/complaint-field";
import { ComplaintSelect } from "../fields/complaint-select";
import { ComplaintSwitchRow } from "../fields/complaint-switch-row";

export interface StepFourData {
  impactCategory: string;
  companyProjectId: string;
  urgencyLevel: string;
  impactScope: string;
  isAnonymous: boolean;
  isPublic: boolean;
}

export interface StepFourProps {
  data: StepFourData;
  onChange: (data: StepFourData) => void;
  projects?: Array<{ id: string; name: string }>;
}

/**
 * Passo 4: Classificação da reclamação
 * Categoria, projeto, urgência, escopo e configurações de privacidade
 */
export function StepFour({ data, onChange, projects = [] }: StepFourProps) {
  const impactCategories = [
    { value: "meio_ambiente", label: "Meio Ambiente" },
    { value: "saude", label: "Saúde" },
    { value: "seguranca", label: "Segurança" },
    { value: "infraestrutura", label: "Infraestrutura" },
    { value: "social", label: "Social" },
    { value: "outro", label: "Outro" },
  ];

  const urgencyLevels = [
    { value: "baixa", label: "Baixa" },
    { value: "media", label: "Média" },
    { value: "alta", label: "Alta" },
    { value: "emergencial", label: "Emergencial" },
  ];

  const impactScopes = [
    { value: "individual", label: "Individual" },
    { value: "familiar", label: "Familiar" },
    { value: "comunitario", label: "Comunitário" },
    { value: "regional", label: "Regional" },
  ];

  const projectOptions = projects.map((p) => ({
    value: p.id,
    label: p.name,
  }));

  return (
    <div className="space-y-6">
      {/* Heading */}
      <div className="flex flex-col items-center justify-center gap-2 px-2 py-0">
        <h2 className="text-center font-['Poppins'] font-semibold text-[#000000] text-2xl leading-tight">
          Nos ajude a classificar sua reclamação
        </h2>
        <p className="text-center font-['Poppins'] font-light text-[#607D8B] text-sm leading-normal">
          Isso pode ajudar a empresa na resolução do seu problema e ajudar outras pessoas a encontrarem sua reclamação em situações similares
        </p>
      </div>

      {/* Category field */}
      <ComplaintField
        label="Categoria do Impacto"
        htmlFor="impact-category"
        required
      >
        <ComplaintSelect
          options={impactCategories}
          value={data.impactCategory}
          onValueChange={(value) =>
            onChange({ ...data, impactCategory: value })
          }
          placeholder="Selecione a categoria"
        />
      </ComplaintField>

      {/* Project field (optional) */}
      {projectOptions.length > 0 && (
        <ComplaintField
          label="Projeto da empresa (opcional)"
          htmlFor="company-project"
          hint="Se souber qual projeto específico está relacionado"
        >
          <ComplaintSelect
            options={projectOptions}
            value={data.companyProjectId}
            onValueChange={(value) =>
              onChange({ ...data, companyProjectId: value })
            }
            placeholder="Selecione o projeto"
          />
        </ComplaintField>
      )}

      {/* Urgency field */}
      <ComplaintField label="Urgência" htmlFor="urgency-level" required>
        <ComplaintSelect
          options={urgencyLevels}
          value={data.urgencyLevel}
          onValueChange={(value) => onChange({ ...data, urgencyLevel: value })}
          placeholder="Selecione a urgência"
        />
      </ComplaintField>

      {/* Scope field */}
      <ComplaintField label="Escopo" htmlFor="impact-scope" required>
        <ComplaintSelect
          options={impactScopes}
          value={data.impactScope}
          onValueChange={(value) => onChange({ ...data, impactScope: value })}
          placeholder="Selecione o escopo"
        />
      </ComplaintField>

      {/* Privacy settings */}
      <div className="space-y-0 border border-[#E5E5ED] rounded-lg overflow-hidden">
        <ComplaintSwitchRow
          id="anonymous"
          label="Desejo fazer esta reclamação de forma anônima"
          description="Seu nome não será exibido publicamente"
          checked={data.isAnonymous}
          onCheckedChange={(checked) =>
            onChange({ ...data, isAnonymous: checked })
          }
        />
        <ComplaintSwitchRow
          id="public"
          label="Desejo manter essa reclamação pública para todos verem"
          description="Outras pessoas poderão ver e acompanhar esta reclamação"
          checked={data.isPublic}
          onCheckedChange={(checked) => onChange({ ...data, isPublic: checked })}
        />
      </div>
    </div>
  );
}
