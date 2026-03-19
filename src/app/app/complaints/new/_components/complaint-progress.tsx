"use client";

export type ComplaintProgressProps = {
  step: number;
  total?: number;
};

export function ComplaintProgress({ step, total = 4 }: ComplaintProgressProps) {
  const value = total > 0 ? (step / total) * 100 : 0;

  return (
    <div className="flex flex-col w-[262px] items-start gap-1 mx-auto">
      <div className="h-5 flex items-start self-stretch w-full justify-center">
        <span className="font-semibold text-[#00000099] text-[13px]">
          Passo {step} de {total}
        </span>
      </div>
      <div className="self-stretch w-full bg-gray-200 rounded-md h-2.5 overflow-hidden">
        <div
          className="h-2.5 bg-[#1E88E5] rounded-md transition-all duration-300"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
