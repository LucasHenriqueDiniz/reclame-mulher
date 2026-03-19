"use client";

import { ArrowLeft, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface ComplaintStepFooterProps {
  onBack?: () => void;
  onNext?: () => void;
  backLabel?: string;
  nextLabel?: string;
  showBackButton?: boolean;
  showPrivateInfo?: boolean;
  disableNext?: boolean;
  loading?: boolean;
}

/**
 * Rodapé padronizado para cada etapa do wizard
 * Exibe "Informações privadas", botão Voltar e botão de ação principal
 * Segue design do Figma com alinhamento e espaçamento consistentes
 */
export function ComplaintStepFooter({
  onBack,
  onNext,
  backLabel = "Voltar",
  nextLabel = "Próximo passo",
  showBackButton = true,
  showPrivateInfo = true,
  disableNext = false,
  loading = false,
}: ComplaintStepFooterProps) {
  return (
    <div className="flex items-center justify-between pt-6 w-full border-t border-gray-100">
      {/* Private info indicator */}
      <div className="flex items-center gap-2">
        {showPrivateInfo && (
          <>
            <div className="p-1.5 rounded-lg bg-[#1E88E5]/10">
              <EyeOff className="w-4 h-4 text-[#1E88E5]" />
            </div>
            <span className="font-['Poppins'] font-medium text-[#1E88E5] text-xs tracking-[-0.20px] leading-normal">
              Informações privadas
            </span>
          </>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-2">
        {showBackButton && (
          <Button
            type="button"
            variant="ghost"
            onClick={onBack}
            className="gap-2 px-5 py-2.5 h-auto rounded-xl hover:bg-gray-100 transition-all duration-200"
          >
            <ArrowLeft className="w-5 h-5 text-[#2A3F54]" />
            <span className="font-['Poppins'] font-medium text-[#2A3F54] text-sm leading-normal">
              {backLabel}
            </span>
          </Button>
        )}
        
        <Button
          type="button"
          onClick={onNext}
          disabled={disableNext || loading}
          className="gap-2.5 bg-gradient-to-r from-[#1E88E5] to-[#1976D2] hover:from-[#1976D2] hover:to-[#1565C0] text-white px-7 py-3 h-auto rounded-xl disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 disabled:hover:scale-100"
        >
          {loading && (
            <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          <span className="font-['Poppins'] font-semibold text-sm leading-normal">
            {loading ? "Enviando..." : nextLabel}
          </span>
        </Button>
      </div>
    </div>
  );
}
