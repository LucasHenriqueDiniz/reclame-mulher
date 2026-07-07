"use client";

import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export interface ComplaintSwitchRowProps {
  id: string;
  label: string;
  description?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
}

/**
 * Linha com switch padronizada para o wizard de relato
 * Segue design do Figma com alinhamento e espaçamento consistentes
 */
export function ComplaintSwitchRow({
  id,
  label,
  description,
  checked,
  onCheckedChange,
  disabled,
}: ComplaintSwitchRowProps) {
  return (
    <div className="flex items-center justify-between py-3 px-0 w-full border-b border-[#E5E5ED] last:border-b-0">
      <div className="flex flex-col gap-0.5 flex-1">
        <Label
          htmlFor={id}
          className="font-['Poppins'] font-semibold text-[#2A3F54] text-sm leading-normal cursor-pointer"
        >
          {label}
        </Label>
        {description && (
          <p className="font-['Poppins'] text-[#607D8B] text-xs leading-normal">
            {description}
          </p>
        )}
      </div>
      <Switch
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        className="data-[state=checked]:bg-[#1E88E5]"
      />
    </div>
  );
}
