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
 * Passo 2: Detalhes da reclamação
 * Título, descrição e localização do problema
 */
export function StepTwo({ data, onChange }: StepTwoProps) {
  return (
    <div className="space-y-6">
      {/* Heading */}
      <div className="flex flex-col items-center justify-center gap-2 px-2 py-0">
        <h2 className="text-center font-['Poppins'] font-semibold text-[#000000] text-2xl leading-tight">
          Vamos começar!
        </h2>
        <p className="text-center font-['Poppins'] font-light text-[#607D8B] text-sm leading-normal">
          Descreva o problema que você está enfrentando
        </p>
      </div>

      {/* Title field */}
      <ComplaintField
        label="Título da reclamação"
        htmlFor="complaint-title"
        required
      >
        <ComplaintInput
          id="complaint-title"
          value={data.title}
          onChange={(e) => onChange({ ...data, title: e.target.value })}
          placeholder="Ex: Rachaduras em residência após início das obras"
          error={data.title.length > 0 && data.title.length < 3}
        />
      </ComplaintField>

      {/* Description field */}
      <ComplaintField
        label="Descrição detalhada"
        htmlFor="complaint-description"
        required
        hint="Descreva o problema com o máximo de detalhes possível"
      >
        <ComplaintTextarea
          id="complaint-description"
          value={data.description}
          onChange={(e) => onChange({ ...data, description: e.target.value })}
          placeholder="Descreva o que aconteceu, quando começou, como está afetando você..."
          rows={6}
          error={data.description.length > 0 && data.description.length < 10}
        />
      </ComplaintField>

      {/* Location field */}
      <ComplaintField
        label="Localização do problema"
        htmlFor="complaint-location"
        hint="Endereço ou referência do local afetado"
      >
        <ComplaintInput
          id="complaint-location"
          value={data.problemLocation}
          onChange={(e) =>
            onChange({ ...data, problemLocation: e.target.value })
          }
          placeholder="Ex: Rua das Flores, 123 - Centro"
        />
      </ComplaintField>

      {/* Info alert */}
      <div className="bg-gradient-to-r from-[#E3F2FD] to-[#E1F5FE] border-l-4 border-[#1E88E5] rounded-xl p-4 flex items-start gap-3 shadow-sm hover:shadow-md transition-shadow duration-200">
        <div className="p-1.5 rounded-lg bg-[#1E88E5]/10">
          <Info className="w-5 h-5 text-[#1E88E5] flex-shrink-0" />
        </div>
        <p className="font-['Poppins'] text-[#1565C0] text-sm leading-relaxed">
          Não inclua dados sensíveis como CPF, RG ou informações bancárias na descrição. 
          Essas informações não são necessárias para o registro da reclamação.
        </p>
      </div>
    </div>
  );
}
