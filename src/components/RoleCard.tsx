import { Building2, UserRound, CheckCircle2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const PERSON_FEATURES = [
  "Registre reclamações sobre obras de infraestrutura",
  "Acompanhe o andamento das suas denúncias",
  "Receba respostas diretamente das empresas",
  "Contribua para um ambiente mais seguro",
];

const COMPANY_FEATURES = [
  "Responda e gerencie reclamações recebidas",
  "Demonstre comprometimento com a comunidade",
  "Acompanhe métricas de satisfação",
  "Fortaleça a reputação da sua empresa",
];

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
  const features = type === "person" ? PERSON_FEATURES : COMPANY_FEATURES;
  const accent = type === "person" ? "#3BA5FF" : "#2A1B55";
  const accentBg = type === "person" ? "bg-blue-500/10" : "bg-purple-900/10";
  const accentText = type === "person" ? "text-[#3BA5FF]" : "text-[#2A1B55]";
  const btnClass = type === "person"
    ? "bg-[#3BA5FF] hover:bg-[#2d8ddf]"
    : "bg-[#2A1B55] hover:bg-[#1e1340]";

  return (
    <button
      onClick={onClick}
      className={cn(
        "group relative h-full w-full rounded-3xl text-left transition-all duration-300",
        "bg-white/95 backdrop-blur-sm shadow-lg hover:shadow-2xl hover:-translate-y-1",
        active ? "ring-2 ring-[#3BA5FF]" : ""
      )}
    >
      <div className="flex flex-col h-full p-8">
        {/* Icon + title */}
        <div className="flex items-center gap-4 mb-4">
          <div className={cn("rounded-2xl p-3", accentBg)}>
            <Icon className={cn("h-7 w-7", accentText)} />
          </div>
          <h3 className="text-2xl font-extrabold text-[#2A1B55]">{title}</h3>
        </div>

        {/* Description */}
        <p className="text-gray-500 text-sm leading-relaxed mb-6">{desc}</p>

        {/* Feature list */}
        <ul className="flex flex-col gap-2 mb-8 flex-grow">
          {features.map((f) => (
            <li key={f} className="flex items-start gap-2">
              <CheckCircle2 className={cn("h-4 w-4 mt-0.5 flex-shrink-0", accentText)} />
              <span className="text-sm text-gray-600">{f}</span>
            </li>
          ))}
        </ul>

        {/* CTA */}
        <div className={cn(
          "flex items-center justify-center gap-2 rounded-full px-6 py-3 text-white font-semibold text-sm transition-all shadow-md",
          btnClass
        )}>
          {cta}
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>

      {/* Subtle gradient border on hover */}
      <div
        className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
        style={{ boxShadow: `0 0 0 2px ${accent}40` }}
      />
    </button>
  );
}
