"use client";

import { MessageCircle, Clock, Check } from "lucide-react";
import { type CompanyStats } from "@/components/company";
import { Card, CardContent } from "@/components/ui/card";

export function MetricsBar({ stats }: { stats: CompanyStats }) {
  const metrics = [
    {
      label: "Tempo médio de resposta",
      value: stats.avgResponseHours != null ? `${stats.avgResponseHours}h` : "-",
      icon: <Clock className="w-4 h-4" />,
      color: "#1E88E5",
      bg: "#E3F2FD",
    },
    {
      label: "Taxa de resolução",
      value: `${stats.resolutionRate}%`,
      icon: <Check className="w-4 h-4" />,
      color: stats.resolutionRate >= 70 ? "#22C55E" : "#F97316",
      bg: stats.resolutionRate >= 70 ? "#F0FDF4" : "#FFF7ED",
    },
    {
      label: "Diálogos ativos",
      value: stats.activeDialogsCount,
      icon: <MessageCircle className="w-4 h-4" />,
      color: "#1E88E5",
      bg: "#E3F2FD",
    },
    {
      label: "Casos resolvidos",
      value: stats.resolvedCases,
      icon: <Check className="w-4 h-4" />,
      color: "#22C55E",
      bg: "#F0FDF4",
    },
  ];

  return (
    <div className="max-w-[960px] mx-auto px-6 mt-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {metrics.map((m, i) => (
          <Card key={i} className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: m.bg, color: m.color }}
                >
                  {m.icon}
                </div>
                <span className="text-2xl font-bold font-['Poppins']" style={{ color: m.color }}>
                  {m.value}
                </span>
              </div>
              <p className="text-xs text-gray-500 font-medium font-['Poppins']">{m.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
