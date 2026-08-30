"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export type StepOneData = {
  hasPreviousComplaintElsewhere: boolean;
  previousComplaintChannel: string;
};

type Props = {
  value: StepOneData;
  onChange: (data: StepOneData) => void;
};

export function ComplaintStepOneForm({ value, onChange }: Props) {
  return (
    <div className="space-y-6">
      {/* Form heading */}
      <div className="flex flex-col items-center justify-center gap-3 px-5 py-0">
        <h2 className="text-center font-semibold text-black text-[32px] leading-normal">
          Precisamos de algumas informações antes de abrir seu relato
        </h2>
        <p className="text-center font-light text-black text-base leading-normal">
          Ajude a empresa a resolver o seu problema dando algumas informações para agilizar o processo
        </p>
      </div>

      <div className="space-y-4">
        {/* Radio question */}
        <div className="flex flex-col gap-2">
          <Label className="font-bold text-gray-800 text-sm tracking-[2.00px] leading-[26px]">
            Você abriu um relato sobre esse tema em outro canal?
          </Label>
          <RadioGroup
            value={value.hasPreviousComplaintElsewhere ? "yes" : "no"}
            onValueChange={(v) =>
              onChange({
                ...value,
                hasPreviousComplaintElsewhere: v === "yes",
                ...(v === "no" ? { previousComplaintChannel: "" } : {}),
              })
            }
            className="flex flex-col gap-1"
          >
            <div className="flex items-center gap-2.5 px-3 py-0">
              <RadioGroupItem value="yes" id="prev-yes" className="w-5 h-5" />
              <Label htmlFor="prev-yes" className="font-medium text-gray-800 text-sm leading-7 cursor-pointer">
                Sim
              </Label>
            </div>
            <div className="flex items-center gap-2.5 px-3 py-0">
              <RadioGroupItem value="no" id="prev-no" className="w-5 h-5" />
              <Label htmlFor="prev-no" className="font-medium text-gray-800 text-sm leading-7 cursor-pointer">
                Não
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Channel input */}
        {value.hasPreviousComplaintElsewhere && (
          <div className="flex flex-col items-start gap-1">
            <Label 
              htmlFor="previousComplaintChannel"
              className="font-bold text-gray-800 text-sm tracking-[2.00px] leading-[26px]"
            >
              Em qual canal?
            </Label>
            <Input
              id="previousComplaintChannel"
              value={value.previousComplaintChannel}
              onChange={(e) =>
                onChange({ ...value, previousComplaintChannel: e.target.value })
              }
              placeholder=".gov"
              className="w-full h-10 rounded-xl border border-gray-300 px-[18px] text-gray-800 text-sm"
            />
          </div>
        )}
      </div>
    </div>
  );
}
