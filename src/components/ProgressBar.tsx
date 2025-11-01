export function ProgressBar({ step, total }: { step: number; total: number }) {
  const pct = Math.max(0, Math.min(100, Math.round((step / total) * 100)));
  return (
    <div className="w-full">
      <div className="mx-auto w-full max-w-xl text-center text-sm text-neutral-700">
        Passo {step} de {total}
      </div>
      <div className="mx-auto mt-2 h-2 w-full max-w-xl rounded-full bg-neutral-200">
        <div
          className="h-2 rounded-full bg-[#3BA5FF] transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}



