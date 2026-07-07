"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export type StepTwoData = {
  title: string;
  description: string;
  problemLocation: string;
};

type Props = {
  value: StepTwoData;
  onChange: (data: StepTwoData) => void;
};

const DESCRIPTION_PLACEHOLDER = `• O que aconteceu?
• Quando aconteceu?
• Como isso te afetou?
• Qual solução espera receber?`;

export function ComplaintStepTwoForm({ value, onChange }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Vamos começar!</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Descreva o seu problema com a empresa.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Título do relato</Label>
          <Input
            id="title"
            value={value.title}
            onChange={(e) => onChange({ ...value, title: e.target.value })}
            placeholder="ex: Rachaduras em residência após início das obras"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Reclamação</Label>
          <Textarea
            id="description"
            value={value.description}
            onChange={(e) => onChange({ ...value, description: e.target.value })}
            placeholder={DESCRIPTION_PLACEHOLDER}
            rows={6}
            className="resize-y min-h-[120px]"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="problemLocation">Localização do problema</Label>
          <Input
            id="problemLocation"
            value={value.problemLocation}
            onChange={(e) =>
              onChange({ ...value, problemLocation: e.target.value })
            }
            placeholder="ex: Endereço ou referência do local"
          />
        </div>

        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Não insira dados sensíveis no texto (CPF, senhas, dados bancários).
        </div>
      </div>
    </div>
  );
}
