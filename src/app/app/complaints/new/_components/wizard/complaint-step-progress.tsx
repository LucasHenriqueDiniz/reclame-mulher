"use client";

export interface ComplaintStepProgressProps {
  currentStep: number;
  totalSteps?: number;
}

const STEP_LABELS = [
  "Histórico",
  "Descrição",
  "Fotos",
  "Finalizar",
];

/**
 * The wizard progress bar.
 * Announces the current step clearly and accessibly.
 */
export function ComplaintStepProgress({ 
  currentStep, 
  totalSteps = 4 
}: ComplaintStepProgressProps) {
  const percentage = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0;

  return (
    <div className="flex flex-col w-full max-w-md items-start gap-3 mx-auto">
      <div className="flex items-center justify-center self-stretch w-full">
        <span className="font-['Poppins'] font-semibold text-[#2A3F54] text-base">
          {STEP_LABELS[currentStep - 1] ?? ""}
        </span>
      </div>
      <div className="self-stretch w-full bg-gray-200 rounded-full h-3 overflow-hidden">
        <div
          className="h-3 bg-[#1E88E5] rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex justify-between w-full">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div key={i} className="flex flex-col items-center gap-1 flex-1">
            <div
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                i < currentStep
                  ? "bg-[#1E88E5]"
                  : "bg-gray-300"
              }`}
            />
            <span className={`text-[10px] font-['Poppins'] text-center ${
              i < currentStep ? "text-[#1E88E5] font-medium" : "text-gray-400"
            }`}>
              {STEP_LABELS[i]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
