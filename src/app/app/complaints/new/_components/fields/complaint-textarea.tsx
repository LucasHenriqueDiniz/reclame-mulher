"use client";

import { forwardRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export interface ComplaintTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

/**
 * The standard textarea for the complaint wizard.
 * Follows the Figma design: consistent borders, spacing and minimum height.
 */
export const ComplaintTextarea = forwardRef<
  HTMLTextAreaElement,
  ComplaintTextareaProps
>(({ className, error, ...props }, ref) => {
  return (
    <Textarea
      ref={ref}
      className={cn(
        "w-full min-h-[120px] rounded-[9px] border border-[#E5E5ED]",
        "px-[18px] py-3",
        "font-['Poppins'] font-medium text-[#2A3F54] text-sm",
        "placeholder:text-[#607D8B] placeholder:font-normal",
        "focus:border-[#1E88E5] focus:ring-1 focus:ring-[#1E88E5]",
        "disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed",
        "resize-y",
        error && "border-red-500 focus:border-red-500 focus:ring-red-500",
        className
      )}
      {...props}
    />
  );
});

ComplaintTextarea.displayName = "ComplaintTextarea";
