"use client";

export interface ComplaintStepProgressProps {
  currentStep: number;
  totalSteps?: number;
}

/**
 * Barra de progresso do wizard
 * Exibe "Passo X de Y" e barra visual
 * Segue design do Figma com peso visual adequado
 */
export function ComplaintStepProgress({ 
  currentStep, 
  totalSteps = 4 
}: ComplaintStepProgressProps) {
  const percentage = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0;

  return (
    <div className="flex flex-col w-[280px] items-start gap-2 mx-auto">
      <div className="h-5 flex items-center justify-center self-stretch w-full">
        <span className="font-['Poppins'] font-semibold text-[#607D8B] text-sm leading-normal">
          Passo {currentStep} de {totalSteps}
        </span>
      </div>
      <div className="self-stretch w-full bg-gradient-to-r from-gray-200 to-gray-100 rounded-full h-3 overflow-hidden shadow-inner">
        <div
          className="h-3 bg-gradient-to-r from-[#1E88E5] to-[#1976D2] rounded-full transition-all duration-500 ease-out shadow-sm"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex justify-between w-full px-1">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              i < currentStep
                ? "bg-[#1E88E5] scale-110"
                : "bg-gray-300 scale-90"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
