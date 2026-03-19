"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type StepFourData = {
  impactCategory: string;
  companyProjectId: string;
  urgencyLevel: string;
  impactScope: string;
  isAnonymous: boolean;
  isPublic: boolean;
};

type ProjectOption = { id: string; name: string };

type Props = {
  value: StepFourData;
  onChange: (data: StepFourData) => void;
  projects: ProjectOption[];
};

const IMPACT_CATEGORIES = [
  { value: "meio_ambiente", label: "Meio Ambiente" },
  { value: "seguranca", label: "Segurança" },
  { value: "infraestrutura", label: "Infraestrutura" },
  { value: "social", label: "Social" },
  { value: "economico", label: "Econômico" },
  { value: "outro", label: "Outro" },
];

const URGENCY_LEVELS = [
  { value: "baixa", label: "Baixa" },
  { value: "media", label: "Média" },
  { value: "alta", label: "Alta" },
  { value: "emergencial", label: "Emergencial" },
];

const IMPACT_SCOPES = [
  { value: "individual", label: "Individual" },
  { value: "comunitario", label: "Comunitário" },
  { value: "regional", label: "Regional" },
  { value: "nacional", label: "Nacional" },
];

export function ComplaintStepFourClassification({
  value,
  onChange,
  projects,
}: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">
          Nos ajude a classificar sua reclamação
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Essa classificação ajuda na resolução e também outras pessoas a encontrarem reclamações similares.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-1">
        <div className="space-y-2">
          <Label>Categoria do impacto</Label>
          <Select
            value={value.impactCategory || undefined}
            onValueChange={(v) => onChange({ ...value, impactCategory: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="ex: Meio Ambiente" />
            </SelectTrigger>
            <SelectContent>
              {IMPACT_CATEGORIES.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Projeto da empresa (opcional)</Label>
          <Select
            value={value.companyProjectId || "__none__"}
            onValueChange={(v) =>
              onChange({ ...value, companyProjectId: v === "__none__" ? "" : v })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="ex: Expansão da rodovia" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">Nenhum</SelectItem>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Urgência</Label>
          <Select
            value={value.urgencyLevel || undefined}
            onValueChange={(v) => onChange({ ...value, urgencyLevel: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="ex: Emergencial" />
            </SelectTrigger>
            <SelectContent>
              {URGENCY_LEVELS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Escopo</Label>
          <Select
            value={value.impactScope || undefined}
            onValueChange={(v) => onChange({ ...value, impactScope: v })}
          >
            <SelectTrigger>
              <SelectValue placeholder="ex: Comunitário" />
            </SelectTrigger>
            <SelectContent>
              {IMPACT_SCOPES.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between rounded-lg border p-4">
          <Label htmlFor="isAnonymous" className="cursor-pointer font-normal">
            Desejo fazer esta reclamação de forma anônima
          </Label>
          <Switch
            id="isAnonymous"
            checked={value.isAnonymous}
            onCheckedChange={(checked) =>
              onChange({ ...value, isAnonymous: checked })
            }
          />
        </div>

        <div className="flex items-center justify-between rounded-lg border p-4">
          <Label htmlFor="isPublic" className="cursor-pointer font-normal">
            Desejo manter essa reclamação pública para todos verem
          </Label>
          <Switch
            id="isPublic"
            checked={value.isPublic}
            onCheckedChange={(checked) =>
              onChange({ ...value, isPublic: checked })
            }
          />
        </div>
      </div>
    </div>
  );
}
