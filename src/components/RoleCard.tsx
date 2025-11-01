import { Building2, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

export function RoleCard({
  type,
  title,
  desc,
  cta,
  onClick,
  active,
}: {
  type: "person" | "company";
  title: string;
  desc: string;
  cta: string;
  onClick: () => void;
  active?: boolean;
}) {
  const Icon = type === "person" ? UserRound : Building2;
  return (
    <button
      onClick={onClick}
      className={cn(
        "glass w-full max-w-md rounded-2xl p-8 text-left transition-all",
        active ? "ring-2 ring-[#3BA5FF]" : "hover:shadow-lg"
      )}
    >
      <div className="flex items-center gap-4">
        <div className="rounded-full bg-[#3F237E]/10 p-3">
          <Icon className="h-8 w-8 text-[#6D54C7]" />
        </div>
        <h3 className="text-xl font-semibold text-neutral-900">{title}</h3>
      </div>
      <p className="mt-4 text-neutral-600 leading-relaxed">{desc}</p>
      <div className="mt-6 inline-flex items-center rounded-full bg-[#FF6A2A] px-5 py-2 text-white font-medium">
        {cta}
      </div>
    </button>
  );
}



