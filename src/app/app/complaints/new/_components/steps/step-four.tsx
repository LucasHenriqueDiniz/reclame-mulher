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
 * Passo 4: Últimas informações
 * Classificação simples e configurações de privacidade
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
    { value: "baixa", label: "Baixa — pode esperar" },
    { value: "media", label: "Média — incomoda bastante" },
    { value: "alta", label: "Alta — precisa de solução rápida" },
    { value: "emergencial", label: "Emergencial — risco de acidente" },
  ];

  const impactScopes = [
    { value: "individual", label: "Só eu" },
    { value: "familiar", label: "Minha família" },
    { value: "comunitario", label: "Vizinhos e comunidade" },
    { value: "regional", label: "Bairro inteiro ou mais" },
  ];

  const projectOptions = projects.map((p) => ({
    value: p.id,
    label: p.name,
  }));

  return (
    <div className="space-y-6">
      {/* Heading simples */}
      <div className="flex flex-col items-center justify-center gap-2 px-2 py-0">
        <h2 className="text-center font-['Poppins'] font-semibold text-[#2A3F54] text-2xl leading-tight">
          Quase pronto!
        </h2>
        <p className="text-center font-['Poppins'] text-[#607D8B] text-sm leading-normal">
          Só mais algumas informações para organizar sua reclamação
        </p>
      </div>

      {/* Categoria */}
      <ComplaintField
        label="Qual tipo de problema?"
        htmlFor="impact-category"
        required
      >
        <ComplaintSelect
          options={impactCategories}
          value={data.impactCategory}
          onValueChange={(value) =>
            onChange({ ...data, impactCategory: value })
          }
          placeholder="Escolha uma opção"
        />
      </ComplaintField>

      {/* Projeto (se houver) */}
      {projectOptions.length > 0 && (
        <ComplaintField
          label="Qual projeto da empresa? (opcional)"
          htmlFor="company-project"
          hint="Só escolha se souber"
        >
          <ComplaintSelect
            options={projectOptions}
            value={data.companyProjectId}
            onValueChange={(value) =>
              onChange({ ...data, companyProjectId: value })
            }
            placeholder="Escolha um projeto"
          />
        </ComplaintField>
      )}

      {/* Urgência */}
      <ComplaintField label="Quão urgente é?" htmlFor="urgency-level" required>
        <ComplaintSelect
          options={urgencyLevels}
          value={data.urgencyLevel}
          onValueChange={(value) => onChange({ ...data, urgencyLevel: value })}
          placeholder="Escolha uma opção"
        />
      </ComplaintField>

      {/* Escopo */}
      <ComplaintField label="Quem mais está sendo afetado?" htmlFor="impact-scope" required>
        <ComplaintSelect
          options={impactScopes}
          value={data.impactScope}
          onValueChange={(value) => onChange({ ...data, impactScope: value })}
          placeholder="Escolha uma opção"
        />
      </ComplaintField>

      {/* Privacidade */}
      <div className="space-y-0 border border-[#E5E5ED] rounded-lg overflow-hidden">
        <ComplaintSwitchRow
          id="anonymous"
          label="Quero fazer esta reclamação sem mostrar meu nome"
          description="Seu nome não aparecerá publicamente"
          checked={data.isAnonymous}
          onCheckedChange={(checked) =>
            onChange({ ...data, isAnonymous: checked })
          }
        />
        <ComplaintSwitchRow
          id="public"
          label="Quero que outras pessoas possam ver esta reclamação"
          description="Outras pessoas poderão acompanhar"
          checked={data.isPublic}
          onCheckedChange={(checked) =>
            onChange({ ...data, isPublic: checked })
          }
        />
      </div>
    </div>
  );
}
