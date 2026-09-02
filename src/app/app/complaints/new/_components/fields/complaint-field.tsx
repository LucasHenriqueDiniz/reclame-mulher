"use client";

import { ReactNode } from "react";
import { Label } from "@/components/ui/label";

export interface ComplaintFieldProps {
  label?: string;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}

/**
 * The wrapper around a single form field.
 * Standardises the label, the hint, the error and the spacing.
 */
export function ComplaintField({
  label,
  htmlFor,
  required,
  error,
  hint,
  children,
  className = "",
}: ComplaintFieldProps) {
  return (
    <div className={`flex flex-col items-start gap-1.5 w-full ${className}`}>
      {label && (
        <Label
          htmlFor={htmlFor}
          className="font-['Poppins'] font-bold text-[#232360] text-sm tracking-[2.00px] leading-[26px]"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      {children}
      {hint && !error && (
        <p className="font-['Poppins'] text-[#607D8B] text-xs leading-normal">
          {hint}
        </p>
      )}
      {error && (
        <p className="font-['Poppins'] text-red-600 text-xs leading-normal">
          {error}
        </p>
      )}
    </div>
  );
}
