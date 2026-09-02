"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export interface ComplaintSelectOption {
  value: string;
  label: string;
}

export interface ComplaintSelectProps {
  options: ComplaintSelectOption[];
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  className?: string;
}

/**
 * The standard select for the complaint wizard.
 * Follows the Figma design: consistent height, borders and spacing.
 */
export function ComplaintSelect({
  options,
  value,
  onValueChange,
  placeholder = "Selecione uma opção",
  disabled,
  error,
  className,
}: ComplaintSelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectTrigger
        className={cn(
          "w-full h-[45px] rounded-[9px] border border-[#E5E5ED]",
          "px-[18px]",
          "font-['Poppins'] font-medium text-[#2A3F54] text-sm",
          "focus:border-[#1E88E5] focus:ring-1 focus:ring-[#1E88E5]",
          "disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed",
          error && "border-red-500 focus:border-red-500 focus:ring-red-500",
          className
        )}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            className="font-['Poppins'] text-sm"
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
