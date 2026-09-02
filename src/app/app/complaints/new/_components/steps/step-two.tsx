"use client";

import { Info } from "lucide-react";
import { ComplaintField } from "../fields/complaint-field";
import { ComplaintInput } from "../fields/complaint-input";
import { ComplaintTextarea } from "../fields/complaint-textarea";

export interface StepTwoData {
  title: string;
  description: string;
  problemLocation: string;
}

export interface StepTwoProps {
  data: StepTwoData;
  onChange: (data: StepTwoData) => void;
}

/**
 * Step 2: tell us what happened.
 * Three fields only: title, description and location.
 */
export function StepTwo({ data, onChange }: StepTwoProps) {
  return (
    <div className="space-y-6">
      {/* Plain heading */}
      <div className="flex flex-col items-center justify-center gap-2 px-2 py-0">
        <h2 className="text-center font-['Poppins'] font-semibold text-[#2A3F54] text-2xl leading-tight">
          Conte o que aconteceu
        </h2>
        <p className="text-center font-['Poppins'] text-[#607D8B] text-sm leading-normal">
          Escreva de forma simples. Não precisa usar palavras difíceis.
        </p>
      </div>

      {/* Title */}
      <ComplaintField
        label="Qual é o problema?"
        htmlFor="complaint-title"
        required
      >
        <ComplaintInput
          id="complaint-title"
          value={data.title}
          onChange={(e) => onChange({ ...data, title: e.target.value })}
          placeholder="Ex: Barulho muito alto da obra à noite"
          error={data.title.length > 0 && data.title.length < 3}
        />
      </ComplaintField>

      {/* Description */}
      <ComplaintField
        label="Conte com mais detalhes"
        htmlFor="complaint-description"
        required
        hint="Quando começou? Como está afetando você?"
      >
        <ComplaintTextarea
          id="complaint-description"
          value={data.description}
          onChange={(e) => onChange({ ...data, description: e.target.value })}
          placeholder="Ex: A obra começou há 2 semanas. O barulho começa às 22h e vai até 2h da manhã. Não consigo dormir..."
          rows={5}
          error={data.description.length > 0 && data.description.length < 10}
        />
      </ComplaintField>

      {/* Location */}
      <ComplaintField
        label="Onde aconteceu?"
        htmlFor="complaint-location"
        hint="Endereço ou ponto de referência"
      >
        <ComplaintInput
          id="complaint-location"
          value={data.problemLocation}
          onChange={(e) =>
            onChange({ ...data, problemLocation: e.target.value })
          }
          placeholder="Ex: Rua das Flores, 123 - perto do mercado"
        />
      </ComplaintField>

      {/* Important notice */}
      <div className="bg-[#E3F2FD] border-l-4 border-[#1E88E5] rounded-r-xl p-4 flex items-start gap-3">
        <Info className="w-5 h-5 text-[#1E88E5] flex-shrink-0 mt-0.5" />
        <p className="font-['Poppins'] text-[#1565C0] text-sm leading-relaxed">
          Não coloque seu CPF, RG ou dados bancários aqui. Esses dados não são necessários.
        </p>
      </div>
    </div>
  );
}
