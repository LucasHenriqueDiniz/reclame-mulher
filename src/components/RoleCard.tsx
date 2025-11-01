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
        "glass h-full w-full max-w-md rounded-3xl p-8 text-left transition-all hover:scale-105 hover:shadow-2xl",
        active ? "ring-2 ring-blue-stepper" : "hover:shadow-xl"
      )}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-4 mb-4">
          <div className="rounded-full bg-purple-primary/10 p-3">
            <Icon className="h-8 w-8 text-purple-primary" />
          </div>
          <h3 className="text-2xl font-heading font-bold text-gray-900">
            {title}
          </h3>
        </div>
        <p className="text-gray-700 leading-relaxed mb-6 flex-grow">{desc}</p>
        <div className="inline-flex items-center justify-center rounded-full bg-purple-primary hover:bg-purple-primary/90 px-6 py-3 text-white font-heading font-semibold transition-all shadow-md">
          {cta}
        </div>
      </div>
    </button>
  );
}



