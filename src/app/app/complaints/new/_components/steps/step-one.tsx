"use client";

import { MessageSquare, HelpCircle } from "lucide-react";
import { ComplaintField } from "../fields/complaint-field";
import { ComplaintInput } from "../fields/complaint-input";
import { ComplaintRadioGroup } from "../fields/complaint-radio-group";

export interface StepOneData {
  hasPreviousComplaintElsewhere: boolean;
  previousComplaintChannel: string;
}

export interface StepOneProps {
  data: StepOneData;
  onChange: (data: StepOneData) => void;
}

/**
 * Passo 1: Informações preliminares
 * Pergunta sobre reclamação prévia em outro canal
 */
export function StepOne({ data, onChange }: StepOneProps) {
  return (
    <div className="space-y-6 py-4">
      {/* Heading com ícone */}
      <div className="flex flex-col items-center justify-center gap-3 px-2">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#1E88E5]/10 to-[#1976D2]/5 flex items-center justify-center">
          <MessageSquare className="w-8 h-8 text-[#1E88E5]" />
        </div>
        <h2 className="text-center font-['Poppins'] font-semibold text-[#2A3F54] text-2xl leading-tight max-w-xl">
          Precisamos de algumas informações antes de abrir a sua reclamação
        </h2>
        <p className="text-center font-['Poppins'] font-normal text-[#607D8B] text-sm leading-relaxed max-w-lg">
          Ajude a empresa a resolver o seu problema dando algumas informações para agilizar o processo
        </p>
      </div>

      {/* Radio question em card destacado */}
      <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <ComplaintField
          label="Você abriu uma reclamação sobre esse tema em outro canal?"
        >
          <ComplaintRadioGroup
            name="previous-complaint"
            options={[
              { value: "yes", label: "Sim" },
              { value: "no", label: "Não" },
            ]}
            value={data.hasPreviousComplaintElsewhere ? "yes" : "no"}
            onValueChange={(value) =>
              onChange({
                ...data,
                hasPreviousComplaintElsewhere: value === "yes",
                ...(value === "no" ? { previousComplaintChannel: "" } : {}),
              })
            }
          />
        </ComplaintField>

        {/* Conditional channel input */}
        {data.hasPreviousComplaintElsewhere && (
          <div className="mt-5 animate-in slide-in-from-top-2 fade-in duration-300">
            <ComplaintField label="Em qual canal?">
              <ComplaintInput
                value={data.previousComplaintChannel}
                onChange={(e) =>
                  onChange({ ...data, previousComplaintChannel: e.target.value })
                }
                placeholder="Ex: Procon, Reclame Aqui, SAC da empresa..."
              />
            </ComplaintField>
          </div>
        )}
      </div>

      {/* Info adicional */}
      <div className="flex items-start gap-3 px-4 py-3 bg-blue-50/50 rounded-lg border border-blue-100/50">
        <HelpCircle className="w-5 h-5 text-[#1E88E5] flex-shrink-0 mt-0.5" />
        <p className="text-xs font-['Poppins'] text-[#607D8B] leading-relaxed">
          Essas informações ajudam a empresa a entender melhor o contexto da sua reclamação e podem acelerar o processo de resolução.
        </p>
      </div>
    </div>
  );
}
