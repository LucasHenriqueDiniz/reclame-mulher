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
 * Passo 1: Você já reclamou em outro lugar?
 * Apenas uma pergunta simples para entender o histórico
 */
export function StepOne({ data, onChange }: StepOneProps) {
  return (
    <div className="space-y-6 py-4">
      {/* Heading simples */}
      <div className="flex flex-col items-center justify-center gap-3 px-2">
        <div className="w-16 h-16 rounded-2xl bg-[#1E88E5]/10 flex items-center justify-center">
          <MessageSquare className="w-8 h-8 text-[#1E88E5]" />
        </div>
        <h2 className="text-center font-['Poppins'] font-semibold text-[#2A3F54] text-2xl leading-tight max-w-xl">
          Você já reclamou sobre isso em outro lugar?
        </h2>
        <p className="text-center font-['Poppins'] text-[#607D8B] text-sm leading-relaxed max-w-lg">
          Isso ajuda a empresa a entender melhor seu caso
        </p>
      </div>

      {/* Pergunta em destaque */}
      <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
        <ComplaintField
          label="Você já fez uma reclamação sobre esse problema em outro lugar?"
        >
          <ComplaintRadioGroup
            name="previous-complaint"
            options={[
              { value: "yes", label: "Sim, já reclamei" },
              { value: "no", label: "Não, é a primeira vez" },
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

        {/* Pergunta adicional só se respondeu sim */}
        {data.hasPreviousComplaintElsewhere && (
          <div className="mt-5 animate-in slide-in-from-top-2 fade-in duration-300">
            <ComplaintField label="Onde você reclamou?">
              <ComplaintInput
                value={data.previousComplaintChannel}
                onChange={(e) =>
                  onChange({ ...data, previousComplaintChannel: e.target.value })
                }
                placeholder="Ex: Procon, ouvidoria da empresa, delegacia..."
              />
            </ComplaintField>
          </div>
        )}
      </div>

      {/* Dica tranquilizadora */}
      <div className="flex items-start gap-3 px-4 py-3 bg-blue-50 rounded-lg border border-blue-100">
        <HelpCircle className="w-5 h-5 text-[#1E88E5] flex-shrink-0 mt-0.5" />
        <p className="text-sm font-['Poppins'] text-[#607D8B] leading-relaxed">
          Não se preocupe, você pode voltar e mudar essa informação depois.
        </p>
      </div>
    </div>
  );
}
