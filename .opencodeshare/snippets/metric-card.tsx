"use client";

interface MetricCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  active?: boolean;
  onClick?: () => void;
}

export function MetricCard({ label, value, icon, color, bgColor, active, onClick }: MetricCardProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-xl p-5 transition-all border ${
        active
          ? "border-[#1E88E5] shadow-md ring-1 ring-[#1E88E5]/20"
          : "border-transparent shadow-sm hover:shadow-md hover:scale-[1.02]"
      }`}
      style={{ backgroundColor: bgColor }}
    >
      <div className="flex items-center justify-between mb-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: color + "20" }}
        >
          <span style={{ color }}>{icon}</span>
        </div>
        <span className="text-3xl font-bold font-['Poppins']" style={{ color }}>
          {value}
        </span>
      </div>
      <p className="font-['Poppins'] text-sm font-medium text-[#2A3F54]">{label}</p>
    </button>
  );
}
