"use client";

import { forwardRef } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface ComplaintInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

/**
 * Input padronizado para o wizard de relato
 * Segue design do Figma com altura, bordas e espaçamento consistentes
 */
export const ComplaintInput = forwardRef<HTMLInputElement, ComplaintInputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <Input
        ref={ref}
        className={cn(
          "w-full h-[45px] rounded-[9px] border border-[#E5E5ED]",
          "px-[18px] py-0",
          "font-['Poppins'] font-medium text-[#2A3F54] text-sm",
          "placeholder:text-[#546E7A] placeholder:font-normal",
          "focus:border-[#1565C0] focus:ring-1 focus:ring-[#1565C0]",
          "disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed",
          error && "border-red-500 focus:border-red-500 focus:ring-red-500",
          className
        )}
        {...props}
      />
    );
  }
);

ComplaintInput.displayName = "ComplaintInput";
