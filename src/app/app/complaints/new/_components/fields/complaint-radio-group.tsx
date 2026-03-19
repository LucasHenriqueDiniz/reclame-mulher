"use client";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export interface ComplaintRadioOption {
  value: string;
  label: string;
}

export interface ComplaintRadioGroupProps {
  options: ComplaintRadioOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  name?: string;
  disabled?: boolean;
}

/**
 * Radio group padronizado para o wizard de reclamação
 * Segue design do Figma com tamanho, espaçamento e tipografia consistentes
 */
export function ComplaintRadioGroup({
  options,
  value,
  onValueChange,
  name,
  disabled,
}: ComplaintRadioGroupProps) {
  return (
    <RadioGroup
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      className="flex flex-col gap-1"
    >
      {options.map((option) => (
        <div
          key={option.value}
          className="flex items-center gap-2.5 px-3 py-0"
        >
          <RadioGroupItem
            value={option.value}
            id={`${name}-${option.value}`}
            className="w-5 h-5 border-2 border-[#607D8B] text-[#1E88E5] focus:ring-[#1E88E5] focus:ring-offset-0"
          />
          <Label
            htmlFor={`${name}-${option.value}`}
            className="font-['Poppins'] font-medium text-[#2A3F54] text-sm leading-7 cursor-pointer"
          >
            {option.label}
          </Label>
        </div>
      ))}
    </RadioGroup>
  );
}
