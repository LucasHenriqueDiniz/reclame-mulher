"use client";

export function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  if (value == null || value === "") return null;
  return (
    <div className="flex gap-3 pb-3 border-b border-gray-100 mb-3 last:border-0 last:mb-0 last:pb-0">
      <div className="w-32 text-xs text-gray-400 flex-shrink-0 font-medium">
        {label}
      </div>
      <div className="text-sm text-[#2A3F54] font-medium flex-1">
        {value}
      </div>
    </div>
  );
}
